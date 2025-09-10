'use client'

/**
 * Registration Modal - Multi-step user registration
 * Preserves functionality from original multi-stage registration
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { RegisterData, UserType } from '@/types/user'
import { showMessage } from '../MessageContainer'
import SimpleRegistration from '../onboarding/SimpleRegistration'

import { USER_TYPES } from '@/lib/firebase'

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
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(initialType || null)
  const [userType, setUserType] = useState<UserType | null>(null)
  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    age: 18,
    position: '',
    dominantFoot: 'right',
    level: 'beginner',
    organization: '',
    team: '',
    type: 'player'
  })

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
    if (type === 'player') {
      // Use enhanced registration flow for players
      setSelectedUserType('player')
      return
    }
    
    // Continue with existing flow for scouts/admins
    setUserType(type)
    setFormData(prev => ({ ...prev, type }))
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

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      showMessage('נא למלא את כל השדות הנדרשים', 'error')
      return
    }

    setIsLoading(true)

    try {
      showMessage('יוצר חשבון...', 'info')
      await register(formData)
      
      const userTypeHebrew = userType === USER_TYPES.PLAYER ? 'שחקן' : 'סקאוט'
      showMessage(`ברוך הבא! נרשמת בהצלחה כ${userTypeHebrew}`, 'success')
      
      // Reset form and close modal
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        age: 18,
        position: '',
        dominantFoot: 'right',
        level: 'beginner',
        organization: '',
        team: '',
        type: 'player'
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

  // If user selects 'player', use simple registration flow
  if (selectedUserType === 'player') {
    return (
      <SimpleRegistration
        isOpen={isOpen}
        onClose={onClose}
        onSwitchToLogin={onSwitchToLogin}
      />
    )
  }

  const renderUserTypeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-display font-bold text-stadium-900 mb-2">בחר את סוג החשבון שלך</h3>
        <p className="text-stadium-600">איך תרצה להשתמש בפלטפורמה?</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => handleUserTypeSelect(USER_TYPES.PLAYER)}
          className="football-card p-8 border-2 border-field-200 rounded-2xl hover:border-field-500 hover:bg-field-50 transition-all duration-300 text-center group shadow-stadium"
        >
          <div className="w-16 h-16 bg-field-gradient rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-stadium-glow">
            <i className="fas fa-running text-2xl text-white"></i>
          </div>
          <h4 className="text-xl font-display font-bold text-stadium-900 mb-3">⚽ שחקן</h4>
          <p className="text-sm text-stadium-600 leading-relaxed">
            אני שחקן כדורגל המעוניין להתפתח, לשפר את היכולות שלי ולהתחבר עם סקאוטים מקצועיים
          </p>
        </button>

        <button
          onClick={() => handleUserTypeSelect(USER_TYPES.SCOUT)}
          className="football-card p-8 border-2 border-accent-200 rounded-2xl hover:border-accent-500 hover:bg-accent-50 transition-all duration-300 text-center group shadow-stadium"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-stadium-glow">
            <i className="fas fa-search text-2xl text-white"></i>
          </div>
          <h4 className="text-xl font-display font-bold text-stadium-900 mb-3">🔍 סקאוט</h4>
          <p className="text-sm text-stadium-600 leading-relaxed">
            אני סקאוט המעוניין לגלות כישרונות חדשים ולחבר בין שחקנים מוכשרים לקבוצות
          </p>
        </button>
      </div>
    </div>
  )

  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-display font-bold text-stadium-900 mb-2">פרטים בסיסיים</h3>
        <p className="text-stadium-600">בואו נתחיל עם הבסיס</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-display font-semibold text-stadium-700 mb-2">
            <i className="fas fa-user ml-2 text-field-500"></i>
            שם פרטי *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border-2 border-field-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-field-500 focus:border-field-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            placeholder="הזן שם פרטי"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-display font-semibold text-stadium-700 mb-2">
            <i className="fas fa-user ml-2 text-field-500"></i>
            שם משפחה *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border-2 border-field-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-field-500 focus:border-field-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
            placeholder="הזן שם משפחה"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-display font-semibold text-stadium-700 mb-2">
          <i className="fas fa-envelope ml-2 text-field-500"></i>
          אימייל *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 border-2 border-field-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-field-500 focus:border-field-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
          placeholder="הזן כתובת אימייל"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-display font-semibold text-stadium-700 mb-2">
          <i className="fas fa-lock ml-2 text-field-500"></i>
          סיסמה *
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 border-2 border-field-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-field-500 focus:border-field-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
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
        <p><strong>שם:</strong> {formData.firstName} {formData.lastName}</p>
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto shadow-stadium border border-field-200/50" dir="rtl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-field-gradient rounded-full flex items-center justify-center shadow-stadium-glow">
              <i className="fas fa-user-plus text-white"></i>
            </div>
            <h2 className="text-2xl font-display font-bold text-stadium-900">הרשמה</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stadium-100 hover:bg-stadium-200 text-stadium-600 hover:text-stadium-800 transition-all duration-300 flex items-center justify-center"
            aria-label="סגור"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2 space-x-reverse">
            {[0, 1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    step <= currentStep 
                      ? 'bg-field-gradient text-white shadow-stadium-glow' 
                      : 'bg-stadium-200 text-stadium-500'
                  }`}
                >
                  {step === 0 && <i className="fas fa-user-tag"></i>}
                  {step === 1 && <i className="fas fa-id-card"></i>}
                  {step === 2 && <i className="fas fa-cog"></i>}
                  {step === 3 && <i className="fas fa-check"></i>}
                </div>
                {step < 3 && (
                  <div className={`w-8 h-1 mx-2 transition-all duration-300 ${
                    step < currentStep ? 'bg-field-500' : 'bg-stadium-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {getStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === STEPS.USER_TYPE}
            className="px-6 py-3 text-stadium-600 bg-stadium-100 rounded-xl hover:bg-stadium-200 disabled:opacity-50 disabled:cursor-not-allowed font-display font-semibold transition-all duration-300 flex items-center space-x-2 space-x-reverse"
          >
            <i className="fas fa-chevron-right"></i>
            <span>חזור</span>
          </button>

          {currentStep === STEPS.CONFIRMATION ? (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn-primary px-8 py-3 font-display font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 space-x-reverse"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner animate-spin"></i>
                  <span>נרשם...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-rocket"></i>
                  <span>השלם הרשמה</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === STEPS.BASIC_INFO && (!formData.firstName || !formData.lastName || !formData.email || !formData.password)) ||
                (currentStep === STEPS.USER_TYPE && !userType)
              }
              className="btn-primary px-8 py-3 font-display font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 space-x-reverse"
            >
              <span>המשך</span>
              <i className="fas fa-chevron-left"></i>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-field-200 pt-6">
          <p className="text-sm text-stadium-600">
            כבר יש לך חשבון?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-field-600 hover:text-field-700 font-bold transition-colors"
            >
              התחבר כאן
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
