# Comprehensive End-to-End Testing Guide
## Phase 5: Exposure Management UI - Full Stack Testing

**Date:** October 5, 2025  
**Status:** ✅ Ready for Testing  
**Test Data:** 30 Exposures, 12 Locations, 7 Policies, 3 Accounts

---

## 🎯 Overview

This document provides a comprehensive testing plan for the Exposure Management UI. All TypeScript compilation errors have been resolved, test data has been seeded, and the application is ready for full end-to-end testing.

---

## ✅ Pre-Test Checklist

### 1. Backend Status
- ✅ MongoDB Running: `mongodb://localhost:27017/cat_modeling_exposure`
- ✅ Test Data Seeded: 30 exposures across 3 accounts
- ⚠️ Backend Server: Start with `npm start` (port 3001)

### 2. Frontend Status
- ✅ All TypeScript Errors Fixed: 0 compilation errors
- ✅ Redux Integration: All dispatch type issues resolved
- ⚠️ Frontend Dev Server: Already running on port 3000

### 3. Test Data Available
```
Accounts: 3
├─ ACC-000001: Global Insurance Corp (Medium Risk)
├─ ACC-000002: Property Management LLC (Low Risk)
└─ ACC-000003: Manufacturing International (High Risk)

Locations: 12
├─ 3-5 locations per account
├─ Distributed across North America, Europe, Asia Pacific
└─ Various occupancy types (Office, Manufacturing, Warehouse, etc.)

Exposures: 30
├─ Property: ~25 exposures
├─ Various types, occupancies, constructions
├─ TIV range: $500K - $75M
├─ Multiple statuses: Active, Inactive, Under Review
└─ Multiple peril types: Earthquake, Fire, Flood, Windstorm, etc.
```

---

## 🧪 Test Scenarios

### Test 1: Exposure List View (**HIGH PRIORITY**)

#### Objective
Verify that the Exposure List displays all seeded data correctly with proper formatting, sorting, and pagination.

#### Test Steps
1. **Open Browser**
   ```
   URL: http://localhost:3000/exposures
   ```

2. **Verify Initial Load**
   - [ ] Page loads without errors
   - [ ] DataGrid displays with data
   - [ ] Shows "Showing X-Y of 30 results"
   - [ ] Default sort: Most recent first
   - [ ] Columns display correctly:
     - Exposure ID (clickable link)
     - Type
     - Account ID
     - Location ID
     - TIV (formatted with currency)
     - Status (with color chip)
     - Policy Number
     - Actions (View, Edit, Delete icons)

3. **Verify Data Formatting**
   - [ ] Currency values formatted: `$25,000,000`
   - [ ] Status chips color-coded:
     - Active: Green
     - Inactive: Gray
     - Under Review: Orange
   - [ ] Dates formatted consistently
   - [ ] IDs displayed in monospace font

4. **Test Pagination**
   - [ ] Default: 10 rows per page
   - [ ] Change to 25 rows per page → List updates
   - [ ] Change to 50 rows per page → List updates
   - [ ] Navigate to Page 2 → Shows next set
   - [ ] Navigate back to Page 1 → Shows first set

5. **Test Column Sorting**
   - [ ] Click "TIV" column → Sort ascending
   - [ ] Click "TIV" again → Sort descending
   - [ ] Verify highest value: ~$75M (Manufacturing)
   - [ ] Verify lowest value: ~$500K-$1M

6. **Test Row Selection**
   - [ ] Click checkbox on row → Row selected
   - [ ] Click multiple checkboxes → Multiple selected
   - [ ] Click header checkbox → All visible rows selected
   - [ ] Selected count shows: "X selected"
   - [ ] Bulk delete button appears when rows selected

---

### Test 2: Filter Functionality (**HIGH PRIORITY**)

#### Objective
Verify all 9 filter types work correctly and update results in real-time.

#### Test Steps
1. **Open Filters Panel**
   - [ ] Click "Filters" button in toolbar
   - [ ] Drawer slides in from right
   - [ ] Shows all 9 filter fields

