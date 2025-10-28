# CAT Modelling Software: Architecture & Developer Guide

This document provides a comprehensive overview of the CAT Modelling software, its architecture, development practices, and a strategic roadmap for future enhancements. It is intended for architects, developers, and product owners.

## 1. Project Vision & Goals

### 1.1. Mission

To build a scalable and robust full-stack application for catastrophe (CAT) risk modelling. The platform will support complex simulations, from data ingestion and hazard analysis to financial impact assessment, providing accurate and actionable insights for the insurance and reinsurance industry.

### 1.2. Core Objectives

-   **Data-Driven Simulation:** Implement a powerful engine capable of running complex Monte Carlo simulations based on a rich set of hazard, vulnerability, and exposure data.
-   **Scalability & Performance:** Design a system that can handle large datasets and concurrent simulation runs efficiently.
-   **Accuracy & Reliability:** Ensure the integrity of data models and the mathematical precision of financial and probabilistic calculations.
-   **Usability:** Provide an intuitive frontend for configuring simulations, visualizing results, and managing data.
-   **Extensibility:** Build a modular architecture that allows for the easy addition of new hazard types, financial models, and features.

## 2. As-Is System Architecture

The application is a full-stack solution composed of a React-based frontend, a Node.js (Express) backend, and a MongoDB database.

```
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│   React Frontend  │◀────▶│    Node.js API    │◀────▶│     MongoDB       │
│ (localhost:3000)  │      │ (localhost:3001)  │      │ (Replica Set)     │
└───────────────────┘      └───────────────────┘      └───────────────────┘
         │                        │                        │
         │                        │                        │
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│ - User Interface  │      │ - Express Server  │      │ - Account Data    │
│ - State Mgmt      │      │ - RESTful API     │      │ - Policy Data     │
│ - API Client      │      │ - Auth Service    │      │ - Exposure Data   │
│ - Visualization   │      │ - Simulation Eng. │      │ - Hazard Data     │
└───────────────────┘      └───────────────────┘      └───────────────────┘
```

### 2.1. Frontend

-   **Framework:** React with TypeScript
-   **UI Library:** Material-UI
-   **State Management:** Redux for complex state, with `useState`/`useEffect` for local state.
-   **API Communication:** Axios client for making RESTful API calls to the backend.
-   **Key Components:** Dashboard, Simulation Runner, Results Visualization, Data Management panels.

### 2.2. Backend

-   **Framework:** Node.js with Express.js
-   **Language:** JavaScript (ES6+)
-   **Core Components:**
    -   **RESTful API:** A comprehensive set of endpoints for managing accounts, policies, hazards, vulnerabilities, and running simulations.
    -   **CAT Simulation Engine:** The core of the application, responsible for executing complex risk scenarios. It includes modules for probabilistic modeling, financial calculations, and data aggregation.
    -   **Service Layer:** A modular set of services for handling business logic (e.g., `AccountService`, `HazardService`, `IntegrationService`).
    -   **Authentication:** JWT-based authentication and authorization middleware.

### 2.3. Database

-   **System:** MongoDB
-   **Key Requirement:** Must be configured as a **Replica Set** to support ACID-compliant multi-document transactions, which are critical for data integrity during simulations.
-   **Data Models:** A rich set of schemas modeling Accounts, Policies, Locations, Exposures, Hazards, Vulnerabilities, and Simulation Runs.

## 3. Data Models

The data architecture is designed to support a complex hierarchy of insurance and reinsurance data.

```
Account
└── Policy
    └── Exposure
        ├── Location
        ├── Financial Values
        └── Risk Characteristics
```

-   **Account:** Represents an insurance or reinsurance company. Can have a hierarchical structure (parent/child).
-   **Policy:** An insurance policy tied to an account, defining coverages, limits, and deductibles.
-   **Location:** A specific geographic point with address and coordinate data.
-   **Exposure:** The core unit of risk, linking a policy to a location. It contains the insured value and detailed characteristics of the asset at risk.
-   **Hazard, Vulnerability:** Data models that describe the potential catastrophic events and the susceptibility of assets to damage.
-   **SimulationRun, SimulationEvent:** Models used to store the configuration and results of simulation runs.

## 4. Getting Started: Local Development Setup

A proper local setup is critical. The backend requires a MongoDB replica set to function correctly.

### Step 1: Install Prerequisites

-   **Node.js:** v16 or higher.
-   **MongoDB Community Server:** v5.0 or higher.
-   **Git:** For version control.

### Step 2: Clone the Repository

