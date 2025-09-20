import axios from 'axios';

// Get the server URL from an environment variable, with a fallback for local testing
const HAPI_BASE_URL = process.env.HAPI_FHIR_URL || 'http://localhost:8080/fhir';

async function waitForHapi() {
  const maxRetries = 60; // Increased retries for slower startup
  const delay = 5000;    // 5 second delay

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(`${HAPI_BASE_URL}/metadata`);
      if (response.status === 200) {
        console.log('✅ HAPI FHIR server is ready!');
        return;
      }
    } catch (error) {
      console.log(`⏳ Attempt ${i + 1}/${maxRetries}: HAPI server not ready yet...`);
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  throw new Error('❌ HAPI FHIR server failed to start within timeout period');
}

async function deleteAllResources() {
  try {
    console.log('🗑️ Cleaning HAPI FHIR server...');
    const resourceTypes = ['CodeSystem', 'ConceptMap']; // Add other types if needed

    for (const resourceType of resourceTypes) {
        console.log(`🔍 Searching for existing ${resourceType} resources...`);
        const response = await axios.get(`${HAPI_BASE_URL}/${resourceType}`);

        if (response.data.total > 0) {
          for (const entry of response.data.entry) {
            const resourceId = entry.resource.id;
            console.log(`   -> 🗑️ Deleting ${resourceType}: ${resourceId}`);
            // Use cascading delete if supported, otherwise simple delete
            await axios.delete(`${HAPI_BASE_URL}/${resourceType}/${resourceId}?_cascade=delete`);
          }
        } else {
            console.log(`   -> No ${resourceType} resources found to delete.`);
        }
    }
    console.log('✅ HAPI FHIR server cleaned successfully!');
  } catch (error) {
    console.error('❌ Error cleaning HAPI server:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting HAPI FHIR cleanup process...\n');
    await waitForHapi();
    await deleteAllResources();
    console.log('\n🎉 HAPI cleanup completed successfully!');
  } catch (error) {
    console.error('\n❌ HAPI cleanup failed:', error.message);
    process.exit(1);
  }
}

main();

