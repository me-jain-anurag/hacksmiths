# API Key Authentication Implementation

## Overview
API Key Authentication has been successfully implemented for the terminology service. This adds client-level authentication before ABHA JWT verification.

## Database Schema

### Client Table
```prisma
model Client {
  id        Int      @id @default(autoincrement())
  name      String   // e.g. "Aarogya EMR"
  apiKey    String   @unique
  createdAt DateTime @default(now())
  @@map("clients")
}
```

### Enhanced Audit Logs
The audit logs now include client information:
- `apiClientId` - ID of the authenticated client
- `apiClientName` - Name of the authenticated client

## Authentication Flow

1. **Client Authentication** (X-API-Key header)
   - Validates API key against clients table
   - Returns 403 if missing or invalid

2. **ABHA JWT Verification** (Authorization header)
   - Validates JWT token as before
   - Returns 401 if missing or invalid

3. **Terminology Search**
   - Proceeds only if both authentications pass
   - Logs client info in audit events

## Usage

### Required Headers
```bash
X-API-Key: lMqWaS9eAWR6BB4hcLzU9nF0NHth3z99
Authorization: Bearer <abha-jwt-token>
Content-Type: application/json
```

### Example Request
```bash
curl -X POST http://localhost:3000/api/terminology/search \
     -H "Content-Type: application/json" \
     -H "X-API-Key: lMqWaS9eAWR6BB4hcLzU9nF0NHth3z99" \
     -H "Authorization: Bearer test-token" \
     -d '{"query": "diabetes"}'
```

## Test Clients

| ID | Name | API Key | Created |
|----|------|---------|---------|
| 1 | Aarogya EMR | `lMqWaS9eAWR6BB4hcLzU9nF0NHth3z99` | 2025-09-15 |
| 2 | MediSoft HIS | `ZDVQa06jf1uUH84bMCL5KiDtRUeLmVJd` | 2025-09-15 |
| 3 | CureCare EMR | `LwfcE2FuJgwxIVg9qPusW4wxz5zq1BDC` | 2025-09-15 |

## Error Responses

### Missing X-API-Key
```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "forbidden",
    "diagnostics": "Client authentication failed: Missing X-API-Key header"
  }]
}
```

### Invalid API Key
```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "forbidden",
    "diagnostics": "Client authentication failed: Invalid API key"
  }]
}
```

## Security Features

1. **API Key Validation**: 32-character random keys stored securely
2. **Unique Constraints**: Each API key is unique in database
3. **Audit Logging**: All authentication attempts logged
4. **Client Tracking**: Full client context in audit trails
5. **Error Handling**: Secure error messages without sensitive info

## Implementation Files

- `lib/authenticateClient.ts` - Client authentication logic
- `prisma/schema.prisma` - Database schema with Client model
- `app/api/terminology/search/route.ts` - Updated API route
- `lib/audit.ts` - Enhanced audit logging

## Administration

### Adding New Clients
```javascript
const client = await prisma.client.create({
  data: {
    name: "New EMR System",
    apiKey: generateApiKey() // 32-char random string
  }
});
```

### Viewing Clients
```sql
SELECT id, name, LEFT(api_key, 8) || '...' as api_key, created_at 
FROM clients 
ORDER BY created_at DESC;
```

### Revoking Access
```sql
DELETE FROM clients WHERE api_key = 'old-api-key';
```

## Next Steps

1. **Client Management UI**: Build admin interface for managing API keys
2. **Rate Limiting**: Add per-client rate limiting
3. **Key Rotation**: Implement automatic API key rotation
4. **Scoped Permissions**: Add permission levels per client
5. **API Key Expiration**: Add optional expiration dates