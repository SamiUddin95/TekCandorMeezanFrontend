# Outward Clearing Module — Complete Flow Documentation (for MIRO Board)

> **Application**: Meezan Bank — Cheque Clearing Management System (TekCandor)
> **Tech Stack**: Angular 17+ (standalone components), TypeScript, Bootstrap 5, SCSS, SweetAlert2
> **Backend API Base**: `https://localhost:44367/api`
> **Theme Colors**: Meezan Deep Purple `#5a2181`, White, Light Gray

---

## 🗺️ HIGH-LEVEL FLOW DIAGRAM

```
┌─────────────────────┐
│  1. START BUSINESS   │
│       DAY            │
└──────────┬──────────┘
           │ (Day must be started before any other action)
           ▼
┌─────────────────────┐
│  2. CHEQUE LODGMENT  │ ◄── Teller enters cheque data
│     (Multi-Step)     │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
┌────────┐  ┌──────────┐
│  2a.   │  │  2b.     │
│  NEW   │──│  SCAN    │
│  FORM  │  │  CHEQUE  │
└────┬───┘  └──────┬───┘
     │             │
     └──────┬──────┘
            ▼
┌─────────────────────┐
│  2c. REVIEW &       │
│      SUBMIT         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  2d. DEPOSIT SLIP   │ (Print receipt)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  3. OPERATIONAL      │ ◄── Supervisor approves or rejects
│     OVERVIEW         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  4. GENERATE         │ ◄── Generates NIFT clearing file (.txt)
│     CLEARING FILE    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  5. NIFT             │ ◄── Upload NIFT response file, match records
│     RECONCILIATION   │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌──────────┐ ┌──────────────┐
│ 6. FUND  │ │ 7. RETURN    │
│ REALIZA- │ │    MARKING   │
│ TION     │ │    UTILITY   │
└──────────┘ └──────────────┘
```

---

## 📋 SCREEN-BY-SCREEN BREAKDOWN

---

### SCREEN 1: START BUSINESS DAY

**Purpose**: Branch officer starts the business day before any cheque processing can begin. This timestamps the login, syncs the branch ledger, and enables Cheque Lodgment modules for all tellers.

**Route**: `/pages/outward-clearing/start-business-day`

**UI Layout**:
- Single centered card
- Large shield icon (changes to green check when day is started)
- Status badge: "Day Not Started" (red) or "Day Started" (green)
- Current business date displayed prominently
- System Readiness checklist (Network Connectivity, MICR Scanner Online, Branch Vault Sync)
- Operational Impact info box
- Big CTA button: **START BUSINESS DAY** (disabled after day is started)
- Auth note: "Authorized Personnel: Branch Officer / Manager Approval Required"

**API Endpoints**:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/outward/BusinessDate` | Load current business day status |
| POST | `/outward/BusinessDate` | Start/create business day |

**GET Response**:
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "businessDate": "2026-04-17T00:00:00",
        "isActive": true,
        "startedBy": "Admin User",
        "startedAt": "2026-04-17T09:00:00"
      }
    ],
    "totalCount": 1
  },
  "statusCode": 200,
  "errorMessage": null
}
```

**POST Request Body**:
```json
{
  "id": 1,
  "businessDate": "2026-04-17T00:00:00.000Z",
  "isActive": true,
  "startedBy": "Admin User",
  "startedAt": "2026-04-17T09:00:00.000Z"
}
```

**Logic**:
1. On page load → `GET /outward/BusinessDate` to check if day is already started
2. If `isActive === true` → button shows "Business Day Active" (disabled, green)
3. If not started → button shows "START BUSINESS DAY"
4. On click → SweetAlert confirmation → `POST /outward/BusinessDate` → success alert
5. BehaviorSubject broadcasts status to other components

**State Management**: Uses `BehaviorSubject<boolean | null>` to share business day status across the app. Other components can subscribe to `businessDayStarted$`.

---

### SCREEN 2a: CHEQUE LODGMENT LIST

**Purpose**: Displays all lodged cheques in a searchable, filterable table. Entry point for creating new lodgments, viewing existing ones, and printing deposit slips.

**Route**: `/pages/outward-clearing/cheque-lodgment`

