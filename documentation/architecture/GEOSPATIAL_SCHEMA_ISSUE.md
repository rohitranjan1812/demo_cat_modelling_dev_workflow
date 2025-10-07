# Geospatial Schema Issue - Location Model

**Date:** 2025-01-05  
**Priority:** HIGH  
**Status:** Temporarily Mitigated (Index Removed)

## Issue Summary

The `Location` model has a critical schema design flaw that prevents geospatial indexing and queries from functioning correctly.

## Root Cause

### Current Schema Structure
```javascript
coordinates: {
  latitude: Number,    // -90 to 90
  longitude: Number,   // -180 to 180
  elevation: Number    // -1000 to 10000
}
```

### MongoDB 2dsphere Index Requirement
```javascript
// Expected GeoJSON format
{
  type: "Point",
  coordinates: [longitude, latitude]  // Note: [lng, lat] order
}
```

### The Conflict
- Schema defines `coordinates` with `index: '2dsphere'`
- But coordinates structure is `{latitude, longitude, elevation}` 
- MongoDB 2dsphere requires GeoJSON format: `{type: "Point", coordinates: [lng, lat]}`
- Result: **Index creation fails** with error: "can't project geometry into spherical CRS"

## Impact

### Broken Functionality
1. **Location.findWithinRadius()** static method
   - Uses `$geoWithin` with `$centerSphere`
   - Expects `[lng, lat]` array format
   - Won't work with current `{latitude, longitude}` object

2. **Geospatial Queries**
   - Any query using `$near`, `$geoWithin`, `$geoNear` will fail
   - Proximity-based location searches non-functional
   - Hazard zone mapping by geography broken

3. **Performance**
   - No spatial indexing means O(n) scans for location queries
   - Critical for hazard exposure calculations
   - Affects policy risk assessment by region

### Validation of ACTION_PLAN
This confirms **ACTION_PLAN.md Delta #1**: "Models evolved independently without end-to-end integration testing"

## Temporary Mitigation

**Action Taken:** Removed `index: '2dsphere'` declaration from Location.js
- Location documents can now be created
- Seed script can execute
- Added TODO comment explaining the issue

**Trade-off:** 
- ✅ Application can start and run
- ✅ CRUD operations on locations work
- ❌ Geospatial queries will be slow (no index)
- ❌ Location.findWithinRadius() will return empty results

## Proper Fix Required

### Option 1: Convert to GeoJSON (Recommended)
```javascript
// New schema structure
coordinates: {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number],  // [longitude, latitude]
    required: true
  }
},
elevation: {
  type: Number,
  min: -1000,
  max: 10000,
  default: 0
},

// Index
coordinates: {
  type: coordinatesSchema,
  required: true,
  index: '2dsphere'
}
```

### Option 2: Remove Geospatial Queries
- Remove `2dsphere` index permanently
- Remove `findWithinRadius()` method
- Implement proximity logic in application code
- Accept O(n) performance for location queries

### Recommendation
**Option 1** is strongly recommended because:
1. Preserves geospatial query capability (critical for hazard modeling)
2. Maintains performance with proper indexing
3. Follows MongoDB best practices
4. Enables future features (nearest location, radius search, zone mapping)

## Migration Impact

### Database Changes
- **Schema Migration Required**: YES
- **Data Migration Required**: YES - convert existing data
- **Breaking Change**: YES - coordinate structure changes

### Code Changes Required
1. **src/models/Location.js**
   - Update coordinatesSchema to GeoJSON
   - Update validation rules
   - Add virtual getters for backward compatibility
   
2. **scripts/seed-minimal-data.js**
   - Update coordinate generation
   - Use [lng, lat] array instead of {latitude, longitude}
   
3. **All location queries**
   - Update to access coordinates[0] (lng) and coordinates[1] (lat)
   - Or use virtual properties

4. **Frontend**
   - Update TypeScript interfaces
   - Update UI components displaying coordinates
   - Map components may need format conversion

### Migration Script Needed
```javascript
// Convert existing locations from {lat, lng} to GeoJSON
db.locations.find().forEach(loc => {
  db.locations.updateOne(
    { _id: loc._id },
    {
      $set: {
        'coordinates.type': 'Point',
        'coordinates.coordinates': [
          loc.coordinates.longitude,
          loc.coordinates.latitude
        ],
        elevation: loc.coordinates.elevation
      },
      $unset: {
        'coordinates.latitude': '',
        'coordinates.longitude': '',
        'coordinates.elevation': ''
      }
    }
  );
});
```

## Action Items

### Immediate (Phase 2)
- [x] Document issue (this file)
- [x] Remove broken index to unblock development
- [ ] Add to Phase 2 task list
- [ ] Estimate migration effort

### Phase 3 - Proper Fix
- [ ] Design backward-compatible schema transition
- [ ] Create migration script with rollback
- [ ] Add virtual getters for `latitude` and `longitude` 
- [ ] Update all code referencing coordinates
- [ ] Update seed scripts
- [ ] Test geospatial queries
- [ ] Update frontend coordinate handling
- [ ] Update API documentation

## Related Issues
- Validates ACTION_PLAN.md Delta #1
- Related to DATA_STRUCTURE_MISALIGNMENT_CONFIRMED.md
- Impacts Hazard-Location integration
- Affects Policy risk assessment queries

## Testing Required
- [ ] Unit tests for coordinate format
- [ ] Integration tests for geospatial queries
- [ ] Performance tests for indexed vs non-indexed queries
- [ ] Migration script dry-run on test data
- [ ] Verify backward compatibility with virtual getters
