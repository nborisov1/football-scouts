'use client'

/**
 * Enhanced Video Upload Component for Admin
 * Supports granular categorization for training system
 */

import React, { useState } from 'react'
import { showMessage } from '../MessageContainer'
import { 
  VideoMetadata, 
  TrainingType, 
  Position, 
  AgeGroup, 
  ExerciseType,
  TRAINING_TYPE_LABELS,
  POSITION_LABELS,
  AGE_GROUP_LABELS,
  EXERCISE_TYPE_LABELS
} from '@/types/video'

interface EnhancedVideoUploadProps {
  onUpload: (videoData: Partial<VideoMetadata>) => void
  onCancel: () => void
  isUploading?: boolean
}

export default function EnhancedVideoUpload({ 
  onUpload, 
  onCancel, 
  isUploading = false 
}: EnhancedVideoUploadProps) {
  const [formData, setFormData] = useState<Partial<VideoMetadata>>({
    title: '',
    description: '',
    category: 'training-exercise',
    skillLevel: 'beginner',
    exerciseType: 'dribbling',
    targetAudience: 'youth',
    trainingType: 'general-training',
    positionSpecific: [],
    ageGroup: 'u10',
    difficultyLevel: 1,
    tags: [],
    requiredEquipment: [],
    instructions: '',
    goals: [],
    expectedDuration: 0
  })

  const [newTag, setNewTag] = useState('')
  const [newEquipment, setNewEquipment] = useState('')
  const [newGoal, setNewGoal] = useState('')

  const handleInputChange = (field: keyof VideoMetadata, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayAdd = (field: 'tags' | 'requiredEquipment' | 'goals', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }))
    }
  }

  const handleArrayRemove = (field: 'tags' | 'requiredEquipment' | 'goals', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description) {
      showMessage('נא למלא את השדות הנדרשים', 'error')
      return
    }

    if (formData.positionSpecific?.length === 0) {
      showMessage('נא לבחור לפחות עמדה אחת', 'error')
      return
    }

    onUpload(formData)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">העלאת סרטון אימון חדש</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              כותרת הסרטון *
            </label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="לדוגמה: כדרור בסיסי לגילאי 10-12"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              רמת קושי (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.difficultyLevel || 1}
              onChange={(e) => handleInputChange('difficultyLevel', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            תיאור הסרטון *
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="תיאור מפורט של התרגיל והמטרות שלו"
          />
        </div>

        {/* Training System Categorization */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סוג אימון *
            </label>
            <select
              value={formData.trainingType || 'general-training'}
              onChange={(e) => handleInputChange('trainingType', e.target.value as TrainingType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(TRAINING_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              רמת מיומנות
            </label>
            <select
              value={formData.skillLevel || 'beginner'}
              onChange={(e) => handleInputChange('skillLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="beginner">מתחיל</option>
              <option value="intermediate">בינוני</option>
              <option value="advanced">מתקדם</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              קבוצת גיל *
            </label>
            <select
              value={formData.ageGroup || 'u10'}
              onChange={(e) => handleInputChange('ageGroup', e.target.value as AgeGroup)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(AGE_GROUP_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Position and Exercise Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              עמדות רלוונטיות *
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
              {Object.entries(POSITION_LABELS).map(([value, label]) => (
                <label key={value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.positionSpecific?.includes(value as Position) || false}
                    onChange={(e) => {
                      const positions = formData.positionSpecific || []
                      if (e.target.checked) {
                        handleInputChange('positionSpecific', [...positions, value as Position])
                      } else {
                        handleInputChange('positionSpecific', positions.filter(p => p !== value))
                      }
                    }}
                    className="ml-2"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סוג תרגיל
            </label>
            <select
              value={formData.exerciseType || 'dribbling'}
              onChange={(e) => handleInputChange('exerciseType', e.target.value as ExerciseType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(EXERCISE_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Instructions and Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            הוראות ביצוע
          </label>
          <textarea
            value={formData.instructions || ''}
            onChange={(e) => handleInputChange('instructions', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="הוראות מפורטות לביצוע התרגיל"
          />
        </div>

        {/* Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            מטרות התרגיל
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="הוסף מטרה חדשה"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleArrayAdd('goals', newGoal)
                  setNewGoal('')
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                handleArrayAdd('goals', newGoal)
                setNewGoal('')
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              הוסף
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.goals?.map((goal, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {goal}
                <button
                  type="button"
                  onClick={() => handleArrayRemove('goals', index)}
                  className="mr-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Required Equipment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ציוד נדרש
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newEquipment}
              onChange={(e) => setNewEquipment(e.target.value)}
              placeholder="הוסף ציוד נדרש"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleArrayAdd('requiredEquipment', newEquipment)
                  setNewEquipment('')
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                handleArrayAdd('requiredEquipment', newEquipment)
                setNewEquipment('')
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              הוסף
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.requiredEquipment?.map((equipment, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {equipment}
                <button
                  type="button"
                  onClick={() => handleArrayRemove('requiredEquipment', index)}
                  className="mr-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Expected Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            משך זמן צפוי (דקות)
          </label>
          <input
            type="number"
            min="1"
            value={formData.expectedDuration || 0}
            onChange={(e) => handleInputChange('expectedDuration', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 space-x-reverse">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            ביטול
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isUploading ? 'מעלה...' : 'העלה סרטון'}
          </button>
        </div>
      </form>
    </div>
  )
}
