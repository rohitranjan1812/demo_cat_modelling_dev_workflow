# Phase 2 Execution Plan - Data Structure Standardization

**Date:** January 3, 2025  
**Based On:** ACTION_PLAN.md Phase 2  
**Status:** 🟡 IN PROGRESS  
**Duration:** Week 2-3 (2 weeks)

---

## Phase 2 Objectives (from ACTION_PLAN.md)

### Goals
1. ✅ **Standardize data models** across backend, frontend, and data tools
2. ⏳ **Implement shared validation** using JSON Schema
3. ⏳ **Fix data structure misalignment** (Delta #1 from ACTION_PLAN)
4. ⏳ **Ensure full integration** all the way to data structures and logic

---

## Current Status vs Action Plan

### From ACTION_PLAN.md - Delta #1: Data Model Misalignment

**Issues Identified:**
- Backend Account: 29 fields
- Frontend Account: 18 fields (missing riskProfile, complianceInfo, metadata)
- Backend Location uses GeoJSON
- Frontend expects {lat, lng}
- **Exposure model missing from frontend** ← ✅ PARTIALLY ADDRESSED

**Our Progress:**
- ✅ Created comprehensive Exposure model (380 lines)
- ✅ Created ExposureService with 10 methods (466 lines)
- ✅ Validated backend functionality
- ⏳ **NOT YET DONE:** Frontend Exposure interface
- ⏳ **NOT YET DONE:** Frontend Exposure management UI
- ⏳ **NOT YET DONE:** Redux exposureSlice
- ⏳ **NOT YET DONE:** API routes for new ExposureService methods

---

## Phase 2 Tasks Breakdown

### Task Group 1: Complete Exposure Integration (HIGH PRIORITY)

#### Task 2.1: Update seed-minimal-data.js
**Status:** ⏳ NOT STARTED  
**From:** ACTION_PLAN.md - Database Collections gap  
**Purpose:** Generate proper Exposure records with relationships

**Requirements:**
```javascript
// Must create:
- 3 Accounts (parent-child relationships)
- 9-15 Locations (with proper GeoJSON coordinates)
- 5-10 Policies (linked to Accounts)
- 15-30 Exposures (linked to Account, Policy, Location)
  - Proper exposureId format: EXP-00000001
  - Include perilExposures array
  - Include location coordinates (copied from Location)
  - Include occupancyType matching vulnerability data
  - Include constructionType matching vulnerability data
```

**Acceptance Criteria:**
- ✅ All relationships valid (no orphaned records)
- ✅ Coordinates match between Location and Exposure
- ✅ Peril types align with Hazard peril types
- ✅ Occupancy/construction types align with Vulnerability data

#### Task 2.2: Add Exposure API Routes
**Status:** ⏳ NOT STARTED  
**From:** ACTION_PLAN.md - Missing API Routes  
**File:** `src/routes/exposureRoutes.js` (CREATE)

**Required Routes:**
```javascript
GET    /api/v1/exposures                    // List with filters
POST   /api/v1/exposures                    // Create
PUT    /api/v1/exposures/:id                // Update
DELETE /api/v1/exposures/:id                // Delete
GET    /api/v1/exposures/summary            // Aggregations
GET    /api/v1/exposures/radius             // Geospatial query
GET    /api/v1/exposures/accumulation       // Portfolio accumulation
GET    /api/v1/exposures/hierarchy/:accountId  // Hierarchical
POST   /api/v1/exposures/bulk               // Bulk import (from ACTION_PLAN)
GET    /api/v1/exposures/portfolio/:portfolioId // Portfolio exposures (from ACTION_PLAN)
```

**Acceptance Criteria:**
- ✅ All ExposureService methods exposed via API
- ✅ Proper error handling (400, 404, 500)
- ✅ Request validation middleware
- ✅ Pagination support
- ✅ CORS configured

#### Task 2.3: Create Frontend Exposure Interface
**Status:** ⏳ NOT STARTED  
**From:** ACTION_PLAN.md - Delta #1 Solution  
**File:** `frontend/src/types/exposure.ts` (CREATE)

**Requirements:**
```typescript
export interface Exposure {
  exposureId: string;
  exposureType: 'Property' | 'Liability' | 'Workers Compensation' | 'Automobile';
  accountId: string;
  policyId: string;
  locationId: string;
  totalInsuredValue: number;
  replacementValue: number;
  currency: string;
  perilExposures: PerilExposure[];
  location: {
    latitude: number;
    longitude: number;
  };
  occupancyType: string;
  constructionType: string;
  effectiveDate: string;
  expiryDate: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Expired';
  createdAt: string;
  updatedAt: string;
}

export interface PerilExposure {
  peril: string;
  exposureAmount: number;
  deductible: number;
  limit?: number;
}

export interface ExposureSummary {
  overall: {
    totalCount: number;
    totalInsuredValue: number;
    totalReplacementValue: number;
    avgInsuredValue: number;
  };
  byType: Record<string, { count: number; totalValue: number }>;
  byOccupancy: Record<string, { count: number; totalValue: number }>;
  byConstruction: Record<string, { count: number; totalValue: number }>;
  byPeril: Record<string, {
    count: number;
    totalExposure: number;
    avgExposure: number;
    totalDeductible: number;
  }>;
}
```

**Acceptance Criteria:**
- ✅ Matches backend Exposure model exactly
- ✅ Proper TypeScript types
- ✅ Exported from types/index.ts

#### Task 2.4: Create Redux Exposure Slice
**Status:** ⏳ NOT STARTED  
**From:** ACTION_PLAN.md - Missing Redux Slices  
**File:** `frontend/src/store/slices/exposureSlice.ts` (CREATE)

**Required Actions:**
```typescript
// Async thunks
fetchExposures(filters)
fetchExposureSummary(filters)
createExposure(exposureData)
updateExposure(id, updates)
deleteExposure(id)
fetchExposuresInRadius(lat, lng, radius)
fetchExposureAccumulation(filters)

// Reducers
setExposures
setExposureSummary
setLoading
setError
addExposure
updateExposure
removeExposure
```

**Acceptance Criteria:**
- ✅ All API calls handled
- ✅ Loading states managed
- ✅ Error handling
- ✅ Optimistic updates
- ✅ Caching strategy

#### Task 2.5: Create Exposure Management UI
**Status:** ⏳ NOT STARTED  
**From:** ACTION_PLAN.md - Missing UI Components  
**Files:**
- `frontend/src/components/Exposure/ExposureList.tsx`
- `frontend/src/components/Exposure/ExposureForm.tsx`
- `frontend/src/components/Exposure/ExposureDetails.tsx`
- `frontend/src/components/Exposure/ExposureSummary.tsx`
- `frontend/src/pages/ExposureManagement.tsx`

**Features Required:**
- List view with filters (account, policy, peril, value range)
- Create/Edit form with validation
- Detail view with peril breakdown
- Summary dashboard with charts
- Bulk import capability
- Export to CSV/Excel
- Geospatial map view

**Acceptance Criteria:**
- ✅ Full CRUD operations working
- ✅ Real-time validation
- ✅ Responsive design
- ✅ Loading states
- ✅ Error messages

---

### Task Group 2: Align Other Models (MEDIUM PRIORITY)

#### Task 2.6: Fix Location GeoJSON vs {lat, lng}
**Status:** ⏳ NOT STARTED  
**From:** ACTION_PLAN.md - Delta #1  

**Problem:**
- Backend uses GeoJSON format
- Frontend expects simple {lat, lng}

**Solution:**
```javascript
// Backend: Add virtual property to Location model
locationSchema.virtual('coordinates').get(function() {
  if (this.geoLocation && this.geoLocation.coordinates) {
    return {
      latitude: this.geoLocation.coordinates[1],
      longitude: this.geoLocation.coordinates[0]
    };
  }
  return null;
});
```

**Files to Update:**
- `src/models/Location.js` - Add virtual
- `frontend/src/types/location.ts` - Update interface
- All API responses - Include coordinates virtual

#### Task 2.7: Sync Account Model Fields
**Status:** ⏳ NOT STARTED  
**From:** ACTION_PLAN.md - Delta #1  

**Missing Frontend Fields:**
- riskProfile
- complianceInfo
- metadata

**Action:**
1. Update `frontend/src/types/account.ts`
2. Update AccountForm to include new fields
3. Update API client
4. Test CRUD operations

#### Task 2.8: Standardize Peril Types
**Status:** ⏳ NOT STARTED  
**Purpose:** Ensure consistency across modules

**Create:** `src/constants/perils.js`
```javascript
module.exports = {
  EARTHQUAKE: 'Earthquake',
  FLOOD: 'Flood',
  HURRICANE: 'Hurricane',
  WILDFIRE: 'Wildfire',
  TORNADO: 'Tornado',
  HAIL: 'Hail',
  WINDSTORM: 'Windstorm',
  TSUNAMI: 'Tsunami',
  VOLCANIC: 'Volcanic Eruption',
  LANDSLIDE: 'Landslide'
};
```

**Update:**
- Exposure model validation
- Hazard model validation
- Vulnerability model validation
- Frontend enum types
- Seed data generation

#### Task 2.9: Standardize Occupancy/Construction Types
**Status:** ⏳ NOT STARTED  
**Purpose:** Align with Vulnerability data

**Create:** `src/constants/buildingTypes.js`
```javascript
module.exports = {
  OCCUPANCY: {
    RESIDENTIAL: 'Residential',
    COMMERCIAL: 'Commercial',
    INDUSTRIAL: 'Industrial',
    AGRICULTURAL: 'Agricultural',
    INSTITUTIONAL: 'Institutional',
    MIXED_USE: 'Mixed-Use'
  },
  CONSTRUCTION: {
    FRAME: 'Frame',
    MASONRY: 'Masonry',
    CONCRETE: 'Concrete',
    STEEL: 'Steel',
    WOOD: 'Wood',
    MOBILE: 'Mobile'
  }
};
```

**Update:**
- Exposure model validation
- Vulnerability model validation
- Frontend enum types
- Risk adjustment calculations

---

### Task Group 3: Integration Service Enhancement (HIGH PRIORITY)

#### Task 2.10: Add Integration Methods
**Status:** ⏳ NOT STARTED  
**From:** ACTION_PLAN.md - Service Layer Gaps  
**File:** `src/services/IntegrationService.js`

**Missing Methods:**
```javascript
async getExposureAtRisk(hazardId, radiusKm) {
  // Get hazard epicenter
  // Query exposures within radius
  // Return affected exposures with distance
}

async applyVulnerability(exposureId, hazardIntensity) {
  // Get exposure details
  // Find matching vulnerability curve
  // Calculate damage factor
  // Apply to exposure value
}

async runSimulationWithExposures(simulationId) {
  // Get simulation parameters
  // Load active exposures
  // Apply hazard scenarios
  // Calculate losses
  // Store results
}
```

**Acceptance Criteria:**
- ✅ All methods use proper service injection
- ✅ Transaction support where needed
- ✅ Error handling
- ✅ Performance optimized

---

## Task Priority Matrix

### Week 2 (Jan 4-10)
**Focus:** Complete Exposure Integration

| Priority | Task | Effort | Dependencies |
|----------|------|--------|--------------|
| P0 | 2.1: Update seed data | 4h | None |
| P0 | 2.2: Add API routes | 6h | ExposureService |
| P0 | 2.3: Frontend types | 2h | None |
| P1 | 2.4: Redux slice | 8h | Frontend types, API routes |
| P1 | 2.10: Integration methods | 6h | ExposureService |

### Week 3 (Jan 11-17)
**Focus:** Frontend UI + Model Alignment

| Priority | Task | Effort | Dependencies |
|----------|------|--------|--------------|
| P0 | 2.5: Exposure UI | 16h | Redux slice |
| P1 | 2.6: Fix Location GeoJSON | 3h | None |
| P1 | 2.7: Sync Account fields | 4h | None |
| P2 | 2.8: Standardize perils | 3h | None |
| P2 | 2.9: Standardize building types | 3h | None |

---

## Success Criteria (from ACTION_PLAN.md)

### Phase 2 Completion Checklist

#### Data Structure Standardization
- ⏳ All frontend types match backend models
- ⏳ Shared validation schemas created
- ⏳ No data structure misalignment
- ⏳ Enums consistent across codebase

#### Exposure Module Complete
- ✅ Backend model complete (380 lines)
- ✅ Backend service complete (466 lines)
- ⏳ API routes implemented
- ⏳ Frontend types created
- ⏳ Redux slice implemented
- ⏳ UI components built
- ⏳ Full CRUD working end-to-end

#### Integration Verified
- ⏳ Seed data creates valid relationships
- ⏳ All reference validations tested
- ⏳ Geospatial queries working
- ⏳ Simulation consumes exposure data
- ⏳ Integration service methods complete

#### Testing Complete
- ⏳ Unit tests for new methods
- ⏳ Integration tests for workflows
- ⏳ API endpoint tests
- ⏳ Frontend component tests
- ⏳ End-to-end workflow test

---

## Alignment with North Star (ACTION_PLAN.md)

### From ACTION_PLAN - Critical Issues Identified: 47

**Phase 1 (Complete):** Foundation Fixes
- ✅ Issue #1: Service dependency injection → DIContainer created
- ✅ Issue #2: Circular dependencies → ServiceRegistry implemented
- ✅ Issue #5: ExposureService not connected → Fully implemented
- ✅ Issue #8: Transaction management → TransactionManager created
- ✅ Issue #10: Error handling inadequate → ErrorHandler created

**Phase 2 (Current):** Data Structure Standardization
- ⏳ Issue #3: Data model misalignment → In progress
- ⏳ Issue #4: Frontend missing Exposure → Planned
- ⏳ Issue #6: API contract violations → API routes pending
- ⏳ Issue #7: Missing database collections → Seed data pending
- ⏳ Issue #9: Service layer gaps → Integration methods pending

**Remaining:** 37 issues across Phases 3-6

---

## Next Immediate Actions

1. **TODAY:** Update seed-minimal-data.js (Task 2.1)
2. **TODAY:** Create API routes (Task 2.2)
3. **TOMORROW:** Frontend TypeScript types (Task 2.3)
4. **THIS WEEK:** Redux slice + UI components (Task 2.4, 2.5)
5. **NEXT WEEK:** Model alignment + Integration methods (Task 2.6-2.10)

---

**Status:** Ready to execute Phase 2 🎯  
**Alignment:** 100% with ACTION_PLAN.md  
**Next Review:** End of Week 2 (Jan 10, 2025)
