# Phase 5 - Manual Testing Checklist
## Exposure Management UI - Comprehensive E2E Verification

**Test Date:** _____________  
**Tester Name:** _____________  
**Environment:** Frontend: http://localhost:3000 | Backend: http://localhost:3001  
**Database:** MongoDB (localhost:27017/cat_modeling_exposure)

---

## Prerequisites

- [ ] Backend server is running (`node src/index.js`)
- [ ] Frontend dev server is running (`cd frontend && npm start`)
- [ ] MongoDB is running and accessible
- [ ] Database has seed data loaded
- [ ] Browser DevTools console is open (for error monitoring)
- [ ] Network tab is open (for API call monitoring)

---

## Test Section 1: CREATE WORKFLOW (ExposureCreate Multi-Step Form)

### 1.1 Navigation to Create Form
- [ ] Navigate to **Exposures** page from main navigation
- [ ] Click **"+ New Exposure"** button
- [ ] Verify URL changes to `/exposures` with view state
- [ ] Verify breadcrumb shows: Home > Exposures > Create New
- [ ] Verify form header displays: "Create New Exposure"
- [ ] Verify stepper shows 4 steps: Basic Info, Location Details, Coverage Details, Review

**Expected Result:** Form loads with Step 1 active, all navigation elements visible  
**Actual Result:** _____________  
**Pass/Fail:** _____________

---

### 1.2 Step 1: Basic Information

#### 1.2.1 Field Presence
- [ ] Exposure Type (Select dropdown)
- [ ] Status (Select dropdown)
- [ ] Account ID (Text input)
- [ ] Policy ID (Text input)
- [ ] Location ID (Text input)
- [ ] Effective Date (Date picker)
- [ ] Expiry Date (Date picker)
- [ ] Info alert about ID format requirements

**Pass/Fail:** _____________

#### 1.2.2 Exposure Type Field
- [ ] Click dropdown
- [ ] Verify options: Property, Casualty, Liability, Marine, Aviation, Cyber
- [ ] Select "Property"
- [ ] Verify selection displays correctly

**Pass/Fail:** _____________

#### 1.2.3 Status Field
- [ ] Click dropdown
- [ ] Verify options: Active, Inactive, Expired, Under Review, Pending
- [ ] Select "Active"
- [ ] Verify selection displays correctly

**Pass/Fail:** _____________

#### 1.2.4 Account ID Validation
- [ ] Enter invalid format: "ABC123"
- [ ] Click Next button
- [ ] Verify error message: "Format: ACC-XXXXXXXX (ACC- followed by 8 digits)"
- [ ] Clear and enter valid format: "ACC-12345678"
- [ ] Verify error clears
- [ ] Verify field shows green checkmark or no error

**Pass/Fail:** _____________

#### 1.2.5 Policy ID Validation
- [ ] Enter invalid format: "POL123"
- [ ] Click Next button
- [ ] Verify error message: "Format: POL-XXXXXXXX (POL- followed by 8 digits)"
- [ ] Clear and enter valid format: "POL-87654321"
- [ ] Verify error clears

**Pass/Fail:** _____________

#### 1.2.6 Location ID Validation
- [ ] Enter invalid format: "LOC-ABC"
- [ ] Click Next button
- [ ] Verify error message: "Format: LOC-XXXXXXXX (LOC- followed by 8 digits)"
- [ ] Clear and enter valid format: "LOC-11223344"
- [ ] Verify error clears

**Pass/Fail:** _____________

#### 1.2.7 Date Fields
- [ ] Click Effective Date picker
- [ ] Select date: January 1, 2025
- [ ] Verify date displays correctly
- [ ] Click Expiry Date picker (optional)
- [ ] Select date: December 31, 2025
- [ ] Verify date displays correctly
- [ ] Verify expiry is after effective date

**Pass/Fail:** _____________

#### 1.2.8 Step 1 Navigation
- [ ] Leave required fields empty
- [ ] Click "Next" button
- [ ] Verify error messages appear on empty fields
- [ ] Fill all required fields with valid data
- [ ] Click "Next" button
- [ ] Verify navigation to Step 2
- [ ] Verify Step 1 marked as complete in stepper

**Pass/Fail:** _____________

---

### 1.3 Step 2: Location Details

#### 1.3.1 Field Presence
- [ ] Latitude (Number input)
- [ ] Longitude (Number input)
- [ ] Occupancy Type (Select dropdown)
- [ ] Construction Type (Select dropdown)
- [ ] Year Built (Number input - optional)
- [ ] Number of Stories (Number input - optional)
- [ ] Square Footage (Number input - optional)
- [ ] Info alert about coordinate ranges

**Pass/Fail:** _____________

#### 1.3.2 Latitude Validation
- [ ] Enter value: 95.0 (invalid: > 90)
- [ ] Verify error: "Latitude must be between -90 and 90"
- [ ] Enter value: -95.0 (invalid: < -90)
- [ ] Verify error appears
- [ ] Enter valid value: 34.0522 (Los Angeles)
- [ ] Verify error clears

**Pass/Fail:** _____________

#### 1.3.3 Longitude Validation
- [ ] Enter value: 185.0 (invalid: > 180)
- [ ] Verify error: "Longitude must be between -180 and 180"
- [ ] Enter value: -200.0 (invalid: < -180)
- [ ] Verify error appears
- [ ] Enter valid value: -118.2437 (Los Angeles)
- [ ] Verify error clears

**Pass/Fail:** _____________

#### 1.3.4 Occupancy Type Field
- [ ] Click dropdown
- [ ] Verify options: Residential, Commercial, Industrial, Mixed Use, Institutional, Agricultural
- [ ] Select "Commercial"
- [ ] Verify selection displays correctly

**Pass/Fail:** _____________

#### 1.3.5 Construction Type Field
- [ ] Click dropdown
- [ ] Verify options: Wood, Concrete, Steel, Masonry, Mixed
- [ ] Select "Concrete"
- [ ] Verify selection displays correctly

**Pass/Fail:** _____________

