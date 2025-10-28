# 🗺️ FUNCTIONALITY MAPPING - CAT Modeling Platform
*Detailed Implementation-to-Test Mapping*

---

## 📋 MAPPING METHODOLOGY

**Approach**: Bottom-up analysis of actual implemented code
**Scope**: All services, models, controllers, and their methods
**Granularity**: Method-level implementation mapping
**Dependencies**: Explicit input/output dependencies identified

---

## 🎯 GOAL 1: DATA INTEGRITY & MODELING

### **F1.1: Account Management**

#### **Implementation: Account Model (`src/models/Account.js`)**
```javascript
// Core Schema Definition
- accountId: String (unique identifier)
- accountName: String (business name)
- accountType: Enum (Individual, Corporate, Government)
- hierarchicalLevel: Enum (Parent, Child, Subsidiary)
- parentAccountId: String (reference to parent)
- totalExposure: Number (calculated field)
- regions: [String] (geographic coverage)
- policyEffectiveDate: Date
- policyExpirationDate: Date
- status: Enum (Active, Inactive, Suspended)

// Methods Requiring Tests
✓ save() - Document persistence
✓ findByAccountId() - Static query method  
✓ calculateTotalExposure() - Business logic
✓ getChildAccounts() - Hierarchical queries
✓ toJSON() - Data serialization
```

**Test Requirements:**
- **Unit Tests**: Schema validation, method behavior, edge cases
- **Integration Tests**: Database operations, relationships
- **Performance Tests**: Bulk operations, complex queries

#### **Implementation: AccountService (`src/services/AccountService.js`)**
```javascript
// Service Methods Identified (8 total)
✓ createAccount(accountData) - Account creation with validation
✓ getAccountById(accountId) - Single account retrieval
✓ updateAccount(accountId, updateData) - Account modification
✓ deleteAccount(accountId) - Account deletion with cascade
✓ getAccountsByRegion(region) - Geographic filtering
✓ getChildAccounts(parentId) - Hierarchical queries
✓ calculateTotalExposure(accountId) - Exposure aggregation
✓ getAccountStatistics() - Analytics and reporting

// Dependencies
→ Account Model (direct database operations)
→ Policy Model (exposure calculations)  
→ Location Model (geographic queries)
→ Sublimit Model (coverage analysis)
```

**Test Requirements:**
- **Unit Tests**: Each method with mocked dependencies
- **Integration Tests**: Service-to-model interactions
- **Edge Case Tests**: Invalid inputs, missing data, constraints

#### **Implementation: AccountController (`src/controllers/accountController.js`)**
```javascript
// HTTP Endpoint Methods (8 total)
✓ createAccount(req, res) - POST /api/v1/accounts
✓ getAccounts(req, res) - GET /api/v1/accounts (with pagination)
✓ getAccountById(req, res) - GET /api/v1/accounts/:accountId
✓ updateAccount(req, res) - PUT /api/v1/accounts/:accountId
✓ deleteAccount(req, res) - DELETE /api/v1/accounts/:accountId
✓ getChildAccounts(req, res) - GET /api/v1/accounts/:accountId/children
✓ getTotalExposure(req, res) - GET /api/v1/accounts/:accountId/total-exposure
✓ getAccountsByRegion(req, res) - GET /api/v1/accounts/region/:region
✓ getStatistics(req, res) - GET /api/v1/accounts/statistics

// Dependencies
→ AccountService (business logic delegation)
→ Validation schemas (input validation)
→ Mock data handler (testing mode)
```

**Test Requirements:**
- **Unit Tests**: HTTP request/response handling
- **Integration Tests**: Complete API endpoint testing
- **E2E Tests**: Full request lifecycle

---

### **F1.2: Hazard Modeling**

#### **Implementation: Hazard Models (4 models)**

##### **Hazard Model (`src/models/Hazard.js`)**
```javascript
// Core Schema
- hazardId: String (unique)
- hazardName: String
- hazardType: Enum (Earthquake, Hurricane, Flood, Wildfire, Tornado)
- hazardCategory: Enum (Natural, Man-made, Hybrid)
- severityScale: String (Richter, Saffir-Simpson, etc.)
- geographicScope: {
  - regions: [String]
  - countries: [String]
  - coordinates: { lat: Number, lng: Number }
  - affectedRadius: Number
}
- temporalScope: {
  - seasonality: [String]
  - frequency: String
  - duration: String
}
- intensityParameters: Mixed (hazard-specific)
- probabilityData: Mixed (statistical parameters)
```

##### **HazardEvent Model (`src/models/HazardEvent.js`)**
```javascript
// Event-specific data
- eventId: String
- hazardId: String (reference)
- eventDate: Date
- actualIntensity: Number
- actualDuration: Number
- affectedLocations: [Object]
- losses: [Object]
- status: Enum (Active, Resolved, Historical)
```

##### **HazardZone Model (`src/models/HazardZone.js`)**
```javascript
// Geographic risk zones
- zoneId: String
- zoneName: String
- hazardTypes: [String]
- riskLevel: Enum (Low, Medium, High, Extreme)
- boundingBox: Object (geographic bounds)
- zoneCharacteristics: Mixed
```

##### **HazardScenario Model (`src/models/HazardScenario.js`)**
```javascript
// Simulation scenarios
- scenarioId: String
- scenarioName: String
- hazardConfiguration: Object
- simulationParameters: Object
- expectedOutcomes: Object
- status: Enum (Draft, Running, Completed)
```

