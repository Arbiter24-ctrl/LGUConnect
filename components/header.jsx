"use client"

import { useUser } from '../lib/user-context'
import { Button } from './ui/button'
import { Avatar, AvatarFallback } from './ui/avatar'
import { 
  User,
  Home,
  MessageSquare,
  BarChart3,
  Settings,
  FileText,
  LogOut,
  ChevronDown
} from 'lucide-react'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
// Removed dropdown menu imports - using custom dropdown

export function Header({ className = "" }) {
  const { user, logout } = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleLogout = async () => {
    // Immediately redirect to prevent any delay
    window.location.href = '/login'
    
    // Clear state in background
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const closeDropdown = () => {
    setIsDropdownOpen(false)
  }

  // Define page titles and descriptions
  const getPageInfo = (path) => {
    const pageMap = {
      '/dashboard': {
        title: 'Dashboard',
        description: 'Overview and Analytics',
        icon: Home
      },
      '/complaints': {
        title: 'Manage Complaints',
        description: 'View and manage all complaints',
        icon: MessageSquare
      },
      '/trend': {
        title: 'Trends & Analytics',
        description: 'Complaint trends and insights',
        icon: BarChart3
      },
      '/profile': {
        title: 'Profile',
        description: 'Manage your account',
        icon: User
      },
      '/settings': {
        title: 'Settings',
        description: 'System configuration',
        icon: Settings
      },
      '/admin/ml-monitoring': {
        title: 'ML Monitoring',
        description: 'AI model performance',
        icon: FileText
      }
    }
    
    return pageMap[path] || {
      title: 'Dashboard',
      description: 'Overview and Analytics',
      icon: Home
    }
  }

  const pageInfo = getPageInfo(pathname)
  const IconComponent = pageInfo.icon

  return (
    <header className={`bg-[#187c19] text-white shadow-lg fixed top-0 right-0 left-0 lg:left-64 z-40 ${className}`}>
      <div className="flex items-center justify-between px-6 py-2">
        {/* Left side - Page title with icon */}
        <div className="flex items-center space-x-3">
          <IconComponent className="h-5 w-5" />
          <div>
            <h1 className="text-lg font-semibold">{pageInfo.title}</h1>
            <p className="text-xs text-white/80">{pageInfo.description}</p>
          </div>
        </div>

        {/* Right side - User dropdown */}
        <div className="flex items-center space-x-4">
          {/* User dropdown */}
          {user && (
            <div className="relative">
              <Button
                variant="ghost"
                onClick={toggleDropdown}
                className="flex items-center space-x-2 text-white hover:bg-white/10 p-1.5"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-white/20 text-white text-xs">
                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-white/70 capitalize">
                    {user.role}
                  </p>
                </div>
                <ChevronDown className={`h-3 w-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              {/* Custom Dropdown */}
              {isDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={closeDropdown}
                  />
                  
                  {/* Dropdown Content */}
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    
                    <div className="py-1">
                      <Link 
                        href="/profile" 
                        onClick={closeDropdown}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                      
                      <Link 
                        href="/settings" 
                        onClick={closeDropdown}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                      
                      <div className="border-t border-gray-100 my-1" />
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
