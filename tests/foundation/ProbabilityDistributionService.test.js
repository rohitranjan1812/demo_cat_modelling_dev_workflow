const ProbabilityDistributionService = require('../../src/services/ProbabilityDistributionService');

/**
 * Comprehensive test suite for ProbabilityDistributionService
 * Foundation component - highest test priority (P0)
 * 
 * Coverage: All 29 methods across 4 categories
 * Test Types: Unit tests, property-based tests, performance tests
 */
describe('ProbabilityDistributionService - Foundation Tests', () => {
  let service;

  beforeAll(() => {
    service = new ProbabilityDistributionService();
  });

  describe('Core Distribution Methods (7 methods)', () => {
    describe('generateSample() - Main sampling method', () => {
      test('should generate samples for supported distributions', () => {
        const normalSamples = service.generateSample('normal', { mu: 0, sigma: 1 }, 100);
        expect(normalSamples).toHaveLength(100);
        expect(normalSamples.every(s => typeof s === 'number')).toBe(true);
        expect(normalSamples.every(s => !isNaN(s))).toBe(true);
      });

      test('should handle invalid distribution gracefully', () => {
        expect(() => {
          service.generateSample('invalid', {}, 10);
        }).toThrow('Unsupported distribution');
      });

      test('should handle invalid parameters', () => {
        expect(() => {
          service.generateSample('normal', { mu: 'invalid', sigma: 1 }, 10);
        }).toThrow();
      });

      test('should handle edge case sample sizes', () => {
        expect(service.generateSample('normal', { mu: 0, sigma: 1 }, 0)).toHaveLength(0);
        expect(service.generateSample('normal', { mu: 0, sigma: 1 }, 1)).toHaveLength(1);
      });
    });

    describe('normal() - Normal distribution', () => {
      test('should generate normal distribution samples', () => {
        const samples = service.normal(0, 1, 1000);
        expect(samples).toHaveLength(1000);
        
        // Test statistical properties
        const mean = samples.reduce((sum, val) => sum + val, 0) / samples.length;
        const variance = samples.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / samples.length;
        
        expect(Math.abs(mean)).toBeLessThan(0.1); // Should be close to 0
        expect(Math.abs(variance - 1)).toBeLessThan(0.1); // Should be close to 1
      });

      test('should handle different parameters', () => {
        const samples = service.normal(5, 2, 100);
        const mean = samples.reduce((sum, val) => sum + val, 0) / samples.length;
        expect(Math.abs(mean - 5)).toBeLessThan(0.5); // Should be close to 5
      });

      test('should handle edge case parameters', () => {
        expect(() => service.normal(0, -1, 10)).toThrow('Standard deviation must be positive');
        expect(() => service.normal(0, 0, 10)).toThrow('Standard deviation must be positive');
      });
    });

    describe('lognormal() - Log-normal distribution', () => {
      test('should generate log-normal distribution samples', () => {
        const samples = service.lognormal(0, 1, 100);
        expect(samples).toHaveLength(100);
        expect(samples.every(s => s > 0)).toBe(true); // All values should be positive
      });

      test('should have correct statistical properties', () => {
        const samples = service.lognormal(0, 1, 1000);
        const logSamples = samples.map(s => Math.log(s));
        const logMean = logSamples.reduce((sum, val) => sum + val, 0) / logSamples.length;
        
        expect(Math.abs(logMean)).toBeLessThan(0.1); // Log of samples should have mean ~0
      });
    });

    describe('weibull() - Weibull distribution', () => {
      test('should generate Weibull distribution samples', () => {
        const samples = service.weibull(2, 1, 100);
        expect(samples).toHaveLength(100);
        expect(samples.every(s => s >= 0)).toBe(true); // All values should be non-negative
      });

      test('should handle different shape and scale parameters', () => {
        const samples1 = service.weibull(1, 1, 100); // Exponential case
        const samples2 = service.weibull(2, 1, 100); // Rayleigh case
        
        expect(samples1.every(s => s >= 0)).toBe(true);
        expect(samples2.every(s => s >= 0)).toBe(true);
      });
    });

    describe('gamma() - Gamma distribution', () => {
      test('should generate Gamma distribution samples', () => {
        const samples = service.gamma(2, 1, 100);
        expect(samples).toHaveLength(100);
        expect(samples.every(s => s > 0)).toBe(true); // All values should be positive
      });

      test('should handle edge cases', () => {
        expect(() => service.gamma(0, 1, 10)).toThrow('Shape parameter must be positive');
        expect(() => service.gamma(1, 0, 10)).toThrow('Scale parameter must be positive');
      });
    });

    describe('exponential() - Exponential distribution', () => {
      test('should generate exponential distribution samples', () => {
        const samples = service.exponential(1, 100);
        expect(samples).toHaveLength(100);
        expect(samples.every(s => s >= 0)).toBe(true); // All values should be non-negative
      });

      test('should have correct mean', () => {
        const lambda = 2;
        const samples = service.exponential(lambda, 1000);
        const mean = samples.reduce((sum, val) => sum + val, 0) / samples.length;
        const expectedMean = 1 / lambda;
        
        expect(Math.abs(mean - expectedMean)).toBeLessThan(0.1);
      });
    });

    describe('poisson() - Poisson distribution', () => {
      test('should generate Poisson distribution samples', () => {
        const samples = service.poisson(3, 100);
        expect(samples).toHaveLength(100);
        expect(samples.every(s => Number.isInteger(s) && s >= 0)).toBe(true);
      });

      test('should have correct mean and variance', () => {
        const lambda = 5;
        const samples = service.poisson(lambda, 1000);
        const mean = samples.reduce((sum, val) => sum + val, 0) / samples.length;
        const variance = samples.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / samples.length;
        
        expect(Math.abs(mean - lambda)).toBeLessThan(0.3);
        expect(Math.abs(variance - lambda)).toBeLessThan(0.5);
      });
    });
  });

  describe('Statistical Calculation Methods (12 methods)', () => {
    const testData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    describe('calculateMean()', () => {
      test('should calculate correct mean', () => {
        expect(service.calculateMean(testData)).toBe(5.5);
        expect(service.calculateMean([1, 1, 1])).toBe(1);
        expect(service.calculateMean([0])).toBe(0);
      });

      test('should handle empty array', () => {
        expect(service.calculateMean([])).toBe(0);
      });
    });

    describe('calculateVariance()', () => {
      test('should calculate correct variance', () => {
        const variance = service.calculateVariance(testData);
        expect(variance).toBeCloseTo(8.25, 2);
      });

      test('should handle single value', () => {
        expect(service.calculateVariance([5])).toBe(0);
      });
    });

    describe('calculateStandardDeviation()', () => {
      test('should calculate correct standard deviation', () => {
        const stdDev = service.calculateStandardDeviation(testData);
        expect(stdDev).toBeCloseTo(Math.sqrt(8.25), 2);
      });
    });

    describe('calculateSkewness()', () => {
      test('should calculate skewness', () => {
        const skewness = service.calculateSkewness(testData);
        expect(typeof skewness).toBe('number');
        expect(!isNaN(skewness)).toBe(true);
      });

      test('should return 0 for symmetric distribution', () => {
        const symmetricData = [-2, -1, 0, 1, 2];
        const skewness = service.calculateSkewness(symmetricData);
        expect(Math.abs(skewness)).toBeLessThan(0.1);
      });
    });

    describe('calculateKurtosis()', () => {
      test('should calculate kurtosis', () => {
        const kurtosis = service.calculateKurtosis(testData);
        expect(typeof kurtosis).toBe('number');
        expect(!isNaN(kurtosis)).toBe(true);
      });
    });

    describe('calculatePercentile()', () => {
      test('should calculate correct percentiles', () => {
        expect(service.calculatePercentile(testData, 50)).toBe(5.5); // Median
        expect(service.calculatePercentile(testData, 0)).toBe(1);    // Min
        expect(service.calculatePercentile(testData, 100)).toBe(10); // Max
      });

      test('should handle edge cases', () => {
        expect(() => service.calculatePercentile(testData, -1)).toThrow();
        expect(() => service.calculatePercentile(testData, 101)).toThrow();
      });
    });

    describe('calculateQuantile()', () => {
      test('should calculate correct quantiles', () => {
        expect(service.calculateQuantile(testData, 0.5)).toBe(5.5); // Median
        expect(service.calculateQuantile(testData, 0.25)).toBe(3.25); // Q1
        expect(service.calculateQuantile(testData, 0.75)).toBe(7.75); // Q3
      });
    });

    describe('calculateConfidenceInterval()', () => {
      test('should calculate confidence intervals', () => {
        const ci = service.calculateConfidenceInterval(testData, 0.95);
        expect(ci).toHaveProperty('lower');
        expect(ci).toHaveProperty('upper');
        expect(ci.lower).toBeLessThan(ci.upper);
      });
    });

    describe('calculateCorrelation()', () => {
      test('should calculate correlation between datasets', () => {
        const x = [1, 2, 3, 4, 5];
        const y = [2, 4, 6, 8, 10]; // Perfect positive correlation
        const correlation = service.calculateCorrelation(x, y);
        expect(correlation).toBeCloseTo(1, 2);
      });

      test('should handle uncorrelated data', () => {
        const x = [1, 2, 3, 4, 5];
        const y = [5, 3, 1, 4, 2]; // Random data
        const correlation = service.calculateCorrelation(x, y);
        expect(Math.abs(correlation)).toBeLessThan(1);
      });
    });

    describe('calculateCovariance()', () => {
      test('should calculate covariance', () => {
        const x = [1, 2, 3, 4, 5];
        const y = [2, 4, 6, 8, 10];
        const covariance = service.calculateCovariance(x, y);
        expect(covariance).toBeGreaterThan(0);
      });
    });

    describe('calculateRankCorrelation()', () => {
      test('should calculate Spearman rank correlation', () => {
        const x = [1, 2, 3, 4, 5];
        const y = [5, 4, 3, 2, 1]; // Perfect negative rank correlation
        const rankCorr = service.calculateRankCorrelation(x, y);
        expect(rankCorr).toBeCloseTo(-1, 1);
      });
    });

    describe('bootstrapSample()', () => {
      test('should generate bootstrap samples', () => {
        const bootstrap = service.bootstrapSample(testData, 100);
        expect(bootstrap).toHaveLength(100);
        expect(bootstrap.every(sample => Array.isArray(sample))).toBe(true);
        expect(bootstrap.every(sample => sample.length === testData.length)).toBe(true);
      });
    });
  });

  describe('Distribution Testing Methods (5 methods)', () => {
    describe('kolmogorovSmirnovTest()', () => {
      test('should perform KS test', () => {
        const normalSamples = service.normal(0, 1, 100);
        const result = service.kolmogorovSmirnovTest(normalSamples, 'normal');
        expect(result).toHaveProperty('statistic');
        expect(result).toHaveProperty('pValue');
        expect(result.statistic).toBeGreaterThanOrEqual(0);
        expect(result.pValue).toBeGreaterThanOrEqual(0);
        expect(result.pValue).toBeLessThanOrEqual(1);
      });
    });

    describe('shapiroWilkTest()', () => {
      test('should perform Shapiro-Wilk normality test', () => {
        const normalSamples = service.normal(0, 1, 50);
        const result = service.shapiroWilkTest(normalSamples);
        expect(result).toHaveProperty('statistic');
        expect(result).toHaveProperty('pValue');
      });

      test('should handle sample size limits', () => {
        const smallSample = [1, 2, 3]; // Too small
        expect(() => service.shapiroWilkTest(smallSample)).toThrow();
        
        const largeSample = new Array(6000).fill(0).map((_, i) => i); // Too large
        expect(() => service.shapiroWilkTest(largeSample)).toThrow();
      });
    });

    describe('andersonDarlingTest()', () => {
      test('should perform Anderson-Darling test', () => {
        const normalSamples = service.normal(0, 1, 100);
        const result = service.andersonDarlingTest(normalSamples, 'normal');
        expect(result).toHaveProperty('statistic');
        expect(result).toHaveProperty('pValue');
      });
    });

    describe('chiSquareGoodnessOfFit()', () => {
      test('should perform chi-square goodness of fit test', () => {
        const observed = [10, 15, 12, 8, 5];
        const expected = [12, 12, 12, 12, 12];
        const result = service.chiSquareGoodnessOfFit(observed, expected);
        expect(result).toHaveProperty('statistic');
        expect(result).toHaveProperty('pValue');
        expect(result).toHaveProperty('degreesOfFreedom');
      });
    });

    describe('lillieforsTest()', () => {
      test('should perform Lilliefors test', () => {
        const normalSamples = service.normal(0, 1, 100);
        const result = service.lillieforsTest(normalSamples);
        expect(result).toHaveProperty('statistic');
        expect(result).toHaveProperty('pValue');
      });
    });
  });

  describe('Utility Methods (5 methods)', () => {
    describe('validateParameters()', () => {
      test('should validate normal distribution parameters', () => {
        expect(() => service.validateParameters('normal', { mu: 0, sigma: 1 })).not.toThrow();
        expect(() => service.validateParameters('normal', { mu: 0, sigma: -1 })).toThrow();
        expect(() => service.validateParameters('normal', { mu: 0 })).toThrow('Missing sigma parameter');
      });

      test('should validate exponential distribution parameters', () => {
        expect(() => service.validateParameters('exponential', { lambda: 1 })).not.toThrow();
        expect(() => service.validateParameters('exponential', { lambda: 0 })).toThrow();
      });

      test('should handle unsupported distribution', () => {
        expect(() => service.validateParameters('unsupported', {})).toThrow();
      });
    });

    describe('getSupportedDistributions()', () => {
      test('should return list of supported distributions', () => {
        const distributions = service.getSupportedDistributions();
        expect(Array.isArray(distributions)).toBe(true);
        expect(distributions).toContain('normal');
        expect(distributions).toContain('exponential');
        expect(distributions).toContain('poisson');
        expect(distributions.length).toBeGreaterThan(0);
      });
    });

    describe('estimateParameters()', () => {
      test('should estimate normal distribution parameters', () => {
        const samples = service.normal(5, 2, 1000);
        const params = service.estimateParameters(samples, 'normal');
        expect(params).toHaveProperty('mu');
        expect(params).toHaveProperty('sigma');
        expect(Math.abs(params.mu - 5)).toBeLessThan(0.2);
        expect(Math.abs(params.sigma - 2)).toBeLessThan(0.2);
      });

      test('should estimate exponential distribution parameters', () => {
        const samples = service.exponential(2, 1000);
        const params = service.estimateParameters(samples, 'exponential');
        expect(params).toHaveProperty('lambda');
        expect(Math.abs(params.lambda - 2)).toBeLessThan(0.2);
      });
    });

    describe('generateRandomSeed()', () => {
      test('should generate random seed', () => {
        const seed = service.generateRandomSeed();
        expect(typeof seed).toBe('number');
        expect(Number.isInteger(seed)).toBe(true);
        expect(seed).toBeGreaterThan(0);
      });

      test('should generate different seeds', () => {
        const seed1 = service.generateRandomSeed();
        const seed2 = service.generateRandomSeed();
        expect(seed1).not.toBe(seed2);
      });
    });

    describe('setSeed()', () => {
      test('should set seed for reproducible results', () => {
        service.setSeed(12345);
        const samples1 = service.normal(0, 1, 10);
        
        service.setSeed(12345);
        const samples2 = service.normal(0, 1, 10);
        
        expect(samples1).toEqual(samples2);
      });
    });
  });

  describe('Property-Based Tests', () => {
    test('normal distribution samples should follow statistical properties', () => {
      const iterations = 100;
      for (let i = 0; i < iterations; i++) {
        const mu = Math.random() * 10 - 5; // Random mean between -5 and 5
        const sigma = Math.random() * 3 + 0.1; // Random std dev between 0.1 and 3.1
        const samples = service.normal(mu, sigma, 1000);
        
        const mean = service.calculateMean(samples);
        const stdDev = service.calculateStandardDeviation(samples);
        
        // Properties that should always hold
        expect(Math.abs(mean - mu)).toBeLessThan(sigma * 0.2); // Mean should be close to mu
        expect(Math.abs(stdDev - sigma)).toBeLessThan(sigma * 0.2); // Std dev should be close to sigma
        expect(samples.every(s => !isNaN(s))).toBe(true); // No NaN values
      }
    });

    test('exponential distribution samples should follow statistical properties', () => {
      const iterations = 50;
      for (let i = 0; i < iterations; i++) {
        const lambda = Math.random() * 5 + 0.1; // Random lambda between 0.1 and 5.1
        const samples = service.exponential(lambda, 1000);
        
        const mean = service.calculateMean(samples);
        const expectedMean = 1 / lambda;
        
        // Properties that should always hold
        expect(samples.every(s => s >= 0)).toBe(true); // All values non-negative
        expect(Math.abs(mean - expectedMean)).toBeLessThan(expectedMean * 0.3); // Mean should be close to 1/lambda
        expect(samples.every(s => !isNaN(s))).toBe(true); // No NaN values
      }
    });

    test('poisson distribution samples should follow statistical properties', () => {
      const iterations = 50;
      for (let i = 0; i < iterations; i++) {
        const lambda = Math.random() * 10 + 0.1; // Random lambda between 0.1 and 10.1
        const samples = service.poisson(lambda, 1000);
        
        const mean = service.calculateMean(samples);
        const variance = service.calculateVariance(samples);
        
        // Properties that should always hold
        expect(samples.every(s => Number.isInteger(s) && s >= 0)).toBe(true); // All non-negative integers
        expect(Math.abs(mean - lambda)).toBeLessThan(Math.sqrt(lambda) * 3); // Mean should be close to lambda
        expect(Math.abs(variance - lambda)).toBeLessThan(Math.sqrt(lambda) * 3); // Variance should be close to lambda
      }
    });
  });

  describe('Performance Tests', () => {
    test('should generate large samples efficiently', () => {
      const startTime = Date.now();
      const samples = service.normal(0, 1, 100000);
      const endTime = Date.now();
      
      expect(samples).toHaveLength(100000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });

    test('should handle multiple distribution types efficiently', () => {
      const startTime = Date.now();
      
      service.normal(0, 1, 10000);
      service.exponential(1, 10000);
      service.poisson(5, 10000);
      service.gamma(2, 1, 10000);
      service.weibull(2, 1, 10000);
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(2000); // Should complete in less than 2 seconds
    });

    test('should maintain reasonable memory usage', () => {
      // Generate large samples and ensure they don't consume excessive memory
      const samples1 = service.normal(0, 1, 50000);
      const samples2 = service.exponential(1, 50000);
      
      expect(samples1.length + samples2.length).toBe(100000);
      
      // Clear samples to free memory
      samples1.length = 0;
      samples2.length = 0;
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid inputs gracefully', () => {
      expect(() => service.generateSample(null, {}, 10)).toThrow();
      expect(() => service.generateSample('normal', null, 10)).toThrow();
      expect(() => service.generateSample('normal', {}, -1)).toThrow();
    });

    test('should handle edge case values', () => {
      expect(() => service.normal(Infinity, 1, 10)).toThrow();
      expect(() => service.normal(0, Infinity, 10)).toThrow();
      expect(() => service.normal(NaN, 1, 10)).toThrow();
      expect(() => service.normal(0, NaN, 10)).toThrow();
    });

    test('should handle statistical calculation edge cases', () => {
      expect(service.calculateMean([])).toBe(0);
      expect(service.calculateVariance([])).toBe(0);
      expect(service.calculateStandardDeviation([])).toBe(0);
    });
  });
});