#### **Implementation: HazardService (`src/services/HazardService.js`)**
```javascript
// Service Methods (15+ methods identified)
✓ createHazard(hazardData) - Hazard creation
✓ getHazardById(hazardId) - Single retrieval
✓ updateHazard(hazardId, data) - Modification
✓ deleteHazard(hazardId) - Deletion
✓ getHazardsByType(hazardType) - Type filtering
✓ getHazardsInBounds(bounds) - Geographic queries
✓ getHazardsNearLocation(lat, lng, radius) - Proximity queries
✓ searchHazards(criteria) - Complex search
✓ getHazardStatistics() - Analytics
✓ linkHazardToVulnerability(hazardId, vulnId) - Relationships
✓ getHazardEvents(hazardId) - Event history
✓ createHazardEvent(eventData) - Event creation
✓ runScenarioSimulation(scenarioId) - Scenario execution
✓ getLocationHazardAnalysis(lat, lng) - Risk analysis
✓ getPolicyHazardExposure(policyId) - Exposure analysis

// Dependencies
→ All Hazard Models (CRUD operations)
→ Vulnerability Models (risk analysis)
→ Location Model (geographic calculations)
→ Account Model (exposure analysis)
```

#### **Implementation: HazardController (`src/controllers/hazardController.js`)**
Multiple specialized controllers:

##### **HazardController (5 methods)**
```javascript
✓ getAllHazards(req, res) - GET /api/v1/hazards
✓ getHazardById(req, res) - GET /api/v1/hazards/:id
✓ createHazard(req, res) - POST /api/v1/hazards
✓ updateHazard(req, res) - PUT /api/v1/hazards/:id
✓ deleteHazard(req, res) - DELETE /api/v1/hazards/:id
```

##### **HazardEventController (5 methods)**
```javascript
✓ getAllEvents(req, res) - GET /api/v1/hazard-events
✓ getEventById(req, res) - GET /api/v1/hazard-events/:id
✓ createEvent(req, res) - POST /api/v1/hazard-events
✓ updateEvent(req, res) - PUT /api/v1/hazard-events/:id
✓ deleteEvent(req, res) - DELETE /api/v1/hazard-events/:id
```

##### **HazardZoneController (5 methods)**
```javascript
✓ getAllZones(req, res) - GET /api/v1/hazard-zones
✓ getZoneById(req, res) - GET /api/v1/hazard-zones/:id
✓ createZone(req, res) - POST /api/v1/hazard-zones
✓ updateZone(req, res) - PUT /api/v1/hazard-zones/:id
✓ deleteZone(req, res) - DELETE /api/v1/hazard-zones/:id
```

##### **HazardScenarioController (6 methods)**
```javascript
✓ getAllHazardScenarios(req, res) - GET /api/v1/hazard-scenarios
✓ getHazardScenarioById(req, res) - GET /api/v1/hazard-scenarios/:id
✓ createHazardScenario(req, res) - POST /api/v1/hazard-scenarios
✓ updateHazardScenario(req, res) - PUT /api/v1/hazard-scenarios/:id
✓ deleteHazardScenario(req, res) - DELETE /api/v1/hazard-scenarios/:id
✓ runScenarioSimulation(req, res) - POST /api/v1/hazard-scenarios/:id/run
✓ getRunningScenarios(req, res) - GET /api/v1/hazard-scenarios/running
```

##### **HazardAnalysisController (2 methods)**
```javascript
✓ getLocationHazardAnalysis(req, res) - GET /api/v1/analysis/location
✓ getPolicyHazardExposure(req, res) - GET /api/v1/analysis/policy/:policyId
```

**Test Requirements for Hazard Module:**
- **Unit Tests**: 35 controller methods + service methods + model methods
- **Integration Tests**: Service-to-model, controller-to-service
- **E2E Tests**: Complete hazard management workflows
- **Performance Tests**: Geographic queries, bulk operations

---

### **F1.3: Vulnerability Assessment**

#### **Implementation: Vulnerability Model (`src/models/Vulnerability.js`)**
```javascript
// Core Schema
- vulnerabilityId: String (unique)
- vulnerabilityName: String
- vulnerabilityDescription: String
- vulnerabilityType: Enum (Structural, Geographic, Social, Economic)
- overallVulnerabilityScore: Number (0-10 scale)
- hazardTypeScores: [{
  - hazardType: String
  - vulnerabilityScore: Number
  - weight: Number
}]
- geographicScope: {
  - centerLatitude: Number
  - centerLongitude: Number
  - affectedRadius: Number
  - regions: [String]
  - countries: [String]
}
- temporalScope: {
  - effectiveDate: Date
  - expirationDate: Date
  - seasonalFactors: [Object]
}
- vulnerabilityFactors: [{
  - factorName: String
  - factorValue: Number
  - weight: Number
  - dataSource: String
}]
- assessmentMethodology: String
- dataSource: String
- lastAssessmentDate: Date
- status: Enum (Active, Inactive, Pending Review)
```

#### **Implementation: VulnerabilityService (`src/services/VulnerabilityService.js`)**
```javascript
// Service Methods (15+ methods)
✓ createVulnerability(vulnData) - Creation with validation
✓ getVulnerabilityById(vulnId) - Single retrieval
✓ updateVulnerability(vulnId, data) - Modification
✓ deleteVulnerability(vulnId) - Deletion
✓ getVulnerabilitiesByType(type) - Type filtering
✓ getVulnerabilitiesInBounds(bounds) - Geographic queries
✓ getVulnerabilitiesNearLocation(lat, lng, radius) - Proximity
✓ searchVulnerabilities(criteria) - Complex search
✓ getVulnerabilityStatistics() - Analytics
✓ linkVulnerabilityToHazard(vulnId, hazardId) - Relationships
✓ calculateCompositeVulnerability(factors) - Scoring logic
✓ getVulnerabilityTrends(timeframe) - Temporal analysis
✓ assessLocationVulnerability(location) - Location assessment
✓ getVulnerabilitysByHazardType(hazardType) - Hazard-specific
✓ updateVulnerabilityScores(vulnId, scores) - Score updates

// Dependencies
→ Vulnerability Model (CRUD operations)
→ Hazard Models (risk correlation)  
→ Location Model (geographic calculations)
→ Account Model (exposure correlation)
```

