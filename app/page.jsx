"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Shield, Users, FileText, Clock, ArrowRight, CheckCircle } from "lucide-react"
import { ComplaintSubmissionForm } from "../components/complaint-submission-form"

export default function HomePage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center relative pb-16"
      style={{
      
        backgroundImage: "url('/city.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-green-900/40"></div>
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b sticky top-0 w-full z-50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src="/Lguconnect.png"
                  alt="LGU Connect Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">LGUConnect <span className="text-xs text-muted-foreground">Complaint Management System</span></h1>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link href="/track">
                <Button variant="outline" size="sm">Track Complaint</Button>
              </Link>
              <Link href="/login">
                <Button size="sm">Barangay Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Main Content - Balanced Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Features (50% width) */}
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                Welcome to <span className="text-green-300">Tagum City</span>
              </h1>
              <h2 className="text-2xl lg:text-3xl font-semibold text-white mb-6 drop-shadow-lg">
                Community Complaint System
              </h2>
              <p className="text-lg text-white/90 mb-8 drop-shadow-md">
                Submit complaints anonymously and track their progress. No registration required - just your tracking code to follow up.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <Shield className="h-8 w-8 text-primary flex-shrink-0" />
                    <div>
                      <CardTitle className="text-lg">Digital Governance</CardTitle>
                      <CardDescription className="text-sm">
                        Modern, paperless complaint system for Tagum City&apos;s 23 barangays.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <Clock className="h-8 w-8 text-primary flex-shrink-0" />
                    <div>
                      <CardTitle className="text-lg">Transparent Process</CardTitle>
                      <CardDescription className="text-sm">
                        Track complaints from submission to resolution with real-time updates.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <Users className="h-8 w-8 text-primary flex-shrink-0" />
                    <div>
                      <CardTitle className="text-lg">Citizen Engagement</CardTitle>
                      <CardDescription className="text-sm">
                        Empowering residents to participate in local governance and development.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="text-center bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
                  <CardTitle className="text-xl font-bold">2,847</CardTitle>
                  <CardDescription className="text-sm">Complaints</CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                  <CardTitle className="text-xl font-bold">2,156</CardTitle>
                  <CardDescription className="text-sm">Resolved</CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <Users className="h-6 w-6 text-primary mx-auto mb-2" />
                  <CardTitle className="text-xl font-bold">23</CardTitle>
                  <CardDescription className="text-sm">Barangays</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* Right Column - Complaint Form (50% width) */}
          <div>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-3 text-gray-800">Report Community Concerns</h2>
                <p className="text-gray-600">
                  Help us build a better Tagum City by reporting issues that need attention.
                </p>
              </div>
              
            
              <ComplaintSubmissionForm />
            </div>
          </div>
        </div>
      </div>

      {/* Small Footer */}
      <footer className="bg-green-800 border-t border-green-700 py-4 fixed bottom-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-green-200">
            <span>© 2024 Tagum City Government - Barangay Complaint System</span>
          </div>
        </div>
      </footer>
    </div>
  )
}