#### 1.3.6 Optional Fields
- [ ] Enter Year Built: 2015
- [ ] Verify accepts 4-digit year
- [ ] Enter Number of Stories: 5
- [ ] Verify accepts positive integer
- [ ] Enter Square Footage: 50000
- [ ] Verify accepts positive number
- [ ] All optional fields display correctly

**Pass/Fail:** _____________

#### 1.3.7 Step 2 Navigation
- [ ] Click "Back" button
- [ ] Verify returns to Step 1
- [ ] Verify Step 1 data is preserved
- [ ] Click "Next" to return to Step 2
- [ ] Verify Step 2 data is preserved
- [ ] Fill all required fields
- [ ] Click "Next" button
- [ ] Verify navigation to Step 3

**Pass/Fail:** _____________

---

### 1.4 Step 3: Coverage Details

#### 1.4.1 Base Field Presence
- [ ] Currency (Select dropdown)
- [ ] Total Insured Value (Number input with $ prefix)
- [ ] Replacement Value (Number input with $ prefix)
- [ ] Peril Exposures section with "Add Peril" button
- [ ] Info alert about TIV calculation

**Pass/Fail:** _____________

#### 1.4.2 Currency Field
- [ ] Click dropdown
- [ ] Verify options include: USD, EUR, GBP, JPY, CAD, AUD
- [ ] Select "USD"
- [ ] Verify selection displays correctly

**Pass/Fail:** _____________

#### 1.4.3 Total Insured Value
- [ ] Enter value: 5000000
- [ ] Verify displays as: $5,000,000 or 5000000
- [ ] Verify required field validation
- [ ] Enter negative value: -1000
- [ ] Verify error: "Must be a positive number"
- [ ] Enter valid value: 5000000

**Pass/Fail:** _____________

#### 1.4.4 Replacement Value
- [ ] Enter value: 6000000
- [ ] Verify displays correctly
- [ ] Verify optional field (can be left empty)

**Pass/Fail:** _____________

#### 1.4.5 Add First Peril
- [ ] Click "Add Peril" button
- [ ] Verify new peril card appears
- [ ] Verify card contains:
  - Peril Type dropdown
  - Exposure Amount input
  - Deductible input
  - Remove button (X icon)

**Pass/Fail:** _____________

#### 1.4.6 Peril Type Dropdown
- [ ] Click Peril Type dropdown in first card
- [ ] Verify options: Earthquake, Flood, Wildfire, Hurricane, Tornado, Hail, Windstorm
- [ ] Select "Earthquake"
- [ ] Verify selection displays correctly

**Pass/Fail:** _____________

#### 1.4.7 Peril Exposure Amount
- [ ] Enter value: 3000000
- [ ] Verify required field validation
- [ ] Verify positive number validation
- [ ] Check if TIV warning appears when sum > TIV

**Pass/Fail:** _____________

#### 1.4.8 Peril Deductible
- [ ] Enter value: 250000
- [ ] Verify required field validation
- [ ] Verify positive number validation

**Pass/Fail:** _____________

#### 1.4.9 Add Multiple Perils
- [ ] Click "Add Peril" button again
- [ ] Select "Wildfire", Amount: 2000000, Deductible: 150000
- [ ] Click "Add Peril" button again
- [ ] Select "Flood", Amount: 1500000, Deductible: 100000
- [ ] Verify all 3 peril cards display correctly
- [ ] Verify each has independent values

**Pass/Fail:** _____________

#### 1.4.10 Remove Peril
- [ ] Click Remove (X) button on second peril (Wildfire)
- [ ] Verify peril card is removed
- [ ] Verify remaining perils stay intact
- [ ] Verify 2 perils remain

**Pass/Fail:** _____________

#### 1.4.11 TIV Consistency Check
- [ ] Calculate sum of peril exposure amounts
- [ ] Compare to Total Insured Value
- [ ] If sum > TIV, verify warning message appears
- [ ] If sum ≤ TIV, verify no warning

**Pass/Fail:** _____________

#### 1.4.12 Step 3 Navigation
- [ ] Click "Back" button
- [ ] Verify returns to Step 2
- [ ] Click "Next" to return to Step 3
- [ ] Verify all peril data is preserved
- [ ] Fill all required fields
- [ ] Click "Next" button
- [ ] Verify navigation to Step 4 (Review)

**Pass/Fail:** _____________

---

### 1.5 Step 4: Review & Submit

#### 1.5.1 Basic Information Card
- [ ] Verify card displays: "Basic Information"
- [ ] Verify Exposure Type chip shows: "Property"
- [ ] Verify Status chip shows: "Active" with green color
- [ ] Verify Account ID: ACC-12345678
- [ ] Verify Policy ID: POL-87654321
- [ ] Verify Location ID: LOC-11223344
- [ ] Verify Effective Date: formatted correctly
- [ ] Verify Expiry Date: formatted correctly (if provided)

**Pass/Fail:** _____________

#### 1.5.2 Location Details Card
- [ ] Verify card displays: "Location Details"
- [ ] Verify Coordinates: formatted to 6 decimals (e.g., 34.052200, -118.243700)
- [ ] Verify Occupancy Type: Commercial
- [ ] Verify Construction Type: Concrete
- [ ] Verify Year Built: 2015 (if provided)
- [ ] Verify Stories: 5 (if provided)
- [ ] Verify Square Footage: 50,000 sq ft (if provided)

**Pass/Fail:** _____________

#### 1.5.3 Coverage Details Card
- [ ] Verify card displays: "Coverage Details"
- [ ] Verify Currency: USD
- [ ] Verify Total Insured Value: $5,000,000 (with commas)
- [ ] Verify Replacement Value: $6,000,000 (with commas)
- [ ] Verify Peril Exposures section lists all perils
- [ ] Verify each peril chip shows: "Peril: $Amount"
- [ ] Verify deductibles display: "(Ded: $Amount)"

**Pass/Fail:** _____________

#### 1.5.4 Review Accuracy
- [ ] Compare all displayed data with entered values
- [ ] Verify no data loss or corruption
- [ ] Verify all formatting is correct
- [ ] Verify all chips and badges display properly

**Pass/Fail:** _____________

