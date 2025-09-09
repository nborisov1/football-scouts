'use client'

import React from 'react'
import ProtectedRoute from './ProtectedRoute'

interface PageLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  showStats?: boolean
  stats?: Array<{
    number: string | number
    label: string
    icon?: string
  }>
  headerActions?: React.ReactNode
  loading?: boolean
  error?: string
  onRetry?: () => void
  requiresAuth?: boolean
  requiresRole?: string
  comingSoon?: {
    title: string
    description: string
    icon?: string
    features?: string[]
    expectedDate?: string
  }
}

/**
 * Centralized page layout component that provides consistent styling,
 * header structure, and common functionality across all pages.
 * 
 * Features:
 * - Consistent green theme background
 * - Standard header with title/subtitle
 * - Optional stats cards in header
 * - Loading and error states
 * - Coming soon functionality
 * - Authentication protection
 */
export default function PageLayout({
  children,
  title,
  subtitle,
  showStats = false,
  stats = [],
  headerActions,
  loading = false,
  error,
  onRetry,
  requiresAuth = true,
  requiresRole,
  comingSoon
}: PageLayoutProps) {

  // Loading state
  if (loading) {
    const loadingContent = (
      <div className="page-wrapper">
        <div className="page-loading">
          <div className="text-center">
            <div className="loading-spinner"></div>
            <p className="mt-4 text-gray-600">טוען...</p>
          </div>
        </div>
      </div>
    )

    return requiresAuth ? (
      <ProtectedRoute requiresRole={requiresRole}>
        {loadingContent}
      </ProtectedRoute>
    ) : loadingContent
  }

  // Error state
  if (error) {
    const errorContent = (
      <div className="page-wrapper">
        <div className="page-error">
          <div className="page-container-narrow">
            <i className="fas fa-exclamation-triangle error-icon"></i>
            <h2 className="error-title">שגיאה בטעינת הנתונים</h2>
            <p className="error-message">{error}</p>
            {onRetry && (
              <button onClick={onRetry} className="btn-page-primary">
                <i className="fas fa-redo"></i>
                נסה שוב
              </button>
            )}
          </div>
        </div>
      </div>
    )

    return requiresAuth ? (
      <ProtectedRoute requiresRole={requiresRole}>
        {errorContent}
      </ProtectedRoute>
    ) : errorContent
  }

  // Coming soon state
  if (comingSoon) {
    const comingSoonContent = (
      <div className="page-wrapper">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-content">
            <h1 className="page-title">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
        </div>

        {/* Coming Soon Content */}
        <div className="page-coming-soon">
          <div className="page-container-narrow">
            <i className={`${comingSoon.icon || 'fas fa-clock'} coming-soon-icon`}></i>
            <h2 className="coming-soon-title">{comingSoon.title}</h2>
            <p className="coming-soon-description">{comingSoon.description}</p>
            
            {comingSoon.features && comingSoon.features.length > 0 && (
              <div className="page-card mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">תכונות מתוכננות:</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-right">
                  {comingSoon.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <i className="fas fa-check-circle text-green-500 ml-2"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {comingSoon.expectedDate && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <i className="fas fa-calendar-alt ml-2"></i>
                      צפוי להיות זמין: {comingSoon.expectedDate}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button 
              onClick={() => alert('נודיע לך ברגע שהתכונה תהיה זמינה!')}
              className="btn-page-primary mt-6"
            >
              <i className="fas fa-bell"></i>
              הודע לי כשיהיה זמין
            </button>
          </div>
        </div>
      </div>
    )

    return requiresAuth ? (
      <ProtectedRoute requiresRole={requiresRole}>
        {comingSoonContent}
      </ProtectedRoute>
    ) : comingSoonContent
  }

  // Main content
  const mainContent = (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="page-title">{title}</h1>
              {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
            {headerActions && (
              <div className="mt-2">
                {headerActions}
              </div>
            )}
          </div>

          {/* Stats Section */}
          {showStats && stats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {stats.map((stat, index) => (
                <div key={index} className="stats-card">
                  <div className="stats-number">
                    {stat.icon && <i className={`${stat.icon} ml-2`}></i>}
                    {stat.number}
                  </div>
                  <div className="stats-label">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="page-content">
        {children}
      </div>
    </div>
  )

  return requiresAuth ? (
    <ProtectedRoute requiresRole={requiresRole}>
      {mainContent}
    </ProtectedRoute>
  ) : mainContent
}

// Additional utility components for common page patterns

export const PageSection: React.FC<{
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}> = ({ children, className = '', size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'page-section-sm' : size === 'lg' ? 'page-section-lg' : 'page-section'
  
  return (
    <div className={`${sizeClass} ${className}`}>
      {children}
    </div>
  )
}

export const PageContainer: React.FC<{
  children: React.ReactNode
  className?: string
  size?: 'narrow' | 'normal' | 'wide'
}> = ({ children, className = '', size = 'normal' }) => {
  const sizeClass = 
    size === 'narrow' ? 'page-container-narrow' : 
    size === 'wide' ? 'page-container-wide' : 
    'page-container'
  
  return (
    <div className={`${sizeClass} ${className}`}>
      {children}
    </div>
  )
}

export const PageCard: React.FC<{
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'flat'
  hover?: boolean
}> = ({ children, className = '', variant = 'default', hover = true }) => {
  const baseClass = variant === 'flat' ? 'page-card-flat' : 'page-card'
  const hoverClass = hover ? '' : 'hover:transform-none hover:shadow-none'
  
  return (
    <div className={`${baseClass} ${hoverClass} ${className}`}>
      {children}
    </div>
  )
}
