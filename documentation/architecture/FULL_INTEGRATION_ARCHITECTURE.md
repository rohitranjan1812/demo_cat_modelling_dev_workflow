# Full Integration Architecture - Exposure → Hazard → Vulnerability → Financial Risk Simulation

**Date:** October 5, 2025  
**Purpose:** Design document for integrated workflow from Exposure management through Risk Simulation  
**Status:** Planning Phase

---

## Executive Summary

This document outlines the complete integration architecture for the Cat Modeling Platform, showing how **Exposures**, **Hazards**, **Vulnerabilities**, and **Financial Risk Simulations** work together in a unified workflow.

### Core Integration Flow

```
1. EXPOSURE CAPTURE
   ↓ (Location, Assets, Values)
2. HAZARD ASSESSMENT
   ↓ (What hazards threaten this exposure?)
3. VULNERABILITY ANALYSIS
   ↓ (How susceptible is this exposure to these hazards?)
4. FINANCIAL RISK SIMULATION
   ↓ (What are the expected losses?)
5. RISK MITIGATION & DECISION MAKING
```

---

## 1. Data Flow Architecture

### 1.1 Exposure as Entry Point

**Exposure** represents the **what** and **where** of risk:
- What assets are insured? (Property, Infrastructure, etc.)
- Where are they located? (Coordinates, address)
- What is their value? (Total Insured Value)
- What are their characteristics? (Construction type, occupancy, age)

**Key Fields for Integration:**
```typescript
interface Exposure {
  exposureId: string;
  accountId: string;
  policyId: string;
  locationId: string;
  
  // Location data (integration key)
  coordinates: {
    latitude: number;
    longitude: number;
  };
  
  // Asset characteristics (vulnerability inputs)
  occupancyType: string;      // Residential, Commercial, Industrial
  constructionType: string;   // Wood, Concrete, Steel, Masonry
  numberOfStories: number;
  yearBuilt: number;
  
  // Financial data (simulation inputs)
  totalInsuredValue: number;
  currency: string;
  
  // Peril-specific exposures (hazard linkage)
  perilExposures: Array<{
    peril: string;             // Earthquake, Hurricane, Flood, etc.
    exposureValue: number;
    limit: number;
    deductible: number;
  }>;
}
```

### 1.2 Hazard Assessment Layer

**Hazard** represents the **threat** to exposures:
- What natural/man-made events could occur?
- What is their geographic footprint?
- What is their intensity/severity?
- What is their probability/frequency?

**Integration with Exposures:**
```typescript
// Service method in IntegrationService
async getHazardsAffectingExposure(exposure: Exposure): Promise<Hazard[]> {
  // Find hazards that overlap with exposure location
  const hazards = await Hazard.find({
    $or: [
      // Circle-based hazard zones
      {
        'geographicFootprint.centerPoint': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [exposure.coordinates.longitude, exposure.coordinates.latitude]
            },
            $maxDistance: exposure.geographicFootprint?.radius || 100000 // 100km default
          }
        }
      },
      // Polygon-based hazard zones
      {
        'geographicFootprint.affectedArea': {
          $geoIntersects: {
            $geometry: {
              type: 'Point',
              coordinates: [exposure.coordinates.longitude, exposure.coordinates.latitude]
            }
          }
        }
      }
    ],
    // Filter by relevant peril types
    hazardType: { $in: exposure.perilExposures.map(p => p.peril) }
  });
  
  return hazards;
}
```

**Key Hazard Data:**
```typescript
interface Hazard {
  hazardId: string;
  hazardType: string;              // Earthquake, Hurricane, etc.
  hazardCategory: string;          // Natural, Man-made, etc.
  
  // Geographic data
  geographicFootprint: {
    centerPoint: GeoPoint;
    radius: number;                // meters
    affectedArea: GeoPolygon;
  };
  
  // Intensity metrics
  intensity: number;
  intensityScale: string;          // Richter, Saffir-Simpson, etc.
  
  // Probability data
  returnPeriod: number;            // years
  annualProbability: number;       // 0-1
  
  // Impact estimates
  estimatedLoss: {
    amount: number;
    currency: string;
    confidenceLevel: number;
  };
}
```