#### 1.5.5 Edit Functionality
- [ ] Click "Back" button
- [ ] Verify returns to Step 3
- [ ] Make a change (e.g., add another peril)
- [ ] Click "Next" to return to Step 4
- [ ] Verify change is reflected in review
- [ ] Navigate through all steps to verify data preservation

**Pass/Fail:** _____________

#### 1.5.6 Save as Draft
- [ ] Click "Save as Draft" button
- [ ] Verify toast notification appears
- [ ] Verify message indicates draft saved
- [ ] **Note:** Check implementation (localStorage or backend)

**Pass/Fail:** _____________

#### 1.5.7 Cancel Functionality
- [ ] Click "Cancel" button in header
- [ ] Verify navigation returns to Exposures list
- [ ] Verify no data was submitted
- [ ] Navigate back to create form
- [ ] Verify form is reset (empty)

**Pass/Fail:** _____________

#### 1.5.8 Submit Exposure
- [ ] Fill complete form again (or use draft)
- [ ] Navigate to Step 4
- [ ] Open Browser DevTools Network tab
- [ ] Click "Create Exposure" button
- [ ] Monitor network request:
  - [ ] Verify POST request to `/api/v1/exposures`
  - [ ] Verify request payload contains all form data
  - [ ] Verify response status: 200 or 201
  - [ ] Verify response contains created exposure with `_id`
- [ ] Verify success toast notification appears
- [ ] Verify message: "Exposure created successfully"
- [ ] Verify navigation to Exposures list page
- [ ] Verify new exposure appears in list

**Pass/Fail:** _____________

**Notes:** _____________________________________________________________

---

## Test Section 2: READ WORKFLOW (ExposureList & ExposureDetail)

### 2.1 Exposures List View

#### 2.1.1 Page Load
- [ ] Navigate to Exposures page
- [ ] Verify page title: "Exposure Management"
- [ ] Verify breadcrumb: Home > Exposures
- [ ] Verify "New Exposure" button visible
- [ ] Verify "Filters" toggle button visible
- [ ] Verify DataGrid loads
- [ ] Verify loading spinner appears during data fetch

**Pass/Fail:** _____________

#### 2.1.2 DataGrid Columns
Verify all 9 columns are present and display data:
- [ ] Exposure ID (left-aligned)
- [ ] Account ID
- [ ] Location ID
- [ ] Type (with chip)
- [ ] Occupancy (with chip)
- [ ] Construction (with chip)
- [ ] TIV (currency formatted)
- [ ] Status (with colored chip)
- [ ] Actions (View/Delete buttons)

**Pass/Fail:** _____________

#### 2.1.3 Data Display
- [ ] Verify at least one row displays (created exposure)
- [ ] Verify Exposure ID is clickable
- [ ] Verify TIV shows currency symbol and comma formatting
- [ ] Verify status chip has appropriate color:
  - Active: green
  - Inactive: gray
  - Expired: red
  - Under Review: orange
  - Pending: blue
- [ ] Verify chips display correctly for Type, Occupancy, Construction

**Pass/Fail:** _____________

#### 2.1.4 Pagination
- [ ] Verify pagination controls at bottom of grid
- [ ] Verify "Rows per page" dropdown (10, 25, 50, 100)
- [ ] Change rows per page to 25
- [ ] Verify grid updates
- [ ] If multiple pages exist:
  - [ ] Click Next page
  - [ ] Verify page updates
  - [ ] Click Previous page
  - [ ] Verify returns to page 1

**Pass/Fail:** _____________

#### 2.1.5 Sorting
- [ ] Click "Exposure ID" column header
- [ ] Verify sort icon appears (up or down arrow)
- [ ] Verify data sorts alphabetically
- [ ] Click again to reverse sort
- [ ] Click "TIV" column header
- [ ] Verify data sorts numerically
- [ ] Test sorting on "Status" and "Type" columns

**Pass/Fail:** _____________

#### 2.1.6 Row Selection
- [ ] Click checkbox on first row
- [ ] Verify row is selected (highlighted)
- [ ] Verify selection count updates
- [ ] Click "Select All" checkbox in header
- [ ] Verify all visible rows selected
- [ ] Verify bulk action button appears (e.g., "Delete Selected")
- [ ] Click "Select All" again to deselect
- [ ] Verify all rows deselected

**Pass/Fail:** _____________

#### 2.1.7 View Action
- [ ] Locate created test exposure in list
- [ ] Click "View" (eye icon) button in Actions column
- [ ] Verify navigation to detail page
- [ ] Verify URL changes to `/exposures/{id}`
- [ ] Verify detail page loads with correct data

**Pass/Fail:** _____________

---

### 2.2 Exposure Detail View

#### 2.2.1 Page Load
- [ ] Verify breadcrumb: Home > Exposures > [Exposure ID]
- [ ] Verify page title shows Exposure ID or Display Name
- [ ] Verify action buttons in header:
  - [ ] Edit (pencil icon)
  - [ ] Delete (trash icon)
  - [ ] Export (download icon)
  - [ ] Back (arrow icon)
- [ ] Verify 5 tabs are present:
  - Overview
  - Hazard Assessment
  - Vulnerability Analysis
  - Risk Simulation
  - Peril Exposures

**Pass/Fail:** _____________

#### 2.2.2 Tab 1: Overview (Default Tab)

##### Basic Information Card
- [ ] Verify card title: "Basic Information"
- [ ] Verify Exposure Type displays with icon
- [ ] Verify Status displays with colored chip
- [ ] Verify Account ID displays
- [ ] Verify Policy ID displays
- [ ] Verify Location ID displays
- [ ] Verify Effective Date formatted correctly
- [ ] Verify Expiry Date formatted correctly (if present)

**Pass/Fail:** _____________

##### Location Information Card
- [ ] Verify card title: "Location Information"
- [ ] Verify Coordinates display (Lat, Lng with 6 decimals)
- [ ] Verify Occupancy Type displays with icon
- [ ] Verify Construction Type displays with icon
- [ ] Verify Year Built displays (if present)
- [ ] Verify Number of Stories displays (if present)
- [ ] Verify Square Footage displays with formatting (if present)

