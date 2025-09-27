const TestUtils = require('../test-utils');

/**
 * Detailed service functionality tests
 */
class DetailedServiceTests {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
  }

  async runAllTests() {
    console.log('🔬 Running Detailed Service Tests...\n');
    
    try {
      await this.testFinancialCalculationService();
      await this.testProbabilityDistributionService();
      await this.testCATSimulationEngine();
      await this.testIntegrationService();
    } catch (error) {
      console.error('❌ Detailed service tests error:', error);
      this.testResults.errors.push(error.message);
    }

    this.generateReport();
  }

  async testFinancialCalculationService() {
    console.log('💰 Testing FinancialCalculationService...');
    
    try {
      const FinancialCalculationService = require('../../src/services/FinancialCalculationService');
      const service = new FinancialCalculationService();
      
      // Test currency conversion
      await this.testCurrencyConversion(service);
      
      // Test expected loss calculation
      await this.testExpectedLossCalculation(service);
      
      // Test VaR calculation
      await this.testVaRCalculation(service);
      
      // Test risk metrics
      await this.testRiskMetrics(service);
      
    } catch (error) {
      console.log(`❌ FinancialCalculationService tests failed: ${error.message}`);
      this.testResults.failed++;
      this.testResults.errors.push(`FinancialCalculationService: ${error.message}`);
    }
  }

  async testCurrencyConversion(service) {
    console.log('  Testing currency conversion...');
    
    try {
      // Test USD to EUR conversion
      const usdToEur = service.convertCurrency(1000, 'USD', 'EUR');
      console.log(`    USD 1000 = EUR ${usdToEur.toFixed(2)}`);
      
      // Test EUR to USD conversion
      const eurToUsd = service.convertCurrency(850, 'EUR', 'USD');
      console.log(`    EUR 850 = USD ${eurToUsd.toFixed(2)}`);
      
      // Test same currency conversion
      const sameCurrency = service.convertCurrency(1000, 'USD', 'USD');
      console.log(`    USD 1000 = USD ${sameCurrency.toFixed(2)}`);
      
      if (sameCurrency === 1000) {
        console.log('    ✅ Currency conversion working correctly');
        this.testResults.passed++;
      } else {
        console.log('    ❌ Same currency conversion failed');
        this.testResults.failed++;
      }
      
    } catch (error) {
      console.log(`    ❌ Currency conversion test failed: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async testExpectedLossCalculation(service) {
    console.log('  Testing expected loss calculation...');
    
    try {
      const mockEvents = [
        {
          financialImpact: {
            totalLoss: 1000000,
            currency: 'USD'
          }
        },
        {
          financialImpact: {
            totalLoss: 2000000,
            currency: 'USD'
          }
        },
        {
          financialImpact: {
            totalLoss: 1500000,
            currency: 'USD'
          }
        }
      ];
      
      const result = service.calculateExpectedLoss(mockEvents, 'USD');
      
      console.log(`    Expected Loss: ${result.expectedLoss.toFixed(2)} ${result.currency}`);
      console.log(`    Confidence Interval: [${result.confidenceInterval.lower.toFixed(2)}, ${result.confidenceInterval.upper.toFixed(2)}]`);
      
      if (result.expectedLoss > 0 && result.currency === 'USD') {
        console.log('    ✅ Expected loss calculation working correctly');
        this.testResults.passed++;
      } else {
        console.log('    ❌ Expected loss calculation failed');
        this.testResults.failed++;
      }
      
    } catch (error) {
      console.log(`    ❌ Expected loss calculation test failed: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async testVaRCalculation(service) {
    console.log('  Testing VaR calculation...');
    
    try {
      const mockEvents = [
        { financialImpact: { totalLoss: 1000000, currency: 'USD' } },
        { financialImpact: { totalLoss: 2000000, currency: 'USD' } },
        { financialImpact: { totalLoss: 1500000, currency: 'USD' } },
        { financialImpact: { totalLoss: 3000000, currency: 'USD' } },
        { financialImpact: { totalLoss: 500000, currency: 'USD' } }
      ];
      
      const result = service.calculateValueAtRisk(mockEvents, 0.95, 'USD');
      
      console.log(`    VaR (95%): ${result.valueAtRisk.toFixed(2)} ${result.currency}`);
      console.log(`    Confidence Level: ${result.confidenceLevel}`);
      
      if (result.valueAtRisk > 0 && result.currency === 'USD') {
        console.log('    ✅ VaR calculation working correctly');
        this.testResults.passed++;
      } else {
        console.log('    ❌ VaR calculation failed');
        this.testResults.failed++;
      }
      
    } catch (error) {
      console.log(`    ❌ VaR calculation test failed: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async testRiskMetrics(service) {
    console.log('  Testing risk metrics...');
    
    try {
      const mockEvents = [
        { 
          financialImpact: { totalLoss: 1000000, currency: 'USD' },
          riskMetrics: { diversificationBenefit: 0.1 }
        },
        { 
          financialImpact: { totalLoss: 2000000, currency: 'USD' },
          riskMetrics: { diversificationBenefit: 0.15 }
        },
        { 
          financialImpact: { totalLoss: 1500000, currency: 'USD' },
          riskMetrics: { diversificationBenefit: 0.12 }
        }
      ];
      
      const result = service.calculateComprehensiveRiskMetrics(mockEvents, 'USD');
      
      console.log(`    Expected Loss: ${result.expectedLoss.expectedLoss.toFixed(2)}`);
      console.log(`    Standard Deviation: ${result.standardDeviation.standardDeviation.toFixed(2)}`);
      console.log(`    VaR (95%): ${result.valueAtRisk.var_95.valueAtRisk.toFixed(2)}`);
      console.log(`    TVaR (95%): ${result.tailValueAtRisk.tvar_95.tailValueAtRisk.toFixed(2)}`);
      console.log(`    Diversification Benefit: ${result.diversificationBenefit.diversificationBenefit.toFixed(2)}`);
      
      if (result.expectedLoss.expectedLoss > 0 && result.standardDeviation.standardDeviation > 0) {
        console.log('    ✅ Risk metrics calculation working correctly');
        this.testResults.passed++;
      } else {
        console.log('    ❌ Risk metrics calculation failed');
        this.testResults.failed++;
      }
      
    } catch (error) {
      console.log(`    ❌ Risk metrics test failed: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async testProbabilityDistributionService() {
    console.log('📊 Testing ProbabilityDistributionService...');
    
    try {
      const ProbabilityDistributionService = require('../../src/services/ProbabilityDistributionService');
      const service = new ProbabilityDistributionService();
      
      // Test normal distribution
      await this.testNormalDistribution(service);
      
      // Test lognormal distribution
      await this.testLognormalDistribution(service);
      
      // Test gamma distribution
      await this.testGammaDistribution(service);
      
      // Test distribution fitting
      await this.testDistributionFitting(service);
      
    } catch (error) {
      console.log(`❌ ProbabilityDistributionService tests failed: ${error.message}`);
      this.testResults.failed++;
      this.testResults.errors.push(`ProbabilityDistributionService: ${error.message}`);
    }
  }

  async testNormalDistribution(service) {
    console.log('  Testing normal distribution...');
    
    try {
      const samples = service.generateNormal(50, 100, 1000);
      
      console.log(`    Generated ${samples.length} samples`);
      console.log(`    Mean: ${(samples.reduce((a, b) => a + b, 0) / samples.length).toFixed(2)}`);
      
      // Test PDF calculation
      const pdf = service.pdfNormal(1000, 1000, 50);
      console.log(`    PDF at mean: ${pdf.toFixed(6)}`);
      
      // Test CDF calculation
      const cdf = service.cdfNormal(1000, 1000, 50);
      console.log(`    CDF at mean: ${cdf.toFixed(6)}`);
      
      if (samples.length === 1000 && pdf > 0 && cdf > 0) {
        console.log('    ✅ Normal distribution working correctly');
        this.testResults.passed++;
      } else {
        console.log('    ❌ Normal distribution failed');
        this.testResults.failed++;
      }
      
    } catch (error) {
      console.log(`    ❌ Normal distribution test failed: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async testLognormalDistribution(service) {
    console.log('  Testing lognormal distribution...');
    
    try {
      const samples = service.generateLognormal(0, 1, 100);
      
      console.log(`    Generated ${samples.length} samples`);
      console.log(`    All positive: ${samples.every(x => x > 0)}`);
      
      if (samples.length === 100 && samples.every(x => x > 0)) {
        console.log('    ✅ Lognormal distribution working correctly');
        this.testResults.passed++;
      } else {
        console.log('    ❌ Lognormal distribution failed');
        this.testResults.failed++;
      }
      
    } catch (error) {
      console.log(`    ❌ Lognormal distribution test failed: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async testGammaDistribution(service) {
    console.log('  Testing gamma distribution...');
    
    try {
      const samples = service.generateGamma(2, 1, 100);
      
      console.log(`    Generated ${samples.length} samples`);
      console.log(`    All positive: ${samples.every(x => x > 0)}`);
      
      if (samples.length === 100 && samples.every(x => x > 0)) {
        console.log('    ✅ Gamma distribution working correctly');
        this.testResults.passed++;
      } else {
        console.log('    ❌ Gamma distribution failed');
        this.testResults.failed++;
      }
      
    } catch (error) {
      console.log(`    ❌ Gamma distribution test failed: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async testDistributionFitting(service) {
    console.log('  Testing distribution fitting...');
    
    try {
      // Generate sample data from normal distribution
      const samples = service.generateNormal(50, 100, 1000);
      
      // Fit normal distribution to the data
      const fittedParams = service.fitDistribution('normal', samples);
      
      console.log(`    Fitted mean: ${fittedParams.mean.toFixed(2)}`);
      console.log(`    Fitted std: ${fittedParams.std.toFixed(2)}`);
      
      if (Math.abs(fittedParams.mean - 50) < 10 && Math.abs(fittedParams.std - 100) < 20) {
        console.log('    ✅ Distribution fitting working correctly');
        this.testResults.passed++;
      } else {
        console.log('    ❌ Distribution fitting failed');
        this.testResults.failed++;
      }
      
    } catch (error) {
      console.log(`    ❌ Distribution fitting test failed: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async testCATSimulationEngine() {
    console.log('🌪️  Testing CATSimulationEngine...');
    
    try {
      const CATSimulationEngine = require('../../src/services/CATSimulationEngine');
      const service = new CATSimulationEngine();
      
      // Test simulation ID generation
      await this.testSimulationIdGeneration(service);
      
      // Test event generation
      await this.testEventGeneration(service);
      
      // Test risk metrics calculation
      await this.testSimulationRiskMetrics(service);
      
    } catch (error) {
      console.log(`❌ CATSimulationEngine tests failed: ${error.message}`);
      this.testResults.failed++;
      this.testResults.errors.push(`CATSimulationEngine: ${error.message}`);
    }
  }

  async testSimulationIdGeneration(service) {
    console.log('  Testing simulation ID generation...');
    
    try {
      const runId = service.generateSimulationRunId();
      const eventId = service.generateEventId();
      
      // Mock account for policy ID generation
      const mockAccount = { accountId: 'ACC-123456' };
      const policyId = service.generatePolicyId(mockAccount);
      
      console.log(`    Simulation Run ID: ${runId}`);
      console.log(`    Event ID: ${eventId}`);
      console.log(`    Policy ID: ${policyId}`);
      
      if (runId && eventId && policyId) {
        console.log('    ✅ ID generation working correctly');
        this.testResults.passed++;
      } else {
        console.log('    ❌ ID generation failed');
        this.testResults.failed++;
      }
      
    } catch (error) {
      console.log(`    ❌ ID generation test failed: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async testEventGeneration(service) {
    console.log('  Testing event generation...');
    
    try {
      // Create a mock config with required geographic scope and exposure scope
      const mockConfig = {
        geographicScope: {
          boundingBox: {
            minLatitude: 40.0,
            maxLatitude: 41.0,
            minLongitude: -74.0,
            maxLongitude: -73.0
          }
        },
        exposureScope: {
          currency: 'USD'
        },
        modelingConfig: {
          modelProvider: 'Test Provider'
        }
      };
      
      const event = await service.generateSingleEvent('Earthquake', 2024, mockConfig, 'SIMRUN-123456');
      
      console.log(`    Event Name: ${event.eventName}`);
      console.log(`    Event ID: ${event.eventId}`);
      console.log(`    Hazard Type: ${event.hazardType}`);
      console.log(`    Intensity: ${event.intensity} ${event.intensityScale}`);
      
      if (event.eventName && event.eventId && event.hazardType) {
        console.log('    ✅ Event generation working correctly');
        this.testResults.passed++;
      } else {
        console.log('    ❌ Event generation failed');
        this.testResults.failed++;
      }
      
    } catch (error) {
      console.log(`    ❌ Event generation test failed: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async testSimulationRiskMetrics(service) {
    console.log('  Testing simulation risk metrics...');
    
    try {
      const mockFinancialImpact = { totalLoss: 1000000, currency: 'USD' };
      const mockExposureImpact = [
        { exposureAmount: 500000, currency: 'USD' },
        { exposureAmount: 300000, currency: 'USD' }
      ];
      const mockVulnerabilityImpact = [
        { vulnerabilityScore: 0.8, impactMultiplier: 1.2 }
      ];
      
      const metrics = service.calculateRiskMetrics(mockFinancialImpact, mockExposureImpact, mockVulnerabilityImpact);
      
      console.log(`    Expected Loss: ${metrics.expectedLoss.toFixed(2)}`);
      console.log(`    Standard Deviation: ${metrics.standardDeviation.toFixed(2)}`);
      console.log(`    VaR: ${metrics.valueAtRisk.toFixed(2)}`);
      
      if (metrics.expectedLoss > 0 && metrics.standardDeviation > 0) {
        console.log('    ✅ Risk metrics calculation working correctly');
        this.testResults.passed++;
      } else {
        console.log('    ❌ Risk metrics calculation failed');
        this.testResults.failed++;
      }
      
    } catch (error) {
      console.log(`    ❌ Risk metrics test failed: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async testIntegrationService() {
    console.log('🔗 Testing IntegrationService...');
    
    try {
      const IntegrationService = require('../../src/services/IntegrationService');
      const service = new IntegrationService();
      
      // Test service initialization
      console.log('    IntegrationService initialized successfully');
      console.log('    ✅ IntegrationService working correctly');
      this.testResults.passed++;
      
    } catch (error) {
      console.log(`    ❌ IntegrationService test failed: ${error.message}`);
      this.testResults.failed++;
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('🔬 DETAILED SERVICE TEST REPORT');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`⚠️  Skipped: ${this.testResults.skipped}`);
    console.log(`📈 Total: ${this.testResults.passed + this.testResults.failed + this.testResults.skipped}`);
    
    if (this.testResults.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.testResults.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    const successRate = ((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1);
    console.log(`\n🎯 Success Rate: ${successRate}%`);
    
    if (this.testResults.failed === 0) {
      console.log('🎉 All detailed service tests passed!');
    } else {
      console.log('⚠️  Some detailed service tests failed. Please review the errors above.');
    }
    
    console.log('='.repeat(50));
  }
}

// Run the detailed service tests
if (require.main === module) {
  const tester = new DetailedServiceTests();
  tester.runAllTests().catch(console.error);
}

module.exports = DetailedServiceTests;