### 1.3 Vulnerability Analysis Layer

**Vulnerability** represents **susceptibility** of exposures to hazards:
- How vulnerable is this specific exposure?
- What are the key vulnerability factors?
- How do building characteristics affect risk?
- What mitigation measures exist?

**Integration with Exposures & Hazards:**
```typescript
// Service method
async calculateExposureVulnerability(
  exposure: Exposure,
  hazard: Hazard
): Promise<VulnerabilityAssessment> {
  
  // Find or create vulnerability assessment
  let vulnerability = await Vulnerability.findOne({
    linkedExposures: { $elemMatch: { exposureId: exposure.exposureId } },
    linkedHazards: { $elemMatch: { hazardId: hazard.hazardId } }
  });
  
  if (!vulnerability) {
    // Calculate new vulnerability score
    vulnerability = await this.createVulnerabilityAssessment(exposure, hazard);
  }
  
  // Calculate hazard-specific vulnerability
  const hazardVulnerability = vulnerability.hazardVulnerabilities.find(
    hv => hv.hazardType === hazard.hazardType
  );
  
  // Calculate exposure-specific vulnerability
  const exposureVulnerability = vulnerability.exposureVulnerabilities.find(
    ev => ev.exposureType === exposure.exposureType
  );
  
  return {
    vulnerabilityId: vulnerability.vulnerabilityId,
    overallScore: vulnerability.overallVulnerabilityScore,
    hazardScore: hazardVulnerability?.vulnerabilityScore || 5.0,
    exposureScore: exposureVulnerability?.vulnerabilityScore || 5.0,
    riskLevel: vulnerability.overallRiskLevel,
    factors: vulnerability.vulnerabilityFactors,
    mitigations: vulnerability.mitigationMeasures
  };
}
```

**Vulnerability Calculation Logic:**
```typescript
interface VulnerabilityFactors {
  // Physical factors
  constructionQuality: number;      // 0-10 (exposure.constructionType)
  buildingAge: number;              // 0-10 (current year - exposure.yearBuilt)
  structuralIntegrity: number;      // 0-10 (exposure.numberOfStories)
  
  // Geographic factors
  proximityToHazard: number;        // 0-10 (distance from hazard epicenter)
  terrainConditions: number;        // 0-10 (slope, soil type)
  
  // Social/Economic factors
  population Density: number;        // 0-10 (from location data)
  infrastructureQuality: number;    // 0-10 (from location/region data)
  
  // Hazard-specific factors
  earthquakeResistance: number;     // 0-10 (for seismic hazards)
  floodResistance: number;          // 0-10 (elevation, drainage)
  windResistance: number;           // 0-10 (for hurricane/tornado)
}

function calculateVulnerabilityScore(
  exposure: Exposure,
  hazard: Hazard,
  factors: VulnerabilityFactors
): number {
  // Weighted sum of factors
  const weights = {
    constructionQuality: 0.25,
    buildingAge: 0.15,
    structuralIntegrity: 0.20,
    proximityToHazard: 0.15,
    terrainConditions: 0.10,
    populationDensity: 0.05,
    infrastructureQuality: 0.10
  };
  
  let score = 0;
  for (const [factor, weight] of Object.entries(weights)) {
    score += factors[factor] * weight;
  }
  
  // Adjust for hazard-specific factors
  if (hazard.hazardType === 'Earthquake') {
    score = score * 0.7 + factors.earthquakeResistance * 0.3;
  } else if (hazard.hazardType === 'Hurricane') {
    score = score * 0.7 + factors.windResistance * 0.3;
  } else if (hazard.hazardType === 'Flood') {
    score = score * 0.7 + factors.floodResistance * 0.3;
  }
  
  return Math.min(10, Math.max(0, score));
}
```