**Pass/Fail:** _____________

##### Financial Information Card
- [ ] Verify card title: "Financial Information"
- [ ] Verify Currency displays (e.g., USD)
- [ ] Verify Total Insured Value displays with $ and commas
- [ ] Verify Replacement Value displays with $ and commas
- [ ] Verify Total Deductibles sum displays
- [ ] Verify Peril Count displays

**Pass/Fail:** _____________

##### Metadata Card
- [ ] Verify card title: "Metadata"
- [ ] Verify Created Date formatted correctly
- [ ] Verify Last Modified Date formatted correctly
- [ ] Verify Created By displays (if present)
- [ ] Verify Last Modified By displays (if present)

**Pass/Fail:** _____________

---

#### 2.2.3 Tab 2: Hazard Assessment

- [ ] Click "Hazard Assessment" tab
- [ ] Verify tab becomes active
- [ ] Verify HazardAssessmentPanel component loads
- [ ] Open Network tab in DevTools
- [ ] Verify API call to `/api/v1/analysis/location`
- [ ] Verify request includes:
  - latitude parameter
  - longitude parameter
  - radius parameter
- [ ] Verify loading spinner appears during fetch

##### Risk Summary Cards
- [ ] Verify 4 summary cards appear:
  - [ ] Overall Risk Level (with color chip)
  - [ ] Total Hazards (number)
  - [ ] Max Severity (severity level)
  - [ ] Avg Probability (percentage)
- [ ] Verify appropriate icons for each card
- [ ] Verify data matches API response

**Pass/Fail:** _____________

##### Location Information
- [ ] Verify "Location Details" section displays
- [ ] Verify coordinates match exposure location
- [ ] Verify radius displays (e.g., "50 km")

**Pass/Fail:** _____________

##### Hazards List
- [ ] Verify "Nearby Hazards" section displays
- [ ] Verify up to 5 hazards listed
- [ ] For each hazard verify:
  - [ ] Hazard type/name displays
  - [ ] Severity chip with color
  - [ ] Probability percentage
  - [ ] Distance from exposure
- [ ] Verify "View All Hazards" link (if more than 5)

**Pass/Fail:** _____________

##### Active Events & Zones
- [ ] Verify "Active Events" card displays
- [ ] Verify count of active events
- [ ] Verify "Risk Zones" card displays
- [ ] Verify count of risk zones

**Pass/Fail:** _____________

##### Refresh Functionality
- [ ] Click "Refresh" button
- [ ] Verify loading state appears
- [ ] Verify API call is made again
- [ ] Verify data updates

**Pass/Fail:** _____________

##### Error Handling
- [ ] **Note:** To test error state, may need to modify API or use invalid coordinates
- [ ] Verify error message displays if API fails
- [ ] Verify retry option available

**Pass/Fail:** _____________

**Notes:** _____________________________________________________________

---

#### 2.2.4 Tab 3: Vulnerability Analysis

- [ ] Click "Vulnerability Analysis" tab
- [ ] Verify tab becomes active
- [ ] Verify VulnerabilityPanel component loads
- [ ] Open Network tab in DevTools
- [ ] Verify API call to `/api/v1/vulnerabilities/location-score`
- [ ] Verify request includes:
  - latitude parameter
  - longitude parameter
  - radius parameter

##### Risk Summary Cards
- [ ] Verify 4 summary cards appear:
  - [ ] Overall Risk Level (with color chip)
  - [ ] Average Score (0.00-10.00)
  - [ ] Max Score (0.00-10.00)
  - [ ] Total Assessments (number)
- [ ] Verify data matches API response

**Pass/Fail:** _____________

##### Exposure Characteristics
- [ ] Verify "Exposure Characteristics" section displays
- [ ] Verify Location coordinates display
- [ ] Verify Occupancy Type displays
- [ ] Verify Construction Type displays
- [ ] Verify Year Built displays (if present)

**Pass/Fail:** _____________

##### Top Vulnerabilities
- [ ] Verify "Top Vulnerabilities" section displays
- [ ] Verify up to 3 vulnerabilities listed
- [ ] For each vulnerability verify:
  - [ ] Vulnerability score displays
  - [ ] Severity indicator (color/badge)
  - [ ] Contributing factors listed as chips
  - [ ] Assessment date formatted correctly

**Pass/Fail:** _____________

##### Primary Risk Factors
- [ ] Verify "Primary Risk Factors" section displays
- [ ] Verify up to 5 factors listed with progress bars
- [ ] For each factor verify:
  - [ ] Factor name displays
  - [ ] Factor type (Physical/Social/Economic/Environmental/Infrastructure)
  - [ ] Weight/impact value (0-1 scale)
  - [ ] Progress bar fills proportionally

**Pass/Fail:** _____________

##### Refresh Functionality
- [ ] Click "Refresh" button
- [ ] Verify loading state appears
- [ ] Verify API call is made again
- [ ] Verify data updates

**Pass/Fail:** _____________

##### Error Handling
- [ ] Verify error message displays if API fails
- [ ] Verify graceful fallback if no vulnerability data

**Pass/Fail:** _____________

**Notes:** _____________________________________________________________

---

#### 2.2.5 Tab 4: Risk Simulation

- [ ] Click "Risk Simulation" tab
- [ ] Verify tab becomes active
- [ ] Verify SimulationPanel component loads
- [ ] Open Network tab in DevTools
- [ ] Verify API call to `/api/v1/simulations/runs`
- [ ] Verify request includes:
  - exposureId parameter
  - page parameter
  - limit parameter (5)
  - status parameter
  - sortBy parameter
  - sortOrder parameter

##### Simulation Summary Cards
- [ ] Verify 4 summary cards appear:
  - [ ] Total Simulations (number)
  - [ ] Average Annual Loss (AAL with $)
  - [ ] Probable Maximum Loss (PML with $)
  - [ ] Completion Rate (percentage)
- [ ] Verify data matches API response
- [ ] Verify currency formatting ($X,XXX,XXX)

**Pass/Fail:** _____________

