import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the server URL from an environment variable, with a fallback for local testing
const HAPI_BASE_URL = process.env.HAPI_FHIR_URL || 'http://localhost:8080/fhir';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, '../output');

// Re-using the waitForHapi function structure
async function waitForHapi(maxRetries = 60, delay = 2000) {
  console.log('🔍 Waiting for HAPI FHIR server to be ready...');
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${HAPI_BASE_URL}/metadata`);
      if (response.ok) {
        console.log('✅ HAPI FHIR server is ready!');
        return true;
      }
    } catch (error) {
      console.log(`⏳ Attempt ${i + 1}/${maxRetries}: HAPI server not ready yet...`);
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  throw new Error('❌ HAPI FHIR server failed to start within timeout period');
}

async function loadResource(filePath) {
  const resource = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const resourceType = resource.resourceType;
  const resourceUrl = `${HAPI_BASE_URL}/${resourceType}`;

  console.log(`\n📤 Uploading ${resourceType} from ${path.basename(filePath)}...`);

  try {
    const response = await fetch(resourceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/fhir+json' },
      body: JSON.stringify(resource),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`   -> ✅ Created ${resourceType} successfully. ID: ${result.id}`);
    } else {
      const errorText = await response.text();
      // Attempt to update if it already exists (conflict error)
      if (response.status === 409 || response.status === 400) {
         console.log(`   -> ⚠️ ${resourceType} with URL ${resource.url} likely already exists, attempting update...`);
         const updateUrl = `${HAPI_BASE_URL}/${resourceType}/${resource.id}`;
         const updateResponse = await fetch(updateUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/fhir+json' },
            body: JSON.stringify(resource),
         });
         if (updateResponse.ok) {
            console.log(`   -> ✅ Updated ${resourceType} successfully.`);
         } else {
            const updateErrorText = await updateResponse.text();
            throw new Error(`Update failed with status ${updateResponse.status}: ${updateErrorText}`);
         }
      } else {
          throw new Error(`POST failed with status ${response.status}: ${errorText}`);
      }
    }
  } catch (error) {
    console.error(`   -> ❌ Error loading ${resourceType}:`, error.message);
    throw error; // Re-throw to fail the main process
  }
}

async function main() {
  try {
    console.log('🚀 Starting HAPI FHIR resource loading process...\n');
    await waitForHapi();

    const filesToLoad = [
        'namaste-codesystem.json',
        'namaste-icd11-map.json'
    ];

    for (const file of filesToLoad) {
        const filePath = path.join(OUTPUT_DIR, file);
        if (fs.existsSync(filePath)) {
            await loadResource(filePath);
        } else {
            console.warn(`   -> ⚠️ File not found, skipping: ${file}`);
        }
    }

    console.log('\n🎉 HAPI FHIR data loading completed successfully!');
  } catch (error) {
    console.error('\n❌ HAPI FHIR data loading failed:', error.message);
    process.exit(1);
  }
}

main();

