# Hacksmiths Terminology Integration Platform

This repository is a multi-service healthcare terminology integration project built around one core job: take AYUSH NAMASTE terminology data, map it to ICD-11, expose that mapping through a secure API, and return FHIR-shaped output that an EMR can consume.

In practice, the repo contains four moving parts:

1. A root Next.js application that acts as the main backend and also hosts a small client/admin portal.
2. A lightweight Express service that behaves like an EMR-facing proxy.
3. A React/Vite frontend that demonstrates the EMR-side user experience.
4. A HAPI FHIR loading pipeline that converts CSV data into FHIR CodeSystem and ConceptMap resources and publishes them to a HAPI FHIR server.

## What The Project Actually Does

At runtime, the main backend accepts a terminology search request, authenticates the caller, verifies an ABHA bearer token, looks up a NAMASTE term and its ICD-11 mapping, builds a FHIR `Condition` response, and records an audit event.

The search flow prefers a HAPI FHIR server when it is available:

- NAMASTE term details are resolved through `CodeSystem/$lookup`.
- NAMASTE to ICD-11 translation is resolved through `ConceptMap/$translate`.

If HAPI is down or unavailable, the backend falls back to a local CSV dataset so the search path can still respond.

The repository also includes an admin workflow for uploading a refreshed CSV file. That upload updates the local CSV used by the Next.js backend, regenerates the FHIR resources used by HAPI, and reloads those resources into the HAPI server.

## Main Components

### 1. Root Next.js App

Path: `app/`, `lib/`, `prisma/`

This is the core service in the repository.

It is responsible for:

- exposing the main terminology API at `POST /api/terminology/search`
- authenticating API clients through `X-API-Key`
- verifying ABHA JWTs and scope requirements
- running terminology operations against HAPI when available
- falling back to CSV-based search when HAPI is unavailable
- generating FHIR `Condition` or `Bundle` responses
- storing audit logs through Prisma
- hosting the client signup/login/dashboard and admin dashboard

Important files:

- `app/api/terminology/search/route.ts`
- `lib/terminologyHapi.ts`
- `lib/terminology.ts`
- `lib/hapiClient.ts`
- `lib/abha.ts`
- `lib/authenticateClient.ts`
- `lib/audit.ts`
- `prisma/schema.prisma`

### 2. EMR Proxy Service

Path: `EMR/terminology-service/`

This is a small Express service that sits in front of the main backend and makes the integration simpler for an EMR-facing UI.

It is responsible for:

- accepting `POST /api/search` from the EMR UI
- validating that `X-API-Key` and `Authorization: Bearer ...` are present
- forwarding the request to the main backend with its configured backend API key
- transforming the main backend response into a UI-friendly payload
- exposing a simple health check

Important file:

- `EMR/terminology-service/src/app.js`

### 3. EMR Frontend

Path: `EMR/emr-frontend-clean/`

This is a React/Vite frontend that demonstrates how an EMR could search the terminology service and render mappings and FHIR output.

It is responsible for:

- collecting user search input
- sending terminology queries to the EMR proxy service
- displaying NAMASTE and ICD-11 mapping results
- showing the FHIR resource returned by the backend

### 4. HAPI Loader Pipeline

Path: `hapi-loader/`

This package converts the CSV dataset into FHIR resources and loads them into a HAPI FHIR server.

It is responsible for:

- reading the source CSV
- generating a FHIR `CodeSystem` for NAMASTE terms
- generating a FHIR `ConceptMap` for NAMASTE to ICD-11 mappings
- uploading those resources to HAPI FHIR

Important files:

- `hapi-loader/scripts/csv-to-fhir.js`
- `hapi-loader/scripts/load-to-hapi.js`

## Runtime Architecture

| Component | Default Port | Purpose |
| --- | --- | --- |
| Next.js main backend | `3000` | Core API, auth, FHIR response generation, dashboards |
| EMR proxy service | `5000` | EMR-facing proxy and response shaping |
| EMR frontend | `5173` | Demo clinician-facing UI |
| HAPI FHIR server | `8080` | Terminology store and FHIR terminology operations |

There are two different data stores in play:

- PostgreSQL via Prisma for application data such as clients, admins, and audit logs.
- HAPI FHIR storage for terminology resources such as the NAMASTE `CodeSystem` and NAMASTE to ICD-11 `ConceptMap`.

## End-To-End Search Flow

The main request flow looks like this:

1. A user enters a search term in the EMR frontend.
2. The EMR frontend sends a request to the Express proxy at `POST /api/search`.
3. The Express proxy checks that an API key header and bearer token are present, then forwards the request to the main backend.
4. The main backend authenticates the API client against Prisma using `X-API-Key`.
5. The main backend verifies the ABHA JWT and checks for the required scope `terminology/search.read`.
6. The backend tries to use HAPI FHIR terminology operations:
   - `CodeSystem/$lookup` for NAMASTE details
   - `ConceptMap/$translate` for ICD-11 translation
7. If HAPI is unavailable, the backend falls back to the CSV dataset loaded through `lib/namasteLoader.ts`.
8. The backend builds a FHIR `Condition` response. If `patientId` is supplied, it wraps the output in a FHIR `Bundle` with a minimal `Patient` stub.
9. The backend writes an audit record to the Prisma database and also stores a FHIR `AuditEvent` JSON payload.
10. The response returns through the EMR proxy and back to the frontend.

