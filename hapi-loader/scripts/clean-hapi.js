import axios from 'axios';

const HAPI_BASE_URL = 'http://localhost:8080/fhir';

async function waitForHapi() {
  const maxRetries = 30;
  const delay = 2000;
  
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
    
    // Delete all CodeSystems
    console.log('🔍 Searching for existing CodeSystems...');
    const codeSystemResponse = await axios.get(`${HAPI_BASE_URL}/CodeSystem`);
    if (codeSystemResponse.data.total > 0) {
      for (const entry of codeSystemResponse.data.entry) {
        console.log(`🗑️ Deleting CodeSystem: ${entry.resource.id}`);
        await axios.delete(`${HAPI_BASE_URL}/CodeSystem/${entry.resource.id}`);
      }
    }
    
    // Delete all ConceptMaps
    console.log('🔍 Searching for existing ConceptMaps...');
    const conceptMapResponse = await axios.get(`${HAPI_BASE_URL}/ConceptMap`);
    if (conceptMapResponse.data.total > 0) {
      for (const entry of conceptMapResponse.data.entry) {
        console.log(`🗑️ Deleting ConceptMap: ${entry.resource.id}`);
        await axios.delete(`${HAPI_BASE_URL}/ConceptMap/${entry.resource.id}`);
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