### 1.4 Financial Risk Simulation Layer

**Simulation** generates **probabilistic loss scenarios**:
- What are the potential financial losses?
- What is the probability distribution?
- What are the expected losses (AAL)?
- What are the tail risks (VaR, TVaR)?

**Integration Flow:**
```typescript
interface SimulationConfiguration {
  // Scope
  accountIds?: string[];
  policyIds?: string[];
  exposureIds?: string[];          // ← Can simulate specific exposures
  
  // Hazard parameters
  hazardTypes: string[];           // Which perils to include
  simulationYears: number;         // Time horizon
  numIterations: number;           // Monte Carlo iterations
  
  // Financial parameters
  applyDeductibles: boolean;
  applyLimits: boolean;
  includeBILoss: boolean;          // Business interruption
  
  // Vulnerability adjustments
  useVulnerabilityScoring: boolean; // ← Key integration flag
  vulnerabilityMultiplier: number;  // Adjust loss based on vulnerability
}

// Simulation execution with full integration
async runIntegratedSimulation(config: SimulationConfiguration): Promise<SimulationRun> {
  const simulationEngine = new CATSimulationEngine();
  
  // Step 1: Get exposures in scope
  const exposures = await this.getExposuresForSimulation(config);
  
  // Step 2: For each simulation year
  const events = [];
  for (let year = 1; year <= config.simulationYears; year++) {
    
    // Step 3: Generate hazard events for this year
    for (const hazardType of config.hazardTypes) {
      const hazardEvent = simulationEngine.generateHazardEvent(hazardType, year);
      
      // Step 4: Find affected exposures
      const affectedExposures = exposures.filter(exp => 
        this.isExposureAffected(exp, hazardEvent)
      );
      
      // Step 5: Calculate losses for each affected exposure
      for (const exposure of affectedExposures) {
        
        // Get vulnerability assessment
        const vulnerability = await this.calculateExposureVulnerability(
          exposure,
          hazardEvent
        );
        
        // Base loss calculation (from exposure value and hazard intensity)
        const baseLoss = this.calculateBaseLoss(
          exposure.totalInsuredValue,
          hazardEvent.intensity,
          hazardEvent.hazardType
        );
        
        // Apply vulnerability multiplier
        const vulnerabilityAdjustedLoss = config.useVulnerabilityScoring
          ? baseLoss * (vulnerability.overallScore / 10) * config.vulnerabilityMultiplier
          : baseLoss;
        
        // Apply financial terms (deductible, limit)
        const finalLoss = this.applyFinancialTerms(
          vulnerabilityAdjustedLoss,
          exposure.perilExposures.find(p => p.peril === hazardEvent.hazardType)
        );
        
        // Record exposure impact
        events.push({
          eventId: hazardEvent.eventId,
          exposureId: exposure.exposureId,
          hazardType: hazardEvent.hazardType,
          vulnerability Score: vulnerability.overallScore,
          baseLoss,
          adjustedLoss: vulnerabilityAdjustedLoss,
          finalLoss,
          year
        });
      }
    }
  }
  
  // Step 6: Aggregate results and calculate risk metrics
  return this.calculateSimulationResults(events, config);
}
```

**Risk Metrics Output:**
```typescript
interface SimulationResults {
  // Loss metrics
  totalLoss: number;
  averageAnnualLoss: number;
  expectedLoss: number;
  
  // Risk metrics
  valueAtRisk: {
    '50%': number;    // Median loss
    '90%': number;    // 1-in-10 year loss
    '95%': number;    // 1-in-20 year loss
    '99%': number;    // 1-in-100 year loss
  };
  
  tailValueAtRisk: {
    '95%': number;    // Average loss beyond VaR 95%
    '99%': number;    // Average loss beyond VaR 99%
  };
  
  // Breakdown by dimensions
  lossByHazardType: Record<string, number>;
  lossByExposureType: Record<string, number>;
  lossByVulnerabilityLevel: Record<string, number>;
  
  // Loss exceedance curve
  exceedanceCurve: Array<{
    returnPeriod: number;      // years
    loss: number;
    probability: number;
  }>;
}
```

