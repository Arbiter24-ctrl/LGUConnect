"use client"

import React from "react"
import { Badge } from "./ui/badge"
import { useState, useEffect } from "react"
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
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category_id: "",
    location_address: "",
    user_id: user?.id || 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [aiClassification, setAiClassification] = useState(null)
  const [isClassifying, setIsClassifying] = useState(false)

  // Update user_id when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, user_id: user.id }))
    }
  }, [user])

  // Load categories on component mount
  useEffect(() => {
    fetchCategories()
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

  const classifyComplaint = async () => {
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
        setAiClassification(result.classification)
      }
    } catch (error) {
      console.error("Error classifying complaint:", error)
    } finally {
      setIsClassifying(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      if (result.success) {
        if (result.data.classification) {
          setAiClassification(result.data.classification)
        }
        setIsSubmitted(true)
        setCurrentStep(4)
      }
    } catch (error) {
      console.error("Error submitting complaint:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedToStep2 = formData.title && formData.description && formData.category_id
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

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto border-2 border-primary">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to submit a complaint. Please sign in or create an account to continue.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto border-2 border-primary">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary mb-2">Complaint Submitted Successfully!</h2>
          <p className="text-muted-foreground mb-6">
            Your complaint h received and will be reviewed by barangay officials. You will receive updates on the
            status of your complaint.
          </p>
          <Button onClick={() => window.location.reload()} className="bg-accent hover:bg-accent/90">
            Submit Another Complaint
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2",
                  currentStep >= step
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border",
                )}
              >
                {step}
              </div>
              {step < 3 && <div className={cn("h-1 w-24 mx-4", currentStep > step ? "bg-primary" : "bg-border")} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Complaint Details</span>
          <span>Add Evidence</span>
          <span>Location & Submit</span>
        </div>
      </div>

      {/* Step 1: Complaint Details */}
      {currentStep === 1 && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="text-primary">STEP 1: COMPLAINT DETAILS</CardTitle>
            <CardDescription>
              Describe your complaint clearly. Select the appropriate category to help us route your concern to the
              right department.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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

            <div className="space-y-2">
              <Label htmlFor="category" className="text-primary font-semibold">
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
              <Label htmlFor="description" className="text-primary font-semibold">
                DETAILED DESCRIPTION
              </Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about your complaint. Include when it happened, who w, and any other relevant details."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="min-h-32 border-2 border-primary"
              />
            </div>

            {formData.title && formData.description && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-blue-900">AI Analysis Preview</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={classifyComplaint}
                    disabled={isClassifying}
                    className="border-blue-300 text-blue-700 bg-transparent"
                  >
                    {isClassifying ? "Analyzing..." : "Analyze Complaint"}
                  </Button>
                </div>

                {aiClassification && (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Suggested Category:</span>
                      <Badge variant="secondary">{aiClassification.category}</Badge>
                      <Badge variant="outline">{aiClassification.subcategory}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Priority Level:</span>
                      <Badge
                        variant={
                          aiClassification.priority === "urgent"
                            ? "destructive"
                            : aiClassification.priority === "high"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {aiClassification.priority.toUpperCase()}
                      </Badge>
                      <span className="text-muted-foreground">(Score: {aiClassification.urgency_score}/10)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Suggested Department:</span>
                      <span className="text-blue-700">{aiClassification.suggested_department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Estimated Resolution:</span>
                      <span className="text-blue-700">{aiClassification.estimated_resolution_days} days</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium">Keywords:</span>
                      <div className="flex flex-wrap gap-1">
                        {aiClassification.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={() => setCurrentStep(2)}
              disabled={!canProceedToStep2}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Continue to Evidence
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Add Evidence */}
      {currentStep === 2 && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="text-primary">STEP 2: ADD EVIDENCE</CardTitle>
            <CardDescription>
              Upload photos or videos to support your complaint. Visual evidence helps officials understand and resolve
              issues faster.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                Continue to Location
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Location & Submit */}
      {currentStep === 3 && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="text-primary">STEP 3: LOCATION & SUBMIT</CardTitle>
            <CardDescription>
              Provide the location where the issue occurred. This helps officials respond more effectively.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                  <strong>Description:</strong> {formData.description.substring(0, 100)}...
                </div>
                <div>
                  <strong>Attachments:</strong> {attachments.length} file(s)
                </div>
                <div>
                  <strong>Location:</strong> {formData.location_address}
                </div>

                {aiClassification && (
                  <>
                    <div>
                      <strong>AI Priority:</strong>
                      <Badge
                        variant={
                          aiClassification.priority === "urgent"
                            ? "destructive"
                            : aiClassification.priority === "high"
                              ? "default"
                              : "secondary"
                        }
                        className="ml-2"
                      >
                        {aiClassification.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <strong>Assigned Department:</strong> {aiClassification.suggested_department}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
