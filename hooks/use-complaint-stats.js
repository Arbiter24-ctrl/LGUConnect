"use client"

import { useState, useEffect } from 'react'
import { useUser } from '../lib/user-context'

export function useComplaintStats() {
  const { user } = useUser()
  const [stats, setStats] = useState({
    today: 0,
    pending: 0,
    total: 0,
    resolved: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters based on user's barangay
      const params = new URLSearchParams()
      
      // If user has a barangay, filter by it
      // Note: Users have barangay as text, complaints have barangay_id as integer
      // We'll use barangay_name parameter to match by name
      if (user?.barangay) {
        params.append('barangay_name', user.barangay)
      }
      
      const response = await fetch(`/api/complaints/stats?${params.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        setStats(result.data)
      } else {
        setError(result.error || 'Failed to fetch stats')
        // Set default stats on error
        setStats({
          today: 0,
          pending: 0,
          total: 0,
          resolved: 0
        })
      }
    } catch (err) {
      console.error('Error fetching complaint stats:', err)
      setError('Network error while fetching stats')
      // Set default stats on error
      setStats({
        today: 0,
        pending: 0,
        total: 0,
        resolved: 0
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats when user changes or component mounts
  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  // Refresh function for manual updates
  const refresh = () => {
    if (user) {
      fetchStats()
    }
  }

  return {
    stats,
    loading,
    error,
    refresh
  }
}
