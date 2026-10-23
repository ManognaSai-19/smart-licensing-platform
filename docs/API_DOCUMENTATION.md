# Smart Digital Licensing Platform - REST API Documentation

**Base URL**: `http://localhost:8080/api`  
**Authentication Scheme**: Bearer Token (`Authorization: Bearer <jwt-token>`)  
**Response Format**: JSON (`Content-Type: application/json`)  
**Security Headers**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'self'; frame-ancestors 'none';`

---

## 1. Authentication & Identity (`/api/auth`)

### 1.1 Register Citizen
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Description**: Registers a new citizen user. Role is strictly assigned as `CITIZEN` regardless of input.
- **Request Body**:
  ```json
  {
    "email": "citizen@example.com",
    "password": "SecurePassword123!",
    "fullName": "Ramesh Kumar",
    "phoneNumber": "9876543210"
  }
  ```
- **Responses**:
  - `201 Created`: Returns JWT token, user ID, email, fullName, and role (`CITIZEN`).
  - `400 Bad Request`: Validation failure (weak password, invalid email format, missing fields).
  - `409 Conflict`: Email already registered.

### 1.2 User Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Description**: Verifies BCrypt password hash and generates stateless JWT.
- **Request Body**:
  ```json
  {
    "email": "officer.transport@licensing.gov.in",
    "password": "Officer@123"
  }
  ```
- **Responses**:
  - `200 OK`: Returns JWT token, user profile, and assigned role (`CITIZEN`, `OFFICER`, or `ADMIN`).
  - `401 Unauthorized`: Invalid email or password credentials.

### 1.3 Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Access**: Authenticated (`CITIZEN`, `OFFICER`, `ADMIN`)
- **Responses**:
  - `200 OK`: Returns authenticated user profile including department ID if assigned.
  - `401 Unauthorized`: Token missing or expired.

---

## 2. Service Catalogue (`/api/services`, `/api/departments`)

### 2.1 List Active Services
- **Endpoint**: `GET /api/services`
- **Access**: Public
- **Responses**:
  - `200 OK`: Returns array of active services with department affiliation, fee, and processing days.

### 2.2 Get Service Schema & Document Checklist
- **Endpoint**: `GET /api/services/{id}`
- **Access**: Public
- **Description**: Returns dynamic form schema (`service_fields`) and required document types (`required_document_types`) in English and Telugu.
- **Responses**:
  - `200 OK`: Full service definition with JSON validation rules.
  - `404 Not Found`: Service does not exist.

### 2.3 Provision New Service (Admin)
- **Endpoint**: `POST /api/services`
- **Access**: Admin (`hasRole('ADMIN')`)
- **Request Body**:
  ```json
  {
    "code": "SRV_TRADE_LICENSE",
    "name": "Trade & Commercial License",
    "description": "Municipal trade permit for commercial shops",
    "departmentId": 2,
    "sampleFee": 500.0,
    "processingTimeDays": 10,
    "active": true
  }
  ```
- **Responses**:
  - `201 Created`: Newly provisioned service record.
  - `403 Forbidden`: Non-admin caller.

### 2.4 Deactivate Service (Admin)
- **Endpoint**: `DELETE /api/services/{id}`
- **Access**: Admin (`hasRole('ADMIN')`)
- **Responses**:
  - `204 No Content`: Soft-deactivated service.
  - `404 Not Found`: Service not found.

---

## 3. Citizen Application Workflow (`/api/applications`)

### 3.1 Initialize Application Draft
- **Endpoint**: `POST /api/applications/draft`
- **Access**: Citizen (`hasRole('CITIZEN')`)
- **Request Body**:
  ```json
  {
    "serviceId": 1
  }
  ```
- **Responses**:
  - `201 Created`: Returns unique reference number (`APP-YYYYMMDD-XXXXX`) and initial `DRAFT` state.

### 3.2 Update Draft Form Data
- **Endpoint**: `PUT /api/applications/{id}/draft`
- **Access**: Citizen (Owner only)
- **Request Body**:
  ```json
  {
    "formData": {
      "fullName": "Ramesh Kumar",
      "dateOfBirth": "1990-05-15",
      "aadhaarNumber": "987654321012",
      "residentialAddress": "Flat 402, Gandhi Nagar, Hyderabad"
    }
  }
  ```
- **Responses**:
  - `200 OK`: Updated application summary.
  - `403 Forbidden`: Caller does not own this application.
  - `409 Conflict`: Application is not in `DRAFT` or `REJECTED` state.

### 3.3 Submit Application
- **Endpoint**: `POST /api/applications/{id}/submit`
- **Access**: Citizen (Owner only)
- **Request Body**:
  ```json
  {
    "declarationAccepted": true
  }
  ```
- **Responses**:
  - `200 OK`: Application transitioned to `SUBMITTED`, routed to assigned department queue.
  - `400 Bad Request`: Mandatory fields or document checklist requirements missing.
  - `409 Conflict`: Application already submitted.

### 3.4 Resubmit Rejected Application
- **Endpoint**: `POST /api/applications/{id}/resubmit`
- **Access**: Citizen (Owner only)
- **Request Body**:
  ```json
  {
    "formData": { ... },
    "resubmissionNotes": "Updated corrected residential address proof."
  }
  ```
- **Responses**:
  - `200 OK`: Transitioned from `REJECTED` to `RESUBMITTED` and re-queued for verification.

### 3.5 Get Citizen Application Dossier
- **Endpoint**: `GET /api/applications/{id}`
- **Access**: Citizen Owner, Department Officer, or Admin
- **Responses**:
  - `200 OK`: Complete application dossier including parsed form data, document checklist, status history, and review decisions.
  - `403 Forbidden`: IDOR protection violation.

---

## 4. Document Management & Private Storage (`/api/applications/{id}/documents`)

### 4.1 Upload Supporting Document
- **Endpoint**: `POST /api/applications/{id}/documents`
- **Access**: Citizen (Owner only)
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file`: Binary file (PDF, JPEG, PNG, max 10MB)
  - `documentTypeId`: Long
