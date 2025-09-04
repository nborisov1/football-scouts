'use client'

/**
 * Header Component - Navigation and authentication
 * Preserves exact functionality from original header
 */

import React, { useState } from 'react'
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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700">
                פוטבול סקאוטינג
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 space-x-reverse">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
                דף הבית
              </Link>
              <Link href="/leaderboards" className="text-gray-700 hover:text-blue-600 font-medium">
                טבלאות מובילים
              </Link>
              <Link href="/training" className="text-gray-700 hover:text-blue-600 font-medium">
                תוכניות אימון
              </Link>
              <Link href="/challenges" className="text-gray-700 hover:text-blue-600 font-medium">
                אתגרים
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">
                אודות
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium">
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
                    className="flex items-center space-x-2 space-x-reverse bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <span>{user.name || 'החשבון שלי'}</span>
                    <i className="fas fa-user text-gray-500"></i>
                  </button>

                  {showUserDropdown && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        הפרופיל שלי
                      </Link>
                      <Link
                        href="/training"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        תוכנית האימון שלי
                      </Link>
                      <Link
                        href="/challenges"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        אתגרים
                      </Link>
                      {user.type === USER_TYPES.SCOUT && (
                        <Link
                          href="/watchlist"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          רשימת המעקב
                        </Link>
                      )}
                      {user.type === USER_TYPES.ADMIN && (
                        <>
                          <hr className="my-1" />
                          <Link
                            href="/admin"
                            className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <i className="fas fa-cog ml-2"></i>
                            פאנל ניהול
                          </Link>
                          <Link
                            href="/admin/videos"
                            className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            <i className="fas fa-video ml-2"></i>
                            ניהול סרטונים
                          </Link>
                        </>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
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
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    התחברות
                  </button>
                  <button
                    onClick={() => openRegistration()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    הרשמה
                  </button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <i className="fas fa-bars text-lg"></i>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-2">
                <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                  דף הבית
                </Link>
                <Link href="/leaderboards" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                  טבלאות מובילים
                </Link>
                <Link href="/training" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                  תוכניות אימון
                </Link>
                <Link href="/challenges" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                  אתגרים
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                  אודות
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium py-2">
                  צור קשר
                </Link>
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
          className="fixed inset-0 z-10" 
          onClick={() => {
            setShowUserDropdown(false)
            setShowMobileMenu(false)
          }}
        />
      )}
    </>
  )
}
