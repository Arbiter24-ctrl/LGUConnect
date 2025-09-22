"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import {
  Search,
  Download,
  Eye,
  MessageSquare,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText,
  CheckCircle,
} from "lucide-react"

export default function OfficialsDashboard() {
  const [complaints, setComplaints] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch complaints
      const complaintsResponse = await fetch("/api/complaints")
      const complaintsResult = await complaintsResponse.json()

      if (complaintsResult.success) {
        setComplaints(complaintsResult.data)

        // Calculate stats from complaints data
        const total = complaintsResult.data.length
        const pending = complaintsResult.data.filter((c) =>
          ["submitted", "in_progress", "under_review"].includes(c.status),
        ).length
        const resolved = complaintsResult.data.filter((c) => c.status === "resolved").length
        const urgent = complaintsResult.data.filter((c) => c.priority === "urgent").length

        setStats({
          total_complaints,
          pending_complaints,
          resolved_complaints,
          urgent_complaints,
          avg_resolution_time: 5.2,
          satisfaction_rate
        })
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
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

  // Chart data
  const complaintsOverTime = [
    { month: "Jan", complaints: 12, resolved: 8 },
    { month: "Feb", complaints: 15, resolved: 10 },
    { month: "Mar", complaints: 18, resolved: 12 },
    { month: "Apr", complaints: 14, resolved: 9 },
    { month: "May", complaints: 16, resolved: 11 },
    { month: "Jun", complaints: 13, resolved: 9 }
  ]

  const categoryData = [
    { name: "Infrastructure", value: 25, color: "#3b82f6" },
    { name: "Public Safety", value: 20, color: "#ef4444" },
    { name: "Health & Sanitation", value: 18, color: "#10b981" },
    { name: "Environmental", value: 15, color: "#f59e0b" },
    { name: "Administrative", value: 12, color: "#8b5cf6" }
  ]

  const priorityData = [
    { priority: "Low", count: 15, color: "#10b981" },
    { priority: "Medium", count: 25, color: "#f59e0b" },
    { priority: "High", count: 10, color: "#ef4444" },
    { priority: "Urgent", count: 5, color: "#dc2626" }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Barangay Officials Dashboard</h1>
              <p className="text-muted-foreground">Complaint Management & Analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <div className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</div>
            </div>
          </div>
        </div>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Complaints</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.total_complaints || 0}</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">+12%</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.pending_complaints || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-yellow-500">
                  {stats ? Math.round((stats.pending_complaints / stats.total_complaints) * 100) : 0}%
                </span>
                <span className="text-muted-foreground ml-1">of total complaints</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.resolved_complaints || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-green-500">
                  {stats ? Math.round((stats.resolved_complaints / stats.total_complaints) * 100) : 0}%
                </span>
                <span className="text-muted-foreground ml-1">resolution rate</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Urgent Cases</p>
                  <p className="text-3xl font-bold text-foreground">{stats?.urgent_complaints || 0}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-red-500">Requires immediate attention</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Complaints Over Time</CardTitle>
              <CardDescription>Monthly complaint submissions and resolutions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={complaintsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="complaints"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Complaints by Category</CardTitle>
              <CardDescription>Distribution of complaint types</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Complaints Management */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Recent Complaints</CardTitle>
                <CardDescription>Manage and track complaint status</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-input border-border"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-input border-border">
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
                  <SelectTrigger className="w-32 bg-input border-border">
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredComplaints.slice(0, 10).map((complaint) => (
                <div
                  key={complaint.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary/20"
                >
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
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{complaint.description.substring(0, 120)}...</p>
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
                  <div className="flex items-center gap-2">
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
