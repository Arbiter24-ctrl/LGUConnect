"use client"

import { useState, useEffect } from 'react'
import { useUser } from '../lib/user-context'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { 
  MapPin, 
  Clock, 
  User, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Calendar,
  Building
} from 'lucide-react'

export default function CommunityStories() {
  const { user } = useUser()
  const [stories, setStories] = useState([])
  const [selectedStory, setSelectedStory] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchStories()
    }
  }, [user])

  const fetchStories = async () => {
    try {
      console.log('📸 Fetching community stories with real data...')
      
      // Get user's barangay ID for filtering
      let barangayId = null
      if (user?.barangay) {
        try {
          const barangaysResponse = await fetch("/api/barangays")
          const barangaysResult = await barangaysResponse.json()
          if (barangaysResult.success) {
            const userBarangay = barangaysResult.data.find(b => b.name === user.barangay)
            if (userBarangay) {
              barangayId = userBarangay.id
              console.log('📍 Community Stories: User barangay ID found:', barangayId, 'for barangay:', user.barangay)
            } else {
              console.warn('📍 Community Stories: User barangay not found in database:', user.barangay)
            }
          }
        } catch (error) {
          console.error('📍 Community Stories: Error fetching barangays:', error)
        }
      }

      // Build API URL with barangay filtering
      let apiUrl = '/api/complaints/with-attachments?hours=48&limit=20'
      if (barangayId) {
        apiUrl += `&barangay_id=${barangayId}`
        console.log('📍 Community Stories: Filtering by barangay_id:', barangayId)
      } else {
        console.log('📍 Community Stories: No barangay filtering applied')
      }
      
      // Fetch recent complaints with attachments (last 48 hours)
      const response = await fetch(apiUrl)
      const data = await response.json()
      
      console.log('📸 Community Stories API response:', data)
      
      if (data.success && data.data && data.data.length > 0) {
        // Transform the real data into stories format
        const storiesData = data.data.map(complaint => ({
          id: complaint.id,
          title: complaint.title,
          description: complaint.description,
          category: complaint.category_name,
          categoryColor: complaint.category_color,
          priority: complaint.priority,
          status: complaint.status,
          location: complaint.location_address || complaint.barangay_name,
          department: complaint.suggested_department || 'Administrative Office',
          estimatedDays: complaint.estimated_resolution_days || 7,
          submittedBy: complaint.anonymous_name || 
                      (complaint.first_name && complaint.last_name ? 
                       `${complaint.first_name} ${complaint.last_name}` : 'Anonymous'),
          createdAt: complaint.created_at,
          attachments: complaint.attachments || []
        }))
        
        console.log(`📸 Processed ${storiesData.length} real stories`)
        setStories(storiesData)
      } else {
        console.log('📸 No complaints with attachments found, using fallback data')
        // Fallback: fetch recent complaints without attachment requirement
        let fallbackUrl = '/api/complaints?limit=10'
        if (barangayId) {
          fallbackUrl += `&barangay_id=${barangayId}`
        }
        const fallbackResponse = await fetch(fallbackUrl)
        const fallbackData = await fallbackResponse.json()
        
        if (fallbackData.success && fallbackData.data) {
          // Filter for recent complaints (last 48 hours) and add mock attachments
          const now = new Date()
          const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)
          
          const recentComplaints = fallbackData.data.filter(complaint => {
            const complaintDate = new Date(complaint.created_at)
            return complaintDate >= twoDaysAgo
          }).slice(0, 6)
          
          const fallbackStories = recentComplaints.map(complaint => ({
            id: complaint.id,
            title: complaint.title,
            description: complaint.description,
            category: complaint.category_name,
            categoryColor: complaint.category_color,
            priority: complaint.priority,
            status: complaint.status,
            location: complaint.location_address || complaint.barangay_name,
            department: complaint.suggested_department || 'Administrative Office',
            estimatedDays: complaint.estimated_resolution_days || 7,
            submittedBy: complaint.anonymous_name || 
                        (complaint.first_name && complaint.last_name ? 
                         `${complaint.first_name} ${complaint.last_name}` : 'Anonymous'),
            createdAt: complaint.created_at,
            // Add placeholder attachment for demo
            attachments: [
              {
                id: 1,
                type: 'image',
                url: '/placeholder.jpg',
                caption: complaint.title
              }
            ]
          }))
          
          console.log(`📸 Using ${fallbackStories.length} fallback stories`)
          setStories(fallbackStories)
        } else {
          // Ultimate fallback with demo data
          setStories([
            {
              id: 1,
              title: "Broken streetlight on Main Street",
              description: "The streetlight has been broken for 3 days, making it unsafe at night.",
              category: "Infrastructure",
              categoryColor: "#3b82f6",
              priority: "high",
              status: "submitted",
              location: "Main Street, Barangay Centro",
              department: "Engineering Department",
              estimatedDays: 3,
              submittedBy: "Maria Santos",
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              attachments: [{ id: 1, type: 'image', url: '/placeholder.jpg', caption: 'Broken streetlight' }]
            }
          ])
        }
      }
    } catch (error) {
      console.error('📸 Error fetching community stories:', error)
      // Final fallback with demo data
      setStories([
        {
          id: 1,
          title: "Broken streetlight on Main Street",
          description: "The streetlight has been broken for 3 days, making it unsafe at night.",
          category: "Infrastructure",
          categoryColor: "#3b82f6",
          priority: "high",
          status: "submitted",
          location: "Main Street, Barangay Centro",
          department: "Engineering Department",
          estimatedDays: 3,
          submittedBy: "Maria Santos",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          attachments: [{ id: 1, type: 'image', url: '/placeholder.jpg', caption: 'Broken streetlight' }]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'bg-blue-500'
      case 'in_progress': return 'bg-yellow-500'
      case 'resolved': return 'bg-green-500'
      case 'closed': return 'bg-gray-500'
      default: return 'bg-blue-500'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const nextImage = () => {
    if (selectedStory && selectedStory.attachments.length > 1) {
      setCurrentImageIndex((prev) => 
        (prev + 1) % selectedStory.attachments.length
      )
    }
  }

  const prevImage = () => {
    if (selectedStory && selectedStory.attachments.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedStory.attachments.length - 1 : prev - 1
      )
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="animate-pulse">
              <div className="flex space-x-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-gray-300 rounded-full"></div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Community Reports</h3>
            <span className="text-sm text-muted-foreground">Last 48 hours</span>
          </div>
          
          {stories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recent reports with evidence</p>
            </div>
          ) : (
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="flex-shrink-0 cursor-pointer group"
                  onClick={() => {
                    setSelectedStory(story)
                    setCurrentImageIndex(0)
                  }}
                >
                  <div className="relative">
                    {/* Story Ring */}
                    <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-purple-500 group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                      <div className="w-full h-full rounded-full bg-white p-1">
                        <div 
                          className="w-full h-full rounded-full bg-cover bg-center"
                          style={{ 
                            backgroundImage: `url(${story.attachments[0]?.url || '/placeholder.jpg'})` 
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Status Indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${getStatusColor(story.status)} border-2 border-white flex items-center justify-center`}>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    
                    {/* Priority Badge */}
                    {story.priority === 'urgent' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white">
                        <div className="w-full h-full bg-red-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Story Info */}
                  <div className="mt-2 text-center max-w-[80px]">
                    <p className="text-xs font-medium truncate">{story.category}</p>
                    <p className="text-xs text-muted-foreground">{formatTimeAgo(story.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Story Detail Modal */}
      <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
        <DialogContent className="max-w-[95vw] w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto max-h-[95vh] overflow-y-auto">
          {selectedStory && (
            <>
              <DialogHeader className="pb-4">
                <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-base sm:text-lg font-semibold pr-2 break-words">{selectedStory.title}</span>
                  <Badge 
                    variant="outline" 
                    style={{ borderColor: selectedStory.categoryColor }}
                    className="self-start sm:self-center flex-shrink-0"
                  >
                    {selectedStory.category}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 sm:space-y-6">
                {/* Image Carousel */}
                <div className="relative">
                  <div className="aspect-square sm:aspect-video bg-gray-100 rounded-lg overflow-hidden max-h-[50vh] sm:max-h-[60vh]">
                    <img
                      src={selectedStory.attachments[currentImageIndex]?.url || '/placeholder.jpg'}
                      alt={selectedStory.attachments[currentImageIndex]?.caption}
                      className="w-full h-full object-contain sm:object-cover"
                    />
                  </div>
                  
                  {selectedStory.attachments.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 h-8 w-8 sm:h-10 sm:w-10 p-0"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 h-8 w-8 sm:h-10 sm:w-10 p-0"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      
                      {/* Image Indicators */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {selectedStory.attachments.map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Story Details */}
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{selectedStory.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div className="flex items-center space-x-2 min-w-0">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{selectedStory.location}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 min-w-0">
                      <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{selectedStory.submittedBy}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 min-w-0">
                      <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{selectedStory.department}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 min-w-0">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="whitespace-nowrap">Est. {selectedStory.estimatedDays} days</span>
                    </div>
                  </div>
                  
                  {/* Status and Priority */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <Badge className={`${getStatusColor(selectedStory.status)} text-white text-xs sm:text-sm px-2 py-1`}>
                      {selectedStory.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    
                    <Badge className={`${getPriorityColor(selectedStory.priority)} text-white text-xs sm:text-sm px-2 py-1`}>
                      {selectedStory.priority.toUpperCase()} PRIORITY
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    <span>Submitted {formatTimeAgo(selectedStory.createdAt)}</span>
                  </div>
                </div>
                
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
