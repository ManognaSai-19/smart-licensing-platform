# Smart Digital Licensing Platform - Phase Status & Evidence Log

## Project Overview
- **Title**: Smart Digital Licensing Platform
- **Subtitle**: A Voice-First, Explainable AI Framework for Accessible Digital Applications and Intelligent Document Pre-Screening
- **Current Phase**: Phase 7 (OCR & Explainable Pre-Screening Engine)
- **Status**: Completed Phase 7 implementation, pluggable OCR extraction engine, explainable rule engine (Completeness, Format, Levenshtein fuzzy match, Uncertainty/low quality flags), interactive findings dashboard, and full test suite (72/72 tests passing across all phases, 8 in Phase 7); awaiting user approval to proceed to Phase 8.

---

## Phase Gates Summary

| Phase | Description | Status | Evidence / Notes |
|---|---|---|---|
| **Phase 0** | Environment and Architecture | **COMPLETED & APPROVED** | Tool versions verified; architecture, data flow, DB schema, API design, research plan & risks documented. |
| **Phase 1** | Skeleton and Health Checks | **COMPLETED & APPROVED** | Backend Spring Boot 3 & Frontend React+Vite started locally; live health API communication verified end-to-end. |
| **Phase 2** | Database Migrations & Persistence | **COMPLETED & APPROVED** | 14 relational tables, 5 enums, 14 JPA entities, 14 repositories; clean Flyway migrations & persistence verified. |
| **Phase 3** | Authentication and Authorization | **COMPLETED & APPROVED** | Stateless JWT, BCrypt, role escalation prevention, citizen IDOR defense, officer department boundaries, audit logging. |
| **Phase 4** | Configurable Service Catalogue | **COMPLETED & APPROVED** | Dynamic JSON form schemas, multilingual Telugu/English definitions, public catalogue & admin mutation APIs, React interactive service catalogue. 37/37 automated tests passing. |
| **Phase 5** | Application Workflow & Lifecycle | **COMPLETED & APPROVED** | Draft persistence, schema-driven form validation, state transitions (DRAFT -> SUBMITTED -> UNDER_VERIFICATION -> APPROVED/REJECTED -> RESUBMITTED), IDOR enforcement, department queues, audit log tracking. 49/49 automated tests passing. |
| **Phase 6** | Private Document Management | **COMPLETED & APPROVED** | Private disk storage with UUID keys, binary magic-byte verification (PDF, JPEG, PNG), MIME/size checks, SHA-256 integrity checksums, IDOR defense, department boundary streaming, replacement/deletion, dynamic checklist status API, React upload component. 64/64 automated tests passing. |
| **Phase 7** | OCR & Explainable Pre-Screening | **READY FOR APPROVAL** | Pluggable OCR engine, confidence scoring, 5 explainable evaluation rule groups (Completeness, Format, Levenshtein name match, DOB/ID verification, Scan Uncertainty flags), interactive findings UI with diff comparison. 72/72 automated tests passing. |
| **Phase 8** | Voice-First Multilingual Assistance | PENDING | Awaiting Phase 7 approval. |
| **Phase 9** | Citizen User Interface | PENDING | - |
| **Phase 10** | Officer & Admin Dashboards | PENDING | - |
| **Phase 11** | Security, Accessibility & Regression | PENDING | - |
| **Phase 12** | Research Evaluation & Documentation | PENDING | - |

---

## Phase 5 Implementation & Verification Evidence

### 1. Artifacts Created & Configured
- **Exceptions** (`backend/src/main/java/com/licensing/platform/exception/`):
  - `InvalidStateTransitionException.java`: Thrown when illegal status changes are requested (HTTP 409 Conflict).
  - `ValidationException.java`: Thrown when dynamic form payloads fail required, data type, or rule checks (HTTP 400 Bad Request with field-level errors).
  - Updated `GlobalExceptionHandler.java` to map `InvalidStateTransitionException` to 409 and `ValidationException` to 400 with a detailed field error map.
