import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the CSV path from command line argument or default
const csvArg = process.argv[2];
const CSV_PATH = csvArg || path.resolve(__dirname, '../../app/data/Cleaned_data.csv');
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
  console.error('Please ensure the CSV file exists at the specified path.');
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
      // Support both old and new column names
      const namasteCode = row.NAMASTE_CODE?.trim() || row.NUMC_CODE?.trim();
      const namasteTerm = row.NAMASTE_DISPLAY?.trim() || row.NUMC_TERM?.trim();

      if (!namasteCode || !namasteTerm) return; // Skip invalid rows
      if (processedCodes.has(namasteCode)) return; // Avoid duplicate codes
      
      processedCodes.add(namasteCode);
      concepts.push({
        code: namasteCode,
        display: namasteTerm,
        definition: `NAMASTE terminology concept: ${namasteTerm}`
      });
    } catch (error) {
      console.warn(`⚠️ Skipping row ${index + 1} due to error:`, error.message);
    }
  });

  return {
    resourceType: "CodeSystem",
    id: "namaste-terminology",
    url: "http://ayush.gov.in/fhir/namaste",
    version: "1.0.0",
    name: "NAMASTETerminology",
    title: "NAMASTE - Traditional Medicine Terminology",
    status: "active",
    experimental: false,
    date: new Date().toISOString(),
    publisher: "AYUSH Ministry, Government of India",
    description: "NAMASTE (National AYUSH Morbidity and Standardized Terminologies Electronic) terminology system for traditional medicine terms with standardized codes.",
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
      // Support both old and new column names
      const namasteCode = row.NAMASTE_CODE?.trim() || row.NUMC_CODE?.trim();
      const namasteTerm = row.NAMASTE_DISPLAY?.trim() || row.NUMC_TERM?.trim();
      const icdCode = row.ICD11_CODE?.trim() || row.ICD_CODE?.trim();
      const icdTerm = row.ICD11_DISPLAY?.trim() || row.ICD_TERM?.trim();

      if (!namasteCode || !icdCode || !icdTerm) return; // Skip rows without proper mapping

      const mappingKey = `${namasteCode}->${icdCode}`;
      if (processedMappings.has(mappingKey)) return;
      
      processedMappings.add(mappingKey);
      mappings.push({
        code: namasteCode,
        display: namasteTerm || namasteCode,
        target: [{
          code: icdCode,
          display: icdTerm,
          equivalence: "equivalent"
        }]
      });
    } catch (error) {
      console.warn(`⚠️ Skipping mapping at row ${index + 1}:`, error.message);
    }
  });

  return {
    resourceType: "ConceptMap",
    id: "namaste-to-icd11",
    url: "http://ayush.gov.in/fhir/ConceptMap/namaste-to-icd11",
    version: "1.0.0",
    name: "NAMASTEToICD11Map",
    title: "NAMASTE to ICD-11 Concept Map",
    status: "active",
    experimental: false,
    date: new Date().toISOString(),
    publisher: "AYUSH Ministry, Government of India",
    description: "Concept map for translating NAMASTE traditional medicine terminology to ICD-11 codes.",
    sourceUri: "http://ayush.gov.in/fhir/namaste",
    targetUri: "http://id.who.int/icd/release/11/mms",
    group: [{
      source: "http://ayush.gov.in/fhir/namaste",
      target: "http://id.who.int/icd/release/11/mms",
      element: mappings
    }]
  };
}
