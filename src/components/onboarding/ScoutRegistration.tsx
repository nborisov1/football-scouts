/**
 * ScoutRegistration - Focused registration form for scouts
 * Includes scout-specific fields like organization, experience, etc.
 */

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { RegisterData, UserType } from '@/types/user'
import { showMessage } from '../MessageContainer'
import Button from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'

interface ScoutRegistrationProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
  onBack: () => void
}

export default function ScoutRegistration({ 
  isOpen, 
  onClose, 
  onSwitchToLogin,
  onBack
}: ScoutRegistrationProps) {
  const router = useRouter()
  const { register } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<RegisterData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    age: 25,
    position: '',
    dominantFoot: 'right',
    level: 'beginner',
    type: 'scout',
    team: '',
    organization: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 25 : value
    }))
  }

  const getErrorMessage = (error: any): string => {
    if (error?.code === 'auth/email-already-in-use') {
      return 'כתובת האימייל כבר קיימת במערכת. נסה להתחבר או השתמש באימייל אחר.'
    }
    if (error?.code === 'auth/weak-password') {
      return 'הסיסמה חלשה מדי. בחר סיסמה חזקה יותר עם לפחות 6 תווים.'
    }
    if (error?.code === 'auth/invalid-email') {
      return 'כתובת האימייל לא תקינה. בדוק ונסה שוב.'
    }
    return error?.message || 'אירעה שגיאה בהרשמה. נסה שוב.'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Register the user with all the data
      await register(formData)
      
      onClose()
      router.push('/watchlist') // Redirect to watchlist where scouts can start scouting
      
    } catch (error: any) {
      console.error('Registration error:', error)
      const errorMessage = getErrorMessage(error)
      showMessage(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="הרשמת סקאוט">
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Back Button */}
          <div className="flex items-center justify-start mb-4">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              title="חזור לבחירת סוג משתמש"
            >
              <i className="fas fa-arrow-right text-gray-600 hover:text-gray-800"></i>
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              הצטרף כסקאוט 🔍
            </h2>
            <p className="text-gray-600">
              צור חשבון והתחל לגלות כישרונות
            </p>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="שם פרטי *"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              name="firstName"
              placeholder="שם פרטי"
              required
            />
            <Input
              label="שם משפחה *"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              name="lastName"
              placeholder="שם משפחה"
              required
            />
          </div>

          <Input
            label="אימייל *"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange(e)}
            name="email"
            placeholder="example@email.com"
            required
          />

          <Input
            label="סיסמה *"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange(e)}
            name="password"
            placeholder="בחר סיסמה חזקה"
            required
          />

          {/* Scout-Specific Fields */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">פרטי סקאוט</h3>
            
            <Input
              label="ארגון/קבוצה *"
              type="text"
              value={formData.organization || ''}
              onChange={handleInputChange}
              name="organization"
              placeholder="שם הארגון או הקבוצה"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="גיל"
                type="number"
                value={formData.age?.toString() || ''}
                onChange={handleInputChange}
                name="age"
                placeholder="25"
                min={18}
                max={70}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תחום התמחות
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">בחר תחום</option>
                  <option value="שוערים">שוערים</option>
                  <option value="מגנים">מגנים</option>
                  <option value="קשרים">קשרים</option>
                  <option value="חלוצים">חלוצים</option>
                  <option value="כללי">כללי</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                רמת ניסיון בסקאוטינג
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">מתחיל</option>
                <option value="intermediate">בעל ניסיון</option>
                <option value="advanced">מקצועי</option>
              </select>
            </div>

            <Input
              label="קבוצה נוכחית (אופציונלי)"
              type="text"
              value={formData.team || ''}
              onChange={handleInputChange}
              name="team"
              placeholder="קבוצה שאתה עובד איתה"
            />
          </div>

          {/* Info Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              🔍 <strong>טיפ:</strong> לאחר ההרשמה תוכל לגשת לרשימת המעקב ולהתחיל לחפש כישרונות
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-4">
            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              {loading ? 'נרשם...' : 'הרשם כסקאוט'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                כבר יש לך חשבון? התחבר
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  )
}