##### Recent Simulation Runs
- [ ] Verify "Recent Simulation Runs" section displays
- [ ] Verify up to 5 simulations listed
- [ ] For each simulation verify:
  - [ ] Simulation name displays
  - [ ] Status chip with color:
    - Completed: green
    - Running: blue
    - Failed: red
    - Pending: orange
  - [ ] Created date formatted correctly
  - [ ] AAL value displays (if completed)
  - [ ] PML value displays (if completed)
  - [ ] "View Details" button present

**Pass/Fail:** _____________

##### Navigation to Simulation Detail
- [ ] Click "View Details" on a simulation
- [ ] Verify navigation to simulation detail page
- [ ] Verify URL changes correctly
- [ ] Click Back to return to exposure detail

**Pass/Fail:** _____________

##### Empty State
- [ ] If no simulations exist, verify:
  - [ ] Empty state message displays
  - [ ] "Run New Simulation" button present
  - [ ] Helpful text about creating first simulation

**Pass/Fail:** _____________

##### Run New Simulation
- [ ] Click "Run New Simulation" button
- [ ] Verify navigation to simulation creation page
- [ ] Verify exposure context is passed (pre-filled if applicable)

**Pass/Fail:** _____________

##### Refresh Functionality
- [ ] Click "Refresh" button (if present)
- [ ] Verify loading state appears
- [ ] Verify API call is made again
- [ ] Verify simulation list updates

**Pass/Fail:** _____________

**Notes:** _____________________________________________________________

---

#### 2.2.6 Tab 5: Peril Exposures

- [ ] Click "Peril Exposures" tab
- [ ] Verify tab becomes active
- [ ] Verify peril exposures section displays

##### Peril Cards Display
- [ ] Verify each peril has a card
- [ ] For each peril card verify:
  - [ ] Peril type displays with icon
  - [ ] Exposure Amount displays with $ and commas
  - [ ] Deductible displays with $ and commas
  - [ ] Limit displays with $ and commas (if present)
  - [ ] Progress bar shows exposure vs limit ratio

**Pass/Fail:** _____________

##### Peril Summary
- [ ] Verify total number of perils displays
- [ ] Verify sum of all exposure amounts
- [ ] Verify comparison to TIV
- [ ] Verify percentage breakdown (if shown)

**Pass/Fail:** _____________

##### Empty State
- [ ] **Note:** If testing with exposure having no perils
- [ ] Verify empty state message displays
- [ ] Verify helpful text about adding perils

**Pass/Fail:** _____________

**Notes:** _____________________________________________________________

---

### 2.3 Data Consistency Between Views

#### 2.3.1 List vs Detail Consistency
- [ ] Note Exposure ID from list view
- [ ] Note TIV from list view
- [ ] Note Status from list view
- [ ] Open detail view
- [ ] Verify Exposure ID matches
- [ ] Verify TIV matches
- [ ] Verify Status matches
- [ ] Verify all list data appears in detail

**Pass/Fail:** _____________

#### 2.3.2 Navigation Consistency
- [ ] From detail page, click "Back" button
- [ ] Verify returns to list page
- [ ] Verify list still shows same data
- [ ] Verify no data refresh errors
- [ ] Navigate to detail again
- [ ] Verify detail still shows same data

**Pass/Fail:** _____________

---

## Test Section 3: FILTER WORKFLOW (ExposureFilters Component)

### 3.1 Filter Panel Access

- [ ] Navigate to Exposures list page
- [ ] Locate "Filters" toggle button (usually top-right)
- [ ] Click "Filters" button
- [ ] Verify filter panel expands/slides in
- [ ] Verify filter panel contains all 9 filter controls

**Pass/Fail:** _____________

---

### 3.2 Individual Filter Controls

#### 3.2.1 Exposure Type Filter
- [ ] Locate "Exposure Type" dropdown
- [ ] Click dropdown
- [ ] Verify options: All, Property, Casualty, Liability, Marine, Aviation, Cyber
- [ ] Select "Property"
- [ ] Verify selection displays in dropdown

**Pass/Fail:** _____________

#### 3.2.2 Occupancy Type Filter
- [ ] Locate "Occupancy Type" dropdown
- [ ] Click dropdown
- [ ] Verify options: All, Residential, Commercial, Industrial, Mixed Use, Institutional, Agricultural
- [ ] Select "Commercial"
- [ ] Verify selection displays

**Pass/Fail:** _____________

#### 3.2.3 Construction Type Filter
- [ ] Locate "Construction Type" dropdown
- [ ] Click dropdown
- [ ] Verify options: All, Wood, Concrete, Steel, Masonry, Mixed
- [ ] Select "Concrete"
- [ ] Verify selection displays

**Pass/Fail:** _____________

#### 3.2.4 Status Filter
- [ ] Locate "Status" dropdown
- [ ] Click dropdown
- [ ] Verify options: All, Active, Inactive, Expired, Under Review, Pending
- [ ] Select "Active"
- [ ] Verify selection displays

**Pass/Fail:** _____________

#### 3.2.5 Min TIV Filter
- [ ] Locate "Min TIV" number input
- [ ] Enter value: 1000000
- [ ] Verify accepts number
- [ ] Verify $ symbol displays (if formatted)

**Pass/Fail:** _____________

#### 3.2.6 Max TIV Filter
- [ ] Locate "Max TIV" number input
- [ ] Enter value: 10000000
- [ ] Verify accepts number
- [ ] Verify $ symbol displays (if formatted)

**Pass/Fail:** _____________

#### 3.2.7 Account ID Filter
- [ ] Locate "Account ID" text input
- [ ] Enter value: "ACC-12345678"
- [ ] Verify accepts text
- [ ] Verify case-insensitive (if applicable)

**Pass/Fail:** _____________

#### 3.2.8 Policy ID Filter
- [ ] Locate "Policy ID" text input
- [ ] Enter value: "POL-87654321"
- [ ] Verify accepts text

**Pass/Fail:** _____________

#### 3.2.9 Location ID Filter
- [ ] Locate "Location ID" text input
- [ ] Enter value: "LOC-11223344"
- [ ] Verify accepts text