**UI Layout**:
- Card with header "Cheque Lodgment" + **ADD** button (top right)
- Search input (depositor name, account, tracking number)
- Status filter dropdown (All, Completed, Pending Review, Scanning, Draft)
- Table columns: Tracking No. | Depositor | Account | Beneficiary | Amount | Date | Status | Action
- Action column: **View** icon button (eye) + **Deposit Slip** icon button (document)
- Empty state: "No records found"

**API Endpoints**:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/outward/ChequeInfo` | Fetch all cheque lodgment records |

**GET Response**:
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "date": "2026-04-17T00:00:00",
        "depositorType": "Self",
        "accountNo": "0102-910558490I-PKR",
        "cnic": "",
        "depositorTitle": "PAKISTAN TEXTILE CORP LTD",
        "beneficiaryAccountNumber": "0098-776655443",
        "beneficiaryTitle": "Siddique Trading Co.",
        "accountStatus": "Active",
        "beneficiaryBranchCode": "0145",
        "chequeNo": "55489201",
        "payingBankCode": "0022",
        "payingBranchCode": "0145",
        "amount": 450000,
        "chequeDate": "2026-04-05",
        "instrumentType": "Clearing Cheque",
        "micr": "021-01012-0648-00",
        "ocrEngine": "TekCandor ML v4.2",
        "processingTime": "1.34s",
        "accuracy": "99.8%",
        "imageF": "",
        "imageB": "",
        "imageU": "",
        "currency": "PKR",
        "remarks": "",
        "receiverBranchCode": "0005",
        "branchName": "Main Branch, Karachi",
        "drawerBank": "Habib Bank Limited (HBL)",
        "amountInWords": "Four Hundred Fifty Thousand Rupees Only",
        "referenceNo": "TXN-77489-B2",
        "depositSlipId": 0,
        "status": "P",
        "isReconciled": false,
        "isReturned": false,
        "isRealized": false,
        "createdOn": "2026-04-17T10:00:00",
        "createdBy": "Admin",
        "updatedOn": null,
        "updatedBy": null
      }
    ],
    "totalCount": 1
  },
  "statusCode": 200,
  "errorMessage": null
}
```

**Status Mapping**:
- `P` → "Pending Review"
- `C` → "Cleared"
- `S` → "Scanning"
- `RE` → "Reject"
- `A` → "Approved"
- Default → "Draft"

**Navigation Actions**:
- **ADD** button → `/pages/outward-clearing/cheque-lodgment/new`
- **View** icon → `/pages/outward-clearing/cheque-lodgment/review/{id}`
- **Deposit Slip** icon → `/pages/outward-clearing/cheque-lodgment/deposit-slip/{id}`

---

### SCREEN 2b: NEW CHEQUE LODGMENT (Data Entry Form)

**Purpose**: Teller enters cheque details — depositor info, beneficiary info, instrument details. This is a multi-step wizard (Step 1: Data Entry, Step 2: Pre-scan checks).

**Route**: `/pages/outward-clearing/cheque-lodgment/new?id={optional}`

**UI Layout**:
- Step indicator (Step 1: Data Entry, Step 2: Pre-Scan)
- **Step 1** — Three sections:
  - **Depositor Information**: Type dropdown (Self / MBL Account Holder / Walk-in), Account field with "Fetch" button, CNIC (for walk-in), Full Name
  - **Beneficiary Details**: Account Number with "Fetch" button, Title of Account, Account Status, Branch Code
  - **Instrument Details**: Cheque Number, Paying Bank Code, Paying Branch Code, Instrument Type, Currency, Amount, Remarks
- **Step 2** — Pre-Scan Checklist:
  - Three verification checkboxes (stale check, amount match, signature)
  - All must be checked before "Scan Cheque" button enables
- Buttons: Cancel (back to list) | Scan Cheque (to scan screen)

