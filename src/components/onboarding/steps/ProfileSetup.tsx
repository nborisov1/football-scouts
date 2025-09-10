'use client'

import React, { useState } from 'react'
import { RegisterData } from '@/types/user'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

interface ProfileSetupProps {
  data: RegisterData
  onComplete: (data: Partial<RegisterData>) => void
  onBack: () => void
  loading: boolean
  error: string | null
}

const POSITIONS = [
  { value: 'striker', label: 'חלוץ', icon: '⚽' },
  { value: 'midfielder', label: 'קישור', icon: '🏃‍♂️' },
  { value: 'defender', label: 'מגן', icon: '🛡️' },
  { value: 'goalkeeper', label: 'שוער', icon: '🥅' }
]

const EXPERIENCE_OPTIONS = [
  { value: '0-1', label: 'מתחיל (0-1 שנים)', description: 'רק התחלתי לשחק כדורגל' },
  { value: '2-5', label: 'חובב (2-5 שנים)', description: 'משחק כמה שנים, יודע את היסודות' },
  { value: '6-10', label: 'מנוסה (6-10 שנים)', description: 'שחקן מנוסה עם טכניקה טובה' },
  { value: '10+', label: 'מומחה (10+ שנים)', description: 'שחקן ותיק עם ניסיון רב' }
]

const FOOT_OPTIONS = [
  { value: 'right', label: 'רגל ימין', icon: '👟' },
  { value: 'left', label: 'רגל שמאל', icon: '👟' },
  { value: 'both', label: 'שתי הרגליים', icon: '👟👟' }
]

export default function ProfileSetup({ 
  data, 
  onComplete, 
  onBack, 
  loading, 
  error 
}: ProfileSetupProps) {
  const [formData, setFormData] = useState<Partial<RegisterData>>({
    age: data.age || 16,
    position: data.position || '',
    team: data.team || '',
    dominantFoot: data.dominantFoot || 'right',
    experienceYears: data.experienceYears || '',
    height: data.height,
    weight: data.weight,
    previousClub: data.previousClub
  })
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof RegisterData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear validation error when user changes value
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Age validation
    if (!formData.age || formData.age < 6 || formData.age > 50) {
      errors.age = 'גיל חייב להיות בין 6 ל-50'
    }

    // Position validation
    if (!formData.position) {
      errors.position = 'חובה לבחור עמדה'
    }

    // Experience validation
    if (!formData.experienceYears) {
      errors.experienceYears = 'חובה לציין רמת ניסיון'
    }

    // Height validation (optional but if provided, must be reasonable)
    if (formData.height && (formData.height < 100 || formData.height > 250)) {
      errors.height = 'גובה חייב להיות בין 100-250 ס"מ'
    }

    // Weight validation (optional but if provided, must be reasonable)
    if (formData.weight && (formData.weight < 20 || formData.weight > 200)) {
      errors.weight = 'משקל חייב להיות בין 20-200 ק"ג'
    }

    // Age-position validation
    if (formData.age && formData.position === 'goalkeeper' && formData.age < 10) {
      errors.position = 'שוערים צעירים מ-10 לא מומלצים למבחן זה'
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
          בואו נכיר אותך טוב יותר! 🏈
        </h3>
        <p className="text-gray-600">
          פרטי הכדורגל שלך יעזרו לנו להתאים לך את המבחן הטוב ביותר
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Age */}
        <div>
          <Input
            label="גיל"
            type="number"
            value={formData.age?.toString() || ''}
            onChange={(value) => handleInputChange('age', parseInt(value) || 16)}
            error={validationErrors.age}
            required
            placeholder="16"
            min={6}
            max={50}
          />
        </div>

        {/* Position Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            עמדה במגרש *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {POSITIONS.map((pos) => (
              <button
                key={pos.value}
                type="button"
                onClick={() => handleInputChange('position', pos.value)}
                className={`p-4 border-2 rounded-lg text-center transition-all ${
                  formData.position === pos.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="text-2xl mb-2">{pos.icon}</div>
                <div className="font-medium text-sm">{pos.label}</div>
              </button>
            ))}
          </div>
          {validationErrors.position && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.position}</p>
          )}
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            רמת ניסיון בכדורגל *
          </label>
          <div className="space-y-3">
            {EXPERIENCE_OPTIONS.map((exp) => (
              <label
                key={exp.value}
                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.experienceYears === exp.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="experience"
                  value={exp.value}
                  checked={formData.experienceYears === exp.value}
                  onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                  className="mt-1 h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                />
                <div className="mr-3">
                  <div className="font-medium text-gray-900">{exp.label}</div>
                  <div className="text-sm text-gray-600">{exp.description}</div>
                </div>
              </label>
            ))}
          </div>
          {validationErrors.experienceYears && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.experienceYears}</p>
          )}
        </div>

        {/* Dominant Foot */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            רגל דומיננטית
          </label>
          <div className="grid grid-cols-3 gap-3">
            {FOOT_OPTIONS.map((foot) => (
              <button
                key={foot.value}
                type="button"
                onClick={() => handleInputChange('dominantFoot', foot.value)}
                className={`p-3 border-2 rounded-lg text-center transition-all ${
                  formData.dominantFoot === foot.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="text-lg mb-1">{foot.icon}</div>
                <div className="font-medium text-sm">{foot.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Physical Attributes (Optional) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="גובה (ס״מ) - אופציונלי"
            type="number"
            value={formData.height?.toString() || ''}
            onChange={(value) => handleInputChange('height', parseInt(value) || undefined)}
            error={validationErrors.height}
            placeholder="175"
            min={100}
            max={250}
          />
          <Input
            label="משקל (ק״ג) - אופציונלי"
            type="number"
            value={formData.weight?.toString() || ''}
            onChange={(value) => handleInputChange('weight', parseInt(value) || undefined)}
            error={validationErrors.weight}
            placeholder="70"
            min={20}
            max={200}
          />
        </div>

        {/* Team/Club Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="קבוצה נוכחית (אופציונלי)"
            type="text"
            value={formData.team || ''}
            onChange={(value) => handleInputChange('team', value)}
            placeholder="שם הקבוצה הנוכחית"
          />
          <Input
            label="קבוצה קודמת (אופציונלי)"
            type="text"
            value={formData.previousClub || ''}
            onChange={(value) => handleInputChange('previousClub', value)}
            placeholder="קבוצה שבה שיחקת בעבר"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onBack}
            disabled={loading}
            className="sm:w-auto"
          >
            חזור
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            isLoading={loading}
            className="flex-1"
          >
            {loading ? 'שומר...' : 'המשך למבחן הרמה'}
          </Button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg">
        <div className="flex items-start space-x-3 space-x-reverse">
          <div className="text-green-500 text-xl">🎯</div>
          <div>
            <h4 className="font-medium text-green-900 mb-1">למה אנחנו שואלים את זה?</h4>
            <p className="text-sm text-green-700">
              הפרטים האלה עוזרים לנו להבין את הרקע שלך ולספק לך מבחן מותאם. 
              כל הפרטים נשמרים באופן מוגן ויעזרו לסקאוטים להבין את הפרופיל שלך.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