#### **Implementation: VulnerabilityController (`src/controllers/vulnerabilityController.js`)**
```javascript
// HTTP Methods (15 methods identified)
✓ createVulnerability(req, res) - POST /api/v1/vulnerabilities
✓ getVulnerabilities(req, res) - GET /api/v1/vulnerabilities
✓ getVulnerabilityById(req, res) - GET /api/v1/vulnerabilities/:id
✓ updateVulnerability(req, res) - PUT /api/v1/vulnerabilities/:id
✓ deleteVulnerability(req, res) - DELETE /api/v1/vulnerabilities/:id
✓ getVulnerabilitiesByType(req, res) - GET /api/v1/vulnerabilities/type/:type
✓ getVulnerabilitiesInBounds(req, res) - GET /api/v1/vulnerabilities/bounds
✓ getVulnerabilitiesNearLocation(req, res) - GET /api/v1/vulnerabilities/near
✓ searchVulnerabilities(req, res) - GET /api/v1/vulnerabilities/search
✓ getVulnerabilityStatistics(req, res) - GET /api/v1/vulnerabilities/statistics
✓ linkVulnerabilityToHazard(req, res) - POST /api/v1/vulnerabilities/:id/link/:hazardId
✓ unlinkVulnerabilityFromHazard(req, res) - DELETE /api/v1/vulnerabilities/:id/link/:hazardId
✓ getLinkedHazards(req, res) - GET /api/v1/vulnerabilities/:id/hazards
✓ getVulnerabilityTrends(req, res) - GET /api/v1/vulnerabilities/trends
✓ assessLocationVulnerability(req, res) - POST /api/v1/vulnerabilities/assess/location

// Dependencies
→ VulnerabilityService (business logic)
→ Validation schemas (input validation)
→ Mock data handler (testing support)
```

**Test Requirements for Vulnerability Module:**
- **Unit Tests**: 15 controller methods + 15 service methods + model methods
- **Integration Tests**: Cross-hazard vulnerability analysis
- **Performance Tests**: Geographic proximity calculations
- **Edge Case Tests**: Invalid coordinates, missing data

---

### **F1.4: Exposure Management**

#### **Implementation: Exposure Model (`src/models/Exposure.js`)**
```javascript
// Core Schema (analyzed from service usage)
- exposureId: String
- accountId: String (reference)
- totalInsuredValue: Number
- occupancyType: String
- constructionType: String
- location: {
  - latitude: Number
  - longitude: Number
  - address: String
}
- policyTerms: {
  - deductible: Number
  - limit: Number
  - coinsurance: Number
}
- status: Enum (Active, Inactive)
```

#### **Implementation: ExposureService (`src/services/ExposureService.js`)**
```javascript
// Service Methods (identified from CATSimulationEngine usage)
✓ getExposuresNearLocation(lat, lng, radius, options) - Geographic queries
✓ createExposure(exposureData) - Creation
✓ updateExposure(exposureId, data) - Modification
✓ deleteExposure(exposureId) - Deletion
✓ getExposuresByAccount(accountId) - Account filtering
✓ calculateExposureMetrics(exposures) - Analytics
✓ getExposuresByOccupancy(occupancyType) - Type filtering
✓ getExposuresByConstruction(constructionType) - Construction filtering
✓ validateExposureData(data) - Data validation

// Dependencies
→ Exposure Model (database operations)
→ Account Model (relationship validation)
→ Location Model (geographic calculations)
→ Policy Model (coverage validation)
```

#### **Implementation: Policy Model (`src/models/Policy.js`)**
```javascript
// Policy Terms Schema
- policyId: String
- accountId: String (reference)
- exposureId: String (reference)
- policyType: String
- coverageAmount: Number
- deductible: Number
- limit: Number
- coinsurance: Number
- effectiveDate: Date
- expirationDate: Date
- status: Enum (Active, Expired, Cancelled)
```

#### **Implementation: Sublimit Model (`src/models/Sublimit.js`)**
```javascript
// Coverage Sublimits Schema
- sublimitId: String
- policyId: String (reference)
- sublimitType: String
- sublimitAmount: Number
- applicablePerils: [String]
- conditions: [Object]
```

#### **Implementation: SpecialCondition Model (`src/models/SpecialCondition.js`)**
```javascript
// Special Policy Conditions
- conditionId: String
- policyId: String (reference)
- conditionType: String
- conditionDescription: String
- conditionValue: Mixed
- applicableScenarios: [String]
```

**Test Requirements for Exposure Module:**
- **Unit Tests**: Model validation, service logic, policy calculations
- **Integration Tests**: Account-exposure relationships, policy applications
- **Performance Tests**: Large exposure portfolio processing

---

## 🎯 GOAL 2: SIMULATION ENGINE EXCELLENCE

### **F2.1: Core Simulation Engine**

#### **Implementation: CATSimulationEngine (`src/services/CATSimulationEngine.js`)**
**Most Complex Component - 59 Methods Identified**

##### **Simulation Lifecycle Methods (4 methods)**
```javascript
✓ startSimulation(config, userId) - Simulation initiation
✓ runSimulation(simulationRunId) - Main execution loop
✓ generateYearEvents(year, config, simulationRunId) - Annual event generation
✓ generateHazardEvents(hazardType, year, config, simulationRunId) - Hazard-specific events
```

##### **Event Generation Methods (8 methods)**
```javascript
✓ generateSingleEvent(hazardType, year, config, simulationRunId) - Core event creation
✓ generateEventIntensity(hazardType, year) - Intensity calculation
✓ generateEventDuration(hazardType, intensity) - Duration calculation  
✓ determineEventSeverity(intensity, hazardType) - Severity classification
✓ calculateEventProbability(intensity, hazardType) - Probability calculation
✓ calculateReturnPeriod(probability) - Return period calculation
✓ generateEventCount(frequencyDist) - Poisson event counting
✓ generateRandomLocation(config) - Geographic event placement
```