2. **Test Text Search Filter**
   - [ ] Enter "ACC-000001" in search box
   - [ ] Click "Apply Filters"
   - [ ] Results filter to only exposures for ACC-000001
   - [ ] Count updates correctly
   - [ ] Active filter chip appears above grid

3. **Test Exposure Type Filter**
   - [ ] Clear existing filters
   - [ ] Select "Property" from Type dropdown
   - [ ] Click "Apply Filters"
   - [ ] Only Property exposures shown (~25 results)
   - [ ] Filter chip shows "Type: Property"

4. **Test Occupancy Type Filter**
   - [ ] Add "Office" to Occupancy filter
   - [ ] Click "Apply Filters"
   - [ ] Results narrow further (Property + Office)
   - [ ] Multiple filter chips visible

5. **Test Construction Type Filter**
   - [ ] Select "Steel" from Construction
   - [ ] Apply filters
   - [ ] Results show: Property + Office + Steel
   - [ ] Verify construction types match

6. **Test Status Filter**
   - [ ] Select "Active" from Status
   - [ ] Apply filters
   - [ ] Only Active exposures shown
   - [ ] Status chips all show green

7. **Test Value Range Filter**
   - [ ] Clear all filters
   - [ ] Enter Min: $1,000,000
   - [ ] Enter Max: $10,000,000
   - [ ] Apply filters
   - [ ] All results have TIV between $1M-$10M
   - [ ] Verify no values outside range

8. **Test Year Built Filter**
   - [ ] Clear all filters
   - [ ] Enter Min Year: 2015
   - [ ] Enter Max Year: 2025
   - [ ] Apply filters
   - [ ] Results show only modern buildings

9. **Test Number of Stories Filter**
   - [ ] Enter Min Stories: 10
   - [ ] Apply filters
   - [ ] Results show only tall buildings (10+ stories)

10. **Test Multiple Filters Combined**
    - [ ] Apply: Type=Property + Status=Active + Min TIV=$5M
    - [ ] Results show intersection of all filters
    - [ ] Verify all conditions met simultaneously

11. **Test Clear Filters**
    - [ ] Click "Clear All" button
    - [ ] All filters reset
    - [ ] Results return to full list (30 exposures)
    - [ ] All filter chips removed

12. **Test Remove Individual Filter**
    - [ ] Apply multiple filters
    - [ ] Click X on one filter chip
    - [ ] That filter removed, others remain
    - [ ] Results update accordingly

---

### Test 3: Exposure Detail View (**HIGH PRIORITY**)

#### Objective
Verify the detail page shows all information across 5 tabs correctly.

#### Test Steps
1. **Navigate to Detail Page**
   - [ ] Click on any exposure ID link in list
   - [ ] Detail page loads at `/exposures/:id`
   - [ ] Header shows exposure ID and type

2. **Verify Tab 1: Overview**
   - [ ] Basic Information section displays:
     - Exposure ID
     - Exposure Type
     - Status (with chip)
     - Account ID
     - Policy Number
     - Location ID
   - [ ] Financial Information displays:
     - Total Insured Value (formatted)
     - Building Value
     - Contents Value
     - Business Interruption Value
     - Currency
   - [ ] Property Details displays:
     - Occupancy Type
     - Construction Type
     - Year Built
     - Number of Stories
     - Total Area (sq ft)
   - [ ] All fields populated correctly
   - [ ] No undefined or null values shown

3. **Verify Tab 2: Location & Coordinates**
   - [ ] Click "Location" tab
   - [ ] Location Information displays:
     - Location Name
     - Coordinates (lat, lng)
     - Address (if available)
   - [ ] Map component loads (if implemented)
   - [ ] Coordinates formatted correctly (decimal degrees)

4. **Verify Tab 3: Perils & Risk**
   - [ ] Click "Perils" tab
   - [ ] Perils list displays in table:
     - Peril Type
     - Exposure Amount
     - Deductible
   - [ ] Multiple perils shown (e.g., Earthquake, Fire, Flood)
   - [ ] Values formatted with currency
   - [ ] If no perils: Shows "No perils data"

