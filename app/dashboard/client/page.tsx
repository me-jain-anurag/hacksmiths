"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login/client");
    }
  }, [status]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (status === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Client Dashboard</CardTitle>
            <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
          </CardHeader>
          <CardContent>
            <p>Welcome, {session.user?.email}!</p>
            <p className="mt-4">This is your protected dashboard. Here you will be able to manage your API keys.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return null;
}