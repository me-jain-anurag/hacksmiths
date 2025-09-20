// create-mock-jwt.js
// Create a mock JWT token for development testing

function createMockJWT() {
  // Header (JWT header, typically { "alg": "RS256", "typ": "JWT" })
  const header = {
    "alg": "RS256",
    "typ": "JWT"
  };

  // Payload (claims)
  const payload = {
    "sub": "doctor-123",           // subject (doctor ID)
    "client_id": "emr-client",     // EMR client ID
    "scope": "terminology/search.read", // required scope
    "iss": "https://example.com",  // issuer
    "aud": "terminology-api",      // audience
    "exp": Math.floor(Date.now() / 1000) + 3600, // expires in 1 hour
    "iat": Math.floor(Date.now() / 1000), // issued at
    "hprid": "HPR-123456"         // health professional registry ID
  };

  // Signature (for mock, we'll use a dummy signature)
  const signature = "mock-signature-for-development";

  // Base64 encode each part
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const encodedSignature = Buffer.from(signature).toString('base64url');

  // Combine into JWT format
  const mockJWT = `${encodedHeader}.${encodedPayload}.${encodedSignature}`;

  console.log('🎭 Mock JWT Token for Development:');
  console.log(mockJWT);
  console.log('\n📋 Copy this token to use in your EMR frontend:');
  console.log(`Bearer ${mockJWT}`);
  
  console.log('\n🔍 Decoded Payload:');
  console.log(JSON.stringify(payload, null, 2));

  return mockJWT;
}

createMockJWT();