5. **Verify Tab 4: Policy Details**
   - [ ] Click "Policy" tab
   - [ ] Policy information displays:
     - Policy Number
     - Policy Name
     - Effective Date
     - Expiry Date
     - Status
   - [ ] Dates formatted consistently
   - [ ] Link to policy details (if implemented)

6. **Verify Tab 5: Audit Trail**
   - [ ] Click "History" tab
   - [ ] Audit information displays:
     - Created By
     - Created Date
     - Last Modified By
     - Last Modified Date
   - [ ] Dates include time
   - [ ] Shows "seed-script" as creator

7. **Test Navigation**
   - [ ] Click "Back to List" button
   - [ ] Returns to exposure list
   - [ ] Previous filters/pagination preserved (if applicable)

8. **Test Actions from Detail Page**
   - [ ] "Edit" button present (navigate to edit form)
   - [ ] "Delete" button present (opens confirmation dialog)
   - [ ] "Export" button present (triggers PDF/CSV export)

---

### Test 4: Create Exposure Flow (**CRITICAL**)

#### Objective
Verify the 4-step multi-step form works correctly and creates new exposures.

#### Test Steps
1. **Navigate to Create Form**
   - [ ] Click "New Exposure" button in list toolbar
   - [ ] Form loads at `/exposures/new`
   - [ ] Stepper shows 4 steps:
     1. Basic Information
     2. Financial Details
     3. Property Details
     4. Perils

2. **Step 1: Basic Information**
   - [ ] All fields visible:
     - Exposure Type (dropdown)
     - Account ID (dropdown with 3 accounts)
     - Policy Number (dropdown with 7 policies)
     - Location ID (dropdown with 12 locations)
     - Status (dropdown)
   - [ ] Fill in all required fields
   - [ ] Click "Next"
   - [ ] Validation: Cannot proceed if required fields empty
   - [ ] Progress stepper updates to step 2

3. **Step 2: Financial Details**
   - [ ] Fields visible:
     - Total Insured Value (number input)
     - Replacement Value (number input)
     - Currency (dropdown)
     - Building Value (number input)
     - Contents Value (number input)
     - Business Interruption Value (number input)
   - [ ] Enter realistic values (e.g., TIV = $5,000,000)
   - [ ] Validation: Numbers > 0
   - [ ] Validation: Building + Contents + BI ≤ TIV (if implemented)
   - [ ] Click "Next"
   - [ ] Progress stepper updates to step 3

4. **Step 3: Property Details**
   - [ ] Fields visible:
     - Occupancy Type (dropdown)
     - Construction Type (dropdown)
     - Year Built (number input, 1800-2025)
     - Number of Stories (number input)
     - Total Area (number input)
   - [ ] Select values from dropdowns
   - [ ] Enter numeric values
   - [ ] Validation: Year Built < current year
   - [ ] Validation: Stories > 0
   - [ ] Click "Next"
   - [ ] Progress stepper updates to step 4

5. **Step 4: Perils**
   - [ ] Perils section displays
   - [ ] "Add Peril" button visible
   - [ ] Click "Add Peril"
     - [ ] Peril selector appears
     - [ ] Select "Earthquake"
     - [ ] Enter Exposure Amount: $5,000,000
     - [ ] Enter Deductible: $50,000
     - [ ] Click "Add"
     - [ ] Peril added to list
   - [ ] Add 2-3 more perils (Fire, Flood)
   - [ ] Verify all perils listed in table
   - [ ] Test "Remove Peril" button
   - [ ] Re-add removed peril

6. **Submit Form**
   - [ ] Click "Create Exposure" button
   - [ ] Loading indicator appears
   - [ ] Success toast notification: "Exposure created successfully!"
   - [ ] Redirect to exposure list
   - [ ] New exposure appears in list (refresh if needed)

7. **Verify Created Exposure**
   - [ ] Find new exposure in list
   - [ ] Click to view details
   - [ ] All entered data displayed correctly
   - [ ] All tabs show correct information

