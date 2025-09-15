# Complete API Specification - Terminology Search

## 🎯 **API Endpoint**
```
POST /api/terminology/search
```

## 📋 **Required Headers**

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Type` | `application/json` | JSON request body |
| `X-API-Key` | `<client-api-key>` | Client authentication |
| `Authorization` | `Bearer <ABHA_JWT_TOKEN>` | Patient/doctor authentication |

## 📦 **Request Body** (JSON)

```json
{
  "patientId": "abha-12345",   // Required for audit logging
  "query": "Amlapitta"         // Required - NAMASTE term to search
}
```

### Field Descriptions:
- **`patientId`** *(string, optional)*: Patient's ABHA ID for audit logging and FHIR Bundle response
- **`query`** *(string, required)*: NAMASTE terminology term to search for

## 🔐 **Authentication Flow**

1. **Client Authentication** - Validates `X-API-Key` against clients table
2. **ABHA JWT Verification** - Validates Bearer token using ABHA public keys
3. **Content Validation** - Ensures proper JSON content type and required fields

## ✅ **Success Response** (200 OK)

### With Patient ID (Bundle Response):
```json
{
  "rawMapping": [
    {
      "term": "Amlapitta",
      "code": "NAMASTE_1023",
      "system": "http://ayush.gov.in/fhir/namaste",
      "display": "Amlapitta",
      "mappingStatus": "MAPPED"
    },
    {
      "term": "Functional dyspepsia",
      "code": "DD91.1",
      "system": "http://id.who.int/icd/release/11/mms",
      "display": "Functional dyspepsia",
      "mappingStatus": "MAPPED"
    }
  ],
  "fhir": {
    "resourceType": "Bundle",
    "type": "collection",
    "entry": [
      {
        "resource": {
          "resourceType": "Patient",
          "id": "abha-12345",
          "identifier": [
            {
              "system": "https://healthid.ndhm.gov.in",
              "value": "abha-12345"
            }
          ]
        }
      },
      {
        "resource": {
          "resourceType": "Condition",
          "id": "uuid-here",
          "extension": [
            {
              "url": "http://ayush.gov.in/fhir/StructureDefinition/mappingStatus",
              "valueString": "MAPPED"
            }
          ],
          "clinicalStatus": {
            "coding": [
              {
                "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                "code": "active",
                "display": "Active"
              }
            ]
          },
          "code": {
            "coding": [
              {
                "system": "http://ayush.gov.in/fhir/namaste",
                "code": "NAMASTE_1023",
                "display": "Amlapitta"
              },
              {
                "system": "http://id.who.int/icd/release/11/mms",
                "code": "DD91.1",
                "display": "Functional dyspepsia"
              }
            ],
            "text": "Amlapitta / Functional dyspepsia"
          },
          "subject": {
            "reference": "Patient/abha-12345"
          },
          "recordedDate": "2025-09-15T09:55:00.000Z"
        }
      }
    ]
  }
}
```

### Without Patient ID (Condition Response):
```json
{
  "rawMapping": [...],
  "fhir": {
    "resourceType": "Condition",
    // ... Condition resource without subject reference
  }
}
```

## ❌ **Error Responses**

### 400 Bad Request - Missing Content-Type:
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "Content-Type must be application/json"
    }
  ]
}
```

### 403 Forbidden - Invalid API Key:
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "forbidden",
      "diagnostics": "Client authentication failed: Invalid API key"
    }
  ]
}
```

### 401 Unauthorized - Invalid JWT:
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "Unauthorized: Invalid token signature"
    }
  ]
}
```

### 400 Bad Request - Missing Query:
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "processing",
      "diagnostics": "Missing required \"query\" field"
    }
  ]
}
```

### 404 Not Found - Query Not Found:
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "not-found",
      "diagnostics": "Query not found in CSV dataset: NonExistentTerm"
    }
  ]
}
```

## 📝 **Complete Example Request**

```bash
curl -X POST http://localhost:3000/api/terminology/search \
     -H "Content-Type: application/json" \
     -H "X-API-Key: lMqWaS9eAWR6BB4hcLzU9nF0NHth3z99" \
     -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..." \
     -d '{
       "patientId": "abha-12345",
       "query": "Amlapitta"
     }'
```

## 🔍 **Response Validation**

### Success Response Must Include:
- ✅ `rawMapping` array with mapping status
- ✅ `fhir` object (Bundle or Condition)
- ✅ Proper FHIR resource structure
- ✅ NAMASTE and ICD-11 codes when available
- ✅ Mapping status extension

### Error Response Must Include:
- ✅ `resourceType: "OperationOutcome"`
- ✅ `issue` array with error details
- ✅ Proper HTTP status codes
- ✅ Descriptive diagnostics

## 🛡️ **Security Features**

1. **Multi-layer Authentication**: API Key + ABHA JWT
2. **Client Identification**: Each request traced to specific EMR
3. **Comprehensive Audit Logging**: All requests logged to database
4. **FHIR Compliance**: Audit events follow FHIR standards
5. **Secure Error Handling**: No sensitive information in errors

## 📊 **Audit Logging**

Every request generates audit logs with:
- Client information (API key authenticated)
- User context (from JWT claims)
- Patient information (if provided)
- Search terms and results
- Complete FHIR AuditEvent for compliance
- IP address and timestamps

## 🔧 **Frontend Integration**

### Required Implementation:
```javascript
const response = await fetch('/api/terminology/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': CLIENT_API_KEY,
    'Authorization': `Bearer ${abhaJwtToken}`
  },
  body: JSON.stringify({
    patientId: currentPatient.abhaId,
    query: searchTerm
  })
});

const data = await response.json();
if (response.ok) {
  // Handle success: data.rawMapping and data.fhir
} else {
  // Handle error: data.issue[0].diagnostics
}
```

## ✅ **Compatibility Checklist**

- ✅ **Headers**: Content-Type, X-API-Key, Authorization validation
- ✅ **Body**: JSON parsing with patientId + query fields
- ✅ **Authentication**: Two-layer security (API key + JWT)
- ✅ **Response**: FHIR-compliant Bundle/Condition resources
- ✅ **Errors**: Proper OperationOutcome format
- ✅ **Audit**: Complete compliance logging
- ✅ **Mapping**: NAMASTE ↔ ICD-11 with status tracking
- ✅ **Standards**: FHIR R4 compliance throughout