import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const CSV_PATH = path.resolve(__dirname, '../../app/data/Cleaned_data.csv');
const OUTPUT_DIR = path.resolve(__dirname, '../output');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('🚀 Starting CSV to FHIR conversion...');
console.log(`📂 Reading CSV from: ${CSV_PATH}`);
console.log(`📁 Output directory: ${OUTPUT_DIR}`);

// Check if CSV file exists
if (!fs.existsSync(CSV_PATH)) {
  console.error(`❌ CSV file not found: ${CSV_PATH}`);
  process.exit(1);
}

const csvData = [];

// Read and parse CSV
fs.createReadStream(CSV_PATH)
  .pipe(csv())
  .on('data', (row) => {
    csvData.push(row);
  })
  .on('end', () => {
    console.log(`📊 Parsed ${csvData.length} rows from CSV`);
    generateFHIRResources(csvData);
  })
  .on('error', (error) => {
    console.error('❌ Error reading CSV:', error);
    process.exit(1);
  });

function generateFHIRResources(data) {
  try {
    // Generate CodeSystem
    const codeSystem = generateCodeSystem(data);
    const codeSystemPath = path.join(OUTPUT_DIR, 'namaste-codesystem.json');
    fs.writeFileSync(codeSystemPath, JSON.stringify(codeSystem, null, 2));
    console.log(`✅ Generated CodeSystem: ${codeSystemPath}`);
    console.log(`📋 Concepts: ${codeSystem.concept.length}`);

    // Generate ConceptMap
    const conceptMap = generateConceptMap(data);
    const conceptMapPath = path.join(OUTPUT_DIR, 'namaste-icd11-map.json');
    fs.writeFileSync(conceptMapPath, JSON.stringify(conceptMap, null, 2));
    console.log(`✅ Generated ConceptMap: ${conceptMapPath}`);
    console.log(`🔗 Mappings: ${conceptMap.group[0].element.length}`);

    console.log('\n🎉 FHIR resource generation completed successfully!');
  } catch (error) {
    console.error('❌ Error generating FHIR resources:', error);
    process.exit(1);
  }
}

function generateCodeSystem(data) {
  const concepts = [];
  const processedCodes = new Set();

  data.forEach((row, index) => {
    try {
      // Extract NAMASTE code and term - handle actual CSV column names
      const namasteCode = row.NUMC_CODE?.trim();
      const namasteTerm = row.NUMC_TERM?.trim();

      if (!namasteCode || !namasteTerm) {
        return; // Skip invalid rows
      }

      // Avoid duplicate codes
      if (processedCodes.has(namasteCode)) {
        return;
      }
      processedCodes.add(namasteCode);

      const concept = {
        code: namasteCode,
        display: namasteTerm,
        definition: `NAMASTE terminology concept: ${namasteTerm}`
      };

      // Add additional designations if available
      const designation = [];
      
      // For this CSV structure, NUMC_TERM is the main term
      // We could add other language variants here if available

      if (designation.length > 0) {
        concept.designation = designation;
      }

      concepts.push(concept);
    } catch (error) {
      console.warn(`⚠️ Skipping row ${index + 1} due to error:`, error.message);
    }
  });

  return {
    resourceType: "CodeSystem",
    id: "namaste-terminology",
    url: "http://ayush.gov.in/fhir/namaste",
    identifier: [
      {
        use: "official",
        system: "urn:ietf:rfc:3986",
        value: "urn:oid:2.16.356.888.13.1000.1.1"
      }
    ],
    version: "1.0.0",
    name: "NAMASTETerminology",
    title: "NAMASTE - Traditional Medicine Terminology",
    status: "active",
    experimental: false,
    date: new Date().toISOString(),
    publisher: "AYUSH Ministry, Government of India",
    contact: [
      {
        name: "AYUSH Ministry",
        telecom: [
          {
            system: "url",
            value: "https://ayush.gov.in"
          }
        ]
      }
    ],
    description: "NAMASTE (National AYUSH Morbidity and Standardized Terminologies Electronic) terminology system for traditional medicine terms with standardized codes.",
    purpose: "To provide standardized terminology for traditional medicine systems including Ayurveda, Unani, Siddha, and Homeopathy.",
    copyright: "Copyright © 2024 AYUSH Ministry, Government of India",
    caseSensitive: true,
    valueSet: "http://ayush.gov.in/fhir/ValueSet/namaste-all",
    hierarchyMeaning: "is-a",
    compositional: false,
    versionNeeded: false,
    content: "complete",
    count: concepts.length,
    concept: concepts
  };
}

function generateConceptMap(data) {
  const mappings = [];
  const processedMappings = new Set();

  data.forEach((row, index) => {
    try {
      // Handle actual CSV column names
      const namasteCode = row.NUMC_CODE?.trim();
      const namasteTerm = row.NUMC_TERM?.trim();
      const icdCode = row.ICD_CODE?.trim();
      const icdTerm = row.ICD_TERM?.trim();

      if (!namasteCode || !icdCode || !icdTerm) {
        return; // Skip rows without proper mapping
      }

      // Create unique mapping key to avoid duplicates
      const mappingKey = `${namasteCode}->${icdCode}`;
      if (processedMappings.has(mappingKey)) {
        return;
      }
      processedMappings.add(mappingKey);

      const mapping = {
        code: namasteCode,
        display: namasteTerm || namasteCode,
        target: [
          {
            code: icdCode,
            display: icdTerm,
            equivalence: "equivalent"
          }
        ]
      };

      mappings.push(mapping);
    } catch (error) {
      console.warn(`⚠️ Skipping mapping at row ${index + 1}:`, error.message);
    }
  });

  return {
    resourceType: "ConceptMap",
    id: "namaste-to-icd11",
    url: "http://ayush.gov.in/fhir/ConceptMap/namaste-to-icd11",
    identifier: [
      {
        use: "official",
        system: "urn:ietf:rfc:3986",
        value: "urn:oid:2.16.356.888.13.1000.1.2"
      }
    ],
    version: "1.0.0",
    name: "NAMASTEToICD11Map",
    title: "NAMASTE to ICD-11 Concept Map",
    status: "active",
    experimental: false,
    date: new Date().toISOString(),
    publisher: "AYUSH Ministry, Government of India",
    contact: [
      {
        name: "AYUSH Ministry",
        telecom: [
          {
            system: "url",
            value: "https://ayush.gov.in"
          }
        ]
      }
    ],
    description: "Concept map for translating NAMASTE traditional medicine terminology to ICD-11 codes.",
    purpose: "Enable interoperability between traditional medicine terminology and international classification systems.",
    copyright: "Copyright © 2024 AYUSH Ministry, Government of India",
    sourceUri: "http://ayush.gov.in/fhir/namaste",
    targetUri: "http://id.who.int/icd/release/11/mms",
    group: [
      {
        source: "http://ayush.gov.in/fhir/namaste",
        target: "http://id.who.int/icd/release/11/mms",
        element: mappings
      }
    ]
  };
}