import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
const features = [
  {
    title: "FHIR-Compliant",
    description: "Built on the HL7 FHIR standard for maximum interoperability with modern healthcare systems.",
  },
  {
    title: "Standardized Terminologies", 
    description: "Provides robust mapping for complex terminologies like NAMASTE directly to global standards like ICD-11.",
  },
  {
    title: "Secure & Simple API",
    description: "A simple, secure REST API that integrates effortlessly into your existing EMR or health-tech application.", 
  },
];

const renderHeroSection = () => (
  <div className="text-center max-w-4xl mx-auto py-12">
    <div className="mb-6">
      <span className="inline-block px-4 py-2 bg-blue-50 text-blue-800 text-sm font-medium border border-blue-200 rounded">
        Government of India Healthcare Initiative
      </span>
    </div>
    
    <h1 className="text-4xl font-bold text-gray-900 mb-6">
      Setu Medical Terminology Bridge
    </h1>
    
    <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
      Seamlessly integrate standardized medical terminologies like NAMASTE into your EMR 
      with our FHIR-based API. Built for healthcare developers, approved by Ministry of AYUSH.
    </p>
  </div>
);

const renderActionButtons = () => (
  <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
    <Button 
      asChild 
      className="h-12 px-8 text-base font-medium"
    >
      <Link href="/signup/client">
        Get API Access
      </Link>
    </Button>
    
    <Button 
      asChild 
      variant="outline" 
      className="h-12 px-8 text-base font-medium"
    >
      <Link href="/login/client">
        Client Login
      </Link>
    </Button>
  </div>
);

const renderFeaturesSection = () => (
  <div className="mt-16 max-w-6xl mx-auto">
    <div className="text-center mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Platform Features
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        A comprehensive API platform for healthcare interoperability.
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              {feature.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 leading-relaxed">
              {feature.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const renderComplianceSection = () => (
  <div className="mt-16 py-8 bg-gray-50 max-w-6xl mx-auto rounded border">
    <div className="text-center px-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Compliance & Standards
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded border">
          <span className="text-gray-700 font-medium">FHIR R4 Compliant</span>
        </div>
        <div className="p-4 bg-white rounded border">
          <span className="text-gray-700 font-medium">ISO 22600 Security</span>
        </div>
        <div className="p-4 bg-white rounded border">
          <span className="text-gray-700 font-medium">ABHA Integration</span>
        </div>
      </div>
    </div>
  </div>
);

const renderAdminSection = () => (
  <div className="mt-16 text-center border-t pt-8">
      <p className="text-sm text-gray-500 mb-3">
          System Administration
      </p>
      <Button 
        asChild 
        variant="outline"
        size="sm"
      >
        <Link href="/login/admin">
          Admin Portal
        </Link>
      </Button>
  </div>
);

return (
  <main className="min-h-screen bg-white">
    <div className="max-w-7xl mx-auto px-6 py-8">
      {renderHeroSection()}
      {renderActionButtons()}
      {renderFeaturesSection()}
      {renderComplianceSection()}
      {renderAdminSection()}
    </div>
  </main>
);
}