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

### **1. EMR Frontend** (`EMR/emr-frontend-clean/`)
- **Technology**: React 19 + Vite + TailwindCSS
- **Purpose**: Enhanced medical search interface for healthcare providers
- **Features**:
  - Visual display of NAMASTE ↔ ICD-11 mappings
  - FHIR resource visualization
    
<p align="center">
  <b>EMR Frontend</b>
</p>
<p align="center">
  <img src="https://ik.imagekit.io/vtwmik0pw/emr_fe.jpg?updatedAt=1758221628315" alt="EMR Frontend " width="800"/>
</p>

### **2. EMR Backend** (`EMR/terminology-service/`)
- **Technology**: Express.js + Node.js
- **Purpose**: API proxy service with authentication and transformation
- **Features**:
  - API key validation 
  - Request/response transformation for EMR frontend

<p align="center">
  <b>API Generation</b>
</p>
<p align="center">
  <img src="https://ik.imagekit.io/vtwmik0pw/image.jpg?updatedAt=1758222314099" alt="API Generation Screenshot" width="800"/>
</p>
  

### **3. Main Backend** (Root Next.js application)
- **Technology**: Next.js 15 + TypeScript + Prisma
- **Purpose**: Core FHIR-integrated terminology service
- **Features**:
  - **HAPI FHIR Integration**: Standards-based $lookup and $translate operations
  - **FHIR R4 Compliance**: Generates proper FHIR Condition resources
  - **Audit Logging**: Audit trail with FHIR AuditEvent resources
 
### **4. Main Frontend** (Client & Admin Dashboard)  
- **Technology**: React 19 + Vite + TailwindCSS
- **Purpose**: Unified interface for end-users and API clients to interact with terminology services
- **Features**:
  - **Terminology Display**: Visual display of NAMASTE ↔ ICD-11 mappings
  - **FHIR Resource Visualization**: Shows structured FHIR Condition resources
  - **Client Key Management**: Allows API clients to manage their personal API keys
  - **Admin Management**: User and API client management
<p align="center">
  <b>Client Dashboard View</b>
</p>
<p align="center">
        <img src="https://ik.imagekit.io/vtwmik0pw/client.jpg?updatedAt=1758223347605" alt="Client Dashboard View" width="800"/> 
</p>
<p align="center">
  <b>Admin Dashboard View</b>
</p>
<p align="center"> 
        <img src="https://ik.imagekit.io/vtwmik0pw/admin.jpg?updatedAt=1758223368321" alt="Admin Dashboard View" width="800"/>
</p>
  
### **5. HAPI FHIR Server** (`hapi-loader/`)
- **Technology**: Docker + HAPI FHIR R4 + PostgreSQL
- **Purpose**: Standards-compliant FHIR terminology server
- **Features**:
  - **FHIR Operations**: $lookup, $translate, $validate-code
  - **Persistence**: PostgreSQL backend with full FHIR resource storage

## 🔧 **Quick Start Guide**

### Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** 18+
- **Docker Desktop**
- **Git**
- **VS Code** (recommended)

⚠️ **Note:** Ensure that you have a valid API key before starting.  

### 🚀 One-Command Startup

Follow these steps to set up and run the project:  

#### 1️⃣ Clone the Repository
```bash
git clone <repository>
cd my-next-app
```
#### 2️⃣ Start HAPI FHIR Server
```bash
docker-compose -f docker-compose.hapi.yml up -d
```
#### 3️⃣ Load Terminology Data
```bash
cd hapi-loader
npm install
npm run setup
npx prisma generate
```
#### 4️⃣ Start Main Backend
```bash
cd ..
npm install
npm run dev
```
#### 5️⃣ Start EMR Backend
```bash
cd EMR/terminology-service
npm install
npm start
```
#### 6️⃣ Start EMR Frontend
```bash
cd EMR/emr-frontend-clean
npm install
npm run dev
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
1. **User Input**: Doctor enters "shaqiqa" in EMR frontend
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
   - `shaqiqa` → NAMASTE term for migraine
   - `migraine` → Should map to ICD-11
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

*Built with ❤️ for better healthcare interoperability*
