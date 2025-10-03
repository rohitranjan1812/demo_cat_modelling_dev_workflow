1  |/**
2  | * Comprehensive Data Generator Service for CAT Modeling Platform
3  | * Generates infinite realistic test data for Hazards, Vulnerabilities, Exposures, Accounts, Locations, Policies
4  | * 
5  | * Features:
6  | * - Infinite data generation with configurable parameters
7  | * - Geographic distribution control
8  | * - Realistic relationships between entities
9  | * - Peril-specific data generation
10  | * - Batch generation for performance
11  | * - Validation and consistency checks
12  | */
13  |
14  |const Hazard = require('../models/Hazard');
15  |const Vulnerability = require('../models/Vulnerability');
16  |const Account = require('../models/Account');
17  |const Location = require('../models/Location');
18  |const Policy = require('../models/Policy');
19  |const HazardZone = require('../models/HazardZone');
20  |const HazardScenario = require('../models/HazardScenario');
21  |
22  |class DataGeneratorService {
23  |  constructor() {
24  |    this.counters = {
25  |      hazard: 0,
26  |      vulnerability: 0,
27  |      account: 0,
28  |      location: 0,
29  |      policy: 0,
30  |      hazardZone: 0,
31  |      scenario: 0
32  |    };
33  |    
34  |    this.generationConfig = {
35  |      defaultCurrency: 'USD',
36  |      defaultCreator: 'DataGenerator',
37  |      defaultStatus: 'Active',
38  |      geographicBounds: {
39  |        minLat: -90,
40  |        maxLat: 90,
41  |        minLng: -180,
42  |        maxLng: 180
43  |      }
44  |    };
45  |    
46  |    this.perilConfigs = this.initializePerilConfigs();
47  |    this.regionConfigs = this.initializeRegionConfigs();
48  |  }
49  |
50  |  /**
51  |   * Initialize peril-specific configuration
52  |   * @returns {Object} Peril configurations
53  |   */
54  |  initializePerilConfigs() {
55  |    return {
56  |      'Earthquake': {
57  |        intensityRange: [3.0, 9.5],
58  |        intensityScale: 'Richter',
59  |        intensityUnit: 'Magnitude',
60  |        frequencyRange: [0.05, 0.5],
61  |        severityWeights: { Minor: 0.5, Moderate: 0.25, Major: 0.15, Severe: 0.07, Catastrophic: 0.02, Extreme: 0.01 },
62  |        returnPeriodRange: [10, 1000],
63  |        avgLossRange: [1000000, 500000000],
64  |        radiusRange: [10, 500],
65  |        durationRange: [5, 120],
66  |        durationUnit: 'seconds'
67  |      },
68  |      'Hurricane': {
69  |        intensityRange: [1, 5],
70  |        intensityScale: 'Saffir-Simpson',
71  |        intensityUnit: 'Category',
72  |        frequencyRange: [0.1, 1.0],
73  |        severityWeights: { Minor: 0.4, Moderate: 0.3, Major: 0.2, Severe: 0.07, Catastrophic: 0.02, Extreme: 0.01 },
74  |        returnPeriodRange: [5, 200],
75  |        avgLossRange: [5000000, 1000000000],
76  |        radiusRange: [50, 800],
77  |        durationRange: [12, 168],
78  |        durationUnit: 'hours'
79  |      },
80  |      'Flood': {
81  |        intensityRange: [1, 10],
82  |        intensityScale: 'Custom',
83  |        intensityUnit: 'Scale',
84  |        frequencyRange: [0.2, 2.0],
85  |        severityWeights: { Minor: 0.6, Moderate: 0.2, Major: 0.1, Severe: 0.06, Catastrophic: 0.03, Extreme: 0.01 },
86  |        returnPeriodRange: [2, 500],
87  |        avgLossRange: [500000, 200000000],
88  |        radiusRange: [5, 200],
89  |        durationRange: [24, 720],
90  |        durationUnit: 'hours'
91  |      },
92  |      'Wildfire': {
93  |        intensityRange: [1, 6],
94  |        intensityScale: 'Custom',
95  |        intensityUnit: 'Scale',
96  |        frequencyRange: [0.3, 1.5],
97  |        severityWeights: { Minor: 0.5, Moderate: 0.25, Major: 0.15, Severe: 0.06, Catastrophic: 0.03, Extreme: 0.01 },
98  |        returnPeriodRange: [5, 100],
99  |        avgLossRange: [2000000, 300000000],
100  |        radiusRange: [10, 300],
101  |        durationRange: [48, 2160],
102  |        durationUnit: 'hours'
103  |      },
104  |      'Tornado': {
105  |        intensityRange: [0, 5],
106  |        intensityScale: 'Enhanced Fujita',
107  |        intensityUnit: 'Category',
108  |        frequencyRange: [0.5, 3.0],
109  |        severityWeights: { Minor: 0.7, Moderate: 0.15, Major: 0.1, Severe: 0.03, Catastrophic: 0.015, Extreme: 0.005 },
110  |        returnPeriodRange: [2, 50],
111  |        avgLossRange: [100000, 50000000],
112  |        radiusRange: [1, 50],
113  |        durationRange: [5, 60],
114  |        durationUnit: 'minutes'
115  |      },
116  |      'Tsunami': {
117  |        intensityRange: [1, 10],
118  |        intensityScale: 'Custom',
119  |        intensityUnit: 'm',
120  |        frequencyRange: [0.01, 0.1],
121  |        severityWeights: { Minor: 0.3, Moderate: 0.3, Major: 0.2, Severe: 0.1, Catastrophic: 0.07, Extreme: 0.03 },
122  |        returnPeriodRange: [50, 1000],
123  |        avgLossRange: [10000000, 2000000000],
124  |        radiusRange: [100, 1000],
125  |        durationRange: [1, 24],
126  |        durationUnit: 'hours'
127  |      }
128  |    };
129  |  }
130  |
131  |  /**
132  |   * Initialize region-specific configuration
133  |   * @returns {Object} Region configurations
134  |   */
135  |  initializeRegionConfigs() {
136  |    return {
137  |      'North America': {
138  |        bounds: { minLat: 15, maxLat: 70, minLng: -170, maxLng: -50 },
139  |        countries: ['USA', 'Canada', 'Mexico'],
140  |        primaryPerils: ['Hurricane', 'Tornado', 'Earthquake', 'Wildfire', 'Flood'],
141  |        exposureDensity: 'High'
142  |      },
143  |      'Europe': {
144  |        bounds: { minLat: 35, maxLat: 70, minLng: -10, maxLng: 40 },
145  |        countries: ['UK', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Switzerland'],
146  |        primaryPerils: ['Flood', 'Wind', 'Hail', 'Earthquake'],
147  |        exposureDensity: 'High'
148  |      },
149  |      'Asia Pacific': {
150  |        bounds: { minLat: -50, maxLat: 50, minLng: 60, maxLng: 180 },
151  |        countries: ['Japan', 'China', 'Australia', 'India', 'Indonesia', 'Philippines', 'New Zealand'],
152  |        primaryPerils: ['Earthquake', 'Typhoon', 'Cyclone', 'Flood', 'Tsunami'],
153  |        exposureDensity: 'Very High'
154  |      },
155  |      'Latin America': {
156  |        bounds: { minLat: -60, maxLat: 15, minLng: -85, maxLng: -30 },
157  |        countries: ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru'],
158  |        primaryPerils: ['Earthquake', 'Flood', 'Landslide', 'Volcanic Eruption'],
159  |        exposureDensity: 'Medium'
160  |      },
161  |      'Middle East': {
162  |        bounds: { minLat: 10, maxLat: 45, minLng: 30, maxLng: 65 },
163  |        countries: ['UAE', 'Saudi Arabia', 'Israel', 'Turkey', 'Iran'],
164  |        primaryPerils: ['Earthquake', 'Sandstorm', 'Drought'],
165  |        exposureDensity: 'Medium'
166  |      },
167  |      'Africa': {
168  |        bounds: { minLat: -35, maxLat: 35, minLng: -20, maxLng: 55 },
169  |        countries: ['South Africa', 'Kenya', 'Nigeria', 'Egypt', 'Morocco'],
170  |        primaryPerils: ['Drought', 'Flood', 'Earthquake', 'Wildfire'],
171  |        exposureDensity: 'Low'
172  |      }
173  |    };
174  |  }
175  |
176  |  /**
177  |   * Generate comprehensive dataset with all entities
178  |   * @param {Object} config - Generation configuration
179  |   * @returns {Promise<Object>} Generated data summary
180  |   */
181  |  async generateComprehensiveDataset(config = {}) {
182  |    const {
183  |      numHazards = 100,
184  |      numVulnerabilities = 50,
185  |      numAccounts = 20,
186  |      numLocationsPerAccount = 10,
187  |      numPoliciesPerAccount = 5,
188  |      regions = Object.keys(this.regionConfigs),
189  |      perils = Object.keys(this.perilConfigs),
190  |      linkEntities = true,
191  |      saveToDatabase = true
192  |    } = config;
193  |
194  |    console.log('🚀 Starting comprehensive data generation...');
195  |    const startTime = Date.now();
196  |
197  |    const results = {
198  |      hazards: [],
199  |      vulnerabilities: [],
200  |      accounts: [],
201  |      locations: [],
202  |      policies: [],
203  |      hazardZones: [],
204  |      scenarios: []
205  |    };
206  |
207  |    try {
208  |      // Generate Accounts first (foundational)
209  |      console.log(`📊 Generating ${numAccounts} accounts...`);
210  |      results.accounts = await this.generateAccounts(numAccounts, { regions });
211  |
212  |      // Generate Locations for each account
213  |      console.log(`📍 Generating ${numAccounts * numLocationsPerAccount} locations...`);
214  |      for (const account of results.accounts) {
215  |        const locations = await this.generateLocationsForAccount(
216  |          account,
217  |          numLocationsPerAccount,
218  |          { regions }
219  |        );
220  |        results.locations.push(...locations);
221  |      }
222  |
223  |      // Generate Policies for each account
224  |      console.log(`📋 Generating ${numAccounts * numPoliciesPerAccount} policies...`);
225  |      for (const account of results.accounts) {
226  |        const accountLocations = results.locations.filter(loc => 
227  |          loc.metadata && loc.metadata.accountId === account.accountId
228  |        );
229  |        const policies = await this.generatePoliciesForAccount(
230  |          account,
231  |          accountLocations,
232  |          numPoliciesPerAccount,
233  |          { perils }
234  |        );
235  |        results.policies.push(...policies);
236  |      }
237  |
238  |      // Generate Hazards
239  |      console.log(`⚠️  Generating ${numHazards} hazards...`);
240  |      results.hazards = await this.generateHazards(numHazards, { regions, perils });
241  |
242  |      // Generate Vulnerabilities
243  |      console.log(`🛡️  Generating ${numVulnerabilities} vulnerabilities...`);
244  |      results.vulnerabilities = await this.generateVulnerabilities(numVulnerabilities, { regions, perils });
245  |
246  |      // Generate Hazard Zones
247  |      console.log(`🗺️  Generating hazard zones...`);
248  |      results.hazardZones = await this.generateHazardZones(regions, perils);
249  |
250  |      // Link entities if requested
251  |      if (linkEntities) {
252  |        console.log(`🔗 Linking entities...`);
253  |        await this.linkEntities(results);
254  |      }
255  |
256  |      // Save to database if requested
257  |      if (saveToDatabase) {
258  |        console.log(`💾 Saving to database...`);
259  |        await this.saveToDatabase(results);
260  |      }
261  |
262  |      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
263  |      console.log(`✅ Data generation completed in ${duration}s`);
264  |
265  |      return {
266  |        success: true,
267  |        duration: `${duration}s`,
268  |        summary: {
269  |          hazards: results.hazards.length,
270  |          vulnerabilities: results.vulnerabilities.length,
271  |          accounts: results.accounts.length,
272  |          locations: results.locations.length,
273  |          policies: results.policies.length,
274  |          hazardZones: results.hazardZones.length
275  |        },
276  |        data: results
277  |      };
278  |    } catch (error) {
279  |      console.error('❌ Error in data generation:', error);
280  |      throw error;
281  |    }
282  |  }
283  |
284  |  /**
285  |   * Generate hazards with realistic characteristics
286  |   * @param {number} count - Number of hazards to generate
287  |   * @param {Object} options - Generation options
288  |   * @returns {Promise<Array>} Generated hazards
289  |   */
290  |  async generateHazards(count, options = {}) {
291  |    const {
292  |      regions = Object.keys(this.regionConfigs),
293  |      perils = Object.keys(this.perilConfigs),
294  |      startYear = 2020,
295  |      endYear = 2024
296  |    } = options;
297  |
298  |    const hazards = [];
299  |
300  |    for (let i = 0; i < count; i++) {
301  |      const region = this.randomChoice(regions);
302  |      const regionConfig = this.regionConfigs[region];
303  |      const peril = this.randomChoice(regionConfig.primaryPerils.filter(p => perils.includes(p)));
304  |      const perilConfig = this.perilConfigs[peril];
305  |
306  |      const hazard = await this.generateSingleHazard(peril, region, perilConfig, regionConfig, startYear, endYear);
307  |      hazards.push(hazard);
308  |    }
309  |
310  |    return hazards;
311  |  }
312  |
313  |  /**
314  |   * Generate a single hazard
315  |   * @param {string} peril - Hazard type/peril
316  |   * @param {string} region - Geographic region
317  |   * @param {Object} perilConfig - Peril configuration
318  |   * @param {Object} regionConfig - Region configuration
319  |   * @param {number} startYear - Start year range
320  |   * @param {number} endYear - End year range
321  |   * @returns {Promise<Object>} Generated hazard
322  |   */
323  |  async generateSingleHazard(peril, region, perilConfig, regionConfig, startYear, endYear) {
324  |    this.counters.hazard++;
325  |    const hazardId = `HAZ-${String(this.counters.hazard).padStart(8, '0')}`;
326  |
327  |    const intensity = this.randomInRange(perilConfig.intensityRange[0], perilConfig.intensityRange[1]);
328  |    const severity = this.selectSeverityByWeights(perilConfig.severityWeights);
329  |    const probability = this.randomInRange(perilConfig.frequencyRange[0], perilConfig.frequencyRange[1]);
330  |    const returnPeriod = this.calculateReturnPeriod(probability);
331  |
332  |    const centerPoint = this.randomPointInRegion(regionConfig.bounds);
333  |    const radius = this.randomInRange(perilConfig.radiusRange[0], perilConfig.radiusRange[1]);
334  |
335  |    const eventYear = this.randomIntInRange(startYear, endYear);
336  |    const eventMonth = this.randomIntInRange(1, 12);
337  |    const eventDay = this.randomIntInRange(1, 28);
338  |    const startTime = new Date(eventYear, eventMonth - 1, eventDay);
339  |    const duration = this.randomInRange(perilConfig.durationRange[0], perilConfig.durationRange[1]);
340  |
341  |    const baseLoss = this.randomInRange(perilConfig.avgLossRange[0], perilConfig.avgLossRange[1]);
342  |    const economicLoss = baseLoss * this.severityMultiplier(severity);
343  |
344  |    return {
345  |      hazardId,
346  |      hazardName: `${peril} Event ${hazardId}`,
347  |      hazardType: peril,
348  |      hazardCategory: 'Natural',
349  |      intensities: [{
350  |        scale: perilConfig.intensityScale,
351  |        value: parseFloat(intensity.toFixed(2)),
352  |        unit: perilConfig.intensityUnit,
353  |        description: `${peril} intensity measurement`
354  |      }],
355  |      footprint: {
356  |        centerLatitude: centerPoint.latitude,
357  |        centerLongitude: centerPoint.longitude,
358  |        radius: parseFloat(radius.toFixed(2)),
359  |        unit: 'km',
360  |        affectedArea: parseFloat((Math.PI * radius * radius).toFixed(2)),
361  |        areaUnit: 'km2'
362  |      },
363  |      temporal: {
364  |        startTime: startTime,
365  |        endTime: this.addDuration(startTime, duration, perilConfig.durationUnit),
366  |        duration: parseFloat(duration.toFixed(2)),
367  |        durationUnit: perilConfig.durationUnit,
368  |        peakIntensityTime: this.addDuration(startTime, duration / 2, perilConfig.durationUnit)
369  |      },
370  |      severity,
371  |      probability: parseFloat(probability.toFixed(4)),
372  |      returnPeriod: parseFloat(returnPeriod.toFixed(2)),
373  |      returnPeriodUnit: 'years',
374  |      economicImpact: [{
375  |        estimatedLoss: parseFloat(economicLoss.toFixed(2)),
376  |        currency: 'USD',
377  |        confidenceLevel: this.randomInRange(70, 95),
378  |        lossType: 'Total',
379  |        methodology: `${peril} loss estimation model`
380  |      }],
381  |      affectedRegions: [region],
382  |      affectedCountries: [this.randomChoice(regionConfig.countries)],
383  |      vulnerabilityFactors: {
384  |        populationDensity: this.randomChoice(['Low', 'Medium', 'High', 'Very High']),
385  |        infrastructureQuality: this.randomChoice(['Poor', 'Fair', 'Good', 'Excellent']),
386  |        emergencyResponse: this.randomChoice(['Limited', 'Adequate', 'Good', 'Excellent']),
387  |        buildingCodes: this.randomChoice(['None', 'Basic', 'Moderate', 'Strict', 'Advanced']),
388  |        warningSystems: this.randomChoice(['None', 'Basic', 'Moderate', 'Advanced', 'State-of-the-art'])
389  |      },
390  |      linkedVulnerabilities: [],
391  |      climateChangeImpact: {
392  |        isClimateRelated: ['Hurricane', 'Flood', 'Wildfire', 'Drought', 'Heat Wave'].includes(peril),
393  |        climateScenario: this.randomChoice(['RCP2.6', 'RCP4.5', 'RCP6.0', 'RCP8.5']),
394  |        temperatureIncrease: this.randomInRange(0, 4),
395  |        seaLevelRise: this.randomInRange(0, 2)
396  |      },
397  |      modelData: {
398  |        modelProvider: this.randomChoice(['RMS', 'AIR', 'CoreLogic', 'Karen Clark', 'JBA']),
399  |        modelVersion: `v${this.randomIntInRange(1, 5)}.${this.randomIntInRange(0, 9)}`,
400  |        modelType: 'Probabilistic',
401  |        resolution: this.randomChoice(['High', 'Medium', 'Low']),
402  |        lastModelUpdate: new Date(),
403  |        modelResults: new Map()
404  |      },
405  |      dataSources: [{
406  |        sourceType: 'Satellite',
407  |        sourceName: `${peril} Monitoring System`,
408  |        reliability: this.randomChoice(['Medium', 'High', 'Very High']),
409  |        lastUpdated: new Date()
410  |      }],
411  |      status: 'Active',
412  |      isHistorical: true,
413  |      isSimulated: false,
414  |      createdBy: this.generationConfig.defaultCreator,
415  |      lastModifiedBy: this.generationConfig.defaultCreator,
416  |      metadata: new Map([['generated', true], ['peril', peril], ['region', region]])
417  |    };
418  |  }
419  |
420  |  /**
421  |   * Generate vulnerabilities
422  |   * @param {number} count - Number of vulnerabilities to generate
423  |   * @param {Object} options - Generation options
424  |   * @returns {Promise<Array>} Generated vulnerabilities
425  |   */
426  |  async generateVulnerabilities(count, options = {}) {
427  |    const {
428  |      regions = Object.keys(this.regionConfigs),
429  |      perils = Object.keys(this.perilConfigs)
430  |    } = options;
431  |
432  |    const vulnerabilities = [];
433  |
434  |    for (let i = 0; i < count; i++) {
435  |      const region = this.randomChoice(regions);
436  |      const regionConfig = this.regionConfigs[region];
437  |      const vulnerability = await this.generateSingleVulnerability(region, regionConfig, perils);
438  |      vulnerabilities.push(vulnerability);
439  |    }
440  |
441  |    return vulnerabilities;
442  |  }
443  |
444  |  /**
445  |   * Generate a single vulnerability
446  |   * @param {string} region - Geographic region
447  |   * @param {Object} regionConfig - Region configuration
448  |   * @param {Array} perils - Available perils
449  |   * @returns {Promise<Object>} Generated vulnerability
450  |   */
451  |  async generateSingleVulnerability(region, regionConfig, perils) {
452  |    this.counters.vulnerability++;
453  |    const vulnerabilityId = `VUL-${String(this.counters.vulnerability).padStart(8, '0')}`;
454  |
455  |    const vulnerabilityType = this.randomChoice(['Physical', 'Social', 'Economic', 'Environmental', 'Infrastructure', 'Multi-dimensional']);
456  |    const vulnerabilityCategory = this.randomChoice(['Community', 'Regional', 'National']);
457  |    const overallScore = this.randomInRange(0, 10);
458  |    const riskLevel = this.scoreToRiskLevel(overallScore);
459  |
460  |    const centerPoint = this.randomPointInRegion(regionConfig.bounds);
461  |    const radius = this.randomInRange(10, 200);
462  |
463  |    // Generate vulnerability factors (must sum to 1)
464  |    const numFactors = this.randomIntInRange(3, 8);
465  |    const factors = this.generateWeightedFactors(numFactors, vulnerabilityType);
466  |
467  |    // Generate hazard-specific vulnerabilities
468  |    const hazardVulnerabilities = regionConfig.primaryPerils
469  |      .filter(p => perils.includes(p))
470  |      .map(hazardType => ({
471  |        hazardType,
472  |        vulnerabilityScore: this.randomInRange(0, 10),
473  |        confidenceLevel: this.randomChoice(['Low', 'Medium', 'High', 'Very High']),
474  |        methodology: `${hazardType} vulnerability assessment`,
475  |        lastUpdated: new Date(),
476  |        specificFactors: []
477  |      }));
478  |
479  |    // Generate exposure vulnerabilities
480  |    const exposureVulnerabilities = ['Property', 'Infrastructure', 'Population'].map(exposureType => ({
481  |      exposureType,
482  |      exposureValue: this.randomInRange(1000000, 100000000),
483  |      currency: 'USD',
484  |      exposureUnit: exposureType === 'Population' ? 'people' : 'USD',
485  |      vulnerabilityScore: this.randomInRange(0, 10),
486  |      riskLevel: this.scoreToRiskLevel(this.randomInRange(0, 10)),
487  |      expectedLoss: this.randomInRange(100000, 10000000),
488  |      expectedLossCurrency: 'USD'
489  |    }));
490  |
491  |    // Generate mitigation measures
492  |    const mitigationMeasures = this.generateMitigationMeasures();
493  |
494  |    return {
495  |      vulnerabilityId,
496  |      vulnerabilityName: `${vulnerabilityType} Vulnerability ${vulnerabilityId}`,
497  |      vulnerabilityDescription: `Comprehensive ${vulnerabilityType.toLowerCase()} vulnerability assessment for ${region}`,
498  |      vulnerabilityType,
499  |      vulnerabilityCategory,
500  |      geographicScope: {
501  |        centerLatitude: centerPoint.latitude,
502  |        centerLongitude: centerPoint.longitude,
503  |        radius: parseFloat(radius.toFixed(2)),
504  |        radiusUnit: 'km',
505  |        area: parseFloat((Math.PI * radius * radius).toFixed(2)),
506  |        areaUnit: 'km2',
507  |        administrativeLevel: this.randomChoice(['State/Province', 'County/District', 'Municipal']),
508  |        country: this.randomChoice(regionConfig.countries),
509  |        state: `State-${this.randomIntInRange(1, 50)}`,
510  |        region
511  |      },
512  |      overallVulnerabilityScore: parseFloat(overallScore.toFixed(2)),
513  |      overallRiskLevel: riskLevel,
514  |      confidenceLevel: this.randomChoice(['Medium', 'High', 'Very High']),
515  |      vulnerabilityFactors: factors,
516  |      hazardVulnerabilities,
517  |      exposureVulnerabilities,
518  |      mitigationMeasures,
519  |      linkedHazards: [],
520  |      linkedLocations: [],
521  |      linkedAccounts: [],
522  |      assessmentDate: new Date(),
523  |      validFrom: new Date(),
524  |      validTo: this.addYears(new Date(), 5),
525  |      methodology: {
526  |        assessmentMethod: 'Multi-factor vulnerability analysis',
527  |        modelProvider: this.randomChoice(['RMS', 'AIR', 'Custom']),
528  |        modelVersion: `v${this.randomIntInRange(1, 3)}.0`,
529  |        resolution: this.randomChoice(['High', 'Medium']),
530  |        lastModelUpdate: new Date()
531  |      },
532  |      status: 'Active',
533  |      isPublic: false,
534  |      isTemplate: false,
535  |      createdBy: this.generationConfig.defaultCreator,
536  |      lastModifiedBy: this.generationConfig.defaultCreator,
537  |      metadata: new Map([['generated', true], ['region', region]])
538  |    };
539  |  }
540  |
541  |  /**
542  |   * Generate accounts
543  |   * @param {number} count - Number of accounts to generate
544  |   * @param {Object} options - Generation options
545  |   * @returns {Promise<Array>} Generated accounts
546  |   */
547  |  async generateAccounts(count, options = {}) {
548  |    const { regions = Object.keys(this.regionConfigs) } = options;
549  |    const accounts = [];
550  |
551  |    for (let i = 0; i < count; i++) {
552  |      this.counters.account++;
553  |      const accountId = `ACC-${String(this.counters.account).padStart(6, '0')}`;
554  |      
555  |      const accountRegions = this.randomSubset(regions, this.randomIntInRange(1, 3));
556  |      const accountType = this.randomChoice(['Primary', 'Reinsurance', 'Retrocession', 'Facultative', 'Treaty']);
557  |      const totalExposure = this.randomInRange(10000000, 5000000000);
558  |
559  |      const account = {
560  |        accountId,
561  |        accountName: `Account ${accountId} - ${accountType}`,
562  |        accountType,
563  |        parentAccountId: null,
564  |        accountLevel: 1,
565  |        totalExposure: parseFloat(totalExposure.toFixed(2)),
566  |        currency: 'USD',
567  |        regions: accountRegions,
568  |        riskProfile: this.randomChoice(['Low', 'Medium', 'High', 'Very High']),
569  |        hazardRiskProfile: {
570  |          overallRiskLevel: this.randomChoice(['Low', 'Medium', 'High', 'Very High', 'Extreme']),
571  |          primaryHazards: this.generateAccountHazards(accountRegions),
572  |          lastRiskAssessment: new Date(),
573  |          riskAssessmentMethod: 'Model'
574  |        },
575  |        maxExposurePerLocation: parseFloat((totalExposure * 0.1).toFixed(2)),
576  |        maxExposurePerPeril: parseFloat((totalExposure * 0.3).toFixed(2)),
577  |        status: 'Active',
578  |        effectiveDate: new Date(),
579  |        expiryDate: this.addYears(new Date(), 1),
580  |        createdBy: this.generationConfig.defaultCreator,
581  |        lastModifiedBy: this.generationConfig.defaultCreator,
582  |        metadata: new Map([['generated', true], ['regions', accountRegions.join(',')]])
583  |      };
584  |
585  |      accounts.push(account);
586  |    }
587  |
588  |    return accounts;
589  |  }
590  |
591  |  /**
592  |   * Generate locations for an account
593  |   * @param {Object} account - Account object
594  |   * @param {number} count - Number of locations to generate
595  |   * @param {Object} options - Generation options
596  |   * @returns {Promise<Array>} Generated locations
597  |   */
598  |  async generateLocationsForAccount(account, count, options = {}) {
599  |    const { regions = account.regions } = options;
600  |    const locations = [];
601  |
602  |    for (let i = 0; i < count; i++) {
603  |      this.counters.location++;
604  |      const locationId = `LOC-${String(this.counters.location).padStart(8, '0')}`;
605  |      
606  |      const region = this.randomChoice(regions);
607  |      const regionConfig = this.regionConfigs[region];
608  |      const point = this.randomPointInRegion(regionConfig.bounds);
609  |      const country = this.randomChoice(regionConfig.countries);
610  |
611  |      const occupancyType = this.randomChoice(['Residential', 'Commercial', 'Industrial', 'Agricultural', 'Mixed']);
612  |      const constructionType = this.randomChoice(['Frame', 'Masonry', 'Concrete', 'Steel', 'Mixed']);
613  |      const yearBuilt = this.randomIntInRange(1950, 2024);
614  |      const numberOfStories = this.randomIntInRange(1, occupancyType === 'Commercial' ? 50 : 5);
615  |      const squareFootage = this.randomInRange(1000, occupancyType === 'Commercial' ? 500000 : 10000);
616  |      const replacementCost = squareFootage * this.randomInRange(100, 500);
617  |      const marketValue = replacementCost * this.randomInRange(0.8, 1.5);
618  |
619  |      const location = {
620  |        locationId,
621  |        locationName: `${occupancyType} Property ${locationId}`,
622  |        coordinates: {
623  |          latitude: point.latitude,
624  |          longitude: point.longitude,
625  |          elevation: this.randomInRange(0, 3000)
626  |        },
627  |        address: {
628  |          street: `${this.randomIntInRange(1, 9999)} Main Street`,
629  |          city: `City-${this.randomIntInRange(1, 1000)}`,
630  |          state: `State-${this.randomIntInRange(1, 50)}`,
631  |          postalCode: `${this.randomIntInRange(10000, 99999)}`,
632  |          country,
633  |          region
634  |        },
635  |        riskZones: this.generateRiskZones(regionConfig.primaryPerils),
636  |        riskFactors: this.generateLocationRiskFactors(regionConfig.primaryPerils),
637  |        hazardExposure: [],
638  |        hazardZones: [],
639  |        propertyCharacteristics: {
640  |          occupancyType,
641  |          constructionType,
642  |          yearBuilt,
643  |          numberOfStories,
644  |          squareFootage: parseFloat(squareFootage.toFixed(2)),
645  |          replacementCost: parseFloat(replacementCost.toFixed(2)),
646  |          marketValue: parseFloat(marketValue.toFixed(2))
647  |        },
648  |        totalExposure: parseFloat(replacementCost.toFixed(2)),
649  |        currency: 'USD',
650  |        associatedPolicies: [],
651  |        catModelData: {
652  |          modelProvider: this.randomChoice(['RMS', 'AIR', 'CoreLogic']),
653  |          modelVersion: `v${this.randomIntInRange(1, 5)}.0`,
654  |          lastModelUpdate: new Date(),
655  |          modelResults: new Map()
656  |        },
657  |        status: 'Active',
658  |        createdBy: this.generationConfig.defaultCreator,
659  |        lastModifiedBy: this.generationConfig.defaultCreator,
660  |        metadata: new Map([['generated', true], ['accountId', account.accountId], ['region', region]])
661  |      };
662  |
663  |      locations.push(location);
664  |    }
665  |
666  |    return locations;
667  |  }
668  |
669  |  /**
670  |   * Generate policies for an account
671  |   * @param {Object} account - Account object
672  |   * @param {Array} locations - Account locations
673  |   * @param {number} count - Number of policies to generate
674  |   * @param {Object} options - Generation options
675  |   * @returns {Promise<Array>} Generated policies
676  |   */
677  |  async generatePoliciesForAccount(account, locations, count, options = {}) {
678  |    const { perils = Object.keys(this.perilConfigs) } = options;
679  |    const policies = [];
680  |
681  |    for (let i = 0; i < count; i++) {
682  |      this.counters.policy++;
683  |      const policyId = `POL-${String(this.counters.policy).padStart(8, '0')}`;
684  |      const policyNumber = `PN-${Date.now()}-${this.counters.policy}`;
685  |
686  |      const policyType = this.randomChoice(['Direct', 'Reinsurance', 'Facultative', 'Treaty']);
687  |      const coverageTypes = this.randomSubset(['Property', 'Liability', 'Business Interruption', 'Cyber'], this.randomIntInRange(1, 3));
688  |      
689  |      const totalLimit = this.randomInRange(1000000, 100000000);
690  |      const totalDeductible = totalLimit * this.randomInRange(0.01, 0.1);
691  |      const premium = totalLimit * this.randomInRange(0.01, 0.05);
692  |
693  |      const coverages = coverageTypes.map(coverageType => ({
694  |        coverageType,
695  |        coverageLimit: totalLimit / coverageTypes.length,
696  |        deductible: totalDeductible / coverageTypes.length,
697  |        coveragePercentage: 100
698  |      }));
699  |
700  |      const coveredPerils = this.randomSubset(perils, this.randomIntInRange(3, perils.length));
701  |      const coveredRegions = account.regions;
702  |
703  |      const policy = {
704  |        policyId,
705  |        policyNumber,
706  |        accountId: account.accountId,
707  |        policyName: `Policy ${policyNumber}`,
708  |        policyType,
709  |        coverages,
710  |        totalLimit: parseFloat(totalLimit.toFixed(2)),
711  |        totalDeductible: parseFloat(totalDeductible.toFixed(2)),
712  |        premium: parseFloat(premium.toFixed(2)),
713  |        currency: 'USD',
714  |        effectiveDate: new Date(),
715  |        expiryDate: this.addYears(new Date(), 1),
716  |        coveredRegions,
717  |        coveredPerils,
718  |        hazardCoverage: [],
719  |        riskCharacteristics: locations.length > 0 ? {
720  |          occupancyType: locations[0].propertyCharacteristics.occupancyType,
721  |          constructionType: locations[0].propertyCharacteristics.constructionType,
722  |          yearBuilt: locations[0].propertyCharacteristics.yearBuilt,
723  |          numberOfStories: locations[0].propertyCharacteristics.numberOfStories,
724  |          squareFootage: locations[0].propertyCharacteristics.squareFootage
725  |        } : {},
726  |        sublimits: this.generateSublimits(coveredPerils, totalLimit),
727  |        specialConditions: [],
728  |        status: 'Active',
729  |        createdBy: this.generationConfig.defaultCreator,
730  |        lastModifiedBy: this.generationConfig.defaultCreator,
731  |        metadata: new Map([['generated', true], ['accountId', account.accountId]])
732  |      };
733  |
734  |      policies.push(policy);
735  |    }
736  |
737  |    return policies;
738  |  }
739  |
740  |  /**
741  |   * Generate hazard zones
742  |   * @param {Array} regions - Regions to cover
743  |   * @param {Array} perils - Perils to include
744  |   * @returns {Promise<Array>} Generated hazard zones
745  |   */
746  |  async generateHazardZones(regions, perils) {
747  |    const zones = [];
748  |
749  |    for (const region of regions) {
750  |      const regionConfig = this.regionConfigs[region];
751  |      const regionalPerils = regionConfig.primaryPerils.filter(p => perils.includes(p));
752  |
753  |      for (const peril of regionalPerils) {
754  |        const numZones = this.randomIntInRange(2, 5);
755  |
756  |        for (let i = 0; i < numZones; i++) {
757  |          this.counters.hazardZone++;
758  |          const zoneId = `ZONE-${String(this.counters.hazardZone).padStart(8, '0')}`;
759  |
760  |          const centerPoint = this.randomPointInRegion(regionConfig.bounds);
761  |          const radius = this.randomInRange(50, 500);
762  |
763  |          const zone = {
764  |            zoneId,
765  |            zoneName: `${peril} Zone ${zoneId}`,
766  |            zoneType: peril,
767  |            zoneCategory: 'Risk Zone',
768  |            geographicBoundary: {
769  |              centerLatitude: centerPoint.latitude,
770  |              centerLongitude: centerPoint.longitude,
771  |              radius: parseFloat(radius.toFixed(2)),
772  |              radiusUnit: 'km',
773  |              boundingBox: this.calculateBoundingBox(centerPoint, radius)
774  |            },
775  |            riskLevel: this.randomChoice(['Low', 'Medium', 'High', 'Very High', 'Extreme']),
776  |            hazardFrequency: this.randomInRange(0.1, 2.0),
777  |            avgReturnPeriod: this.randomInRange(10, 500),
778  |            historicalEvents: [],
779  |            affectedCountries: [this.randomChoice(regionConfig.countries)],
780  |            affectedRegions: [region],
781  |            status: 'Active',
782  |            createdBy: this.generationConfig.defaultCreator,
783  |            lastModifiedBy: this.generationConfig.defaultCreator
784  |          };
785  |
786  |          zones.push(zone);
787  |        }
788  |      }
789  |    }
790  |
791  |    return zones;
792  |  }
793  |
794  |  /**
795  |   * Link entities together (hazards to vulnerabilities, locations to policies, etc.)
796  |   * @param {Object} results - Generated data results
797  |   * @returns {Promise<void>}
798  |   */
799  |  async linkEntities(results) {
800  |    // Link hazards to vulnerabilities based on geographic proximity
801  |    for (const hazard of results.hazards) {
802  |      const nearbyVulnerabilities = this.findNearbyVulnerabilities(hazard, results.vulnerabilities, 100);
803  |      hazard.linkedVulnerabilities = nearbyVulnerabilities.map(vuln => ({
804  |        vulnerabilityId: vuln.vulnerabilityId,
805  |        relationshipType: this.randomChoice(['Primary', 'Secondary', 'Related']),
806  |        vulnerabilityScore: vuln.overallVulnerabilityScore,
807  |        linkedAt: new Date()
808  |      }));
809  |    }
810  |
811  |    // Link vulnerabilities to hazards (bidirectional)
812  |    for (const vulnerability of results.vulnerabilities) {
813  |      const nearbyHazards = this.findNearbyHazards(vulnerability, results.hazards, 100);
814  |      vulnerability.linkedHazards = nearbyHazards.map(hazard => ({
815  |        hazardId: hazard.hazardId,
816  |        relationshipType: this.randomChoice(['Primary', 'Secondary', 'Related']),
817  |        vulnerabilityScore: this.randomInRange(0, 10)
818  |      }));
819  |    }
820  |
821  |    // Link locations to accounts
822  |    for (const location of results.locations) {
823  |      const accountId = location.metadata.get('accountId');
824  |      const accountPolicies = results.policies.filter(p => p.accountId === accountId);
825  |      
826  |      location.associatedPolicies = accountPolicies.slice(0, this.randomIntInRange(1, 3)).map(policy => ({
827  |        policyId: policy.policyId,
828  |        exposureAmount: location.totalExposure,
829  |        effectiveDate: policy.effectiveDate,
830  |        expiryDate: policy.expiryDate
831  |      }));
832  |    }
833  |
834  |    console.log('  ✓ Linked hazards to vulnerabilities');
835  |    console.log('  ✓ Linked vulnerabilities to hazards');
836  |    console.log('  ✓ Linked locations to policies');
837  |  }
838  |
839  |  /**
840  |   * Save generated data to database
841  |   * @param {Object} results - Generated data results
842  |   * @returns {Promise<void>}
843  |   */
844  |  async saveToDatabase(results) {
845  |    try {
846  |      if (results.accounts.length > 0) {
847  |        await Account.insertMany(results.accounts);
848  |        console.log(`  ✓ Saved ${results.accounts.length} accounts`);
849  |      }
850  |
851  |      if (results.locations.length > 0) {
852  |        await Location.insertMany(results.locations);
853  |        console.log(`  ✓ Saved ${results.locations.length} locations`);
854  |      }
855  |
856  |      if (results.policies.length > 0) {
857  |        await Policy.insertMany(results.policies);
858  |        console.log(`  ✓ Saved ${results.policies.length} policies`);
859  |      }
860  |
861  |      if (results.hazards.length > 0) {
862  |        await Hazard.insertMany(results.hazards);
863  |        console.log(`  ✓ Saved ${results.hazards.length} hazards`);
864  |      }
865  |
866  |      if (results.vulnerabilities.length > 0) {
867  |        await Vulnerability.insertMany(results.vulnerabilities);
868  |        console.log(`  ✓ Saved ${results.vulnerabilities.length} vulnerabilities`);
869  |      }
870  |
871  |      if (results.hazardZones.length > 0) {
872  |        await HazardZone.insertMany(results.hazardZones);
873  |        console.log(`  ✓ Saved ${results.hazardZones.length} hazard zones`);
874  |      }
875  |    } catch (error) {
876  |      console.error('Error saving to database:', error);
877  |      throw error;
878  |    }
879  |  }
880  |
881  |  // ===== UTILITY METHODS =====
882  |
883  |  /**
884  |   * Generate random value in range
885  |   */
886  |  randomInRange(min, max) {
887  |    return min + Math.random() * (max - min);
888  |  }
889  |
890  |  /**
891  |   * Generate random integer in range
892  |   */
893  |  randomIntInRange(min, max) {
894  |    return Math.floor(this.randomInRange(min, max + 1));
895  |  }
896  |
897  |  /**
898  |   * Random choice from array
899  |   */
900  |  randomChoice(array) {
901  |    return array[Math.floor(Math.random() * array.length)];
902  |  }
903  |
904  |  /**
905  |   * Random subset from array
906  |   */
907  |  randomSubset(array, count) {
908  |    const shuffled = [...array].sort(() => 0.5 - Math.random());
909  |    return shuffled.slice(0, Math.min(count, array.length));
910  |  }
911  |
912  |  /**
913  |   * Generate random point in region
914  |   */
915  |  randomPointInRegion(bounds) {
916  |    return {
917  |      latitude: parseFloat(this.randomInRange(bounds.minLat, bounds.maxLat).toFixed(6)),
918  |      longitude: parseFloat(this.randomInRange(bounds.minLng, bounds.maxLng).toFixed(6))
919  |    };
920  |  }
921  |
922  |  /**
923  |   * Calculate return period from probability
924  |   */
925  |  calculateReturnPeriod(probability) {
926  |    return probability > 0 ? 1 / probability : 1000;
927  |  }
928  |
929  |  /**
930  |   * Select severity by weighted probabilities
931  |   */
932  |  selectSeverityByWeights(weights) {
933  |    const rand = Math.random();
934  |    let cumulative = 0;
935  |    
936  |    for (const [severity, weight] of Object.entries(weights)) {
937  |      cumulative += weight;
938  |      if (rand <= cumulative) {
939  |        return severity;
940  |      }
941  |    }
942  |    
943  |    return 'Moderate';
944  |  }
945  |
946  |  /**
947  |   * Get severity multiplier for loss calculation
948  |   */
949  |  severityMultiplier(severity) {
950  |    const multipliers = {
951  |      'Minor': 0.3,
952  |      'Moderate': 0.6,
953  |      'Major': 1.0,
954  |      'Severe': 1.5,
955  |      'Catastrophic': 2.5,
956  |      'Extreme': 4.0
957  |    };
958  |    return multipliers[severity] || 1.0;
959  |  }
960  |
961  |  /**
962  |   * Convert score to risk level
963  |   */
964  |  scoreToRiskLevel(score) {
965  |    if (score < 2) return 'Very Low';
966  |    if (score < 4) return 'Low';
967  |    if (score < 6) return 'Medium';
968  |    if (score < 8) return 'High';
969  |    if (score < 9) return 'Very High';
970  |    return 'Extreme';
971  |  }
972  |
973  |  /**
974  |   * Add duration to date
975  |   */
976  |  addDuration(date, duration, unit) {
977  |    const result = new Date(date);
978  |    switch (unit) {
979  |      case 'seconds':
980  |        result.setSeconds(result.getSeconds() + duration);
981  |        break;
982  |      case 'minutes':
983  |        result.setMinutes(result.getMinutes() + duration);
984  |        break;
985  |      case 'hours':
986  |        result.setHours(result.getHours() + duration);
987  |        break;
988  |      case 'days':
989  |        result.setDate(result.getDate() + duration);
990  |        break;
991  |      case 'weeks':
992  |        result.setDate(result.getDate() + duration * 7);
993  |        break;
994  |      case 'months':
995  |        result.setMonth(result.getMonth() + duration);
996  |        break;
997  |    }
998  |    return result;
999  |  }
1000  |
1001  |  /**
1002  |   * Add years to date
1003  |   */
1004  |  addYears(date, years) {
1005  |    const result = new Date(date);
1006  |    result.setFullYear(result.getFullYear() + years);
1007  |    return result;
1008  |  }
1009  |
1010  |  /**
1011  |   * Generate weighted factors that sum to 1
1012  |   */
1013  |  generateWeightedFactors(count, type) {
1014  |    const factorTypes = {
1015  |      'Physical': ['Structural Integrity', 'Material Quality', 'Foundation Stability', 'Roof Condition', 'Wall Strength'],
1016  |      'Social': ['Population Density', 'Social Cohesion', 'Community Resources', 'Cultural Resilience', 'Education Level'],
1017  |      'Economic': ['Income Level', 'Insurance Coverage', 'Asset Distribution', 'Economic Diversity', 'Financial Reserves'],
1018  |      'Environmental': ['Land Use', 'Vegetation Cover', 'Water Resources', 'Soil Quality', 'Air Quality'],
1019  |      'Infrastructure': ['Transportation', 'Utilities', 'Communication', 'Healthcare', 'Emergency Services'],
1020  |      'Multi-dimensional': ['Physical Assets', 'Social Capital', 'Economic Resources', 'Environmental Quality', 'Institutional Capacity']
1021  |    };
1022  |
1023  |    const availableFactors = factorTypes[type] || factorTypes['Multi-dimensional'];
1024  |    const selectedFactors = this.randomSubset(availableFactors, count);
1025  |    
1026  |    const weights = Array(count).fill(0).map(() => Math.random());
1027  |    const sum = weights.reduce((a, b) => a + b, 0);
1028  |    const normalizedWeights = weights.map(w => w / sum);
1029  |    
1030  |    return selectedFactors.map((factorName, idx) => ({
1031  |      factorType: type,
1032  |      factorName,
1033  |      factorValue: this.randomInRange(0, 10),
1034  |      weight: parseFloat(normalizedWeights[idx].toFixed(4)),
1035  |      unit: 'score',
1036  |      description: `${factorName} assessment`,
1037  |      dataSource: 'Generated',
1038  |      lastUpdated: new Date()
1039  |    }));
1040  |  }
1041  |
1042  |  /**
1043  |   * Generate mitigation measures
1044  |   */
1045  |  generateMitigationMeasures() {
1046  |    const measures = [
1047  |      { type: 'Structural', name: 'Building Reinforcement', effectiveness: 0.7 },
1048  |      { type: 'Non-structural', name: 'Emergency Planning', effectiveness: 0.5 },
1049  |      { type: 'Emergency Response', name: 'First Responder Training', effectiveness: 0.6 },
1050  |      { type: 'Planning', name: 'Land Use Zoning', effectiveness: 0.8 },
1051  |      { type: 'Insurance', name: 'Risk Transfer Program', effectiveness: 0.9 }
1052  |    ];
1053  |
1054  |    return this.randomSubset(measures, this.randomIntInRange(2, 4)).map(measure => ({
1055  |      measureType: measure.type,
1056  |      measureName: measure.name,
1057  |      description: `${measure.name} implementation`,
1058  |      effectiveness: measure.effectiveness,
1059  |      cost: this.randomInRange(100000, 10000000),
1060  |      currency: 'USD',
1061  |      implementationTime: this.randomIntInRange(6, 36),
1062  |      implementationTimeUnit: 'months',
1063  |      priority: this.randomChoice(['Low', 'Medium', 'High', 'Critical']),
1064  |      status: this.randomChoice(['Planned', 'In Progress', 'Completed'])
1065  |    }));
1066  |  }
1067  |
1068  |  /**
1069  |   * Generate account hazards
1070  |   */
1071  |  generateAccountHazards(regions) {
1072  |    const allPerils = [];
1073  |    regions.forEach(region => {
1074  |      const regionConfig = this.regionConfigs[region];
1075  |      allPerils.push(...regionConfig.primaryPerils);
1076  |    });
1077  |    
1078  |    const uniquePerils = [...new Set(allPerils)];
1079  |    return this.randomSubset(uniquePerils, this.randomIntInRange(2, 5)).map(hazardType => ({
1080  |      hazardType,
1081  |      riskLevel: this.randomChoice(['Low', 'Medium', 'High', 'Very High', 'Extreme']),
1082  |      exposureAmount: this.randomInRange(1000000, 100000000),
1083  |      lastAssessed: new Date()
1084  |    }));
1085  |  }
1086  |
1087  |  /**
1088  |   * Generate risk zones for a location
1089  |   */
1090  |  generateRiskZones(perils) {
1091  |    return this.randomSubset(perils, this.randomIntInRange(1, 3)).map(peril => ({
1092  |      zoneType: peril,
1093  |      zoneCode: `Z-${peril.substring(0, 3).toUpperCase()}-${this.randomIntInRange(100, 999)}`,
1094  |      zoneDescription: `${peril} risk zone`,
1095  |      riskLevel: this.randomChoice(['Low', 'Medium', 'High', 'Very High', 'Extreme'])
1096  |    }));
1097  |  }
1098  |
1099  |  /**
1100  |   * Generate location risk factors
1101  |   */
1102  |  generateLocationRiskFactors(perils) {
1103  |    return this.randomSubset(perils, this.randomIntInRange(2, perils.length)).map(peril => ({
1104  |      peril,
1105  |      riskScore: this.randomInRange(0, 10),
1106  |      probability: this.randomInRange(0, 1),
1107  |      expectedLoss: this.randomInRange(10000, 5000000),
1108  |      lastUpdated: new Date()
1109  |    }));
1110  |  }
1111  |
1112  |  /**
1113  |   * Generate sublimits for policy
1114  |   */
1115  |  generateSublimits(perils, totalLimit) {
1116  |    return this.randomSubset(perils, this.randomIntInRange(1, 3)).map(peril => ({
1117  |      peril,
1118  |      limit: totalLimit * this.randomInRange(0.1, 0.5),
1119  |      deductible: totalLimit * this.randomInRange(0.01, 0.05),
1120  |      region: null
1121  |    }));
1122  |  }
1123  |
1124  |  /**
1125  |   * Calculate bounding box from center point and radius
1126  |   */
1127  |  calculateBoundingBox(centerPoint, radiusKm) {
1128  |    const kmPerDegreeLat = 111.32;
1129  |    const kmPerDegreeLng = 111.32 * Math.cos(centerPoint.latitude * Math.PI / 180);
1130  |    
1131  |    const latOffset = radiusKm / kmPerDegreeLat;
1132  |    const lngOffset = radiusKm / kmPerDegreeLng;
1133  |    
1134  |    return {
1135  |      minLatitude: parseFloat((centerPoint.latitude - latOffset).toFixed(6)),
1136  |      maxLatitude: parseFloat((centerPoint.latitude + latOffset).toFixed(6)),
1137  |      minLongitude: parseFloat((centerPoint.longitude - lngOffset).toFixed(6)),
1138  |      maxLongitude: parseFloat((centerPoint.longitude + lngOffset).toFixed(6))
1139  |    };
1140  |  }
1141  |
1142  |  /**
1143  |   * Find nearby vulnerabilities within radius
1144  |   */
1145  |  findNearbyVulnerabilities(hazard, vulnerabilities, radiusKm) {
1146  |    return vulnerabilities.filter(vuln => {
1147  |      const distance = this.calculateDistance(
1148  |        hazard.footprint.centerLatitude,
1149  |        hazard.footprint.centerLongitude,
1150  |        vuln.geographicScope.centerLatitude,
1151  |        vuln.geographicScope.centerLongitude
1152  |      );
1153  |      return distance <= radiusKm;
1154  |    });
1155  |  }
1156  |
1157  |  /**
1158  |   * Find nearby hazards within radius
1159  |   */
1160  |  findNearbyHazards(vulnerability, hazards, radiusKm) {
1161  |    return hazards.filter(hazard => {
1162  |      const distance = this.calculateDistance(
1163  |        vulnerability.geographicScope.centerLatitude,
1164  |        vulnerability.geographicScope.centerLongitude,
1165  |        hazard.footprint.centerLatitude,
1166  |        hazard.footprint.centerLongitude
1167  |      );
1168  |      return distance <= radiusKm;
1169  |    });
1170  |  }
1171  |
1172  |  /**
1173  |   * Calculate distance between two points (Haversine formula)
1174  |   */
1175  |  calculateDistance(lat1, lon1, lat2, lon2) {
1176  |    const R = 6371; // Earth's radius in km
1177  |    const dLat = (lat2 - lat1) * Math.PI / 180;
1178  |    const dLon = (lon2 - lon1) * Math.PI / 180;
1179  |    const a = 
1180  |      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
1181  |      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
1182  |      Math.sin(dLon / 2) * Math.sin(dLon / 2);
1183  |    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
1184  |    return R * c;
1185  |  }
1186  |
1187  |  /**
1188  |   * Reset counters
1189  |   */
1190  |  resetCounters() {
1191  |    Object.keys(this.counters).forEach(key => {
1192  |      this.counters[key] = 0;
1193  |    });
1194  |  }
1195  |}
1196  |
1197  |module.exports = DataGeneratorService;
1198  |
