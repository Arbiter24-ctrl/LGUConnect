"use client"

import { useUser } from '../lib/user-context'
import { Button } from '../components/ui/button'
import { 
  Shield, 
  FileText, 
  BarChart3,
  Menu,
  X,
  Home,
  MessageSquare,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '../lib/utils'
import Image from 'next/image'

export function SidebarNavigation({ className }) {
  const { user } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navigationCategories = [
    {
      title: 'Main',
      items: [
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
          name: 'Trends & Analytics',
          href: '/trend',
          icon: BarChart3,
          show: true,
        },
      ]
    },
    {
      title: 'Management',
      items: [
        {
          name: 'User Management',
          href: '/users',
          icon: Users,
          show: user?.role === 'admin',
        },
        {
          name: 'Reports',
          href: '/reports',
          icon: FileText,
          show: true,
        },
      ]
    }
  ]

  // Quick actions removed

  // User menu items removed - now available in header dropdown

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
            <Link href="/dashboard" className="flex items-center space-x-3" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/Lguconnect.png"
                  alt="LGU Connect Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-primary">Admin Panel</h1>
                <p className="text-xs text-sidebar-foreground/70">Complaint Management</p>
              </div>
            </Link>
          </div>

          {/* Quick Stats */}
          {user && (
            <div className="px-4 py-3 border-b border-sidebar-border">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">12</div>
                  <div className="text-xs text-white/70">Today's</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-white">8</div>
                  <div className="text-xs text-white/70">Pending</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
            {navigationCategories.map((category) => {
              const visibleItems = category.items.filter(item => item.show)
              if (visibleItems.length === 0) return null
              
              return (
                <div key={category.title} className="space-y-2">
                  <h3 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider px-3">
                    {category.title}
                  </h3>
                  <div className="space-y-1">
                    {visibleItems.map((item) => {
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
                  </div>
                </div>
              )
            })}
          </nav>

          {/* Quick Actions removed */}

          {/* User section removed - now available in header dropdown */}
          {!user && (
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

