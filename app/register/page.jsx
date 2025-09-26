"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Loader2, Eye, EyeOff, Check, Lock, Clock, User, Mail, Phone, MapPin, Upload, Trash2 } from 'lucide-react'

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Personal Info
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    barangay: '',
    address: '',
    photo: null,
    // Account Info
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'resident'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const steps = [
    { id: 1, name: 'Personal Info', icon: User },
    { id: 2, name: 'Account Info', icon: Lock },
    { id: 3, name: 'Verification', icon: Clock }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate personal info
      if (!formData.first_name || !formData.last_name || !formData.barangay) {
        setError('Please fill in all required fields')
        return
      }
    } else if (currentStep === 2) {
      // Validate account info
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all required fields')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }
    }
    setError('')
    setCurrentStep(prev => prev + 1)
  }

  const handleBack = () => {
    setError('')
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          middle_name: formData.middle_name,
          phone: formData.phone,
          role: formData.role,
          barangay: formData.barangay,
          address: formData.address
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Redirect to login page with success message
        router.push('/login?message=Registration successful. Please sign in.')
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }))
    }
  }

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }))
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Background Image */}
      <div 
        className="hidden lg:flex lg:w-2/3 relative"
        style={{
          backgroundImage: "url('/cityhall.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Welcome Text */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 h-full w-full">
          <div className="text-center w-full">
            <h1 className="text-6xl font-bold mb-4">Welcome</h1>
            <h2 className="text-4xl font-semibold mb-8">to</h2>
            <h3 className="text-5xl font-bold">Complaint Management</h3>
            <p className="text-xl mt-8 text-white/90 max-w-md mx-auto">
              Join our community to submit and track complaints efficiently
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Multi-step Registration Form */}
      <div className="w-full lg:w-1/3 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md max-h-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xl">CM</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Complaint Management System</h1>
              <p className="text-sm text-gray-600">City of Tagum</p>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isActive 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`text-xs font-medium ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Form Steps */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">First Name *</Label>
                    <Input
                      id="first_name"
                      placeholder="John"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      required
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middle_name" className="text-sm font-medium text-gray-700">Middle Name</Label>
                    <Input
                      id="middle_name"
                      placeholder="Michael"
                      value={formData.middle_name}
                      onChange={(e) => handleInputChange('middle_name', e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">Last Name *</Label>
                    <Input
                      id="last_name"
                      placeholder="Doe"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      required
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="suffix" className="text-sm font-medium text-gray-700">Suffix (Optional)</Label>
                    <Input
                      id="suffix"
                      placeholder="Jr., Sr., III"
                      value={formData.suffix}
                      onChange={(e) => handleInputChange('suffix', e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Barangay and Position */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="barangay" className="text-sm font-medium text-gray-700">Barangay *</Label>
                    <Select value={formData.barangay} onValueChange={(value) => handleInputChange('barangay', value)}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select Barangay" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Barangay 1">Barangay 1</SelectItem>
                        <SelectItem value="Barangay 2">Barangay 2</SelectItem>
                        <SelectItem value="Barangay 3">Barangay 3</SelectItem>
                        <SelectItem value="Barangay 4">Barangay 4</SelectItem>
                        <SelectItem value="Barangay 5">Barangay 5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        placeholder="123 Main Street, City"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="h-10 pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Photo (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.photo ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5 text-green-500" />
                          <span className="text-sm text-gray-600">
                            {formData.photo.name} ({(formData.photo.size / 1024).toFixed(1)}KB / 2MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removePhoto}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Upload Photo</p>
                        <p className="text-xs text-gray-500">0.0B / 2MB</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="photo-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('photo-upload').click()}
                          className="mt-2"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Account Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className="h-10 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      className="h-10 pl-10 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-10 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                      className="h-10 pl-10 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-10 px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+63 912 345 6789"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="h-10 pl-10"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* Step 3: Verification */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Verification</h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Email Verification Required</p>
                      <p className="text-xs text-blue-700">
                        We'll send a verification link to <strong>{formData.email}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Review Your Information:</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div><strong>Name:</strong> {formData.first_name} {formData.middle_name} {formData.last_name} {formData.suffix}</div>
                    <div><strong>Email:</strong> {formData.email}</div>
                    <div><strong>Barangay:</strong> {formData.barangay}</div>
                    {formData.address && <div><strong>Address:</strong> {formData.address}</div>}
                    {formData.phone && <div><strong>Phone:</strong> {formData.phone}</div>}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex items-center"
                >
                  Back
                </Button>
              ) : (
                <div></div>
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'CREATE ACCOUNT'
                  )}
                </Button>
              )}
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
            <p className="text-xs text-gray-500">
              © 2025 Complaint Management System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