8. **Test Form Validation**
   - [ ] Start new create form
   - [ ] Try to proceed without filling required fields
   - [ ] Error messages appear
   - [ ] Cannot proceed to next step
   - [ ] Fill fields correctly
   - [ ] Errors clear, can proceed

9. **Test Back Navigation**
   - [ ] In step 3, click "Back"
   - [ ] Returns to step 2
   - [ ] Previously entered data preserved
   - [ ] Click "Next" again
   - [ ] Data still there, no loss

10. **Test Cancel**
    - [ ] Click "Cancel" button
    - [ ] Confirmation dialog appears
    - [ ] Click "Yes, Cancel"
    - [ ] Returns to list
    - [ ] No exposure created

---

### Test 5: Edit Exposure (**IMPORTANT**)

#### Objective
Verify that existing exposures can be edited and changes persist.

#### Test Steps
1. **Navigate to Edit Form**
   - [ ] From list, click "Edit" icon on an exposure
   - [ ] Edit form loads with existing data pre-filled
   - [ ] Form looks similar to Create form

2. **Modify Fields**
   - [ ] Change Status from "Active" to "Under Review"
   - [ ] Change Total Insured Value (e.g., increase by $1M)
   - [ ] Change Number of Stories
   - [ ] Modify one peril's deductible

3. **Save Changes**
   - [ ] Click "Save Changes" button
   - [ ] Loading indicator appears
   - [ ] Success toast: "Exposure updated successfully!"
   - [ ] Returns to list or detail view

4. **Verify Changes**
   - [ ] Navigate back to exposure detail
   - [ ] Status shows "Under Review" with orange chip
   - [ ] TIV shows updated value
   - [ ] Number of Stories updated
   - [ ] Peril deductible updated
   - [ ] "Last Modified Date" updated to now

5. **Test Validation on Edit**
   - [ ] Try to save invalid data (e.g., negative TIV)
   - [ ] Error message appears
   - [ ] Cannot save until fixed

---

### Test 6: Delete Operations (**IMPORTANT**)

#### Objective
Verify single and batch delete operations work correctly.

#### Test Steps
1. **Single Delete from Detail Page**
   - [ ] Navigate to an exposure detail page
   - [ ] Click "Delete" button
   - [ ] Confirmation dialog appears:
     - Title: "Delete Exposure?"
     - Message: "Are you sure you want to delete this exposure? This action cannot be undone."
     - Buttons: "Cancel", "Delete"
   - [ ] Click "Cancel" → Dialog closes, nothing deleted
   - [ ] Click "Delete" again
   - [ ] Click "Delete" in dialog
   - [ ] Loading indicator appears
   - [ ] Success toast: "Exposure deleted successfully"
   - [ ] Redirects to list
   - [ ] Deleted exposure no longer in list

2. **Single Delete from List**
   - [ ] In list view, click "Delete" icon on a row
   - [ ] Same confirmation dialog appears
   - [ ] Click "Delete"
   - [ ] Row removed from table
   - [ ] Count decrements (e.g., 30 → 29)

3. **Batch Delete**
   - [ ] Select 3 exposures using checkboxes
   - [ ] "Bulk Delete" button appears in toolbar
   - [ ] Shows "Delete 3 selected"
   - [ ] Click "Bulk Delete"
   - [ ] Confirmation dialog: "Delete 3 exposures?"
   - [ ] Click "Delete"
   - [ ] Loading indicator appears
   - [ ] Success toast: "3 exposures deleted successfully"
   - [ ] All 3 rows removed
   - [ ] Selection cleared
   - [ ] Count updates (e.g., 29 → 26)

4. **Test Delete with API Error** (if possible)
   - [ ] Attempt to delete non-existent exposure
   - [ ] Error toast appears with message
   - [ ] List doesn't change
   - [ ] No crashes

---

### Test 7: Search and Filters Integration (**MEDIUM**)

#### Objective
Verify search and filters work together correctly.

