"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Progress } from "../../../components/ui/progress"
import { Button } from "../../../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  BarChart3,
  Settings,
  RefreshCw
} from "lucide-react"

export default function MLMonitoringPage() {
  const [mlStats, setMlStats] = useState({
    mlAccuracy: 0,
    aiAccuracy: 0,
    hybridAccuracy: 0,
    avgProcessingTime: 0,
    totalPredictions: 0,
    mlPredictions: 0,
    aiPredictions: 0,
    hybridPredictions: 0,
    confidenceDistribution: {},
    recentPerformance: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMLStats()
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchMLStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchMLStats = async () => {
    try {
      // Mock data for now - replace with actual API calls
      const mockStats = {
        mlAccuracy: 87.5,
        aiAccuracy: 92.3,
        hybridAccuracy: 94.1,
        avgProcessingTime: 245,
        totalPredictions: 1247,
        mlPredictions: 892,
        aiPredictions: 203,
        hybridPredictions: 152,
        confidenceDistribution: {
          high: 65,
          medium: 28,
          low: 7
        },
        recentPerformance: [
          { date: '2024-01-15', ml: 85, ai: 90, hybrid: 92 },
          { date: '2024-01-16', ml: 87, ai: 91, hybrid: 93 },
          { date: '2024-01-17', ml: 88, ai: 92, hybrid: 94 },
          { date: '2024-01-18', ml: 86, ai: 93, hybrid: 95 },
          { date: '2024-01-19', ml: 89, ai: 91, hybrid: 94 }
        ]
      }
      
      setMlStats(mockStats)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching ML stats:', error)
      setIsLoading(false)
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return "text-green-600"
    if (confidence >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceBadgeVariant = (confidence) => {
    if (confidence >= 80) return "default"
    if (confidence >= 60) return "secondary"
    return "destructive"
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            ML Model Monitoring
          </h1>
          <p className="text-muted-foreground">Track AI classification performance and model health</p>
        </div>
        <Button onClick={fetchMLStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ML Accuracy</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mlStats.mlAccuracy}%</div>
            <p className="text-xs text-muted-foreground">Machine Learning predictions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Accuracy</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mlStats.aiAccuracy}%</div>
            <p className="text-xs text-muted-foreground">Generative AI predictions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hybrid Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mlStats.hybridAccuracy}%</div>
            <p className="text-xs text-muted-foreground">Combined approach</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mlStats.avgProcessingTime}ms</div>
            <p className="text-xs text-muted-foreground">Response time</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Prediction Distribution</CardTitle>
                <CardDescription>How predictions are distributed across methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Machine Learning</span>
                  <div className="flex items-center gap-2">
                    <Progress value={(mlStats.mlPredictions / mlStats.totalPredictions) * 100} className="w-24" />
                    <span className="text-sm text-muted-foreground">{mlStats.mlPredictions}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Generative AI</span>
                  <div className="flex items-center gap-2">
                    <Progress value={(mlStats.aiPredictions / mlStats.totalPredictions) * 100} className="w-24" />
                    <span className="text-sm text-muted-foreground">{mlStats.aiPredictions}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Hybrid</span>
                  <div className="flex items-center gap-2">
                    <Progress value={(mlStats.hybridPredictions / mlStats.totalPredictions) * 100} className="w-24" />
                    <span className="text-sm text-muted-foreground">{mlStats.hybridPredictions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Confidence Distribution</CardTitle>
                <CardDescription>Quality of predictions by confidence level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">High Confidence (≥80%)</span>
                  <Badge variant="default">{mlStats.confidenceDistribution.high}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Medium Confidence (60-79%)</span>
                  <Badge variant="secondary">{mlStats.confidenceDistribution.medium}%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Low Confidence (<60%)</span>
                  <Badge variant="destructive">{mlStats.confidenceDistribution.low}%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Accuracy trends over the last 5 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mlStats.recentPerformance.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">{day.date}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{day.ml}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">{day.ai}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">{day.hybrid}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">ML Model</span>
                  <div className="flex items-center gap-2">
                    <Progress value={mlStats.mlAccuracy} className="w-24" />
                    <span className="text-sm font-medium">{mlStats.mlAccuracy}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI Model</span>
                  <div className="flex items-center gap-2">
                    <Progress value={mlStats.aiAccuracy} className="w-24" />
                    <span className="text-sm font-medium">{mlStats.aiAccuracy}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hybrid Model</span>
                  <div className="flex items-center gap-2">
                    <Progress value={mlStats.hybridAccuracy} className="w-24" />
                    <span className="text-sm font-medium">{mlStats.hybridAccuracy}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">ML Service</span>
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI Service</span>
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Response Time</span>
                  <Badge variant={mlStats.avgProcessingTime < 500 ? "default" : "destructive"}>
                    {mlStats.avgProcessingTime}ms
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ML Configuration</CardTitle>
              <CardDescription>Configure hybrid classification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">High Confidence Threshold</label>
                <div className="flex items-center gap-2">
                  <input type="range" min="0.5" max="1" step="0.1" defaultValue="0.8" className="flex-1" />
                  <span className="text-sm text-muted-foreground">80%</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Medium Confidence Threshold</label>
                <div className="flex items-center gap-2">
                  <input type="range" min="0.3" max="0.8" step="0.1" defaultValue="0.6" className="flex-1" />
                  <span className="text-sm text-muted-foreground">60%</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Enable AI Fallback</label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm text-muted-foreground">Use AI when ML confidence is low</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Enable Ensemble</label>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm text-muted-foreground">Combine ML and AI predictions</span>
                </div>
              </div>
              <Button className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

