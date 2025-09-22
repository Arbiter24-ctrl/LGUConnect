"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Progress } from '../../components/ui/progress'
import { 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  BarChart3,
  Calendar,
  Users,
  FileText,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { Complaint, ComplaintCategory } from '../../lib/types'

export default function TrendsPage() {
  const [trends, setTrends] = useState([])
  const [priorityTrends, setPriorityTrends] = useState([])
  const [recentTrends, setRecentTrends] = useState([])
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    fetchTrendData()
  }, [timeRange])

  const fetchTrendData = async () => {
    try {
      setLoading(true)
      
      // Fetch complaints data
      const response = await fetch(`/api/complaints?limit=1000`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setComplaints(data.data)
        processTrendData(data.data)
      }
    } catch (error) {
      console.error('Error fetching trend data:', error)
    } finally {
      setLoading(false)
    }
  }

  const processTrendData = (complaintsData) => {
    const now = new Date()
    const timeRangeDays = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 7
    const cutoffDate = new Date(now.getTime() - timeRangeDays * 24 * 60 * 60 * 1000)
    
    const filteredComplaints = complaintsData.filter(complaint => 
      new Date(complaint.created_at) >= cutoffDate
    )

    // Process category trends
    const categoryMap = new Map()
    
    // Get previous period for comparison
    const previousCutoffDate = new Date(now.getTime() - (timeRangeDays * 2) * 24 * 60 * 60 * 1000)
    const previousComplaints = complaintsData.filter(complaint => {
      const complaintDate = new Date(complaint.created_at)
      return complaintDate >= previousCutoffDate && complaintDate < cutoffDate
    })

    // Count current period
    filteredComplaints.forEach(complaint => {
      const category = complaint.category?.name || 'Uncategorized'
      const color = complaint.category?.color || '#6b7280'
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { count: 0, previousCount: 0, color })
      }
      categoryMap.get(category).count++
    })

    // Count previous period
    previousComplaints.forEach(complaint => {
      const category = complaint.category?.name || 'Uncategorized'
      if (categoryMap.has(category)) {
        categoryMap.get(category).previousCount++
      }
    })

    const totalComplaints = filteredComplaints.length
    const trendsData = Array.from(categoryMap.entries()).map(([category, data]) => {
      const percentage = totalComplaints > 0 ? (data.count / totalComplaints) * 100 : 0
      const change = data.previousCount > 0 ? ((data.count - data.previousCount) / data.previousCount) * 100 : 0
      
      let trend = 'stable'
      if (change > 5) trend = 'up'
      else if (change < -5) trend = 'down'

      return {
        category,
        count: data.count,
        percentage,
        color: data.color,
        trend,
        change: Math.abs(change)
      }
    }).sort((a, b) => b.count - a.count)

    setTrends(trendsData)

    // Process priority trends
    const priorityMap = new Map()
    const priorityColors = {
      'high': '#ef4444',
      'medium': '#f59e0b', 
      'low': '#10b981'
    }

    filteredComplaints.forEach(complaint => {
      const priority = complaint.priority
      if (!priorityMap.has(priority)) {
        priorityMap.set(priority, { count, color: priorityColors[priority] || '#6b7280' })
      }
      priorityMap.get(priority).count++
    })

    const priorityTrendsData = Array.from(priorityMap.entries()).map(([priority, data]) => ({
      priority: priority.charAt(0).toUpperCase() + priority.slice(1),
      count: data.count,
      percentage: totalComplaints > 0 ? (data.count / totalComplaints) * 100 : 0,
      color: data.color
    })).sort((a, b) => b.count - a.count)

    setPriorityTrends(priorityTrendsData)

    // Process recent trends (last 7 days)
    const recentTrendsData= []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayComplaints = filteredComplaints.filter(complaint => 
        complaint.created_at.startsWith(dateStr)
      )
      
      // Get most common category for the day
      const categoryCount = new Map()
      dayComplaints.forEach(complaint => {
        const category = complaint.category?.name || 'Uncategorized'
        categoryCount.set(category, (categoryCount.get(category) || 0) + 1)
      })
      
      const topCategory = Array.from(categoryCount.entries())
        .sort((a, b) => b[1] - a[1])[0]
      
      recentTrendsData.push({
        date,
        count: dayComplaints.length,
        category: topCategory ? topCategory[0] : 'None'
      })
    }

    setRecentTrends(recentTrendsData)
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-red-600'
      case 'down':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading trend data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Complaint Trends</h1>
          <p className="text-muted-foreground">
            Analyze complaint patterns and identify trending issues
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </Button>
          <Button
            variant={timeRange === '90d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('90d')}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaints.length}</div>
            <p className="text-xs text-muted-foreground">
              Last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trends[0]?.category || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              {trends[0]?.count || 0} complaints
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {priorityTrends.find(p => p.priority === 'High')?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Urgent issues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complaints.filter(c => c.status === 'resolved').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully resolved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="priorities">Priorities</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complaints by Category</CardTitle>
              <CardDescription>
                Most reported complaint categories in the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trends.map((trend, index) => (
                  <div key={trend.category} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: trend.color }}
                      />
                      <span className="font-medium truncate">{trend.category}</span>
                      <Badge variant="secondary" className="ml-2">
                        #{index + 1}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{trend.count}</span>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(trend.trend)}
                        <span className={`text-xs ${getTrendColor(trend.trend)}`}>
                          {trend.change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-32">
                      <Progress value={trend.percentage} className="h-2" />
                    </div>
                    
                    <div className="text-sm text-muted-foreground w-16 text-right">
                      {trend.percentage.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priorities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complaints by Priority</CardTitle>
              <CardDescription>
                Distribution of complaint priorities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {priorityTrends.map((priority) => (
                  <div key={priority.priority} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: priority.color }}
                      />
                      <span className="font-medium">{priority.priority}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{priority.count}</span>
                    </div>
                    
                    <div className="w-32">
                      <Progress value={priority.percentage} className="h-2" />
                    </div>
                    
                    <div className="text-sm text-muted-foreground w-16 text-right">
                      {priority.percentage.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Daily complaint activity for the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTrends.map((trend) => (
                  <div key={trend.date} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium">
                        {new Date(trend.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {trend.count} complaints
                      </div>
                      {trend.category !== 'None' && (
                        <Badge variant="outline" className="text-xs">
                          {trend.category}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{trend.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