##### **Impact Generation Methods (4 methods)**
```javascript
✓ generateGeographicImpact(hazardType, intensity, config) - Geographic impact
✓ generateFinancialImpact(hazardType, intensity, geoImpact, config) - Financial impact
✓ generateVulnerabilityImpact(hazardType, geoImpact, config) - Vulnerability impact
✓ generateExposureImpact(hazardType, geoImpact, financialImpact, config) - Exposure impact
```

##### **Risk Calculation Methods (8 methods)**
```javascript
✓ calculateRiskMetrics(financialImpact, exposureImpact, vulnImpact) - Risk metrics
✓ calculateDamageRatio(hazardType, intensity, vulnFactor) - Damage calculation
✓ calculateBaseLoss(hazardType, intensity) - Loss calculation
✓ applyPolicyTerms(grossLoss, exposure) - Policy application
✓ calculateLossRatio(hazardType, intensity) - Loss ratio calculation
✓ calculateDeductible(account, hazardType) - Deductible calculation
✓ calculateLimit(account, hazardType) - Limit calculation
✓ getPerilDamageDistribution(hazardType, intensity) - Damage distribution
```

##### **Data Access Methods (6 methods)**
```javascript
✓ getVulnerabilitiesForLocation(lat, lng, config) - Location vulnerabilities
✓ getExposuresForLocation(lat, lng, config) - Location exposures
✓ getAccountsForLocation(lat, lng, config) - Location accounts
✓ getAvailableHazardTypes() - Available hazards
✓ getVulnerabilityScoreForHazard(vuln, hazardType) - Hazard-specific scores
✓ calculateDistance(lat1, lng1, lat2, lng2) - Geographic distance
```

##### **Statistical Methods (12 methods)**
```javascript
✓ getHazardFrequencyDistribution(hazardType, year) - Frequency distribution
✓ getHazardFrequency(hazardType, year) - Base frequency
✓ getClimateChangeTrend(hazardType, year) - Climate adjustment
✓ adjustParametersForClimate(parameters, climateTrend) - Parameter adjustment
✓ getIntensityConfiguration(hazardType) - Intensity configuration
✓ getProbabilityDistribution(hazardType) - Distribution type
✓ getDistributionParameters(hazardType, intensity) - Distribution parameters
✓ calculateMedian(values) - Statistical median
✓ calculateStandardDeviation(values) - Standard deviation
✓ calculateValueAtRisk(events, confidenceLevel) - VaR calculation
✓ calculateTailValueAtRisk(events, confidenceLevel) - TVaR calculation
✓ calculateConfidenceInterval(totalLoss, confidenceLevel) - Confidence intervals
```

##### **Helper Methods (17 methods)**
```javascript
✓ generateSimulationRunId() - Unique ID generation
✓ generateEventId() - Event ID generation
✓ generatePolicyId(account) - Policy ID generation
✓ generateRandomMonth() - Random month
✓ generateRandomDay() - Random day
✓ generateNumberOfLocations(hazardType, intensity) - Location count
✓ generateAffectedRadius(hazardType, intensity) - Impact radius
✓ calculateAffectedArea(hazardType, intensity) - Impact area
✓ calculateIntensityAtLocation(intensity, location) - Location intensity
✓ getDurationUnit(hazardType) - Duration units
✓ getHazardCategory(hazardType) - Hazard categorization
✓ calculateDiversificationBenefit(exposureImpact) - Portfolio diversification
✓ calculateConcentrationRisk(exposureImpact) - Concentration risk
✓ getRegionFromCoordinates(lat, lng) - Geographic region
✓ getCountryFromCoordinates(lat, lng) - Country identification
✓ calculateVulnerabilityMultiplier(score) - Vulnerability multiplier
✓ storeSimulationEvents(events) - Event persistence
```

##### **Results Calculation Methods (7 methods)**
```javascript
✓ calculateSimulationResults(events, config) - Main results calculation
✓ calculateAverageVulnerabilityScore(events) - Average vulnerability
✓ calculateVulnerabilityDistribution(events) - Vulnerability distribution
✓ calculateTotalExposure(events) - Total exposure calculation
✓ calculateAverageExposure(events) - Average exposure
✓ calculateExposureDistribution(events) - Exposure distribution
✓ calculateSimulationMetrics(results) - Final metric calculation
```

**Dependencies for CATSimulationEngine:**
```
→ SimulationRun Model (simulation management)
→ SimulationEvent Model (event storage)
→ Hazard Models (hazard data)
→ Account Model (exposure data)
→ Vulnerability Model (vulnerability data)
→ ProbabilityDistributionService (statistical calculations)
→ IntegrationService (data access)
→ FinancialCalculationService (financial calculations)
→ ExposureService (exposure queries)
```

**Test Requirements for CATSimulationEngine:**
- **Unit Tests**: 59 methods (highest priority)
- **Integration Tests**: Service interactions, data flow
- **Property Tests**: Mathematical invariants, statistical properties
- **Performance Tests**: Large simulation runs, memory usage
- **E2E Tests**: Complete simulation workflows

---

### **F2.2: Probability & Statistics**

#### **Implementation: ProbabilityDistributionService (`src/services/ProbabilityDistributionService.js`)**
**Foundation Service - 29 Methods**

##### **Core Distribution Methods (7 methods)**
```javascript
✓ generateSample(distribution, parameters, sampleSize) - Main sampling method
✓ normal(mu, sigma, n) - Normal distribution
✓ lognormal(mu, sigma, n) - Log-normal distribution
✓ weibull(shape, scale, n) - Weibull distribution
✓ gamma(shape, scale, n) - Gamma distribution
✓ exponential(lambda, n) - Exponential distribution
✓ poisson(lambda, n) - Poisson distribution
```

