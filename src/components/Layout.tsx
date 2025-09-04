'use client'

/**
 * Layout Component - Wraps all pages with common elements
 * Provides Header, Footer, and main content structure
 */

import React from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import Header from './Header'
import Footer from './Footer'
import MessageContainer from './MessageContainer'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
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
