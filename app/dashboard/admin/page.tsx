"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

  const fetchClients = async () => {
    setLoadingClients(true);
    const response = await fetch('/api/admin/clients');
    if (response.ok) {
      const data = await response.json();
      setClients(data);
    }
    setLoadingClients(false);
  };

  useEffect(() => {
    if (status === "authenticated") {
      if ((session.user as any).role !== "admin") {
        router.push("/dashboard/client");
      } else {
        // Fetch the client list when the admin is confirmed
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
      setFile(null);
    } catch (error: any) {
      setUploadMessage(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (status === "authenticated" && (session.user as any).role === "admin") {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
          </header>

          <main className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Management</CardTitle>
                <CardDescription>View and manage all registered client accounts.</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingClients ? (
                  <p>Loading clients...</p>
                ) : (
                  <div className="border rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Signed Up</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Has API Key</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {clients.map((client) => (
                          <tr key={client.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(client.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{client.hasApiKey ? '✔️' : '❌'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload NAMASTE CSV</CardTitle>
                <CardDescription>Upload a pre-cleaned CSV file to update the terminology data on the HAPI FHIR server.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  <Input type="file" accept=".csv" onChange={handleFileChange} disabled={isUploading} />
                  <Button type="submit" disabled={isUploading || !file}>
                    {isUploading ? 'Processing...' : 'Upload File'}
                  </Button>
                </form>
                {uploadMessage && (
                  <p className="mt-4 text-sm font-medium text-gray-700">{uploadMessage}</p>
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