- **DTOs** (`backend/src/main/java/com/licensing/platform/dto/`):
  - `CreateApplicationRequest`, `UpdateDraftRequest`, `SubmitApplicationRequest`: Citizen application payloads.
  - `ReviewDecisionRequest`: Officer decision payload (`APPROVED`/`REJECTED` with required `rejectionReason`).
  - `ApplicationSummaryResponse`, `ApplicationDetailResponse`: Comprehensive application views with parsed dynamic form JSON, status history, review decisions, and document checklist.
  - `ApplicationStatusHistoryResponse`, `ReviewDecisionResponse`: Audit tracking responses.
- **Validation Engine** (`backend/src/main/java/com/licensing/platform/service/FormDataValidationService.java`):
  - Validates submitted form JSON against `service_fields` dynamic schema.
  - Enforces required fields, data types (`TEXT`, `NUMBER`, `DATE`, `SELECT`), and JSON rule constraints (`minLength`, `maxLength`, `min`, `max`, `regex`, `minAgeYears`).
- **Workflow Service & State Machine** (`backend/src/main/java/com/licensing/platform/service/ApplicationWorkflowService.java`):
  - Unique human-readable reference number generator (`APP-YYYYMMDD-XXXXX`).
  - Draft management: Create initial draft, incrementally update draft fields.
  - Submission (`DRAFT` -> `SUBMITTED`): Validates all required fields and JSON rules.
  - Resubmission (`REJECTED` -> `RESUBMITTED`): Validates updated form data and transitions state.
  - Review Commencement (`SUBMITTED`/`RESUBMITTED` -> `UNDER_VERIFICATION`): Officer assigned department check.
  - Final Decision (`UNDER_VERIFICATION` -> `APPROVED`/`REJECTED`): Validates mandatory rejection reason; stores decision and generates citizen notification.
  - Status history logging with timestamps, actor attribution, and transition notes.
  - IDOR protection: Citizens cannot access other citizens' applications; officers cannot access applications outside their assigned departments.
- **Controller** (`backend/src/main/java/com/licensing/platform/controller/ApplicationController.java`):
  - Citizen endpoints: `POST /api/applications/draft`, `PUT /api/applications/{id}/draft`, `POST /api/applications/{id}/submit`, `POST /api/applications/{id}/resubmit`, `GET /api/applications/my-applications`.
  - Officer endpoints: `GET /api/applications/officer/queue`, `POST /api/applications/{id}/start-review`, `POST /api/applications/{id}/decision`.
  - Cross-role detail endpoint: `GET /api/applications/{id}` (secured with fine-grained access control).
  - Admin endpoint: `GET /api/applications/admin/all` (supports department and status filtering).

### 2. Automated Test Execution Evidence
- Command: `backend/mvnw.cmd test`
- Results:
  ```
  [INFO] Running com.licensing.platform.ApplicationWorkflowTest
  [INFO] Tests run: 12, Failures: 0, Errors: 0, Skipped: 0 -- in com.licensing.platform.ApplicationWorkflowTest
  [INFO] Running com.licensing.platform.AuthenticationAndAuthorizationTest
  [INFO] Tests run: 15, Failures: 0, Errors: 0, Skipped: 0 -- in com.licensing.platform.AuthenticationAndAuthorizationTest
  [INFO] Running com.licensing.platform.DatabaseMigrationAndPersistenceTest
  [INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0 -- in com.licensing.platform.DatabaseMigrationAndPersistenceTest
  [INFO] Running com.licensing.platform.HealthControllerTest
  [INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0 -- in com.licensing.platform.HealthControllerTest
  [INFO] Running com.licensing.platform.ServiceCatalogueTest
  [INFO] Tests run: 18, Failures: 0, Errors: 0, Skipped: 0 -- in com.licensing.platform.ServiceCatalogueTest
  [INFO] 
  [INFO] Results:
  [INFO] 
  [INFO] Tests run: 49, Failures: 0, Errors: 0, Skipped: 0
  [INFO] 
  [INFO] BUILD SUCCESS
  [INFO] Total time: 45.539 s
  ```
