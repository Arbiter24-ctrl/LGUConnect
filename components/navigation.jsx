"use client"

import { Button } from '../components/ui/button'
import { Shield, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import Image from 'next/image'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center space-x-3 group">
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
              <h1 className="text-xl font-bold text-primary group-hover:text-primary/80 transition-colors">
                Barangay Complaint System
              </h1>
              <p className="text-sm text-muted-foreground">Community Service Portal</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="#submit-complaint" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Submit Complaint
            </Link>
            <Link href="/track" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Track Complaint
            </Link>
            <Link href="/trend" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Analytics
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Barangay Login</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="#submit-complaint" 
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Submit Complaint
              </Link>
              <Link 
                href="/track" 
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Track Complaint
              </Link>
              <Link 
                href="/trend" 
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Analytics
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <Button asChild variant="ghost" size="sm" className="justify-start">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>Barangay Login</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
