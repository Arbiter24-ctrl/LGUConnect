"use client"

import { useState, useEffect } from "react"
import { useUser } from "../../lib/user-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
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
  Eye,
  MessageSquare,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText,
  CheckCircle,
  Brain,
  Zap,
  BarChart3,
} from "lucide-react"

export default function OfficialsDashboard() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [complaints, setComplaints] = useState([])
  const [stats, setStats] = useState(null)
  const [mlStats, setMlStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  useEffect(() => {
    console.log('🔍 Dashboard: useEffect triggered', { userLoading, user })

    // Check authentication immediately
    if (!userLoading && !user) {
      console.log('❌ Dashboard: No user found, redirecting to login')
      router.push('/login')
      return
    }

    if (!userLoading && user && user.role !== 'admin' && user.role !== 'official') {
      console.log('❌ Dashboard: User role not authorized:', user.role)
      router.push('/')
      return
    }

    // Fetch data immediately if user is available, don't wait for userLoading
    if (user) {
      console.log('✅ Dashboard: User authorized, fetching data')
      fetchDashboardData()
    }
  }, [user, userLoading, router])

  const fetchDashboardData = async () => {
    // Set loading to false immediately to show dashboard
    setLoading(false)

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
          total_complaints: total,
          pending_complaints: pending,
          resolved_complaints: resolved,
          urgent_complaints: urgent,
          avg_resolution_time: 5.2,
          satisfaction_rate: 85
        })

        // Calculate ML stats from complaints data
        const mlPredictions = complaintsResult.data.filter((c) => c.classification_source === 'ml').length
        const aiPredictions = complaintsResult.data.filter((c) => c.classification_source === 'ai').length
        const hybridPredictions = complaintsResult.data.filter((c) => c.classification_source === 'hybrid').length

        setMlStats({
          mlAccuracy: 87.5,
          aiAccuracy: 92.3,
          hybridAccuracy: 94.1,
          totalPredictions: mlPredictions + aiPredictions + hybridPredictions,
          mlPredictions,
          aiPredictions,
          hybridPredictions,
          avgProcessingTime: 245
        })
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
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

  // Process complaints data for charts
  const processComplaintsOverTime = () => {
    const last6Months = []
    const currentDate = new Date()
    
    // Generate last 6 months with proper date handling
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      last6Months.push({
        month: monthName,
        monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        complaints: 0,
        resolved: 0
      })
    }

    // Count complaints by month
    complaints.forEach(complaint => {
      const complaintDate = new Date(complaint.created_at)
      const complaintMonthKey = `${complaintDate.getFullYear()}-${String(complaintDate.getMonth() + 1).padStart(2, '0')}`
      
      const monthData = last6Months.find(m => m.monthKey === complaintMonthKey)
      if (monthData) {
        monthData.complaints++
        if (complaint.status === 'resolved') {
          monthData.resolved++
        }
      }
    })

    // Remove monthKey before returning
    return last6Months.map(({ monthKey, ...rest }) => rest)
  }

  const processCategoryData = () => {
    const categoryCounts = {}
    const categoryColors = {
      "Infrastructure": "#3b82f6",
      "Public Safety": "#ef4444", 
      "Health & Sanitation": "#10b981",
      "Environmental": "#f59e0b",
      "Administrative": "#8b5cf6",
      "Other": "#6b7280"
    }

    // Count complaints by category
    complaints.forEach(complaint => {
      const category = complaint.category_name || 'Other'
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })

    // Convert to chart format with fallback colors
    const defaultColors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#6b7280", "#f97316", "#84cc16"]
    
    return Object.entries(categoryCounts).map(([name, value], index) => ({
      name,
      value,
      color: categoryColors[name] || defaultColors[index % defaultColors.length]
    }))
  }

  // Chart data - now using real complaint data
  const complaintsOverTime = processComplaintsOverTime()
  const categoryData = processCategoryData()
  
  // Debug logging
  console.log('Category data for pie chart:', categoryData)

  const processPriorityData = () => {
    const priorityCounts = {}
    const priorityColors = {
      "low": "#10b981",
      "medium": "#f59e0b", 
      "high": "#ef4444",
      "urgent": "#dc2626"
    }

    // Count complaints by priority
    complaints.forEach(complaint => {
      const priority = complaint.priority || 'low'
      priorityCounts[priority] = (priorityCounts[priority] || 0) + 1
    })

    // Convert to chart format
    return Object.entries(priorityCounts).map(([priority, count]) => ({
      priority: priority.charAt(0).toUpperCase() + priority.slice(1),
      count,
      color: priorityColors[priority] || "#6b7280"
    }))
  }

  const priorityData = processPriorityData()

  // Remove loading state - show dashboard immediately
  // if (userLoading || loading) {
  //   return (
  //     <div className="min-h-screen bg-background dark flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
  //         <p className="text-muted-foreground">Loading dashboard...</p>
  //       </div>
  //     </div>
  //   )
  // }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* Page Actions */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-card border-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Complaints</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats?.total_complaints || 0}</p>
              </div>
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
            </div>
            <div className="flex items-center mt-3 sm:mt-4 text-xs sm:text-sm">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1 flex-shrink-0" />
              <span className="text-green-500">+12%</span>
              <span className="text-muted-foreground ml-1 truncate">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats?.pending_complaints || 0}</p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 flex-shrink-0" />
            </div>
            <div className="flex items-center mt-3 sm:mt-4 text-xs sm:text-sm">
              <span className="text-yellow-500">
                {stats ? Math.round((stats.pending_complaints / stats.total_complaints) * 100) : 0}%
              </span>
              <span className="text-muted-foreground ml-1 truncate">of total complaints</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats?.resolved_complaints || 0}</p>
              </div>
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
            </div>
            <div className="flex items-center mt-3 sm:mt-4 text-xs sm:text-sm">
              <span className="text-green-500">
                {stats ? Math.round((stats.resolved_complaints / stats.total_complaints) * 100) : 0}%
              </span>
              <span className="text-muted-foreground ml-1 truncate">resolution rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Urgent Cases</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stats?.urgent_complaints || 0}</p>
              </div>
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" />
            </div>
            <div className="flex items-center mt-3 sm:mt-4 text-xs sm:text-sm">
              <span className="text-red-500 truncate">Requires immediate attention</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ML Performance Section */}
      {/* {mlStats && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              AI Classification Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">ML Accuracy</p>
                      <p className="text-3xl font-bold text-foreground">{mlStats.mlAccuracy}%</p>
                    </div>
                    <Brain className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="flex items-center mt-4 text-sm">
                    <span className="text-blue-500">Machine Learning</span>
                    <span className="text-muted-foreground ml-1">predictions</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">AI Accuracy</p>
                      <p className="text-3xl font-bold text-foreground">{mlStats.aiAccuracy}%</p>
                    </div>
                    <Zap className="w-8 h-8 text-purple-500" />
                  </div>
                  <div className="flex items-center mt-4 text-sm">
                    <span className="text-purple-500">Generative AI</span>
                    <span className="text-muted-foreground ml-1">predictions</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Hybrid Accuracy</p>
                      <p className="text-3xl font-bold text-foreground">{mlStats.hybridAccuracy}%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="flex items-center mt-4 text-sm">
                    <span className="text-green-500">Combined approach</span>
                    <span className="text-muted-foreground ml-1">best performance</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg Processing</p>
                      <p className="text-3xl font-bold text-foreground">{mlStats.avgProcessingTime}ms</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="flex items-center mt-4 text-sm">
                    <span className="text-orange-500">Response time</span>
                    <span className="text-muted-foreground ml-1">per prediction</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Classification Method Distribution</CardTitle>
                <CardDescription>How predictions are distributed across ML, AI, and hybrid approaches</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Machine Learning</p>
                        <p className="text-sm text-muted-foreground">{mlStats.mlPredictions} predictions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{mlStats.mlPredictions > 0 ? Math.round((mlStats.mlPredictions / mlStats.totalPredictions) * 100) : 0}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium">Generative AI</p>
                        <p className="text-sm text-muted-foreground">{mlStats.aiPredictions} predictions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{mlStats.aiPredictions > 0 ? Math.round((mlStats.aiPredictions / mlStats.totalPredictions) * 100) : 0}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Hybrid</p>
                        <p className="text-sm text-muted-foreground">{mlStats.hybridPredictions} predictions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{mlStats.hybridPredictions > 0 ? Math.round((mlStats.hybridPredictions / mlStats.totalPredictions) * 100) : 0}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )} */}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-sm sm:text-base text-foreground">Complaints Over Time</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Monthly complaint submissions and resolutions</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={250}>
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
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-sm sm:text-base text-foreground">Complaints by Category</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Distribution of complaint types</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
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
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="text-sm sm:text-base text-foreground">Recent Complaints</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Manage and track complaint status</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64 bg-input border-border"
                />
              </div>
              <div className="flex gap-2 sm:gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32 bg-input border-border">
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
                  <SelectTrigger className="w-full sm:w-32 bg-input border-border">
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
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Complaint</TableHead>
                  <TableHead>Complainant</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.slice(0, 10).map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{complaint.title}</div>
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {complaint.description.substring(0, 80)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {complaint.first_name} {complaint.last_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" style={{ borderColor: complaint.category_color }}>
                        {complaint.category_name}
                      </Badge>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {complaint.suggested_department}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Est. {complaint.estimated_resolution_days} days
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" title="View Details">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="View Comments">
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