#### Test Steps
1. **Search + Filter Combination**
   - [ ] Enter search term: "ACC-000001"
   - [ ] Add filter: Status = Active
   - [ ] Apply
   - [ ] Results show: Account ACC-000001 AND Status Active
   - [ ] Verify intersection logic

2. **Test Filter Chips**
   - [ ] Multiple filters applied
   - [ ] Each filter shown as a chip above table
   - [ ] Click X on search chip → Search removed, filter remains
   - [ ] Click X on filter chip → Filter removed, search remains

3. **Test URL Parameters** (if implemented)
   - [ ] Apply filters
   - [ ] Copy URL from browser
   - [ ] Open URL in new tab
   - [ ] Same filters applied automatically
   - [ ] Results match

---

### Test 8: Responsive Design (**MEDIUM**)

#### Objective
Verify UI works on different screen sizes.

#### Test Steps
1. **Desktop View (1920x1080)**
   - [ ] All columns visible
   - [ ] No horizontal scrolling
   - [ ] Filters panel full width

2. **Tablet View (768px)**
   - [ ] Columns adjust or hide less important ones
   - [ ] Table still functional
   - [ ] Filters panel responsive

3. **Mobile View (375px)**
   - [ ] Table switches to card view (if implemented)
   - [ ] OR horizontal scroll enabled
   - [ ] Filters panel full screen overlay
   - [ ] Touch-friendly buttons

---

### Test 9: Performance (**MEDIUM**)

#### Objective
Verify UI performs well with 30+ records.

#### Test Steps
1. **Initial Load**
   - [ ] List loads in < 2 seconds
   - [ ] No lag when scrolling

2. **Filter Performance**
   - [ ] Filtering completes in < 1 second
   - [ ] No UI freeze

3. **Pagination**
   - [ ] Page changes instant (< 500ms)
   - [ ] Smooth transitions

---

### Test 10: Error Handling (**LOW**)

#### Objective
Verify app handles errors gracefully.

#### Test Steps
1. **Test Network Error**
   - [ ] Stop backend server
   - [ ] Try to load exposure list
   - [ ] Error message appears (not crash)
   - [ ] "Retry" button available

2. **Test Validation Errors**
   - [ ] Create form with invalid data
   - [ ] API returns 400 error
   - [ ] Error toast shows specific message
   - [ ] Form stays open, data preserved

3. **Test 404 Error**
   - [ ] Navigate to `/exposures/INVALID-ID`
   - [ ] 404 page or error message appears
   - [ ] Option to return to list

---

## 📊 Expected Results Summary

| Test Area | Total Tests | Expected Pass | Critical |
|-----------|-------------|---------------|----------|
| Exposure List | 15 | 15 | ✅ Yes |
| Filters | 12 | 12 | ✅ Yes |
| Detail View | 20 | 20 | ✅ Yes |
| Create Flow | 15 | 15 | ⚠️ Critical |
| Edit Flow | 8 | 8 | ⚠️ Important |
| Delete Operations | 10 | 10 | ⚠️ Important |
| Search Integration | 5 | 5 | Medium |
| Responsive Design | 8 | 8 | Medium |
| Performance | 6 | 6 | Medium |
| Error Handling | 6 | 6 | Low |
| **TOTAL** | **105** | **105** | **100%** |

---

## 🚀 Testing Execution

### Step-by-Step Execution Plan

1. **Start Services** (5 minutes)
   ```bash
   # Terminal 1: Start Backend
   npm start
   
   # Terminal 2: Frontend already running
   # http://localhost:3000
   ```

2. **Verify Data Availability** (2 minutes)
   - Open browser dev tools (F12)
   - Navigate to Network tab
   - Go to http://localhost:3000/exposures
   - Check API call to `/api/v1/exposures`
   - Verify 200 status and data returned

3. **Execute Test Scenarios** (60-90 minutes)
   - Follow each test scenario in order
   - Check off items as you complete them
   - Note any failures or unexpected behavior
   - Take screenshots of key features

