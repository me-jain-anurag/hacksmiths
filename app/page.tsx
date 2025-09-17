import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
          Setu
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
          Seamlessly integrate standardized medical terminologies into your EMR system with our powerful FHIR-based API.
        </p>
      </div>

      <div className="mt-12 flex flex-col sm:flex-row gap-4">
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg">
          <Link href="/signup/client">Get Started</Link>
        </Button>
        <Button asChild variant="outline" className="font-bold py-3 px-6 rounded-lg text-lg">
          <Link href="/login/client">Sign In</Link>
        </Button>
      </div>
    </main>
  );
}