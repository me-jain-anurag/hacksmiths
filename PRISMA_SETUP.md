# Prisma Setup Guide for Neon Database

## 1. Set up your Neon Database

1. Go to https://neon.tech and create a new project
2. Create a new database (if needed)
3. Copy your connection string from the Neon dashboard

## 2. Update Environment Variables

Replace the DATABASE_URL in your `.env.local` file with your actual Neon connection string:

```
DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
```

Example:
```
DATABASE_URL="postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

## 3. Run Database Migration

After setting up the DATABASE_URL, run these commands:

```bash
# Apply the migration to create the audit_logs table
npx prisma migrate dev --name init

# Generate Prisma Client (if needed)
npx prisma generate

# View your database in Prisma Studio (optional)
npx prisma studio
```

## 4. Test the Database Connection

```bash
# Check migration status
npx prisma migrate status

# Reset database (if needed)
npx prisma migrate reset
```

## 5. AuditLog Table Schema

The migration will create this table in your Neon database:

```sql
CREATE TABLE "audit_logs" (
  "id" SERIAL PRIMARY KEY,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "action" TEXT NOT NULL,
  "outcome" TEXT NOT NULL,
  "ipAddress" TEXT,
  "clientId" TEXT,
  "doctorId" TEXT,
  "queryTerm" TEXT,
  "namasteCode" TEXT,
  "icdCode" TEXT,
  "fhirEvent" JSONB NOT NULL
);
```

## 6. Usage in API

The API route now automatically logs all search attempts to the AuditLog table with:
- Authentication attempts (success/failure)
- Search queries and results
- User context (doctor ID, client ID, IP address)
- FHIR AuditEvent for compliance
- Mapping results (NAMASTE and ICD codes found)

## 7. Environment Variables Summary

Make sure your `.env.local` includes:

```
# Database
DATABASE_URL="your-neon-connection-string"

# ABHA Settings
ABHA_JWKS_URL=https://example.com/jwks
ABHA_ISSUER=https://example.com
ABHA_AUDIENCE=terminology-api
ALLOW_INSECURE_DEV=true
```