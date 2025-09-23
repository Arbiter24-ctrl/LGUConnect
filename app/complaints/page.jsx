"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Search, Eye, MessageSquare, Clock, AlertTriangle, FileText, Brain, Zap, BarChart3 } from "lucide-react"

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    // Set loading to false immediately to show page
    setLoading(false)
    
    try {
      const response = await fetch("/api/complaints")
      const result = await response.json()

      if (result.success) {
        setComplaints(result.data)
      }
    } catch (error) {
      console.error("Error fetching complaints:", error)
    }
  }

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || complaint.status === statusFilter
    const matchesPriority = priorityFilter === "all" || complaint.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  // Remove loading state - show page immediately
  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[400px]">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
  //         <p className="text-muted-foreground">Loading complaints...</p>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Complaints</h1>
          <p className="text-muted-foreground">View and manage community complaints</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No complaints found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                    ? "Try adjusting your filters to see more results."
                    : "No complaints have been submitted yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredComplaints.map((complaint) => (
              <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{complaint.title}</h3>
                        <Badge
                          variant={
                            complaint.priority === "urgent"
                              ? "destructive"
                              : complaint.priority === "high"
                                ? "default"
                                : "secondary"
                          }
                        >
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
                      <p className="text-sm text-muted-foreground mb-3">
                        {complaint.description.substring(0, 200)}
                        {complaint.description.length > 200 && "..."}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          By: {complaint.first_name} {complaint.last_name}
                        </span>
                        <span>•</span>
                        <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Dept: {complaint.suggested_department}</span>
                        <span>•</span>
                        <span>Est. {complaint.estimated_resolution_days} days</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge
                        variant={
                          complaint.status === "resolved"
                            ? "default"
                            : complaint.status === "in_progress"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {complaint.status.replace("_", " ").toUpperCase()}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
    </div>
  )
}
