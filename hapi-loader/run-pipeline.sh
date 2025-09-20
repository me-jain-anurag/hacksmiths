#!/bin/sh
# This script ensures the entire data pipeline runs in the correct order.

# Exit immediately if any command fails
set -e

echo "🚀 Starting full HAPI FHIR data pipeline..."

# Step 1: Generate FHIR JSON files from the source CSV data.
echo "\n[1/4] Generating FHIR resources from CSV..."
node scripts/csv-to-fhir.js

# Step 2: Wait for the HAPI server and clean any old data.
echo "\n[2/4] Cleaning existing resources from HAPI FHIR server..."
node scripts/clean-hapi.js

# Step 3: Load the newly generated data into the clean server.
echo "\n[3/4] Loading generated resources into HAPI FHIR server..."
node scripts/load-to-hapi.js

# Step 4: Run verification tests to ensure data is loaded and endpoints work.
echo "\n[4/4] Running verification tests..."
node scripts/test-operations.js

echo "\n🎉 HAPI FHIR data pipeline completed successfully!"