**API Endpoints**:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/outward/ChequeInfo/{id}` | Load existing cheque for editing |

**Logic**:
1. If `?id=X` query param exists → load cheque by ID and pre-fill form
2. Depositor "Fetch" button → simulates account lookup (future API)
3. Beneficiary "Fetch" button → simulates account lookup (future API)
4. Pre-scan checklist → all 3 checks must be ticked
5. "Scan Cheque" → navigates to `/pages/outward-clearing/cheque-lodgment/scan/{id}`

---

### SCREEN 2c: CHEQUE SCAN (Instrument Capture)

**Purpose**: Shows OCR/MICR scan results after cheque is physically scanned. Displays extracted data for verification before proceeding to review.

**Route**: `/pages/outward-clearing/cheque-lodgment/scan/{id}`

**UI Layout**:
- Header: "Instrument Capture & Verification"
- Cheque image preview (front/back placeholders)
- Extracted data card:
  - Cheque Number, MICR Code, Amount, Cheque Date, Beneficiary
  - OCR Engine name, Processing Time, Confidence Score (%)
- Two buttons: **Discard** (back to form) | **Proceed to Review** (to review screen)

**Logic**:
1. Reads `id` from route params
2. Currently uses hardcoded scan data (`CHEQUE_LODGMENT_SCAN_DATA`)
3. "Proceed to Review" → `/pages/outward-clearing/cheque-lodgment/review/{id}`
4. "Discard" → `/pages/outward-clearing/cheque-lodgment/new?id={id}`

---

### SCREEN 2d: REVIEW & SUBMIT

**Purpose**: Final review of all cheque data before submission. Shows depositor info, instrument details, financial settlement, and validation status.

**Route**: `/pages/outward-clearing/cheque-lodgment/review/{id}`

**UI Layout**:
- Reference number badge at top
- Validation status bar (green if passed)
- Three info cards:
  - **Depositor Information**: Account Name, Account Number, Branch
  - **Instrument Details**: Cheque No, MICR, Date, Drawer Bank
  - **Financial Settlement**: Amount, Amount in Words, Transaction Type
- Processing Mode: Live Settlement (ICS)
- Reviewing Officer name + Last sync time
- Buttons: **Edit Details** (back to form) | **Confirm & Submit**

**API Endpoints**:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/outward/ChequeInfo/{id}` | Load cheque data for review |
| POST | `/outward/ChequeInfo` | Create new cheque record |
| PUT | `/outward/ChequeInfo/{id}` | Update existing cheque record |

**Submit Logic**:
1. User clicks "Confirm & Submit"
2. SweetAlert confirmation: "This will finalize the transaction and generate a deposit slip."
3. If `id > 0` → `PUT /outward/ChequeInfo/{id}` (update)
4. If new → `POST /outward/ChequeInfo` (create)
5. On success → redirect to deposit slip: `/pages/outward-clearing/cheque-lodgment/deposit-slip/{id}`

---

### SCREEN 2e: DEPOSIT SLIP

**Purpose**: Shows a printable deposit slip after successful cheque submission. Receipt for the depositor.

**Route**: `/pages/outward-clearing/cheque-lodgment/deposit-slip/{id}`

**UI Layout**:
- Printable receipt layout
- Bank logo + "Deposit Slip" heading
- Tracking Number, Business Date, Branch, Instrument Type
- Depositor section: Name, Account, Relationship
- Beneficiary section: Title, Account, Bank
- Instruments table: S.No | Cheque No | Drawee Bank | Branch | Clearing Type | Amount
- Grand Total
- Buttons: **Print** (window.print) | **Back to Lodgment List** | **Go to Dashboard**

**Logic**: Currently uses hardcoded data. No additional API call needed (data was just submitted).

---

### SCREEN 3: OPERATIONAL OVERVIEW (Supervisor Approval)

**Purpose**: Supervisor reviews pending cheque transactions and approves or rejects them. Shows high-value vs regular transactions with filtering and pagination.

**Route**: `/pages/outward-clearing/operational-overview`

**UI Layout**:
- Tab bar: **All** | **High Value (≥500K)** | **Regular (<500K)**
- Filter row: Search | Branch dropdown | Status dropdown (All, Pending, Priority, Critical)
- Table columns: Cheque No | TXN ID | Payee Name | Amount | Branch | Time Received | Status | Actions
- Action buttons per row: **View** | **Approve** (green) | **Reject** (red)
- Pagination at bottom
- Detail panel (slides in when View is clicked, shows full cheque details)

