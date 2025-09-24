"use client"

import { useState, useEffect } from "react"
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
  PlayCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ComplaintDetailsModal({ 
  complaintId, 
  isOpen, 
  onClose 
}) {
  const [complaint, setComplaint] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && complaintId) {
      fetchComplaintDetails()
      fetchComments()
    }
  }, [isOpen, complaintId])

  const fetchComplaintDetails = async () => {
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
  }

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}/comments`)
      const result = await response.json()
      
      if (result.success) {
        setComments(result.data)
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Complaint Details
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Header Information */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">{complaint.title}</h2>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className={getStatusColor(complaint.status)}>
                        {complaint.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <Badge className={getPriorityColor(complaint.priority)}>
                        {complaint.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" style={{ borderColor: complaint.category_color }}>
                        {complaint.category_name}
                      </Badge>
                      {complaint.classification_source && (
                        <Badge variant="outline" className="text-xs">
                          {complaint.classification_source === 'ml' ? (
                            <><Brain className="h-3 w-3 mr-1" />ML</>
                          ) : complaint.classification_source === 'ai' ? (
                            <><Zap className="h-3 w-3 mr-1" />AI</>
                          ) : complaint.classification_source === 'hybrid' ? (
                            <><BarChart3 className="h-3 w-3 mr-1" />Hybrid</>
                          ) : (
                            complaint.classification_source
                          )}
                        </Badge>
                      )}
                      {complaint.classification_confidence && (
                        <Badge variant="outline" className="text-xs">
                          {Math.round(complaint.classification_confidence * 100)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{complaint.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Complainant:</span>
                    <span>{complaint.first_name} {complaint.last_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Submitted:</span>
                    <span>{formatDate(complaint.created_at)}</span>
                  </div>
                  {complaint.location_address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Location:</span>
                      <span>{complaint.location_address}</span>
                    </div>
                  )}
                  {complaint.assigned_first_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Assigned to:</span>
                      <span>{complaint.assigned_first_name} {complaint.assigned_last_name}</span>
                    </div>
                  )}
                  {complaint.suggested_department && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Department:</span>
                      <span>{complaint.suggested_department}</span>
                    </div>
                  )}
                  {complaint.estimated_resolution_days && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Est. Resolution:</span>
                      <span>{complaint.estimated_resolution_days} days</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status Management */}
            {complaint.status !== 'resolved' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Status Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    {complaint.status === 'submitted' && (
                      <Button
                        onClick={() => handleStatusUpdate('in_progress')}
                        disabled={updatingStatus}
                        className="flex items-center gap-2"
                      >
                        <PlayCircle className="h-4 w-4" />
                        Mark as In Progress
                      </Button>
                    )}
                    {complaint.status === 'in_progress' && (
                      <Button
                        onClick={() => handleStatusUpdate('resolved')}
                        disabled={updatingStatus}
                        variant="default"
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Mark as Resolved
                      </Button>
                    )}
                    {complaint.status === 'submitted' && (
                      <Button
                        onClick={() => handleStatusUpdate('resolved')}
                        disabled={updatingStatus}
                        variant="default"
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Mark as Resolved
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attachments */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Attachments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {complaint.attachments.map((attachment) => (
                      <div key={attachment.id} className="border rounded-lg p-3">
                        {attachment.file_type === 'image' ? (
                          <img 
                            src={attachment.file_path} 
                            alt="Attachment" 
                            className="w-full h-32 object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                          {attachment.file_type.toUpperCase()} • {attachment.file_size ? `${Math.round(attachment.file_size / 1024)}KB` : 'Unknown size'}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status History */}
            {complaint.status_history && complaint.status_history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Status History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {complaint.status_history.map((history, index) => (
                      <div key={history.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">
                              {history.new_status.replace("_", " ").toUpperCase()}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(history.created_at)}
                            </span>
                          </div>
                          {history.first_name && (
                            <p className="text-sm text-muted-foreground">
                              Changed by: {history.first_name} {history.last_name}
                            </p>
                          )}
                          {history.notes && (
                            <p className="text-sm mt-1">{history.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add Comment Form */}
                <div className="mb-6">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-3"
                    rows={3}
                  />
                  <Button 
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submittingComment}
                    className="w-full sm:w-auto"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submittingComment ? "Adding..." : "Add Comment"}
                  </Button>
                </div>

                <Separator className="my-4" />

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="border-l-2 border-muted pl-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">
                              {comment.first_name} {comment.last_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
