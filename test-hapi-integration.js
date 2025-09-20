// test-hapi-integration.js
// Test script to verify HAPI FHIR integration

const testHapiIntegration = async () => {
  console.log('🧪 Testing HAPI FHIR Integration\n');

  // Test 1: Health Check
  console.log('1️⃣ Testing HAPI Server Health...');
  try {
    const response = await fetch('http://localhost:8080/fhir/metadata');
    if (response.ok) {
      console.log('✅ HAPI FHIR server is running\n');
    } else {
      console.log('❌ HAPI FHIR server is not responding\n');
      return;
    }
  } catch (error) {
    console.log('❌ Cannot connect to HAPI FHIR server');
    console.log('💡 Make sure to run: docker-compose -f docker-compose.hapi.yml up -d\n');
    return;
  }

  // Test 2: Check if CodeSystem exists
  console.log('2️⃣ Testing CodeSystem existence...');
  try {
    const response = await fetch('http://localhost:8080/fhir/CodeSystem/namaste-cs');
    if (response.ok) {
      console.log('✅ NAMASTE CodeSystem is loaded\n');
    } else {
      console.log('❌ NAMASTE CodeSystem not found');
      console.log('💡 Run: cd hapi-terminology-loader && npm run setup\n');
      return;
    }
  } catch (error) {
    console.log('❌ Error checking CodeSystem:', error.message, '\n');
    return;
  }

  // Test 3: Check if ConceptMap exists
  console.log('3️⃣ Testing ConceptMap existence...');
  try {
    const response = await fetch('http://localhost:8080/fhir/ConceptMap/namaste-icd11-map');
    if (response.ok) {
      console.log('✅ NAMASTE-ICD11 ConceptMap is loaded\n');
    } else {
      console.log('❌ NAMASTE-ICD11 ConceptMap not found\n');
      return;
    }
  } catch (error) {
    console.log('❌ Error checking ConceptMap:', error.message, '\n');
    return;
  }

  // Test 4: $lookup operation
  console.log('4️⃣ Testing $lookup operation...');
  try {
    const lookupBody = {
      resourceType: 'Parameters',
      parameter: [
        { name: 'code', valueCode: 'A-2' },
        { name: 'system', valueUri: 'http://ayush.gov.in/fhir/namaste' }
      ]
    };

    const response = await fetch('http://localhost:8080/fhir/CodeSystem/$lookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      },
      body: JSON.stringify(lookupBody)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ $lookup operation successful');
      console.log('📋 Result:', JSON.stringify(result, null, 2), '\n');
    } else {
      const error = await response.text();
      console.log('❌ $lookup operation failed:', error, '\n');
    }
  } catch (error) {
    console.log('❌ Error in $lookup operation:', error.message, '\n');
  }

  // Test 5: $translate operation
  console.log('5️⃣ Testing $translate operation...');
  try {
    const translateBody = {
      resourceType: 'Parameters',
      parameter: [
        { name: 'code', valueCode: 'A-2' },
        { name: 'system', valueUri: 'http://ayush.gov.in/fhir/namaste' },
        { name: 'target', valueUri: 'http://id.who.int/icd/release/11/mms' },
        { name: 'url', valueUri: 'http://ayush.gov.in/fhir/ConceptMap/namaste-to-icd11' }
      ]
    };

    const response = await fetch('http://localhost:8080/fhir/ConceptMap/$translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      },
      body: JSON.stringify(translateBody)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ $translate operation successful');
      console.log('📋 Result:', JSON.stringify(result, null, 2), '\n');
    } else {
      const error = await response.text();
      console.log('❌ $translate operation failed:', error, '\n');
    }
  } catch (error) {
    console.log('❌ Error in $translate operation:', error.message, '\n');
  }

  // Test 6: Test your backend API
  console.log('6️⃣ Testing your backend API...');
  try {
    const response = await fetch('http://localhost:3000/api/terminology/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'test-api-key',
        'Authorization': 'Bearer test-jwt-token'
      },
      body: JSON.stringify({ query: 'Shaqiqa' })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Backend API with HAPI integration successful');
      console.log('📋 Response:', JSON.stringify(result, null, 2), '\n');
    } else {
      const error = await response.text();
      console.log('❌ Backend API failed:', error, '\n');
    }
  } catch (error) {
    console.log('❌ Error testing backend API:', error.message);
    console.log('💡 Make sure your Next.js server is running: npm run dev\n');
  }

  console.log('🎉 HAPI Integration Testing Complete!');
};

// Run the test
testHapiIntegration().catch(console.error);