---

## 2. UI Component Integration Design

### 2.1 Exposure Management Page (Phase 5)

**Components:**
1. **ExposureList** - Main data grid
2. **ExposureDetail** - Detailed view with integration touchpoints
3. **ExposureCreate** - Multi-step creation form
4. **ExposureFilters** - Advanced filtering

**Integration Touchpoints in ExposureDetail:**

```tsx
<ExposureDetail exposure={selectedExposure}>
  {/* Basic Info Tab */}
  <Tab label="Overview">
    <ExposureOverview data={exposure} />
  </Tab>
  
  {/* Hazard Assessment Tab - NEW */}
  <Tab label="Hazard Assessment" icon={<WarningIcon />}>
    <HazardAssessmentPanel exposure={exposure}>
      {/* Show hazards affecting this exposure */}
      <Typography variant="h6">Hazards Affecting This Location</Typography>
      <HazardList 
        hazards={hazardsAffectingExposure}
        loading={hazardsLoading}
      />
      
      {/* Quick metrics */}
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <MetricCard
            title="Primary Hazard"
            value={primaryHazard?.hazardType || 'N/A'}
            icon={<WarningIcon />}
          />
        </Grid>
        <Grid item xs={4}>
          <MetricCard
            title="Return Period"
            value={`${primaryHazard?.returnPeriod || 0} years`}
          />
        </Grid>
        <Grid item xs={4}>
          <MetricCard
            title="Annual Probability"
            value={`${(primaryHazard?.annualProbability * 100).toFixed(2)}%`}
          />
        </Grid>
      </Grid>
      
      {/* Map showing hazard zones */}
      <HazardZoneMap
        exposure Location={exposure.coordinates}
        hazardZones={hazardZones}
      />
    </HazardAssessmentPanel>
  </Tab>
  
  {/* Vulnerability Analysis Tab - NEW */}
  <Tab label="Vulnerability" icon={<AssessmentIcon />}>
    <VulnerabilityPanel exposure={exposure}>
      {/* Overall vulnerability score */}
      <VulnerabilityScoreCard
        score={vulnerabilityAssessment?.overallScore || 0}
        riskLevel={vulnerabilityAssessment?.riskLevel || 'Unknown'}
      />
      
      {/* Vulnerability factors breakdown */}
      <VulnerabilityFactorsChart
        factors={vulnerabilityAssessment?.factors || []}
      />
      
      {/* Hazard-specific vulnerabilities */}
      <Typography variant="h6">Vulnerability by Hazard Type</Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Hazard Type</TableCell>
              <TableCell>Vulnerability Score</TableCell>
              <TableCell>Risk Level</TableCell>
              <TableCell>Key Factors</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vulnerabilityAssessment?.hazardVulnerabilities.map(hv => (
              <TableRow key={hv.hazardType}>
                <TableCell>{hv.hazardType}</TableCell>
                <TableCell>
                  <Chip 
                    label={hv.vulnerabilityScore.toFixed(1)} 
                    color={getScoreColor(hv.vulnerabilityScore)}
                  />
                </TableCell>
                <TableCell>{hv.riskLevel}</TableCell>
                <TableCell>
                  {hv.specificFactors.slice(0, 3).map(f => f.factorName).join(', ')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Mitigation recommendations */}
      <Typography variant="h6">Recommended Mitigation Measures</Typography>
      <MitigationList
        mitigations={vulnerabilityAssessment?.mitigations || []}
        onImplement={handleMitigationImplement}
      />
    </VulnerabilityPanel>
  </Tab>
  
  {/* Risk Simulation Tab - NEW */}
  <Tab label="Risk Simulation" icon={<TrendingUpIcon />}>
    <SimulationPanel exposure={exposure}>
      {/* Quick simulation button */}
      <Button
        variant="contained"
        startIcon={<PlayArrowIcon />}
        onClick={() => handleRunQuickSimulation(exposure)}
      >
        Run Quick Risk Assessment
      </Button>
      
      {/* Show existing simulation results */}
      <Typography variant="h6">Historical Simulation Results</Typography>
      <SimulationResultsList
        exposureId={exposure.exposureId}
        results={simulationHistory}
      />
      
      {/* Loss metrics */}
      {latestSimulation && (
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <MetricCard
              title="Average Annual Loss"
              value={formatCurrency(latestSimulation.averageAnnualLoss)}
              subtitle="Expected yearly loss"
            />
          </Grid>
          <Grid item xs={3}>
            <MetricCard
              title="VaR (99%)"
              value={formatCurrency(latestSimulation.valueAtRisk['99%'])}
              subtitle="1-in-100 year loss"
            />
          </Grid>
          <Grid item xs={3}>
            <MetricCard
              title="TVaR (99%)"
              value={formatCurrency(latestSimulation.tailValueAtRisk['99%'])}
              subtitle="Tail risk"
            />
          </Grid>
          <Grid item xs={3}>
            <MetricCard
              title="Loss Ratio"
              value={`${(latestSimulation.totalLoss / exposure.totalInsuredValue * 100).toFixed(2)}%`}
              subtitle="Loss / TIV"
            />
          </Grid>
        </Grid>
      )}
      
      {/* Loss exceedance curve */}
      <ExceedanceCurveChart
        data={latestSimulation?.exceedanceCurve || []}
      />
    </SimulationPanel>
  </Tab>
  
  {/* Peril Exposures Tab (Existing) */}
  <Tab label="Peril Exposures">
    <PerilExposuresTable exposures={exposure.perilExposures} />
  </Tab>
</ExposureDetail>
```

