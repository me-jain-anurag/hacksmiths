import axios from 'axios';

// Get the server URL from an environment variable, with a fallback for local testing
const HAPI_BASE_URL = process.env.HAPI_FHIR_URL || 'http://localhost:8080/fhir';

const hapiClient = {
  async healthCheck() {
    try {
      const response = await axios.get(`${HAPI_BASE_URL}/metadata`);
      return response.data.resourceType === 'CapabilityStatement';
    } catch {
      return false;
    }
  },
  async lookup({ code, system }) {
    try {
      const response = await axios.get(`${HAPI_BASE_URL}/CodeSystem/$lookup?system=${encodeURIComponent(system)}&code=${encodeURIComponent(code)}`);
      const parameters = response.data;
      const displayParam = parameters.parameter?.find(p => p.name === 'display');
      return { display: displayParam?.valueString || 'No display found' };
    } catch {
      return null;
    }
  },

  async translate({ code, system, target, conceptMapUrl }) {
    try {
      let url = `${HAPI_BASE_URL}/ConceptMap/$translate?system=${encodeURIComponent(system)}&code=${encodeURIComponent(code)}`;
      if (target) url += `&target=${encodeURIComponent(target)}`;
      if (conceptMapUrl) url += `&url=${encodeURIComponent(conceptMapUrl)}`;
      
      const response = await axios.get(url);
      const parameters = response.data;
      
      const resultParam = parameters.parameter?.find(p => p.name === 'result');
      const matchParam = parameters.parameter?.find(p => p.name === 'match');
      
      const result = {
        result: resultParam?.valueBoolean || false,
        matches: []
      };
      
      if (matchParam && matchParam.part) {
        const concept = matchParam.part.find(p => p.name === 'concept')?.valueCoding;
        if(concept) {
             result.matches.push({
                code: concept.code,
                display: concept.display
            });
        }
      }
      return result;
    } catch (error) {
      console.error('Translate error:', error.response ? error.response.data : error.message);
      return null;
    }
  },
};

async function runAllTests() {
  console.log('🚀 Starting comprehensive HAPI FHIR testing...\n');
  const isHealthy = await hapiClient.healthCheck();
  console.log(`1️⃣ Health Check Result: ${isHealthy ? '✅ Healthy' : '❌ Not available'}\n`);
  if (!isHealthy) throw new Error('HAPI Server is not healthy.');

  console.log('2️⃣ Testing $lookup operation...');
  const lookupResult = await hapiClient.lookup({
    code: 'A-2', // Using a known code from your data
    system: 'http://ayush.gov.in/fhir/namaste'
  });
  if (lookupResult && lookupResult.display) {
    console.log(`   -> ✅ Lookup successful: ${lookupResult.display}`);
  } else {
    console.log('   -> ⚠️ Lookup returned no results');
  }

  console.log('\n3️⃣ Testing $translate operation...');
    const translateResult = await hapiClient.translate({
        code: 'A-2',
        system: 'http://ayush.gov.in/fhir/namaste',
        target: 'http://id.who.int/icd/release/11/mms',
        conceptMapUrl: 'http://ayush.gov.in/fhir/ConceptMap/namaste-to-icd11'
    });
  if (translateResult && translateResult.result) {
    console.log(`   -> ✅ Translate successful: ${translateResult.matches?.length || 0} matches found`);
    if(translateResult.matches[0]) {
        console.log(`   -> 🎯 ICD-11: ${translateResult.matches[0].code} - ${translateResult.matches[0].display}`);
    }
  } else {
    console.log('   -> ⚠️ Translate returned no results');
  }

  console.log('\n✨ All tests completed!');
}

runAllTests().catch(error => {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
});

