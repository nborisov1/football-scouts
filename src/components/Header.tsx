'use client'

/**
 * Header Component - Navigation and authentication
 * Preserves exact functionality from original header
 */

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { USER_TYPES } from '@/lib/firebase'
import LoginModal from './modals/LoginModal'
import RegistrationModal from './modals/RegistrationModal'

export default function Header() {
  const { user, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [registrationType, setRegistrationType] = useState<'player' | 'scout' | null>(null)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      setShowUserDropdown(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const openRegistration = (type?: 'player' | 'scout') => {
    setRegistrationType(type || null)
    setShowRegistrationModal(true)
    setShowLoginModal(false)
  }

  const openLogin = () => {
    setShowLoginModal(true)
    setShowRegistrationModal(false)
  }

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md shadow-stadium border-b border-field-200/30 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="group flex items-center space-x-3 space-x-reverse">
                <div className="relative">
                  <div className="w-12 h-12 bg-field-gradient rounded-full flex items-center justify-center shadow-stadium-glow group-hover:animate-glow transition-all duration-300">
                    <i className="fas fa-futbol text-white text-xl"></i>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-display font-bold text-gradient-field">
                    פוטבול סקאוטינג
                  </span>
                  <span className="text-xs text-field-600 font-medium tracking-wide">
                    FOOTBALL SCOUTING
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 space-x-reverse">
              <Link href="/" className="nav-link relative px-4 py-2 rounded-lg transition-all duration-300 hover:bg-field-50">
                <i className="fas fa-home ml-2 text-field-500"></i>
                דף הבית
              </Link>
              {/* Protected Links - Only show for authenticated users */}
              {user && (
                <>
                  <Link href="/leaderboards" className="nav-link relative px-4 py-2 rounded-lg transition-all duration-300 hover:bg-field-50">
                    <i className="fas fa-trophy ml-2 text-accent-500"></i>
                    טבלאות מובילים
                  </Link>
                  <Link href="/training" className="nav-link relative px-4 py-2 rounded-lg transition-all duration-300 hover:bg-field-50">
                    <i className="fas fa-dumbbell ml-2 text-field-500"></i>
                    תוכניות אימון
                  </Link>
                  <Link href="/challenges" className="nav-link relative px-4 py-2 rounded-lg transition-all duration-300 hover:bg-field-50">
                    <i className="fas fa-bullseye ml-2 text-field-600 text-lg"></i>
                    אתגרים
                  </Link>
                </>
              )}
              <Link href="/about" className="nav-link relative px-4 py-2 rounded-lg transition-all duration-300 hover:bg-field-50">
                <i className="fas fa-info-circle ml-2 text-field-500"></i>
                אודות
              </Link>
              <Link href="/contact" className="nav-link relative px-4 py-2 rounded-lg transition-all duration-300 hover:bg-field-50">
                <i className="fas fa-envelope ml-2 text-field-500"></i>
                צור קשר
              </Link>
            </nav>

            {/* Auth Buttons / User Menu */}
            <div className="flex items-center space-x-4 space-x-reverse">
              {user ? (
                // Authenticated User Menu
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-3 space-x-reverse bg-white/80 backdrop-blur-sm border border-field-200 rounded-xl px-6 py-3 text-sm font-medium text-stadium-700 hover:bg-field-50 hover:border-field-300 focus:outline-none focus:ring-2 focus:ring-field-500 transition-all duration-300 shadow-stadium"
                  >
                    <span className="font-display font-semibold">{user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'החשבון שלי'}</span>
                    <div className="w-8 h-8 bg-field-gradient rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-white text-sm"></i>
                    </div>
                    <i className="fas fa-chevron-down text-field-400 text-xs"></i>
                  </button>

                  {showUserDropdown && (
                    <div className="absolute left-0 mt-3 w-56 bg-white/95 backdrop-blur-lg rounded-xl shadow-stadium border border-field-200/50 py-2 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-field-100">
                        <p className="text-sm font-medium text-stadium-900">{user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim()}</p>
                        <p className="text-xs text-field-600 capitalize">
                          {user.type === USER_TYPES.PLAYER && '⚽ שחקן'}
                          {user.type === USER_TYPES.SCOUT && '🔍 סקאוט'}
                          {user.type === USER_TYPES.ADMIN && '👑 מנהל'}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-3 text-sm text-stadium-700 hover:bg-field-50 hover:text-field-700 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <i className="fas fa-user-circle ml-3 text-field-500"></i>
                        הפרופיל שלי
                      </Link>
                      <Link
                        href="/training"
                        className="flex items-center px-4 py-3 text-sm text-stadium-700 hover:bg-field-50 hover:text-field-700 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <i className="fas fa-dumbbell ml-3 text-field-500"></i>
                        תוכנית האימון שלי
                      </Link>
                      <Link
                        href="/challenges"
                        className="flex items-center px-4 py-3 text-sm text-stadium-700 hover:bg-field-50 hover:text-field-700 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <i className="fas fa-bullseye ml-3 text-field-600 text-base"></i>
                        אתגרים
                      </Link>
                      {user.type === USER_TYPES.SCOUT && (
                        <Link
                          href="/watchlist"
                          className="flex items-center px-4 py-3 text-sm text-stadium-700 hover:bg-field-50 hover:text-field-700 transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <i className="fas fa-bookmark ml-3 text-field-500"></i>
                          רשימת המעקב
                        </Link>
                      )}
                      {user.type === USER_TYPES.ADMIN && (
                        <>
                          <div className="border-t border-field-100 my-2"></div>
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-3 text-sm text-accent-600 hover:bg-accent-50 hover:text-accent-700 transition-colors"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <i className="fas fa-cog ml-3"></i>
                            פאנל ניהול
                          </Link>
                          <Link
                            href="/admin/videos"
                            className="flex items-center px-4 py-3 text-sm text-accent-600 hover:bg-accent-50 hover:text-accent-700 transition-colors"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <i className="fas fa-video ml-3"></i>
                            ניהול סרטונים
                          </Link>
                        </>
                      )}
                      <div className="border-t border-field-100 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        <i className="fas fa-sign-out-alt ml-3"></i>
                        התנתק
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Guest User Buttons
                <div className="flex items-center space-x-3 space-x-reverse">
                  <button
                    onClick={openLogin}
                    className="btn-secondary text-sm px-6 py-3 font-display hover:shadow-stadium transition-all duration-300"
                  >
                    <i className="fas fa-sign-in-alt ml-2"></i>
                    התחברות
                  </button>
                  <button
                    onClick={() => openRegistration()}
                    className="btn-primary text-sm px-6 py-3 font-display hover:shadow-stadium-glow transition-all duration-300"
                  >
                    <i className="fas fa-user-plus ml-2"></i>
                    הרשמה
                  </button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-3 rounded-xl text-field-600 hover:text-field-700 hover:bg-field-50 focus:outline-none focus:ring-2 focus:ring-field-500 transition-all duration-300"
              >
                <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'} text-xl`}></i>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden py-6 border-t border-field-200/50 bg-white/95 backdrop-blur-md">
              <nav className="flex flex-col space-y-1">
                <Link 
                  href="/" 
                  className="flex items-center px-4 py-3 text-stadium-700 hover:text-field-700 hover:bg-field-50 font-medium rounded-lg mx-2 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <i className="fas fa-home ml-3 text-field-500"></i>
                  דף הבית
                </Link>
                {/* Protected Mobile Links - Only show for authenticated users */}
                {user && (
                  <>
                    <Link 
                      href="/leaderboards" 
                      className="flex items-center px-4 py-3 text-stadium-700 hover:text-field-700 hover:bg-field-50 font-medium rounded-lg mx-2 transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <i className="fas fa-trophy ml-3 text-accent-500"></i>
                      טבלאות מובילים
                    </Link>
                    <Link 
                      href="/training" 
                      className="flex items-center px-4 py-3 text-stadium-700 hover:text-field-700 hover:bg-field-50 font-medium rounded-lg mx-2 transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <i className="fas fa-dumbbell ml-3 text-field-500"></i>
                      תוכניות אימון
                    </Link>
                    <Link 
                      href="/challenges" 
                      className="flex items-center px-4 py-3 text-stadium-700 hover:text-field-700 hover:bg-field-50 font-medium rounded-lg mx-2 transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <i className="fas fa-bullseye ml-3 text-field-600 text-lg"></i>
                      אתגרים
                    </Link>
                  </>
                )}
                <Link 
                  href="/about" 
                  className="flex items-center px-4 py-3 text-stadium-700 hover:text-field-700 hover:bg-field-50 font-medium rounded-lg mx-2 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <i className="fas fa-info-circle ml-3 text-field-500"></i>
                  אודות
                </Link>
                <Link 
                  href="/contact" 
                  className="flex items-center px-4 py-3 text-stadium-700 hover:text-field-700 hover:bg-field-50 font-medium rounded-lg mx-2 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <i className="fas fa-envelope ml-3 text-field-500"></i>
                  צור קשר
                </Link>
                
                {/* Mobile Auth Buttons for Guests */}
                {!user && (
                  <div className="px-4 py-4 border-t border-field-200/50 mt-4 space-y-3">
                    <button
                      onClick={() => {
                        openLogin()
                        setShowMobileMenu(false)
                      }}
                      className="w-full btn-secondary text-sm py-3 font-display"
                    >
                      <i className="fas fa-sign-in-alt ml-2"></i>
                      התחברות
                    </button>
                    <button
                      onClick={() => {
                        openRegistration()
                        setShowMobileMenu(false)
                      }}
                      className="w-full btn-primary text-sm py-3 font-display"
                    >
                      <i className="fas fa-user-plus ml-2"></i>
                      הרשמה
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => openRegistration()}
      />
      <RegistrationModal 
        isOpen={showRegistrationModal} 
        onClose={() => setShowRegistrationModal(false)}
        onSwitchToLogin={openLogin}
        initialType={registrationType}
      />

      {/* Click outside to close dropdowns */}
      {(showUserDropdown || showMobileMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowUserDropdown(false)
            setShowMobileMenu(false)
          }}
        />
      )}
    </>
  )
}
