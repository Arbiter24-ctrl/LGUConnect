"use client"

import Link from 'next/link'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Shield, Users, FileText, Clock, ArrowRight, CheckCircle } from "lucide-react"
import { ComplaintSubmissionForm } from "../components/complaint-submission-form"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">Tagum City</h1>
                <p className="text-sm text-muted-foreground">Complaint Management System</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Welcome to <span className="text-primary">Tagum City</span>
            </h1>
            <h2 className="text-3xl font-semibold text-gray-700 mb-6">
              Digital Complaint Management System
            </h2>
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto">
            Empowering Tagum City residents and officials with a modern, transparent, and efficient 
            platform to submit, track, and resolve community concerns. Building a better Tagum City 
            through digital governance and citizen engagement.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-6">
                Submit a Complaint
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Access Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-3xl font-bold">2,847</CardTitle>
              <CardDescription className="text-lg">Complaints Received</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-3xl font-bold">2,156</CardTitle>
              <CardDescription className="text-lg">Successfully Resolved</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-3xl font-bold">23</CardTitle>
              <CardDescription className="text-lg">Barangays Served</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Serving Tagum City Residents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Digital Governance</CardTitle>
                <CardDescription>
                  Modern, paperless complaint submission system designed specifically 
                  for Tagum City's 23 barangays and urban communities.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Transparent Process</CardTitle>
                <CardDescription>
                  Track your complaint from submission to resolution with real-time 
                  updates and status notifications.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Citizen Engagement</CardTitle>
                <CardDescription>
                  Empowering Tagum City residents to actively participate in 
                  local governance and community development.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Complaint Submission Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Report Community Concerns</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Help us build a better Tagum City by reporting infrastructure issues, public safety concerns, 
              environmental problems, or any other community matters that need attention.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <ComplaintSubmissionForm />
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary text-white rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Building a Better Tagum City Together</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of Tagum City residents who are actively participating in local governance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Register as Resident
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white hover:text-primary">
                Access Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white py-12 mt-16 w-full">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Tagum City Government</h3>
              <p className="text-gray-300 mb-4">
                Committed to serving all 23 barangays with transparency, 
                accountability, and citizen engagement.
              </p>
              <p className="text-sm text-gray-400">
                City Hall, Tagum City, Davao del Norte
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/login" className="hover:text-white">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white">Register</Link></li>
                <li><Link href="/landingpage" className="hover:text-white">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Information</h3>
              <div className="text-gray-300 space-y-2">
                <p>📞 (084) 217-1234</p>
                <p>📧 info@tagumcity.gov.ph</p>
                <p>🌐 www.tagumcity.gov.ph</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Tagum City Government. All rights reserved.</p>
            <p className="mt-2">Digital Governance Initiative - Building Smart Cities</p>
          </div>
        </div>
      </footer>
    </div>
  )
}