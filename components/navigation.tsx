"use client"

import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react'
import Link from 'next/link'

export function Navigation() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-primary">Barangay Complaint System</h1>
                <p className="text-sm text-muted-foreground">Community Service Portal</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Button asChild size="sm">
              <Link href="/login">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
