"use client"

import { UserProvider } from '../lib/user-context'
import { ThemeProvider } from './theme-provider'

export function ClientProviders({ children }) {
  return (
    <ThemeProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </ThemeProvider>
  )
}