- **Validation**:
  - Magic-byte binary verification (`%PDF-`, `0xFF, 0xD8`, `0x89, 0x50, 0x4E, 0x47`).
  - Path traversal filename sanitization.
  - SHA-256 integrity checksum calculation.
- **Responses**:
  - `201 Created`: Document metadata with unique unguessable storage key.
  - `400 Bad Request`: Corrupted header, illegal file type, or size exceeded.

### 4.2 Authorized Document Stream Preview
- **Endpoint**: `GET /api/applications/{id}/documents/{docId}/preview`
- **Access**: Citizen Owner, Assigned Officer, or Admin
- **Responses**:
  - `200 OK`: Binary stream (`Content-Disposition: inline`).
  - `403 Forbidden`: Unauthorized attempt to stream another citizen's file.

### 4.3 Delete Uploaded Document
- **Endpoint**: `DELETE /api/applications/{id}/documents/{docId}`
- **Access**: Citizen Owner (Only in `DRAFT` or `REJECTED` state)
- **Responses**:
  - `204 No Content`: File purged from disk and database.

---

## 5. OCR & Explainable Pre-Screening (`/api/applications/{id}/prescreening`)

### 5.1 Trigger Pre-Screening Analysis
- **Endpoint**: `POST /api/applications/{id}/prescreening/trigger`
- **Access**: Citizen Owner, Assigned Officer, or Admin
- **Description**: Executes OCR extraction and evaluates 5 explainable rule groups (Completeness, Format, Levenshtein name match, DOB/ID verification, Scan Uncertainty).
- **Responses**:
  - `200 OK`: Prescreening summary response with findings list.

### 5.2 Retrieve Explainable Findings
- **Endpoint**: `GET /api/applications/{id}/prescreening/findings`
- **Access**: Authorized dossier stakeholders
- **Responses**:
  - `200 OK`: Returns structured findings with `PASS`, `WARNING`, `FAIL`, or `NEEDS_MANUAL_REVIEW`, expected vs extracted values, and corrective guidance.

---

## 6. Officer Adjudication Workflow (`/api/applications/officer`)

### 6.1 Department Officer Queue
- **Endpoint**: `GET /api/applications/officer/queue`
- **Access**: Officer (`hasRole('OFFICER')`)
- **Query Parameters**:
  - `status`: Optional filter (`SUBMITTED`, `UNDER_VERIFICATION`, `APPROVED`, `REJECTED`)
- **Description**: Returns all applications routed exclusively to the officer's assigned department.

### 6.2 Start Verification Review
- **Endpoint**: `POST /api/applications/{id}/start-review`
- **Access**: Officer (Assigned department only)
- **Responses**:
  - `200 OK`: Transitions status from `SUBMITTED`/`RESUBMITTED` to `UNDER_VERIFICATION`.
  - `403 Forbidden`: Officer attempted to review application outside their department.

### 6.3 Submit Adjudication Decision
- **Endpoint**: `POST /api/applications/{id}/decision`
- **Access**: Officer (Assigned department only)
- **Request Body**:
  ```json
  {
    "decision": "REJECTED",
    "rejectionReason": "Address proof document is obscured and does not match declared street address.",
    "notes": "Requested re-upload with clear high-resolution scan."
  }
  ```
- **Responses**:
  - `200 OK`: Atomic persistence of decision, status transition to `APPROVED` or `REJECTED`, and audit log creation.
  - `400 Bad Request`: `rejectionReason` omitted for a `REJECTED` decision.

---

## 7. Administrative Oversight & Audit (`/api/admin`)

### 7.1 Cross-Department Application Surveillance
- **Endpoint**: `GET /api/applications/admin/all`
- **Access**: Admin (`hasRole('ADMIN')`)
- **Query Parameters**:
  - `status`: Filter by state
  - `departmentId`: Filter by department
- **Responses**:
  - `200 OK`: Cross-department list of all system applications.

### 7.2 System Audit Trail Inspector
- **Endpoint**: `GET /api/admin/audit`
- **Access**: Admin (`hasRole('ADMIN')`)
- **Responses**:
  - `200 OK`: 100 most recent immutable audit log records with actor identity, action type, IP address, and payload.

### 7.3 System Health Metrics & Status Breakdown
- **Endpoint**: `GET /api/admin/system-stats`
- **Access**: Admin (`hasRole('ADMIN')`)
- **Responses**:
  - `200 OK`: Aggregated metrics (total users, citizen count, officer count, department count, service count, status breakdown map).

---

## 8. Research Benchmark & Empirical Evaluation (`/api/research`)

### 8.1 Execute Research Benchmark
- **Endpoint**: `GET /api/research/benchmark`
- **Access**: Public / Evaluators
- **Description**: Executes the standardized 60-sample synthetic benchmark comparison between the baseline exact-match rejection method and the proposed confidence-aware explainable pre-screening engine.
- **Responses**:
  - `200 OK`: Returns complete empirical evaluation payload with F1 scores, precision, recall, false rejection rates, cohort breakdown, and academic findings.