**API Endpoints**:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/outward/ChequeInfo/supervisorList` | Fetch pending transactions for supervisor |
| GET | `/outward/ChequeInfo/{id}` | Fetch single cheque detail (for detail panel) |
| PUT | `/outward/ChequeInfo/approve/{id}` | Approve a cheque |
| PUT | `/outward/ChequeInfo/reject/{id}?remarks=...` | Reject a cheque with optional remarks |

**GET supervisorList Response**: Same structure as ChequeInfo list but filtered for pending status.

**Approve Response**:
```json
{
  "status": "success",
  "data": "Cheque approved successfully",
  "statusCode": 200,
  "errorMessage": null
}
```

**Reject Flow**:
1. Click Reject → SweetAlert opens with textarea for optional reason
2. User types reason (optional) → clicks "Reject"
3. `PUT /outward/ChequeInfo/reject/{id}?remarks=User typed reason`
4. Success alert → list refreshes

**Status Mapping**:
- `C` or `CRITICAL` → "Critical"
- `H`, `PR`, or `PRIORITY` → "Priority"
- Default → "Pending"

---

### SCREEN 4: GENERATE CLEARING FILE

**Purpose**: Generates NIFT clearing file (.txt) for a selected branch and business date. This file is sent to NIFT for clearing.

**Route**: `/pages/outward-clearing/generate-clearing-file`

**UI Layout**:
- Header: "Generate Clearing File"
- Filter row:
  - Date picker (with Today/Yesterday quick buttons)
  - Branch dropdown (loaded from API)
  - Reset Filters button
- Summary cards:
  - Total Instruments count
  - Total Settled Amount
  - Validation Status (Passed/Failed)
- Generate button (with loading spinner)

**API Endpoints**:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/Filter/branch` | Load branch list for dropdown |
| GET | `/outward/ChequeInfo/generate-file?receiverBranchCode={code}&date={date}` | Download clearing file as Blob |

**Branch Response**:
```json
{
  "status": "success",
  "data": {
    "branches": [
      { "name": "Main Branch Karachi", "code": "0005" },
      { "name": "Gulshan Branch", "code": "0012" }
    ],
    "filterType": "branch"
  },
  "statusCode": 200,
  "errorMessage": null
}
```

**Generate Logic**:
1. User selects date + branch → clicks Generate
2. SweetAlert confirmation with date + branch info
3. API returns Blob → triggers browser download as `.txt` file
4. File name format: `ChequeInfo_{branchCode}_{DD-MM-YYYY}.txt`
5. Success toast shown

---

### SCREEN 5: NIFT RECONCILIATION

**Purpose**: Upload NIFT response file to reconcile with lodged cheques. Shows matched vs unmatched records with discrepancy details.

**Route**: `/pages/outward-clearing/nift-reconciliation`

**UI Layout**:
- Header with summary stats cards:
  - Total Lodgments | Auto Matched | Action Required | Reconciled Value
- Upload area: File input (accepts .txt, .xls, .xlsx)
- Tab bar: **Unmatched** | **Matched**
- Search filter
- **Unmatched Table**: Cheque No | Branch | Amount | Date | Discrepancy | Action (Force Match button)
- **Matched Table**: Cheque No | Branch | Amount | Date | Match Status

