'use client'

/**
 * Login Modal - User authentication modal
 * Preserves functionality from original login modal
 */

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '../MessageContainer'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToRegister: () => void
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      showMessage('נא למלא את כל השדות', 'error')
      return
    }

    setIsLoading(true)
    
    try {
      showMessage('מתחבר...', 'info')
      await login(formData.email, formData.password)
      showMessage('התחברת בהצלחה!', 'success')
      onClose()
      
      // Reset form
      setFormData({ email: '', password: '' })
    } catch (error: any) {
      console.error('Login error:', error)
      showMessage(error.message || 'שגיאה בהתחברות', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchToRegister = () => {
    setFormData({ email: '', password: '' })
    onSwitchToRegister()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-stadium border border-field-200/50" dir="rtl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-field-gradient rounded-full flex items-center justify-center shadow-stadium-glow">
              <i className="fas fa-sign-in-alt text-white"></i>
            </div>
            <h2 className="text-2xl font-display font-bold text-stadium-900">התחברות</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stadium-100 hover:bg-stadium-200 text-stadium-600 hover:text-stadium-800 transition-all duration-300 flex items-center justify-center"
            aria-label="סגור"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-display font-semibold text-stadium-700 mb-2">
              <i className="fas fa-envelope ml-2 text-field-500"></i>
              אימייל
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border-2 border-field-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-field-500 focus:border-field-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              placeholder="הזן את כתובת האימייל שלך"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-display font-semibold text-stadium-700 mb-2">
              <i className="fas fa-lock ml-2 text-field-500"></i>
              סיסמה
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border-2 border-field-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-field-500 focus:border-field-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              placeholder="הזן את הסיסמה שלך"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-4 text-lg font-display font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner animate-spin"></i>
                <span>מתחבר...</span>
              </>
            ) : (
              <>
                <i className="fas fa-futbol"></i>
                <span>התחבר</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <div className="border-t border-field-200 pt-6">
            <p className="text-sm text-stadium-600 mb-4">
              אין לך חשבון?{' '}
              <button
                onClick={handleSwitchToRegister}
                className="text-field-600 hover:text-field-700 font-bold transition-colors"
              >
                הרשם עכשיו
              </button>
            </p>
            <button
              type="button"
              className="text-sm text-field-500 hover:text-field-600 transition-colors flex items-center justify-center mx-auto space-x-1 space-x-reverse"
              onClick={() => showMessage('אפשרות שחזור סיסמה תופעל בקרוב', 'info')}
            >
              <i className="fas fa-question-circle"></i>
              <span>שכחת סיסמה?</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