##### **Statistical Calculation Methods (12 methods)**
```javascript
✓ calculateMean(samples) - Mean calculation
✓ calculateVariance(samples) - Variance calculation
✓ calculateStandardDeviation(samples) - Standard deviation
✓ calculateSkewness(samples) - Skewness calculation
✓ calculateKurtosis(samples) - Kurtosis calculation
✓ calculatePercentile(samples, percentile) - Percentile calculation
✓ calculateQuantile(samples, quantile) - Quantile calculation
✓ calculateConfidenceInterval(samples, confidence) - CI calculation
✓ calculateCorrelation(samples1, samples2) - Correlation
✓ calculateCovariance(samples1, samples2) - Covariance
✓ calculateRankCorrelation(samples1, samples2) - Rank correlation
✓ bootstrapSample(samples, iterations) - Bootstrap sampling
```

##### **Distribution Testing Methods (5 methods)**
```javascript
✓ kolmogorovSmirnovTest(samples, distribution) - KS test
✓ shapiroWilkTest(samples) - Normality test
✓ andersonDarlingTest(samples, distribution) - AD test
✓ chiSquareGoodnessOfFit(observed, expected) - Chi-square test
✓ lillieforsTest(samples) - Lilliefors test
```

##### **Utility Methods (5 methods)**
```javascript
✓ validateParameters(distribution, parameters) - Parameter validation
✓ getSupportedDistributions() - Available distributions
✓ estimateParameters(samples, distribution) - Parameter estimation
✓ generateRandomSeed() - Random seed generation
✓ setSeed(seed) - Seed setting for reproducibility
```

**Dependencies:** None (foundational service)

**Test Requirements:**
- **Unit Tests**: All 29 methods with mathematical validation
- **Property Tests**: Statistical properties, distribution correctness
- **Performance Tests**: Large sample generation
- **Integration Tests**: Usage by CATSimulationEngine

---

### **F2.3: Financial Calculations**

#### **Implementation: FinancialCalculationService (`src/services/FinancialCalculationService.js`)**
**Advanced Financial Service - 17 Methods**

##### **Portfolio Risk Methods (6 methods)**
```javascript
✓ calculatePortfolioRiskMetrics(events, options) - Portfolio-level risk
✓ calculateValueAtRisk(losses, confidenceLevel) - VaR calculation
✓ calculateTailValueAtRisk(losses, confidenceLevel) - TVaR calculation
✓ calculateExpectedShortfall(losses, confidenceLevel) - ES calculation
✓ calculateRiskContribution(portfolioItem, portfolio) - Risk contribution
✓ calculateMarginalRisk(portfolioItem, portfolio) - Marginal risk
```

##### **Loss Calculation Methods (5 methods)**
```javascript
✓ calculateExpectedLoss(events) - Expected loss calculation
✓ calculateStandardDeviation(losses) - Loss volatility
✓ calculateLossCorrelation(losses1, losses2) - Loss correlation
✓ calculateConditionalExpectedLoss(losses, threshold) - Conditional losses
✓ applyInflationAdjustment(losses, inflationRate) - Inflation adjustment
```

##### **Financial Modeling Methods (6 methods)**
```javascript
✓ calculatePresentValue(cashFlows, discountRate) - PV calculation
✓ calculateNetPresentValue(cashFlows, discountRate) - NPV calculation
✓ calculateInternalRateOfReturn(cashFlows) - IRR calculation
✓ calculateDiscountedPaybackPeriod(cashFlows, discountRate) - Payback
✓ calculateAnnuity(presentValue, rate, periods) - Annuity calculation
✓ calculateCompoundGrowth(initialValue, rate, periods) - Growth calculation
```

**Dependencies:**
```
→ Account Model (exposure data)
→ Exposure Model (valuation data)
→ ProbabilityDistributionService (statistical calculations)
```

**Test Requirements:**
- **Unit Tests**: All 17 financial calculation methods
- **Integration Tests**: CATSimulationEngine integration
- **Accuracy Tests**: Known financial scenarios
- **Performance Tests**: Large portfolio calculations

---

### **F2.4: Simulation Management**

#### **Implementation: SimulationService (`src/services/SimulationService.js`)**
```javascript
// Service Methods (estimated 10+ methods)
✓ createSimulationRun(config, userId) - Run creation
✓ getSimulationRun(runId) - Run retrieval
✓ updateSimulationStatus(runId, status) - Status updates
✓ getSimulationResults(runId) - Results retrieval
✓ deleteSimulationRun(runId) - Run deletion
✓ getSimulationHistory(userId) - User history
✓ getRunningSimulations() - Active simulations
✓ cancelSimulation(runId) - Simulation cancellation
✓ getSimulationMetrics(runId) - Performance metrics
✓ exportSimulationData(runId, format) - Data export
```

#### **Implementation: SimulationRun Model (`src/models/SimulationRun.js`)**
```javascript
// Schema Methods
✓ startSimulation() - Status change to running
✓ completeSimulation(results) - Mark complete with results
✓ failSimulation(error) - Mark failed with error
✓ updateProgress(completed, total, message) - Progress updates
✓ calculateDuration() - Execution time calculation
✓ toJSON() - Serialization
```

#### **Implementation: SimulationEvent Model (`src/models/SimulationEvent.js`)**
```javascript
// Event Schema
- eventId: String
- simulationRunId: String (reference)
- hazardType: String
- intensity: Number
- geographicImpact: Object
- financialImpact: Object
- vulnerabilityImpact: Object
- exposureImpact: Object
- riskMetrics: Object
- modelData: Object
```

#### **Implementation: SimulationController (`src/controllers/simulationController.js`)**
```javascript
// HTTP Methods (8+ methods)
✓ startSimulation(req, res) - POST /api/v1/simulations/start
✓ getSimulationRuns(req, res) - GET /api/v1/simulations/runs
✓ getSimulationById(req, res) - GET /api/v1/simulations/:id
✓ getSimulationResults(req, res) - GET /api/v1/simulations/:id/results
✓ cancelSimulation(req, res) - POST /api/v1/simulations/:id/cancel
✓ deleteSimulation(req, res) - DELETE /api/v1/simulations/:id
✓ getSimulationStatus(req, res) - GET /api/v1/simulations/:id/status
✓ getDashboard(req, res) - GET /api/v1/simulations/dashboard
```

