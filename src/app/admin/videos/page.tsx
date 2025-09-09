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
  const [groupedVideos, setGroupedVideos] = useState<Array<{
    baseVideo: VideoMetadata,
    variants: VideoMetadata[]
  }>>([])
  const [loading, setLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [filter, setFilter] = useState<'all'>('all')
  const [selectedVideoGroup, setSelectedVideoGroup] = useState<{
    baseVideo: VideoMetadata,
    variants: VideoMetadata[]
  } | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    difficultyLevels: [
      { skillLevel: 'beginner' as const, threshold: 10, enabled: false },
      { skillLevel: 'intermediate' as const, threshold: 30, enabled: false },
      { skillLevel: 'advanced' as const, threshold: 60, enabled: false }
    ],
    positionSpecific: [] as string[]
  })
  
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
  

  // Group videos by base content
  const groupVideosByBase = (allVideos: VideoMetadata[]) => {
    const groups: { [key: string]: { baseVideo: VideoMetadata, variants: VideoMetadata[] } } = {}
    
    // First, identify base videos and their variants
    allVideos.forEach(video => {
      if (video.isVariant && video.baseVideoId) {
        // This is a variant
        if (!groups[video.baseVideoId]) {
          // Find the base video
          const baseVideo = allVideos.find(v => v.id === video.baseVideoId)
          if (baseVideo) {
            groups[video.baseVideoId] = {
              baseVideo,
              variants: [video]
            }
          }
        } else {
          groups[video.baseVideoId].variants.push(video)
        }
      } else {
        // This might be a base video
        const videoId = video.id
        if (!groups[videoId]) {
          groups[videoId] = {
            baseVideo: video,
            variants: []
          }
        }
      }
    })

    // Add standalone videos (videos without variants)
    allVideos.forEach(video => {
      if (!video.isVariant && !Object.keys(groups).includes(video.id)) {
        groups[video.id] = {
          baseVideo: video,
          variants: []
        }
      }
    })

    return Object.values(groups)
  }

  // Initialize edit form with current video data
  const initializeEditForm = (videoGroup: { baseVideo: VideoMetadata, variants: VideoMetadata[] }) => {
    const allVideos = [videoGroup.baseVideo, ...videoGroup.variants]
    
    const difficultyLevels = [
      { skillLevel: 'beginner' as const, threshold: 10, enabled: false },
      { skillLevel: 'intermediate' as const, threshold: 30, enabled: false },
      { skillLevel: 'advanced' as const, threshold: 60, enabled: false }
    ]

    // Update with existing data
    difficultyLevels.forEach(level => {
      const existingVideo = allVideos.find(v => v.skillLevel === level.skillLevel)
      if (existingVideo) {
        level.enabled = true
        level.threshold = existingVideo.difficultyLevel || level.threshold
      }
    })

    setEditFormData({
      difficultyLevels,
      positionSpecific: videoGroup.baseVideo.positionSpecific || []
    })
  }

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
      
      // Group videos by base content
      const grouped = groupVideosByBase(result.videos)
      setGroupedVideos(grouped)
    } catch (error) {
      console.error('Error loading videos:', error)
      showMessage('שגיאה בטעינת הסרטונים', 'error')
      setVideos([]) // Set empty array on error
      setGroupedVideos([])
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
      
      // Update videos and regroup
      const newVideosList = [...uploadedVideos, ...videos]
      setVideos(newVideosList)
      const grouped = groupVideosByBase(newVideosList)
      setGroupedVideos(grouped)
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


  // Handle saving edit changes
  const handleSaveEditChanges = async () => {
    if (!selectedVideoGroup || !user) return

    const enabledLevels = editFormData.difficultyLevels.filter(level => level.enabled)
    if (enabledLevels.length === 0) {
      showMessage('יש לבחור לפחות רמת קושי אחת', 'error')
      return
    }

    try {
      setUploading(true) // Reuse uploading state for loading
      
      const allCurrentVideos = [selectedVideoGroup.baseVideo, ...selectedVideoGroup.variants]
      
      // Find videos to delete (levels that were disabled)
      const videosToDelete = allCurrentVideos.filter(video => 
        !enabledLevels.some(level => level.skillLevel === video.skillLevel)
      )
      
      // Find videos to update (levels that exist but have different thresholds)
      const videosToUpdate = allCurrentVideos.filter(video => {
        const newLevel = enabledLevels.find(level => level.skillLevel === video.skillLevel)
        return newLevel && (newLevel.threshold !== video.difficultyLevel || 
               JSON.stringify(editFormData.positionSpecific) !== JSON.stringify(video.positionSpecific))
      })
      
      // Find videos to create (new levels that didn't exist before)
      const videosToCreate = enabledLevels.filter(level => 
        !allCurrentVideos.some(video => video.skillLevel === level.skillLevel)
      )

      // Delete removed difficulty levels
      for (const video of videosToDelete) {
        await videoService.deleteVideo(video.id)
      }

      // Update existing difficulty levels
      for (const video of videosToUpdate) {
        const newLevel = enabledLevels.find(level => level.skillLevel === video.skillLevel)!
        await videoService.updateVideo(video.id, {
          difficultyLevel: newLevel.threshold,
          positionSpecific: editFormData.positionSpecific as any[]
        })
      }

      // Create new difficulty levels
      for (const newLevel of videosToCreate) {
        const baseVideo = selectedVideoGroup.baseVideo
        const isFirst = videosToCreate.indexOf(newLevel) === 0 && videosToUpdate.length === 0 && videosToDelete.length === allCurrentVideos.length
        
        if (isFirst) {
          // Update the base video instead of creating a new one
          await videoService.updateVideo(baseVideo.id, {
            skillLevel: newLevel.skillLevel,
            difficultyLevel: newLevel.threshold,
            positionSpecific: editFormData.positionSpecific as any[],
            title: baseVideo.title.replace(/ - (מתחיל|בינוני|מתקדם)$/, '') + (enabledLevels.length > 1 ? ` - ${newLevel.skillLevel === 'beginner' ? 'מתחיל' : newLevel.skillLevel === 'intermediate' ? 'בינוני' : 'מתקדם'}` : '')
          })
        } else {
          // Create variant
          const variantMetadata: Omit<VideoMetadata, 'id' | 'uploadedAt' | 'lastModified' | 'videoUrl' | 'thumbnailUrl' | 'views' | 'likes' | 'downloads'> = {
            ...baseVideo,
            title: baseVideo.title.replace(/ - (מתחיל|בינוני|מתקדם)$/, '') + ` - ${newLevel.skillLevel === 'beginner' ? 'מתחיל' : newLevel.skillLevel === 'intermediate' ? 'בינוני' : 'מתקדם'}`,
            skillLevel: newLevel.skillLevel,
            difficultyLevel: newLevel.threshold,
            positionSpecific: editFormData.positionSpecific as any[],
            baseVideoId: baseVideo.id,
            isVariant: true,
            variantLabel: newLevel.skillLevel === 'beginner' ? 'מתחיל' : newLevel.skillLevel === 'intermediate' ? 'בינוני' : 'מתקדם',
            uploadedBy: user.uid,
            fileName: baseVideo.fileName,
            fileSize: baseVideo.fileSize,
            duration: baseVideo.duration,
            format: baseVideo.format,
            resolution: baseVideo.resolution
          }
          
          await videoService.createVariant(baseVideo.id, variantMetadata)
        }
      }

      // Refresh the videos list
      await loadVideos()
      
      // Close modals and show success message
      setShowEditModal(false)
      setSelectedVideoGroup(null)
      showMessage('השינויים נשמרו בהצלחה!', 'success')
      
    } catch (error) {
      console.error('Error saving changes:', error)
      showMessage('שגיאה בשמירת השינויים', 'error')
    } finally {
      setUploading(false)
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
                כל הסרטונים ({groupedVideos.length})
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
          ) : groupedVideos.length === 0 ? (
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
                    {groupedVideos.map((group) => {
                      const { baseVideo, variants } = group
                      const allVideos = [baseVideo, ...variants]
                      const thresholds = allVideos.map(v => `${v.skillLevel}(${v.difficultyLevel})`).join(', ')
                      
                      return (
                        <tr key={baseVideo.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-16 w-20">
                                {baseVideo.thumbnailUrl ? (
                                  <img
                                    className="h-16 w-20 rounded-lg object-cover"
                                    src={baseVideo.thumbnailUrl}
                                    alt={baseVideo.title}
                                  />
                                ) : (
                                  <div className="h-16 w-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <i className="fas fa-video text-gray-400"></i>
                                  </div>
                                )}
                              </div>
                              <div className="mr-4 min-w-0 flex-1">
                                <div className="flex items-center space-x-2 space-x-reverse">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {baseVideo.title.replace(/ - (מתחיל|בינוני|מתקדם)$/, '')}
                                  </div>
                                  {variants.length > 0 && (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                      {allVideos.length} רמות
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500 truncate">{baseVideo.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div>קטגוריה: {baseVideo.category}</div>
                            <div>סוג: {baseVideo.exerciseType}</div>
                            <div>רמות: {thresholds}</div>
                            <div>עמדות: {
                              baseVideo.positionSpecific?.length > 0 
                                ? baseVideo.positionSpecific.includes('all' as any) 
                                  ? 'כל העמדות' 
                                  : baseVideo.positionSpecific.slice(0, 2).join(', ') + (baseVideo.positionSpecific.length > 2 ? '...' : '')
                                : 'לא צוין'
                            }</div>
                            <div>גודל: {baseVideo.fileSize ? formatFileSize(baseVideo.fileSize) : 'לא ידוע'}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {baseVideo.uploadedAt ? formatDate(baseVideo.uploadedAt) : 'לא ידוע'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2 space-x-reverse">
                              <button
                                onClick={() => setSelectedVideoGroup(group)}
                                className="text-blue-600 hover:text-blue-900"
                                title="צפייה"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedVideoGroup(group)
                                  initializeEditForm(group)
                                  setShowEditModal(true)
                                }}
                                className="text-green-600 hover:text-green-900"
                                title="עריכה"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                onClick={() => handleVideoDelete(baseVideo.id)}
                                className="text-red-600 hover:text-red-900"
                                title="מחיקה"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
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
        {selectedVideoGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedVideoGroup.baseVideo.title.replace(/ - (מתחיל|בינוני|מתקדם)$/, '')}
                  </h2>
                  <button
                    onClick={() => setSelectedVideoGroup(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                {selectedVideoGroup.baseVideo.videoUrl && (
                  <div className="mb-6">
                    <video
                      controls
                      className="w-full max-h-96 rounded-lg"
                      poster={selectedVideoGroup.baseVideo.thumbnailUrl}
                    >
                      <source src={selectedVideoGroup.baseVideo.videoUrl} type="video/mp4" />
                      הדפדפן שלך אינו תומך בתגית הווידאו.
                    </video>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">תיאור</h3>
                      <p className="text-gray-600">{selectedVideoGroup.baseVideo.description}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">קטגוריה</h3>
                      <p className="text-gray-600">{selectedVideoGroup.baseVideo.category}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">סוג תרגיל</h3>
                      <p className="text-gray-600">{selectedVideoGroup.baseVideo.exerciseType}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">עמדות רלוונטיות</h3>
                      <p className="text-gray-600">
                        {selectedVideoGroup.baseVideo.positionSpecific?.length > 0 
                          ? selectedVideoGroup.baseVideo.positionSpecific.includes('all' as any) 
                            ? 'כל העמדות' 
                            : selectedVideoGroup.baseVideo.positionSpecific.join(', ')
                          : 'לא צוין'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">תאריך העלאה</h3>
                      <p className="text-gray-600">
                        {selectedVideoGroup.baseVideo.uploadedAt ? formatDate(selectedVideoGroup.baseVideo.uploadedAt) : 'לא ידוע'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">גודל קובץ</h3>
                      <p className="text-gray-600">
                        {selectedVideoGroup.baseVideo.fileSize ? formatFileSize(selectedVideoGroup.baseVideo.fileSize) : 'לא ידוע'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">רמות קושי זמינות</h3>
                      <div className="space-y-2">
                        {[selectedVideoGroup.baseVideo, ...selectedVideoGroup.variants].map((video, index) => (
                          <div key={video.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <span className="text-sm font-medium">
                              {video.skillLevel === 'beginner' ? 'מתחיל' : 
                               video.skillLevel === 'intermediate' ? 'בינוני' : 'מתקדם'}
                            </span>
                            <span className="text-sm text-gray-600">
                              סף: {video.difficultyLevel} נקודות
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse mt-6 pt-6 border-t">
                  <button
                    onClick={() => {
                      initializeEditForm(selectedVideoGroup)
                      setShowEditModal(true)
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <i className="fas fa-edit ml-2"></i>
                    עריכת פרטים
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedVideoGroup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">עריכת פרטי הסרטון</h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedVideoGroup(null)
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Video Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {selectedVideoGroup.baseVideo.title.replace(/ - (מתחיל|בינוני|מתקדם)$/, '')}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedVideoGroup.baseVideo.description}</p>
                  </div>

                  {/* Difficulty Levels - Same as Upload Form */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">רמות קושי</label>
                    <div className="space-y-3 border border-gray-300 rounded-lg p-4">
                      {editFormData.difficultyLevels.map((level, index) => (
                        <div key={level.skillLevel} className="flex items-center space-x-4 space-x-reverse">
                          <label className="flex items-center min-w-0">
                            <input
                              type="checkbox"
                              checked={level.enabled}
                              onChange={(e) => {
                                setEditFormData(prev => ({
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
                                setEditFormData(prev => ({
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

                  {/* Position Selection - Same as Upload Form */}
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
                        ].map(position => {
                          const isChecked = editFormData.positionSpecific.includes(position.value)
                          
                          return (
                            <label key={position.value} className="flex items-center text-sm">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (position.value === 'all') {
                                    setEditFormData(prev => ({ 
                                      ...prev, 
                                      positionSpecific: e.target.checked ? ['all'] : [] 
                                    }))
                                  } else {
                                    setEditFormData(prev => {
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
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 space-x-reverse pt-6 border-t mt-6">
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedVideoGroup(null)
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={handleSaveEditChanges}
                    disabled={uploading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? 'שומר...' : 'שמור שינויים'}
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
