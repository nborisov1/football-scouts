'use client'

/**
 * Protected Route Component - Ensures only authenticated users can access certain pages
 */

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from './MessageContainer'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      showMessage('יש להתחבר כדי לצפות בעמוד זה', 'error')
      
      // Redirect to homepage after a short delay to show the message
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
  }, [user, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-field-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <i className="fas fa-futbol text-white text-xl"></i>
          </div>
          <p className="text-stadium-600">בודק הרשאות...</p>
        </div>
      </div>
    )
  }

  // Show fallback or redirect if not authenticated
  if (!user) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-field-gradient rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-lock text-white text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-stadium-900 mb-4">דרושה התחברות</h2>
          <p className="text-stadium-600 mb-6">
            עמוד זה זמין רק למשתמשים רשומים. אנא התחבר או הירשם כדי להמשיך.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => router.push('/')}
              className="bg-field-gradient text-white px-6 py-3 rounded-xl font-display font-bold hover:shadow-stadium-glow transition-all duration-300"
            >
              חזור לעמוד הבית
            </button>
          </div>
        </div>
      </div>
    )
  }

  // User is authenticated, render the protected content
  return <>{children}</>
}
