// Main entry point for HAPI terminology loader
// This file provides a programmatic interface to the loader functionality

export { default as generateFhirResources } from './scripts/csv-to-fhir.js';
export { default as loadToHapi } from './scripts/load-to-hapi.js';
export { default as testOperations } from './scripts/test-operations.js';

console.log('✨ HAPI Terminology Loader ready');
console.log('📋 Available scripts:');
console.log('  • npm run generate  - Convert CSV to FHIR resources');
console.log('  • npm run load       - Load resources into HAPI server');
console.log('  • npm run setup      - Generate and load (complete setup)');
console.log('  • npm run test       - Test HAPI operations');
console.log('  • npm run clean      - Clean output directory');