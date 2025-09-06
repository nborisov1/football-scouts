'use client'

/**
 * Multi-Stage Video Upload Component for Admin
 * 3-stage process: Metadata → Video Upload → Thumbnail Upload
 */

import React, { useState, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { videoService, formatFileSize, validateVideoFile } from '@/lib/videoService'
import { showMessage } from '@/components/MessageContainer'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import type { 
  VideoMetadata, 
  VideoCategory, 
  ExerciseType,
  TrainingType,
  Position,
  AgeGroup
} from '@/types/video'
import {
  VIDEO_CATEGORY_LABELS,
  EXERCISE_TYPE_LABELS,
  TRAINING_TYPE_LABELS,
  POSITION_LABELS,
  AGE_GROUP_LABELS
} from '@/types/video'

interface MultiStageVideoUploadProps {
  onUploadComplete?: (video: VideoMetadata) => void
  onCancel: () => void
}

type UploadStage = 'metadata-basic' | 'metadata-training' | 'metadata-details' | 'video' | 'thumbnail' | 'completed'

export default function MultiStageVideoUpload({ 
  onUploadComplete, 
  onCancel 
}: MultiStageVideoUploadProps) {
  const { user } = useAuth()
  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  
  // Current stage
  const [currentStage, setCurrentStage] = useState<UploadStage>('metadata-basic')
  
  // Form data
  const [metadata, setMetadata] = useState<Partial<VideoMetadata>>({
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
    expectedDuration: 0,
    status: 'pending'
  })
  
  // File states
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null)
  
  // Upload states
  const [videoUploadState, setVideoUploadState] = useState<{
    isUploading: boolean
    progress: number
    status: 'preparing' | 'uploading' | 'processing' | 'completed' | 'error'
    error?: string
  }>({
    isUploading: false,
    progress: 0,
    status: 'preparing'
  })
  
  const [thumbnailUploadState, setThumbnailUploadState] = useState<{
    isUploading: boolean
    progress: number
    status: 'preparing' | 'uploading' | 'processing' | 'completed' | 'error'
    error?: string
  }>({
    isUploading: false,
    progress: 0,
    status: 'preparing'
  })
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Array input states
  const [newTag, setNewTag] = useState('')
  const [newEquipment, setNewEquipment] = useState('')
  const [newGoal, setNewGoal] = useState('')

  // Metadata form handlers
  const handleMetadataChange = useCallback((field: keyof VideoMetadata, value: any) => {
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

  const handleArrayAdd = (field: 'tags' | 'requiredEquipment' | 'goals', value: string) => {
    if (value.trim()) {
      setMetadata(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }))
    }
  }

  const handleArrayRemove = (field: 'tags' | 'requiredEquipment' | 'goals', index: number) => {
    setMetadata(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }))
  }

  // Video file selection
  const handleVideoFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Validate file
    const validation = validateVideoFile(file)
    if (!validation.valid) {
      setErrors({ video: validation.error || 'קובץ לא תקין' })
      setSelectedVideoFile(null)
      return
    }
    
    setSelectedVideoFile(file)
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.video
      return newErrors
    })
    
    // Auto-fill some metadata from file
    setMetadata(prev => ({
      ...prev,
      fileName: file.name,
      fileSize: file.size,
      format: file.name.split('.').pop()?.toLowerCase() || 'unknown'
    }))
  }, [])

  // Thumbnail file selection
  const handleThumbnailFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Validate image file
    if (!file.type.startsWith('image/')) {
      setErrors({ thumbnail: 'קובץ התמונה חייב להיות תמונה' })
      setSelectedThumbnailFile(null)
      return
    }
    
    // Check file size (max 5MB for thumbnails)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ thumbnail: 'קובץ התמונה גדול מדי (מקסימום 5MB)' })
      setSelectedThumbnailFile(null)
      return
    }
    
    setSelectedThumbnailFile(file)
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.thumbnail
      return newErrors
    })
  }, [])

  // Drag and drop handlers for video
  const handleVideoDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      const input = videoInputRef.current
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files
        handleVideoFileSelect({ target: input } as React.ChangeEvent<HTMLInputElement>)
      }
    }
  }, [handleVideoFileSelect])

  const handleVideoDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  // Drag and drop handlers for thumbnail
  const handleThumbnailDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const input = thumbnailInputRef.current
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files
        handleThumbnailFileSelect({ target: input } as React.ChangeEvent<HTMLInputElement>)
      }
    }
  }, [handleThumbnailFileSelect])

  const handleThumbnailDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])

  // Form validation functions
  const validateBasicMetadata = (): boolean => {
    const newErrors: Record<string, string> = {}
    
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
  }

  const validateTrainingMetadata = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!metadata.positionSpecific || metadata.positionSpecific.length === 0) {
      newErrors.positionSpecific = 'יש לבחור לפחות עמדה אחת'
    }
    
    if (!metadata.trainingType) {
      newErrors.trainingType = 'יש לבחור סוג אימון'
    }
    
    if (!metadata.ageGroup) {
      newErrors.ageGroup = 'יש לבחור קבוצת גיל'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateDetailsMetadata = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!metadata.instructions?.trim()) {
      newErrors.instructions = 'יש להזין הוראות ביצוע'
    }
    
    if (!metadata.goals || metadata.goals.length === 0) {
      newErrors.goals = 'יש להזין לפחות מטרה אחת'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Stage navigation
  const goToNextStage = () => {
    if (currentStage === 'metadata-basic') {
      if (validateBasicMetadata()) {
        setCurrentStage('metadata-training')
      }
    } else if (currentStage === 'metadata-training') {
      if (validateTrainingMetadata()) {
        setCurrentStage('metadata-details')
      }
    } else if (currentStage === 'metadata-details') {
      if (validateDetailsMetadata()) {
        setCurrentStage('video')
      }
    } else if (currentStage === 'video') {
      if (selectedVideoFile) {
        setCurrentStage('thumbnail')
      } else {
        setErrors({ video: 'יש לבחור קובץ וידאו' })
      }
    }
  }

  const goToPreviousStage = () => {
    if (currentStage === 'metadata-training') {
      setCurrentStage('metadata-basic')
    } else if (currentStage === 'metadata-details') {
      setCurrentStage('metadata-training')
    } else if (currentStage === 'video') {
      setCurrentStage('metadata-details')
    } else if (currentStage === 'thumbnail') {
      setCurrentStage('video')
    }
  }

  // Video upload
  const uploadVideo = async () => {
    if (!selectedVideoFile || !user) return
    
    try {
      setVideoUploadState({ isUploading: true, progress: 0, status: 'preparing' })
      
      const videoUpload = {
        file: selectedVideoFile,
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
          setVideoUploadState(prev => ({ ...prev, progress }))
        },
        (status) => {
          setVideoUploadState(prev => ({ ...prev, status }))
        }
      )
      
      setVideoUploadState({ isUploading: false, progress: 100, status: 'completed' })
      
      // Store the uploaded video for thumbnail stage
      setMetadata(prev => ({
        ...prev,
        ...uploadedVideo,
        id: uploadedVideo.id,
        videoUrl: uploadedVideo.videoUrl
      }))
      
      setCurrentStage('thumbnail')
      
    } catch (error) {
      console.error('Video upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'שגיאה בהעלאת הסרטון'
      setVideoUploadState({ isUploading: false, progress: 0, status: 'error', error: errorMessage })
      showMessage(errorMessage, 'error')
    }
  }

  // Thumbnail upload
  const uploadThumbnail = async () => {
    if (!selectedThumbnailFile || !metadata.id) return
    
    try {
      setThumbnailUploadState({ isUploading: true, progress: 0, status: 'preparing' })
      
      // Upload thumbnail to Firebase Storage
      const timestamp = Date.now()
      const fileName = `thumbnails/${timestamp}_${selectedThumbnailFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const thumbnailRef = ref(storage, fileName)
      
      setThumbnailUploadState(prev => ({ ...prev, status: 'uploading' }))
      
      const uploadTask = uploadBytesResumable(thumbnailRef, selectedThumbnailFile)
      
      return new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            setThumbnailUploadState(prev => ({ ...prev, progress }))
          },
          (error) => {
            console.error('Thumbnail upload error:', error)
            reject(new Error(`Thumbnail upload failed: ${error.message}`))
          },
          async () => {
            try {
              setThumbnailUploadState(prev => ({ ...prev, status: 'processing' }))
              
              // Get download URL
              const thumbnailUrl = await getDownloadURL(uploadTask.snapshot.ref)
              
              // Update video metadata with thumbnail URL
              await videoService.updateVideo(metadata.id!, { thumbnailUrl })
              
              setThumbnailUploadState({ isUploading: false, progress: 100, status: 'completed' })
              setCurrentStage('completed')
              
              showMessage('הסרטון והתמונה הועלו בהצלחה!', 'success')
              
              // Call completion callback
              const finalVideo = {
                ...metadata,
                thumbnailUrl
              } as VideoMetadata
              
              onUploadComplete?.(finalVideo)
              
              resolve()
              
            } catch (error) {
              console.error('Thumbnail processing error:', error)
              reject(new Error(`Thumbnail processing failed: ${error}`))
            }
          }
        )
      })
      
    } catch (error) {
      console.error('Thumbnail upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'שגיאה בהעלאת התמונה'
      setThumbnailUploadState({ isUploading: false, progress: 0, status: 'error', error: errorMessage })
      showMessage(errorMessage, 'error')
    }
  }

  // Skip thumbnail upload
  const skipThumbnail = () => {
    setCurrentStage('completed')
    showMessage('הסרטון הועלה בהצלחה!', 'success')
    
    const finalVideo = {
      ...metadata
    } as VideoMetadata
    
    onUploadComplete?.(finalVideo)
  }

  // Reset form
  const resetForm = () => {
    setCurrentStage('metadata-basic')
    setMetadata({
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
      expectedDuration: 0,
      status: 'pending'
    })
    setSelectedVideoFile(null)
    setSelectedThumbnailFile(null)
    setVideoUploadState({ isUploading: false, progress: 0, status: 'preparing' })
    setThumbnailUploadState({ isUploading: false, progress: 0, status: 'preparing' })
    setErrors({})
    setNewTag('')
    setNewEquipment('')
    setNewGoal('')
  }


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4 space-x-reverse">
              <h2 className="text-xl font-bold">העלאת סרטון חדש</h2>
              
              {/* Progress indicator */}
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStage === 'metadata-basic' ? 'bg-blue-600 text-white' : 
                  ['metadata-training', 'metadata-details', 'video', 'thumbnail', 'completed'].includes(currentStage) ? 'bg-green-600 text-white' : 'bg-gray-300'
                }`}>
                  1
                </div>
                <div className="w-8 h-1 bg-gray-300 rounded"></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStage === 'metadata-training' ? 'bg-blue-600 text-white' : 
                  ['metadata-details', 'video', 'thumbnail', 'completed'].includes(currentStage) ? 'bg-green-600 text-white' : 'bg-gray-300'
                }`}>
                  2
                </div>
                <div className="w-8 h-1 bg-gray-300 rounded"></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStage === 'metadata-details' ? 'bg-blue-600 text-white' : 
                  ['video', 'thumbnail', 'completed'].includes(currentStage) ? 'bg-green-600 text-white' : 'bg-gray-300'
                }`}>
                  3
                </div>
                <div className="w-8 h-1 bg-gray-300 rounded"></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStage === 'video' ? 'bg-blue-600 text-white' : 
                  ['thumbnail', 'completed'].includes(currentStage) ? 'bg-green-600 text-white' : 'bg-gray-300'
                }`}>
                  4
                </div>
                <div className="w-8 h-1 bg-gray-300 rounded"></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStage === 'thumbnail' ? 'bg-blue-600 text-white' : 
                  currentStage === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-300'
                }`}>
                  5
                </div>
              </div>
            </div>
            
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 p-2"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          {/* Stage 1: Basic Metadata */}
          {currentStage === 'metadata-basic' && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">פרטי הסרטון הבסיסיים</h3>
                <p className="text-gray-600">הזן את המידע הבסיסי על הסרטון</p>
              </div>
              
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Title Input */}
                <div className="space-y-2">
                  <label className="block text-lg font-semibold text-gray-800">
                    כותרת הסרטון *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={metadata.title || ''}
                      onChange={(e) => handleMetadataChange('title', e.target.value)}
                      className={`w-full text-lg px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        errors.title ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                      }`}
                      placeholder="לדוגמה: תרגיל כדרור בסיסי לגילאי 10-12"
                      maxLength={100}
                    />
                    <div className="absolute left-3 top-3 text-gray-400">
                      <i className="fas fa-heading"></i>
                    </div>
                  </div>
                  {errors.title && <p className="text-red-600 text-sm mt-1 flex items-center">
                    <i className="fas fa-exclamation-circle ml-1"></i>
                    {errors.title}
                  </p>}
                  <p className="text-sm text-gray-500">כותרת ברורה ומתארת את תוכן הסרטון</p>
                </div>

                {/* Description Input */}
                <div className="space-y-2">
                  <label className="block text-lg font-semibold text-gray-800">
                    תיאור הסרטון *
                  </label>
                  <div className="relative">
                    <textarea
                      value={metadata.description || ''}
                      onChange={(e) => handleMetadataChange('description', e.target.value)}
                      rows={4}
                      className={`w-full text-lg px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${
                        errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                      }`}
                      placeholder="תאר את תוכן הסרטון, המטרות שלו, ומה השחקנים ילמדו..."
                      maxLength={500}
                    />
                    <div className="absolute left-3 top-3 text-gray-400">
                      <i className="fas fa-align-right"></i>
                    </div>
                  </div>
                  {errors.description && <p className="text-red-600 text-sm mt-1 flex items-center">
                    <i className="fas fa-exclamation-circle ml-1"></i>
                    {errors.description}
                  </p>}
                  <p className="text-sm text-gray-500">תיאור מפורט שיעזור לשחקנים להבין מה הם ילמדו</p>
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="block text-lg font-semibold text-gray-800">
                    קטגוריית הסרטון
                  </label>
                  <div className="relative">
                    <select
                      value={metadata.category || 'training-exercise'}
                      onChange={(e) => handleMetadataChange('category', e.target.value as VideoCategory)}
                      className="w-full text-lg px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all"
                    >
                      {Object.entries(VIDEO_CATEGORY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-3 text-gray-400">
                      <i className="fas fa-tags"></i>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">בחר את הקטגוריה המתאימה ביותר לסרטון</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
                >
                  <i className="fas fa-times ml-2"></i>
                  ביטול
                </button>
                <button
                  type="button"
                  onClick={goToNextStage}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg hover:shadow-xl"
                >
                  המשך לשלב הבא
                  <i className="fas fa-arrow-left mr-2"></i>
                </button>
              </div>
            </div>
          )}

          {/* Stage 2: Training Metadata */}
          {currentStage === 'metadata-training' && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">סיווג מערכת האימונים</h3>
                <p className="text-gray-600">הגדר את הפרמטרים הטכניים של האימון</p>
              </div>
              
              <div className="max-w-4xl mx-auto space-y-8">
                {/* Training Type and Skill Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-lg font-semibold text-gray-800">
                      סוג אימון *
                    </label>
                    <div className="relative">
                      <select
                        value={metadata.trainingType || 'general-training'}
                        onChange={(e) => handleMetadataChange('trainingType', e.target.value as TrainingType)}
                        className={`w-full text-lg px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.trainingType ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                        }`}
                      >
                        {Object.entries(TRAINING_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <div className="absolute left-3 top-3 text-gray-400">
                        <i className="fas fa-dumbbell"></i>
                      </div>
                    </div>
                    {errors.trainingType && <p className="text-red-600 text-sm mt-1 flex items-center">
                      <i className="fas fa-exclamation-circle ml-1"></i>
                      {errors.trainingType}
                    </p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-lg font-semibold text-gray-800">
                      רמת מיומנות
                    </label>
                    <div className="relative">
                      <select
                        value={metadata.skillLevel || 'beginner'}
                        onChange={(e) => handleMetadataChange('skillLevel', e.target.value)}
                        className="w-full text-lg px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all"
                      >
                        <option value="beginner">מתחיל</option>
                        <option value="intermediate">בינוני</option>
                        <option value="advanced">מתקדם</option>
                      </select>
                      <div className="absolute left-3 top-3 text-gray-400">
                        <i className="fas fa-chart-line"></i>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Age Group and Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-lg font-semibold text-gray-800">
                      קבוצת גיל *
                    </label>
                    <div className="relative">
                      <select
                        value={metadata.ageGroup || 'u10'}
                        onChange={(e) => handleMetadataChange('ageGroup', e.target.value as AgeGroup)}
                        className={`w-full text-lg px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.ageGroup ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                        }`}
                      >
                        {Object.entries(AGE_GROUP_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <div className="absolute left-3 top-3 text-gray-400">
                        <i className="fas fa-users"></i>
                      </div>
                    </div>
                    {errors.ageGroup && <p className="text-red-600 text-sm mt-1 flex items-center">
                      <i className="fas fa-exclamation-circle ml-1"></i>
                      {errors.ageGroup}
                    </p>}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-lg font-semibold text-gray-800">
                      רמת קושי (1-10)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={metadata.difficultyLevel || 1}
                        onChange={(e) => handleMetadataChange('difficultyLevel', parseInt(e.target.value))}
                        className="w-full text-lg px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all"
                      />
                      <div className="absolute left-3 top-3 text-gray-400">
                        <i className="fas fa-star"></i>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Position Selection */}
                <div className="space-y-2">
                  <label className="block text-lg font-semibold text-gray-800">
                    עמדות רלוונטיות *
                  </label>
                  <div className={`border-2 rounded-xl p-4 ${
                    errors.positionSpecific ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {Object.entries(POSITION_LABELS).map(([value, label]) => (
                        <label key={value} className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={metadata.positionSpecific?.includes(value as Position) || false}
                            onChange={(e) => {
                              const positions = metadata.positionSpecific || []
                              if (e.target.checked) {
                                handleMetadataChange('positionSpecific', [...positions, value as Position])
                              } else {
                                handleMetadataChange('positionSpecific', positions.filter(p => p !== value))
                              }
                            }}
                            className="ml-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {errors.positionSpecific && <p className="text-red-600 text-sm mt-1 flex items-center">
                    <i className="fas fa-exclamation-circle ml-1"></i>
                    {errors.positionSpecific}
                  </p>}
                  <p className="text-sm text-gray-500">בחר את העמדות הרלוונטיות לתרגיל</p>
                </div>

                {/* Exercise Type */}
                <div className="space-y-2">
                  <label className="block text-lg font-semibold text-gray-800">
                    סוג תרגיל
                  </label>
                  <div className="relative">
                    <select
                      value={metadata.exerciseType || 'dribbling'}
                      onChange={(e) => handleMetadataChange('exerciseType', e.target.value as ExerciseType)}
                      className="w-full text-lg px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all"
                    >
                      {Object.entries(EXERCISE_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-3 text-gray-400">
                      <i className="fas fa-futbol"></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <button
                  type="button"
                  onClick={goToPreviousStage}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
                >
                  <i className="fas fa-arrow-right ml-2"></i>
                  חזור
                </button>
                <button
                  type="button"
                  onClick={goToNextStage}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg hover:shadow-xl"
                >
                  המשך לשלב הבא
                  <i className="fas fa-arrow-left mr-2"></i>
                </button>
              </div>
            </div>
          )}

          {/* Stage 3: Details Metadata */}
          {currentStage === 'metadata-details' && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">פרטים נוספים</h3>
                <p className="text-gray-600">הוסף הוראות, מטרות וציוד נדרש</p>
              </div>
              
              <div className="max-w-4xl mx-auto space-y-8">
                {/* Instructions */}
                <div className="space-y-2">
                  <label className="block text-lg font-semibold text-gray-800">
                    הוראות ביצוע *
                  </label>
                  <div className="relative">
                    <textarea
                      value={metadata.instructions || ''}
                      onChange={(e) => handleMetadataChange('instructions', e.target.value)}
                      rows={6}
                      className={`w-full text-lg px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${
                        errors.instructions ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-gray-400 focus:border-blue-500'
                      }`}
                      placeholder="כתב הוראות מפורטות כיצד לבצע את התרגיל, שלב אחר שלב..."
                    />
                    <div className="absolute left-3 top-3 text-gray-400">
                      <i className="fas fa-list-ol"></i>
                    </div>
                  </div>
                  {errors.instructions && <p className="text-red-600 text-sm mt-1 flex items-center">
                    <i className="fas fa-exclamation-circle ml-1"></i>
                    {errors.instructions}
                  </p>}
                  <p className="text-sm text-gray-500">הוראות ברורות שיעזרו לשחקנים לבצע את התרגיל נכון</p>
                </div>

                {/* Goals */}
                <div className="space-y-2">
                  <label className="block text-lg font-semibold text-gray-800">
                    מטרות התרגיל *
                  </label>
                  <div className={`border-2 rounded-xl p-4 ${
                    errors.goals ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder="הוסף מטרה חדשה..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {metadata.goals?.map((goal, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          <i className="fas fa-target ml-2"></i>
                          {goal}
                          <button
                            type="button"
                            onClick={() => handleArrayRemove('goals', index)}
                            className="mr-2 text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  {errors.goals && <p className="text-red-600 text-sm mt-1 flex items-center">
                    <i className="fas fa-exclamation-circle ml-1"></i>
                    {errors.goals}
                  </p>}
                  <p className="text-sm text-gray-500">מה השחקנים ילמדו או ישפרו בתרגיל הזה</p>
                </div>

                {/* Required Equipment */}
                <div className="space-y-2">
                  <label className="block text-lg font-semibold text-gray-800">
                    ציוד נדרש
                  </label>
                  <div className="border-2 border-gray-300 rounded-xl p-4">
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        value={newEquipment}
                        onChange={(e) => setNewEquipment(e.target.value)}
                        placeholder="הוסף ציוד נדרש..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {metadata.requiredEquipment?.map((equipment, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                        >
                          <i className="fas fa-tools ml-2"></i>
                          {equipment}
                          <button
                            type="button"
                            onClick={() => handleArrayRemove('requiredEquipment', index)}
                            className="mr-2 text-green-600 hover:text-green-800 transition-colors"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">הציוד הנדרש לביצוע התרגיל</p>
                </div>

                {/* Expected Duration */}
                <div className="space-y-2">
                  <label className="block text-lg font-semibold text-gray-800">
                    משך זמן צפוי (דקות)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={metadata.expectedDuration || 0}
                      onChange={(e) => handleMetadataChange('expectedDuration', parseInt(e.target.value))}
                      className="w-full text-lg px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-gray-400 transition-all"
                    />
                    <div className="absolute left-3 top-3 text-gray-400">
                      <i className="fas fa-clock"></i>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">כמה זמן ייקח לשחקן לבצע את התרגיל</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <button
                  type="button"
                  onClick={goToPreviousStage}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium"
                >
                  <i className="fas fa-arrow-right ml-2"></i>
                  חזור
                </button>
                <button
                  type="button"
                  onClick={goToNextStage}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-lg hover:shadow-xl"
                >
                  המשך להעלאת הוידאו
                  <i className="fas fa-arrow-left mr-2"></i>
                </button>
              </div>
            </div>
          )}

          {/* Stage 4: Video Upload */}
          {currentStage === 'video' && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">העלאת קובץ הוידאו</h3>
                <p className="text-gray-600">בחר את קובץ הוידאו שברצונך להעלות</p>
              </div>
              
              {!videoUploadState.isUploading && videoUploadState.status !== 'completed' && (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDrop={handleVideoDrop}
                  onDragOver={handleVideoDragOver}
                  onClick={() => videoInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={videoInputRef}
                    onChange={handleVideoFileSelect}
                    accept="video/*"
                    className="hidden"
                  />
                  
                  <div className="space-y-4">
                    <div className="text-6xl text-gray-400">
                      <i className="fas fa-video"></i>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        העלאת קובץ וידאו
                      </h4>
                      <p className="text-gray-600 mb-4">
                        גרור קובץ וידאו לכאן או לחץ לבחירת קובץ
                      </p>
                      
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>פורמטים נתמכים: MP4, MOV, AVI, WebM</p>
                        <p>גודל מקסימלי: 500MB</p>
                        <p>משך מקסימלי: 10 דקות</p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      className="btn-primary"
                    >
                      בחר קובץ
                    </button>
                  </div>
                  
                  {errors.video && (
                    <div className="mt-4 text-red-600 text-sm">
                      {errors.video}
                    </div>
                  )}
                </div>
              )}

              {/* Selected Video File */}
              {selectedVideoFile && videoUploadState.status !== 'completed' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">קובץ נבחר</h4>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <i className="fas fa-video text-primary-600"></i>
                    <div>
                      <p className="font-medium">{selectedVideoFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(selectedVideoFile.size)} • {selectedVideoFile.type}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVideoFile(null)
                        setErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors.video
                          return newErrors
                        })
                        if (videoInputRef.current) videoInputRef.current.value = ''
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {videoUploadState.isUploading && (
                <div className="bg-white border rounded-lg p-6">
                  <div className="text-center space-y-4">
                    <div className="text-lg font-medium text-gray-900">
                      {videoUploadState.status === 'preparing' && 'מכין להעלאה...'}
                      {videoUploadState.status === 'uploading' && 'מעלה קובץ...'}
                      {videoUploadState.status === 'processing' && 'מעבד נתונים...'}
                    </div>
                    
                    {videoUploadState.status === 'uploading' && (
                      <>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${videoUploadState.progress}%` }}
                          />
                        </div>
                        <div className="text-sm text-gray-600">
                          {Math.round(videoUploadState.progress)}% הושלם
                        </div>
                      </>
                    )}
                    
                    {videoUploadState.status === 'processing' && (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Upload Error */}
              {videoUploadState.status === 'error' && videoUploadState.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-triangle text-red-600 ml-3"></i>
                    <div>
                      <h4 className="text-red-800 font-medium">שגיאה בהעלאת הסרטון</h4>
                      <p className="text-red-700 text-sm mt-1">{videoUploadState.error}</p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setVideoUploadState({ isUploading: false, progress: 0, status: 'preparing' })}
                    className="mt-3 text-red-600 hover:text-red-700 text-sm underline"
                  >
                    נסה שוב
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <button
                  type="button"
                  onClick={goToPreviousStage}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  חזור
                </button>
                
                <div className="space-x-4 space-x-reverse">
                  {selectedVideoFile && videoUploadState.status !== 'completed' && (
                    <button
                      type="button"
                      onClick={uploadVideo}
                      disabled={videoUploadState.isUploading}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      {videoUploadState.isUploading ? 'מעלה...' : 'העלה סרטון'}
                    </button>
                  )}
                  
                  {videoUploadState.status === 'completed' && (
                    <button
                      type="button"
                      onClick={goToNextStage}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      המשך לתמונה
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stage 5: Thumbnail Upload */}
          {currentStage === 'thumbnail' && (
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">העלאת תמונה מייצגת</h3>
                <p className="text-gray-600">הוסף תמונה מייצגת לסרטון (אופציונלי)</p>
              </div>
              
              {!thumbnailUploadState.isUploading && thumbnailUploadState.status !== 'completed' && (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDrop={handleThumbnailDrop}
                  onDragOver={handleThumbnailDragOver}
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={thumbnailInputRef}
                    onChange={handleThumbnailFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <div className="space-y-4">
                    <div className="text-6xl text-gray-400">
                      <i className="fas fa-image"></i>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        העלאת תמונה מייצגת
                      </h4>
                      <p className="text-gray-600 mb-4">
                        גרור תמונה לכאן או לחץ לבחירת קובץ
                      </p>
                      
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>פורמטים נתמכים: JPG, PNG, GIF</p>
                        <p>גודל מקסימלי: 5MB</p>
                        <p>מומלץ: 16:9 או 4:3</p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      className="btn-primary"
                    >
                      בחר תמונה
                    </button>
                  </div>
                  
                  {errors.thumbnail && (
                    <div className="mt-4 text-red-600 text-sm">
                      {errors.thumbnail}
                    </div>
                  )}
                </div>
              )}

              {/* Selected Thumbnail File */}
              {selectedThumbnailFile && thumbnailUploadState.status !== 'completed' && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">תמונה נבחרת</h4>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <img
                      src={URL.createObjectURL(selectedThumbnailFile)}
                      alt="Preview"
                      className="w-16 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{selectedThumbnailFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(selectedThumbnailFile.size)} • {selectedThumbnailFile.type}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedThumbnailFile(null)
                        setErrors(prev => {
                          const newErrors = { ...prev }
                          delete newErrors.thumbnail
                          return newErrors
                        })
                        if (thumbnailInputRef.current) thumbnailInputRef.current.value = ''
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {thumbnailUploadState.isUploading && (
                <div className="bg-white border rounded-lg p-6">
                  <div className="text-center space-y-4">
                    <div className="text-lg font-medium text-gray-900">
                      {thumbnailUploadState.status === 'preparing' && 'מכין להעלאה...'}
                      {thumbnailUploadState.status === 'uploading' && 'מעלה תמונה...'}
                      {thumbnailUploadState.status === 'processing' && 'מעבד נתונים...'}
                    </div>
                    
                    {thumbnailUploadState.status === 'uploading' && (
                      <>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${thumbnailUploadState.progress}%` }}
                          />
                        </div>
                        <div className="text-sm text-gray-600">
                          {Math.round(thumbnailUploadState.progress)}% הושלם
                        </div>
                      </>
                    )}
                    
                    {thumbnailUploadState.status === 'processing' && (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Upload Error */}
              {thumbnailUploadState.status === 'error' && thumbnailUploadState.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <i className="fas fa-exclamation-triangle text-red-600 ml-3"></i>
                    <div>
                      <h4 className="text-red-800 font-medium">שגיאה בהעלאת התמונה</h4>
                      <p className="text-red-700 text-sm mt-1">{thumbnailUploadState.error}</p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setThumbnailUploadState({ isUploading: false, progress: 0, status: 'preparing' })}
                    className="mt-3 text-red-600 hover:text-red-700 text-sm underline"
                  >
                    נסה שוב
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <button
                  type="button"
                  onClick={goToPreviousStage}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  חזור
                </button>
                
                <div className="space-x-4 space-x-reverse">
                  <button
                    type="button"
                    onClick={skipThumbnail}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    דלג על תמונה
                  </button>
                  
                  {selectedThumbnailFile && thumbnailUploadState.status !== 'completed' && (
                    <button
                      type="button"
                      onClick={uploadThumbnail}
                      disabled={thumbnailUploadState.isUploading}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                      {thumbnailUploadState.isUploading ? 'מעלה...' : 'העלה תמונה'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Stage 6: Completed */}
          {currentStage === 'completed' && (
            <div className="text-center space-y-6">
              <div className="text-6xl text-green-600">
                <i className="fas fa-check-circle"></i>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  הסרטון הועלה בהצלחה!
                </h3>
                <p className="text-gray-600">
                  הסרטון נשמר במערכת וממתין לאישור מנהל
                </p>
              </div>
              
              <div className="flex justify-center space-x-4 space-x-reverse">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  העלה סרטון נוסף
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  סגור
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
