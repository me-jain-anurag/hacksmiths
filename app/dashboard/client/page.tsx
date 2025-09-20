"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PasswordConfirmationDialog } from "@/components/PasswordConfirmationDialog";
import { 
  Key, 
  LogOut, 
  RefreshCw, 
  Copy, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  User,
  Shield,
  Eye,
  EyeOff,
  Home
} from "lucide-react";

export default function ClientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [hasApiKey, setHasApiKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  // New state to control the dialog
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login/client");
    }
    if (status === "authenticated") {
      fetchClientData();
    }
  }, [status, router]);
  
  const fetchClientData = async () => {
    const response = await fetch('/api/client/me');
    if (response.ok) {
      const data = await response.json();
      setHasApiKey(data.hasApiKey);
    }
  };

  const handleGenerateKey = async () => {
    if (hasApiKey) {
      const isConfirmed = window.confirm(
        "You already have an API key. Generating a new one will invalidate the old one. Are you sure you want to continue?"
      );
      if (!isConfirmed) return;
    }

    setLoading(true);
    setNewApiKey(null);
    setCopySuccess(false);
    const response = await fetch('/api/client/generate-key', { method: 'POST' });
    setLoading(false);

    if (response.ok) {
      const data = await response.json();
      setNewApiKey(data.apiKey);
      setHasApiKey(true);
      setShowApiKey(true);
    } else {
      alert("Failed to generate API key.");
    }
  };

  const confirmDeleteKey = async (password: string) => {
    setIsConfirmingDelete(false); // Close the dialog
    setLoading(true);

    const response = await fetch('/api/client/delete-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    
    setLoading(false);

    if (response.ok) {
      setNewApiKey(null);
      setHasApiKey(false);
      alert("API Key successfully deleted.");
    } else {
      const errorData = await response.json();
      alert(`Failed to delete API key: ${errorData.message}`);
    }
  };

  const copyApiKey = async () => {
    if (newApiKey) {
      try {
        await navigator.clipboard.writeText(newApiKey);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };
  
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-700">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (status === "authenticated") {
    return (
      <>
        <PasswordConfirmationDialog
          open={isConfirmingDelete}
          onClose={() => setIsConfirmingDelete(false)}
          onConfirm={confirmDeleteKey}
          title="Delete API Key?"
          description="This action is permanent. To confirm, please enter your password."
        />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
          <div className="max-w-4xl mx-auto px-6 space-y-8">
            {/* Header */}
            <header className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
                  <p className="text-gray-600 mt-1">Welcome back, {session.user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link 
                  href="/" 
                  className="inline-flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => signOut()}
                  className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </header>

            {/* Status Card */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow border-l-4 border-l-blue-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${hasApiKey ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Shield className={`h-6 w-6 ${hasApiKey ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">API Access Status</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {hasApiKey ? 'Active' : 'Inactive'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {hasApiKey ? 'You have an active API key' : 'Generate an API key to get started'}
                      </p>
                    </div>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    hasApiKey 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {hasApiKey ? 'Connected' : 'Not Connected'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Key Management */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Key className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-gray-900">API Key Management</CardTitle>
                    <CardDescription className="text-gray-600">
                      Generate and manage your API key to authenticate requests to the Setu API
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* API Key Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                    <Key className="h-4 w-4" />
                    <span>Your API Key</span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Use this key to authenticate requests to the Setu API. Keep it secure and never share it publicly.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleGenerateKey} 
                    disabled={loading}
                    className="flex items-center justify-center space-x-2 h-11 text-base font-semibold"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4" />
                        <span>{hasApiKey ? 'Regenerate API Key' : 'Generate New API Key'}</span>
                      </>
                    )}
                  </Button>
                  
                  {hasApiKey && (
                    <Button 
                      variant="destructive"
                      onClick={() => setIsConfirmingDelete(true)} 
                      disabled={loading}
                      className="flex items-center justify-center space-x-2 h-11 text-base font-semibold"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete API Key</span>
                    </Button>
                  )}
                </div>

                {/* New API Key Display */}
                {newApiKey && (
                  <div className="border-l-4 border-yellow-400 bg-yellow-50 rounded-lg p-6 space-y-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-bold text-yellow-800 text-lg">New API Key Generated</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Please copy and save this key now. You will not be able to see it again for security reasons.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg border-2 border-yellow-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">API Key</label>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="h-8 px-2"
                          >
                            {showApiKey ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyApiKey}
                            className="h-8 px-2"
                          >
                            {copySuccess ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="font-mono text-sm bg-gray-100 rounded p-3 break-all select-all">
                        {showApiKey ? newApiKey : '•'.repeat(newApiKey.length)}
                      </div>
                      {copySuccess && (
                        <p className="text-sm text-green-600 mt-2 flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>API key copied to clipboard!</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Documentation Link */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-blue-100 rounded">
                      <Key className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900">Getting Started</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Once you have your API key, you can start making requests to the Setu API. 
                        Include your key in the Authorization header of your requests.
                      </p>
                      <div className="mt-3 p-2 bg-white rounded border font-mono text-xs text-gray-700">
                        Authorization: Bearer YOUR_API_KEY
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }
  
  return null;
}