**API Endpoints**:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/outward/ChequeInfo/reconcile-list` | Load existing reconciliation data |
| POST | `/outward/ChequeInfo/upload-nift` | Upload NIFT file for reconciliation |

**Upload Request**: `multipart/form-data` with fields:
- `file`: The NIFT file
- `fileType`: "txt" | "xls" | "xlsx"

**Reconciliation Response**:
```json
{
  "status": "success",
  "data": {
    "matchedRecords": [
      { "chequeNo": "55489201", "branchName": "Main Branch", "amount": 450000, "date": "2026-04-17", "discrepancy": "" }
    ],
    "unmatchedRecords": [
      { "chequeNo": "55489205", "branchName": "Gulshan", "amount": 75000, "date": "2026-04-17", "discrepancy": "Amount Mismatch" }
    ],
    "summary": {
      "totalLodgement": 150,
      "matched": 145,
      "unmatched": 5,
      "totalAmount": 12500000
    }
  },
  "statusCode": 200,
  "errorMessage": null
}
```

**Logic**:
1. Page load → `GET /reconcile-list` to show existing data
2. User uploads NIFT file → `POST /upload-nift`
3. Response populates matched/unmatched tabs and summary stats
4. Success toast: "Matched: X | Unmatched: Y"

---

### SCREEN 6: FUND REALIZATION

**Purpose**: Shows branch-wise fund realization summary. Supervisor can select branches and process fund realization.

**Route**: `/pages/outward-clearing/fund-realization`

**UI Layout**:
- Header: "Fund Realization" with date picker
- Search input for branch code/name
- Table columns: Select (checkbox) | # | Branch Code | Branch Name | Instruments | Total Amount | Status
- Select All checkbox in header
- Summary cards at bottom:
  - Selected Branches count
  - Total Instruments (selected)
  - Total Amount (selected)
- Pagination (7 per page)
- **Process Realization** button (enabled when branches selected)

**API Endpoints**:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/outward/ChequeInfo/fund-realization-list` | Fetch branch-wise realization data |

**Response**:
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "receiverBranchCode": "0005",
        "branchName": "Main Branch Karachi",
        "totalAmount": 2500000,
        "chequeCount": 45
      }
    ],
    "totalCount": 12
  },
  "statusCode": 200,
  "errorMessage": null
}
```

**Logic**:
1. Load list on init
2. User searches/filters → pagination resets
3. Checkbox selection → summary cards update in real-time
4. "Process Realization" → sends selected branch codes (future API)

---

### SCREEN 7a: RETURN MARKING UTILITY — LIST

**Purpose**: Shows all returned cheques. User can search, filter by status, and click Edit to open the detail screen for marking.

**Route**: `/pages/outward-clearing/return-marking-utility`

**UI Layout**:
- Header: "Return Marking Utility List"
- Search input (cheque #, depositor, account, reason)
- Status filter dropdown (dynamic from data)
- Table columns: Cheque # | Depositor | Account | Branch | Amount | Date | Status | Code | Reason | Action
- Action column: **Edit** icon button (pencil) → navigates to detail screen
- Loading/error/empty states

**API Endpoints**:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/outward/ChequeInfo/return-list` | Fetch all returned cheques |

**Response**:
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "chequeInfoId": 8,
        "date": "2026-04-17T00:00:00",
        "depositorType": "Self",
        "accountNo": "0102-910558490I",
        "cnic": "",
        "depositorTitle": "Ahmed Raza",
        "branchName": "Main Branch",
        "chequeNo": "77452168",
        "amount": 85750,
        "micr": "021-01012-0648-00",
        "status": "Returned",
        "matchStatus": "Matched",
        "niftStagingId": 0,
        "fileName": "",
        "uploadDate": "",
        "returnCode": "SBP-01",
        "returnReason": "Insufficient Funds",
        "isProcessed": false
      }
    ],
    "totalCount": 1
  },
  "statusCode": 200,
  "errorMessage": null
}
```

**Navigation**: Edit button → `/pages/outward-clearing/return-marking-utility/{chequeInfoId}`

---

### SCREEN 7b: RETURN MARKING UTILITY — DETAIL (Edit/Mark Return)

**Purpose**: Shows full detail of a returned cheque instrument. Officer can select return reason code, add remarks, and finalize the return marking.

**Route**: `/pages/outward-clearing/return-marking-utility/{id}`

**UI Layout**:
- Top search bar: Instrument number input + "Find Instrument" button
- Two-column layout when instrument found:
  - **LEFT COLUMN**:
    - Instrument Metadata card (badge: "RETURNED"):
      - 6-field grid: Beneficiary | Account Number | Cheque Date | Branch Name | Cheque Number | Return Reason
    - Digital Scan Preview placeholder (for cheque front/back images)
  - **RIGHT COLUMN**:
    - Settlement Amount card (PKR amount, cheque number)
    - Mark for Return card:
      - Return Reason Code dropdown (SBP-01 through SBP-08)
      - Selected reason label display
      - Internal Flag toggle checkbox
      - Officer Remarks textarea
      - Warning box: "Final Confirmation Required"
      - **Finalize & Mark Return** button (with spinner during submit)
      - **Back to List** button
- Loading state: "Loading return detail..."
- Not found state: "No return detail found."

**API Endpoints**:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/outward/ChequeInfo/return-detail/{id}` | Fetch full return detail |
| PUT | `/outward/ChequeInfo/mark-return/{id}` | Mark cheque as returned |

