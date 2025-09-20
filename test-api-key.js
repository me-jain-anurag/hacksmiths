// test-api-key.js
// Test API key authentication directly

const axios = require('axios');

async function testApiKey() {
  console.log('🧪 Testing API Key Authentication\n');

  const testCases = [
    {
      name: 'EMR API Key',
      apiKey: 'lMqWaS9eAWR6BB4hcLzU9nF0NHth3z99',
      description: 'API key from EMR backend .env'
    },
    {
      name: 'Test API Key',
      apiKey: 'test-api-key',
      description: 'Generic test key'
    }
  ];

  for (const testCase of testCases) {
    console.log(`🔍 Testing: ${testCase.name}`);
    console.log(`   Key: ${testCase.apiKey.substring(0, 8)}...`);
    console.log(`   Description: ${testCase.description}`);

    try {
      const response = await axios.post(
        'http://localhost:3000/api/terminology/search',
        {
          query: 'Subat',
          patientId: 'abha-12345'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': testCase.apiKey,
            'Authorization': 'Bearer test-token'
          },
          timeout: 10000
        }
      );

      if (response.status === 200) {
        console.log(`✅ ${testCase.name}: SUCCESS`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Mappings found: ${response.data.rawMapping?.length || 0}`);
      } else {
        console.log(`⚠️ ${testCase.name}: Unexpected status ${response.status}`);
      }

    } catch (error) {
      console.log(`❌ ${testCase.name}: FAILED`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data?.error || error.message}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
    console.log('');
  }
}

testApiKey().catch(console.error);