### 2.2 Integrated Workflow Page

**New Component: `RiskWorkflowPage.tsx`**

```tsx
<RiskWorkflowPage>
  {/* Step-by-step guided workflow */}
  <Stepper activeStep={activeStep}>
    <Step>
      <StepLabel>Select Exposure</StepLabel>
    </Step>
    <Step>
      <StepLabel>Assess Hazards</StepLabel>
    </Step>
    <Step>
      <StepLabel>Analyze Vulnerability</StepLabel>
    </Step>
    <Step>
      <StepLabel>Run Simulation</StepLabel>
    </Step>
    <Step>
      <StepLabel>Review Results</StepLabel>
    </Step>
  </Stepper>
  
  {/* Step content */}
  {activeStep === 0 && (
    <ExposureSelectionStep
      onSelect={handleExposureSelect}
    />
  )}
  
  {activeStep === 1 && (
    <HazardAssessmentStep
      exposure={selectedExposure}
      onComplete={handleHazardAssessmentComplete}
    />
  )}
  
  {activeStep === 2 && (
    <VulnerabilityAnalysisStep
      exposure={selectedExposure}
      hazards={selectedHazards}
      onComplete={handleVulnerabilityComplete}
    />
  )}
  
  {activeStep === 3 && (
    <SimulationConfigurationStep
      exposure={selectedExposure}
      vulnerability={vulnerabilityAssessment}
      onRun={handleRunSimulation}
    />
  )}
  
  {activeStep === 4 && (
    <SimulationResultsStep
      results={simulationResults}
      onExport={handleExportResults}
    />
  )}
</RiskWorkflowPage>
```

---

## 3. Redux State Management Integration

### 3.1 State Slices Needed

