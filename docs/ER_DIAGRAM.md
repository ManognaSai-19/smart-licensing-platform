# Database Architecture & Entity-Relationship (ER) Specification

## 1. Relational Entity-Relationship Diagram

```mermaid
erDiagram
    users ||--o{ applications : "submits (citizen)"
    users ||--o{ officer_department_assignments : "assigned to"
    users ||--o{ review_decisions : "adjudicates (officer)"
    users ||--o{ application_status_history : "transitions (actor)"
    users ||--o{ notifications : "receives"
    users ||--o{ audit_logs : "triggers (actor)"

    departments ||--o{ officer_department_assignments : "employs"
    departments ||--o{ services : "administers"

    services ||--o{ service_fields : "configures"
    services ||--o{ required_document_types : "requires"
    services ||--o{ applications : "instances"
    services ||--o{ voice_telemetry_logs : "collects"

    applications ||--o{ application_documents : "contains"
    applications ||--o{ prescreening_findings : "evaluates"
    applications ||--o{ review_decisions : "receives"
    applications ||--o{ application_status_history : "tracks"
    applications ||--o{ notifications : "concerns"

    application_documents ||--o{ ocr_extractions : "extracts"
    application_documents ||--o{ prescreening_findings : "references"
    required_document_types ||--o{ application_documents : "categorizes"

    users {
        bigint id PK
        varchar email UK
        varchar password_hash
        varchar full_name
        varchar phone_number
        varchar role "CITIZEN | OFFICER | ADMIN"
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    departments {
        bigint id PK
        varchar code UK "DEPT_TRANSPORT | DEPT_MUNICIPAL"
        varchar name
        text description
        timestamp created_at
    }

    officer_department_assignments {
        bigint id PK
        bigint officer_id FK
        bigint department_id FK
        timestamp created_at
    }

    services {
        bigint id PK
        varchar code UK "SRV_DRIVING_LICENSE | SRV_TRADE_LICENSE"
        varchar name
        text description
        bigint department_id FK
        decimal sample_fee
        integer processing_time_days
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    service_fields {
        bigint id PK
        bigint service_id FK
        varchar field_key
        varchar label_en
        varchar label_te
        varchar data_type "TEXT | NUMBER | DATE | SELECT"
        boolean is_required
        text validation_rules "JSON regex / min / max"
        integer display_order
    }

    required_document_types {
        bigint id PK
        bigint service_id FK
        varchar document_code
        varchar name_en
        varchar name_te
        boolean is_required
        varchar accepted_mime_types
        bigint max_size_bytes
    }

    applications {
        bigint id PK
        varchar reference_number UK "APP-YYYYMMDD-XXXXX"
        bigint citizen_id FK
        bigint service_id FK
        varchar status "DRAFT | SUBMITTED | UNDER_VERIFICATION | APPROVED | REJECTED | RESUBMITTED"
        text form_data "JSON serialized citizen inputs"
        timestamp submitted_at
        timestamp created_at
        timestamp updated_at
    }

    application_documents {
        bigint id PK
        bigint application_id FK
        bigint document_type_id FK
        varchar original_file_name
        varchar storage_key UK "app_1/UUID_filename"
        varchar content_type
        bigint file_size
        varchar file_checksum "SHA-256"
        timestamp created_at
    }

    ocr_extractions {
        bigint id PK
        bigint document_id FK
        varchar engine_name
        varchar engine_version
        text raw_text
        text extracted_fields "JSON map"
        decimal confidence_score
        varchar processing_status
        timestamp created_at
    }

    prescreening_findings {
        bigint id PK
        bigint application_id FK
        bigint document_id FK
        varchar rule_code
        varchar field_key
        varchar outcome "PASS | WARNING | FAIL | NEEDS_MANUAL_REVIEW"
        varchar expected_value
        varchar extracted_value
        text explanation
        text suggested_action
        decimal confidence
        timestamp created_at
    }

    review_decisions {
        bigint id PK
        bigint application_id FK
        bigint officer_id FK
        varchar decision "APPROVED | REJECTED"
        text reason
        text notes
        timestamp created_at
    }

    application_status_history {
        bigint id PK
        bigint application_id FK
        varchar from_status
        varchar to_status
        bigint changed_by_user_id FK
        text notes
        timestamp created_at
    }

    notifications {
        bigint id PK
        bigint recipient_id FK
        bigint application_id FK
        varchar title
        text message
        boolean is_read
        timestamp created_at
    }

    audit_logs {
        bigint id PK
        bigint actor_id FK
        varchar action
        varchar resource_type
        bigint resource_id
        varchar ip_address
        text details "JSON event payload"
        timestamp created_at
    }

    voice_telemetry_logs {
        bigint id PK
        varchar session_id
        varchar service_code
        varchar field_key
        varchar language "en-IN | te-IN"
        varchar input_mode "VOICE | KEYBOARD_FALLBACK"
        varchar recognized_text
        varchar normalized_value
        boolean confirmed
        integer retry_count
        timestamp created_at
    }
```