4. **Document Results** (15 minutes)
   - Record pass/fail for each test
   - Note any bugs found
   - Capture screenshots/videos
   - Write summary report

---

## 📝 Test Data Reference

### Sample Exposure IDs to Use
```
EXP-00000001 through EXP-00000030
```

### Sample Account IDs
```
ACC-000001 - Global Insurance Corp (Medium Risk)
ACC-000002 - Property Management LLC (Low Risk)
ACC-000003 - Manufacturing International (High Risk)
```

### Sample Location IDs
```
LOC-00000001 through LOC-00000012
```

### Sample Policy Numbers
```
POL-00000001 through POL-00000007
```

---

## 🐛 Known Issues

### Fixed
- ✅ All TypeScript compilation errors resolved
- ✅ Redux dispatch type errors fixed (27 errors → 0)
- ✅ Type definitions aligned with backend models
- ✅ Property access errors corrected

### Cosmetic (Non-Blocking)
- ⚠️ ESLint warnings about `any` types (24 warnings)
  - These are style suggestions, not errors
  - App compiles and runs successfully
- ⚠️ Unused import warnings (InfoIcon, handleDelete)
  - Can be cleaned up later
- ⚠️ Console.log statements in code
  - For debugging, can remove in production

---

## ✅ Success Criteria

The E2E testing is considered successful when:

1. **All Critical Tests Pass (100%)**
   - Exposure List displays all 30 exposures ✓
   - Filters work correctly and update results ✓
   - Detail view shows all data across 5 tabs ✓
   - Create exposure completes successfully ✓
   - Edit exposure saves changes ✓
   - Delete operations work (single & batch) ✓

2. **No Data Loss**
   - All created/edited exposures persist
   - Filter states preserved
   - Navigation doesn't lose data

3. **No Crashes**
   - App remains stable throughout testing
   - All errors handled gracefully
   - No console errors (except warnings)

4. **User Experience**
   - UI responsive and performant
   - Loading indicators appear
   - Success/error messages clear
   - Navigation intuitive

---

## 📸 Evidence Collection

During testing, collect the following evidence:

1. **Screenshots:**
   - Exposure list with 30 records
   - Applied filters with chips
   - Each tab of detail view
   - Create form all 4 steps
   - Success toast notifications
   - Delete confirmation dialog

2. **Videos** (Optional):
   - Complete create exposure flow
   - Filter application and removal
   - Batch delete operation

3. **Browser Dev Tools:**
   - Network tab showing API calls
   - Console with no errors
   - Redux DevTools state (if installed)

---

## 🎯 Next Steps After Testing

Once E2E testing is complete:

1. **Document Results**
   - Create test report with pass/fail rates
   - List any bugs found
   - Note any UX improvements

2. **Bug Fixes** (if any)
   - Prioritize critical bugs
   - Fix and retest
   - Verify fixes don't break other features

3. **Performance Optimization** (if needed)
   - Analyze slow areas
   - Optimize API calls
   - Add caching if needed

4. **User Acceptance Testing**
   - Demo to stakeholders
   - Gather feedback
   - Iterate based on feedback

5. **Deployment Preparation**
   - Remove console.logs
   - Clean up ESLint warnings
   - Optimize production build
   - Prepare deployment scripts

---

## 📞 Support

If you encounter issues during testing:

1. **Check Browser Console** - Look for JavaScript errors
2. **Check Network Tab** - Verify API calls are successful
3. **Check Backend Logs** - Look for server-side errors
4. **Verify Data** - Run `node tests/quick-e2e-api-test.js`
5. **Restart Services** - Stop and restart backend/frontend

---

**Testing Status:** 🟢 Ready to Execute  
**Confidence Level:** 🟢 High (All TypeScript errors resolved, data seeded)  
**Estimated Testing Time:** 90-120 minutes  
**Priority:** ⚠️ **CRITICAL** - Full Stack Integration Validation

---

*Document Version: 1.0*  
*Last Updated: October 5, 2025*  
*Author: AI Development Assistant*