**Dependencies:**
```
→ CATSimulationEngine (simulation execution)
→ SimulationRun Model (run management)
→ SimulationEvent Model (event storage)
→ All data models (configuration validation)
```

**Test Requirements:**
- **Unit Tests**: Service methods, model methods, controller methods
- **Integration Tests**: End-to-end simulation workflows
- **Performance Tests**: Large simulation execution
- **E2E Tests**: Complete user simulation journey

---

## 🎯 GOAL 3: API RELIABILITY & PERFORMANCE

### **F3.1: RESTful API Layer**

#### **Implementation: Express.js Application (`src/app.js`)**
```javascript
// Core App Configuration
✓ middleware setup (security, CORS, compression, rate limiting)
✓ request parsing (JSON, URL-encoded)
✓ route mounting (/api/v1/* patterns)
✓ error handling (global error handler)
✓ 404 handling (catch-all route)
✓ health check endpoint (GET /health)

// Route Mounting Points
✓ /api/v1/auth → authRoutes
✓ /api/v1/accounts → accountRoutes  
✓ /api/v1/hazards → hazardRoutes
✓ /api/v1/vulnerabilities → vulnerabilityRoutes
✓ /api/v1/integration → integrationRoutes
✓ /api/v1/simulations → simulationRoutes
```

#### **Implementation: Route Files (6 route files)**

##### **Account Routes (`src/routes/accounts.js`)**
```javascript
// 8 Routes Defined
✓ POST /api/v1/accounts - Create account
✓ GET /api/v1/accounts - List accounts (with pagination)
✓ GET /api/v1/accounts/statistics - Account statistics  
✓ GET /api/v1/accounts/region/:region - Regional accounts
✓ GET /api/v1/accounts/:accountId - Get account
✓ GET /api/v1/accounts/:accountId/children - Child accounts
✓ GET /api/v1/accounts/:accountId/total-exposure - Total exposure
✓ PUT /api/v1/accounts/:accountId - Update account
✓ DELETE /api/v1/accounts/:accountId - Delete account
```

##### **Hazard Routes (`src/routes/hazards.js`)**
```javascript
// 23+ Routes Defined
// Basic Hazard CRUD
✓ GET /api/v1/hazards - List hazards
✓ GET /api/v1/hazards/bounds - Hazards in bounds
✓ GET /api/v1/hazards/near - Hazards near location
✓ GET /api/v1/hazards/search - Search hazards
✓ GET /api/v1/hazards/statistics - Hazard statistics
✓ GET /api/v1/hazards/:id - Get hazard
✓ POST /api/v1/hazards - Create hazard
✓ PUT /api/v1/hazards/:id - Update hazard
✓ DELETE /api/v1/hazards/:id - Delete hazard

// Hazard Events (5 routes)
✓ GET /api/v1/hazard-events - List events
✓ GET /api/v1/hazard-events/:id - Get event
✓ POST /api/v1/hazard-events - Create event
✓ PUT /api/v1/hazard-events/:id - Update event
✓ DELETE /api/v1/hazard-events/:id - Delete event

// Hazard Zones (5 routes)
✓ GET /api/v1/hazard-zones - List zones
✓ GET /api/v1/hazard-zones/:id - Get zone
✓ POST /api/v1/hazard-zones - Create zone
✓ PUT /api/v1/hazard-zones/:id - Update zone
✓ DELETE /api/v1/hazard-zones/:id - Delete zone

// Hazard Scenarios (7 routes)
✓ GET /api/v1/hazard-scenarios - List scenarios
✓ GET /api/v1/hazard-scenarios/running - Active scenarios
✓ GET /api/v1/hazard-scenarios/:id - Get scenario
✓ POST /api/v1/hazard-scenarios - Create scenario
✓ PUT /api/v1/hazard-scenarios/:id - Update scenario
✓ DELETE /api/v1/hazard-scenarios/:id - Delete scenario
✓ POST /api/v1/hazard-scenarios/:id/run - Run scenario

// Analysis Routes (2 routes)
✓ GET /api/v1/analysis/location - Location analysis
✓ GET /api/v1/analysis/policy/:policyId - Policy analysis
```

##### **Vulnerability Routes (`src/routes/vulnerabilities.js`)**
```javascript
// 15+ Routes Defined
✓ GET /api/v1/vulnerabilities - List vulnerabilities
✓ GET /api/v1/vulnerabilities/type/:type - By type
✓ GET /api/v1/vulnerabilities/bounds - In bounds
✓ GET /api/v1/vulnerabilities/near - Near location
✓ GET /api/v1/vulnerabilities/search - Search
✓ GET /api/v1/vulnerabilities/statistics - Statistics
✓ GET /api/v1/vulnerabilities/trends - Trends
✓ GET /api/v1/vulnerabilities/:id - Get vulnerability
✓ GET /api/v1/vulnerabilities/:id/hazards - Linked hazards
✓ POST /api/v1/vulnerabilities - Create vulnerability
✓ POST /api/v1/vulnerabilities/assess/location - Assess location
✓ POST /api/v1/vulnerabilities/:id/link/:hazardId - Link to hazard
✓ PUT /api/v1/vulnerabilities/:id - Update vulnerability
✓ DELETE /api/v1/vulnerabilities/:id - Delete vulnerability
✓ DELETE /api/v1/vulnerabilities/:id/link/:hazardId - Unlink hazard
```

##### **Simulation Routes (`src/routes/simulations.js`)**
```javascript
// 8+ Routes Defined
✓ POST /api/v1/simulations/start - Start simulation
✓ GET /api/v1/simulations/runs - List simulation runs
✓ GET /api/v1/simulations/dashboard - Dashboard data
✓ GET /api/v1/simulations/:id - Get simulation
✓ GET /api/v1/simulations/:id/status - Get status
✓ GET /api/v1/simulations/:id/results - Get results
✓ POST /api/v1/simulations/:id/cancel - Cancel simulation
✓ DELETE /api/v1/simulations/:id - Delete simulation
```

