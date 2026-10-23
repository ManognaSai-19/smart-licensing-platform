# Smart Digital Licensing Platform

> **Voice-first assistance • Explainable document pre-screening • Secure human-in-the-loop workflow**

An academic capstone prototype framework evaluating how multimodal voice-guided application completion combined with confidence-aware, explainable document pre-screening impacts digital public service accessibility and reduces application error rates without compromising security or human legal oversight.

---

## 🌟 Key Innovations & System Features

1. **Multimodal Voice-First Assistance**:
   - Web Speech API integration supporting bilingual English and Telugu (`te-IN`, `en-IN`).
   - Mandatory audio read-back confirmation ensuring no unconfirmed spoken input is saved or submitted.
   - Comprehensive keyboard/text fallback ensuring 100% of workflows remain accessible without microphone hardware.
2. **Explainable AI (XAI) Document Pre-Screening**:
   - Multi-stage fuzzy normalization (Levenshtein distance $\le 2$, similarity $\ge 0.85$) resilient against minor typos and whitespace variances.
   - 5 explainable evaluation rule groups: Completeness, Format, Levenshtein name match, DOB/ID verification, and Scan Uncertainty.
   - Non-punitive AI governance: degraded scans and low-confidence OCR ($< 0.70$) are safely routed to departmental officers rather than penalized as fraud.
3. **Strict Human-in-the-Loop (HITL) Adjudication**:
   - Final legal decisions are strictly reserved for authorized human officers.
   - Department-isolated queues preventing cross-department access (`DEPT_TRANSPORT` vs `DEPT_MUNICIPAL`).
   - Mandatory written explanations for all application rejections with resubmission support.
4. **Backend-Enforced Zero-Trust Security**:
   - Stateless JWT authentication with BCrypt password hashing.
   - Complete IDOR protection across citizen applications, private document streams, and officer queues.
   - Defense-in-depth against path traversal and magic-byte binary inspection (`%PDF-`, `0xFF, 0xD8`, `0x89, 0x50, 0x4E, 0x47`).
   - Strict OWASP security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Content-Security-Policy`.
5. **Configurable Dynamic Service Catalogue**:
   - Dynamic schema-driven forms with JSON validation rules.
   - Admin-provisioned services without code changes or redeployments.

---

## 📊 Empirical Research Benchmark Results

Evaluated against a standardized **60-sample synthetic labeled dataset** across 5 distinct applicant cohorts:

| Metric | Baseline (Strict Exact Match) | Proposed Framework (This Work) | Impact / Delta |
|---|:---:|:---:|:---:|
| **Anomaly Detection Precision** | 50.0% (0.500) | **100.0%** (1.000) | **+50.0%** |
| **Defect Detection Recall** | 100.0% (1.000) | **100.0%** (1.000) | Maintained |
| **F1-Score** | 0.667 | **1.000** | **+33.3%** |
| **False Rejection Rate (FRR)** | **66.7%** (24/36) | **0.0%** (0/36) | **Eliminated (0% false rejections)** |
| **Manual Review Routing Rate** | 0.0% (Hard fail) | **20.0%** (12/60) | Safe human triaging |
| **Average Processing Latency** | 0.002 ms | 0.034 ms | Sub-millisecond execution |

*(See [docs/RESEARCH_EVALUATION.md](docs/RESEARCH_EVALUATION.md) for full methodology and [docs/RESEARCH_PAPER_DRAFT.md](docs/RESEARCH_PAPER_DRAFT.md) for the complete academic paper).*

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide icons, Web Speech API (`SpeechRecognition`, `speechSynthesis`).
- **Backend**: Java 23 / 21, Spring Boot 3.3.4, Spring Security 6, Spring Data JPA, Hibernate, Jackson.
- **Database & Persistence**: PostgreSQL 18 with Flyway schema migrations (14 relational tables, 3 migrations).
- **Private Storage**: Isolated disk storage outside web root with SHA-256 integrity hashing and binary magic-byte verification.
- **Testing & Verification**: 100 automated backend integration tests across 11 test suites (0 regressions).

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- JDK 21+ (Tested with JDK 23)
- Node.js 20+ (Tested with v24.22.1) & npm 10+
- PostgreSQL 15+ (Local instance on port 5432)

### 2. Backend Startup
```bash
cd backend
# Run automated test suite (100 tests):
.\mvnw.cmd test

# Start Spring Boot application:
java -jar target/smart-licensing-platform-0.1.0-SNAPSHOT.jar
```
Backend runs on `http://localhost:8080`. Verify health: `curl http://localhost:8080/api/health`.

### 3. Frontend Startup
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```
Open browser at: **`http://localhost:5173`**.

---

## 👥 Demo Seed Accounts

| Role | Email | Password | Department / Scope |
|---|---|---|---|
| **Citizen (Applicant)** | `citizen.tester@licensing.gov.in` | `Citizen@123` | Individual Applicant Portal |
| **Transport Officer** | `officer.transport@licensing.gov.in` | `Officer@123` | Department of Transport (`DEPT_TRANSPORT`) |
| **Municipal Officer** | `officer.municipal@licensing.gov.in` | `Officer@123` | Municipal Administration (`DEPT_MUNICIPAL`) |
| **Platform Administrator** | `admin@licensing.gov.in` | `Admin@123` | Platform-wide Oversight & Configuration |

*(Tip: In the web UI, the "Sign In" modal includes 1-click login buttons for all four seed roles).*

---

## 📚 Capstone Documentation Index

- [**System Architecture Blueprint**](docs/ARCHITECTURE.md): Complete high-level architecture, component flow, and state machine diagrams.
- [**Empirical Research Evaluation Report**](docs/RESEARCH_EVALUATION.md): In-depth scientific report with formulas, benchmark dataset breakdown, and analysis.
- [**Academic Research Paper Draft**](docs/RESEARCH_PAPER_DRAFT.md): Complete IEEE-formatted research paper ready for conference or journal submission.
- [**REST API Documentation**](docs/API_DOCUMENTATION.md): Comprehensive OpenAPI-style specification for all 20+ endpoints.
- [**Database ER Diagram & Schema Specification**](docs/ER_DIAGRAM.md): Mermaid relational entity diagrams, constraints, foreign keys, and indexes.
- [**Local Development & Setup Guide**](docs/SETUP_GUIDE.md): Step-by-step developer setup, database provisioning, and troubleshooting.
- [**Capstone Defense & Demo Script**](docs/DEMO_SCRIPT.md): 10-minute presentation and walkthrough guide for academic examiners.
- [**Phase Status & Verification Log**](docs/PHASE_STATUS.md): Complete phase-gated evidence log covering Phases 0 through 12.
