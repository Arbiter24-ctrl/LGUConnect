"use client"

import { ComplaintSubmissionForm } from "../../components/complaint-submission-form"
import { Navigation } from "../../components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Shield, Users, FileText, Clock, ArrowRight, CheckCircle, Star, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      <Navigation />
      
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              Trusted by 2,847+ Community Members
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Barangay Complaint
              <span className="block text-primary">Management System</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Submit and track your community concerns efficiently with our modern, user-friendly platform
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="#submit-complaint">
                  Submit Complaint
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link href="/login">
                  Track Status
                </Link>
              </Button>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
                  <FileText className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">1,234</div>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +12% from last month
                  </div>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">856</div>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +8% from last month
                  </div>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">2,847</div>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +15% from last month
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the most efficient and user-friendly complaint management system designed for modern communities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Easy Submission</CardTitle>
                <CardDescription className="text-base">
                  Submit complaints quickly with our streamlined, intuitive form process that guides you through each step
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Real-time Tracking</CardTitle>
                <CardDescription className="text-base">
                  Track your complaint status and get instant updates with our advanced notification system
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Community Focused</CardTitle>
                <CardDescription className="text-base">
                  Built for the community, by the community with features that truly serve local needs
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Complaint Form Section */}
      <section id="submit-complaint" className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Submit Your Complaint
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Help us serve you better by reporting issues in your community. Your voice matters.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <ComplaintSubmissionForm />
          </div>
        </div>
      </section>
      </main>

      {/* Small Footer */}
      <footer className="bg-green-800 border-t border-green-700 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-green-200">
            <Shield className="h-4 w-4 text-green-400" />
            <span>© 2024 Tagum City Government - Barangay Complaint System</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
