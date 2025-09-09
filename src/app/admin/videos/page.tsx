'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'
import { videoService } from '@/lib/videoService'
import { USER_TYPES } from '@/lib/firebase'
import { PrimaryButton } from '@/components/ui'
import { VideoStats, VideoListTable, VideoUploadModal } from '@/components/admin/videos'
import PageLayout, { PageContainer, PageCard } from '@/components/PageLayout'
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
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lastDocId, setLastDocId] = useState<string | undefined>(undefined)
  const [totalCount, setTotalCount] = useState<number>(0)
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
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  

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

  // Get total count of videos
  const getTotalCount = async () => {
    try {
      const stats = await videoService.getVideoStats()
      setTotalCount(stats.total)
    } catch (error) {
      console.error('Error getting video stats:', error)
    }
  }

  // Load initial videos from Firebase
  const loadVideos = async (reset: boolean = true) => {
    try {
      if (reset) {
        setLoading(true)
        setVideos([])
        setGroupedVideos([])
        setLastDocId(undefined)
        setHasMore(true)
      } else {
        setLoadingMore(true)
      }
      
      const result = await videoService.getVideos(
        {}, // No status filtering needed
        { field: 'uploadedAt', direction: 'desc' }, // sort by upload date
        50, // pageSize - load 50 at a time
        reset ? undefined : lastDocId
      )
      
      const newVideos = reset ? result.videos : [...videos, ...result.videos]
      setVideos(newVideos)
      setHasMore(result.hasMore)
      setLastDocId(result.lastDocId)
      
      // Group videos by base content
      const grouped = groupVideosByBase(newVideos)
      setGroupedVideos(grouped)
      
      console.log(`Loaded ${newVideos.length} videos total, batch size: ${result.videos.length}, hasMore: ${result.hasMore}, lastDocId: ${result.lastDocId}`)
      
    } catch (error) {
      console.error('Error loading videos:', error)
      showMessage('שגיאה בטעינת הסרטונים', 'error')
      if (reset) {
        setVideos([])
        setGroupedVideos([])
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Load more videos (for infinite scroll)
  const loadMoreVideos = useCallback(() => {
    console.log('loadMoreVideos called', { hasMore, loadingMore, loading })
    if (!loadingMore && hasMore && !loading) {
      loadVideos(false)
    }
  }, [hasMore, loadingMore, loading])

  useEffect(() => {
    loadVideos()
    getTotalCount()
  }, [filter])

  // Auto-scroll infinite loading
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 800 && // Load when 800px from bottom
        hasMore &&
        !loadingMore &&
        !loading
      ) {
        console.log('Triggering load more videos...', { hasMore, loadingMore, loading, currentCount: videos.length })
        loadMoreVideos()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loadingMore, loading, loadMoreVideos])



  // Handle upload
  const handleUpload = async ({ selectedFile, metadata }: { selectedFile: File, metadata: any }) => {
    if (!selectedFile || !user) return

    const enabledLevels = metadata.difficultyLevels.filter((level: any) => level.enabled)
    if (enabledLevels.length === 0) {
      showMessage('יש לבחור לפחות רמת קושי אחת', 'error')
      return
    }

    try {
      setUploading(true)
      setProgress(0)

      // No thumbnail generation needed
      const thumbnailBlob = null

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
      setShowUploadModal(false)
      setProgress(0)
      
      // Update videos and regroup
      const newVideosList = [...uploadedVideos, ...videos]
      setVideos(newVideosList)
      const grouped = groupVideosByBase(newVideosList)
      setGroupedVideos(grouped)
      // Update total count after upload
      await getTotalCount()
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

      // Refresh the videos list and total count
      await loadVideos()
      await getTotalCount()
      
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


  return (
    <PageLayout
      title="ניהול סרטונים"
      subtitle="העלה וניהל סרטוני אימון"
      loading={loading}
      requiresAuth={true}
      requiresRole={USER_TYPES.ADMIN}
      headerActions={
        <PrimaryButton
          icon="fas fa-plus"
          size="lg"
          onClick={() => setShowUploadModal(true)}
        >
          העלה סרטון חדש
        </PrimaryButton>
      }
      stats={[
        {
          number: totalCount,
          label: "כל הסרטונים",
          icon: "fas fa-video"
        },
        {
          number: new Set(videos.map(v => v.category)).size,
          label: "קטגוריות",
          icon: "fas fa-tags"
        }
      ]}
      showStats={true}
    >
      <PageContainer size="wide">
        <VideoStats totalVideos={groupedVideos.length} />
        
        <VideoListTable
          groupedVideos={groupedVideos}
          loading={loading}
          onVideoView={setSelectedVideoGroup}
          onVideoEdit={(group) => {
            setSelectedVideoGroup(group)
            initializeEditForm(group)
            setShowEditModal(true)
          }}
          onVideoDelete={handleVideoDelete}
        />
        
        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="flex justify-center mt-8 py-4">
            <div className="flex items-center text-primary-600">
              <i className="fas fa-spinner fa-spin ml-2"></i>
              טוען עוד סרטונים...
            </div>
          </div>
        )}
        
        {!hasMore && videos.length > 0 && (
          <div className="text-center mt-8 py-4 text-gray-500">
            <i className="fas fa-check-circle ml-2"></i>
            כל הסרטונים נטענו ({totalCount} סרטונים)
          </div>
        )}
      </PageContainer>

      {/* Upload Modal */}
      <VideoUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        uploading={uploading}
        progress={progress}
      />

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
                    className="btn-page-primary"
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
                    className="btn-page-primary btn-disabled"
                  >
                    {uploading ? 'שומר...' : 'שמור שינויים'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </PageLayout>
  )
}