- Detailed Phase 5 Verifications in `ApplicationWorkflowTest`:
  1. `testCreateDraftApplicationSuccess`: Citizen can initialize draft application with auto-generated reference number.
  2. `testUpdateDraftApplicationSuccess`: Citizen can save partial form fields incrementally in DRAFT state.
  3. `testSubmitApplicationMissingRequiredFieldsReturns400`: Form validation rejects missing mandatory fields (`fullName`, `dateOfBirth`, etc.).
  4. `testSubmitApplicationViolatingRegexAndAgeReturns400`: Form validation rejects invalid Aadhaar format and underage date of birth.
  5. `testSubmitApplicationSuccess`: Valid payload successfully transitions application from `DRAFT` to `SUBMITTED`.
  6. `testSubmitAlreadySubmittedApplicationReturns409`: State machine blocks illegal re-submission of already submitted application.
  7. `testCitizenCannotAccessAnotherCitizenApplicationReturns403`: Strict IDOR enforcement prevents cross-citizen data leaks.
  8. `testOfficerCannotAccessApplicationOutsideDepartmentReturns403`: Officer from Municipal department is denied access to Transport department application.
  9. `testOfficerStartsReviewOnSubmittedApplication`: Officer in assigned department transitions application from `SUBMITTED` to `UNDER_VERIFICATION`.
  10. `testRejectApplicationWithoutReasonReturns400`: Officer rejection without explanatory reason is rejected.
  11. `testCompleteLifecycleWorkflow`: Complete end-to-end lifecycle verified (`DRAFT` -> `SUBMITTED` -> `UNDER_VERIFICATION` -> `REJECTED` -> `RESUBMITTED` -> `UNDER_VERIFICATION` -> `APPROVED`), with 7 status history audit entries and 2 review decisions.
  12. `testAdminOversightOfApplications`: Admin has full cross-departmental oversight to view, search, and filter all applications.

---

## Phase 6 Implementation & Verification Evidence

### 1. Artifacts Created & Configured
- **Storage Configuration**:
  - `backend/src/main/resources/application.properties` & `backend/src/test/resources/application.properties`: Configured `app.storage.upload-dir`, `spring.servlet.multipart.max-file-size=10MB`, `spring.servlet.multipart.max-request-size=25MB`.