**Pass/Fail:** _____________

---

### 3.3 Apply Filters

#### 3.3.1 Single Filter Application
- [ ] Clear all filters
- [ ] Set Exposure Type: "Property"
- [ ] Click "Apply Filters" button
- [ ] Open Network tab
- [ ] Verify API call to `/api/v1/exposures`
- [ ] Verify request includes: `?exposureType=Property`
- [ ] Verify list updates
- [ ] Verify only Property exposures shown
- [ ] Verify all rows have exposureType = "Property"

**Pass/Fail:** _____________

#### 3.3.2 Multiple Filters Combined
- [ ] Set filters:
  - Exposure Type: "Property"
  - Status: "Active"
  - Min TIV: 1000000
  - Occupancy Type: "Commercial"
- [ ] Click "Apply Filters" button
- [ ] Verify API call includes all parameters
- [ ] Verify list updates
- [ ] Verify all rows match ALL filter criteria
- [ ] Manually check first 3 rows:
  - [ ] Row 1: Property, Active, TIV ≥ 1M, Commercial
  - [ ] Row 2: Property, Active, TIV ≥ 1M, Commercial
  - [ ] Row 3: Property, Active, TIV ≥ 1M, Commercial

**Pass/Fail:** _____________

#### 3.3.3 TIV Range Filter
- [ ] Clear all filters
- [ ] Set Min TIV: 2000000
- [ ] Set Max TIV: 8000000
- [ ] Click "Apply Filters"
- [ ] Verify list updates
- [ ] Check first 5 rows:
  - [ ] All TIV values are ≥ $2,000,000
  - [ ] All TIV values are ≤ $8,000,000
- [ ] Verify no rows outside range

**Pass/Fail:** _____________

#### 3.3.4 Exact ID Filters
- [ ] Clear all filters
- [ ] Set Account ID to your test exposure's account ID
- [ ] Click "Apply Filters"
- [ ] Verify only exposures with that Account ID show
- [ ] Note count of results
- [ ] Clear Account ID filter
- [ ] Set Policy ID to your test exposure's policy ID
- [ ] Click "Apply Filters"
- [ ] Verify only exposures with that Policy ID show

**Pass/Fail:** _____________

---

### 3.4 Active Filter Chips

#### 3.4.1 Chip Display
- [ ] Apply filters: Type=Property, Status=Active
- [ ] Click "Apply Filters"
- [ ] Verify filter chips appear above/below filter panel
- [ ] Verify chip shows: "Type: Property"
- [ ] Verify chip shows: "Status: Active"
- [ ] Verify each chip has an X (close) icon

**Pass/Fail:** _____________

#### 3.4.2 Remove Individual Filter via Chip
- [ ] Click X icon on "Type: Property" chip
- [ ] Verify chip disappears
- [ ] Verify API call is made without exposureType parameter
- [ ] Verify list updates to show all types (but still Active)
- [ ] Verify "Status: Active" chip remains

**Pass/Fail:** _____________

---

### 3.5 Clear Filters

#### 3.5.1 Clear All Button
- [ ] Apply multiple filters (3+)
- [ ] Verify filter chips display
- [ ] Verify filtered list shows
- [ ] Click "Clear Filters" button
- [ ] Verify all filter chips disappear
- [ ] Verify all filter controls reset to default
- [ ] Verify API call is made without filter parameters
- [ ] Verify list updates to show all exposures

**Pass/Fail:** _____________

#### 3.5.2 Clear After Page Refresh
- [ ] Apply filters
- [ ] Note active filters
- [ ] Refresh browser page (F5 or Ctrl+R)
- [ ] **Expected:** Filters may or may not persist (check implementation)
- [ ] If filters persist:
  - [ ] Verify chips still display
  - [ ] Verify list still filtered
- [ ] If filters clear:
  - [ ] Verify no chips display
  - [ ] Verify full list shows

**Pass/Fail:** _____________

---

### 3.6 Filter Edge Cases

#### 3.6.1 No Results
- [ ] Apply filters that match no exposures:
  - Type: "Aviation"
  - Status: "Expired"
  - Min TIV: 100000000 (very high)
- [ ] Click "Apply Filters"
- [ ] Verify API call returns empty array
- [ ] Verify empty state message displays
- [ ] Verify message: "No exposures found" or similar
- [ ] Verify helpful text about adjusting filters

**Pass/Fail:** _____________

#### 3.6.2 Invalid Range
- [ ] Set Min TIV: 10000000
- [ ] Set Max TIV: 1000000 (min > max)
- [ ] Click "Apply Filters"
- [ ] Verify validation error or warning
- [ ] **OR** Verify API handles gracefully (no results)

**Pass/Fail:** _____________

---

## Test Section 4: INTEGRATION TOUCHPOINTS

### 4.1 API Call Verification

#### 4.1.1 Monitor All API Calls
- [ ] Open DevTools Network tab
- [ ] Filter by "XHR" or "Fetch"
- [ ] Navigate through all exposure workflows
- [ ] Verify all API calls return status 200/201
- [ ] Verify no 4xx or 5xx errors
- [ ] Verify response times are acceptable (<2s)

**Pass/Fail:** _____________

#### 4.1.2 Verify API Endpoints Used
Check that the following endpoints are called:
- [ ] GET `/api/v1/exposures` (list)
- [ ] GET `/api/v1/exposures/:id` (detail)
- [ ] POST `/api/v1/exposures` (create)
- [ ] PUT `/api/v1/exposures/:id` (update)
- [ ] DELETE `/api/v1/exposures/:id` (delete)
- [ ] POST `/api/v1/exposures/bulk-delete` (bulk delete)
- [ ] GET `/api/v1/analysis/location` (hazard assessment)
- [ ] GET `/api/v1/vulnerabilities/location-score` (vulnerability)
- [ ] GET `/api/v1/simulations/runs` (simulation panel)

**Pass/Fail:** _____________

---

### 4.2 Cross-Component Data Flow

