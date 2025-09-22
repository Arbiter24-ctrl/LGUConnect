"use client"

import { SidebarNavigation } from './sidebar-navigation'
import { useUser } from '../lib/user-context'
import { usePathname } from 'next/navigation'

export function MainLayout({ children }) {
  const { user, loading, isLoggingOut } = useUser()
  const pathname = usePathname()

  // Pages that should not have sidebar navigation
  const noSidebarPages = ['/login', '/register', '/']
  const shouldShowSidebar = user && !noSidebarPages.includes(pathname)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is not logged in and on a protected page, redirect to login
  if (!user && !noSidebarPages.includes(pathname) && !isLoggingOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Please log in to access this page.</p>
          <a 
            href="/login" 
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  // If logging out, show loading or redirect immediately
  if (isLoggingOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Logging out...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {shouldShowSidebar && <SidebarNavigation />}
      <main className={shouldShowSidebar ? "lg:ml-64" : ""}>
        {children}
      </main>
    </div>
  )
}