---

## 2. Relational Tables & Flyway Schema Evolution

The database persistence layer is version-controlled via Flyway migrations located in `backend/src/main/resources/db/migration/`:

### Migration V1: Core Relational Schema (`V1__init_schema.sql`)
1. `users`: Citizen, officer, and administrator credentials with BCrypt hashes.
2. `departments`: Administrative departments (`DEPT_TRANSPORT`, `DEPT_MUNICIPAL`).
3. `officer_department_assignments`: Junction table enforcing departmental scoping for officers.
4. `services`: Dynamic service catalogue definitions.
5. `service_fields`: Form field definitions with bilingual labels and JSON validation constraints.
6. `required_document_types`: Service-specific document requirements, MIME constraints, and size limits.
7. `applications`: Root application entity with state machine enum and JSON form data.
8. `application_documents`: Private document storage metadata and SHA-256 checksums.
9. `ocr_extractions`: Raw extracted text and JSON key-value pairs with confidence scoring.
10. `prescreening_findings`: Explainable rule evaluation findings with status outcomes.
11. `review_decisions`: Officer adjudication decisions with mandatory rejection reasoning.
12. `application_status_history`: Immutable lifecycle transition audit log.
13. `notifications`: In-app notification feed.
14. `audit_logs`: Platform-wide administrative audit trail.

### Migration V2: Configurable Seed Services (`V2__seed_services.sql`)
- Pre-seeds representative municipal and transport services:
  - `SRV_DRIVING_LICENSE`: Learner's driving license (4 dynamic fields, 2 required documents: ID Proof & Address Proof).
  - `SRV_TRADE_LICENSE`: Commercial municipal trade permit (5 dynamic fields, 2 required documents: Ownership Proof & ID Proof).

### Migration V3: Voice Telemetry & Accessibility Analytics (`V3__voice_telemetry.sql`)
- Introduces `voice_telemetry_logs` to collect privacy-safe telemetry on spoken recognition, normalization efficacy, and fallback rates.

---

## 3. Database Indexes & Performance Optimization

| Table | Index Name | Indexed Column(s) | Purpose |
|---|---|---|---|
| `users` | `idx_users_email` | `email` (Unique) | Rapid credential lookup during JWT authentication |
| `applications` | `idx_apps_reference` | `reference_number` (Unique) | Fast tracking query resolution |
| `applications` | `idx_apps_citizen` | `citizen_id` | Accelerates citizen dashboard query (`my-applications`) |
| `applications` | `idx_apps_status_dept` | `status`, `service_id` | Optimizes department officer queue filtering |
| `application_documents` | `idx_docs_app` | `application_id` | Fast dossier document assembly |
| `prescreening_findings` | `idx_findings_app` | `application_id` | Rapid loading of explainable pre-screening findings |
| `audit_logs` | `idx_audit_actor_created` | `actor_id`, `created_at DESC` | Powers administrative audit trail queries |
| `voice_telemetry_logs` | `idx_voice_telemetry_service` | `service_code`, `created_at` | Speeds up voice telemetry analytics dashboard |