##### **Integration Routes (`src/routes/integration.js`)**
```javascript
// 8+ Routes Defined
✓ GET /api/v1/integration/health - Health check
✓ GET /api/v1/integration/risk/location - Location risk
✓ GET /api/v1/integration/risk/account/:accountId - Account risk
✓ GET /api/v1/integration/financial/:accountId/metrics - Financial metrics
✓ GET /api/v1/integration/risk/comparison - Risk comparison
✓ GET /api/v1/integration/dashboard - Integration dashboard
✓ GET /api/v1/integration/alerts - Risk alerts
✓ GET /api/v1/integration/export - Data export
```

##### **Auth Routes (`src/routes/auth.js`)**
```javascript
// Authentication & Authorization Routes
✓ POST /api/v1/auth/register - User registration
✓ POST /api/v1/auth/login - User login
✓ POST /api/v1/auth/logout - User logout
✓ GET /api/v1/auth/profile - User profile
✓ PUT /api/v1/auth/profile - Update profile
✓ POST /api/v1/auth/change-password - Change password
✓ GET /api/v1/auth/health - Auth service health
```

**Total API Endpoints**: 70+ endpoints identified

---

### **F3.2: Data Validation**

#### **Implementation: Validation Schemas (`src/validation/schemas.js`)**
```javascript
// Core Validation Schemas
✓ accountSchema - Account creation validation
✓ accountUpdateSchema - Account update validation
✓ querySchema - Query parameter validation
✓ paginationSchema - Pagination validation
✓ coordinateSchema - Geographic coordinate validation
✓ dateRangeSchema - Date range validation
```

#### **Implementation: Hazard Schemas (`src/validation/hazardSchemas.js`)**
```javascript
// Hazard-Specific Validation
✓ validateHazard - Hazard data validation
✓ validateHazardEvent - Event data validation
✓ validateHazardZone - Zone data validation
✓ validateHazardScenario - Scenario validation
```

#### **Implementation: Vulnerability Schemas (`src/validation/vulnerabilitySchemas.js`)**
```javascript
// Vulnerability-Specific Validation
✓ validateVulnerability - Vulnerability data validation
✓ validateVulnerabilityUpdate - Update validation
✓ validateVulnerabilityScore - Score validation
✓ validateGeographicScope - Geographic validation
```

**Test Requirements for API Layer:**
- **Unit Tests**: All route handlers, validation schemas
- **Integration Tests**: Complete API endpoint testing
- **Performance Tests**: Response times, throughput
- **Security Tests**: Input validation, authentication
- **E2E Tests**: Complete API workflows

---

## 🎯 GOAL 4: INTEGRATION & WORKFLOW MANAGEMENT

### **F4.1: Cross-Module Integration**

#### **Implementation: IntegrationService (`src/services/IntegrationService.js`)**
```javascript
// Data Integration Methods (estimated 15+ methods)
✓ getLocationRiskAssessment(lat, lng, radius) - Location risk analysis
✓ getAccountRiskProfile(accountId) - Account-level risk
✓ getVulnerabilitiesAffectingLocation(lat, lng, radius) - Location vulnerabilities
✓ getHazardsAffectingLocation(lat, lng, radius) - Location hazards
✓ getAccountsInLocation(lat, lng, radius) - Location accounts
✓ calculateCrossModuleMetrics(data) - Cross-cutting metrics
✓ aggregateRiskData(criteria) - Risk data aggregation
✓ getFinancialMetrics(accountId) - Financial analysis
✓ compareRiskProfiles(profile1, profile2) - Risk comparison
✓ generateRiskAlerts(criteria) - Alert generation
✓ exportRiskData(format, criteria) - Data export
✓ validateDataConsistency() - Data integrity checks
✓ syncDataAcrossModules() - Data synchronization
✓ getIntegrationDashboard() - Dashboard data
✓ healthCheck() - Integration health status
```

#### **Implementation: IntegrationController (`src/controllers/IntegrationController.js`)**
```javascript
// Integration API Methods (8+ methods)
✓ getLocationRisk(req, res) - GET /api/v1/integration/risk/location
✓ getAccountRisk(req, res) - GET /api/v1/integration/risk/account/:accountId
✓ getFinancialMetrics(req, res) - GET /api/v1/integration/financial/:accountId/metrics
✓ compareRiskProfiles(req, res) - GET /api/v1/integration/risk/comparison
✓ getDashboard(req, res) - GET /api/v1/integration/dashboard
✓ getRiskAlerts(req, res) - GET /api/v1/integration/alerts
✓ exportRiskData(req, res) - GET /api/v1/integration/export
✓ healthCheck(req, res) - GET /api/v1/integration/health
```

**Dependencies:**
```
→ All Services (AccountService, HazardService, VulnerabilityService, etc.)
→ All Models (for cross-model queries)
→ CATSimulationEngine (for simulation integration)
→ FinancialCalculationService (for financial integration)
```

---

### **F4.2: Data Generation & Testing**

#### **Implementation: DataGeneratorService (`src/tools/DataGeneratorService.js`)**
```javascript
// Data Generation Methods (estimated 20+ methods)
✓ generateComprehensiveDataset(config) - Full dataset generation
✓ generateAccounts(count, config) - Account generation
✓ generateHazards(count, config) - Hazard generation
✓ generateVulnerabilities(count, config) - Vulnerability generation
✓ generateExposures(count, config) - Exposure generation
✓ generatePolicies(count, config) - Policy generation
✓ generateLocations(count, bounds) - Location generation
✓ generateHazardEvents(count, config) - Event generation
✓ generateSimulationData(config) - Simulation test data
✓ generatePerformanceTestData(scale) - Performance data
✓ generateRealWorldScenarios() - Realistic scenarios
✓ generateEdgeCaseData() - Edge case testing
✓ validateGeneratedData(data) - Data validation
✓ exportGeneratedData(format) - Data export
✓ clearGeneratedData() - Cleanup
✓ getGenerationStats() - Generation statistics
✓ loadExternalData(source) - External data import
✓ generateRandomData(schema) - Schema-based generation
✓ generateBenchmarkData() - Benchmark datasets
✓ generateRegressionTestData() - Regression data
```

