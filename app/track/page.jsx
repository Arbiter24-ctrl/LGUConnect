"use client"

import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Search, MapPin, Calendar, User, Mail, Phone, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function TrackPage() {
  const [trackingCode, setTrackingCode] = useState('')
  const [complaint, setComplaint] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async (e) => {
    e.preventDefault()
    if (!trackingCode.trim()) {
      setError('Please enter a tracking code')
      return
    }

    setIsLoading(true)
    setError('')
    setComplaint(null)

    try {
      const response = await fetch(`/api/track?code=${encodeURIComponent(trackingCode.trim())}`)
      const data = await response.json()

      if (data.success) {
        setComplaint(data.data)
      } else {
        setError(data.error || 'Failed to track complaint')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-4 w-4" />
      case 'in_progress':
        return <AlertCircle className="h-4 w-4" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />
      case 'closed':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: 'url(/city.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-4xl">
        {/* Semi-transparent overlay for better readability */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Complaint</h1>
            <p className="text-gray-600">Enter your tracking code to check the status of your complaint</p>
          </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Track Complaint
            </CardTitle>
            <CardDescription>
              Enter the tracking code you received when you submitted your complaint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTrack} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trackingCode">Tracking Code</Label>
                <Input
                  id="trackingCode"
                  placeholder="Enter your tracking code (e.g., TRK-ABC123)"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  className="text-center font-mono"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? 'Tracking...' : 'Track Complaint'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Complaint Details */}
        {complaint && (
          <div className="space-y-6">
            {/* Main Complaint Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{complaint.complaint.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Reference: {complaint.complaint.reference_number}
                    </CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(complaint.complaint.status)} flex items-center gap-1`}>
                    {getStatusIcon(complaint.complaint.status)}
                    {complaint.complaint.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{complaint.complaint.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Badge 
                        style={{ backgroundColor: complaint.complaint.category_color }}
                        className="text-white mr-2"
                      >
                        {complaint.complaint.category_name}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {complaint.complaint.barangay_name}
                    </div>
                    
                    {complaint.complaint.location_address && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {complaint.complaint.location_address}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Submitted: {formatDate(complaint.complaint.created_at)}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Last Updated: {formatDate(complaint.complaint.updated_at)}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                {complaint.complaint.contact_info && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      {complaint.complaint.contact_info.name && (
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          {complaint.complaint.contact_info.name}
                        </div>
                      )}
                      {complaint.complaint.contact_info.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {complaint.complaint.contact_info.email}
                        </div>
                      )}
                      {complaint.complaint.contact_info.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {complaint.complaint.contact_info.phone}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status History */}
            {complaint.status_history && complaint.status_history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Status History</CardTitle>
                  <CardDescription>Track the progress of your complaint</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {complaint.status_history.map((history, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${getStatusColor(history.new_status)}`}>
                          {getStatusIcon(history.new_status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">
                              {history.new_status.replace('_', ' ').toUpperCase()}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {formatDate(history.created_at)}
                            </span>
                          </div>
                          {history.notes && (
                            <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Don&apos;t have a tracking code?{' '}
              <Link href="/" className="text-blue-600 hover:underline">
                Submit a new complaint
              </Link>
            </p>
            <p className="text-sm text-gray-500">
              Need help? Contact your barangay office for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
