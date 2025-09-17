"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login/client");
    }
  }, [status, router]);

  const handleGenerateKey = async () => {
    setLoading(true);
    setNewApiKey(null);

    const response = await fetch('/api/client/generate-key', {
      method: 'POST',
    });

    if (response.ok) {
      const data = await response.json();
      setNewApiKey(data.apiKey);
    } else {
      alert("Failed to generate API key.");
    }
    setLoading(false);
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (status === "authenticated") {
    return (
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
              <Button onClick={handleGenerateKey} disabled={loading} className="mt-4">
                {loading ? 'Generating...' : 'Generate New API Key'}
              </Button>
            </div>

            {newApiKey && (
              <div className="mt-6 p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded-lg">
                <h4 className="font-bold text-yellow-800">New API Key Generated</h4>
                <p className="text-sm text-yellow-700 mt-1">Please copy and save this key now. You will not be able to see it again.</p>
                <div className="mt-3 p-2 font-mono text-sm bg-gray-200 rounded">
                  {newApiKey}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return null;
}