## Architecture

### System Diagram
┌────────────────────────────┐ ┌──────────────────────────────┐ ┌──────────────────────────────┐ ┌────────────────────────────┐
│ EMR Frontend │ HTTPS │ EMR Backend │ HTTPS │ Main Backend │ HTTP │ HAPI FHIR R4 │
│ React + Vite (5173) │◄──────►│ Express Proxy (5000) │◄──────►│ Next.js API (3000) │◄──────►│ Docker Compose (8080) │
│ Auth headers + API key │ │ Validates X-API-Key + JWT │ │ $lookup/$translate via HAPI │ │ FHIR CodeSystem/ConceptMap │
└────────────────────────────┘ └──────────────────────────────┘ └──────────────────────────────┘ └────────────────────────────┘


---

### Components and Roles
- **EMR Frontend (`EMR/emr-frontend-clean`)**  
  React UI for clinicians; posts `query` and optional `patientId` to EMR backend; displays mappings and FHIR resource summaries.

- **EMR Backend (`EMR/terminology-service`)**  
  Express proxy that enforces `X-API-Key` and `Authorization: Bearer <ABHA JWT>`, forwards to main backend with its own API key, transforms responses for the UI, and exposes health.

- **Main Backend (`app/api/terminology/search/route.ts`)**  
  Core logic. Authenticates API client, verifies ABHA JWT, runs terminology operations through HAPI, builds raw mapping and FHIR Condition, and logs audit events.

- **HAPI FHIR (`hapi-loader` + Docker)**  
  Terminology server storing NAMASTE `CodeSystem` and NAMASTE→ICD-11 `ConceptMap`, supporting `$lookup`, `$translate`, `$validate-code`.

---

### Data Flow
1. Clinician types a term in EMR Frontend.  
2. Frontend sends `POST /api/search` with `X-API-Key` and `Authorization` headers to EMR Backend.  
3. EMR Backend validates headers and forwards the request to Main Backend `/api/terminology/search` with its `MAIN_BACKEND_API_KEY` and the same Bearer token.  
4. Main Backend authenticates the client (header `X-API-Key`), verifies ABHA JWT scope `terminology/search.read`, and parses the body.  
5. Main Backend calls HAPI `$lookup` for NAMASTE and `$translate` to ICD-11; falls back to CSV if needed.  
6. Builds a FHIR `Condition` with dual codings and logs an `AuditEvent`.  
7. Returns `rawMapping` + `fhir` to EMR Backend → transforms to UI-friendly shape → Frontend renders the results.

---

### Important Files
- `app/api/terminology/search/route.ts` — ABHA JWT validation, client authentication, FHIR/Audit building.  
- `lib/hapiClient.ts`, `lib/terminologyHapi.ts`, `lib/terminology.ts` — HAPI and CSV logic.  
- `EMR/terminology-service/src/app.js` — Express proxy, health checks, forwarding logic.  
- `hapi-loader/scripts` — CSV→FHIR conversion and loading scripts for HAPI.

---

### Ports & Dependencies
| Port  | Service         | Dependency                        |
|-------|----------------|------------------------------------|
| 8080  | **HAPI FHIR**  | Must be up before Main Backend    |
| 3000  | **Main Backend**| Depends on HAPI                   |
| 5000  | **EMR Backend** | Depends on Main Backend           |
| 5173  | **Frontend**    | Depends on EMR Backend            |

---

### Extended Architecture Flow
```mermaid
flowchart LR
    %% External Systems
    EMR[Third-Party EMR System]
    Admin[Admin]
    Client[Client]

    %% API Gateway & Services
    API[Terminology API Gateway]
    Portal[Management Portal (UI)]
    Service[SETU API Service (Next.js)]

    %% Databases
    UserDB[(User & API Key DB<br>(PostgreSQL))]
    TerminologyDB[(Terminology Data Server<br>(HAPI FHIR))]

    %% Flows
    EMR -->|"1. API call w/ Key"| API
    API -->|"2. Auth Key"| UserDB
    API -->|"3. Query Data"| TerminologyDB

    Admin -->|"Manages Clients & Data"| Portal
    Client -->|"Manages Account"| Portal

    Portal -->|"CRUD Client Data"| UserDB
    Portal -->|"Processes & Updates Data"| TerminologyDB

    %% Grouping
    subgraph Gateway[Terminology System (Core Services)]
        API
        Portal
        Service
    end

    %% Styling
    classDef external fill:#E3F2FD,stroke:#1E88E5,stroke-width:2px;
    classDef db fill:#FFF3E0,stroke:#F57C00,stroke-width:2px;
    classDef core fill:#E8F5E9,stroke:#43A047,stroke-width:2px;

    class EMR,Admin,Client external;
    class UserDB,TerminologyDB db;
    class API,Portal,Service core;