```bash
git clone <your-repository-url>
cd demo_cat_modelling_dev_workflow
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Set Up MongoDB Replica Set

The application's tests and services will **fail** without a replica set. Use the provided automated script for a quick setup.

**Run in PowerShell (as Administrator):**

```powershell
# This script handles stopping the default MongoDB service and starting it with the correct replica set configuration.
.\setup-mongodb-replica.ps1
```

This script automates the manual process of stopping the default `mongod` service, restarting it with the `--replSet` flag, and initializing the replica set.

### Step 5: Configure Environment Variables

Copy the example environment file and ensure it points to your replica set.

```bash
cp env.example .env
```

Your `.env` file should contain:

```
# Use the replicaSet=rs0 parameter
MONGODB_URI=mongodb://localhost:27017/cat_modeling_dev?replicaSet=rs0
MONGODB_TEST_URI=mongodb://localhost:27017/cat_modeling_test?replicaSet=rs0

# Ensure mock DB is disabled to use the real MongoDB instance
USE_MOCK_DB=false
```

### Step 6: Run the Application

Use the provided `start-all.bat` script to launch the backend and frontend concurrently.

```bash
.\start-all.bat
```

-   **Backend API:** Will be available at `http://localhost:3001`
-   **Frontend App:** Will be available at `http://localhost:3000`

## 5. Development Workflow & Testing

### 5.1. Roles & Responsibilities

-   **Product Owner:** Defines business requirements, data models, and validation rules.
-   **Developer:** Implements models, services, and APIs. Writes clean, testable code.
-   **Tester / QA:** Ensures system reliability through comprehensive testing. Validates business logic and identifies edge cases.

### 5.2. Testing Strategy

A multi-layered testing strategy is essential for ensuring quality.

-   **Unit Tests:** Test individual functions and classes in isolation. The most critical components to test are the foundational services and the simulation engine.
    -   **Priority P0:** `ProbabilityDistributionService`, `CATSimulationEngine`, Business Models.
    -   **Priority P1:** Core and Advanced Services (`AccountService`, `FinancialCalculationService`, etc.).
-   **Integration Tests:** Verify the interaction between different components (e.g., controller-service-model).
-   **End-to-End (E2E) Tests:** Test complete user workflows from the UI to the database and back.
-   **Performance Tests:** Benchmark critical operations like simulation runs and large data queries.

**To run all tests:**

```bash
npm test
```

**To run specific, critical transaction tests:**

```bash
npm test tests/services/BaseService.transaction.test.js
```

## 6. Architectural Gaps & Strategic Roadmap

This section outlines the identified gaps in the current implementation and provides a structured plan for achieving a production-ready state.

### 6.1. Critical Gaps Identified

1.  **Testing Coverage:**
    -   **Frontend:** Low coverage, especially for API integration and state management.
    -   **Backend:** Insufficient testing for edge cases, concurrent runs, and database transactions.
    -   **CAT Engine:** The core simulation logic lacks a comprehensive validation suite.

2.  **Integration & DevOps:**
    -   **E2E Testing:** No automated end-to-end testing framework is in place.
    -   **CI/CD:** The continuous integration and deployment pipeline is missing critical stages like automated testing gates and security scanning.
    -   **Containerization:** Docker setup is incomplete and not ready for production orchestration.

3.  **Architecture & Resilience:**
    -   **API Versioning:** No strategy for versioning the API, which will be crucial for future updates.
    -   **Centralized Logging:** Lack of a centralized logging solution (like an ELK stack) makes debugging difficult.
    -   **Health Checks:** Missing dedicated health check endpoints for monitoring service status.

### 6.2. Structured Roadmap for Go-Live

#### Phase 1: Stabilize and Secure (Weeks 1-2)

-   **[ ] Complete Authentication:** Implement JWT refresh tokens and role-based access control (RBAC).
-   **[ ] Fix Data Pipeline:** Resolve any remaining database connection issues and ensure proper transaction handling across all services.
-   **[ ] Enhance Error Handling:** Implement consistent error handling and propagation from the backend to the frontend.

#### Phase 2: Comprehensive Testing (Weeks 3-4)

-   **[ ] Increase Frontend Test Coverage:** Achieve >80% coverage, focusing on component integration and API calls. Implement E2E tests with a framework like Cypress.
-   **[ ] Increase Backend Test Coverage:** Achieve >85% coverage. Add performance benchmarks and stress tests for the simulation engine.
-   **[ ] Validate CAT Engine:** Develop a validation suite for the Monte Carlo simulations against known benchmarks.

#### Phase 3: DevOps & Infrastructure (Weeks 5-6)

-   **[ ] Production-Ready Containerization:** Finalize multi-stage Dockerfiles and a robust `docker-compose` setup for all services.
-   **[ ] Implement CI/CD Pipeline:** Set up a pipeline with automated testing, security scanning, and build stages.
-   **[ ] Prepare for Orchestration:** Create Kubernetes manifests or Helm charts for scalable deployment.

#### Phase 4: Production Readiness (Weeks 7-8)

-   **[ ] Performance Optimization:** Optimize frontend bundles, implement API response caching, and fine-tune database queries.
-   **[ ] Monitoring & Observability:** Set up a monitoring stack (e.g., Prometheus/Grafana) and implement distributed tracing.
-   **[ ] Finalize Documentation:** Generate comprehensive API documentation (e.g., using OpenAPI/Swagger) and create deployment runbooks.
