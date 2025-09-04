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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" dir="rtl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">התחברות</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            aria-label="סגור"
          >
            ×
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              אימייל
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="הזן את כתובת האימייל שלך"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              סיסמה
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="הזן את הסיסמה שלך"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'מתחבר...' : 'התחבר'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-gray-600">
            אין לך חשבון?{' '}
            <button
              onClick={handleSwitchToRegister}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              הרשם עכשיו
            </button>
          </p>
          <p>
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-700"
              onClick={() => showMessage('אפשרות שחזור סיסמה תופעל בקרוב', 'info')}
            >
              שכחת סיסמה?
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
