'use client'

import React, { useState } from 'react'
import { RegisterData } from '@/types/user'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

interface BasicRegistrationProps {
  data: RegisterData
  onComplete: (data: RegisterData) => void
  loading: boolean
  error: string | null
}

export default function BasicRegistration({ 
  data, 
  onComplete, 
  loading, 
  error 
}: BasicRegistrationProps) {
  const [formData, setFormData] = useState<RegisterData>(data)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof RegisterData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Email validation
    if (!formData.email) {
      errors.email = 'אימייל הוא שדה חובה'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'כתובת אימייל לא תקינה'
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'סיסמה היא שדה חובה'
    } else if (formData.password.length < 6) {
      errors.password = 'הסיסמה חייבת להכיל לפחות 6 תווים'
    }

    // Name validation
    if (!formData.firstName) {
      errors.firstName = 'שם פרטי הוא שדה חובה'
    }
    if (!formData.lastName) {
      errors.lastName = 'שם משפחה הוא שדה חובה'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onComplete(formData)
    }
  }

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          ברוך הבא לפלטפורמת הסקאוטינג! ⚽
        </h3>
        <p className="text-gray-600">
          בואו נתחיל ביצירת החשבון שלך
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="שם פרטי"
            type="text"
            value={formData.firstName}
            onChange={(value) => handleInputChange('firstName', value)}
            error={validationErrors.firstName}
            required
            placeholder="הכנס את השם הפרטי שלך"
          />
          <Input
            label="שם משפחה"
            type="text"
            value={formData.lastName}
            onChange={(value) => handleInputChange('lastName', value)}
            error={validationErrors.lastName}
            required
            placeholder="הכנס את שם המשפחה שלך"
          />
        </div>

        {/* Email */}
        <Input
          label="כתובת אימייל"
          type="email"
          value={formData.email}
          onChange={(value) => handleInputChange('email', value)}
          error={validationErrors.email}
          required
          placeholder="example@email.com"
        />

        {/* Password */}
        <Input
          label="סיסמה"
          type="password"
          value={formData.password}
          onChange={(value) => handleInputChange('password', value)}
          error={validationErrors.password}
          required
          placeholder="לפחות 6 תווים"
        />

        {/* Organization */}
        <Input
          label="קבוצה / ארגון (אופציונלי)"
          type="text"
          value={formData.organization}
          onChange={(value) => handleInputChange('organization', value)}
          placeholder="הכנס את שם הקבוצה או הארגון שלך"
        />

        {/* Terms Acceptance */}
        <div className="flex items-start space-x-3 space-x-reverse">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            אני מסכים{' '}
            <a href="/terms" className="text-primary-600 hover:text-primary-500">
              לתנאי השימוש
            </a>{' '}
            ו
            <a href="/privacy" className="text-primary-600 hover:text-primary-500">
              למדיניות הפרטיות
            </a>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          isLoading={loading}
          className="w-full"
        >
          {loading ? 'יוצר חשבון...' : 'צור חשבון והמשך'}
        </Button>
      </form>

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-3 space-x-reverse">
          <div className="text-blue-500 text-xl">💡</div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">מה הלאה?</h4>
            <p className="text-sm text-blue-700">
              לאחר יצירת החשבון, נתבקש ממך למלא פרטי כדורגל ולבצע מבחן קצר לקביעת הרמה שלך.
              התהליך כולו אורך כ-10 דקות.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
