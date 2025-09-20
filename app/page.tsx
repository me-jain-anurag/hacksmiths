import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
const features = [
  {
    title: "FHIR-Compliant",
    description: "Built on the HL7 FHIR standard for maximum interoperability with modern healthcare systems.",
    icon: "⚡",
  },
  {
    title: "Standardized Terminologies", 
    description: "Provides robust mapping for complex terminologies like NAMASTE directly to global standards like ICD-11.",
    icon: "🏥",
  },
  {
    title: "Secure & Simple API",
    description: "A simple, secure REST API that integrates effortlessly into your existing EMR or health-tech application.", 
    icon: "🔒",
  },
];

const renderHeroSection = () => (
  <div className="relative">
    <div className="absolute inset-0 rounded-3xl overflow-hidden">
      <div className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-blue-100 opacity-60"></div>
      {/* Medical/Technology Pattern Overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234F46E5' fill-opacity='0.05'%3E%3Ccircle cx='20' cy='20' r='4'/%3E%3Ccircle cx='40' cy='40' r='4'/%3E%3Ccircle cx='20' cy='40' r='4'/%3E%3Ccircle cx='40' cy='20' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }}></div>
    </div>
    
    <div className="relative text-center max-w-4xl mx-auto py-16">
      <div className="inline-block px-4 py-2 mb-6 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
        🚀 Powering Interoperable Healthcare
      </div>
      
      {/* Medical Icons Floating Animation */}
      <div className="relative mb-8">
        <div className="absolute -top-4 -left-8 text-4xl opacity-20 animate-bounce">🏥</div>
        <div className="absolute -top-2 -right-12 text-3xl opacity-20 animate-pulse">⚕️</div>
        <div className="absolute top-8 left-4 text-2xl opacity-20 animate-bounce" style={{animationDelay: '1s'}}>💻</div>
        
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl md:text-7xl mb-6">
          Setu
          <span className="block text-blue-600 mt-2">Medical Terminology Bridge</span>
        </h1>
      </div>
      
      <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed">
        Seamlessly integrate standardized medical terminologies like NAMASTE into your EMR 
        with our powerful, FHIR-based API. Built for developers, trusted by healthcare.
      </p>
    </div>
  </div>
);

const renderActionButtons = () => (
  <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
    <Button 
      asChild 
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg h-14 shadow-lg hover:shadow-xl transition-all duration-200"
    >
      <Link href="/signup/client">
        Get Started with API Keys
      </Link>
    </Button>
    
    <Button 
      asChild 
      variant="outline" 
      className="font-bold py-4 px-8 rounded-lg text-lg h-14 border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-200"
    >
      <Link href="/login/client">
        Client Sign In
      </Link>
    </Button>
  </div>
);

const renderFeaturesSection = () => (
  <div className="mt-20 max-w-6xl mx-auto">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Why Choose Setu?
      </h2>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        An API-first platform for developers building the future of healthcare.
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
          {/* Card Background Pattern */}
          <div className="absolute top-0 right-0 w-24 h-24 transform translate-x-8 -translate-y-8">
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-full opacity-50"></div>
          </div>
          
          <CardHeader className="pb-4 relative">
            <div className="text-3xl mb-3">{feature.icon}</div>
            <CardTitle className="text-xl font-bold text-gray-900">
              {feature.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-gray-600 leading-relaxed">
              {feature.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const renderTrustSection = () => (
  <div className="mt-20 py-12 bg-gray-100 rounded-2xl max-w-6xl mx-auto">
    <div className="text-center px-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        Our Clients
      </h3>
      <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
        <div className="px-6 py-3 bg-white rounded-lg shadow-sm">
          <span className="text-gray-700 font-semibold">Hospital Systems</span>
        </div>
        <div className="px-6 py-3 bg-white rounded-lg shadow-sm">
          <span className="text-gray-700 font-semibold">EMR Vendors</span>
        </div>
        <div className="px-6 py-3 bg-white rounded-lg shadow-sm">
          <span className="text-gray-700 font-semibold">Health Tech</span>
        </div>
      </div>
    </div>
  </div>
);

const renderAdminSection = () => (
  <div className="mt-24 text-center">
      <p className="text-sm text-gray-500">
          Are you a system administrator?
      </p>
      <Button 
        asChild 
        variant="outline"
        className="text-gray-700 hover:text-blue-600 hover:border-blue-600 mt-2"
      >
        <Link href="/login/admin">
          Admin Login
        </Link>
      </Button>
  </div>
);

return (
  <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
    <div className="w-full max-w-7xl mx-auto">
      {renderHeroSection()}
      {renderActionButtons()}
      {renderFeaturesSection()}
      {renderTrustSection()}
      {renderAdminSection()}
    </div>

    {/* Decorative Background Elements */}
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
      <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
    </div>
  </main>
);
}