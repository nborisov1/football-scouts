'use client'

import React, { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { videoService } from '@/lib/videoService'
import { showMessage } from '@/components/MessageContainer'
import type { VideoMetadata, VideoCategory, ExerciseType } from '@/types/video'

interface VideoUploadProps {
  onUploadComplete?: (video: VideoMetadata) => void
  onUploadStart?: () => void
  category?: VideoCategory
  exerciseType?: ExerciseType
  className?: string
  defaultMetadata?: Partial<VideoMetadata>
}

export default function VideoUpload({
  onUploadComplete,
  onUploadStart,
  category,
  exerciseType,
  className = '',
  defaultMetadata
}: VideoUploadProps) {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    category: category || 'training-exercise' as VideoCategory,
    skillLevel: 'beginner' as const,
    exerciseType: exerciseType || 'dribbling' as ExerciseType,
    ...defaultMetadata
  })

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Basic validation
    if (!file.type.startsWith('video/')) {
      showMessage('יש לבחור קובץ וידאו', 'error')
      return
    }

    if (file.size > 500 * 1024 * 1024) { // 500MB limit
      showMessage('קובץ גדול מדי (מקסימום 500MB)', 'error')
      return
    }

    setSelectedFile(file)
    setShowForm(true)
    setMetadata(prev => ({
      ...prev,
      title: prev.title || file.name.replace(/\.[^/.]+$/, '')
    }))
  }

  // Generate thumbnail from video
  const generateThumbnail = async (videoFile: File): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      video.preload = 'metadata'
      video.muted = true // Required for autoplay in some browsers
      
      video.addEventListener('loadedmetadata', () => {
        canvas.width = Math.min(video.videoWidth, 1280) // Max width 1280px
        canvas.height = Math.min(video.videoHeight, 720) // Max height 720px
        
        // Maintain aspect ratio
        const aspectRatio = video.videoWidth / video.videoHeight
        if (canvas.width / canvas.height > aspectRatio) {
          canvas.width = canvas.height * aspectRatio
        } else {
          canvas.height = canvas.width / aspectRatio
        }
        
        video.currentTime = video.duration * 0.1 // 10% into video for better frame
      })

      video.addEventListener('seeked', () => {
        if (ctx && video.readyState >= 2) { // HAVE_CURRENT_DATA
          try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            canvas.toBlob((blob) => {
              URL.revokeObjectURL(video.src) // Clean up memory
              resolve(blob)
            }, 'image/jpeg', 0.85) // Higher quality
          } catch (error) {
            console.warn('Error drawing video frame:', error)
            resolve(null)
          }
        } else {
          resolve(null)
        }
      })

      video.addEventListener('error', (e) => {
        console.warn('Video loading error:', e)
        resolve(null)
      })
      
      video.src = URL.createObjectURL(videoFile)
      video.load()
    })
  }

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile || !user) return

    if (!metadata.title.trim() || !metadata.description.trim()) {
      showMessage('יש למלא כותרת ותיאור', 'error')
      return
    }

    try {
      setUploading(true)
      setProgress(0)
      onUploadStart?.()

      // Generate thumbnail automatically
      const thumbnailBlob = await generateThumbnail(selectedFile)

      const videoUpload = {
        file: selectedFile,
        metadata: {
          ...metadata,
          uploadedBy: user.uid,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          duration: 0,
          format: selectedFile.name.split('.').pop()?.toLowerCase() || 'unknown',
          resolution: '1080p',
          status: 'pending' as const,
          tags: [],
          requiredEquipment: [],
          goals: [],
          targetAudience: 'amateur' as const,
          trainingType: 'general-training' as const,
          positionSpecific: [],
          ageGroup: 'u10' as const,
          difficultyLevel: 1,
          instructions: '',
          expectedDuration: 0,
          playerInfo: user.type === 'player' ? {
            playerId: user.uid,
            playerName: user.email || 'שחקן לא מזוהה',
            position: user.position || '',
            age: user.age || 0,
            level: user.level || 'amateur'
          } : undefined
        }
      }

      const uploadedVideo = await videoService.uploadVideo(
        videoUpload,
        (progressPercent) => setProgress(progressPercent),
        (status) => console.log('Upload status:', status)
      )

      // Upload thumbnail if generated
      if (thumbnailBlob) {
        try {
          const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' })
          const thumbnailUrl = await videoService.uploadThumbnail(uploadedVideo.id, thumbnailFile)
          await videoService.updateVideo(uploadedVideo.id, { thumbnailUrl })
        } catch (error) {
          console.warn('Failed to upload thumbnail:', error)
        }
      }

      // Reset form
      setSelectedFile(null)
      setShowForm(false)
      setMetadata({
        title: '',
        description: '',
        category: category || 'training-exercise',
        skillLevel: 'beginner',
        exerciseType: exerciseType || 'dribbling',
        ...defaultMetadata
      })
      setProgress(0)
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      onUploadComplete?.(uploadedVideo)
      showMessage('הסרטון הועלה בהצלחה!', 'success')

    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'שגיאה בהעלאת הסרטון'
      showMessage(errorMessage, 'error')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  // Drag and drop handlers
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      const input = fileInputRef.current
      if (input) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input.files = dataTransfer.files
        handleFileSelect({ target: input } as React.ChangeEvent<HTMLInputElement>)
      }
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  return (
    <div className={`video-upload bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      {/* File Selection Area */}
      {!showForm && (
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
            <div className="text-4xl text-gray-400">
              <i className="fas fa-video"></i>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                העלאת סרטון
              </h3>
              <p className="text-gray-600 mb-4">
                גרור קובץ וידאו לכאן או לחץ לבחירת קובץ
              </p>
              
              <div className="text-sm text-gray-500">
                <p>פורמטים: MP4, MOV, AVI, WebM</p>
                <p>גודל מקסימלי: 500MB</p>
              </div>
            </div>
            
            <button type="button" className="btn-primary">
              בחר קובץ
            </button>
          </div>
        </div>
      )}

      {/* Metadata Form */}
      {showForm && selectedFile && !uploading && (
        <div className="space-y-6">
          {/* File Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <i className="fas fa-video text-blue-600"></i>
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600">
                    {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null)
                  setShowForm(false)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="text-red-600 hover:text-red-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                כותרת הסרטון *
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="כותרת תיאורית לסרטון"
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תיאור הסרטון *
              </label>
              <textarea
                value={metadata.description}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="תיאור מפורט של תוכן הסרטון"
                maxLength={500}
              />
            </div>

            {/* Category & Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  קטגוריה
                </label>
                <select
                  value={metadata.category}
                  onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value as VideoCategory }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="training-exercise">תרגיל אימון</option>
                  <option value="technique-demo">הדגמת טכניקה</option>
                  <option value="game-analysis">ניתוח משחק</option>
                  <option value="fitness-training">אימון כושר</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  רמת קושי
                </label>
                <select
                  value={metadata.skillLevel}
                  onChange={(e) => setMetadata(prev => ({ ...prev, skillLevel: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">מתחיל</option>
                  <option value="intermediate">בינוני</option>
                  <option value="advanced">מתקדם</option>
                </select>
              </div>
            </div>

            {/* Exercise Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                סוג תרגיל
              </label>
              <select
                value={metadata.exerciseType}
                onChange={(e) => setMetadata(prev => ({ ...prev, exerciseType: e.target.value as ExerciseType }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dribbling">כדרור</option>
                <option value="passing">מסירות</option>
                <option value="shooting">זריקות</option>
                <option value="defending">הגנה</option>
                <option value="fitness">כושר</option>
                <option value="tactical">טקטי</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 space-x-reverse pt-4 border-t">
            <button
              onClick={handleUpload}
              disabled={!metadata.title.trim() || !metadata.description.trim()}
              className="flex-1 btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <i className="fas fa-upload ml-2"></i>
              העלה סרטון
            </button>
            
            <button
              onClick={() => {
                setSelectedFile(null)
                setShowForm(false)
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
      {uploading && (
        <div className="bg-white border rounded-lg p-6">
          <div className="text-center space-y-4">
            <div className="text-lg font-medium text-gray-900">
              מעלה סרטון...
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="text-sm text-gray-600">
              {Math.round(progress)}% הושלם
            </div>
          </div>
        </div>
      )}
    </div>
  )
}