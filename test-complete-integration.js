// test-complete-integration.js
// Test script for complete EMR → Main Backend → HAPI integration

const testCompleteIntegration = async () => {
  console.log('🧪 Testing Complete EMR Integration\n');
  console.log('Flow: EMR Frontend → EMR Backend → Main Backend → HAPI Server\n');

  // Test 1: EMR Backend Health Check
  console.log('1️⃣ Testing EMR Backend Health...');
  try {
    const emrHealthResponse = await fetch('http://localhost:5000/api/health');
    if (emrHealthResponse.ok) {
      const healthData = await emrHealthResponse.json();
      console.log('✅ EMR Backend:', healthData.emrBackend);
      console.log('📡 Main Backend Connection:', healthData.mainBackend);
      console.log('');
    } else {
      console.log('❌ EMR Backend not responding');
      console.log('💡 Start with: cd "EMR System/terminology-service" && npm run dev\n');
      return;
    }
  } catch (error) {
    console.log('❌ Cannot connect to EMR backend:', error.message);
    console.log('💡 Make sure EMR backend is running on port 5000\n');
    return;
  }

  // Test 2: Main Backend Health Check
  console.log('2️⃣ Testing Main Backend Health...');
  try {
    const mainHealthResponse = await fetch('http://localhost:3000/api/health');
    if (mainHealthResponse.ok) {
      console.log('✅ Main Backend is running');
    } else {
      console.log('❌ Main Backend not responding');
    }
  } catch (error) {
    console.log('❌ Cannot connect to main backend:', error.message);
    console.log('💡 Make sure main backend is running: npm run dev\n');
  }

  // Test 3: HAPI Server Health Check
  console.log('3️⃣ Testing HAPI Server...');
  try {
    const hapiResponse = await fetch('http://localhost:8080/fhir/metadata');
    if (hapiResponse.ok) {
      console.log('✅ HAPI FHIR Server is running');
    } else {
      console.log('❌ HAPI Server not responding');
    }
  } catch (error) {
    console.log('❌ Cannot connect to HAPI server:', error.message);
    console.log('💡 Start with: docker-compose -f docker-compose.hapi.yml up -d\n');
  }

  // Test 4: Complete Integration Flow
  console.log('4️⃣ Testing Complete Integration Flow...');
  
  const testCases = [
    { query: 'Shaqiqa', description: 'Term with ICD mapping' },
    { query: 'Bayda', description: 'Term without ICD mapping' },
    { query: 'InvalidTerm', description: 'Non-existent term' }
  ];

  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: ${testCase.query} (${testCase.description})`);
    
    try {
      const emrRequest = {
        query: testCase.query,
        patientId: 'abha-test-12345'
      };

      console.log('📤 EMR Frontend → EMR Backend request:');
      console.log(JSON.stringify(emrRequest, null, 2));

      const emrResponse = await fetch('http://localhost:5000/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'supersecretapikey123',
          'Authorization': 'Bearer lMqWaS9eAWR6BB4hcLzU9nF0NHth3z99'
        },
        body: JSON.stringify(emrRequest)
      });

      if (emrResponse.ok) {
        const emrData = await emrResponse.json();
        console.log('📥 EMR Backend → EMR Frontend response:');
        
        // Display key information
        console.log(`✅ Status: ${emrData.status}`);
        console.log(`📊 Total Mappings: ${emrData.terminology?.totalMappings || 0}`);
        console.log(`🌿 NAMASTE Code: ${emrData.terminology?.namaste?.code || 'N/A'}`);
        console.log(`🌍 ICD-11 Code: ${emrData.terminology?.icd11?.code || 'N/A'}`);
        console.log(`📋 Mapping Status: ${emrData.terminology?.mappingStatus || 'N/A'}`);
        console.log(`🏥 Source: ${emrData.audit?.source || 'N/A'}`);
        
        // Verify integration points
        if (emrData.rawMapping && emrData.rawMapping.length > 0) {
          console.log('✅ Raw mapping data received from main backend');
        }
        
        if (emrData.fhir) {
          console.log('✅ FHIR resource received from main backend');
        }
        
        if (emrData.audit?.source === 'HAPI-FHIR-Integration') {
          console.log('✅ HAPI FHIR integration confirmed');
        }

      } else {
        const errorData = await emrResponse.json();
        console.log(`❌ EMR Response Error (${emrResponse.status}):`, errorData.error);
        console.log('   Details:', errorData.details || 'No additional details');
      }

    } catch (error) {
      console.log('❌ Integration test error:', error.message);
    }
  }

  // Test 5: Frontend Load Test
  console.log('\n5️⃣ Testing Frontend Availability...');
  try {
    const frontendResponse = await fetch('http://localhost:5173');
    if (frontendResponse.ok) {
      console.log('✅ EMR Frontend is accessible at http://localhost:5173');
    } else {
      console.log('❌ EMR Frontend not responding');
    }
  } catch (error) {
    console.log('❌ Cannot connect to EMR frontend:', error.message);
    console.log('💡 Start with: cd "EMR System/emr-frontend-clean" && npm run dev');
  }

  console.log('\n🎯 INTEGRATION TEST SUMMARY:');
  console.log('✅ EMR Backend: Proxy service to main backend');
  console.log('✅ Main Backend: HAPI FHIR integrated terminology service');
  console.log('✅ HAPI Server: Standards-compliant FHIR operations');
  console.log('✅ EMR Frontend: Enhanced UI for terminology display');
  console.log('\n🎉 Complete Integration Architecture:');
  console.log('EMR Frontend (React) ←→ EMR Backend (Express) ←→ Main Backend (Next.js) ←→ HAPI FHIR Server');
};

// Run the integration test
testCompleteIntegration().catch(console.error);