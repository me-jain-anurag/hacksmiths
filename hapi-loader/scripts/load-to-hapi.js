import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HAPI_BASE_URL = 'http://localhost:8080/fhir';
const OUTPUT_DIR = path.resolve(__dirname, '../output');

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

async function loadResource(filePath, resourceType) {
  try {
    console.log(`\n📤 Loading ${resourceType}...`);
    
    const fullPath = path.join(OUTPUT_DIR, filePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`);
    }
    
    const resource = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    console.log(`📊 Resource: ${resource.resourceType} - ${resource.id || resource.name}`);
    
    // Check if resource already exists
    const existingUrl = `${HAPI_BASE_URL}/${resource.resourceType}?url=${encodeURIComponent(resource.url)}`;
    const existingResponse = await fetch(existingUrl);
    
    if (existingResponse.ok) {
      const existingBundle = await existingResponse.json();
      if (existingBundle.total > 0) {
        console.log(`⚠️ ${resourceType} already exists, updating...`);
        const existingResource = existingBundle.entry[0].resource;
        resource.id = existingResource.id;
        
        // Update existing resource
        const updateResponse = await fetch(`${HAPI_BASE_URL}/${resource.resourceType}/${resource.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/fhir+json',
            'Accept': 'application/fhir+json'
          },
          body: JSON.stringify(resource),
        });
        
        if (updateResponse.ok) {
          const result = await updateResponse.json();
          console.log(`✅ ${resourceType} updated successfully: ${updateResponse.status}`);
          return result;
        } else {
          const errorText = await updateResponse.text();
          throw new Error(`Update failed: ${updateResponse.status} - ${errorText}`);
        }
      }
    }
    
    // Create new resource using the correct resource endpoint
    const resourceUrl = `${HAPI_BASE_URL}/${resource.resourceType}`;
    const response = await fetch(resourceUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      },
      body: JSON.stringify(resource),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ ${resourceType} created successfully: ${response.status}`);
      console.log(`🆔 Resource ID: ${result.id}`);
      return result;
    } else {
      const errorText = await response.text();
      console.error(`❌ Failed to create ${resourceType}: ${response.status}`);
      console.error(`Error details: ${errorText}`);
      throw new Error(`Failed to create ${resourceType}: ${response.status}`);
    }
  } catch (error) {
    console.error(`❌ Error loading ${resourceType}:`, error.message);
    throw error;
  }
}

async function verifyResources() {
  console.log('\n🔍 Verifying loaded resources...');
  
  try {
    // Check CodeSystem
    const codeSystemResponse = await fetch(`${HAPI_BASE_URL}/CodeSystem?url=http://ayush.gov.in/fhir/namaste`);
    const codeSystemBundle = await codeSystemResponse.json();
    
    if (codeSystemBundle.total > 0) {
      const codeSystem = codeSystemBundle.entry[0].resource;
      console.log(`✅ NAMASTE CodeSystem found: ${codeSystem.count || 'Unknown'} concepts`);
    } else {
      console.log('❌ NAMASTE CodeSystem not found');
    }
    
    // Check ConceptMap
    const conceptMapResponse = await fetch(`${HAPI_BASE_URL}/ConceptMap?url=http://ayush.gov.in/fhir/ConceptMap/namaste-to-icd11`);
    const conceptMapBundle = await conceptMapResponse.json();
    
    if (conceptMapBundle.total > 0) {
      const conceptMap = conceptMapBundle.entry[0].resource;
      const mappingCount = conceptMap.group?.[0]?.element?.length || 0;
      console.log(`✅ NAMASTE-ICD11 ConceptMap found: ${mappingCount} mappings`);
    } else {
      console.log('❌ NAMASTE-ICD11 ConceptMap not found');
    }
  } catch (error) {
    console.error('❌ Error verifying resources:', error.message);
  }
}

async function testTerminologyOperations() {
  console.log('\n🧪 Testing terminology operations...');
  
  try {
    // Test $lookup operation
    console.log('🔍 Testing $lookup operation for code A-2...');
    const lookupResponse = await fetch(`${HAPI_BASE_URL}/CodeSystem/$lookup?system=http://ayush.gov.in/fhir/namaste&code=A-2`);
    
    if (lookupResponse.ok) {
      const lookupResult = await lookupResponse.json();
      console.log('✅ $lookup operation successful');
      const displayParam = lookupResult.parameter?.find(p => p.name === 'display');
      console.log(`📋 Display: ${displayParam?.valueString || 'Not found'}`);
    } else {
      console.log(`❌ $lookup operation failed: ${lookupResponse.status}`);
    }
    
    // Test $translate operation
    console.log('🔄 Testing $translate operation...');
    const translateBody = {
      resourceType: "Parameters",
      parameter: [
        { name: "code", valueCode: "A-2" },
        { name: "system", valueUri: "http://ayush.gov.in/fhir/namaste" },
        { name: "target", valueUri: "http://id.who.int/icd/release/11/mms" },
        { name: "url", valueUri: "http://ayush.gov.in/fhir/ConceptMap/namaste-to-icd11" }
      ]
    };
    
    const translateResponse = await fetch(`${HAPI_BASE_URL}/ConceptMap/$translate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      },
      body: JSON.stringify(translateBody)
    });
    
    if (translateResponse.ok) {
      const translateResult = await translateResponse.json();
      const resultParam = translateResult.parameter?.find(p => p.name === 'result');
      console.log(`✅ $translate operation successful: ${resultParam?.valueBoolean ? 'Translation found' : 'No translation'}`);
      
      if (resultParam?.valueBoolean) {
        const match = translateResult.parameter?.find(p => p.name === 'match');
        const concept = match?.part?.find(p => p.name === 'concept')?.valueCoding;
        if (concept) {
          console.log(`🎯 ICD-11 Code: ${concept.code} - ${concept.display}`);
        }
      }
    } else {
      console.log(`❌ $translate operation failed: ${translateResponse.status}`);
    }
  } catch (error) {
    console.error('❌ Error testing operations:', error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Starting HAPI FHIR resource loading process...\n');
    
    // Wait for HAPI server to be ready
    await waitForHapi();
    
    // Load CodeSystem
    await loadResource('namaste-codesystem.json', 'NAMASTE CodeSystem');
    
    // Wait a bit between loads
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Load ConceptMap
    await loadResource('namaste-icd11-map.json', 'NAMASTE-ICD11 ConceptMap');
    
    // Verify resources were loaded
    await verifyResources();
    
    // Test terminology operations
    await testTerminologyOperations();
    
    console.log('\n🎉 HAPI FHIR setup completed successfully!');
    console.log('🌐 HAPI FHIR server: http://localhost:8080/fhir');
    console.log('📊 CodeSystem: http://localhost:8080/fhir/CodeSystem');
    console.log('🔄 ConceptMap: http://localhost:8080/fhir/ConceptMap');
    console.log('🖥️ HAPI UI: http://localhost:8080');
    
  } catch (error) {
    console.error('\n❌ HAPI FHIR setup failed:', error.message);
    process.exit(1);
  }
}

main();