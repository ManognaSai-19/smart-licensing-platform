# Smart Digital Licensing Platform - Phase Status & Evidence Log

## Project Overview
- **Title**: Smart Digital Licensing Platform
- **Subtitle**: A Voice-First, Explainable AI Framework for Accessible Digital Applications and Intelligent Document Pre-Screening
- **Current Phase**: Phase 9 (Citizen User Interface)
- **Status**: Completed Phase 9 implementation, full Citizen Dashboard, JWT reactive authentication context, 5-step guided digital application wizard (Service selection, dynamic schema form with inline/hands-free voice input, private document upload checklist with magic-byte validation, explainable AI pre-screening findings review, and final submission with declaration), application dossier details view with lifecycle audit timeline and rejection resubmission action, and verified full production build (`dist/assets/index-CEUgjYvi.js` 279.38 kB, `dist/assets/index-B1mncCp6.css` 42.94 kB); 81/81 automated backend tests passing across 8 test suites; awaiting user approval to proceed to Phase 10.

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
| **Phase 7** | OCR & Explainable Pre-Screening | **COMPLETED & APPROVED** | Pluggable OCR engine, confidence scoring, 5 explainable evaluation rule groups (Completeness, Format, Levenshtein name match, DOB/ID verification, Scan Uncertainty flags), interactive findings UI with diff comparison. 72/72 automated tests passing. |
| **Phase 8** | Voice-First Multilingual Assistance | **COMPLETED & APPROVED** | Web Speech API STT/TTS, bilingual guidance (English/Telugu), spoken normalization engine, audio read-back confirmation, privacy-by-design telemetry, voice wizard modal, normalization playground, live research stats. 81/81 automated tests passing. |
| **Phase 9** | Citizen User Interface | **READY FOR APPROVAL** | Citizen dashboard, reactive JWT AuthContext, AuthModal, 5-step ApplicationWizard (Service, Voice/Form, Docs, Pre-Screening, Submit), ApplicationDetailView with audit history & resubmit workflow, verified production build. |
| **Phase 10** | Officer & Admin Dashboards | PENDING | - |
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

## Phase 8 Implementation & Verification Evidence

### 1. Artifacts Created & Configured
- **Flyway Migration & JPA Entity**:
  - `backend/src/main/resources/db/migration/V3__voice_telemetry.sql`: Created `voice_interaction_logs` relational table storing interaction telemetry (application ID, service code, field key, language `te-IN`/`en-IN`, raw transcript, normalized value, confidence score, duration ms, correction count, user confirmation flag, and input mode `VOICE` vs `KEYBOARD_FALLBACK`).
  - `backend/src/main/java/com/licensing/platform/model/VoiceInteractionLog.java`: JPA entity with indexes on service code, field key, and creation timestamp.
  - `backend/src/main/java/com/licensing/platform/repository/VoiceInteractionLogRepository.java`: Custom repository queries for average confidence, average corrections, and language/input mode distributions.
- **DTOs** (`backend/src/main/java/com/licensing/platform/dto/`):
  - `VoicePromptDto.java`: Structured field guidance (field key, label, spoken prompt, spoken example, read-back confirmation template, options list, validation hint).
  - `VoiceServiceGuidanceResponse.java`: Service-level guidance wrapper with welcome, completion, and error prompts.
  - `VoiceNormalizationRequest.java` & `VoiceNormalizationResponse.java`: Spoken input payload with detected intent (`CONFIRM_YES`, `CONFIRM_NO`, `VALUE_INPUT`, `REPEAT`), normalized value, confidence score, and audio read-back text.
  - `VoiceTelemetryRequest.java` & `VoiceTelemetryResponse.java`: Interaction tracking payload for research evaluation.
  - `VoiceStatsResponse.java`: Aggregated usability metrics (total sessions, confirmation rate %, average confidence, average corrections, language breakdown, input mode breakdown).
- **Service Layer** (`backend/src/main/java/com/licensing/platform/service/VoiceGuidanceService.java`):
  - Multilingual guidance generator for all services (`SRV_DRIVING_LICENSE`, `SRV_TRADE_LICENSE`).
  - Spoken normalization engine:
    - Normalizes English words ("one two three four" -> `1234`) and Telugu words ("ఒకటి రెండు మూడు నాలుగు" -> `1234`).
    - Normalizes Telugu Unicode digits (౦-౯ -> `0-9`).
    - Normalizes spoken dates ("15th August 1995", "15 ఆగస్టు 1995" -> ISO `1995-08-15`).
    - Normalizes SELECT options (e.g., "o positive" / "ఓ పాజిటివ్" -> `O+`, "motorcycle with gear" -> `Motorcycle with Gear (MCWG)`).
    - Intent detection: detects spoken confirmations ("yes", "yeah", "అవును", "సరే" -> `CONFIRM_YES`; "no", "wrong", "కాదు", "తప్పు" -> `CONFIRM_NO`).
  - Telemetry logging and statistical aggregation for research evaluation without storing raw voice recordings (privacy-by-design).