```typescript
// Already Created:
- exposureSlice.ts       ✅ COMPLETE

// To Be Created:
- hazardSlice.ts         🔄 Phase 6
- vulnerabilitySlice.ts  🔄 Phase 7  
- simulationSlice.ts     🔄 Phase 8
- workflowSlice.ts       🔄 Phase 9 (orchestrates integration)
```

### 3.2 Workflow Orchestration Slice

```typescript
// frontend/src/store/slices/workflowSlice.ts
interface WorkflowState {
  // Current workflow
  activeWorkflow: 'exposure-to-simulation' | 'portfolio-analysis' | null;
  currentStep: number;
  
  // Selected entities
  selectedExposureIds: string[];
  selectedHazardIds: string[];
  selectedVulnerabilityIds: string[];
  
  // Workflow data
  hazardAssessment: HazardAssessmentResult | null;
  vulnerabilityAnalysis: VulnerabilityAnalysisResult | null;
  simulationConfiguration: SimulationConfiguration | null;
  simulationResults: SimulationResults | null;
  
  // State
  loading: boolean;
  error: string | null;
}

// Async thunks
export const runIntegratedWorkflow = createAsyncThunk(
  'workflow/runIntegrated',
  async (exposureIds: string[], { dispatch, getState }) => {
    // Step 1: Fetch exposures
    await dispatch(fetchExposuresByIds(exposureIds));
    
    // Step 2: Assess hazards for these exposures
    const hazards = await dispatch(assessHazardsForExposures(exposureIds)).unwrap();
    
    // Step 3: Calculate vulnerabilities
    const vulnerabilities = await dispatch(
      calculateVulnerabilitiesForExposures({ exposureIds, hazardIds: hazards.map(h => h.hazardId) })
    ).unwrap();
    
    // Step 4: Run simulation
    const simulationConfig = {
      exposureIds,
      hazardTypes: hazards.map(h => h.hazardType),
      useVulnerabilityScoring: true,
      simulationYears: 10000,
      numIterations: 1000
    };
    
    const results = await dispatch(runSimulation(simulationConfig)).unwrap();
    
    return {
      exposureIds,
      hazards,
      vulnerabilities,
      results
    };
  }
);
```

---

## 4. API Integration Points

### 4.1 New API Endpoints Needed

```typescript
// Integration-specific endpoints

// Get hazards affecting an exposure
GET /api/v1/exposures/:id/hazards
Response: Array<Hazard>

// Get vulnerability assessment for an exposure
GET /api/v1/exposures/:id/vulnerability
Query: ?hazardType=Earthquake
Response: VulnerabilityAssessment

// Run quick simulation for specific exposures
POST /api/v1/simulations/quick
Body: {
  exposureIds: string[];
  hazardTypes: string[];
  config: SimulationConfiguration;
}
Response: SimulationResults

// Get integrated risk dashboard for exposure
GET /api/v1/exposures/:id/risk-dashboard
Response: {
  exposure: Exposure;
  hazards: Hazard[];
  vulnerability: VulnerabilityAssessment;
  latestSimulation: SimulationResults;
  recommendations: RiskMitigationRecommendation[];
}
```

### 4.2 Frontend API Client Extensions

```typescript
// frontend/src/services/api/exposureApi.ts
export const exposureApi = {
  // ... existing methods ...
  
  // NEW: Integration methods
  async getExposureRiskDashboard(id: string): Promise<ApiResponse<RiskDashboard>> {
    const response = await axios.get(`/api/v1/exposures/${id}/risk-dashboard`);
    return response.data;
  },
  
  async getHazardsAffectingExposure(id: string): Promise<ApiResponse<Hazard[]>> {
    const response = await axios.get(`/api/v1/exposures/${id}/hazards`);
    return response.data;
  },
  
  async getExposureVulnerability(
    id: string,
    hazardType?: string
  ): Promise<ApiResponse<VulnerabilityAssessment>> {
    const response = await axios.get(`/api/v1/exposures/${id}/vulnerability`, {
      params: { hazardType }
    });
    return response.data;
  },
  
  async runQuickSimulation(
    exposureIds: string[],
    config: SimulationConfiguration
  ): Promise<ApiResponse<SimulationResults>> {
    const response = await axios.post('/api/v1/simulations/quick', {
      exposureIds,
      ...config
    });
    return response.data;
  }
};
```

