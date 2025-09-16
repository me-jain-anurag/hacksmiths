# 🏥 **SIH 2025 - HAPI FHIR Integrated Medical Terminology System**

## 🚀 **Complete Architecture Overview**

This is a **Standards-Based Medical Terminology System** that integrates **NAMASTE (Ayurveda)** with **ICD-11 (WHO)** using **HAPI FHIR Server** for interoperability and compliance.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  EMR Frontend   │◄──►│  EMR Backend    │◄──►│ Main Backend    │◄──►│ HAPI FHIR Server│
│  (React/Vite)   │    │   (Express)     │    │   (Next.js)     │    │    (Docker)     │
│   Port 5173     │    │   Port 5000     │    │   Port 3000     │    │   Port 8080     │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │                       │
    UI Layer              Proxy Service         Core API Service        Standards Backend
   
🔄 Data Flow: User Search → EMR Proxy → FHIR Operations → Terminology Mapping → Structured Response
```

## 📋 **System Components**

### **1. EMR Frontend** (`EMR/emr-frontend-clean/`)
- **Technology**: React 19 + Vite + TailwindCSS
- **Purpose**: Enhanced medical search interface for healthcare providers
- **Features**:
  - Intelligent terminology search with autocomplete
  - Visual display of NAMASTE ↔ ICD-11 mappings
  - FHIR resource visualization
  - Real-time validation and error handling
  - Patient context integration

### **2. EMR Backend** (`EMR/terminology-service/`)
- **Technology**: Express.js + Node.js
- **Purpose**: API proxy service with authentication and transformation
- **Features**:
  - API key validation and JWT token verification
  - Request/response transformation for EMR frontend
  - Error handling and timeout management
  - Health monitoring for downstream services

### **3. Main Backend** (Root Next.js application)
- **Technology**: Next.js 15 + TypeScript + Prisma
- **Purpose**: Core FHIR-integrated terminology service
- **Features**:
  - **HAPI FHIR Integration**: Standards-based $lookup and $translate operations
  - **Smart Fallback**: Automatic fallback to CSV data when HAPI unavailable
  - **FHIR R4 Compliance**: Generates proper FHIR Condition resources
  - **Audit Logging**: Complete audit trail with FHIR AuditEvent resources
  - **API Security**: JWT authentication with ABHA claims validation

### **4. HAPI FHIR Server** (`hapi-loader/`)
- **Technology**: Docker + HAPI FHIR R4 + PostgreSQL
- **Purpose**: Standards-compliant FHIR terminology server
- **Features**:
  - **CodeSystem**: 2,519 NAMASTE concepts loaded from CSV
  - **ConceptMap**: 965 NAMASTE→ICD-11 mappings
  - **FHIR Operations**: $lookup, $translate, $validate-code
  - **Persistence**: PostgreSQL backend with full FHIR resource storage

## 🔧 **Quick Start Guide**

### **Prerequisites**
```bash
# Required Software
- Node.js 18+
- Docker Desktop
- Git
- VS Code (recommended)
```

### **🚀 One-Command Startup**
```powershell
# Clone and start everything
git clone <repository>
cd my-next-app

# Start all services (run each in separate terminals)
# Terminal 1: HAPI FHIR Server
docker-compose -f docker-compose.hapi.yml up -d

# Terminal 2: Load terminology data
cd hapi-loader
npm install && npm run setup

# Terminal 3: Main Backend
cd ..
npm install && npm run dev

# Terminal 4: EMR Backend
cd EMR/terminology-service
npm install && npm start

# Terminal 5: EMR Frontend
cd ../emr-frontend-clean
npm install && npm run dev
```

### **🧪 Verify Installation**
```powershell
# Test complete integration
node test-complete-integration.js

# Individual service health checks
curl http://localhost:8080/fhir/metadata     # HAPI FHIR
curl http://localhost:3000/api/health        # Main Backend
curl http://localhost:5000/api/health        # EMR Backend
curl http://localhost:5173                   # EMR Frontend
```

## 📊 **API Reference**

### **Primary Endpoint: Terminology Search**
```http
POST http://localhost:5000/api/search
Content-Type: application/json
X-API-Key: supersecretapikey123
Authorization: Bearer <jwt_token>

