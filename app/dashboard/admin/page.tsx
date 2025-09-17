"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      if ((session.user as any).role !== "admin") {
        router.push("/dashboard/client");
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
        <div className="max-w-4xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
          </header>

          <main className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome, Admin!</CardTitle>
              </CardHeader>
              <CardContent>
                <p>From this dashboard, you can manage client registrations and upload new terminology data.</p>
              </CardContent>
            </Card>

            {/* Client Management and CSV Upload features will go here */}

          </main>
        </div>
      </div>
    );
  }

  return null;
}