#### 4.2.1 Create → List Flow
- [ ] Create a new exposure with unique Account ID
- [ ] Note the Exposure ID from success toast
- [ ] Verify navigation to list page
- [ ] Find created exposure in list
- [ ] Verify all data displays correctly in list row

**Pass/Fail:** _____________

#### 4.2.2 List → Detail Flow
- [ ] From list, click View on created exposure
- [ ] Verify detail page loads
- [ ] Verify all data from create form appears in detail
- [ ] Compare each field to original input

**Pass/Fail:** _____________

#### 4.2.3 Detail → Integration Panels Flow
- [ ] From detail Overview tab, note coordinates
- [ ] Click Hazard Assessment tab
- [ ] Verify API call uses correct coordinates
- [ ] Click Vulnerability Analysis tab
- [ ] Verify API call uses correct coordinates
- [ ] Click Risk Simulation tab
- [ ] Verify API call uses correct exposure ID

**Pass/Fail:** _____________

---

## Test Section 5: UPDATE WORKFLOW

**Note:** This section tests via API or Edit button (if implemented)

### 5.1 Edit Exposure (If Edit Form Exists)

- [ ] Open exposure detail page
- [ ] Click "Edit" button in header
- [ ] Verify navigation to edit form
- [ ] Verify form pre-populated with current data
- [ ] Modify Status to "Under Review"
- [ ] Modify TIV to new value
- [ ] Click "Save Changes" or "Update"
- [ ] Verify success message
- [ ] Verify navigation back to detail
- [ ] Verify changes reflected in detail view

**Pass/Fail:** _____________

### 5.2 Update via API (Backend Test)

**Note:** This can be verified by running the automated E2E test script

- [ ] Run: `node tests/integration/phase5-exposure-e2e-test.js`
- [ ] Verify TEST 5 (UPDATE WORKFLOW) passes
- [ ] Verify all test cases in Test 5 succeed

**Pass/Fail:** _____________

---

## Test Section 6: DELETE WORKFLOW

### 6.1 Single Delete

#### 6.1.1 Delete from Detail Page
- [ ] Navigate to exposure detail page
- [ ] Click "Delete" button in header
- [ ] Verify confirmation dialog appears
- [ ] Verify dialog message: "Are you sure you want to delete this exposure?"
- [ ] Verify dialog shows exposure details or ID
- [ ] Click "Cancel" button
- [ ] Verify dialog closes
- [ ] Verify exposure still exists (navigate to list)
- [ ] Return to detail page
- [ ] Click "Delete" button again
- [ ] Click "Confirm" or "Delete" button
- [ ] Open Network tab
- [ ] Verify DELETE request to `/api/v1/exposures/:id`
- [ ] Verify response status 200
- [ ] Verify success toast notification
- [ ] Verify navigation to list page
- [ ] Verify deleted exposure NO LONGER in list

**Pass/Fail:** _____________

#### 6.1.2 Delete from List Page
- [ ] Create a new test exposure for deletion
- [ ] In list view, locate the exposure
- [ ] Click "Delete" (trash icon) in Actions column
- [ ] Verify confirmation dialog appears
- [ ] Click "Confirm"
- [ ] Verify API call is made
- [ ] Verify success toast
- [ ] Verify row disappears from list
- [ ] Refresh page
- [ ] Verify exposure still does not appear

**Pass/Fail:** _____________

---

### 6.2 Bulk Delete

#### 6.2.1 Select Multiple Exposures
- [ ] Create 3 test exposures (or use existing)
- [ ] In list view, click checkboxes for 3 exposures
- [ ] Verify all 3 are selected
- [ ] Verify selection count updates (e.g., "3 selected")
- [ ] Verify "Delete Selected" button appears or becomes enabled

**Pass/Fail:** _____________

#### 6.2.2 Bulk Delete Action
- [ ] Click "Delete Selected" button
- [ ] Verify confirmation dialog appears
- [ ] Verify dialog shows count: "Delete 3 exposures?"
- [ ] Click "Cancel"
- [ ] Verify dialog closes and exposures still selected
- [ ] Click "Delete Selected" again
- [ ] Click "Confirm"
- [ ] Open Network tab
- [ ] Verify POST request to `/api/v1/exposures/bulk-delete`
- [ ] Verify request payload contains array of IDs
- [ ] Verify response status 200
- [ ] Verify success toast: "X exposures deleted"
- [ ] Verify all 3 rows disappear from list
- [ ] Refresh page
- [ ] Verify exposures still do not appear

**Pass/Fail:** _____________

---

## Test Section 7: PERFORMANCE & RESPONSIVENESS

### 7.1 Page Load Times

- [ ] Clear browser cache
- [ ] Navigate to Exposures list page
- [ ] Use DevTools Performance tab to measure load time
- [ ] Verify page loads in < 3 seconds
- [ ] Navigate to Exposure detail page
- [ ] Verify detail page loads in < 2 seconds
- [ ] Navigate to Create form
- [ ] Verify form loads in < 1 second

**Performance Benchmarks:**
- List page load: _______ seconds
- Detail page load: _______ seconds
- Create form load: _______ seconds

**Pass/Fail:** _____________

---

### 7.2 API Response Times

- [ ] Monitor Network tab for API calls
- [ ] Record response times for key operations:
  - GET /exposures (list): _______ ms
  - GET /exposures/:id (detail): _______ ms
  - POST /exposures (create): _______ ms
  - PUT /exposures/:id (update): _______ ms
  - DELETE /exposures/:id (delete): _______ ms
  - GET /analysis/location: _______ ms
  - GET /vulnerabilities/location-score: _______ ms
  - GET /simulations/runs: _______ ms

- [ ] Verify all responses < 1000ms
- [ ] If any > 1000ms, note for optimization

**Pass/Fail:** _____________

---

### 7.3 Responsive Design

#### 7.3.1 Desktop View (1920x1080)
- [ ] Set browser to full screen
- [ ] Navigate through all pages
- [ ] Verify layouts look good
- [ ] Verify no horizontal scrolling
- [ ] Verify all buttons accessible
- [ ] Verify grids display all columns

**Pass/Fail:** _____________

