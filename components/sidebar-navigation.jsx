"use client"

import { useUser } from '../lib/user-context'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { 
  LogOut, 
  User, 
  Settings, 
  Shield, 
  FileText, 
  BarChart3,
  Menu,
  X,
  Home,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '../lib/utils'

export function SidebarNavigation({ className }) {
  const { user, logout } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      show: true,
    },
    {
      name: 'Manage Complaints',
      href: '/complaints',
      icon: MessageSquare,
      show: true,
    },
    {
      name: 'Trends',
      href: '/trend',
      icon: BarChart3,
      show: true,
    },
 
  ]

  const userMenuItems = [
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    }
  ]

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background/80 backdrop-blur-sm"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 border-r border-sidebar-border transform transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0",
        className
      )}
      style={{
        background: "linear-gradient(25deg, #187c19, #e0ffe7, #187c19)"
      }}>
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-sidebar-border flex-shrink-0">
            <Link href="/dashboard" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
              <Shield className="h-8 w-8 text-sidebar-primary" />
              <div>
                <h1 className="text-lg font-bold text-sidebar-primary">Admin Panel</h1>
                <p className="text-xs text-sidebar-foreground/70">Complaint Management</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              if (!item.show) return null
              
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          {user ? (
            <div className="p-4 border-t border-sidebar-border flex-shrink-0">
              {/* User info */}
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-sidebar-foreground">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70 truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70 capitalize">
                    {user.role}
                  </p>
                </div>
              </div>

              {/* User menu items */}
              <div className="space-y-1 mb-4">
                {userMenuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive 
                          ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Logout button */}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Log out
              </Button>
            </div>
          ) : (
            <div className="p-4 border-t border-sidebar-border space-y-2 flex-shrink-0">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign In
                </Link>
              </Button>
              <Button asChild size="sm" className="w-full">
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