{
  "query": "migraine",
  "patientId": "abha-12345"
}
```

### **Response Format**
```json
{
  "status": "success",
  "timestamp": "2025-09-16T17:30:00.000Z",
  "query": "migraine",
  "patientId": "abha-12345",
  "terminology": {
    "namaste": {
      "code": "A-2",
      "display": "Shaqiqa",
      "system": "http://ayush.gov.in/fhir/namaste"
    },
    "icd11": {
      "code": "669367341",
      "display": "Migraine",
      "system": "http://id.who.int/icd/release/11/mms"
    },
    "mappingStatus": "MAPPED",
    "totalMappings": 2
  },
  "fhir": {
    "resourceType": "Condition",
    "id": "ae3b4344-e87f-4a2d-84d0-e88956048606",
    "code": {
      "coding": [
        {
          "system": "http://ayush.gov.in/fhir/namaste",
          "code": "A-2",
          "display": "Shaqiqa"
        },
        {
          "system": "http://id.who.int/icd/release/11/mms",
          "code": "669367341",
          "display": "Migraine"
        }
      ],
      "text": "Shaqiqa / Migraine"
    }
  }
}
```

## 🔄 **Technical Flow**

### **Search Request Flow**
1. **User Input**: Doctor enters "migraine" in EMR frontend
2. **EMR Frontend**: Validates input, sends POST to EMR backend
3. **EMR Backend**: Authenticates request, forwards to main backend
4. **Main Backend**: 
   - Checks HAPI server availability
   - Searches CSV data for initial matches
   - Calls HAPI $lookup for NAMASTE term validation
   - Calls HAPI $translate for ICD-11 mapping
   - Generates FHIR Condition resource
   - Logs audit events
5. **Response Chain**: FHIR response → Main backend → EMR backend → EMR frontend
6. **UI Display**: Enhanced terminology cards with mapping status

### **HAPI FHIR Operations**
```typescript
// $lookup operation - Get term details
GET /fhir/CodeSystem/$lookup?system=http://ayush.gov.in/fhir/namaste&code=A-2

// $translate operation - Map NAMASTE to ICD-11
GET /fhir/ConceptMap/$translate?system=http://ayush.gov.in/fhir/namaste&code=A-2&target=http://id.who.int/icd/release/11/mms
```

## 🛠️ **Development & Configuration**

### **Environment Variables**

**Main Backend** (`.env.local`):
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
ABHA_PUBLIC_KEY=your_public_key
HAPI_BASE_URL=http://localhost:8080/fhir
```

**EMR Backend** (`EMR/terminology-service/.env`):
```env
PORT=5000
MAIN_BACKEND_URL=http://localhost:3000
MAIN_BACKEND_API_KEY=lMqWaS9eAWR6BB4hcLzU9nF0NHth3z99
OUR_API_KEY=supersecretapikey123
FRONTEND_URL=http://localhost:5173
```

**EMR Frontend** (`EMR/emr-frontend-clean/.env`):
```env
VITE_API_URL=http://localhost:5000
VITE_API_KEY=supersecretapikey123
```

### **Database Schema**
```sql
-- API client management
model Client {
  id          Int      @id @default(autoincrement())
  name        String
  apiKey      String   @unique
  createdAt   DateTime @default(now())
}

-- Audit logging
model AuditLog {
  id           Int      @id @default(autoincrement())
  action       String
  outcome      String
  queryTerm    String?
  namasteCode  String?
  icdCode      String?
  createdAt    DateTime @default(now())
}
```

## 🧪 **Testing Guide**

### **Manual Testing**
1. **Open EMR Frontend**: http://localhost:5173
2. **Search Terms**:
   - `migraine` → Should map to ICD-11
   - `shaqiqa` → NAMASTE term for migraine
   - `fever` → Test multiple mappings
   - `xyz123` → Test error handling

