'use client'

/**
 * Layout Component - Wraps all pages with common elements
 * Provides Header, Footer, and main content structure
 */

import React, { useState, useEffect } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import Header from './Header'
import Footer from './Footer'
import MessageContainer from './MessageContainer'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-screen bg-stadium-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-field-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <i className="fas fa-futbol text-white text-xl"></i>
          </div>
          <p className="text-stadium-600">טוען...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-stadium-50 flex flex-col" dir="rtl">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <MessageContainer />
      </div>
    </AuthProvider>
  )
}