- **Private Storage Engine** (`backend/src/main/java/com/licensing/platform/service/DocumentStorageService.java`):
  - Manages isolated disk directory outside web root.
  - Generates unguessable UUID storage keys (`app_{appId}/{UUID}_{sanitizedFileName}`).
  - Validates binary magic-byte signatures:
    - PDF: starts with `%PDF-` (`0x25, 0x50, 0x44, 0x46`)
    - JPEG: starts with `0xFF, 0xD8, 0xFF`
    - PNG: starts with `0x89, 0x50, 0x4E, 0x47`
  - Rejects binary header mismatches, spoofed extensions, path traversal (`..`, `/`, `\`), empty files, and oversized uploads.
  - Calculates SHA-256 binary hash checksums.
  - Provides streaming `Resource` resolution and file deletion.
- **DTOs** (`backend/src/main/java/com/licensing/platform/dto/`):
  - `DocumentUploadResponse`: Detailed document metadata including `storageKey`, `fileChecksum`, `previewUrl`, `downloadUrl`.
  - `DocumentChecklistStatusResponse`: Dynamic checklist showing requirement state, upload status, accepted formats, and document IDs.
- **Service Layer** (`backend/src/main/java/com/licensing/platform/service/DocumentService.java`):
  - `uploadDocument`: Enforces citizen ownership, `DRAFT`/`REJECTED` lifecycle gate, service document type matching, magic-byte inspection, in-place document replacement without orphaned duplicates, and audit logging.
  - `getApplicationDocuments`: Retrieves all uploaded documents with citizen/officer/admin access checks.
  - `getDocumentChecklistStatus`: Enriches service requirement checklist with live upload states.
  - `getDocumentEntity` & `getDocumentResource`: Streaming authorization checks (citizen owner, department-assigned officer, or admin).
  - `deleteDocument`: Physical file and database cleanup with state gating (`DRAFT`/`REJECTED` only).
  - `validateMandatoryDocuments`: Confirms presence of all required documents before final submission.
- **Controller Layer** (`backend/src/main/java/com/licensing/platform/controller/DocumentController.java`):
  - `POST /api/applications/{id}/documents` (multipart: file, `documentTypeId`) — Citizen upload.
  - `GET /api/applications/{id}/documents` — List uploaded documents.
  - `GET /api/applications/{id}/documents/checklist` — Dynamic checklist status.
  - `GET /api/applications/{id}/documents/{docId}/preview` — In-browser inline streaming with MIME headers.
  - `GET /api/applications/{id}/documents/{docId}/download` — Attachment download.
  - `DELETE /api/applications/{id}/documents/{docId}` — Document removal.
  - `POST /api/applications/{id}/documents/validate-checklist` — Programmatic checklist validation.
- **Exception Handling** (`GlobalExceptionHandler.java`):
  - Added dedicated handler for `MaxUploadSizeExceededException` (HTTP 400 Bad Request).
- **Frontend Integration**:
  - `frontend/src/types/document.ts`: TypeScript interfaces for `DocumentUploadResponse` and `DocumentChecklistStatus`.
  - `frontend/src/services/documentApi.ts`: Type-safe REST client for upload, deletion, checklist status, and validation.
  - `frontend/src/components/DocumentUploadSection.tsx`: Interactive React component with bilingual labels (English/Telugu), status indicators, format/size badges, file upload triggers, replace/remove buttons, and preview/download links.

### 2. Automated Test Execution Evidence
- Command: `backend/mvnw.cmd test`
- Results:
  ```
  [INFO] Running com.licensing.platform.ApplicationWorkflowTest
  [INFO] Tests run: 12, Failures: 0, Errors: 0, Skipped: 0 -- in com.licensing.platform.ApplicationWorkflowTest
  [INFO] Running com.licensing.platform.AuthenticationAndAuthorizationTest
  [INFO] Tests run: 15, Failures: 0, Errors: 0, Skipped: 0 -- in com.licensing.platform.AuthenticationAndAuthorizationTest
  [INFO] Running com.licensing.platform.DatabaseMigrationAndPersistenceTest
  [INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0 -- in com.licensing.platform.DatabaseMigrationAndPersistenceTest
  [INFO] Running com.licensing.platform.DocumentManagementTest
  [INFO] Tests run: 15, Failures: 0, Errors: 0, Skipped: 0 -- in com.licensing.platform.DocumentManagementTest
  [INFO] Running com.licensing.platform.HealthControllerTest
  [INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0 -- in com.licensing.platform.HealthControllerTest
  [INFO] Running com.licensing.platform.ServiceCatalogueTest
  [INFO] Tests run: 18, Failures: 0, Errors: 0, Skipped: 0 -- in com.licensing.platform.ServiceCatalogueTest
  [INFO] 
  [INFO] Results:
  [INFO] 
  [INFO] Tests run: 64, Failures: 0, Errors: 0, Skipped: 0
  [INFO] 
  [INFO] BUILD SUCCESS
  [INFO] Total time: 52.047 s
  ```
- Detailed Phase 6 Verifications in `DocumentManagementTest`:
  1. `testUploadValidPdfDocumentSuccess`: Citizen uploads authentic PDF; verified binary `%PDF-` header, disk storage, SHA-256 checksum, and metadata.
  2. `testUploadValidJpegDocumentSuccess`: Citizen uploads authentic JPEG; verified `image/jpeg` magic bytes (`0xFF, 0xD8, 0xFF`).
  3. `testUploadValidPngDocumentSuccess`: Citizen uploads authentic PNG; verified `image/png` magic bytes (`0x89, 0x50, 0x4E, 0x47`).
  4. `testUploadSpoofedFileFailsMagicByteValidation`: ASCII text spoofed as `.pdf` with declared `application/pdf` is rejected with 400 Bad Request.
  5. `testUploadOversizedFileReturns400`: File exceeding `maxSizeBytes` (5 MB) is rejected with 400 Bad Request.
  6. `testPathTraversalFilenameRejected`: Filename containing `../../etc/passwd.pdf` is rejected with 400 Bad Request.
  7. `testUploadDocumentToOtherCitizenApplicationReturns403`: IDOR check prevents Citizen B uploading to Citizen A's application.
  8. `testUploadDocumentAfterSubmissionReturnsConflict`: State machine blocks document uploads once application has transitioned to `SUBMITTED`.
  9. `testPreviewAndDownloadDocumentAsOwner`: Streams file bytes with correct security headers (`Content-Type`, `Content-Disposition`, `Cache-Control`).
  10. `testPreviewDocumentOtherCitizenReturns403`: Citizen B is forbidden from previewing Citizen A's documents.
  11. `testOfficerDepartmentIsolationForDocuments`: Department boundary verified — Transport Officer can preview; Municipal Officer is denied 403 Forbidden.
  12. `testDocumentReplacementForSameDocumentType`: Uploading a new file for the same document type replaces the old file on disk and in DB without orphan records.
  13. `testDocumentDeletionLifecycle`: Citizen can delete document while in `DRAFT`; physical file and record cleaned up; deleted in `SUBMITTED` rejected.
  14. `testGetDocumentChecklistStatus`: Returns complete checklist of service requirements with dynamic uploaded/missing flags.
  15. `testMandatoryDocumentChecklistValidation`: Validates presence of mandatory documents; blocks incomplete applications and confirms completed ones.

---

## Phase 7 Implementation & Verification Evidence

### 1. Artifacts Created & Configured
- **Pluggable OCR Engine** (`backend/src/main/java/com/licensing/platform/ocr/`):
  - `OcrEngine.java`: Universal OCR engine interface exposing engine metadata, availability, and structured extraction.
  - `OcrResult.java`: Result carrier storing engine metadata, raw extracted text, parsed entity fields map, and confidence score.
  - `RuleBasedDocumentParser.java`: High-precision deterministic parser for document entity extraction (Name, DOB, ID/Aadhaar, Address), with automatic quality entropy detection (`[LOW_QUALITY]`, `[DEGRADED_SCAN]`).
  - `OcrOrchestratorService.java`: Manages OCR workflow, disk resolution, and persistence into `ocr_extractions` table.
- **DTOs** (`backend/src/main/java/com/licensing/platform/dto/`):
  - `PrescreeningFindingResponse`: Detailed explainable finding with `ruleCode`, `outcome` (`PASS`, `WARNING`, `FAIL`, `NEEDS_MANUAL_REVIEW`), `explanation`, `suggestedAction`, and expected vs. extracted diff values.
  - `OcrExtractionResponse`: Extracted text, confidence score, and parsed fields map.
  - `PrescreeningSummaryResponse`: Overall status (`PASSED`, `HAS_WARNINGS`, `HAS_FAILS`, `NEEDS_MANUAL_REVIEW`), counter aggregates, average confidence, and full finding list.
- **Explainable Pre-Screening Engine** (`backend/src/main/java/com/licensing/platform/service/PrescreeningEngineService.java`):
  - **Rule 1 (`RULE_COMPLETENESS_FORM`)**: Verifies presence of all mandatory form fields.
  - **Rule 2 (`RULE_COMPLETENESS_DOCS`)**: Verifies presence of all required supporting documents.
  - **Rule 3 (`RULE_FORMAT_FIELDS` & `RULE_FORMAT_AGE`)**: Validates regex formats (Aadhaar 12-digit pattern) and minimum age requirements (18 years for DL).
  - **Rule 4 (`RULE_MATCH_NAME`, `RULE_MATCH_DOB`, `RULE_MATCH_ID`)**:
    - Normalized string comparison with Levenshtein distance:
      - Similarity $\ge 99\%$: `PASS`
      - $60\% \le \text{Similarity} < 99\%$: `WARNING` with explainable advice for minor spelling/abbreviation variations.
      - Similarity $< 60\%$: `FAIL` with clear discrepancy notice.
    - DOB format normalization (`YYYY-MM-DD` vs `DD/MM/YYYY`).
    - ID number whitespace/delimiter normalization.
  - **Rule 5 (`RULE_UNCERTAINTY_QUALITY`)**:
    - Low OCR confidence (< 70%) generates `NEEDS_MANUAL_REVIEW` finding, routing to human officer visual review without citizen penalty.
- **Controller** (`backend/src/main/java/com/licensing/platform/controller/PrescreeningController.java`):
  - `POST /api/applications/{id}/prescreening/run` — Trigger OCR extraction & rule evaluation.
  - `GET /api/applications/{id}/prescreening/summary` — Overview metrics & status.
  - `GET /api/applications/{id}/prescreening/findings` — Detailed explainable finding list.
- **Frontend Dashboard** (`frontend/src/components/PrescreeningFindingsView.tsx`):
  - Status banner (`PASSED`, `NEEDS MANUAL REVIEW`, `WARNINGS`, `FAILS`).
  - Metric counters for Pass, Warning, Fail, Officer Review, and Average Confidence %.
  - Filter tabs (All, Fail, Warning, Needs Review, Pass).
  - Value comparison diff view (Expected / Form vs Extracted / Document).
  - OCR extraction entity inspection drawer.
  - Interactive "Run Pre-Screening" action button.

### 2. Automated Test Execution Evidence
- Command: `backend/mvnw.cmd test`
- Results:
  ```
  [INFO] Running com.licensing.platform.ApplicationWorkflowTest
  [INFO] Tests run: 12, Failures: 0, Errors: 0, Skipped: 0 -- in com.licensing.platform.ApplicationWorkflowTest
  [INFO] Running com.licensing.platform.AuthenticationAndAuthorizationTest
  [INFO] Tests run: 15, Failures: 0, Errors: 0, Skipped: 0 -- in com.licensing.platform.AuthenticationAndAuthorizationTest
  [INFO] Running com.licensing.platform.DatabaseMigrationAndPersistenceTest
  [INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0 -- in com.licensing.platform.DatabaseMigrationAndPersistenceTest
  [INFO] Running com.licensing.platform.DocumentManagementTest
  [INFO] Tests run: 15, Failures: 0, Errors: 0, Skipped: 0 -- in com.licensing.platform.DocumentManagementTest
  [INFO] Running com.licensing.platform.HealthControllerTest
  [INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0 -- in com.licensing.platform.HealthControllerTest
  [INFO] Running com.licensing.platform.PrescreeningAndOcrTest
  [INFO] Tests run: 8, Failures: 0, Errors: 0, Skipped: 0 -- in com.licensing.platform.PrescreeningAndOcrTest
  [INFO] Running com.licensing.platform.ServiceCatalogueTest
  [INFO] Tests run: 18, Failures: 0, Errors: 0, Skipped: 0 -- in com.licensing.platform.ServiceCatalogueTest
  [INFO] 
  [INFO] Results:
  [INFO] 
  [INFO] Tests run: 72, Failures: 0, Errors: 0, Skipped: 0
  [INFO] 
  [INFO] BUILD SUCCESS
  [INFO] Total time: 01:09 min
  ```
- Detailed Phase 7 Verifications in `PrescreeningAndOcrTest`:
  1. `testGroupAPerfectMatchPrescreening`: Verified Group A evaluation — perfectly matching form and document data yields `PASSED` status with 0 fails and $\ge 90\%$ average confidence; advisory nature verified (application remains in `DRAFT`).
  2. `testGroupBMissingFieldsAndDocuments`: Verified Group B evaluation — missing mandatory fields and documents produce `FAIL` completeness findings with `HAS_FAILS` overall status.
  3. `testGroupCFormatAndAgeViolations`: Verified Group C evaluation — invalid Aadhaar format and underage date of birth produce `FAIL` format findings.
  4. `testGroupD1MinorNameSpellingVariationProducesWarning`: Verified Group D1 evaluation — minor name variation produces explainable `WARNING` with similarity percentage without auto-failing.
  5. `testGroupD2NameMismatchProducesFail`: Verified Group D2 evaluation — clear name mismatch between form and identity document produces explainable `FAIL` match finding.
  6. `testGroupEDegradedScanQualityProducesUncertaintyFlag`: Verified Group E evaluation — degraded scan quality produces `NEEDS_MANUAL_REVIEW` uncertainty flag, routing application for officer inspection without applicant penalty.
  7. `testCitizenIdorDefenseOnPrescreening`: Citizen B is denied 403 Forbidden from running or viewing Citizen A's pre-screening findings.
  8. `testOfficerDepartmentIsolationOnPrescreening`: Transport Officer can view pre-screening findings for Transport application; Municipal Officer is denied 403 Forbidden.

---

## Next Action
Wait for user review and explicit approval ("ok") of Phase 7 before starting Phase 8 (Voice-First Multilingual Assistance).