## Data Pipeline

The terminology source of truth in this repo starts as CSV.

Current source file:

- `app/data/Cleaned_data.csv`

That CSV is used in two ways:

1. It is loaded directly by the Next.js backend for local fallback search.
2. It is converted into FHIR resources and pushed into HAPI FHIR.

The pipeline is:

1. Read CSV rows.
2. Normalize column names and values.
3. Generate:
   - `CodeSystem` for NAMASTE concepts
   - `ConceptMap` for NAMASTE to ICD-11 mappings
4. Write those generated resources to `hapi-loader/output/`.
5. Upload them into HAPI FHIR.

The admin CSV upload route automates that same sequence from the UI:

- `app/api/admin/upload-csv/route.ts`

That route validates required CSV headers, updates the local CSV file, runs the loader scripts, reloads HAPI resources, and clears the in-process CSV cache.

## Authentication And Audit Model

The project uses two layers of request validation in the main search flow.

### Client authentication

The main backend expects an `X-API-Key` header and validates it against the `Client` table in PostgreSQL through Prisma.

### ABHA token verification

The main backend also expects `Authorization: Bearer <token>` and validates the JWT through:

- `ABHA_JWKS_URL`
- `ABHA_ISSUER`
- `ABHA_AUDIENCE`

For local development only, `ALLOW_INSECURE_DEV=true` enables an insecure decode-only bypass in `lib/abha.ts`.

### Audit logging

Every successful or failed terminology search attempts to create:

- a relational `AuditLog` row in PostgreSQL
- a FHIR `AuditEvent` JSON payload stored in that row

The audit model currently records request metadata such as outcome, query term, client identifiers, doctor identifiers, and mapped codes when available.

## Client And Admin Portal

The root Next.js app also contains a small self-service and admin layer.

Client features:

- signup and login
- dashboard access
- API key generation and deletion UI

Admin features:

- client listing
- CSV upload and terminology refresh

Relevant routes and pages include:

- `app/signup/client/page.tsx`
- `app/login/client/page.tsx`
- `app/dashboard/client/page.tsx`
- `app/login/admin/page.tsx`
- `app/dashboard/admin/page.tsx`
- `app/api/admin/upload-csv/route.ts`
- `app/api/admin/clients/route.ts`

## Local Development

### Prerequisites

- Node.js 22
- npm 10+
- Docker Desktop
- PostgreSQL reachable through `DATABASE_URL`

### Recommended startup order

1. Start the HAPI stack.

```bash
docker-compose -f docker-compose.hapi.yml up -d
```

2. Generate and load terminology resources into HAPI.

```bash
cd hapi-loader
npm ci
npm run setup
```

3. Start the main backend.

```bash
cd ..
npm ci
npx prisma generate
npm run dev
```

4. Start the EMR proxy service.

```bash
cd EMR/terminology-service
npm ci
npm start
```

5. Start the EMR frontend.

```bash
cd EMR/emr-frontend-clean
npm ci
npm run dev
```

### Main environment variables

Root Next.js app:

- `DATABASE_URL`
- `HAPI_BASE_URL`
- `ABHA_JWKS_URL`
- `ABHA_ISSUER`
- `ABHA_AUDIENCE`
- `ALLOW_INSECURE_DEV`

EMR proxy service:

- `MAIN_BACKEND_URL`
- `MAIN_BACKEND_API_KEY`
- `PORT`

HAPI loader:

- `HAPI_FHIR_URL`

## Useful API Shape

Primary request path used by the EMR demo:

```http
POST http://localhost:5000/api/search
Content-Type: application/json
X-API-Key: <client-api-key>
Authorization: Bearer <abha-jwt>

{
  "query": "migraine",
  "patientId": "abha-12345"
}
```

The main backend response contains two core sections:

- `rawMapping`: flat NAMASTE and ICD-11 matches
- `fhir`: a FHIR `Condition`, or a `Bundle` if a patient id was provided

## Repository Map

```text
.
├── app/                         Next.js pages and API routes
├── lib/                         Terminology, auth, HAPI, audit helpers
├── prisma/                      Prisma schema and migrations
├── EMR/
│   ├── emr-frontend-clean/      React/Vite demo frontend
│   └── terminology-service/     Express EMR proxy service
├── hapi-loader/                 CSV to FHIR conversion and HAPI loading
├── docs/                        Supporting project documentation
└── k8s/                         Kubernetes manifests
```

## Current Behavior And Caveats

- The main terminology API works with HAPI when available and falls back to CSV when HAPI is down.
- The admin CSV upload path depends on HAPI being reachable, because it regenerates and reloads FHIR resources.
- `hapi-loader` tests are external-service dependent and expect a healthy HAPI server.
- The repository includes both product code and hackathon/demo UI, so there is some overlap between “core platform” and “demo application” concerns.

## Where To Start In The Code

If you want to understand the repo quickly, read these files in order:

1. `app/api/terminology/search/route.ts`
2. `lib/terminologyHapi.ts`
3. `EMR/terminology-service/src/app.js`
4. `hapi-loader/scripts/csv-to-fhir.js`
5. `prisma/schema.prisma`

That path shows the request lifecycle, the HAPI integration, the EMR bridge, the terminology loading pipeline, and the persistence model.
