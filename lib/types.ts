// Type definitions for the complaint management system

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: "resident" | "official" | "admin"
  barangay?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface ComplaintCategory {
  id: number
  name: string
  description?: string
  color: string
  created_at: string
}

export interface Complaint {
  id: number
  user_id: number
  category_id: number
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "submitted" | "in_progress" | "resolved" | "closed"
  location_lat?: number
  location_lng?: number
  location_address?: string
  assigned_to?: number
  resolution_notes?: string
  resolved_at?: string
  created_at: string
  updated_at: string

  // Joined data
  category?: ComplaintCategory
  user?: User
  assigned_official?: User
  attachments?: ComplaintAttachment[]
}

export interface ComplaintAttachment {
  id: number
  complaint_id: number
  file_path: string
  file_type: "image" | "video"
  file_size?: number
  created_at: string
}

export interface ComplaintStatusHistory {
  id: number
  complaint_id: number
  old_status?: string
  new_status: string
  changed_by: number
  notes?: string
  created_at: string
  changed_by_user?: User
}

export interface AIClassification {
  id: number
  complaint_id: number
  original_category_id?: number
  ai_suggested_category_id: number
  ai_suggested_priority: "low" | "medium" | "high"
  confidence_score?: number
  model_version?: string
  created_at: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Dashboard analytics types
export interface ComplaintStats {
  total: number
  submitted: number
  in_progress: number
  resolved: number
  closed: number
  by_category: Array<{
    category: string
    count: number
    color: string
  }>
  by_priority: Array<{
    priority: string
    count: number
  }>
  recent_trends: Array<{
    date: string
    count: number
  }>
}
