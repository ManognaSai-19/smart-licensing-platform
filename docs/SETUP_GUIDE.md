# Smart Digital Licensing Platform - Local Development & Setup Guide

This guide describes how to configure, run, and evaluate the **Smart Digital Licensing Platform** on Windows, macOS, or Linux.

---

## 1. Prerequisites

Verify that the following development tools are installed on your workstation:

| Tool | Minimum Version | Tested Version | Command to Verify |
|---|:---:|:---:|---|
| **Java Development Kit (JDK)** | 21+ | JDK 23 (AMD64) | `java -version` |
| **Node.js** | 20+ | v24.22.1 | `node -v` |
| **npm** | 10+ | 11.19.1 | `npm -v` |
| **PostgreSQL** | 15+ | 18 (Local) | `psql --version` |
| **Git** | 2.x | 2.56.0.windows.2 | `git --version` |

---

## 2. PostgreSQL Configuration

1. **Start the PostgreSQL Service**:
   - On Windows:
     ```powershell
     net start postgresql-x64-18
     ```
   - On Linux/macOS:
     ```bash
     sudo systemctl start postgresql
     # or on macOS with brew:
     brew services start postgresql@16
     ```
2. **Create the Database**:
   Log into PostgreSQL using `psql` and create the development database:
   ```sql
   CREATE DATABASE smart_licensing;
   ```
3. **Environment Configuration**:
   Copy `.env.example` in the project root to `.env`:
   ```bash
   cp .env.example .env
   ```
   Ensure your database credentials match:
   ```properties
   SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/smart_licensing
   SPRING_DATASOURCE_USERNAME=postgres
   SPRING_DATASOURCE_PASSWORD=your_local_password
   JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
   ```
   *(Note: For rapid testing, the backend also includes an in-memory H2 configuration that activates automatically during automated JUnit test runs).*

---

## 3. Backend Setup & Run (Spring Boot 3)

The backend is built with Spring Boot 3.3.4, Spring Security, Flyway, and Maven.

1. **Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```
2. **Run the Automated Test Suite (100 Tests)**:
   ```powershell
   # Windows PowerShell:
   $env:JAVA_HOME = "C:\Program Files\Java\jdk-23"
   .\mvnw.cmd test

   # Linux / macOS:
   ./mvnw test
   ```
   *Expected Result*: `Tests run: 100, Failures: 0, Errors: 0, Skipped: 0 - BUILD SUCCESS`.

3. **Package the Executable Fat JAR**:
   ```powershell
   .\mvnw.cmd package -DskipTests
   ```
4. **Launch the Backend Server**:
   ```powershell
   java -jar target/smart-licensing-platform-0.1.0-SNAPSHOT.jar
   ```
   The backend starts on `http://localhost:8080`.
   Verify backend health:
   ```bash
   curl http://localhost:8080/api/health
   ```

---

## 4. Frontend Setup & Run (React 18 + Vite)

The frontend is built with React 18, TypeScript, Tailwind CSS, Lucide icons, and the Web Speech API.

1. **Navigate to the Frontend Directory**:
   ```bash
   cd frontend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Build Production Bundle (Verification)**:
   ```bash
   npm run build
   ```
   *Expected Result*: Zero TypeScript errors; outputs bundled assets to `dist/`.
4. **Start the Development Server**:
   ```bash
   npm run dev -- --host 0.0.0.0
   ```
   Open your browser to: **`http://localhost:5173`**.

---

## 5. Pre-Seeded Demonstration Accounts

For academic review, testing, and evaluation, the backend automatically seeds four designated test accounts upon initialization:

| Role | Email | Password | Assigned Department / Scope |
|---|---|---|---|
| **Citizen (Demo)** | `citizen.tester@licensing.gov.in` | `Citizen@123` | Individual Applicant Portal |
| **Transport Officer** | `officer.transport@licensing.gov.in` | `Officer@123` | Department of Transport (`DEPT_TRANSPORT`) |
| **Municipal Officer** | `officer.municipal@licensing.gov.in` | `Officer@123` | Municipal Administration (`DEPT_MUNICIPAL`) |
| **Platform Administrator** | `admin@licensing.gov.in` | `Admin@123` | Platform-wide Oversight & Provisioning |

*(Tip: In the web UI, clicking "Sign In" displays convenient 1-click login buttons for all four seed roles, eliminating manual typing during demonstrations).*

---

## 6. Running the Research Benchmark

To evaluate the comparative performance of the baseline vs proposed pre-screening engine:
1. Open the UI at `http://localhost:5173` and click the **"Research Benchmark"** tab in the top navigation bar.
2. Click **"Run 60-Sample Benchmark"** to trigger live evaluation across all 5 synthetic cohorts.
3. Or trigger programmatically via `curl`:
   ```bash
   curl http://localhost:8080/api/research/benchmark
   ```
