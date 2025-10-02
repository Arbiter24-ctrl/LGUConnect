"use client"

import React from "react"
import { Badge } from "./ui/badge"
import { useState, useEffect, useCallback } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { MapPin, Upload, Camera, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "../lib/utils"
import { useUser } from "../lib/user-context"
import { Alert, AlertDescription } from "./ui/alert"
import Link from "next/link"

export function ComplaintSubmissionForm() {
  const { user, loading } = useUser()
  const [currentStep, setCurrentStep] = useState(1)
  const [categories, setCategories] = useState([])
  const [barangays, setBarangays] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    location_address: "",
    barangay_id: "",
    user_id: user?.id || 0,
    // Anonymous contact fields
    anonymous_name: "",
    anonymous_email: "",
    anonymous_phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [attachments, setAttachments] = useState([])
  const [classification, setClassification] = useState(null)
  const [isClassifying, setIsClassifying] = useState(false)
  const [classificationSource, setClassificationSource] = useState(null)
  const [submissionData, setSubmissionData] = useState(null)
  const SHOW_INLINE_ANALYSIS = false

  // Update user_id when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, user_id: user.id }))
    }
  }, [user])

  // Load categories and barangays on component mount
  useEffect(() => {
    fetchCategories()
    fetchBarangays()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      const result = await response.json()
      if (result.success) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchBarangays = async () => {
    try {
      const response = await fetch("/api/barangays")
      const result = await response.json()
      if (result.success) {
        setBarangays(result.data)
      }
    } catch (error) {
      console.error("Error fetching barangays:", error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files || [])
    setAttachments((prev) => [...prev, ...files])
  }

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location_lat: position.coords.latitude,
            location_lng: position.coords.longitude,
          }))
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  const classifyComplaint = useCallback(async () => {
    if (!formData.title || !formData.description) return

    setIsClassifying(true)
    try {
      const response = await fetch("/api/complaints/classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          location: formData.location_address,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setClassification(result.data)
        setClassificationSource(result.data.source)
      }
    } catch (error) {
      console.error("Error classifying complaint:", error)
    } finally {
      setIsClassifying(false)
    }
  }, [formData.title, formData.description, formData.location_address])

  // Inline auto-analysis disabled to avoid stretching the form; analysis runs on submit in backend
  useEffect(() => {
    if (!SHOW_INLINE_ANALYSIS) return
    const timer = setTimeout(async () => {
      if (formData.title && formData.description && formData.title.length > 5 && formData.description.length > 10) {
        await classifyComplaint()
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [formData.title, formData.description, SHOW_INLINE_ANALYSIS, classifyComplaint])

  const handleSubmit = async () => {
    setSubmitError("")
    setIsSubmitting(true)
    try {
      const payload = {
        ...formData,
        // Ensure numeric IDs are sent
        category_id: formData.category_id ? Number(formData.category_id) : undefined,
        barangay_id: formData.barangay_id ? Number(formData.barangay_id) : undefined,
        user_id: formData.user_id ? Number(formData.user_id) : 0,
      }

      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json().catch(() => null)
      if (response.ok && result?.success) {
        // Upload attachments for this complaint
        if (attachments.length > 0) {
          try {
            const form = new FormData()
            attachments.forEach((f) => form.append('files', f))
            await fetch(`/api/complaints/${result.data.id}/attachments`, {
              method: 'POST',
              body: form
            })
          } catch (e) {
            console.error('Attachment upload failed:', e)
          }
        }
        setSubmissionData(result.data)
        setIsSubmitted(true)
        setCurrentStep(5)
      } else {
        setSubmitError(result?.error || `Submission failed (${response.status})`)
      }
    } catch (error) {
      console.error("Error submitting complaint:", error)
      setSubmitError("Network error while submitting. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedToStep2 = formData.title && formData.description && formData.category_id && formData.barangay_id
  const canProceedToStep3 = formData.location_address

  // Show loading state while checking authentication
  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    )
  }

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2",
                    "bg-primary text-primary-foreground border-primary"
                  )}
                >
                  {step}
                </div>
                {step < 4 && <div className={cn("h-1 w-12 sm:w-20 mx-2 sm:mx-3", "bg-primary")} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
            <span className="hidden sm:inline">Complaint Details</span>
            <span className="sm:hidden">Details</span>
            <span className="hidden sm:inline">Contact Info (Optional)</span>
            <span className="sm:hidden">Contact</span>
            <span className="hidden sm:inline">Add Evidence</span>
            <span className="sm:hidden">Evidence</span>
            <span className="hidden sm:inline">Location & Submit</span>
            <span className="sm:hidden">Submit</span>
          </div>
        </div>

        {/* Form Container with Consistent Height */}
        <div className="min-h-[500px] sm:min-h-[600px]">
          <Card className="border-2 border-primary h-full flex flex-col">
            <CardContent className="p-8 text-center flex-1 flex flex-col justify-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-primary mb-2">Complaint Submitted Successfully!</h2>
              <p className="text-muted-foreground mb-6">
                Your complaint has been received and will be reviewed by barangay officials.
              </p>
              
              {/* Tracking Information */}
              {submissionData && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-gray-900 mb-3">Your Complaint Details:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reference Number:</span>
                      <span className="font-mono font-medium">{submissionData.reference_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tracking Code:</span>
                      <span className="font-mono font-medium text-blue-600">{submissionData.tracking_code}</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                    <p className="text-sm text-blue-800">
                      <strong>Save your tracking code:</strong> Use <span className="font-mono">{submissionData.tracking_code}</span> to track your complaint status at any time.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-center mt-auto">
                {submissionData && (
                  <Link href={`/track?code=${submissionData.tracking_code}`}>
                    <Button className="bg-accent hover:bg-accent/90">
                      Track This Complaint
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Progress Steps */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2",
                  currentStep >= step
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border",
                )}
              >
                {step}
              </div>
              {step < 4 && <div className={cn("h-1 w-12 sm:w-20 mx-2 sm:mx-3", currentStep > step ? "bg-primary" : "bg-border")} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
          <span className="hidden sm:inline">Complaint Details</span>
          <span className="sm:hidden">Details</span>
          <span className="hidden sm:inline">Contact Info (Optional)</span>
          <span className="sm:hidden">Contact</span>
          <span className="hidden sm:inline">Add Evidence</span>
          <span className="sm:hidden">Evidence</span>
          <span className="hidden sm:inline">Location & Submit</span>
          <span className="sm:hidden">Submit</span>
        </div>
      </div>

      {/* Form Container with Consistent Height */}
      <div className="min-h-[500px] sm:min-h-[600px]">

        {/* Step 1: Complaint Details */}
        {currentStep === 1 && (
          <Card className="border-2 border-primary h-full flex flex-col">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-primary text-sm sm:text-base">STEP 1: COMPLAINT DETAILS</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Describe your complaint clearly. Select the appropriate category to help us route your concern to the
                right department.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 flex-1 flex flex-col pt-0">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-primary font-semibold">
                COMPLAINT TITLE
              </Label>
              <Input
                id="title"
                placeholder="Brief summary of your complaint"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="border-2 border-primary"
              />
            </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-primary font-semibold text-xs sm:text-sm">
                    CATEGORY
                  </Label>
                  <Select value={formData.category_id} onValueChange={(value) => handleInputChange("category_id", value)}>
                    <SelectTrigger className="border-2 border-primary">
                      <SelectValue placeholder="Select complaint category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barangay" className="text-primary font-semibold text-xs sm:text-sm">
                    BARANGAY
                  </Label>
                  <Select value={formData.barangay_id} onValueChange={(value) => handleInputChange("barangay_id", value)}>
                    <SelectTrigger className="border-2 border-primary">
                      <SelectValue placeholder="Select your barangay" />
                    </SelectTrigger>
                    <SelectContent>
                      {barangays.map((barangay) => (
                        <SelectItem key={barangay.id} value={barangay.id.toString()}>
                          {barangay.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-primary font-semibold">
                DETAILED DESCRIPTION
              </Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about your complaint. Include when it happened, who was involved, and any other relevant details."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="min-h-32 border-2 border-primary"
              />
            </div>


            {SHOW_INLINE_ANALYSIS && formData.title && formData.description && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-green-900 text-sm">
                      {classificationSource === 'ml' ? 'ML Analysis' : 
                       classificationSource === 'ai' ? 'AI Analysis' : 
                       classificationSource === 'hybrid' ? 'Hybrid Analysis' : 'Smart Analysis'}
                    </h4>
                    {isClassifying && (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700"></div>
                    )}
                  </div>
                </div>

                {classification && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-green-800">Category:</span>
                      <Badge variant="secondary" className="text-xs px-1 py-0">{classification.category}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-green-800">Priority:</span>
                      <Badge
                        variant={
                          classification.priority === "urgent"
                            ? "destructive"
                            : classification.priority === "high"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs px-1 py-0"
                      >
                        {classification.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-green-800">Department:</span>
                      <span className="text-green-700 text-xs truncate">{classification.suggested_department}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-green-800">Confidence:</span>
                      <span className="text-green-700 text-xs">{Math.round(classification.confidence * 100)}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}

              {!SHOW_INLINE_ANALYSIS && (
                <div className="text-xs text-muted-foreground">
                  Smart analysis will run automatically after you submit.
                </div>
              )}

              <div className="mt-auto pt-6">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!canProceedToStep2}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Continue to Evidence
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Contact Information (Optional) */}
        {currentStep === 2 && (
          <Card className="border-2 border-primary h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-primary">STEP 2: CONTACT INFORMATION (OPTIONAL)</CardTitle>
              <CardDescription>
                Provide your contact details to receive updates about your complaint. You can skip this step to remain anonymous.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-1 flex flex-col">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                <strong>🔒 Privacy Notice:</strong> Your contact information is optional and will only be used to provide updates about your complaint. You can skip this step to submit anonymously.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="anonymous_name" className="text-primary font-semibold">
                  YOUR NAME (OPTIONAL)
                </Label>
                <Input
                  id="anonymous_name"
                  placeholder="Enter your full name"
                  value={formData.anonymous_name}
                  onChange={(e) => handleInputChange("anonymous_name", e.target.value)}
                  className="border-2 border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="anonymous_email" className="text-primary font-semibold">
                  EMAIL ADDRESS (OPTIONAL)
                </Label>
                <Input
                  id="anonymous_email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.anonymous_email}
                  onChange={(e) => handleInputChange("anonymous_email", e.target.value)}
                  className="border-2 border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="anonymous_phone" className="text-primary font-semibold">
                  PHONE NUMBER (OPTIONAL)
                </Label>
                <Input
                  id="anonymous_phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.anonymous_phone}
                  onChange={(e) => handleInputChange("anonymous_phone", e.target.value)}
                  className="border-2 border-primary"
                />
              </div>
            </div>

              <div className="mt-auto pt-6">
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 border-primary text-primary"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Add Evidence */}
        {currentStep === 3 && (
          <Card className="border-2 border-primary h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-primary">STEP 3: ADD EVIDENCE</CardTitle>
              <CardDescription>
                Upload photos or videos to support your complaint. Visual evidence helps officials understand and resolve
                issues faster.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-1 flex flex-col">
            <div className="space-y-4">
              <Label className="text-primary font-semibold">UPLOAD FILES</Label>

              <div className="border-2 border-dashed border-primary rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-primary font-semibold mb-2">Drag & Drop files here</p>
                <p className="text-muted-foreground mb-4">or click to browse</p>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button asChild variant="outline" className="border-primary text-primary bg-transparent">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Camera className="w-4 h-4 mr-2" />
                    Choose Files
                  </label>
                </Button>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-primary font-semibold">UPLOADED FILES</Label>
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-border rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

              <div className="mt-auto pt-6">
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 border-primary text-primary"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(4)}
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Continue to Location
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Location & Submit */}
        {currentStep === 4 && (
          <Card className="border-2 border-primary h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-primary">STEP 4: LOCATION & SUBMIT</CardTitle>
              <CardDescription>
                Provide the location where the issue occurred. This helps officials respond more effectively.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 flex-1 flex flex-col">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-primary font-semibold">
                LOCATION ADDRESS
              </Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  placeholder="Enter the address or location of the complaint"
                  value={formData.location_address}
                  onChange={(e) => handleInputChange("location_address", e.target.value)}
                  className="border-2 border-primary"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                  className="border-primary text-primary bg-transparent"
                >
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>
              {formData.location_lat && formData.location_lng && (
                <p className="text-sm text-muted-foreground">
                  GPS coordinates captured: {formData.location_lat.toFixed(6)}, {formData.location_lng.toFixed(6)}
                </p>
              )}
            </div>

            {/* Summary */}
            <div className="bg-secondary p-4 rounded-lg border-2 border-primary">
              <h3 className="font-semibold text-primary mb-3">COMPLAINT SUMMARY</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Title:</strong> {formData.title}
                </div>
                <div>
                  <strong>Category:</strong> {categories.find((c) => c.id.toString() === formData.category_id)?.name}
                </div>
                <div>
                  <strong>Barangay:</strong> {barangays.find((b) => b.id.toString() === formData.barangay_id)?.name}
                </div>
                <div>
                  <strong>Description:</strong> {formData.description.substring(0, 100)}...
                </div>
                <div>
                  <strong>Attachments:</strong> {attachments.length} file(s)
                </div>
                <div>
                  <strong>Location:</strong> {formData.location_address}
                </div>
                {!user && (formData.anonymous_name || formData.anonymous_email || formData.anonymous_phone) && (
                  <div>
                    <strong>Contact:</strong> {formData.anonymous_name || 'Anonymous'} 
                    {formData.anonymous_email && ` (${formData.anonymous_email})`}
                    {formData.anonymous_phone && ` - ${formData.anonymous_phone}`}
                  </div>
                )}

                {classification && (
                  <>
                    <div>
                      <strong>Smart Priority:</strong>
                      <Badge
                        variant={
                          classification.priority === "urgent"
                            ? "destructive"
                            : classification.priority === "high"
                              ? "default"
                              : "secondary"
                        }
                        className="ml-2"
                      >
                        {classification.priority.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({Math.round(classification.confidence * 100)}% confidence)
                      </span>
                    </div>
                    <div>
                      <strong>Assigned Department:</strong> {classification.suggested_department}
                    </div>
                    <div>
                      <strong>Analysis Method:</strong> 
                      <Badge variant="outline" className="ml-2 text-xs">
                        {classification.source === 'ml' ? 'Machine Learning' : 
                         classification.source === 'ai' ? 'Generative AI' : 
                         classification.source === 'hybrid' ? 'ML + AI' : 'Default'}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>

              <div className="mt-auto pt-6">
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 border-primary text-primary"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!canProceedToStep3 || isSubmitting}
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Complaint"}
                  </Button>
                </div>
                {submitError && (
                  <div className="w-full mt-3">
                    <Alert variant="destructive">
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