- **Controller Layer** (`backend/src/main/java/com/licensing/platform/controller/VoiceController.java`):
  - `GET /api/voice/prompts/{serviceCode}?lang=en|te` — Public multilingual prompt dictionary.
  - `POST /api/voice/normalize` — Spoken speech transcript normalization & intent classifier.
  - `POST /api/voice/telemetry` — Voice interaction logging.
  - `GET /api/voice/telemetry/stats` — Usability & academic evaluation statistics.
  - Configured in `SecurityConfig.java` to permit smooth applicant interaction without authentication barriers.
- **Frontend Web Speech Architecture**:
  - `frontend/src/types/voice.ts`: TypeScript contracts for voice prompts, normalization, and telemetry.
  - `frontend/src/services/speechService.ts`: Progressive enhancement wrapper over Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition` and `SpeechSynthesis`). Features browser capability detection, Telugu (`te-IN`) and Indian English (`en-IN`) voice selection, interim result callbacks, speech rate/pitch control, and fallback handling.
  - `frontend/src/services/voiceApi.ts`: Type-safe REST client for prompts, normalization, and telemetry.
  - `frontend/src/components/VoiceInputButton.tsx`: Accessible single-field microphone trigger with animated listening pulse, live transcript preview, audio read-back confirmation, and keyboard fallback indicator.
  - `frontend/src/components/VoiceAssistantModal.tsx`: Step-by-step guided voice form assistant with speech synthesis prompts, real-time waveform listening animation, audio read-back verification ("You said [X]. Is this correct?"), automatic field advancement, and language toggle.
  - `frontend/src/components/VoiceDashboard.tsx`: Comprehensive voice interface tab in `App.tsx` featuring one-click assistant launch, audio test samples, interactive normalization playground, and live research telemetry dashboard.
  - `frontend/src/components/ServiceCatalogue.tsx`: Embedded "Voice Apply (Guided)" triggers on service cards and per-field voice mic buttons in the schema inspector.

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
  [INFO] Running com.licensing.platform.VoiceGuidanceTest
  [INFO] Tests run: 9, Failures: 0, Errors: 0, Skipped: 0 -- in com.licensing.platform.VoiceGuidanceTest
  [INFO] 
  [INFO] Results:
  [INFO] 
  [INFO] Tests run: 81, Failures: 0, Errors: 0, Skipped: 0
  [INFO] 
  [INFO] BUILD SUCCESS
  [INFO] Total time: 56.420 s
  ```
- Detailed Phase 8 Verifications in `VoiceGuidanceTest`:
  1. `testGetVoicePromptsForDrivingLicenseEnglish`: Verified English voice guidance structure, welcome prompt, field prompts ("full legal name"), example hints ("Ramesh Kumar"), read-back template, and SELECT options.
  2. `testGetVoicePromptsForDrivingLicenseTelugu`: Verified Telugu voice guidance structure, Telugu welcome message ("స్వాగతం"), Telugu labels ("పూర్తి పేరు"), and Telugu read-back templates ("మీరు {value} అన్నారు").
  3. `testGetVoicePromptsForNonExistentServiceReturns404`: Non-existent service code correctly yields HTTP 404 Not Found.
  4. `testNormalizeSpokenConfirmationIntents`: Spoken confirmations in English ("yes, that is correct") and Telugu ("అవును") correctly classify as `CONFIRM_YES`; cancellations ("no change it", "కాదు") classify as `CONFIRM_NO`.
  5. `testNormalizeNumericSpeech`: Verified numeric normalization across spoken English words ("nine eight seven..." -> `987654321012`), Telugu Unicode digits ("౫౦౦౦౦" -> `50000`), and spoken Telugu words ("ఒకటి రెండు మూడు..." -> `123456789012`).
  6. `testNormalizeDateSpeech`: Spoken English ("15th August 1995") and spoken Telugu ("15 ఆగస్టు 1995") normalize to standard ISO `1995-08-15`.
  7. `testNormalizeSelectSpeech`: Spoken blood group ("o positive" / "ఓ పాజిటివ్") normalizes to `O+`; spoken vehicle class ("motorcycle with gear") normalizes to `Motorcycle with Gear (MCWG)`.
  8. `testRecordVoiceTelemetryAndQueryStats`: Verified telemetry persistence across voice and keyboard fallback modes; verified statistical queries for total interactions, confirmation rate $\ge 90\%$, and language breakdowns.
  9. `testInvalidTelemetryPayloadReturns400`: Payloads missing mandatory fields are rejected with HTTP 400 Bad Request.
- Frontend Verification:
  - `npm run build` executed successfully: Vite transformed 1,578 modules, outputting production bundle `dist/assets/index-tALIc-U5.js` (205.39 kB) and `dist/assets/index-D8WFdXiJ.css` (36.77 kB) with zero TypeScript errors.

---

## Phase 9 Implementation & Verification Evidence

