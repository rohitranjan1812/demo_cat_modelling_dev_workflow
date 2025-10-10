const CATSimulationEngine = require('../../src/services/CATSimulationEngine');

describe('CATSimulationEngine invariants', () => {
  const engine = new CATSimulationEngine();

  test('getProbabilityDistribution returns valid enum', () => {
    expect(engine.getProbabilityDistribution('Earthquake')).toBe('Lognormal');
  });

  test('generateRandomLocation returns bounded, non-NaN coords', () => {
    const config = {
      geographicScope: {
        boundingBox: { minLatitude: 8, maxLatitude: 35, minLongitude: 68, maxLongitude: 97 }
      }
    };
    const loc = engine.generateRandomLocation(config);
    expect(Number.isFinite(loc.latitude)).toBe(true);
    expect(Number.isFinite(loc.longitude)).toBe(true);
    expect(loc.latitude).toBeGreaterThanOrEqual(8);
    expect(loc.latitude).toBeLessThanOrEqual(35);
    expect(loc.longitude).toBeGreaterThanOrEqual(68);
    expect(loc.longitude).toBeLessThanOrEqual(97);
  });

  test('generateGeographicImpact yields no NaN impact points', async () => {
    const intensity = { value: 5, scale: 'Richter' };
    const config = { geographicScope: { boundingBox: { minLatitude: 8, maxLatitude: 35, minLongitude: 68, maxLongitude: 97 } } };
    const impacts = await engine.generateGeographicImpact('Earthquake', intensity, config);
    expect(impacts.length).toBeGreaterThan(0);
    for (const gi of impacts) {
      expect(Number.isFinite(gi.affectedLatitude)).toBe(true);
      expect(Number.isFinite(gi.affectedLongitude)).toBe(true);
      expect(Number.isFinite(gi.intensityAtLocation)).toBe(true);
    }
  });

  test('calculateRiskMetrics: lossRatio is capped <= 1', () => {
    const financialImpact = { totalLoss: 10_000_000 };
    const exposureImpact = [
      { exposureAmount: 100_000 },
      { exposureAmount: 50_000 }
    ];
    const metrics = engine.calculateRiskMetrics(financialImpact, exposureImpact, []);
    expect(metrics.lossRatio).toBeLessThanOrEqual(1);
    expect(metrics.lossRatio).toBeGreaterThanOrEqual(0);
  });
});
