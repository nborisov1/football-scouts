'use client'

/**
 * Simple Registration Component
 * Clean, fast registration - just collect essential details
 * NO level assessment, NO complex onboarding
 */

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { RegisterData } from '@/types/user'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { showMessage } from '@/components/MessageContainer'

interface SimpleRegistrationProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

export default function SimpleRegistration({ 
  isOpen, 
  onClose, 
  onSwitchToLogin 
}: SimpleRegistrationProps) {
  const router = useRouter()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    age: 18,
    position: '',
    dominantFoot: 'right',
    level: 'beginner',
    type: 'player'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 18 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      showMessage('אנא מלא את כל השדות הנדרשים', 'error')
      return
    }

    if (formData.password.length < 6) {
      showMessage('הסיסמה חייבת להכיל לפחות 6 תווים', 'error')
      return
    }

    setLoading(true)
    try {
      // Register the user with all the data
      await register(formData)
      
      showMessage('ההרשמה הושלמה בהצלחה! ברוך הבא!', 'success')
      onClose()
      router.push('/training') // Redirect to training where they can explore
      
    } catch (error: any) {
      console.error('Registration error:', error)
      const errorMessage = getErrorMessage(error)
      showMessage(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="הרשמה מהירה">
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            הצטרף לפלטפורמת הכדורגל
          </h2>
          <p className="text-gray-600">
            הרשמה מהירה - התחל את המסע הכדורגלי שלך
          </p>
        </div>

        {/* Personal Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="שם פרטי *"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            placeholder="הזן שם פרטי"
          />
          
          <Input
            label="שם משפחה *"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            placeholder="הזן שם משפחה"
          />
        </div>

        {/* Account Info */}
        <Input
          label="אימייל *"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          placeholder="your@email.com"
        />

        <Input
          label="סיסמה *"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          placeholder="לפחות 6 תווים"
          minLength={6}
        />

        {/* Basic Football Info */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            פרטי כדורגל בסיסיים
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="גיל"
              name="age"
              type="number"
              value={formData.age?.toString() || ''}
              onChange={handleInputChange}
              min={5}
              max={50}
              placeholder="18"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                עמדה מועדפת
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">בחר עמדה (אופציונלי)</option>
                <option value="goalkeeper">שוער</option>
                <option value="defender">בלם</option>
                <option value="midfielder">קשר</option>
                <option value="forward">חלוץ</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              רגל דומיננטית
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dominantFoot"
                  value="right"
                  checked={formData.dominantFoot === 'right'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                ימין
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="dominantFoot"
                  value="left"
                  checked={formData.dominantFoot === 'left'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                שמאל
              </label>
            </div>
          </div>
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>טיפ:</strong> לאחר ההרשמה תוכל לקחת מבחן רמה כדי לקבל תרגילים מותאמים אישית
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            {loading ? 'נרשם...' : 'הרשם עכשיו'}
          </Button>

          <div className="text-center">
            <span className="text-gray-600">יש לך כבר חשבון? </span>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              התחבר כאן
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

// Helper function for error messages
function getErrorMessage(error: any): string {
  if (error?.code) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'האימייל כבר בשימוש'
      case 'auth/weak-password':
        return 'הסיסמה חלשה מדי'
      case 'auth/invalid-email':
        return 'כתובת אימייל לא תקינה'
      default:
        return 'שגיאה ברישום. נסה שוב.'
    }
  }
  return error?.message || 'שגיאה ברישום. נסה שוב.'
}
