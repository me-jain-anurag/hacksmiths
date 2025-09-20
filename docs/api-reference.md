## API Reference

### EMR Backend

#### POST `/api/search`
- **Headers**:
  - `Content-Type: application/json`
  - `X-API-Key: <frontend_api_key>`
  - `Authorization: Bearer <ABHA_JWT>`
- **Body**:
```json
{ "query": "migraine", "patientId": "abha-12345" }
```
- **Success 200**:
```json
{
  "status": "success",
  "timestamp": "2025-09-16T17:30:00.000Z",
  "query": "migraine",
  "patientId": "abha-12345",
  "rawMapping": [ { "system": "http://ayush.gov.in/fhir/namaste", "code": "A-2", "display": "Shaqiqa" }, { "system": "http://id.who.int/icd/release/11/mms", "code": "669367341", "display": "Migraine" } ],
  "fhir": { "resourceType": "Condition", "code": { "coding": [ { "system": "http://ayush.gov.in/fhir/namaste", "code": "A-2" }, { "system": "http://id.who.int/icd/release/11/mms", "code": "669367341" } ] } },
  "terminology": { "mappingStatus": "MAPPED", "totalMappings": 2 }
}
```
- **Errors**: `400` (missing query), `401` (missing/invalid Bearer), `403` (missing API key), `503` (main backend unavailable)

### Main Backend

#### POST `/api/terminology/search`
- **Headers**:
  - `Content-Type: application/json`
  - `X-API-Key: <emr_backend_to_main_api_key>`
  - `Authorization: Bearer <ABHA_JWT>`
- **Body**:
```json
{ "query": "migraine", "patientId": "abha-12345" }
```
- **Success 200**: returns
```json
{
  "rawMapping": [ { "system": "http://ayush.gov.in/fhir/namaste", "code": "A-2", "display": "Shaqiqa" }, { "system": "http://id.who.int/icd/release/11/mms", "code": "669367341", "display": "Migraine" } ],
  "fhir": { "resourceType": "Condition", "id": "uuid", "code": { "coding": [ { "system": "http://ayush.gov.in/fhir/namaste", "code": "A-2" }, { "system": "http://id.who.int/icd/release/11/mms", "code": "669367341" } ] } }
}
```
- **Errors**:
  - `400` invalid content-type or missing `query`
  - `401` missing/invalid token
  - `403` client auth failed
  - `404` no ICD-11 mapping found
  - `500` server error

### HAPI FHIR Operations (for reference)
- `$lookup` NAMASTE
```
GET /fhir/CodeSystem/$lookup?system=http://ayush.gov.in/fhir/namaste&code=A-2
```
- `$translate` NAMASTE → ICD-11
```
GET /fhir/ConceptMap/$translate?system=http://ayush.gov.in/fhir/namaste&code=A-2&target=http://id.who.int/icd/release/11/mms
```

### Authentication
- API Key header: `X-API-Key`
- ABHA JWT bearer: `Authorization: Bearer <token>`
- Required scope on JWT: `terminology/search.read`


