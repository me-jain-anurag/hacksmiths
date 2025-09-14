// test-enhanced-api.js - Test the enhanced API functionality with mapping status
const examples = [
  {
    name: "Test with NAMASTE term (has ICD mapping)",
    body: { query: "Amlapitta" },
    description: "Should return NAMASTE code with mappingStatus: MAPPED and ICD code"
  },
  {
    name: "Test with NAMASTE term (no ICD mapping)", 
    body: { query: "SomeNamasteTermWithoutICD" },
    description: "Should return NAMASTE code with mappingStatus: NOT_MAPPED, no ICD code"
  },
  {
    name: "Test with non-existent term",
    body: { query: "CompletelyNonExistentTerm12345" },
    description: "Should return OperationOutcome with 'Query not found in CSV dataset'"
  },
  {
    name: "Test with term that has no NAMASTE code",
    body: { query: "TermWithoutNamasteCode" },
    description: "Should return OperationOutcome with 'No NAMASTE code exists'"
  },
  {
    name: "Test with patient ID",
    body: { query: "diabetes", patientId: "patient-123" },
    description: "Should return Bundle with Patient and Condition including mapping status"
  }
];

console.log("Enhanced API Test Examples with Mapping Status:");
console.log("=============================================");
console.log("");

examples.forEach((example, i) => {
  console.log(`${i + 1}. ${example.name}`);
  console.log(`   Description: ${example.description}`);
  console.log(`   Test Body: ${JSON.stringify(example.body)}`);
  console.log("");
  console.log(`   curl command:`);
  console.log(`   curl -X POST http://localhost:3000/api/terminology/search \\`);
  console.log(`        -H "Content-Type: application/json" \\`);
  console.log(`        -H "Authorization: Bearer test-token" \\`);
  console.log(`        -d '${JSON.stringify(example.body)}'`);
  console.log("");
  console.log("   ---");
  console.log("");
});

console.log("Expected Response Formats:");
console.log("=========================");
console.log("");

console.log("1. Success Response (MAPPED):");
console.log(JSON.stringify({
  "rawMapping": [
    {
      "term": "Amlapitta",
      "code": "EB-4", 
      "system": "http://ayush.gov.in/fhir/namaste",
      "display": "Amlapitta",
      "mappingStatus": "MAPPED"
    },
    {
      "term": "Gastro-oesophageal reflux disease",
      "code": "DA22",
      "system": "http://id.who.int/icd/release/11/mms", 
      "display": "Gastro-oesophageal reflux disease",
      "mappingStatus": "MAPPED"
    }
  ],
  "fhir": {
    "resourceType": "Condition",
    "extension": [
      {
        "url": "http://ayush.gov.in/fhir/StructureDefinition/mappingStatus",
        "valueString": "MAPPED"
      }
    ],
    "code": {
      "coding": [
        {
          "system": "http://ayush.gov.in/fhir/namaste",
          "code": "EB-4",
          "display": "Amlapitta"
        },
        {
          "system": "http://id.who.int/icd/release/11/mms", 
          "code": "DA22",
          "display": "Gastro-oesophageal reflux disease"
        }
      ]
    }
  }
}, null, 2));

console.log("");
console.log("2. Success Response (NOT_MAPPED - no ICD code):");
console.log(JSON.stringify({
  "rawMapping": [
    {
      "term": "SomeNamasteTerm",
      "code": "XY-123", 
      "system": "http://ayush.gov.in/fhir/namaste",
      "display": "SomeNamasteTerm",
      "mappingStatus": "NOT_MAPPED"
    }
  ],
  "fhir": {
    "resourceType": "Condition",
    "extension": [
      {
        "url": "http://ayush.gov.in/fhir/StructureDefinition/mappingStatus",
        "valueString": "NOT_MAPPED"
      }
    ],
    "code": {
      "coding": [
        {
          "system": "http://ayush.gov.in/fhir/namaste",
          "code": "XY-123",
          "display": "SomeNamasteTerm"
        }
      ]
    }
  }
}, null, 2));

console.log("");
console.log("3. Error Response (Query not found in CSV):");
console.log(JSON.stringify({
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "not-found", 
    "diagnostics": "Query not found in CSV dataset: CompletelyNonExistentTerm12345"
  }]
}, null, 2));

console.log("");
console.log("4. Error Response (No NAMASTE code exists):");
console.log(JSON.stringify({
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "not-found", 
    "diagnostics": "No NAMASTE code exists for query: TermWithoutNamasteCode"
  }]
}, null, 2));