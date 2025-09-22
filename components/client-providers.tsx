"use client"

import { UserProvider } from '@/lib/user-context'

interface ClientProvidersProps {
  children: React.ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  )
}
