# Smart Digital Licensing Platform

> **Voice-first assistance • Explainable document pre-screening • Secure human-in-the-loop workflow**

An academic prototype framework for accessible, voice-guided digital service applications and explainable, confidence-aware document pre-screening.

---

## Architecture Overview

- **Frontend**: React 18 + TypeScript + Vite, Lucide icons, responsive accessible styling.
- **Backend**: Java 21 / 23 + Spring Boot 3.x REST API, Spring Security, JWT, BCrypt.
- **Database**: PostgreSQL 18 + Flyway migrations (configured in Phase 2).
- **OCR / Speech**: Replaceable OCR adapter and Web Speech API with explicit voice read-back and confirmation.
- **Private Storage**: Controlled local private storage adapter for applicant documents with strict ownership checks.

---

## Prerequisites

- **Java Development Kit**: JDK 21 or higher (Tested with JDK 23). `JAVA_HOME` configured.
- **Node.js**: v20 or higher (Tested with v24.22.1) and npm 10+.
- **PostgreSQL**: PostgreSQL 18 (Local instance on port 5432).
- **Git**: For version control.

---

## Getting Started

### 1. Environment Configuration
Copy `.env.example` to `.env` and fill in local values:
```bash
cp .env.example .env
```

### 2. Backend Setup & Run
From the project root:
```bash
cd backend
# Using Maven wrapper or local Maven:
mvn clean spring-boot:run
```
Backend will start on `http://localhost:8080`.
Verify backend health:
```bash
curl http://localhost:8080/api/health
```

### 3. Frontend Setup & Run
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173` and displays live health status from `http://localhost:8080/api/health`.

---

## Phase Status and Development Tracking

See [docs/PHASE_STATUS.md](docs/PHASE_STATUS.md) for the verified status of each phase.
See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architectural blueprints.