**Return Detail Response**:
```json
{
  "status": "success",
  "data": {
    "beneficiaryTitle": "Hassan Ahmed Khan",
    "accountNo": "0010-0062744-010",
    "chequeDate": "2026-10-22T00:00:00",
    "branchName": "I.I Chundrigar Road 00011",
    "returnReason": "Insufficient Funds",
    "chequeNo": "77452168",
    "amount": 85750,
    "imageF": "",
    "imageB": "",
    "imageU": ""
  },
  "statusCode": 200,
  "errorMessage": null
}
```

**Mark Return Response**:
```json
{
  "status": "success",
  "data": "Cheque marked as return successfully",
  "statusCode": 200,
  "errorMessage": null
}
```

**Return Reason Codes** (SBP Standard):
| Code | Label |
|------|-------|
| SBP-01 | Insufficient Funds |
| SBP-02 | Account Closed |
| SBP-03 | Payment Stopped |
| SBP-04 | Post Dated |
| SBP-05 | Signature Mismatch |
| SBP-06 | Instruments Altered |
| SBP-07 | Refer to Drawer |
| SBP-08 | Amount in Words & Figures Differ |

**Finalize Logic**:
1. User clicks "Finalize & Mark Return"
2. Button disables + shows spinner "Submitting..."
3. `PUT /outward/ChequeInfo/mark-return/{id}`
4. On success → SweetAlert success → OK → redirect to list
5. On error → SweetAlert error → stays on page

---

## 🔗 COMPLETE ROUTE MAP

| Route Path | Component | Screen |
|------------|-----------|--------|
| `/pages/outward-clearing/start-business-day` | StartBusinessDayComponent | Start Business Day |
| `/pages/outward-clearing/cheque-lodgment` | ChequeLodgmentListComponent | Cheque Lodgment List |
| `/pages/outward-clearing/cheque-lodgment/new` | ChequeLodgmentNewComponent | New Cheque Form |
| `/pages/outward-clearing/cheque-lodgment/scan/:id` | ChequeLodgmentScanComponent | Instrument Capture |
| `/pages/outward-clearing/cheque-lodgment/review/:id` | ChequeLodgmentReviewComponent | Review & Submit |
| `/pages/outward-clearing/cheque-lodgment/deposit-slip/:id` | ChequeLodgmentDepositSlipComponent | Deposit Slip |
| `/pages/outward-clearing/generate-clearing-file` | GenerateClearingFileComponent | Generate Clearing File |
| `/pages/outward-clearing/operational-overview` | OperationalOverviewComponent | Supervisor Approval |
| `/pages/outward-clearing/nift-reconciliation` | NiftReconciliationComponent | NIFT Reconciliation |
| `/pages/outward-clearing/fund-realization` | FundRealizationComponent | Fund Realization |
| `/pages/outward-clearing/return-marking-utility` | ReturnMarkingUtilityListComponent | Return List |
| `/pages/outward-clearing/return-marking-utility/:id` | ReturnMarkingUtilityComponent | Return Detail/Mark |

---

## 🔌 COMPLETE API ENDPOINT MAP

