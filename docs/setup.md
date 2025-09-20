## Setup & Quickstart

### Prerequisites
- Node.js 18+
- Docker Desktop
- Git

### Repository Setup
```bash
git clone <repo>
cd <repo>
```

### Service Startup Order
```
HAPI FHIR (8080) → Main Backend (3000) → EMR Backend (5000) → EMR Frontend (5173)
```

### Environment Variables

Main Backend (`.env.local`):
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
ABHA_PUBLIC_KEY=your_public_key
HAPI_BASE_URL=http://localhost:8080/fhir
```

EMR Backend (`EMR/terminology-service/.env`):
```env
PORT=5000
MAIN_BACKEND_URL=http://localhost:3000
MAIN_BACKEND_API_KEY=lMqWaS9eAWR6BB4hcLzU9nF0NHth3z99
OUR_API_KEY=supersecretapikey123
FRONTEND_URL=http://localhost:5173
```

EMR Frontend (`EMR/emr-frontend-clean/.env`):
```env
VITE_API_URL=http://localhost:5000
VITE_API_KEY=supersecretapikey123
```

### Start Services
1) HAPI FHIR
```bash
docker-compose -f docker-compose.hapi.yml up -d
```
2) Load Terminology
```bash
cd hapi-loader
npm install
npm run setup
```
3) Main Backend
```bash
cd ..
npm install
npx prisma generate
npm run dev
```
4) EMR Backend
```bash
cd EMR/terminology-service
npm install
npm start
```
5) EMR Frontend
```bash
cd ../emr-frontend-clean
npm install
npm run dev
```

### Verification
```bash
node test-complete-integration.js
curl http://localhost:8080/fhir/metadata
curl http://localhost:3000/api/health
curl http://localhost:5000/api/health
```

### Notes
- Ensure API keys match across services.
- Provide a valid ABHA JWT for protected calls.


