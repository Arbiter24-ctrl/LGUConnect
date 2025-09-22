"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from './types'

const UserContext = createContext(undefined)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = async () => {
    // Set logging out state immediately
    setIsLoggingOut(true)
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('session')
    localStorage.removeItem('token')
    localStorage.removeItem('auth')
    
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
      // Continue with logout even if API fails
    } finally {
      setIsLoggingOut(false)
    }
  }

  const refreshUser = async () => {
    try {
      console.log('🔄 UserContext: Fetching user data...')
      
      // First try to get user from localStorage as fallback
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        console.log('📱 UserContext: Found stored user:', JSON.parse(storedUser))
        setUser(JSON.parse(storedUser))
        setLoading(false) // Don't wait for API call if we have stored user
        return
      }
      
      console.log('🌐 UserContext: Making API call to /api/auth/me')
      
      // Get session token from localStorage
      const sessionToken = localStorage.getItem('session')
      const headers = {
        'Content-Type': 'application/json',
      }
      
      // Add session token to headers if available
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`
      }
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include', // Ensure cookies are sent
        headers,
      })
      
      console.log('📡 UserContext: API response status:', response.status)
      const result = await response.json()
      
      console.log('👤 UserContext: API response:', result)
      
      if (result.success) {
        console.log('✅ UserContext: User found:', result.data.user)
        setUser(result.data.user)
        // Store user in localStorage as backup
        localStorage.setItem('user', JSON.stringify(result.data.user))
      } else {
        console.log('❌ UserContext: No user found')
        setUser(null)
        localStorage.removeItem('user')
        localStorage.removeItem('session')
      }
    } catch (error) {
      console.error('❌ UserContext: Error fetching user:', error)
      setUser(null)
      localStorage.removeItem('user')
      localStorage.removeItem('session')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, isLoggingOut, login, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
