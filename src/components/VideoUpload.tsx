'use client'

/**
 * Video Upload Component for Football Scouting Platform
 * Handles video file upload with progress tracking, validation, and metadata forms
 */

import React, { useState, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { videoService, formatFileSize, validateVideoFile } from '@/lib/videoService'
import { showMessage } from '@/components/MessageContainer'
import type { 
  VideoUpload, 
  VideoMetadata, 
  VideoCategory, 
  ExerciseType
} from '@/types/video'
import {
  DEFAULT_VIDEO_CONFIG,
  VIDEO_CATEGORY_LABELS,
  EXERCISE_TYPE_LABELS
} from '@/types/video'

interface VideoUploadProps {
  onUploadComplete?: (video: VideoMetadata) => void
  onUploadStart?: () => void
  category?: VideoCategory
  exerciseType?: ExerciseType
  className?: string
  allowedCategories?: VideoCategory[]
  defaultMetadata?: Partial<VideoMetadata>
}

export default function VideoUpload({
  onUploadComplete,
  onUploadStart,
  category,
  exerciseType,
  className = '',
  allowedCategories,
  defaultMetadata
}: VideoUploadProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Upload state
  const [uploadState, setUploadState] = useState<{
    isUploading: boolean
    progress: number
    status: VideoUpload['uploadStatus']
    error?: string
  }>({
    isUploading: false,
    progress: 0,
    status: 'preparing'
  })
  
  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState<Partial<VideoMetadata>>({
    title: '',
    description: '',
    category: category || 'training-exercise',
    exerciseType: exerciseType || 'dribbling',
    skillLevel: 'beginner',
    targetAudience: 'amateur',
    tags: [],
    requiredEquipment: [],
    instructions: '',
    goals: [],
    status: 'pending',
    ...defaultMetadata
  })
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showMetadataForm, setShowMetadataForm] = useState(false)

  // File selection handler
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Validate file
    const validation = validateVideoFile(file)
    if (!validation.valid) {
      setErrors({ file: validation.error || 'קובץ לא תקין' })
      setSelectedFile(null)
      return
    }
    
    setSelectedFile(file)
    setErrors({})
    setShowMetadataForm(true)
    
    // Auto-fill some metadata from file
    setMetadata(prev => ({
      ...prev,
      title: prev.title || file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      fileName: file.name,
      fileSize: file.size,
      format: file.name.split('.').pop()?.toLowerCase() || 'unknown'
    }))
  }, [])

  // Drag and drop handlers
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      // Simulate file input change
      const input = fileInputRef.current
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files
        handleFileSelect({ target: input } as React.ChangeEvent<HTMLInputElement>)
      }
    }
  }, [handleFileSelect])

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  // Metadata form handlers
  const handleMetadataChange = useCallback((field: string, value: any) => {
    setMetadata(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }, [errors])

  const handleTagsChange = useCallback((value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    handleMetadataChange('tags', tags)
  }, [handleMetadataChange])

  const handleEquipmentChange = useCallback((value: string) => {
    const equipment = value.split(',').map(item => item.trim()).filter(item => item.length > 0)
    handleMetadataChange('requiredEquipment', equipment)
  }, [handleMetadataChange])

  const handleGoalsChange = useCallback((value: string) => {
    const goals = value.split('\n').map(goal => goal.trim()).filter(goal => goal.length > 0)
    handleMetadataChange('goals', goals)
  }, [handleMetadataChange])

  // Form validation
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!selectedFile) {
      newErrors.file = 'יש לבחור קובץ וידאו'
    }
    
    if (!metadata.title?.trim()) {
      newErrors.title = 'יש להזין כותרת'
    }
    
    if (!metadata.description?.trim()) {
      newErrors.description = 'יש להזין תיאור'
    }
    
    if (metadata.title && metadata.title.length > 100) {
      newErrors.title = 'כותרת ארוכה מדי (מקסימום 100 תווים)'
    }
    
    if (metadata.description && metadata.description.length > 500) {
      newErrors.description = 'תיאור ארוך מדי (מקסימום 500 תווים)'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [selectedFile, metadata])

  // Upload handler
  const handleUpload = useCallback(async () => {
    if (!selectedFile || !user) return
    
    if (!validateForm()) {
      showMessage('יש לתקן את השגיאות בטופס', 'error')
      return
    }
    
    try {
      setUploadState({ isUploading: true, progress: 0, status: 'preparing' })
      onUploadStart?.()
      
      const videoUpload: VideoUpload = {
        file: selectedFile,
        metadata: {
          ...metadata,
          uploadedBy: user.uid,
          playerInfo: user.type === 'player' ? {
            playerId: user.uid,
            playerName: user.name || user.email || 'שחקן לא מזוהה',
            position: user.position || '',
            age: user.age || 0,
            level: user.level || 'amateur'
          } : undefined
        } as Omit<VideoMetadata, 'id' | 'uploadedAt' | 'lastModified' | 'videoUrl' | 'thumbnailUrl' | 'views' | 'likes' | 'downloads'>
      }
      
      const uploadedVideo = await videoService.uploadVideo(
        videoUpload,
        (progress) => {
          setUploadState(prev => ({ ...prev, progress }))
        },
        (status) => {
          setUploadState(prev => ({ ...prev, status }))
        }
      )
      
      setUploadState({ isUploading: false, progress: 100, status: 'completed' })
      showMessage('הסרטון הועלה בהצלחה!', 'success')
      
      // Reset form
      setSelectedFile(null)
      setShowMetadataForm(false)
      setMetadata({
        title: '',
        description: '',
        category: category || 'training-exercise',
        exerciseType: exerciseType || 'dribbling',
        skillLevel: 'beginner',
        targetAudience: 'amateur',
        tags: [],
        requiredEquipment: [],
        instructions: '',
        goals: [],
        status: 'pending'
      })
      setErrors({})
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
      onUploadComplete?.(uploadedVideo)
      
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'שגיאה בהעלאת הסרטון'
      setUploadState({ isUploading: false, progress: 0, status: 'error', error: errorMessage })
      showMessage(errorMessage, 'error')
    }
  }, [selectedFile, user, metadata, validateForm, onUploadStart, onUploadComplete, category, exerciseType])

  const getStatusText = (status: VideoUpload['uploadStatus']) => {
    switch (status) {
      case 'preparing': return 'מכין להעלאה...'
      case 'uploading': return 'מעלה קובץ...'
      case 'processing': return 'מעבד נתונים...'
      case 'completed': return 'הסתיים בהצלחה!'
      case 'error': return 'שגיאה בהעלאה'
      default: return ''
    }
  }

  const availableCategories = allowedCategories || Object.keys(VIDEO_CATEGORY_LABELS) as VideoCategory[]

  return (
    <div className={`video-upload bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      {/* File Selection Area */}
      {!showMetadataForm && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="video/*"
            className="hidden"
          />
          
          <div className="space-y-4">
            <div className="text-6xl text-gray-400">
              <i className="fas fa-cloud-upload-alt"></i>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                העלאת סרטון חדש
              </h3>
              <p className="text-gray-600 mb-4">
                גרור קובץ וידאו לכאן או לחץ לבחירת קובץ
              </p>
              
              <div className="text-sm text-gray-500 space-y-1">
                <p>פורמטים נתמכים: {DEFAULT_VIDEO_CONFIG.allowedFormats.join(', ')}</p>
                <p>גודל מקסימלי: {formatFileSize(DEFAULT_VIDEO_CONFIG.maxFileSize)}</p>
                <p>משך מקסימלי: {Math.floor(DEFAULT_VIDEO_CONFIG.maxDuration / 60)} דקות</p>
              </div>
            </div>
            
            <button
              type="button"
              className="btn-primary"
            >
              בחר קובץ
            </button>
          </div>
          
          {errors.file && (
            <div className="mt-4 text-red-600 text-sm">
              {errors.file}
            </div>
          )}
        </div>
      )}

      {/* Metadata Form */}
      {showMetadataForm && selectedFile && !uploadState.isUploading && (
        <div className="space-y-6">
          {/* File Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">קובץ נבחר</h3>
            <div className="flex items-center space-x-3 space-x-reverse">
              <i className="fas fa-video text-primary-600"></i>
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-600">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null)
                  setShowMetadataForm(false)
                  setErrors({})
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="text-red-600 hover:text-red-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          {/* Metadata Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                כותרת הסרטון *
              </label>
              <input
                type="text"
                value={metadata.title || ''}
                onChange={(e) => handleMetadataChange('title', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="כותרת תיאורית לסרטון"
                maxLength={100}
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תיאור הסרטון *
              </label>
              <textarea
                value={metadata.description || ''}
                onChange={(e) => handleMetadataChange('description', e.target.value)}
                rows={3}
                className={`w-full border rounded-lg px-3 py-2 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="תיאור מפורט של תוכן הסרטון"
                maxLength={500}
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                קטגוריה
              </label>
              <select
                value={metadata.category || ''}
                onChange={(e) => handleMetadataChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {VIDEO_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            {/* Exercise Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סוג תרגיל
              </label>
              <select
                value={metadata.exerciseType || ''}
                onChange={(e) => handleMetadataChange('exerciseType', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {Object.entries(EXERCISE_TYPE_LABELS).map(([type, label]) => (
                  <option key={type} value={type}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Skill Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                רמת קושי
              </label>
              <select
                value={metadata.skillLevel || ''}
                onChange={(e) => handleMetadataChange('skillLevel', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="beginner">מתחיל</option>
                <option value="intermediate">בינוני</option>
                <option value="advanced">מתקדם</option>
              </select>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                קהל יעד
              </label>
              <select
                value={metadata.targetAudience || ''}
                onChange={(e) => handleMetadataChange('targetAudience', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="youth">נוער</option>
                <option value="amateur">חובבים</option>
                <option value="professional">מקצועיים</option>
              </select>
            </div>

            {/* Tags */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תגיות (מופרדות בפסיקים)
              </label>
              <input
                type="text"
                value={metadata.tags?.join(', ') || ''}
                onChange={(e) => handleTagsChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="כדרור, מיומנות, בסיסי"
              />
            </div>

            {/* Required Equipment */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ציוד נדרש (מופרד בפסיקים)
              </label>
              <input
                type="text"
                value={metadata.requiredEquipment?.join(', ') || ''}
                onChange={(e) => handleEquipmentChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="כדור, קונוסים, שער"
              />
            </div>

            {/* Instructions */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                הוראות ביצוע
              </label>
              <textarea
                value={metadata.instructions || ''}
                onChange={(e) => handleMetadataChange('instructions', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="הוראות מפורטות לביצוע התרגיל"
              />
            </div>

            {/* Goals */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                מטרות התרגיל (שורה לכל מטרה)
              </label>
              <textarea
                value={metadata.goals?.join('\n') || ''}
                onChange={(e) => handleGoalsChange(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="שיפור שליטה בכדור&#10;פיתוח קצב&#10;חיזוק רגליים"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 space-x-reverse pt-4 border-t">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || uploadState.isUploading}
              className="flex-1 btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <i className="fas fa-upload ml-2"></i>
              העלה סרטון
            </button>
            
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null)
                setShowMetadataForm(false)
                setErrors({})
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadState.isUploading && (
        <div className="bg-white border rounded-lg p-6">
          <div className="text-center space-y-4">
            <div className="text-lg font-medium text-gray-900">
              {getStatusText(uploadState.status)}
            </div>
            
            {uploadState.status === 'uploading' && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
            )}
            
            {uploadState.status === 'uploading' && (
              <div className="text-sm text-gray-600">
                {Math.round(uploadState.progress)}% הושלם
              </div>
            )}
            
            {uploadState.status === 'processing' && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Error */}
      {uploadState.status === 'error' && uploadState.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-red-600 ml-3"></i>
            <div>
              <h3 className="text-red-800 font-medium">שגיאה בהעלאת הסרטון</h3>
              <p className="text-red-700 text-sm mt-1">{uploadState.error}</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setUploadState({ isUploading: false, progress: 0, status: 'preparing' })}
            className="mt-3 text-red-600 hover:text-red-700 text-sm underline"
          >
            נסה שוב
          </button>
        </div>
      )}
    </div>
  )
}
