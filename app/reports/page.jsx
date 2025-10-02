"use client"

import { useState, useEffect, useCallback } from "react"
import { useUser } from "../../lib/user-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Badge } from "../../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts"
import {
  Download,
  FileText,
  Calendar,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  FileDown,
} from "lucide-react"

export default function ReportsPage() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(false)
  const [reportType, setReportType] = useState("summary")
  const [dateRange, setDateRange] = useState("30d")
  const [category, setCategory] = useState("all")
  const [status, setStatus] = useState("all")
  const [generatedReport, setGeneratedReport] = useState(null)

  const fetchComplaintsData = useCallback(async () => {
    setLoading(true)
    try {
      console.log('Fetching complaints data...')
      
      // For admin users, show all data. For officials, filter by barangay
      let barangayId = null
      if (user?.role === 'official' && user?.barangay) {
        try {
          const barangaysResponse = await fetch("/api/barangays")
          const barangaysResult = await barangaysResponse.json()
          if (barangaysResult.success) {
            const userBarangay = barangaysResult.data.find(b => b.name === user.barangay)
            if (userBarangay) {
              barangayId = userBarangay.id
              console.log('📊 Reports: Official user - filtering by barangay_id:', barangayId, 'for barangay:', user.barangay)
            } else {
              console.warn('📊 Reports: User barangay not found in database:', user.barangay)
            }
          }
        } catch (error) {
          console.error('📊 Reports: Error fetching barangays:', error)
        }
      } else if (user?.role === 'admin') {
        console.log('📊 Reports: Admin user - showing all complaints')
      }

      // Build the complaints API URL with barangay filtering (only for officials)
      let complaintsUrl = "/api/complaints"
      if (barangayId) {
        complaintsUrl += `?barangay_id=${barangayId}`
        console.log('📊 Reports: Filtering complaints by barangay_id:', barangayId)
      } else {
        console.log('📊 Reports: No barangay filtering applied - showing all complaints')
      }

      const response = await fetch(complaintsUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Complaints API response:', result)

      if (result.success) {
        setComplaints(result.data || [])
        console.log('Complaints data set:', result.data?.length || 0, 'items')
      } else {
        console.error('API returned error:', result.error)
        setComplaints([])
      }
    } catch (error) {
      console.error("Error fetching complaints data:", error)
      setComplaints([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login')
      return
    }

    if (!userLoading && user && user.role !== 'admin' && user.role !== 'official') {
      router.push('/')
      return
    }

    if (user) {
      fetchComplaintsData()
    }
  }, [user, userLoading, router, fetchComplaintsData])

  const generateReport = () => {
    try {
      console.log('🔍 Generating report with data:', { 
        totalComplaints: complaints.length, 
        category, 
        status, 
        dateRange,
        userRole: user?.role,
        userBarangay: user?.barangay
      })
      
      if (complaints.length === 0) {
        console.warn('⚠️ No complaints data available for report generation')
        alert('No complaints data available. Please check if there are complaints in the system.')
        return
      }
      
      const filteredData = complaints.filter(complaint => {
        const matchesCategory = category === "all" || complaint.category_name === category
        const matchesStatus = status === "all" || complaint.status === status
        
        // Date filtering logic based on dateRange
        const complaintDate = new Date(complaint.created_at)
        const now = new Date()
        let matchesDate = true
        
        switch (dateRange) {
          case '7d':
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            matchesDate = complaintDate >= sevenDaysAgo
            break
          case '30d':
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            matchesDate = complaintDate >= thirtyDaysAgo
            break
          case '90d':
            const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
            matchesDate = complaintDate >= ninetyDaysAgo
            break
          case '1y':
            const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            matchesDate = complaintDate >= oneYearAgo
            break
          case 'all':
          default:
            matchesDate = true
            break
        }
        
        return matchesCategory && matchesStatus && matchesDate
      })

      console.log('Filtered data:', filteredData.length, 'complaints')

      const reportData = {
        type: reportType,
        dateRange,
        category,
        status,
        totalComplaints: filteredData.length,
        data: filteredData,
        generatedAt: new Date().toISOString(),
        generatedBy: user?.first_name + " " + user?.last_name
      }

      console.log('Report data generated:', reportData)
      setGeneratedReport(reportData)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error generating report: ' + error.message)
    }
  }

  const exportReport = (format) => {
    if (!generatedReport) return

    if (format === 'server-csv') {
      // Use server-side generation for better performance
      exportServerReport()
      return
    }

    const reportContent = {
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      generatedAt: new Date(generatedReport.generatedAt).toLocaleString(),
      generatedBy: generatedReport.generatedBy,
      filters: {
        dateRange: dateRange,
        category: category,
        status: status
      },
      summary: {
        totalComplaints: generatedReport.totalComplaints,
        byStatus: getStatusBreakdown(generatedReport.data),
        byCategory: getCategoryBreakdown(generatedReport.data)
      },
      data: generatedReport.data
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `complaint-report-${new Date().toISOString().split('T')[0]}.json`
      a.click()
    } else if (format === 'csv') {
      const csvContent = convertToCSV(generatedReport.data)
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `complaint-report-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
    }
  }

  const exportServerReport = async () => {
    try {
      // Build query parameters for server-side generation
      const params = new URLSearchParams()
      params.append('type', reportType === 'summary' ? 'summary' : 'detailed')
      
      // Add date filtering
      const now = new Date()
      let dateFrom = null
      
      switch (dateRange) {
        case '7d':
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case '90d':
          dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        case '1y':
          dateFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
      }
      
      if (dateFrom) {
        params.append('dateFrom', dateFrom.toISOString().split('T')[0])
      }
      
      if (status !== 'all') {
        params.append('status', status)
      }
      
      if (user?.barangay) {
        params.append('barangay', user.barangay)
      }

      // Create download link
      const url = `/api/reports/generate?${params.toString()}`
      const link = document.createElement('a')
      link.href = url
      link.download = `complaint_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error generating server report:', error)
      alert('Error generating report: ' + error.message)
    }
  }

  const exportPDF = async () => {
    if (!generatedReport) return

    try {
      // Dynamic import to avoid SSR issues
      const { jsPDF } = await import('jspdf')
      const autoTable = (await import('jspdf-autotable')).default

      const doc = new jsPDF()
      
      // Add title
      doc.setFontSize(20)
      doc.setTextColor(40, 40, 40)
      doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, 20, 25)
      
      // Add metadata
      doc.setFontSize(12)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated on: ${new Date(generatedReport.generatedAt).toLocaleString()}`, 20, 35)
      doc.text(`Generated by: ${generatedReport.generatedBy}`, 20, 42)
      doc.text(`Date Range: ${dateRange}`, 20, 49)
      doc.text(`Category: ${category}`, 20, 56)
      doc.text(`Status: ${status}`, 20, 63)
      
      // Add summary statistics
      doc.setFontSize(14)
      doc.setTextColor(40, 40, 40)
      doc.text('Summary Statistics', 20, 80)
      
      const summaryData = [
        ['Total Complaints', generatedReport.totalComplaints.toString()],
        ['Resolved', generatedReport.data.filter(c => c.status === 'resolved').length.toString()],
        ['In Progress', generatedReport.data.filter(c => c.status === 'in_progress').length.toString()],
        ['Pending', generatedReport.data.filter(c => c.status === 'submitted').length.toString()]
      ]
      
      autoTable(doc, {
        startY: 85,
        head: [['Metric', 'Count']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 }
      })
      
      // Add detailed data table
      let finalY = doc.lastAutoTable.finalY + 20
      
      doc.setFontSize(14)
      doc.text('Detailed Data', 20, finalY)
      
      if (reportType === 'summary') {
        // Summary report table
        const statusBreakdown = getStatusBreakdown(generatedReport.data)
        const categoryBreakdown = getCategoryBreakdown(generatedReport.data)
        
        const summaryTableData = Object.entries(statusBreakdown).map(([status, count]) => [
          status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
          count.toString()
        ])
        
        autoTable(doc, {
          startY: finalY + 5,
          head: [['Status', 'Count']],
          body: summaryTableData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] },
          styles: { fontSize: 9 }
        })
        
        finalY = doc.lastAutoTable.finalY + 15
        
        const categoryTableData = Object.entries(categoryBreakdown).map(([category, count]) => [
          category,
          count.toString()
        ])
        
        autoTable(doc, {
          startY: finalY,
          head: [['Category', 'Count']],
          body: categoryTableData,
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129] },
          styles: { fontSize: 9 }
        })
        
      } else {
        // Detailed report table
        const tableData = generatedReport.data.slice(0, 50).map(complaint => [
          complaint.id?.toString() || '',
          complaint.title || '',
          complaint.status?.replace('_', ' ').toUpperCase() || '',
          complaint.priority?.toUpperCase() || '',
          complaint.category_name || '',
          complaint.barangay_name || '',
          new Date(complaint.created_at).toLocaleDateString() || ''
        ])
        
        autoTable(doc, {
          startY: finalY + 5,
          head: [['ID', 'Title', 'Status', 'Priority', 'Category', 'Barangay', 'Date']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] },
          styles: { 
            fontSize: 8,
            cellPadding: 2
          },
          columnStyles: {
            0: { cellWidth: 15 },
            1: { cellWidth: 40 },
            2: { cellWidth: 25 },
            3: { cellWidth: 20 },
            4: { cellWidth: 30 },
            5: { cellWidth: 25 },
            6: { cellWidth: 25 }
          }
        })
        
        if (generatedReport.data.length > 50) {
          finalY = doc.lastAutoTable.finalY + 10
          doc.setFontSize(10)
          doc.setTextColor(100, 100, 100)
          doc.text(`Showing first 50 of ${generatedReport.data.length} records`, 20, finalY)
        }
      }
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10)
        doc.text('Complaint Management System', 20, doc.internal.pageSize.height - 10)
      }
      
      // Save the PDF
      doc.save(`complaint-report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF: ' + error.message)
    }
  }

  const getStatusBreakdown = (data) => {
    if (!data || !Array.isArray(data)) return {}
    const breakdown = {}
    data.forEach(complaint => {
      if (complaint && complaint.status) {
        breakdown[complaint.status] = (breakdown[complaint.status] || 0) + 1
      }
    })
    return breakdown
  }

  const getCategoryBreakdown = (data) => {
    if (!data || !Array.isArray(data)) return {}
    const breakdown = {}
    data.forEach(complaint => {
      if (complaint && complaint.category_name) {
        breakdown[complaint.category_name] = (breakdown[complaint.category_name] || 0) + 1
      }
    })
    return breakdown
  }

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return ''
    
    try {
      const headers = Object.keys(data[0]).join(',')
      const rows = data.map(item => 
        Object.values(item).map(value => 
          typeof value === 'string' && value.includes(',') ? `"${value}"` : value
        ).join(',')
      )
      
      return [headers, ...rows].join('\n')
    } catch (error) {
      console.error('Error converting to CSV:', error)
      return ''
    }
  }

  // Chart data preparation
  const statusData = generatedReport && generatedReport.data ? Object.entries(getStatusBreakdown(generatedReport.data)).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    count,
    color: getStatusColor(status)
  })) : []

  const categoryData = generatedReport && generatedReport.data ? Object.entries(getCategoryBreakdown(generatedReport.data)).map(([category, count]) => ({
    category,
    count,
    color: getCategoryColor(category)
  })) : []

  const getStatusColor = (status) => {
    const colors = {
      'submitted': '#3b82f6',
      'in_progress': '#f59e0b',
      'resolved': '#10b981',
      'under_review': '#8b5cf6'
    }
    return colors[status] || '#6b7280'
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Infrastructure': '#3b82f6',
      'Public Safety': '#ef4444',
      'Health & Sanitation': '#10b981',
      'Environmental': '#f59e0b',
      'Administrative': '#8b5cf6'
    }
    return colors[category] || '#6b7280'
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* Report Generation Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Report
          </CardTitle>
          <CardDescription>
            Configure and generate reports from complaint data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="detailed">Detailed Report</SelectItem>
                  <SelectItem value="analytics">Analytics Report</SelectItem>
                  <SelectItem value="performance">Performance Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date-range">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="Public Safety">Public Safety</SelectItem>
                  <SelectItem value="Health & Sanitation">Health & Sanitation</SelectItem>
                  <SelectItem value="Environmental">Environmental</SelectItem>
                  <SelectItem value="Administrative">Administrative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={generateReport} disabled={loading || complaints.length === 0}>
              <BarChart3 className="h-4 w-4 mr-2" />
              {loading ? 'Loading Data...' : 'Generate Report'}
            </Button>
            {generatedReport && (
              <>
                <Button variant="outline" onClick={exportPDF}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={() => exportReport('json')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
                <Button variant="outline" onClick={() => exportReport('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV (Client)
                </Button>
                <Button variant="outline" onClick={() => exportReport('server-csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV (Server)
                </Button>
              </>
            )}
          </div>
          
          {complaints.length === 0 && !loading && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                No complaints data available. Please ensure there are complaints in the system.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Report Display */}
      {generatedReport && (
        <div className="space-y-6">
          {/* Report Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Report Summary</CardTitle>
              <CardDescription>
                Generated on {new Date(generatedReport.generatedAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{generatedReport.totalComplaints}</div>
                  <div className="text-sm text-blue-600">Total Complaints</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {generatedReport.data.filter(c => c.status === 'resolved').length}
                  </div>
                  <div className="text-sm text-green-600">Resolved</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {generatedReport.data.filter(c => c.status === 'in_progress').length}
                  </div>
                  <div className="text-sm text-yellow-600">In Progress</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {generatedReport.data.filter(c => c.status === 'submitted').length}
                  </div>
                  <div className="text-sm text-red-600">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ status, count }) => `${status}: ${count}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Report Data</CardTitle>
              <CardDescription>
                Detailed view of filtered complaint data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Title</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Priority</th>
                      <th className="text-left p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedReport.data.slice(0, 10).map((complaint) => (
                      <tr key={complaint.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{complaint.id}</td>
                        <td className="p-2">{complaint.title}</td>
                        <td className="p-2">
                          <Badge variant="outline">{complaint.category_name}</Badge>
                        </td>
                        <td className="p-2">
                          <Badge 
                            variant={
                              complaint.status === "resolved" ? "default" :
                              complaint.status === "in_progress" ? "secondary" : "outline"
                            }
                          >
                            {complaint.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge 
                            variant={
                              complaint.priority === "urgent" ? "destructive" :
                              complaint.priority === "high" ? "default" : "secondary"
                            }
                          >
                            {complaint.priority.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {generatedReport.data.length > 10 && (
                  <div className="text-center mt-4 text-sm text-gray-500">
                    Showing 10 of {generatedReport.data.length} records
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
