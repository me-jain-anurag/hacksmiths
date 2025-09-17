"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

  // State for storing the list of clients
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      if ((session.user as any).role !== "admin") {
        router.push("/dashboard/client");
      } else {
        // --- FETCH CLIENTS WHEN ADMIN IS LOGGED IN ---
        const fetchClients = async () => {
          setLoadingClients(true);
          const response = await fetch('/api/admin/clients');
          if (response.ok) {
            const data = await response.json();
            setClients(data);
          }
          setLoadingClients(false);
        };
        fetchClients();
      }
    }
    
    if (status === "unauthenticated") {
      router.push("/login/admin");
    }
  }, [status, session, router]);

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

          <main className="space-y-6">
            {/* --- CLIENT MANAGEMENT CARD --- */}
            <Card>
              <CardHeader>
                <CardTitle>Client Management</CardTitle>
                <CardDescription>View and manage all registered client accounts.</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingClients ? (
                  <p>Loading clients...</p>
                ) : (
                  <div className="border rounded-lg">
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{client.hasApiKey ? 'Yes' : 'No'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* CSV Upload feature will go here */}
          </main>
        </div>
      </div>
    );
  }

  return null;
}