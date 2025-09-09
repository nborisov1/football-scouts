'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { showMessage } from '@/components/MessageContainer'
import { videoService } from '@/lib/videoService'
import { USER_TYPES } from '@/lib/firebase'
import type { VideoMetadata } from '@/types/video'

export default function AdminVideos() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State
  const [videos, setVideos] = useState<VideoMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [filter, setFilter] = useState<'all'>('all')
  const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(null)
  const [showVariantModal, setShowVariantModal] = useState(false)
  const [variantBaseVideo, setVariantBaseVideo] = useState<VideoMetadata | null>(null)
  
  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    category: 'training-exercise' as const,
    exerciseType: 'dribbling' as const,
    positionSpecific: [] as string[],
    difficultyLevels: [
      { skillLevel: 'beginner' as const, threshold: 10, enabled: false },
      { skillLevel: 'intermediate' as const, threshold: 30, enabled: false },
      { skillLevel: 'advanced' as const, threshold: 60, enabled: false }
    ]
  })
  
  // Variant metadata state
  const [variantMetadata, setVariantMetadata] = useState({
    skillLevel: 'intermediate' as const,
    progressionThreshold: 30,
    variantLabel: ''
  })

  // Load videos from Firebase
  const loadVideos = async () => {
    try {
      setLoading(true)
      const result = await videoService.getVideos(
        {}, // No status filtering needed
        undefined, // sort
        50 // pageSize
      )
      setVideos(result.videos)
    } catch (error) {
      console.error('Error loading videos:', error)
      showMessage('שגיאה בטעינת הסרטונים', 'error')
      setVideos([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVideos()
  }, [filter])

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      showMessage('יש לבחור קובץ וידאו', 'error')
      return
    }

    if (file.size > 500 * 1024 * 1024) {
      showMessage('קובץ גדול מדי (מקסימום 500MB)', 'error')
      return
    }

    setSelectedFile(file)
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
      video.muted = true
      
      video.addEventListener('loadedmetadata', () => {
        canvas.width = Math.min(video.videoWidth, 1280)
        canvas.height = Math.min(video.videoHeight, 720)
        
        const aspectRatio = video.videoWidth / video.videoHeight
        if (canvas.width / canvas.height > aspectRatio) {
          canvas.width = canvas.height * aspectRatio
        } else {
          canvas.height = canvas.width / aspectRatio
        }
        
        video.currentTime = video.duration * 0.1
      })

      video.addEventListener('seeked', () => {
        if (ctx && video.readyState >= 2) {
          try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            canvas.toBlob((blob) => {
              URL.revokeObjectURL(video.src)
              resolve(blob)
            }, 'image/jpeg', 0.85)
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

    const enabledLevels = metadata.difficultyLevels.filter(level => level.enabled)
    if (enabledLevels.length === 0) {
      showMessage('יש לבחור לפחות רמת קושי אחת', 'error')
      return
    }

    try {
      setUploading(true)
      setProgress(0)

      // Generate thumbnail from video
      const thumbnailBlob = await generateThumbnail(selectedFile)

      const uploadedVideos: VideoMetadata[] = []
      const totalUploads = enabledLevels.length
      
      for (let i = 0; i < enabledLevels.length; i++) {
        const level = enabledLevels[i]
        const isFirst = i === 0
        const progressOffset = (i / totalUploads) * 90 // 90% for uploads, 10% for thumbnails
        
        // Create video title with difficulty suffix if multiple levels
        const videoTitle = totalUploads > 1 
          ? `${metadata.title} - ${level.skillLevel === 'beginner' ? 'מתחיל' : level.skillLevel === 'intermediate' ? 'בינוני' : 'מתקדם'}`
          : metadata.title

        const videoUpload = {
          file: isFirst ? selectedFile : selectedFile, // All use same file
          metadata: {
            title: videoTitle,
            description: metadata.description,
            category: metadata.category,
            skillLevel: level.skillLevel,
            exerciseType: metadata.exerciseType,
            uploadedBy: user.uid,
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            duration: 0,
            format: selectedFile.name.split('.').pop()?.toLowerCase() || 'unknown',
            resolution: '1080p',
            tags: [],
            requiredEquipment: [],
            goals: [],
            targetAudience: 'amateur' as const,
            trainingType: 'general-training' as const,
            positionSpecific: metadata.positionSpecific as any[],
            ageGroup: 'u10' as const,
            difficultyLevel: level.threshold,
            instructions: '',
            expectedDuration: 0,
            // Mark as variant if not the first upload
            baseVideoId: isFirst ? undefined : uploadedVideos[0]?.id,
            isVariant: !isFirst,
            variantLabel: !isFirst ? (level.skillLevel === 'beginner' ? 'מתחיל' : level.skillLevel === 'intermediate' ? 'בינוני' : 'מתקדם') : undefined
          }
        }

        const uploadedVideo = isFirst 
          ? await videoService.uploadVideo(
              videoUpload,
              (progressPercent) => setProgress(progressOffset + (progressPercent * 0.9 / totalUploads)),
              (status) => console.log('Upload status:', status)
            )
          : await videoService.createVariant(uploadedVideos[0].id, videoUpload.metadata)

        uploadedVideos.push(uploadedVideo)
      }

      // Upload thumbnail for all videos if generated
      if (thumbnailBlob) {
        try {
          setProgress(95)
          const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' })
          
          for (const video of uploadedVideos) {
            const thumbnailUrl = await videoService.uploadThumbnail(video.id, thumbnailFile)
            await videoService.updateVideo(video.id, { thumbnailUrl })
            video.thumbnailUrl = thumbnailUrl
          }
        } catch (error) {
          console.warn('Failed to upload thumbnails:', error)
        }
      }

      // Reset form and refresh list
      setSelectedFile(null)
      setShowUploadModal(false)
      setMetadata({ 
        title: '', 
        description: '', 
        category: 'training-exercise', 
        exerciseType: 'dribbling',
        positionSpecific: [],
        difficultyLevels: [
          { skillLevel: 'beginner' as const, threshold: 10, enabled: false },
          { skillLevel: 'intermediate' as const, threshold: 30, enabled: false },
          { skillLevel: 'advanced' as const, threshold: 60, enabled: false }
        ]
      })
      setProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
      
      // Add to list
      setVideos(prev => [...uploadedVideos, ...prev])
      showMessage(`${uploadedVideos.length} סרטונים הועלו בהצלחה!`, 'success')

    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'שגיאה בהעלאת הסרטון'
      showMessage(errorMessage, 'error')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  // Handle creating difficulty variant
  const handleCreateVariant = async () => {
    if (!variantBaseVideo) return

    if (!variantMetadata.variantLabel.trim()) {
      showMessage('יש להזין תווית לווריאנט', 'error')
      return
    }

    try {
      const variantVideo: Omit<VideoMetadata, 'id' | 'uploadedAt' | 'lastModified' | 'videoUrl' | 'thumbnailUrl' | 'views' | 'likes' | 'downloads'> = {
        ...variantBaseVideo,
        title: `${variantBaseVideo.title} - ${variantMetadata.variantLabel}`,
        skillLevel: variantMetadata.skillLevel,
        difficultyLevel: variantMetadata.progressionThreshold,
        baseVideoId: variantBaseVideo.id,
        isVariant: true,
        variantLabel: variantMetadata.variantLabel,
        uploadedBy: user!.uid,
        fileName: variantBaseVideo.fileName,
        fileSize: variantBaseVideo.fileSize,
        duration: variantBaseVideo.duration,
        format: variantBaseVideo.format,
        resolution: variantBaseVideo.resolution
      }

      const videoUpload = {
        file: null, // No new file upload for variants
        metadata: variantVideo
      }

      // Create variant in database with same video file
      const createdVariant = await videoService.createVariant(variantBaseVideo.id, variantVideo)
      
      // Add to local state
      setVideos(prev => [createdVariant, ...prev])
      
      // Reset and close modal
      setShowVariantModal(false)
      setVariantBaseVideo(null)
      setVariantMetadata({
        skillLevel: 'intermediate',
        progressionThreshold: 30,
        variantLabel: ''
      })
      
      showMessage('ווריאנט נוצר בהצלחה!', 'success')
    } catch (error) {
      console.error('Error creating variant:', error)
      showMessage('שגיאה ביצירת ווריאנט', 'error')
    }
  }

  // Handle video deletion
  const handleVideoDelete = async (videoId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את הסרטון?')) return
    
    try {
      await videoService.deleteVideo(videoId)
      setVideos(prev => prev.filter(video => video.id !== videoId))
      showMessage('הסרטון נמחק בהצלחה', 'success')
    } catch (error) {
      console.error('Error deleting video:', error)
      showMessage('שגיאה במחיקת הסרטון', 'error')
    }
  }

  // Helper functions
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('he-IL')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }


  // Check if user is admin
  if (!user || user.type !== USER_TYPES.ADMIN) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">אין הרשאה</h1>
          <p className="text-gray-600">עמוד זה מיועד למנהלים בלבד</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ניהול סרטונים</h1>
                <p className="text-gray-600">העלה וניהל סרטוני אימון</p>
              </div>
              
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <i className="fas fa-plus ml-2"></i>
                העלה סרטון חדש
              </button>
            </div>
          </div>
        </div>

        {/* Videos Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-medium text-gray-900">
                כל הסרטונים ({videos.length})
              </h2>
            </div>
          </div>
        </div>

        {/* Video List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="mr-3 text-gray-600">טוען סרטונים...</span>
              </div>
            </div>
          ) : videos.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">
                <i className="fas fa-video"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">אין סרטונים</h3>
              <p className="text-gray-600 mb-4">לא נמצאו סרטונים במערכת</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary"
              >
                <i className="fas fa-plus ml-2"></i>
                העלה את הסרטון הראשון
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">סרטון</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">פרטים</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">תאריך</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">פעולות</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {videos.map((video) => (
                      <tr key={video.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-16 w-20">
                              {video.thumbnailUrl ? (
                                <img
                                  className="h-16 w-20 rounded-lg object-cover"
                                  src={video.thumbnailUrl}
                                  alt={video.title}
                                />
                              ) : (
                                <div className="h-16 w-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <i className="fas fa-video text-gray-400"></i>
                                </div>
                              )}
                            </div>
                            <div className="mr-4 min-w-0 flex-1">
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <div className="text-sm font-medium text-gray-900 truncate">{video.title}</div>
                                {video.isVariant && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                    {video.variantLabel || 'ווריאנט'}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 truncate">{video.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div>קטגוריה: {video.category}</div>
                          <div>סוג: {video.exerciseType}</div>
                          <div>רמה: {video.skillLevel} (סף: {video.difficultyLevel || 10})</div>
                          <div>עמדות: {
                            video.positionSpecific?.length > 0 
                              ? video.positionSpecific.includes('all' as any) 
                                ? 'כל העמדות' 
                                : video.positionSpecific.slice(0, 2).join(', ') + (video.positionSpecific.length > 2 ? '...' : '')
                              : 'לא צוין'
                          }</div>
                          <div>גודל: {video.fileSize ? formatFileSize(video.fileSize) : 'לא ידוע'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {video.uploadedAt ? formatDate(video.uploadedAt) : 'לא ידוע'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2 space-x-reverse">
                            <button
                              onClick={() => setSelectedVideo(video)}
                              className="text-blue-600 hover:text-blue-900"
                              title="צפייה"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              onClick={() => handleVideoDelete(video.id)}
                              className="text-red-600 hover:text-red-900"
                              title="מחיקה"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">העלאת סרטון חדש</h2>
                  <button
                    onClick={() => {
                      setShowUploadModal(false)
                      setSelectedFile(null)
                      setMetadata({ 
                        title: '', 
                        description: '', 
                        category: 'training-exercise', 
                        exerciseType: 'dribbling',
                        positionSpecific: [],
                        difficultyLevels: [
                          { skillLevel: 'beginner' as const, threshold: 10, enabled: false },
                          { skillLevel: 'intermediate' as const, threshold: 30, enabled: false },
                          { skillLevel: 'advanced' as const, threshold: 60, enabled: false }
                        ]
                      })
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                {/* File Selection */}
                {!selectedFile ? (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="video/*"
                      className="hidden"
                    />
                    
                    <div className="text-4xl text-gray-400 mb-4">
                      <i className="fas fa-video"></i>
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-2">בחר קובץ וידאו</h3>
                    <p className="text-gray-600 mb-4">גרור קובץ לכאן או לחץ לבחירה</p>
                    
                    <div className="text-sm text-gray-500">
                      <p>פורמטים: MP4, MOV, AVI, WebM</p>
                      <p>גודל מקסימלי: 500MB</p>
                    </div>
                  </div>
                ) : (
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
                            if (fileInputRef.current) fileInputRef.current.value = ''
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">כותרת הסרטון *</label>
                        <input
                          type="text"
                          value={metadata.title}
                          onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="כותרת תיאורית לסרטון"
                          maxLength={100}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">תיאור הסרטון *</label>
                        <textarea
                          value={metadata.description}
                          onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="תיאור מפורט של תוכן הסרטון"
                          maxLength={500}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">קטגוריה</label>
                          <select
                            value={metadata.category}
                            onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="training-exercise">תרגיל אימון</option>
                            <option value="technique-demo">הדגמת טכניקה</option>
                            <option value="game-analysis">ניתוח משחק</option>
                            <option value="fitness-training">אימון כושר</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">רמות קושי</label>
                          <div className="space-y-3 border border-gray-300 rounded-lg p-4">
                            {metadata.difficultyLevels.map((level, index) => (
                              <div key={level.skillLevel} className="flex items-center space-x-4 space-x-reverse">
                                <label className="flex items-center min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={level.enabled}
                                    onChange={(e) => {
                                      setMetadata(prev => ({
                                        ...prev,
                                        difficultyLevels: prev.difficultyLevels.map((l, i) =>
                                          i === index ? { ...l, enabled: e.target.checked } : l
                                        )
                                      }))
                                    }}
                                    className="ml-2"
                                  />
                                  <span className="text-sm font-medium">
                                    {level.skillLevel === 'beginner' ? 'מתחיל' : 
                                     level.skillLevel === 'intermediate' ? 'בינוני' : 'מתקדם'}
                                  </span>
                                </label>
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <span className="text-xs text-gray-500 whitespace-nowrap">סף התקדמות:</span>
                                  <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={level.threshold}
                                    onChange={(e) => {
                                      const newThreshold = parseInt(e.target.value) || 10
                                      setMetadata(prev => ({
                                        ...prev,
                                        difficultyLevels: prev.difficultyLevels.map((l, i) =>
                                          i === index ? { ...l, threshold: newThreshold } : l
                                        )
                                      }))
                                    }}
                                    disabled={!level.enabled}
                                    className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            בחר רמות קושי וקבע לכל אחת סף התקדמות (נקודות נדרשות למעבר לשלב הבא)
                          </p>
                        </div>
                      </div>

                      {/* Position Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">עמדות רלוונטיות</label>
                        <div className="border border-gray-300 rounded-lg p-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                              { value: 'all', label: 'כל העמדות' },
                              { value: 'goalkeeper', label: 'שוער' },
                              { value: 'defender', label: 'בלם' },
                              { value: 'center-back', label: 'בלם מרכזי' },
                              { value: 'fullback', label: 'בלם צדדי' },
                              { value: 'midfielder', label: 'קשר' },
                              { value: 'defensive-midfielder', label: 'קשר הגנתי' },
                              { value: 'attacking-midfielder', label: 'קשר התקפי' },
                              { value: 'winger', label: 'אגף' },
                              { value: 'striker', label: 'חלוץ' },
                              { value: 'center-forward', label: 'חלוץ מרכזי' }
                            ].map(position => (
                              <label key={position.value} className="flex items-center text-sm">
                                <input
                                  type="checkbox"
                                  checked={metadata.positionSpecific.includes(position.value)}
                                  onChange={(e) => {
                                    if (position.value === 'all') {
                                      setMetadata(prev => ({ 
                                        ...prev, 
                                        positionSpecific: e.target.checked ? ['all'] : [] 
                                      }))
                                    } else {
                                      setMetadata(prev => {
                                        let newPositions = [...prev.positionSpecific]
                                        if (e.target.checked) {
                                          newPositions = newPositions.filter(p => p !== 'all')
                                          newPositions.push(position.value)
                                        } else {
                                          newPositions = newPositions.filter(p => p !== position.value)
                                        }
                                        return { ...prev, positionSpecific: newPositions }
                                      })
                                    }
                                  }}
                                  className="ml-2"
                                />
                                <span>{position.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Upload Progress */}
                    {uploading && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-900">מעלה סרטון...</span>
                          <span className="text-sm text-blue-700">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 space-x-reverse pt-4 border-t">
                      <button
                        onClick={() => {
                          setShowUploadModal(false)
                        setSelectedFile(null)
                        setMetadata({ 
                          title: '', 
                          description: '', 
                          category: 'training-exercise', 
                          exerciseType: 'dribbling',
                          positionSpecific: [],
                          difficultyLevels: [
                            { skillLevel: 'beginner' as const, threshold: 10, enabled: false },
                            { skillLevel: 'intermediate' as const, threshold: 30, enabled: false },
                            { skillLevel: 'advanced' as const, threshold: 60, enabled: false }
                          ]
                        })
                        }}
                        disabled={uploading}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >
                        ביטול
                      </button>
                      <button
                        onClick={handleUpload}
                        disabled={uploading || !metadata.title.trim() || !metadata.description.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {uploading ? 'מעלה...' : 'העלה סרטון'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Video Preview Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">{selectedVideo.title}</h2>
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                {selectedVideo.videoUrl && (
                  <div className="mb-6">
                    <video
                      controls
                      className="w-full max-h-96 rounded-lg"
                      poster={selectedVideo.thumbnailUrl}
                    >
                      <source src={selectedVideo.videoUrl} type="video/mp4" />
                      הדפדפן שלך אינו תומך בתגית הווידאו.
                    </video>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">תיאור</h3>
                      <p className="text-gray-600">{selectedVideo.description}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">קטגוריה</h3>
                      <p className="text-gray-600">{selectedVideo.category}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">תאריך העלאה</h3>
                      <p className="text-gray-600">
                        {selectedVideo.uploadedAt ? formatDate(selectedVideo.uploadedAt) : 'לא ידוע'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse mt-6 pt-6 border-t">
                  <button
                    onClick={() => {
                      setVariantBaseVideo(selectedVideo)
                      setShowVariantModal(true)
                      setSelectedVideo(null)
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <i className="fas fa-plus ml-2"></i>
                    הוסף רמת קושי
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Variant Modal */}
        {showVariantModal && variantBaseVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">צור רמת קושי חדשה</h2>
                  <button
                    onClick={() => {
                      setShowVariantModal(false)
                      setVariantBaseVideo(null)
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">סרטון בסיס:</h3>
                    <p className="text-sm text-gray-600">{variantBaseVideo.title}</p>
                    <p className="text-xs text-gray-500">רמת קושי נוכחית: {variantBaseVideo.skillLevel} (סף: {variantBaseVideo.difficultyLevel})</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">תווית ווריאנט *</label>
                    <input
                      type="text"
                      value={variantMetadata.variantLabel}
                      onChange={(e) => setVariantMetadata(prev => ({ ...prev, variantLabel: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="לדוגמה: מתחיל+, בינוני+, מתקדם+"
                      maxLength={20}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">רמת קושי חדשה</label>
                    <select
                      value={variantMetadata.skillLevel}
                      onChange={(e) => {
                        const level = e.target.value as any
                        const defaultThresholds: { [key: string]: number } = { beginner: 10, intermediate: 30, advanced: 60 }
                        setVariantMetadata(prev => ({ 
                          ...prev, 
                          skillLevel: level,
                          progressionThreshold: defaultThresholds[level] || 30
                        }))
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="beginner">מתחיל</option>
                      <option value="intermediate">בינוני</option>
                      <option value="advanced">מתקדם</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      סף התקדמות (נקודות נדרשות למעבר לשלב הבא)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={variantMetadata.progressionThreshold}
                      onChange={(e) => setVariantMetadata(prev => ({ ...prev, progressionThreshold: parseInt(e.target.value) || 30 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse pt-6 border-t mt-6">
                  <button
                    onClick={() => {
                      setShowVariantModal(false)
                      setVariantBaseVideo(null)
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={handleCreateVariant}
                    disabled={!variantMetadata.variantLabel.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    צור ווריאנט
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
