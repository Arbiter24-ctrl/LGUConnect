"use client"

import { UserProvider } from '../lib/user-context'

export function ClientProviders({ children }) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  )
}