---

## 5. Implementation Roadmap

### Phase 5: Exposure UI Components (Current)
- ✅ Create ExposureList with DataGrid
- ✅ Create ExposureDetail with tabs (including Hazard, Vulnerability, Simulation tabs)
- ✅ Create ExposureCreate form
- ✅ Create ExposureFilters
- ✅ Connect to Redux exposureSlice
- 🔄 Add integration touchpoints (buttons, preview cards)

### Phase 6: Hazard Integration
- Create hazardSlice.ts
- Create HazardAssessmentPanel component
- Implement GET /api/v1/exposures/:id/hazards endpoint
- Add hazard visualization in ExposureDetail

### Phase 7: Vulnerability Integration
- Create vulnerabilitySlice.ts
- Create VulnerabilityPanel component
- Implement GET /api/v1/exposures/:id/vulnerability endpoint
- Add vulnerability scoring display

### Phase 8: Simulation Integration
- Create simulationSlice.ts
- Create SimulationPanel component
- Implement POST /api/v1/simulations/quick endpoint
- Add loss exceedance curve visualization

### Phase 9: Workflow Orchestration
- Create workflowSlice.ts
- Create RiskWorkflowPage component
- Implement integrated workflow thunks
- Add step-by-step guided workflow

---

## 6. Key Benefits of Integration

### 6.1 For Users
- **Single Source of Truth**: All risk data accessible from exposure view
- **Guided Workflows**: Step-by-step process from exposure to loss estimate
- **Real-Time Insights**: Immediate hazard/vulnerability feedback when creating exposures
- **Better Decision Making**: See full risk picture before underwriting

### 6.2 For Business
- **Improved Accuracy**: Vulnerability scoring refines loss estimates
- **Faster Underwriting**: Automated risk assessment reduces manual work
- **Better Pricing**: More accurate loss probabilities lead to better premiums
- **Portfolio Optimization**: Identify concentrations and vulnerabilities

### 6.3 For Developers
- **Modular Architecture**: Each layer (Exposure, Hazard, Vulnerability, Simulation) is independent
- **Type Safety**: TypeScript interfaces ensure correct data flow
- **Testability**: Each integration point can be unit/integration tested
- **Extensibility**: Easy to add new hazard types or vulnerability factors

---

## 7. Testing Strategy

### 7.1 Unit Tests
- Test each Redux slice independently
- Test API client methods with mocked responses
- Test calculation functions (vulnerability scoring, loss calculations)

### 7.2 Integration Tests
- Test exposure → hazard linkage
- Test hazard → vulnerability calculation
- Test vulnerability → simulation adjustment
- Test full workflow orchestration

### 7.3 End-to-End Tests
- Create exposure → Assess hazards → Calculate vulnerability → Run simulation → View results
- Test all UI components with real data
- Test error scenarios and edge cases

---

## Conclusion

This integration architecture provides a **comprehensive, type-safe, and user-friendly** workflow from **Exposure capture** through **Financial Risk Simulation**. The modular design allows each component to function independently while seamlessly integrating when needed.

**Next Steps:**
1. Complete Phase 5 (Exposure UI) with integration touchpoints
2. Implement backend integration endpoints
3. Create hazard, vulnerability, and simulation slices
4. Build integrated workflow page
5. Comprehensive E2E testing

---

**Document Version:** 1.0  
**Last Updated:** October 5, 2025  
**Author:** Development Team  
**Status:** Planning & Design Phase
