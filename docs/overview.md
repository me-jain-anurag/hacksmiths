## Project Overview

**What it is**: A standards-based medical terminology system that integrates India’s NAMASTE terminology with WHO ICD-11 (TM2 and Biomedicine) inside a FHIR R4–compliant workflow. It provides a lightweight microservice and EMR-ready UI to search terms, map NAMASTE ↔ ICD-11, and generate FHIR Condition resources with audit.

**Why it exists**: Ayush EMRs need dual/double-coding to align traditional diagnoses with global ICD-11 for analytics, interoperability, and claims—while complying with India’s 2016 EHR Standards (FHIR R4 APIs, SNOMED/LOINC semantics, ISO 22600, ABHA OAuth, audit trails). This project operationalizes that with a practical integration stack and reference UI.

**Who it’s for**: New developers, stakeholders, and hackathon judges evaluating an end-to-end integration that is secure, compliant, and easy to adopt.

### High-level Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  EMR Frontend   │◄──►│  EMR Backend    │◄──►│ Main Backend    │◄──►│ HAPI FHIR Server│
│  (React/Vite)   │    │   (Express)     │    │   (Next.js)     │    │    (Docker)     │
│   Port 5173     │    │   Port 5000     │    │   Port 3000     │    │   Port 8080     │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │                       │
    UI Layer              Proxy Service         Core API Service        Terminology Store

User search → EMR backend auth → Main backend (HAPI $lookup/$translate) → Mapped FHIR Condition
```

### Problem Statement (Summary)
Develop API code to integrate NAMASTE and ICD-11 (TM2 & Biomedicine) into EMR systems compliant with India’s EHR Standards. Enable clinicians to record traditional medicine diagnoses using NAMASTE codes and automatically map them to ICD-11, supporting dual coding, secure access (ABHA/OAuth2), and audit-ready metadata.

### Outcomes
- Search NAMASTE and ICD-11, show mappings and status
- FHIR R4 Condition generation with dual coding
- ABHA JWT validation and API-key–based client auth
- HAPI-backed $lookup and $translate with CSV fallback
- Audit logging for standards compliance