### 1. Artifacts Created & Configured
- **Authentication & Application Types & REST Clients**:
  - `frontend/src/types/auth.ts`: TypeScript contracts for `Role`, `User`, `LoginRequest`, `RegisterRequest`, and `AuthResponse`.
  - `frontend/src/types/application.ts`: TypeScript contracts for `ApplicationStatus` (`DRAFT`, `SUBMITTED`, `UNDER_VERIFICATION`, `APPROVED`, `REJECTED`, `RESUBMITTED`), `ApplicationSummary`, `ApplicationDetail`, `ApplicationStatusHistory`, and `ReviewDecision`.
  - `frontend/src/services/authApi.ts`: Type-safe REST client for citizen login, registration, token persistence in `localStorage`, and session management.
  - `frontend/src/services/applicationApi.ts`: Type-safe REST client for draft creation, updating, retrieval, final submission, and resubmission.
  - `frontend/src/context/AuthContext.tsx`: React Context provider supplying `user`, `token`, `login`, `register`, `logout`, and `isAuthenticated` across the entire application.
- **Citizen Portal UI Components**:
  - `frontend/src/components/AuthModal.tsx`: Secure citizen sign-in and registration modal with input validation, error banners, and demo citizen credential filler (`citizen.tester@example.com`).
  - `frontend/src/components/CitizenDashboard.tsx`:
    - Guest welcome state explaining voice assistance, pre-screening verification, and transparent tracking.
    - Authenticated citizen view with personal greeting, role badge, and 5 metric counters (Total, In Draft, Under Verification, Approved, Action Needed).
    - Applications list with search by reference number / service name, and status dropdown filter (`ALL`, `DRAFT`, `SUBMITTED`, `UNDER_VERIFICATION`, `APPROVED`, `REJECTED`).
    - Context-aware action buttons: "Continue Draft" for drafts, "Action Required / Resubmit" for rejected applications, and "View Dossier" for live inspection.
  - `frontend/src/components/ApplicationWizard.tsx`:
    - Complete 5-step guided digital application portal:
      - **Step 1: Select Service**: Service cards with fee, SLA days, department name, and "Apply Now" triggers calling `POST /api/applications` to initialize a draft.
      - **Step 2: Application Form**: Dynamic schema rendering (`TEXT`, `NUMBER`, `DATE`, `SELECT`), bilingual English/Telugu labels, inline `VoiceInputButton` on every field, "Launch Voice Assistant Wizard" trigger banner, validation rule display, and draft saving (`PUT /api/applications/{id}/draft`).
      - **Step 3: Upload Documents**: Integrates `DocumentUploadSection.tsx` with dynamic checklist, binary magic-byte verification, and private streaming preview.
      - **Step 4: Pre-Screening**: Integrates `PrescreeningFindingsView.tsx` with 1-click OCR extraction & rule evaluation, expected vs. extracted diffs, and corrective advice.
      - **Step 5: Review & Submit**: Comprehensive review card, citizen legal declaration checkbox, final submission (`POST /api/applications/{id}/submit` or `/resubmit`), and success modal displaying reference number (`APP-YYYYMMDD-XXXXX`).
  - `frontend/src/components/ApplicationDetailView.tsx`:
    - Full application dossier modal with reference number, status badge, service metadata, and refresh button.
    - Officer rejection alert banner displaying official reason and notes, with 1-click "Update Fields & Resubmit" button.
    - Two-tab layout: Application Form Data & Document Status vs. Complete Lifecycle Audit Timeline with transition history and actor attribution.
  - `frontend/src/App.tsx`:
    - Updated navigation with 4 primary tabs: **Citizen Portal**, **Service Catalogue**, **Voice Assistant**, and **System Health**.
    - User authentication pill in the top header showing citizen name and 1-click sign-out.

### 2. Automated Test & Build Execution Evidence
- Frontend Production Build:
  - Command: `$env:NODE_OPTIONS = "--use-system-ca"; npm run build`
  - Result:
    ```
    vite v5.4.21 building for production...
    transforming...
    ✓ 1589 modules transformed.
    rendering chunks...
    computing gzip size...
    dist/index.html                   0.48 kB │ gzip:  0.31 kB
    dist/assets/index-B1mncCp6.css   42.94 kB │ gzip:  7.95 kB
    dist/assets/index-CEUgjYvi.js   279.38 kB │ gzip: 75.92 kB
    ✓ built in 15.43s
    ```
  - Zero TypeScript compiler errors; clean production bundle generated.
- Backend Test Suite:
  - Command: `backend/mvnw.cmd test`
  - Result:
    ```
    [INFO] Tests run: 81, Failures: 0, Errors: 0, Skipped: 0
    [INFO] BUILD SUCCESS (Total time: 01:09 min)
    ```
  - All 81 automated tests passing across 8 test suites with 0 regressions.
- Live End-to-End Server Health:
  - Frontend dev server running on `http://localhost:5173` (HTTP 200 OK).
  - Backend Spring Boot server running on `http://localhost:8080` (HTTP 200 UP).

---

## Next Action
Wait for user review and explicit approval ("ok") of Phase 9 before proceeding to Phase 10 (Officer & Admin Dashboards).