### **API Testing with cURL**
```bash
# Test EMR endpoint
curl -X POST "http://localhost:5000/api/search" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: supersecretapikey123" \
  -d '{"query": "migraine", "patientId": "test-123"}'

# Test main backend directly
curl -X POST "http://localhost:3000/api/terminology/search" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: lMqWaS9eAWR6BB4hcLzU9nF0NHth3z99" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{"query": "migraine"}'
```

### **HAPI FHIR Testing**
```bash
# Test HAPI operations directly
curl "http://localhost:8080/fhir/CodeSystem/$lookup?system=http://ayush.gov.in/fhir/namaste&code=A-2"

curl "http://localhost:8080/fhir/ConceptMap/$translate?system=http://ayush.gov.in/fhir/namaste&code=A-2&target=http://id.who.int/icd/release/11/mms"
```

## 🔍 **Troubleshooting**

### **Common Issues**

| Issue | Solution |
|-------|----------|
| "HAPI server not available" | `docker-compose -f docker-compose.hapi.yml up -d` |
| "Main backend connection failed" | Check if Next.js is running on port 3000 |
| "EMR frontend not loading" | Verify EMR backend is running on port 5000 |
| "No mappings found" | Ensure terminology data is loaded: `cd hapi-loader && npm run setup` |
| "API key authentication failed" | Check API keys in environment variables |

### **Service Dependencies**
```
HAPI FHIR Server (Port 8080) ← Must start first
    ↓
Main Backend (Port 3000) ← Depends on HAPI
    ↓
EMR Backend (Port 5000) ← Depends on Main Backend
    ↓
EMR Frontend (Port 5173) ← Depends on EMR Backend
```

### **Health Check Commands**
```bash
# Check all services
npm run health-check     # Main backend
curl http://localhost:5000/api/health  # EMR backend
curl http://localhost:8080/fhir/metadata  # HAPI server
```

## 📁 **Project Structure**

```
my-next-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── terminology/   # Terminology endpoints
│   └── globals.css        # Global styles
├── lib/                   # Core libraries
│   ├── hapiClient.ts      # HAPI FHIR client
│   ├── terminologyHapi.ts # HAPI integration logic
│   ├── terminology.ts     # Fallback CSV logic
│   ├── abha.ts           # Authentication
│   └── audit.ts          # Audit logging
├── EMR/                   # EMR system components
│   ├── emr-frontend-clean/    # React frontend
│   └── terminology-service/   # Express backend
├── hapi-loader/           # HAPI FHIR management
│   ├── scripts/          # CSV to FHIR conversion
│   └── output/           # Generated FHIR resources
├── prisma/               # Database schema
├── scripts/              # Utility scripts
└── docs/                 # Additional documentation
```

## 🎯 **Key Benefits**

✅ **Standards Compliance**: Full FHIR R4 implementation  
✅ **Interoperability**: Industry-standard terminology operations  
✅ **Scalability**: Microservices architecture with independent scaling  
✅ **Reliability**: Smart fallback mechanisms and health monitoring  
✅ **Security**: Multi-layer authentication and audit logging  
✅ **Maintainability**: Clean separation of concerns and comprehensive documentation  

## 🚀 **Production Deployment**

### **Docker Deployment**
```bash
# Build production images
docker build -t emr-main-backend .
docker build -t emr-backend ./EMR/terminology-service
docker build -t emr-frontend ./EMR/emr-frontend-clean

# Deploy with docker-compose
docker-compose up -d
```

### **Environment Setup**
- Configure production database URLs
- Set up proper SSL certificates
- Update CORS origins for production domains
- Configure environment-specific API keys
- Set up monitoring and logging

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 **License**

This project is developed for **Smart India Hackathon 2025** - Ministry of AYUSH, Government of India.

---

## 🎉 **Success Indicators**

When everything is working correctly, you should see:

1. **EMR Frontend**: Rich UI showing NAMASTE + ICD mappings at http://localhost:5173
2. **EMR Backend Console**: Successful API calls to main backend
3. **Main Backend Console**: HAPI $lookup and $translate operations with fallback handling
4. **HAPI Server**: FHIR operation logs and successful resource storage

**Your Standards-Based Medical Terminology System is now fully operational!** 🚀

---

*Built with ❤️ for better healthcare interoperability*