#### 7.3.2 Tablet View (768x1024)
- [ ] Open DevTools (F12)
- [ ] Toggle device toolbar
- [ ] Select iPad or similar
- [ ] Navigate through all pages
- [ ] Verify layouts adapt
- [ ] Verify filters may collapse or stack
- [ ] Verify grid may hide some columns
- [ ] Verify touch targets are large enough

**Pass/Fail:** _____________

#### 7.3.3 Mobile View (375x667)
- [ ] Select iPhone or similar
- [ ] Navigate through all pages
- [ ] Verify mobile-friendly layouts
- [ ] Verify hamburger menu (if applicable)
- [ ] Verify forms are single-column
- [ ] Verify stepper may show vertical or condensed
- [ ] Verify all features still accessible

**Pass/Fail:** _____________

---

## Test Section 8: ERROR HANDLING & EDGE CASES

### 8.1 Network Errors

#### 8.1.1 Offline Mode
- [ ] Open DevTools Network tab
- [ ] Check "Offline" checkbox
- [ ] Try to load Exposures list
- [ ] Verify error message displays
- [ ] Verify message: "Failed to load exposures" or similar
- [ ] Verify retry button available
- [ ] Uncheck "Offline"
- [ ] Click retry
- [ ] Verify data loads successfully

**Pass/Fail:** _____________

#### 8.1.2 Slow Network (Throttling)
- [ ] Open DevTools Network tab
- [ ] Select "Slow 3G" throttling
- [ ] Navigate to Exposures list
- [ ] Verify loading spinner displays
- [ ] Verify loading spinner remains visible until data loads
- [ ] Verify page does not freeze
- [ ] Verify data eventually loads
- [ ] Reset throttling to "No throttling"

**Pass/Fail:** _____________

---

### 8.2 Backend Errors

#### 8.2.1 500 Server Error
**Note:** May require stopping backend or mocking error response

- [ ] Simulate 500 error (if possible)
- [ ] Verify error message displays
- [ ] Verify user-friendly message (not raw error stack)
- [ ] Verify retry option available

**Pass/Fail:** _____________

#### 8.2.2 404 Not Found
- [ ] Navigate to detail page with invalid ID in URL:
  - Example: `/exposures/invalid-id-12345`
- [ ] Verify 404 error message displays
- [ ] Verify message: "Exposure not found" or similar
- [ ] Verify "Back to List" button available

**Pass/Fail:** _____________

---

### 8.3 Validation Errors

#### 8.3.1 Frontend Validation
- [ ] In create form, try to submit with empty required fields
- [ ] Verify inline error messages appear
- [ ] Verify cannot proceed to next step
- [ ] Verify form does not submit

**Pass/Fail:** _____________

#### 8.3.2 Backend Validation
- [ ] Use browser console to bypass frontend validation
- [ ] Send invalid data to API (e.g., via fetch or axios)
- [ ] Verify backend returns 400 error
- [ ] Verify error response contains validation messages
- [ ] Verify frontend displays backend errors

**Pass/Fail:** _____________

---

### 8.4 Data Edge Cases

#### 8.4.1 Very Large TIV
- [ ] Create exposure with TIV: 999999999999 (large number)
- [ ] Verify accepts and saves
- [ ] Verify displays correctly with commas
- [ ] Verify no overflow or display issues

**Pass/Fail:** _____________

#### 8.4.2 Many Perils
- [ ] Create exposure with 10+ perils
- [ ] Verify all perils save
- [ ] Verify all display in detail view
- [ ] Verify peril cards or list handles scrolling

**Pass/Fail:** _____________

#### 8.4.3 Special Characters in IDs
- [ ] Try to create exposure with invalid characters:
  - Account ID: "ACC-ABCD1234" (letters in digits)
- [ ] Verify validation catches error
- [ ] Verify error message displays

**Pass/Fail:** _____________

---

## Test Section 9: BROWSER COMPATIBILITY

### 9.1 Chrome
- [ ] Test all workflows in Chrome
- [ ] Verify all features work
- [ ] Note any issues: _____________

**Pass/Fail:** _____________

### 9.2 Firefox
- [ ] Test key workflows in Firefox
- [ ] Verify layouts render correctly
- [ ] Verify API calls work
- [ ] Note any issues: _____________

**Pass/Fail:** _____________

### 9.3 Edge
- [ ] Test key workflows in Edge
- [ ] Verify compatibility
- [ ] Note any issues: _____________

**Pass/Fail:** _____________

### 9.4 Safari (if available)
- [ ] Test key workflows in Safari
- [ ] Verify compatibility
- [ ] Note any issues: _____________

**Pass/Fail:** _____________

---

## Test Section 10: ACCESSIBILITY

### 10.1 Keyboard Navigation
- [ ] Use only Tab key to navigate through create form
- [ ] Verify can reach all form fields
- [ ] Verify focus indicators visible
- [ ] Use Enter key to activate buttons
- [ ] Use Space key to activate checkboxes
- [ ] Use Arrow keys in dropdowns

**Pass/Fail:** _____________

### 10.2 Screen Reader (Optional)
- [ ] Enable screen reader (NVDA, JAWS, or VoiceOver)
- [ ] Navigate through exposure list
- [ ] Verify all content is announced
- [ ] Verify form labels are read
- [ ] Verify error messages are announced

**Pass/Fail:** _____________

### 10.3 Color Contrast
- [ ] Use DevTools Lighthouse or axe DevTools
- [ ] Run accessibility audit
- [ ] Verify no contrast issues
- [ ] Verify all text is readable

**Pass/Fail:** _____________

---

## FINAL SUMMARY

### Overall Test Results

**Total Test Sections:** 10  
**Sections Passed:** _______  
**Sections Failed:** _______  
**Critical Issues Found:** _______  
**Minor Issues Found:** _______

### Critical Issues

1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________

### Minor Issues

1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________

### Recommendations

1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________

### Sign-Off

**Tester Signature:** _______________________  
**Date:** _______________________  
**Status:** ☐ APPROVED  ☐ APPROVED WITH CONDITIONS  ☐ REJECTED

---

## Additional Notes

_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
_______________________________________________________________________
