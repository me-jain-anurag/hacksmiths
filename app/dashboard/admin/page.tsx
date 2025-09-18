"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Upload, FileText, Calendar, Mail, User, LogOut, RefreshCw } from "lucide-react";

type Client = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  hasApiKey: boolean;
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State for the client list
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  // State for the file upload
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState(false);

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const response = await fetch('/api/admin/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
    setLoadingClients(false);
  };

  useEffect(() => {
    if (status === "authenticated") {
      if ((session.user as any).role !== "admin") {
        router.push("/dashboard/client");
      } else {
        fetchClients();
      }
    }
    if (status === "unauthenticated") {
      router.push("/login/admin");
    }
  }, [status, session, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setUploadMessage('');
      setUploadError(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file.");
      return;
    }
    setIsUploading(true);
    setUploadMessage('');
    setUploadError(false);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/admin/upload-csv', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "An unknown error occurred.");
      }
      setUploadMessage(result.message || "File uploaded successfully!");
      setUploadError(false);
      setFile(null);
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      setUploadMessage(`Error: ${error.message}`);
      setUploadError(true);
    } finally {
      setIsUploading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-700">Loading...</span>
        </div>
      </div>
    );
  }

  if (status === "authenticated" && (session.user as any).role === "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Header */}
          <header className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, {session.user?.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => signOut()}
              className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clients</p>
                    <p className="text-3xl font-bold text-gray-900">{clients.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active API Keys</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {clients.filter(client => client.hasApiKey).length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Recent Signups</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {clients.filter(client => {
                        const signupDate = new Date(client.createdAt);
                        const oneWeekAgo = new Date();
                        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                        return signupDate > oneWeekAgo;
                      }).length}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <main className="grid gap-8">
            {/* Client Management */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">Client Management</CardTitle>
                      <CardDescription className="text-gray-600">
                        View and manage all registered client accounts
                      </CardDescription>
                    </div>
                  </div>
                  <Button 
                    onClick={fetchClients} 
                    variant="outline" 
                    className="flex items-center space-x-2"
                    disabled={loadingClients}
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingClients ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loadingClients ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                      <span className="text-gray-600">Loading clients...</span>
                    </div>
                  </div>
                ) : clients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Users className="h-12 w-12 mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No clients found</p>
                    <p className="text-sm">Client registrations will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>Name</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4" />
                              <span>Email</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>Signed Up</span>
                            </div>
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4" />
                              <span>API Key</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {clients.map((client, index) => (
                          <tr key={client.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                                  {client.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-gray-900">{client.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{client.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {new Date(client.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge 
                                variant={client.hasApiKey ? "default" : "secondary"}
                                className={client.hasApiKey ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-gray-100 text-gray-600"}
                              >
                                {client.hasApiKey ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upload Section */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-600 rounded-lg">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">Upload NAMASTE CSV</CardTitle>
                    <CardDescription className="text-gray-600">
                      Upload a pre-cleaned CSV file to update the terminology data on the HAPI FHIR server
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleUploadSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700">
                      Select CSV File
                    </label>
                    <Input 
                      id="csv-file"
                      type="file" 
                      accept=".csv" 
                      onChange={handleFileChange} 
                      disabled={isUploading}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                    />
                    {file && (
                      <p className="text-sm text-gray-600 flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Selected: {file.name}</span>
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isUploading || !file}
                    className="w-full h-11 text-base font-semibold flex items-center justify-center space-x-2"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Upload File</span>
                      </>
                    )}
                  </Button>
                </form>
                
                {uploadMessage && (
                  <div className={`mt-6 p-4 rounded-lg border ${
                    uploadError 
                      ? 'bg-red-50 border-red-200 text-red-700' 
                      : 'bg-green-50 border-green-200 text-green-700'
                  }`}>
                    <p className="text-sm font-medium flex items-center space-x-2">
                      {uploadError ? (
                        <span className="text-red-500">❌</span>
                      ) : (
                        <span className="text-green-500">✅</span>
                      )}
                      <span>{uploadMessage}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return null;
}