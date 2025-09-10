/**
 * PlayerRegistration - Focused registration form for players
 * Includes player-specific fields like age, position, dominantFoot, etc.
 */

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { RegisterData, UserType } from '@/types/user'
import { showMessage } from '../MessageContainer'
import Button from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'

interface PlayerRegistrationProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
  onBack: () => void
}

export default function PlayerRegistration({ 
  isOpen, 
  onClose, 
  onSwitchToLogin,
  onBack
}: PlayerRegistrationProps) {
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
    type: 'player',
    team: '',
    organization: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 18 : value
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
      router.push('/challenges') // Redirect to challenges where they can start training
      
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
    <Modal isOpen={isOpen} onClose={onClose} title="הרשמת שחקן">
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Back Button */}
          <div className="flex items-center justify-start mb-6">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all group"
            >
              <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
              <span>חזור לבחירת סוג משתמש</span>
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              הצטרף כשחקן ⚽
            </h2>
            <p className="text-gray-600">
              צור חשבון והתחל להתאמן ולהתקדם
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

          {/* Player-Specific Fields */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">פרטי שחקן</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="גיל *"
                type="number"
                value={formData.age?.toString() || ''}
                onChange={handleInputChange}
                name="age"
                placeholder="18"
                min={13}
                max={35}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  עמדה מועדפת *
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">בחר עמדה</option>
                  <option value="שוער">שוער</option>
                  <option value="מגן">מגן</option>
                  <option value="קשר">קשר</option>
                  <option value="חלוץ">חלוץ</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  רגל דומיננטית
                </label>
                <select
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  רמת ניסיון
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">מתחיל</option>
                  <option value="intermediate">בינוני</option>
                  <option value="advanced">מתקדם</option>
                </select>
              </div>
            </div>

            <Input
              label="קבוצה נוכחית (אופציונלי)"
              type="text"
              value={formData.team || ''}
              onChange={handleInputChange}
              name="team"
              placeholder="שם הקבוצה"
            />
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>טיפ:</strong> לאחר ההרשמה תגיע לעמוד האתגרים שם תוכל להתחיל להתאמן
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-4">
            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              {loading ? 'נרשם...' : 'הרשם כשחקן'}
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