| # | Method | Endpoint | Used By |
|---|--------|----------|---------|
| 1 | GET | `/outward/BusinessDate` | Start Business Day |
| 2 | POST | `/outward/BusinessDate` | Start Business Day |
| 3 | GET | `/outward/ChequeInfo` | Cheque Lodgment List |
| 4 | GET | `/outward/ChequeInfo/{id}` | New Form, Review, Operational Detail |
| 5 | POST | `/outward/ChequeInfo` | Review & Submit (new) |
| 6 | PUT | `/outward/ChequeInfo/{id}` | Review & Submit (update) |
| 7 | GET | `/outward/ChequeInfo/supervisorList` | Operational Overview |
| 8 | PUT | `/outward/ChequeInfo/approve/{id}` | Operational Overview |
| 9 | PUT | `/outward/ChequeInfo/reject/{id}?remarks=...` | Operational Overview |
| 10 | GET | `/Filter/branch` | Generate Clearing File |
| 11 | GET | `/outward/ChequeInfo/generate-file?receiverBranchCode=...&date=...` | Generate Clearing File (Blob) |
| 12 | GET | `/outward/ChequeInfo/reconcile-list` | NIFT Reconciliation |
| 13 | POST | `/outward/ChequeInfo/upload-nift` | NIFT Reconciliation (multipart) |
| 14 | GET | `/outward/ChequeInfo/fund-realization-list` | Fund Realization |
| 15 | GET | `/outward/ChequeInfo/return-list` | Return Marking List |
| 16 | GET | `/outward/ChequeInfo/return-detail/{id}` | Return Marking Detail |
| 17 | PUT | `/outward/ChequeInfo/mark-return/{id}` | Mark Return |

---

## 🎨 UI/UX PATTERNS (Consistent Across All Screens)

1. **Cards**: Bootstrap `.card` with `.card-header.bg-light` and `.card-body`
2. **Tables**: `.table.table-hover.table-striped.table-sm` with `.thead.bg-light`
3. **Buttons**: Bootstrap `.btn.btn-primary` (Meezan purple), `.btn-outline-*` for secondary
4. **Icons**: Inline SVG icons (no icon library) — eye, pencil, document, etc.
5. **Alerts**: SweetAlert2 for confirmations, success, and error feedback
6. **Loading States**: "Loading..." text in table body, spinners on buttons
7. **Error States**: Red text in table body with error message
8. **Empty States**: "No records found" centered text in table
9. **Amounts**: Right-aligned, bold, formatted with PKR prefix and 2 decimals
10. **Search**: Instant client-side filtering with `.form-control-sm`
11. **Status Badges**: Colored pill badges (blue for status, etc.)
12. **SCSS Variables**: `$meezan-deep: #5a2181`, `$border: #e5e7eb`, `$text-primary: #1f2937`

---

## 📁 SERVICE FILE STRUCTURE

```
services/
├── start-business-day.service.ts     → BusinessDate GET/POST + BehaviorSubject
├── cheque-info.service.ts            → ChequeInfo CRUD (GET, GET/:id, POST, PUT)
├── filter.service.ts                 → Branch list for dropdowns
├── generate-clearing-file.service.ts → Generate file (Blob download)
├── operational-overview.service.ts   → Supervisor list, approve, reject
├── nift-reconciliation.service.ts    → Reconcile list, upload NIFT file
├── fund-realization.service.ts       → Fund realization list
└── return-marking-utility.service.ts → Return list, detail, mark-return
```

---

## 🔄 STANDARD API RESPONSE FORMAT

All APIs follow this consistent response envelope:

```json
{
  "status": "success",
  "data": { ... },
  "statusCode": 200,
  "errorMessage": null
}
```

For list endpoints, `data` contains:
```json
{
  "items": [ ... ],
  "totalCount": 0
}
```

For action endpoints (approve, reject, mark-return), `data` contains a success string message.

---

## 🏦 BUSINESS FLOW SUMMARY (End-to-End)

1. **Morning**: Branch officer opens **Start Business Day** → clicks Start → day is active
2. **During Day**: Teller opens **Cheque Lodgment** → enters depositor + cheque data → scans cheque → reviews → submits → deposit slip printed
3. **Supervisor**: Opens **Operational Overview** → reviews pending cheques → approves/rejects each one
4. **End of Day**: Officer opens **Generate Clearing File** → selects date + branch → downloads .txt file for NIFT
5. **Next Day / After NIFT Response**: Opens **NIFT Reconciliation** → uploads NIFT response file → system auto-matches → reviews unmatched items
6. **Matched Cheques**: Move to **Fund Realization** → select branches → process realization
7. **Returned Cheques**: Appear in **Return Marking Utility List** → officer clicks Edit → views detail → selects return reason → clicks "Finalize & Mark Return" → cheque officially returned

---

*This document covers the complete Outward Clearing flow for the Meezan Bank TekCandor Cheque Clearing System. Use this as the reference for building the MIRO board visualization.*
