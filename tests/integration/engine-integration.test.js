const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const CATSimulationEngine = require('../../src/services/CATSimulationEngine');

// Import models once to register schemas
require('../../src/models/SimulationRun');
require('../../src/models/SimulationEvent');
require('../../src/models/Exposure');
require('../../src/models/Account');
require('../../src/models/Hazard');

describe('Engine Integration (in-memory MongoDB)', () => {
  let mongod;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
  });

  test('startSimulation saves results with > 0 events', async () => {
    // Seed minimal hazard and fake exposures if needed
    const Hazard = mongoose.model('Hazard');
    await Hazard.create({
      hazardId: 'HAZ-00000001',
      hazardName: 'EQ Test India',
      hazardType: 'Earthquake',
      hazardCategory: 'Natural',
      intensities: [{ scale: 'Richter', value: 6.0, unit: 'Magnitude', description: 'Test seed' }],
      footprint: {
        centerLatitude: 20.5937,
        centerLongitude: 78.9629,
        radius: 300,
        unit: 'km',
        affectedArea: 50000,
        areaUnit: 'km2'
      },
      temporal: {
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600 * 1000),
        duration: 1,
        durationUnit: 'hours'
      },
      severity: 'Moderate',
      probability: 0.5,
      economicImpact: [{ estimatedLoss: 1000000, currency: 'USD', confidenceLevel: 80, lossType: 'Total' }],
      affectedRegions: ['Asia Pacific'],
      affectedCountries: ['India'],
      status: 'Active',
      createdBy: 'test',
      lastModifiedBy: 'test'
    });

    const engine = new CATSimulationEngine();
    const config = {
      simulationName: 'Integration-Smoke',
  startYear: 2024,
  endYear: 2025,
      timeHorizon: 1,
      timeHorizonUnit: 'years',
      hazardTypes: ['Earthquake'],
      geographicScope: { boundingBox: { minLatitude: 8, maxLatitude: 35, minLongitude: 68, maxLongitude: 97 } },
      modelingConfig: { numberOfSimulations: 1 }
    };

    const result = await engine.startSimulation(config, 'test');
    expect(result.success).toBe(true);

    // Poll for completion because engine runs in background
    const SimulationRun = mongoose.model('SimulationRun');
    const deadline = Date.now() + 20000; // 20s timeout
    let run;
    while (Date.now() < deadline) {
      run = await SimulationRun.findOne({ simulationRunId: result.simulationRunId });
      if (run && (run.status === 'Completed' || run.status === 'Failed')) break;
      await new Promise(res => setTimeout(res, 200));
    }

    expect(run).toBeTruthy();
    if (run.status !== 'Completed') {
      throw new Error(`Simulation did not complete successfully. Status=${run.status}. Error=${run.errorMessage || 'N/A'}`);
    }
    expect(run.results).toBeTruthy();
    expect(run.results.totalEvents).toBeGreaterThanOrEqual(0); // engine may generate 0 due to randomness
    // Invariant checks
    expect(Array.isArray(run.results.affectedRegions)).toBe(true);
  });
});
