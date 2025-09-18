// In app/dashboard/client/page.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordConfirmationDialog } from "@/components/PasswordConfirmationDialog";

export default function ClientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [hasApiKey, setHasApiKey] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
    const response = await fetch('/api/client/generate-key', { method: 'POST' });
    setLoading(false);

    if (response.ok) {
      const data = await response.json();
      setNewApiKey(data.apiKey);
      setHasApiKey(true);
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
  
  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Client Dashboard</CardTitle>
              <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
            </CardHeader>
            <CardContent>
              <p className="pb-4">Welcome, {session.user?.email}!</p>
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold">Your API Key</h3>
                <p className="text-sm text-gray-600 mt-2">Use this key to authenticate requests to the Setu API.</p>
                <div className="flex gap-4 mt-4">
                  <Button onClick={handleGenerateKey} disabled={loading}>
                    {loading ? 'Processing...' : 'Generate New API Key'}
                  </Button>
                  {hasApiKey && (
                    <Button variant="outline" onClick={() => setIsConfirmingDelete(true)} disabled={loading}>
                      Delete API Key
                    </Button>
                  )}
                </div>
              </div>
              {newApiKey && (
                <div className="mt-6 p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded-lg">
                  <h4 className="font-bold text-yellow-800">New API Key Generated</h4>
                  <p className="text-sm text-yellow-700 mt-1">Please copy and save this key now. You will not be able to see it again.</p>
                  <div className="mt-3 p-2 font-mono text-sm bg-gray-200 rounded break-all">
                    {newApiKey}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </>
    );
  }
  
  return null;
}