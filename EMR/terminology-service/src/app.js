// src/app.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Main backend configuration
const MAIN_BACKEND_URL = process.env.MAIN_BACKEND_URL || 'http://localhost:3000';
const MAIN_BACKEND_API_KEY = process.env.MAIN_BACKEND_API_KEY || 'lMqWaS9eAWR6BB4hcLzU9nF0NHth3z99';

console.log("🚀 EMR Backend Starting...");
console.log("📡 Main Backend URL:", MAIN_BACKEND_URL);
console.log("🔑 Main Backend API Key:", MAIN_BACKEND_API_KEY ? `${MAIN_BACKEND_API_KEY.substring(0, 8)}...` : 'NOT SET');
console.log("🌍 Environment:", process.env.NODE_ENV || 'development');

// ------------------------------
// Enable CORS for frontend
// ------------------------------
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"], // React frontend + Next.js backend
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
  credentials: true
}));

// Middleware to parse JSON
app.use(express.json());

// ------------------------------
// Health Check
// ------------------------------
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'EMR Terminology Service is running 🚀',
    mainBackend: MAIN_BACKEND_URL,
    timestamp: new Date().toISOString()
  });
});

// ------------------------------
// Middleware: Simple Authentication
// ------------------------------
function authenticateRequest(req, res, next) {
  const clientApiKey = req.headers['x-api-key'];
  const authHeader = req.headers['authorization'];

  // Basic validation
  if (!clientApiKey) {
    return res.status(403).json({ error: 'Missing X-API-Key header' });
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization Bearer token' });
  }

  // For development, we'll accept the token and pass it through
  const token = authHeader.split(' ')[1];
  req.abhToken = token;
  req.clientApiKey = clientApiKey;
  
  next();
}

// ------------------------------
// POST /api/search - Main terminology search endpoint
// ------------------------------
app.post('/api/search', authenticateRequest, async (req, res) => {
  const { patientId, query } = req.body;

  if (!query) {
    return res.status(400).json({ 
      error: 'Query is required',
      details: 'Please provide a search term' 
    });
  }

  try {
    console.log(`🔍 EMR Search Request: "${query}" for patient: ${patientId || 'N/A'}`);
    
    const requestHeaders = {
      'Content-Type': 'application/json',
      'X-API-Key': MAIN_BACKEND_API_KEY,
      'Authorization': `Bearer ${req.abhToken}`
    };
    
    console.log('📤 Sending to main backend with headers:');
    console.log('   Content-Type:', requestHeaders['Content-Type']);
    console.log('   X-API-Key:', requestHeaders['X-API-Key'] ? `${requestHeaders['X-API-Key'].substring(0, 8)}...` : 'NOT SET');
    console.log('   Authorization:', requestHeaders['Authorization'] ? `Bearer ${req.abhToken.substring(0, 8)}...` : 'NOT SET');
    
    // Call your main backend with HAPI integration
    const mainBackendResponse = await axios.post(
      `${MAIN_BACKEND_URL}/api/terminology/search`,
      {
        query: query,
        patientId: patientId || undefined
      },
      {
        headers: requestHeaders,
        timeout: 30000 // 30 second timeout
      }
    );

    const mainBackendData = mainBackendResponse.data;
    console.log(`✅ Main Backend Response: ${mainBackendData.rawMapping?.length || 0} mappings found`);

    // Transform the response for EMR frontend display
    const emrResponse = {
      status: 'success',
      timestamp: new Date().toISOString(),
      query: query,
      patientId: patientId,
      
      // Raw mapping data from main backend
      rawMapping: mainBackendData.rawMapping || [],
      
      // FHIR resource from main backend
      fhir: mainBackendData.fhir || null,
      
      // Enhanced EMR-specific fields
      terminology: {
        namaste: mainBackendData.rawMapping?.find(m => m.system.includes('namaste')) || null,
        icd11: mainBackendData.rawMapping?.find(m => m.system.includes('icd')) || null,
        mappingStatus: mainBackendData.rawMapping?.[0]?.mappingStatus || 'UNKNOWN',
        totalMappings: mainBackendData.rawMapping?.filter(m => m.mappingStatus === 'MAPPED').length || 0
      },
      
      // Audit information
      audit: {
        source: 'HAPI-FHIR-Integration',
        searchedAt: new Date().toISOString(),
        emrBackend: `http://localhost:${PORT}`,
        mainBackend: MAIN_BACKEND_URL
      }
    };

    // Log successful integration
    console.log(`📊 EMR Response Summary:
    - Query: "${query}"
    - NAMASTE Code: ${emrResponse.terminology.namaste?.code || 'N/A'}
    - ICD-11 Code: ${emrResponse.terminology.icd11?.code || 'N/A'}
    - Mapping Status: ${emrResponse.terminology.mappingStatus}
    - Total Mappings: ${emrResponse.terminology.totalMappings}`);

    res.json(emrResponse);

  } catch (error) {
    console.error('❌ EMR Backend Error:', error.message);
    
    // Enhanced error handling
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Main backend unavailable',
        details: 'Cannot connect to main terminology service',
        suggestion: 'Please ensure the main backend is running on ' + MAIN_BACKEND_URL
      });
    }
    
    if (error.response) {
      // Main backend returned an error
      return res.status(error.response.status).json({
        error: 'Main backend error',
        details: error.response.data || error.message,
        mainBackendStatus: error.response.status
      });
    }
    
    // Generic error
    res.status(500).json({
      error: 'Internal EMR backend error',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ------------------------------
// GET /api/health - Health check with backend connectivity
// ------------------------------
app.get('/api/health', async (req, res) => {
  try {
    // Test connection to main backend
    const healthResponse = await axios.get(`${MAIN_BACKEND_URL}/api/health`, {
      timeout: 5000
    });
    
    res.json({
      emrBackend: 'healthy',
      mainBackend: 'connected',
      mainBackendResponse: healthResponse.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      emrBackend: 'healthy',
      mainBackend: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ------------------------------
// Start server
// ------------------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