#### **Implementation: DataGeneratorController (`src/controllers/dataGeneratorController.js`)**
```javascript
// Data Generation API Methods (5+ methods)
✓ generateData(req, res) - POST /api/data-generator/generate
✓ generateHazards(req, res) - POST /api/data-generator/hazards
✓ generateVulnerabilities(req, res) - POST /api/data-generator/vulnerabilities  
✓ generateAccounts(req, res) - POST /api/data-generator/accounts
✓ getGeneratorStatus(req, res) - GET /api/data-generator/status
```

**Test Requirements for Integration Module:**
- **Unit Tests**: All service methods, controller methods
- **Integration Tests**: Cross-module data flows
- **Performance Tests**: Large dataset processing
- **Data Quality Tests**: Generated data validation

---

## 🎯 GOAL 5: USER EXPERIENCE & INTERFACE

### **F5.1: React Frontend**

#### **Implementation: Frontend Structure (`frontend/src/`)**

##### **Page Components (5+ pages)**
```typescript
// Main Application Pages
✓ AccountsPage.tsx - Account management interface
✓ SimulationsPage.tsx - Simulation management interface
✓ IntegrationPage.tsx - Integration tools interface
✓ SettingsPage.tsx - User settings interface
✓ NotFoundPage.tsx - 404 error page

// Component Dependencies
→ React hooks (useState, useEffect, etc.)
→ TypeScript interfaces
→ API service layer
→ CSS modules/styling
```

##### **API Service Layer (`frontend/src/services/api.ts`)**
```typescript
// API Client Methods (20+ methods)
✓ getAccounts(params) - Fetch accounts
✓ getAccountById(id) - Fetch single account
✓ createAccount(data) - Create account
✓ updateAccount(id, data) - Update account
✓ deleteAccount(id) - Delete account
✓ getSimulations() - Fetch simulations
✓ startSimulation(config) - Start simulation
✓ getSimulationResults(id) - Get results
✓ cancelSimulation(id) - Cancel simulation
✓ getLocationRisk(lat, lng) - Location risk assessment
✓ getAccountRisk(accountId) - Account risk
✓ getHazards(params) - Fetch hazards
✓ getVulnerabilities(params) - Fetch vulnerabilities
✓ getDashboard() - Dashboard data
✓ healthCheck() - Health status
✓ exportData(format) - Data export
✓ login(credentials) - User authentication
✓ logout() - User logout
✓ getProfile() - User profile
✓ updateProfile(data) - Update profile
```

##### **Type Definitions (`frontend/src/types/index.ts`)**
```typescript
// TypeScript Interfaces (15+ interfaces)
✓ Account - Account data structure
✓ Hazard - Hazard data structure  
✓ Vulnerability - Vulnerability data structure
✓ Simulation - Simulation data structure
✓ SimulationResult - Result data structure
✓ RiskAssessment - Risk assessment structure
✓ LocationRisk - Location risk structure
✓ ApiResponse<T> - Generic API response
✓ PaginationParams - Pagination parameters
✓ FilterParams - Filter parameters
✓ DashboardData - Dashboard structure
✓ User - User data structure
✓ LoginCredentials - Login structure
✓ ErrorResponse - Error structure
✓ HealthStatus - Health check structure
```

---

### **F5.2: Frontend-Backend Integration**

#### **Implementation: HTTP Communication**
```typescript
// API Configuration
✓ Base URL configuration (http://localhost:3001/api/v1)
✓ Request interceptors (authentication, headers)
✓ Response interceptors (error handling, formatting)
✓ Timeout configuration
✓ Retry logic for failed requests
```

#### **Implementation: Error Handling**
```typescript
// Error Management
✓ HTTP error status handling (4xx, 5xx)
✓ Network error handling (connection issues)
✓ Timeout error handling
✓ Authentication error handling
✓ Validation error display
✓ User-friendly error messages
```

#### **Implementation: State Management**
```typescript
// Frontend State Management
✓ Component state (useState hooks)
✓ Effect management (useEffect hooks)
✓ Loading states
✓ Error states
✓ Data caching (basic)
✓ Form state management
```

**Test Requirements for Frontend:**
- **Unit Tests**: Component behavior, API service methods
- **Integration Tests**: Frontend-backend communication
- **E2E Tests**: Complete user workflows
- **UI Tests**: User interface functionality
- **Performance Tests**: Load times, responsiveness

---

## 📊 COMPREHENSIVE TEST MAPPING SUMMARY

### **Total Implementation Count**
- **Models**: 14 models with schemas and methods
- **Services**: 10 services with 150+ total methods
- **Controllers**: 8+ controllers with 70+ endpoint methods
- **Routes**: 6 route files with 70+ endpoints
- **Frontend**: 5+ pages + API service + type definitions
- **CATSimulationEngine**: 59 methods (most complex component)

### **Estimated Test Requirements**
- **Unit Tests**: 400+ individual test cases
- **Integration Tests**: 100+ integration scenarios
- **E2E Tests**: 50+ complete workflows
- **Performance Tests**: 20+ performance benchmarks
- **Total Test Coverage**: 570+ test scenarios

### **Critical Testing Paths**
1. **CATSimulationEngine** (highest complexity - 59 methods)
2. **ProbabilityDistributionService** (foundation - 29 methods)
3. **Account/Hazard/Vulnerability Models** (data integrity)
4. **API Endpoints** (reliability - 70+ endpoints)
5. **Frontend Integration** (user experience)

---

*This functionality mapping provides the complete implementation-to-test blueprint for achieving comprehensive test coverage across the entire CAT modeling platform.*