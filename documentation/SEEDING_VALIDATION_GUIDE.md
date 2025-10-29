# Seeding Validation and Testing Guide

## Overview
This guide documents the comprehensive seeding validation and testing process for the CAT Modeling Platform. It ensures data integrity, schema compliance, and proper relationships at scale.

## Table of Contents
1. [Seeding Scripts](#seeding-scripts)
2. [Validation Tools](#validation-tools)
3. [Testing Framework](#testing-framework)
4. [Common Issues and Fixes](#common-issues-and-fixes)
5. [Performance Considerations](#performance-considerations)

---

## Seeding Scripts

### Available Seeding Options

#### 1. Comprehensive Seed (Fixed)
- **Command**: `npm run seed:fixed`
- **File**: `src/config/comprehensive-seed-fixed.js`
- **Records**: ~10 records across all models
- **Purpose**: Quick setup with validated, schema-compliant data
- **Use Case**: Development, testing, demos

#### 2. Extensive Data Seeding
- **Command**: `npm run seed:extensive`
- **File**: `seed-extensive-data.js`
- **Records**: Hundreds of thousands (configurable)
  - Accounts: 50,000
  - Hazards: 30,000
  - Vulnerabilities: 20,000
  - Locations: 100,000
  - Exposures: 150,000
  - Policies: 75,000
- **Purpose**: Large-scale testing, performance validation
- **Use Case**: Load testing, production simulation

#### 3. Production Seeding
- **Command**: `npm run seed:production`
- **File**: `src/config/seed-production.js`
- **Records**: Production-ready data set
- **Purpose**: Initial production deployment
- **Use Case**: Production environment setup

---

## Validation Tools

### 1. Automated Validation Script

**Command**: `npm run seed:validate`

This script performs comprehensive validation and automatic fixes:

#### What It Checks
- ✅ Required fields presence
- ✅ Field format compliance (ID patterns, email, etc.)
- ✅ Data type correctness
- ✅ Enum value validation
- ✅ Coordinate bounds (-90/90, -180/180)
- ✅ Date range validity
- ✅ Relationship integrity (parent-child, references)
- ✅ Numeric range validation (positive values, percentages, etc.)

#### What It Fixes
- 🔧 Missing required fields (sets defaults)
- 🔧 Invalid status values
- 🔧 Missing audit fields (createdBy, lastModifiedBy)
- 🔧 Incorrect account levels
- 🔧 Missing risk profile data

#### Output
- Console summary with color-coded results
- JSON report saved to `validation-report-[timestamp].json`
- Detailed issue breakdown by category

#### Example Usage
```bash
npm run seed:validate
```

#### Sample Output
```
🚀 CAT Modeling Platform - Seeding Validation and Fix Tool
═══════════════════════════════════════════════════════════

🔄 Connecting to MongoDB: mongodb://127.0.0.1:27017/cat_modeling_dev
✅ Connected to MongoDB

👥 Validating Accounts...
═══════════════════════════════════════════════════════════
Found 50000 accounts to validate
✅ [Accounts] Fixed 127 accounts

📊 Account Statistics:
   Total Accounts: 50000
   Total Exposure: $2,500,000,000
   Avg Exposure: $50,000

...

📊 COMPREHENSIVE VALIDATION SUMMARY
═══════════════════════════════════════════════════════════

📦 Database Records:
   👥 Accounts:        50,000
   🌪️  Hazards:         30,000
   🏗️  Vulnerabilities: 20,000
   📍 Locations:       100,000
   💰 Exposures:       150,000
   📄 Policies:        75,000
   🎲 Simulations:     2
   👤 Users:           3
   ───────────────────────────────────────────
   📦 TOTAL:           425,005

🔍 Validation Results:
   ❌ Issues Found:    45
   ✅ Fixes Applied:   127
   ⚠️  Warnings:        12

💾 Detailed report saved to: ./validation-report-1698765432100.json
```

### 2. Test-Based Validation

**Command**: `npm run test:seed-validation`

Comprehensive Jest test suite that validates:
- Schema compliance
- Data integrity
- Relationship validity
- Performance benchmarks

---

## Testing Framework

### Comprehensive Seed Validation Tests

**Location**: `tests/seed-validation-comprehensive.test.js`

#### Test Categories

1. **Database Connection and Setup**
   - MongoDB connection verification
   - Collection existence check

2. **Account Data Validation**
   - ID format validation (ACC-XXXXXX)
   - Required fields presence
   - Type enum validation
   - Currency enum validation
   - Non-negative exposure values
   - Parent-child relationship integrity
   - Exposure distribution analysis

3. **Hazard Data Validation**
   - ID format validation (HAZ-XXXXXXXX)
   - Required fields presence
   - Category enum validation
   - Coordinate bounds validation
   - Probability range validation (0-1)

4. **Vulnerability Data Validation**
   - ID format validation (VUL-XXXXXXXX)
   - Required fields presence
   - Geographic scope validation
   - Vulnerability score range (0-10)
   - Hazard link integrity

5. **Location Data Validation**
   - ID format validation (LOC-XXXXXXXX)
   - Coordinate validation
   - Account reference integrity

6. **Exposure Data Validation**
   - ID format validation (EXP-XXXXXXXXXX)
   - Non-negative values
   - Required fields presence

7. **Policy Data Validation**
   - ID format validation (POL-XXXXXXXX)
   - Date range validation (effective < expiration)
   - Required fields presence

8. **Simulation Run Data Validation**
   - ID format validation (SIMRUN-XXXXXXXX-XXXXXX)
   - Configuration validity
   - Year range validation (startYear <= endYear)
   - Results presence for completed simulations

9. **User Data Validation**
   - ID format validation (USR-XXXXXXXX)
   - Email format validation
   - Required fields presence

10. **Data Relationship Validation**
    - Location → Account references
    - Vulnerability → Hazard links
    - Simulation → Account references

11. **Performance and Scale Validation**
    - Pagination performance (<5 seconds for 100 records)
    - Count query performance (<10 seconds for all collections)

12. **Summary Report**
    - Total record counts
    - Distribution by type
    - Overall validation status

#### Running the Tests

```bash
# Run seed validation tests
npm run test:seed-validation

# Run with coverage
npm run test:coverage -- tests/seed-validation-comprehensive.test.js

# Run in watch mode
npm run test:watch -- tests/seed-validation-comprehensive.test.js
```

#### Sample Test Output

```
 PASS  tests/seed-validation-comprehensive.test.js (45.234 s)
  🌱 Comprehensive Seeding Validation Test Suite
    📊 Database Connection and Setup
      ✓ should have active MongoDB connection (5 ms)
      ✓ should have all required collections (125 ms)
    👥 Account Data Validation
      ✓ should have accounts seeded in database (89 ms)
         📊 Found 50000 accounts
      ✓ all accounts should have valid accountId format (234 ms)
      ✓ all accounts should have required fields (198 ms)
      ✓ all accounts should have valid accountType (145 ms)
      ✓ all accounts should have valid currency (132 ms)
      ✓ all accounts should have non-negative totalExposure (156 ms)
      ✓ accounts with parentAccountId should have valid parent reference (423 ms)
      ✓ should have reasonable exposure distribution (167 ms)
         💰 Exposure Stats: Total=$2,500,000,000, Avg=$50,000, Max=$100,000,000, Min=$1,000,000
    ...
    📋 Summary Report
      ✓ should generate comprehensive data summary (892 ms)

📊 COMPREHENSIVE SEEDING VALIDATION SUMMARY
═══════════════════════════════════════════
👥 Accounts:        50,000
🌪️  Hazards:         30,000
🏗️  Vulnerabilities: 20,000
📍 Locations:       100,000
💰 Exposures:       150,000
📄 Policies:        75,000
🎲 Simulations:     2
👤 Users:           3
───────────────────────────────────────────
📦 TOTAL RECORDS:   425,005
═══════════════════════════════════════════

Test Suites: 1 passed, 1 total
Tests:       45 passed, 45 total
Snapshots:   0 total
Time:        45.234 s
```

---

## Common Issues and Fixes

### Issue 1: Schema Validation Errors

**Symptom**: 
```
ValidationError: Hazard validation failed: hazardCategory: Path `hazardCategory` is required.
```

**Cause**: Missing required fields in seeded data

**Fix**: Run validation script
```bash
npm run seed:validate
```

### Issue 2: Invalid ID Formats

**Symptom**:
```
ValidationError: Account validation failed: accountId: Account ID must be in format ACC-XXXXXX
```

**Cause**: Incorrect ID generation in seeding script

**Fix**: Ensure proper ID format in generation:
```javascript
const accountId = `ACC-${String(startId + i).padStart(6, '0')}`;
```

### Issue 3: Orphaned References

**Symptom**: Locations reference non-existent accounts

**Cause**: Data inserted out of order or parent records deleted

**Fix**: 
1. Run validation script to identify orphans
2. Either delete orphaned records or create missing parents

```bash
npm run seed:validate
```

The script will log all orphaned references.

### Issue 4: Coordinate Bounds Violation

**Symptom**:
```
ValidationError: Hazard validation failed: footprint.centerLatitude: Path `footprint.centerLatitude` (95) is more than maximum allowed value (90).
```

**Cause**: Invalid coordinate generation

**Fix**: Ensure coordinates are within valid ranges:
```javascript
latitude: randomFloat(-90, 90, 6)
longitude: randomFloat(-180, 180, 6)
```

### Issue 5: Invalid Date Ranges

**Symptom**: Simulation has endYear before startYear

**Cause**: Incorrect date logic in seeding

**Fix**: Validation script will flag these. Manually fix or regenerate:
```javascript
configuration: {
  startYear: 2024,
  endYear: 2025,  // Must be >= startYear
  ...
}
```

---

## Performance Considerations

### Large-Scale Seeding

#### Memory Management

When seeding hundreds of thousands of records:

1. **Use Batch Inserts**
   ```javascript
   const BATCH_SIZE = 1000;
   for (let i = 0; i < data.length; i += BATCH_SIZE) {
     const batch = data.slice(i, i + BATCH_SIZE);
     await Model.insertMany(batch, { ordered: false });
   }
   ```

2. **Generate Data in Chunks**
   - Don't hold all data in memory
   - Generate and insert in batches

3. **Use Bulk Write Operations**
   ```javascript
   await Model.bulkWrite(operations, { ordered: false });
   ```

#### Database Indexes

Ensure indexes exist for frequently queried fields:

```javascript
// In model definition
accountId: {
  type: String,
  required: true,
  unique: true,
  index: true  // ← Important for performance
}
```

#### Connection Pool

Configure appropriate connection pool size:

```javascript
await mongoose.connect(mongoUri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

#### Monitoring Progress

The extensive seeding script provides progress updates:
```
💾 Inserting 50,000 Accounts in 50 batches...
   Inserted 1,000 / 50,000 Accounts...
   Inserted 2,000 / 50,000 Accounts...
   ...
✅ Completed inserting 50,000 Accounts
```

#### Expected Timing

Based on typical hardware:
- **Small seed (10 records)**: 1-2 seconds
- **Medium seed (1,000 records)**: 5-10 seconds
- **Large seed (100,000 records)**: 2-5 minutes
- **Extensive seed (425,000 records)**: 10-20 minutes

Actual time depends on:
- Hardware (CPU, RAM, disk speed)
- Network latency (if remote MongoDB)
- Existing data (indexes to update)
- Validation complexity

---

## Best Practices

### 1. Always Validate After Seeding

```bash
# Seed the database
npm run seed:extensive

# Validate the results
npm run seed:validate

# Run comprehensive tests
npm run test:seed-validation
```

### 2. Use Appropriate Seed for Environment

- **Development**: `npm run seed:fixed` (fast, small)
- **Testing**: `npm run seed:extensive` (complete, large)
- **Production**: `npm run seed:production` (curated, verified)

### 3. Back Up Before Large Operations

```bash
# Backup MongoDB
mongodump --uri="mongodb://localhost:27017/cat_modeling_dev" --out=./backup

# Restore if needed
mongorestore --uri="mongodb://localhost:27017/cat_modeling_dev" ./backup/cat_modeling_dev
```

### 4. Monitor During Seeding

Watch for:
- Memory usage spikes
- Disk space consumption
- Network traffic (for remote DB)
- Error messages

### 5. Version Control Seed Data

Keep seed scripts in version control:
- Track schema changes
- Review before merging
- Document seed data structure

---

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
systemctl status mongod   # Linux
sc query MongoDB           # Windows

# Test connection
mongosh mongodb://localhost:27017
```

### Out of Memory Errors

Reduce batch sizes in seeding scripts:
```javascript
const BATCH_SIZE = 500;  // Reduce from 1000
```

### Slow Performance

1. Check indexes are created
2. Reduce concurrent operations
3. Use SSD storage
4. Increase MongoDB connection pool

### Validation Script Hangs

- Increase timeout in test configuration
- Check for infinite loops in validation logic
- Verify MongoDB is responsive

---

## Summary

✅ **Seeding**: Multiple scripts for different scales  
✅ **Validation**: Automated checking and fixing  
✅ **Testing**: Comprehensive test suite  
✅ **Documentation**: This guide  
✅ **Performance**: Optimized for large-scale data  

### Quick Reference

```bash
# Seed with comprehensive fixed data
npm run seed:fixed

# Seed with extensive data (large scale)
npm run seed:extensive

# Validate and fix issues
npm run seed:validate

# Run validation tests
npm run test:seed-validation

# View validation report
cat validation-report-*.json | jq
```

---

**Last Updated**: 2025-10-28  
**Version**: 1.0.0  
**Maintained By**: CAT Modeling Development Team
