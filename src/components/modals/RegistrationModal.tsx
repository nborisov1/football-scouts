'use client'

/**
 * Registration Modal - Multi-step user registration
 * Preserves functionality from original multi-stage registration
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { USER_TYPES, UserType } from '@/lib/firebase'
import { RegisterData } from '@/types/user'
import { showMessage } from '../MessageContainer'

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
  initialType?: 'player' | 'scout' | null
}

const STEPS = {
  USER_TYPE: 0,
  BASIC_INFO: 1,
  SPECIFIC_INFO: 2,
  CONFIRMATION: 3
}

export default function RegistrationModal({ 
  isOpen, 
  onClose, 
  onSwitchToLogin, 
  initialType 
}: RegistrationModalProps) {
  const { register } = useAuth()
  const [currentStep, setCurrentStep] = useState(STEPS.USER_TYPE)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    age: 18,
    position: '',
    dominantFoot: 'right',
    level: 'beginner',
    organization: ''
  })
  const [userType, setUserType] = useState<UserType | null>(null)

  // Set initial type if provided
  useEffect(() => {
    if (initialType && isOpen) {
      setUserType(initialType as UserType)
      setCurrentStep(STEPS.BASIC_INFO)
    } else if (isOpen) {
      setCurrentStep(STEPS.USER_TYPE)
      setUserType(null)
    }
  }, [initialType, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) : value
    }))
  }

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type)
    setCurrentStep(STEPS.BASIC_INFO)
  }

  const handleNext = () => {
    if (currentStep < STEPS.CONFIRMATION) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > STEPS.USER_TYPE) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!userType) {
      showMessage('נא לבחור סוג משתמש', 'error')
      return
    }

    if (!formData.name || !formData.email || !formData.password) {
      showMessage('נא למלא את כל השדות הנדרשים', 'error')
      return
    }

    setIsLoading(true)

    try {
      showMessage('יוצר חשבון...', 'info')
      await register(formData, userType)
      
      const userTypeHebrew = userType === USER_TYPES.PLAYER ? 'שחקן' : 'סקאוט'
      showMessage(`ברוך הבא! נרשמת בהצלחה כ${userTypeHebrew}`, 'success')
      
      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        password: '',
        age: 18,
        position: '',
        dominantFoot: 'right',
        level: 'beginner',
        organization: ''
      })
      setCurrentStep(STEPS.USER_TYPE)
      setUserType(null)
      onClose()
    } catch (error: any) {
      console.error('Registration error:', error)
      showMessage(error.message || 'שגיאה ברישום', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const renderUserTypeStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center mb-6">בחר את סוג החשבון שלך</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => handleUserTypeSelect(USER_TYPES.PLAYER)}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
        >
          <i className="fas fa-running text-3xl text-blue-600 mb-3"></i>
          <h4 className="text-lg font-semibold">שחקן</h4>
          <p className="text-sm text-gray-600 mt-2">
            אני שחקן כדורגל המעוניין להתפתח ולהתחבר עם סקאוטים
          </p>
        </button>

        <button
          onClick={() => handleUserTypeSelect(USER_TYPES.SCOUT)}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
        >
          <i className="fas fa-search text-3xl text-green-600 mb-3"></i>
          <h4 className="text-lg font-semibold">סקאוט</h4>
          <p className="text-sm text-gray-600 mt-2">
            אני סקאוט המעוניין לגלות כישרונות חדשים
          </p>
        </button>
      </div>
    </div>
  )

  const renderBasicInfoStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center mb-6">פרטים בסיסיים</h3>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          שם מלא *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="הזן את שמך המלא"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          אימייל *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="הזן כתובת אימייל"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          סיסמה *
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="בחר סיסמה חזקה"
        />
      </div>
    </div>
  )

  const renderSpecificInfoStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center mb-6">
        {userType === USER_TYPES.PLAYER ? 'פרטי שחקן' : 'פרטי סקאוט'}
      </h3>
      
      {userType === USER_TYPES.PLAYER ? (
        <>
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
              גיל
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              min="13"
              max="35"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
              עמדה מועדפת
            </label>
            <select
              id="position"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">בחר עמדה</option>
              <option value="שוער">שוער</option>
              <option value="מגן">מגן</option>
              <option value="קשר">קשר</option>
              <option value="חלוץ">חלוץ</option>
            </select>
          </div>

          <div>
            <label htmlFor="dominantFoot" className="block text-sm font-medium text-gray-700 mb-1">
              רגל דומיננטית
            </label>
            <select
              id="dominantFoot"
              name="dominantFoot"
              value={formData.dominantFoot}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="right">ימין</option>
              <option value="left">שמאל</option>
              <option value="both">שתיהן</option>
            </select>
          </div>

          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
              רמת ניסיון
            </label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="beginner">מתחיל</option>
              <option value="intermediate">בינוני</option>
              <option value="advanced">מתקדם</option>
              <option value="professional">מקצועי</option>
            </select>
          </div>
        </>
      ) : (
        <>
          <div>
            <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
              ארגון/קבוצה
            </label>
            <input
              type="text"
              id="organization"
              name="organization"
              value={formData.organization}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="שם הארגון או הקבוצה שלך"
            />
          </div>
        </>
      )}
    </div>
  )

  const renderConfirmationStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center mb-6">אישור פרטים</h3>
      
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <p><strong>סוג חשבון:</strong> {userType === USER_TYPES.PLAYER ? 'שחקן' : 'סקאוט'}</p>
        <p><strong>שם:</strong> {formData.name}</p>
        <p><strong>אימייל:</strong> {formData.email}</p>
        
        {userType === USER_TYPES.PLAYER && (
          <>
            <p><strong>גיל:</strong> {formData.age}</p>
            {formData.position && <p><strong>עמדה:</strong> {formData.position}</p>}
            <p><strong>רגל דומיננטית:</strong> {
              formData.dominantFoot === 'right' ? 'ימין' : 
              formData.dominantFoot === 'left' ? 'שמאל' : 'שתיהן'
            }</p>
          </>
        )}
        
        {userType === USER_TYPES.SCOUT && formData.organization && (
          <p><strong>ארגון:</strong> {formData.organization}</p>
        )}
      </div>
      
      <p className="text-sm text-gray-600 text-center">
        על ידי לחיצה על "השלם הרשמה" אתה מסכים לתנאי השימוש ומדיניות הפרטיות שלנו.
      </p>
    </div>
  )

  const getStepContent = () => {
    switch (currentStep) {
      case STEPS.USER_TYPE:
        return renderUserTypeStep()
      case STEPS.BASIC_INFO:
        return renderBasicInfoStep()
      case STEPS.SPECIFIC_INFO:
        return renderSpecificInfoStep()
      case STEPS.CONFIRMATION:
        return renderConfirmationStep()
      default:
        return renderUserTypeStep()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto" dir="rtl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">הרשמה</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            aria-label="סגור"
          >
            ×
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-6">
          {[0, 1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full mx-1 ${
                step <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {getStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === STEPS.USER_TYPE}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            חזור
          </button>

          {currentStep === STEPS.CONFIRMATION ? (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'נרשם...' : 'השלם הרשמה'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === STEPS.BASIC_INFO && (!formData.name || !formData.email || !formData.password)) ||
                (currentStep === STEPS.USER_TYPE && !userType)
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              המשך
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            כבר יש לך חשבון?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              התחבר כאן
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
