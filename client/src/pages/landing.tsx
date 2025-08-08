import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Key, Zap, Users, Target, Activity, Code, Globe, CheckCircle, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Key className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KeyPanel</h1>
                <p className="text-sm text-gray-500">License Management</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-4">
            <Badge className="bg-red-100 text-red-800 hover:bg-red-200">PUBG Mod Menu Integration</Badge>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Professional Key Panel System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Complete license key management solution for PUBG mod menus and gaming applications. Create custom keys, manage user limits, and integrate with your mod menu seamlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Access Panel
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to manage licenses
            </h2>
            <p className="text-lg text-gray-600">
              Powerful features to help you manage and distribute your software licenses
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6" />
                </div>
                <CardTitle>PUBG Mod Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Seamlessly integrate with any PUBG mod menu using /connect and /disconnect endpoints
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-6 w-6" />
                </div>
                <CardTitle>Real-time Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track active users, session limits, and key usage statistics with live dashboard
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Code className="h-6 w-6" />
                </div>
                <CardTitle>Developer API</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Simple REST API with HWID verification and automatic session management
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6" />
                </div>
                <CardTitle>Multi-user Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create keys with custom user limits - from single-user to unlimited access
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* API Documentation */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple API Integration
            </h2>
            <p className="text-lg text-gray-600">
              Easy to integrate with your existing applications
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Code className="h-6 w-6 mr-3 text-red-600" />
                Connect API
              </h3>
              <Card className="bg-gray-900 text-green-400">
                <CardContent className="p-6">
                  <pre className="text-sm overflow-x-auto">
{`POST /api/connect
Content-Type: application/json

{
  "key": "your-license-key",
  "hwid": "unique-hardware-id"
}

// Success Response:
{
  "status": "success",
  "message": "Access granted",
  "keyName": "My PUBG Key",
  "keyType": "premium",
  "maxUsers": 5,
  "currentUsers": 1,
  "expiresAt": "2024-12-31"
}`}
                  </pre>
                </CardContent>
              </Card>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Shield className="h-6 w-6 mr-3 text-blue-600" />
                Disconnect API
              </h3>
              <Card className="bg-gray-900 text-green-400">
                <CardContent className="p-6">
                  <pre className="text-sm overflow-x-auto">
{`POST /api/disconnect
Content-Type: application/json

{
  "key": "your-license-key",
  "hwid": "unique-hardware-id"
}

// Success Response:
{
  "status": "success",
  "message": "Disconnected successfully"
}`}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Error Responses
            </h3>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">Invalid Key (401)</h4>
                    <code className="text-red-600">{"{ \"status\": \"error\", \"message\": \"Invalid license key\" }"}</code>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">Max Users (429)</h4>
                    <code className="text-red-600">{"{ \"status\": \"error\", \"message\": \"Maximum users limit reached (5)\" }"}</code>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">Expired Key (401)</h4>
                    <code className="text-red-600">{"{ \"status\": \"error\", \"message\": \"License key has expired\" }"}</code>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">Suspended (401)</h4>
                    <code className="text-red-600">{"{ \"status\": \"error\", \"message\": \"License key is suspended\" }"}</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Key className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">KeyPanel</span>
          </div>
          <p className="text-gray-400">
            Professional license key management system
          </p>
        </div>
      </footer>
    </div>
  );
}
