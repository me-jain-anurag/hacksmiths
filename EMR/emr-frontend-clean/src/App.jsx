import { useState } from "react";
import { Search, Database, Globe, User, Clock, CheckCircle, AlertCircle, ChevronDown, Stethoscope, Activity } from "lucide-react";

export default function App() {
  const [query, setQuery] = useState("");
  const [patientId, setPatientId] = useState("abha-12345");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a search term");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": import.meta.env.VITE_API_KEY || "supersecretapikey123",
          "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkb2N0b3ItMTIzIiwiY2xpZW50X2lkIjoiZW1yLWNsaWVudCIsInNjb3BlIjoidGVybWlub2xvZ3kvc2VhcmNoLnJlYWQiLCJpc3MiOiJodHRwczovL2V4YW1wbGUuY29tIiwiYXVkIjoidGVybWlub2xvZ3ktYXBpIiwiZXhwIjoxNzU3OTU4MTEyLCJpYXQiOjE3NTc5NTQ1MTIsImhwcmlkIjoiSFBSLTEyMzQ1NiJ9.bW9jay1zaWduYXR1cmUtZm9yLWRldmVsb3BtZW50" // mock ABHA JWT token
        },
        body: JSON.stringify({
          patientId: patientId.trim() || undefined,
          query: query.trim()
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      setResult(data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred during search');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                EMR Terminology Search
              </h1>
              <p className="text-gray-600 text-lg mt-1">
                Intelligent medical terminology mapping with NAMASTE and ICD-11 integration
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Activity className="w-4 h-4" />
            <span>Powered by HAPI FHIR</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <Database className="w-4 h-4" />
            <span>Real-time terminology lookup</span>
          </div>
        </div>

        {/* Enhanced Search Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Search Parameters
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="w-4 h-4 text-blue-600" />
                Patient ID (ABHA)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., abha-12345"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 transition-all duration-200 hover:bg-white/80"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Search className="w-4 h-4 text-blue-600" />
                Medical Term
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter medical term (e.g., Shaqiqa)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 transition-all duration-200 hover:bg-white/80"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          <button
            onClick={handleSearch}
            disabled={loading}
            className={`group relative w-full lg:w-auto px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
              loading 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Search Terminology
                </>
              )}
            </div>
          </button>
        </div>

        {/* Enhanced Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800">Search Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Results Display */}
        {result && (
          <div className="space-y-8">
            {/* Summary Cards with improved design */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Query Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900">Search Query</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">Term:</span>
                    <span className="text-blue-800 font-mono text-sm">{result.query}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">Patient:</span>
                    <span className="text-blue-800 font-mono text-sm">{result.patientId || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 font-medium">Status:</span>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* NAMASTE Code Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-900">NAMASTE Code</h3>
                </div>
                {result.terminology?.namaste ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-green-700 text-sm font-medium">Code:</span>
                      <p className="text-green-800 font-mono text-lg">{result.terminology.namaste.code}</p>
                    </div>
                    <div>
                      <span className="text-green-700 text-sm font-medium">Display:</span>
                      <p className="text-green-800">{result.terminology.namaste.display}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>No NAMASTE code found</span>
                  </div>
                )}
              </div>

              {/* ICD-11 Mapping Card */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-100 border border-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-purple-900">ICD-11 Mapping</h3>
                </div>
                {result.terminology?.icd11 ? (
                  <div className="space-y-2">
                    <div>
                      <span className="text-purple-700 text-sm font-medium">Code:</span>
                      <p className="text-purple-800 font-mono text-lg">{result.terminology.icd11.code}</p>
                    </div>
                    <div>
                      <span className="text-purple-700 text-sm font-medium">Display:</span>
                      <p className="text-purple-800">{result.terminology.icd11.display}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-purple-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>No ICD-11 mapping available</span>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Mapping Status */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                Mapping Summary
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-b from-white to-gray-50 rounded-xl border border-gray-100">
                  <div className={`text-4xl mb-2 ${
                    result.terminology?.mappingStatus === 'MAPPED' ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    {result.terminology?.mappingStatus === 'MAPPED' ? 
                      <CheckCircle className="w-10 h-10 mx-auto" /> : 
                      <AlertCircle className="w-10 h-10 mx-auto" />
                    }
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Mapping Status</p>
                  <p className="font-semibold text-gray-800">{result.terminology?.mappingStatus}</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-b from-white to-gray-50 rounded-xl border border-gray-100">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {result.terminology?.totalMappings || 0}
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Total Mappings</p>
                  <p className="font-semibold text-gray-800">Found</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-b from-white to-gray-50 rounded-xl border border-gray-100">
                  <div className="text-4xl mb-2">
                    <Database className="w-10 h-10 mx-auto text-indigo-600" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Source</p>
                  <p className="font-semibold text-gray-800">HAPI FHIR</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-b from-white to-gray-50 rounded-xl border border-gray-100">
                  <div className="text-4xl mb-2">
                    <Clock className="w-10 h-10 mx-auto text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Timestamp</p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced FHIR Resource */}
            {result.fhir && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
                    <Database className="w-6 h-6 text-white" />
                  </div>
                  FHIR Resource
                </h3>
                <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto border border-gray-200">
                  <pre className="text-sm text-green-400 font-mono">
                    {JSON.stringify(result.fhir, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Enhanced Raw Mapping Data */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                Raw Mapping Data
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <th className="border border-gray-200 px-6 py-4 text-left font-semibold text-gray-700">System</th>
                      <th className="border border-gray-200 px-6 py-4 text-left font-semibold text-gray-700">Code</th>
                      <th className="border border-gray-200 px-6 py-4 text-left font-semibold text-gray-700">Display</th>
                      <th className="border border-gray-200 px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rawMapping?.map((mapping, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="border border-gray-200 px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            mapping.system.includes('namaste') 
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-purple-100 text-purple-800 border border-purple-200'
                          }`}>
                            {mapping.system.includes('namaste') ? 'NAMASTE' : 'ICD-11'}
                          </span>
                        </td>
                        <td className="border border-gray-200 px-6 py-4 font-mono text-sm bg-gray-50">
                          {mapping.code}
                        </td>
                        <td className="border border-gray-200 px-6 py-4 text-gray-700">
                          {mapping.display}
                        </td>
                        <td className="border border-gray-200 px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 w-fit ${
                            mapping.mappingStatus === 'MAPPED' 
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          }`}>
                            {mapping.mappingStatus === 'MAPPED' ? 
                              <CheckCircle className="w-3 h-3" /> : 
                              <AlertCircle className="w-3 h-3" />
                            }
                            {mapping.mappingStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Enhanced Technical Details */}
            <details className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 shadow-lg border border-gray-200">
              <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900 flex items-center gap-2 text-lg">
                <ChevronDown className="w-5 h-5 transition-transform duration-200" />
                Technical Details
              </summary>
              <div className="mt-6 bg-gray-900 rounded-xl p-6 border border-gray-300">
                <pre className="text-sm text-green-400 font-mono overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}