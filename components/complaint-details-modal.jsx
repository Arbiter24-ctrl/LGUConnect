"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Textarea } from "./ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Separator } from "./ui/separator"
import { ScrollArea } from "./ui/scroll-area"
import { 
  Eye, 
  MessageSquare, 
  Clock, 
  MapPin, 
  User, 
  Calendar, 
  FileText, 
  Image as ImageIcon,
  Send,
  Brain,
  Zap,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  Mail,
  Phone
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ComplaintDetailsModal({ 
  complaintId, 
  isOpen, 
  onClose 
}) {
  const [complaint, setComplaint] = useState(null)
  const [comments, setComments] = useState([])
  // New comment input removed per UX update
  const [loading, setLoading] = useState(false)
  // Comment submit state removed per UX update
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800)
  const { toast } = useToast()

  const fetchComplaintDetails = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/complaints/${complaintId}`)
      const result = await response.json()
      
      if (result.success) {
        setComplaint(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch complaint details",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error fetching complaint:", error)
      toast({
        title: "Error",
        description: "Failed to fetch complaint details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [complaintId, toast])

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}/comments`)
      const result = await response.json()
      
      if (result.success) {
        setComments(result.data)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }, [complaintId])

  useEffect(() => {
    if (isOpen && complaintId) {
      fetchComplaintDetails()
      fetchComments()
    }
  }, [isOpen, complaintId, fetchComments, fetchComplaintDetails])

  // Handle window resize to ensure proper scrolling
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight)
    }

    if (isOpen) {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [isOpen])

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setSubmittingComment(true)
    try {
      const response = await fetch(`/api/complaints/${complaintId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: newComment.trim()
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setNewComment("")
        fetchComments() // Refresh comments
        toast({
          title: "Success",
          description: "Comment added successfully"
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add comment",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      })
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: newStatus
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Update local complaint state
        setComplaint(prev => ({ ...prev, status: newStatus }))
        toast({
          title: "Success",
          description: `Complaint marked as ${newStatus.replace("_", " ")}`
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      })
    } finally {
      setUpdatingStatus(false)
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

  const openMap = (lat, lng) => {
    // Try to detect user's preferred map service or default to Google Maps
    const userAgent = navigator.userAgent.toLowerCase()
    
    // Check if user is on mobile
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    
    let mapUrl
    if (isMobile) {
      // For mobile, try to open in the device's default map app
      if (/iphone|ipad|ipod/i.test(userAgent)) {
        // iOS - try Apple Maps first, fallback to Google Maps
        mapUrl = `maps://maps.google.com/maps?daddr=${lat},${lng}`
      } else if (/android/i.test(userAgent)) {
        // Android - try Google Maps app, fallback to web
        mapUrl = `geo:${lat},${lng}?q=${lat},${lng}`
      } else {
        // Other mobile - use Google Maps web
        mapUrl = `https://www.google.com/maps?q=${lat},${lng}`
      }
    } else {
      // Desktop - use Google Maps web
      mapUrl = `https://www.google.com/maps?q=${lat},${lng}`
    }
    
    // Open the map URL
    const mapWindow = window.open(mapUrl, '_blank')
    
    // If the map app doesn't open (e.g., on desktop), fallback to Google Maps web
    if (!mapWindow || mapWindow.closed || typeof mapWindow.closed === 'undefined') {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'submitted': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading complaint details...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!complaint) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Complaint not found</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[95vw] w-[95vw] sm:max-w-[95vw] p-0 flex flex-col"
        style={{ 
          height: `${Math.min(windowHeight * 0.95, windowHeight - 40)}px`,
          maxHeight: `${Math.min(windowHeight * 0.95, windowHeight - 40)}px`,
          minHeight: '400px'
        }}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-primary mb-3">
                  {complaint.title}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={`${getStatusColor(complaint.status)} text-xs sm:text-sm px-2 sm:px-3 py-1`}>
                    {complaint.status.replace("_", " ").toUpperCase()}
                  </Badge>
                  <Badge className={`${getPriorityColor(complaint.priority)} text-xs sm:text-sm px-2 sm:px-3 py-1`}>
                    {complaint.priority.toUpperCase()}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="text-xs sm:text-sm px-2 sm:px-3 py-1"
                    style={{ borderColor: complaint.category_color, color: complaint.category_color }}
                  >
                    {complaint.category_name}
                  </Badge>
                  {complaint.classification_source && (
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      {complaint.classification_source === 'ml' ? (
                        <><Brain className="h-3 w-3 mr-1" />ML Analysis</>
                      ) : complaint.classification_source === 'ai' ? (
                        <><Zap className="h-3 w-3 mr-1" />AI Analysis</>
                      ) : complaint.classification_source === 'hybrid' ? (
                        <><BarChart3 className="h-3 w-3 mr-1" />Hybrid Analysis</>
                      ) : (
                        complaint.classification_source
                      )}
                    </Badge>
                  )}
                  {complaint.classification_confidence && (
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      {Math.round(complaint.classification_confidence * 100)}% confidence
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 h-full min-h-0">
              {/* Left Column - Main Details */}
              <div className="lg:col-span-2 p-4 sm:p-6 overflow-y-auto h-full min-h-0">
                <div className="space-y-6">
                  {/* Description */}
                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{complaint.description}</p>
                    </CardContent>
                  </Card>

                  {/* Evidence / Attachments */}
                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        Evidence
                        {complaint.attachments && complaint.attachments.length > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {complaint.attachments.length} file{complaint.attachments.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {complaint.attachments && complaint.attachments.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          {complaint.attachments.map((attachment) => (
                            <div key={attachment.id} className="group border-2 border-dashed border-primary/20 rounded-lg overflow-hidden hover:border-primary/40 transition-colors">
                              {attachment.file_type === 'image' ? (
                                <div className="relative">
                                  <img 
                                    src={attachment.file_path} 
                                    alt="Evidence" 
                                    className="w-full h-32 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                                </div>
                              ) : (
                                <div className="w-full h-32 sm:h-48 bg-gradient-to-br from-primary/10 to-primary/20 rounded flex items-center justify-center">
                                  <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-primary/60" />
                                </div>
                              )}
                              <div className="p-2 sm:p-3 bg-muted/30">
                                <p className="text-xs sm:text-sm font-medium text-primary">
                                  {attachment.file_type.toUpperCase()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {attachment.file_size ? `${Math.round(attachment.file_size / 1024)}KB` : 'Unknown size'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 sm:py-8 text-muted-foreground">
                          <ImageIcon className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm sm:text-base">No evidence files attached</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Location & Coordinates */}
                  {complaint.location_address && (
                    <Card className="border-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          Location Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-foreground mb-2">Address</p>
                            <p className="text-sm text-muted-foreground">{complaint.location_address}</p>
                          </div>
                          
                          {complaint.location_lat && complaint.location_lng && (
                            <div>
                              <p className="text-sm font-medium text-foreground mb-2">GPS Coordinates</p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="flex-1">
                                  <p className="text-sm text-muted-foreground font-mono">
                                    Latitude: {complaint.location_lat.toFixed(6)}
                                  </p>
                                  <p className="text-sm text-muted-foreground font-mono">
                                    Longitude: {complaint.location_lng.toFixed(6)}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openMap(complaint.location_lat, complaint.location_lng)}
                                  className="w-full sm:w-auto"
                                >
                                  <MapPin className="h-4 w-4 mr-2" />
                                  View on Google Maps
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Status History */}
                  {complaint.status_history && complaint.status_history.length > 0 && (
                    <Card className="border-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          Status History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 sm:space-y-4">
                          {complaint.status_history.map((history, index) => (
                            <div key={history.id} className="flex items-start gap-3 sm:gap-4">
                              <div className="flex flex-col items-center">
                                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full"></div>
                                {index < complaint.status_history.length - 1 && (
                                  <div className="w-0.5 h-6 sm:h-8 bg-border mt-2"></div>
                                )}
                              </div>
                              <div className="flex-1 pb-3 sm:pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                  <Badge variant="outline" className="text-xs sm:text-sm w-fit">
                                    {history.new_status.replace("_", " ").toUpperCase()}
                                  </Badge>
                                  <span className="text-xs sm:text-sm text-muted-foreground">
                                    {formatDate(history.created_at)}
                                  </span>
                                </div>
                                {history.first_name && (
                                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                                    Changed by: <span className="font-medium">{history.first_name} {history.last_name}</span>
                                  </p>
                                )}
                                {history.notes && (
                                  <p className="text-xs sm:text-sm bg-muted/50 p-2 rounded border-l-2 border-primary/30">
                                    {history.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="lg:col-span-1 border-l bg-muted/20 p-4 sm:p-6 overflow-y-auto h-full min-h-0">
                <div className="space-y-6">
                  {/* Quick Info */}
                  <Card className="border-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        Quick Info
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium">Complainant</p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {complaint.anonymous_name || (complaint.first_name && complaint.last_name) 
                              ? (complaint.anonymous_name || `${complaint.first_name} ${complaint.last_name}`)
                              : 'Anonymous'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium">Submitted</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{formatDate(complaint.created_at)}</p>
                        </div>
                      </div>

                      {complaint.location_address && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium">Location</p>
                            <p className="text-xs sm:text-sm text-muted-foreground break-words">{complaint.location_address}</p>
                            {complaint.location_lat && complaint.location_lng && (
                              <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                                <div className="text-xs text-muted-foreground">
                                  <span className="font-medium">Coordinates:</span> {complaint.location_lat.toFixed(6)}, {complaint.location_lng.toFixed(6)}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openMap(complaint.location_lat, complaint.location_lng)}
                                  className="text-xs h-6 px-2 w-fit"
                                >
                                  <MapPin className="h-3 w-3 mr-1" />
                                  View on Map
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {complaint.anonymous_email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium">Email</p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{complaint.anonymous_email}</p>
                          </div>
                        </div>
                      )}

                      {complaint.anonymous_phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium">Phone</p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{complaint.anonymous_phone}</p>
                          </div>
                        </div>
                      )}

                      {complaint.assigned_first_name && (
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium">Assigned to</p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{complaint.assigned_first_name} {complaint.assigned_last_name}</p>
                          </div>
                        </div>
                      )}

                      {complaint.suggested_department && (
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium">Department</p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">{complaint.suggested_department}</p>
                          </div>
                        </div>
                      )}

                      {complaint.estimated_resolution_days && (
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium">Est. Resolution</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">{complaint.estimated_resolution_days} days</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Status Management */}
                  {complaint.status !== 'resolved' && (
                    <Card className="border-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 sm:space-y-3">
                          {complaint.status === 'submitted' && (
                            <Button
                              onClick={() => handleStatusUpdate('in_progress')}
                              disabled={updatingStatus}
                              className="w-full flex items-center gap-2"
                              size="sm"
                            >
                              <PlayCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="text-xs sm:text-sm">Mark as In Progress</span>
                            </Button>
                          )}
                          {complaint.status === 'in_progress' && (
                            <Button
                              onClick={() => handleStatusUpdate('resolved')}
                              disabled={updatingStatus}
                              variant="default"
                              className="w-full flex items-center gap-2"
                              size="sm"
                            >
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="text-xs sm:text-sm">Mark as Resolved</span>
                            </Button>
                          )}
                          {complaint.status === 'submitted' && (
                            <Button
                              onClick={() => handleStatusUpdate('resolved')}
                              disabled={updatingStatus}
                              variant="default"
                              className="w-full flex items-center gap-2"
                              size="sm"
                            >
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="text-xs sm:text-sm">Mark as Resolved</span>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
