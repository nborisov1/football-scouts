'use client'

/**
 * Admin Videos Management - Enhanced video management interface with Firebase integration
 * Features: Upload, approval/rejection, filtering, real-time data, and comprehensive video management
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'
import ProtectedRoute from '@/components/ProtectedRoute'
import VideoUpload from '@/components/VideoUpload'
import EnhancedVideoUpload from '@/components/admin/EnhancedVideoUpload'
import MultiStageVideoUpload from '@/components/admin/MultiStageVideoUpload'
import VideoReviewPanel from '@/components/admin/VideoReviewPanel'
import CollectionManager from '@/components/admin/CollectionManager'
import ChallengeManager from '@/components/admin/ChallengeManager'
import { videoService, formatFileSize, formatDuration } from '@/lib/videoService'
import { challengeService, ChallengeFilters } from '@/lib/challengeService'
import { USER_TYPES } from '@/lib/firebase'
import type { 
  VideoMetadata, 
  VideoFilter, 
  VideoSort,
  PlayerVideoSubmission,
  VideoCollection
} from '@/types/video'
import {
  VIDEO_STATUS_LABELS,
  VIDEO_CATEGORY_LABELS,
  EXERCISE_TYPE_LABELS
} from '@/types/video'
import { 
  Challenge,
  AgeGroup,
  Position,
  CHALLENGE_DIFFICULTY_LABELS, 
  CHALLENGE_CATEGORY_LABELS,
  CHALLENGE_STATUS_LABELS,
  AGE_GROUP_LABELS,
  POSITION_LABELS
} from '@/types/challenge'

export default function AdminVideos() {
  const { user } = useAuth()
  
  // State management
  const [videos, setVideos] = useState<VideoMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [lastDocId, setLastDocId] = useState<string | undefined>()
  
  // UI state
  const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showCollectionManager, setShowCollectionManager] = useState(false)
  const [showChallengeManager, setShowChallengeManager] = useState(false)
  const [useEnhancedUpload, setUseEnhancedUpload] = useState(false)
  
  // Challenge state
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [challengesLoading, setChallengesLoading] = useState(false)
  const [challengeFilters, setChallengeFilters] = useState<ChallengeFilters>({})
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [showChallengeModal, setShowChallengeModal] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState(false)
  const [challengeFormData, setChallengeFormData] = useState<Partial<Challenge>>({})
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null)
  const [uploadAbortController, setUploadAbortController] = useState<AbortController | null>(null)
  const [useMultiStageUpload, setUseMultiStageUpload] = useState(true)
  const [activeTab, setActiveTab] = useState<'player-submissions' | 'admin-training' | 'collections' | 'submissions' | 'challenges'>('player-submissions')
  const [playerSubmissions, setPlayerSubmissions] = useState<PlayerVideoSubmission[]>([
    {
      id: 'submission-1',
      playerId: 'player-123',
      videoId: 'video-1',
      seriesId: 'series-1',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: 'pending',
      resubmissionCount: 0,
      maxResubmissions: 3
    },
    {
      id: 'submission-2',
      playerId: 'player-456',
      videoId: 'video-2',
      seriesId: 'series-1',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      status: 'approved',
      adminFeedback: 'ביצוע מעולה! המשך כך.',
      adminScore: 8,
      reviewedBy: 'admin-1',
      reviewedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      resubmissionCount: 0,
      maxResubmissions: 3
    },
    {
      id: 'submission-3',
      playerId: 'player-789',
      videoId: 'video-3',
      seriesId: 'series-2',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      status: 'needs-improvement',
      adminFeedback: 'התרגיל לא בוצע נכון. נסה שוב עם יותר דיוק.',
      adminScore: 4,
      reviewedBy: 'admin-1',
      reviewedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      resubmissionCount: 1,
      maxResubmissions: 3
    }
  ])
  
  // Filtering and sorting
  const [filter, setFilter] = useState<VideoFilter>({})
  const [sort, setSort] = useState<VideoSort>({
    field: 'uploadedAt',
    direction: 'desc'
  })
  const [searchQuery, setSearchQuery] = useState('')
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [moderationNotes, setModerationNotes] = useState('')
  const [collections, setCollections] = useState<VideoCollection[]>([])
  const [adminVideos, setAdminVideos] = useState<VideoMetadata[]>([])
  const [playerVideos, setPlayerVideos] = useState<VideoMetadata[]>([])

  // Load videos and separate by type
  const loadVideos = useCallback(async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true)
        setLastDocId(undefined)
      } else {
        setLoadingMore(true)
      }
      
      const currentFilter = {
        ...filter,
        searchQuery: searchQuery || undefined
      }
      
      const result = await videoService.getVideos(
        currentFilter,
        sort,
        20,
        reset ? undefined : lastDocId
      )
      
      // Separate videos by uploader type
      const adminVids = result.videos.filter(video => 
        video.uploadedBy === 'admin-1' || video.category === 'training-exercise' || video.category === 'tutorial'
      )
      const playerVids = result.videos.filter(video => 
        video.category === 'player-submission' || video.playerInfo
      )
      
      if (reset) {
        setVideos(result.videos)
        setAdminVideos(adminVids)
        setPlayerVideos(playerVids)
      } else {
        setVideos(prev => [...prev, ...result.videos])
        setAdminVideos(prev => [...prev, ...adminVids])
        setPlayerVideos(prev => [...prev, ...playerVids])
      }
      
      setHasMore(result.hasMore)
      setLastDocId(result.lastDocId)
      setError(null)
      
    } catch (err) {
      console.error('Error loading videos:', err)
      setError('שגיאה בטעינת הסרטונים')
      showMessage('שגיאה בטעינת הסרטונים', 'error')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [filter, sort, searchQuery, lastDocId])
  
  
  // Load collections
  const loadCollections = useCallback(async () => {
    try {
      const collectionsData = await videoService.getCollections()
      setCollections(collectionsData)
    } catch (error) {
      console.error('Error loading collections:', error)
      showMessage('שגיאה בטעינת האוספים', 'error')
    }
  }, [])

  // Load challenges
  const loadChallenges = useCallback(async () => {
    try {
      setChallengesLoading(true)
      const challengesData = await challengeService.getChallenges(challengeFilters)
      setChallenges(challengesData)
    } catch (error) {
      console.error('Error loading challenges:', error)
      showMessage('שגיאה בטעינת האתגרים', 'error')
    } finally {
      setChallengesLoading(false)
    }
  }, [challengeFilters])

  // Load initial data
  useEffect(() => {
    if (user && user.type === USER_TYPES.ADMIN) {
      loadVideos(true)
      loadCollections()
      loadChallenges()
    }
  }, [loadVideos, loadCollections, loadChallenges, user])
  
  // Reload when filters change
  useEffect(() => {
    if (user && user.type === USER_TYPES.ADMIN) {
      const timeoutId = setTimeout(() => {
        loadVideos(true)
      }, 300) // Debounce search
      
      return () => clearTimeout(timeoutId)
    }
  }, [filter, sort, searchQuery, user, loadVideos])

  // Reload challenges when challenge filters change
  useEffect(() => {
    if (user && user.type === USER_TYPES.ADMIN && activeTab === 'challenges') {
      loadChallenges()
    }
  }, [challengeFilters, loadChallenges, user, activeTab])

  // Cleanup uploads on component unmount
  useEffect(() => {
    return () => {
      if (uploadAbortController) {
        console.log('Component unmounting, aborting uploads...')
        uploadAbortController.abort()
      }
    }
  }, [uploadAbortController])

  // Challenge helper functions
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-orange-100 text-orange-800'
      case 'expert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'locked': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Challenge editing functions
  const handleEditChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
    setChallengeFormData(challenge)
    setEditingChallenge(true)
    setShowChallengeModal(true)
  }

  const handleCancelEdit = () => {
    // Abort any ongoing uploads
    if (uploadAbortController) {
      console.log('Cancelling ongoing uploads...')
      uploadAbortController.abort()
      setUploadAbortController(null)
    }
    
    // Reset all states
    setEditingChallenge(false)
    setChallengeFormData({})
    setSelectedChallenge(null)
    setShowChallengeModal(false)
    setSelectedVideoFile(null)
    setSelectedThumbnailFile(null)
    setUploadingVideo(false)
    setUploadingThumbnail(false)
    
    console.log('Edit cancelled and uploads aborted')
  }

  const handleSaveChallenge = async () => {
    if (!selectedChallenge) return

    // Create abort controller for this upload session
    const abortController = new AbortController()
    setUploadAbortController(abortController)

    try {
      setUploadingVideo(true)
      setUploadingThumbnail(true)
      
      let finalFormData = { ...challengeFormData }
      
      // Upload video if a new file was selected
      if (selectedVideoFile) {
        console.log('Uploading video file...')
        // Check if upload was cancelled
        if (abortController.signal.aborted) {
          console.log('Upload cancelled by user')
          return
        }
        const videoUrl = await challengeService.uploadChallengeVideo(selectedVideoFile, selectedChallenge.id)
        finalFormData.videoUrl = videoUrl
        console.log('Video uploaded successfully:', videoUrl)
      }
      
      // Upload thumbnail if a new file was selected
      if (selectedThumbnailFile) {
        console.log('Uploading thumbnail file...')
        // Check if upload was cancelled
        if (abortController.signal.aborted) {
          console.log('Upload cancelled by user')
          return
        }
        const thumbnailUrl = await challengeService.uploadChallengeThumbnail(selectedThumbnailFile, selectedChallenge.id)
        finalFormData.thumbnailUrl = thumbnailUrl
        console.log('Thumbnail uploaded successfully:', thumbnailUrl)
      }
      
      // Check if upload was cancelled before updating challenge
      if (abortController.signal.aborted) {
        console.log('Upload cancelled by user')
        return
      }
      
      // Update the challenge with all data
      await challengeService.updateChallenge(selectedChallenge.id, finalFormData)
      showMessage('האתגר עודכן בהצלחה!', 'success')
      
      // Clean up
      setEditingChallenge(false)
      setChallengeFormData({})
      setSelectedVideoFile(null)
      setSelectedThumbnailFile(null)
      setUploadAbortController(null)
      loadChallenges() // Reload challenges
    } catch (error) {
      console.error('Error updating challenge:', error)
      if (abortController.signal.aborted) {
        console.log('Upload was cancelled')
        showMessage('העלאה בוטלה', 'info')
      } else {
        showMessage('שגיאה בעדכון האתגר', 'error')
      }
    } finally {
      setUploadingVideo(false)
      setUploadingThumbnail(false)
      setUploadAbortController(null)
    }
  }

  const handleVideoFileSelect = (file: File) => {
    // Validate file size (max 100MB for videos)
    if (file.size > 100 * 1024 * 1024) {
      showMessage('הקובץ גדול מדי. גודל מקסימלי: 100MB', 'error')
      return
    }
    
    // Validate file type
    if (!file.type.startsWith('video/')) {
      showMessage('אנא בחר קובץ וידאו בלבד', 'error')
      return
    }
    
    setSelectedVideoFile(file)
    
    // Create preview URL for immediate display
    const videoUrl = URL.createObjectURL(file)
    setChallengeFormData(prev => ({ ...prev, videoUrl }))
    showMessage('סרטון נבחר - יועלה בעת השמירה', 'success')
  }

  const handleThumbnailFileSelect = (file: File) => {
    // Validate file size (max 5MB for images)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('הקובץ גדול מדי. גודל מקסימלי: 5MB', 'error')
      return
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showMessage('אנא בחר קובץ תמונה בלבד', 'error')
      return
    }
    
    setSelectedThumbnailFile(file)
    
    // Create preview URL for immediate display
    const thumbnailUrl = URL.createObjectURL(file)
    setChallengeFormData(prev => ({ ...prev, thumbnailUrl }))
    showMessage('תמונה נבחרה - תועלה בעת השמירה', 'success')
  }

  // Test function to verify Firebase Storage is working
  const testFirebaseStorage = async () => {
    try {
      console.log('Testing Firebase Storage...')
      const { storage } = await import('@/lib/firebase')
      const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage')
      
      // Create a simple test file
      const testContent = 'test'
      const testFile = new File([testContent], 'test.txt', { type: 'text/plain' })
      
      const testRef = ref(storage, 'test/test.txt')
      console.log('Uploading test file...')
      const snapshot = await uploadBytes(testRef, testFile)
      console.log('Test upload successful:', snapshot)
      
      const downloadURL = await getDownloadURL(snapshot.ref)
      console.log('Test download URL:', downloadURL)
      
      showMessage('Firebase Storage test successful!', 'success')
    } catch (error) {
      console.error('Firebase Storage test failed:', error)
      showMessage('Firebase Storage test failed: ' + error, 'error')
    }
  }

  // Video actions
  const handleEditVideo = useCallback(async (
    videoId: string, 
    updates: Partial<VideoMetadata>
  ) => {
    if (!user) return
    
    try {
      await videoService.updateVideo(videoId, updates)
      
      // Update local state
      setVideos(prev => prev.map(video => 
        video.id === videoId 
          ? { ...video, ...updates, lastModified: new Date() }
          : video
      ))
      
      showMessage('הסרטון עודכן בהצלחה', 'success')
      setShowModal(false)
      setSelectedVideo(null)
      
    } catch (error) {
      console.error('Error updating video:', error)
      showMessage('שגיאה בעדכון הסרטון', 'error')
    }
  }, [user])
  
  const handleDeleteVideo = useCallback(async (videoId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את הסרטון? פעולה זו לא ניתנת לביטול.')) {
      return
    }
    
    try {
      await videoService.deleteVideo(videoId)
      setVideos(prev => prev.filter(video => video.id !== videoId))
      showMessage('הסרטון נמחק בהצלחה', 'success')
      setShowModal(false)
      setSelectedVideo(null)
    } catch (error) {
      console.error('Error deleting video:', error)
      showMessage('שגיאה במחיקת הסרטון', 'error')
    }
  }, [])
  
  const handleVideoView = useCallback(async (videoId: string) => {
    try {
      await videoService.incrementViews(videoId)
      setVideos(prev => prev.map(video => 
        video.id === videoId 
          ? { ...video, views: video.views + 1 }
          : video
      ))
    } catch (error) {
      console.warn('Failed to increment view count:', error)
    }
  }, [])
  
  const handleUploadComplete = useCallback((video: VideoMetadata) => {
    setVideos(prev => [video, ...prev])
    setShowUploadModal(false)
    showMessage('סרטון חדש הועלה בהצלחה', 'success')
  }, [])

  // Filter handlers
  const handleFilterChange = useCallback((newFilter: Partial<VideoFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }))
  }, [])
  
  const handleSortChange = useCallback((newSort: VideoSort) => {
    setSort(newSort)
  }, [])
  
  const resetFilters = useCallback(() => {
    setFilter({})
    setSort({ field: 'uploadedAt', direction: 'desc' })
    setSearchQuery('')
  }, [])
  
  // Redirect if not admin
  if (!user || user.type !== USER_TYPES.ADMIN) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">גישה מוגבלת</h2>
          <p className="text-gray-600">דף זה זמין רק למנהלי המערכת</p>
        </div>
      </div>
    )
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען סרטונים...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header - Consistent with other admin pages */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ניהול סרטונים</h1>
                <p className="text-gray-600">נהל סרטונים שהועלו על ידי שחקנים</p>
              </div>
              
              <div className="flex space-x-4 space-x-reverse">
                <button
                  onClick={() => setShowCollectionManager(true)}
                  className="btn-secondary"
                >
                  <i className="fas fa-folder-plus ml-2"></i>
                  ניהול אוספים
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-primary"
                >
                  <i className="fas fa-plus ml-2"></i>
                  העלה סרטון
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex space-x-8 space-x-reverse">
              <button
                onClick={() => setActiveTab('player-submissions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'player-submissions'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-user-check ml-2"></i>
                הגשות שחקנים
                {playerVideos.filter(v => v.status === 'pending').length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {playerVideos.filter(v => v.status === 'pending').length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('admin-training')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'admin-training'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-video ml-2"></i>
                סרטוני אימון (מנהל)
                {adminVideos.length > 0 && (
                  <span className="ml-2 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                    {adminVideos.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('collections')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'collections'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-folder ml-2"></i>
                אוספי אימון
                {collections.length > 0 && (
                  <span className="ml-2 bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                    {collections.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('challenges')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'challenges'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-trophy ml-2"></i>
                אתגרים
              </button>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {activeTab === 'player-submissions' ? (
            <>
              {/* Player Submissions Header */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">הגשות שחקנים</h2>
                <p className="text-gray-600">סקור ואשר סרטונים שהועלו על ידי שחקנים</p>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search Bar */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="חיפוש סרטונים..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <i className="fas fa-search text-gray-400"></i>
                  </div>
                </div>
              </div>
              
              {/* Filter Controls */}
              <div className="flex items-center space-x-4 space-x-reverse">
                {/* Category Filter */}
                <select
                  value={filter.category?.[0] || 'all'}
                  onChange={(e) => {
                    const value = e.target.value
                    handleFilterChange({
                      category: value === 'all' ? undefined : [value as any]
                    })
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="all">כל הקטגוריות</option>
                  {Object.entries(VIDEO_CATEGORY_LABELS).map(([category, label]) => (
                    <option key={category} value={category}>{label}</option>
                  ))}
                </select>
                
                {/* Sort */}
                <select
                  value={`${sort.field}-${sort.direction}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-')
                    handleSortChange({ field: field as any, direction: direction as any })
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="uploadedAt-desc">חדשים ראשון</option>
                  <option value="uploadedAt-asc">ישנים ראשון</option>
                  <option value="title-asc">לפי כותרת</option>
                  <option value="views-desc">לפי צפיות</option>
                </select>
                
                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 ${
                      viewMode === 'grid' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <i className="fas fa-th-large"></i>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 border-r border-gray-300 ${
                      viewMode === 'list' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <i className="fas fa-list"></i>
                  </button>
                </div>
                
                {/* Reset Filters */}
                <button
                  onClick={resetFilters}
                  className="text-gray-600 hover:text-gray-800 px-2"
                  title="איפוס מסננים"
                >
                  <i className="fas fa-undo"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content - Videos */}
          {/* Error State */}
          {error && (
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 mb-6">
              <div className="flex items-center">
                <div className="bg-red-500 p-3 rounded-lg ml-4">
                  <i className="fas fa-exclamation-triangle text-white"></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900 font-medium">שגיאה בטעינת הנתונים</h3>
                  <p className="text-gray-600 text-sm mt-1">{error}</p>
                  <button
                    onClick={() => loadVideos(true)}
                    className="mt-3 btn-primary text-sm"
                  >
                    נסה שוב
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Player Videos Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playerVideos.map((video) => (
                <div key={video.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {/* Video Thumbnail */}
                  <div className="aspect-video bg-gray-200 relative cursor-pointer" 
                       onClick={() => {
                         setSelectedVideo(video)
                         setShowModal(true)
                         handleVideoView(video.id)
                       }}>
                    {video.thumbnailUrl ? (
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <i className="fas fa-play-circle text-4xl text-gray-400"></i>
                      </div>
                    )}
                    
                    
                    <div className="absolute bottom-2 left-2 flex space-x-2 space-x-reverse">
                      <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(video.duration)}
                      </span>
                      {video.views > 0 && (
                        <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          <i className="fas fa-eye ml-1"></i>
                          {video.views}
                        </span>
                      )}
                    </div>
                    
                    <div className="absolute top-2 left-2">
                      <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded">
                        {VIDEO_CATEGORY_LABELS[video.category]}
                      </span>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{video.title}</h3>
                    
                    {video.playerInfo && (
                      <p className="text-gray-600 text-sm mb-2">
                        <i className="fas fa-user ml-1"></i>
                        שחקן: {video.playerInfo.playerName}
                      </p>
                    )}
                    
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{video.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                      <span>הועלה: {video.uploadedAt.toLocaleDateString('he-IL')}</span>
                      <span>{formatFileSize(video.fileSize)}</span>
                    </div>
                    
                    {video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {video.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                        {video.tags.length > 3 && (
                          <span className="text-gray-400 text-xs">+{video.tags.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Action Buttons for Player Submissions */}
                    <div className="flex space-x-2 space-x-reverse">
                      {video.status === 'pending' && (
                        <>
                          <button
                            onClick={async () => {
                              try {
                                await videoService.moderateVideo(video.id, 'approved', user?.uid || 'admin-1', 'אושר על ידי המנהל')
                                setPlayerVideos(prev => prev.map(v => 
                                  v.id === video.id ? { ...v, status: 'approved' as const } : v
                                ))
                                showMessage('הסרטון אושר בהצלחה', 'success')
                              } catch (error) {
                                showMessage('שגיאה באישור הסרטון', 'error')
                              }
                            }}
                            className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            <i className="fas fa-check ml-1"></i>
                            אשר
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await videoService.moderateVideo(video.id, 'rejected', user?.uid || 'admin-1', 'נדחה על ידי המנהל')
                                setPlayerVideos(prev => prev.map(v => 
                                  v.id === video.id ? { ...v, status: 'rejected' as const } : v
                                ))
                                showMessage('הסרטון נדחה', 'success')
                              } catch (error) {
                                showMessage('שגיאה בדחיית הסרטון', 'error')
                              }
                            }}
                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            <i className="fas fa-times ml-1"></i>
                            דחה
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedVideo(video)
                          setShowModal(true)
                          handleVideoView(video.id)
                        }}
                        className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition-colors"
                        title="צפה בפרטים"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-right px-6 py-3 text-sm font-medium text-gray-900">סרטון</th>
                      <th className="text-right px-6 py-3 text-sm font-medium text-gray-900">שחקן</th>
                      <th className="text-right px-6 py-3 text-sm font-medium text-gray-900">קטגוריה</th>
                      <th className="text-right px-6 py-3 text-sm font-medium text-gray-900">תאריך</th>
                      <th className="text-right px-6 py-3 text-sm font-medium text-gray-900">פעולות</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {playerVideos.map((video) => (
                      <tr key={video.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-16 h-12 bg-gray-200 rounded mr-4 flex-shrink-0 overflow-hidden">
                              {video.thumbnailUrl ? (
                                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <i className="fas fa-video text-gray-400"></i>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{video.title}</p>
                              <p className="text-sm text-gray-500 line-clamp-1">{video.description}</p>
                              <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-400 mt-1">
                                <span>{formatDuration(video.duration)}</span>
                                <span>{formatFileSize(video.fileSize)}</span>
                                <span><i className="fas fa-eye ml-1"></i> {video.views}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">{video.playerInfo?.playerName || 'לא מזוהה'}</p>
                          {video.playerInfo?.position && (
                            <p className="text-xs text-gray-500">{video.playerInfo.position}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
                            {VIDEO_CATEGORY_LABELS[video.category]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {video.uploadedAt.toLocaleDateString('he-IL')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2 space-x-reverse">
                            {video.status === 'pending' && (
                              <>
                                <button
                                  onClick={async () => {
                                    try {
                                      await videoService.moderateVideo(video.id, 'approved', user?.uid || 'admin-1', 'אושר על ידי המנהל')
                                      setPlayerVideos(prev => prev.map(v => 
                                        v.id === video.id ? { ...v, status: 'approved' as const } : v
                                      ))
                                      showMessage('הסרטון אושר בהצלחה', 'success')
                                    } catch (error) {
                                      showMessage('שגיאה באישור הסרטון', 'error')
                                    }
                                  }}
                                  className="text-green-600 hover:text-green-800"
                                  title="אשר"
                                >
                                  <i className="fas fa-check"></i>
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      await videoService.moderateVideo(video.id, 'rejected', user?.uid || 'admin-1', 'נדחה על ידי המנהל')
                                      setPlayerVideos(prev => prev.map(v => 
                                        v.id === video.id ? { ...v, status: 'rejected' as const } : v
                                      ))
                                      showMessage('הסרטון נדחה', 'success')
                                    } catch (error) {
                                      showMessage('שגיאה בדחיית הסרטון', 'error')
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                  title="דחה"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </>
                            )}
                            
                            <button
                              onClick={() => {
                                setSelectedVideo(video)
                                setShowModal(true)
                                handleVideoView(video.id)
                              }}
                              className="text-primary-600 hover:text-primary-800"
                              title="צפה בפרטים"
                            >
                              <i className="fas fa-eye"></i>
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

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={() => loadVideos(false)}
                disabled={loadingMore}
                className="btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2 inline-block"></div>
                    טוען...
                  </>
                ) : (
                  'טען עוד סרטונים'
                )}
              </button>
            </div>
          )}

          {/* Empty State for Player Videos */}
          {!loading && playerVideos.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <i className="fas fa-user-check text-gray-300 text-6xl mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">אין הגשות שחקנים</h3>
              <p className="text-gray-500 mb-4">לא נמצאו סרטונים שהועלו על ידי שחקנים</p>
            </div>
          )}
            </>
          ) : activeTab === 'admin-training' ? (
            <>
              {/* Admin Training Videos Header */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">סרטוני אימון (מנהל)</h2>
                <p className="text-gray-600">נהל סרטוני אימון שיועלו על ידי המנהלים</p>
              </div>

              {/* Admin Videos Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {adminVideos.map((video) => (
                    <div key={video.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      {/* Video Thumbnail */}
                      <div className="aspect-video bg-gray-200 relative cursor-pointer" 
                           onClick={() => {
                             setSelectedVideo(video)
                             setShowModal(true)
                             handleVideoView(video.id)
                           }}>
                        {video.thumbnailUrl ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <i className="fas fa-play-circle text-4xl text-gray-400"></i>
                          </div>
                        )}
                        
                        <div className="absolute bottom-2 left-2 flex space-x-2 space-x-reverse">
                          <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            {formatDuration(video.duration)}
                          </span>
                          {video.views > 0 && (
                            <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                              <i className="fas fa-eye ml-1"></i>
                              {video.views}
                            </span>
                          )}
                        </div>
                        
                        <div className="absolute top-2 left-2">
                          <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded">
                            {VIDEO_CATEGORY_LABELS[video.category]}
                          </span>
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">{video.title}</h3>
                        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{video.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                          <span>הועלה: {video.uploadedAt.toLocaleDateString('he-IL')}</span>
                          <span>{formatFileSize(video.fileSize)}</span>
                        </div>
                        
                        {video.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {video.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                            {video.tags.length > 3 && (
                              <span className="text-gray-400 text-xs">+{video.tags.length - 3}</span>
                            )}
                          </div>
                        )}

                        {/* Action Buttons for Admin Videos */}
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => {
                              setSelectedVideo(video)
                              setShowModal(true)
                              handleVideoView(video.id)
                            }}
                            className="flex-1 btn-primary text-sm"
                          >
                            <i className="fas fa-eye ml-1"></i>
                            צפה
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedVideo(video)
                              setShowModal(true)
                            }}
                            className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition-colors"
                            title="ערוך סרטון"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteVideo(video.id)
                            }}
                            className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                            title="מחק סרטון"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View for Admin Videos */
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-right px-6 py-3 text-sm font-medium text-gray-900">סרטון</th>
                          <th className="text-right px-6 py-3 text-sm font-medium text-gray-900">קטגוריה</th>
                          <th className="text-right px-6 py-3 text-sm font-medium text-gray-900">תאריך</th>
                          <th className="text-right px-6 py-3 text-sm font-medium text-gray-900">פעולות</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {adminVideos.map((video) => (
                          <tr key={video.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-16 h-12 bg-gray-200 rounded mr-4 flex-shrink-0 overflow-hidden">
                                  {video.thumbnailUrl ? (
                                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="flex items-center justify-center h-full">
                                      <i className="fas fa-video text-gray-400"></i>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{video.title}</p>
                                  <p className="text-sm text-gray-500 line-clamp-1">{video.description}</p>
                                  <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-400 mt-1">
                                    <span>{formatDuration(video.duration)}</span>
                                    <span>{formatFileSize(video.fileSize)}</span>
                                    <span><i className="fas fa-eye ml-1"></i> {video.views}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
                                {VIDEO_CATEGORY_LABELS[video.category]}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {video.uploadedAt.toLocaleDateString('he-IL')}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex space-x-2 space-x-reverse">
                                <button
                                  onClick={() => {
                                    setSelectedVideo(video)
                                    setShowModal(true)
                                    handleVideoView(video.id)
                                  }}
                                  className="text-primary-600 hover:text-primary-800"
                                  title="צפה"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                
                                <button
                                  onClick={() => {
                                    setSelectedVideo(video)
                                    setShowModal(true)
                                  }}
                                  className="text-primary-600 hover:text-primary-800"
                                  title="ערוך"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteVideo(video.id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="מחק"
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

              {/* Empty State for Admin Videos */}
              {!loading && adminVideos.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                  <i className="fas fa-video text-gray-300 text-6xl mb-4"></i>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">אין סרטוני אימון</h3>
                  <p className="text-gray-500 mb-4">לא נמצאו סרטוני אימון שהועלו על ידי מנהלים</p>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="btn-primary"
                  >
                    <i className="fas fa-plus ml-2"></i>
                    העלה סרטון אימון ראשון
                  </button>
                </div>
              )}
            </>
          ) : activeTab === 'submissions' ? (
            <VideoReviewPanel
              submissions={playerSubmissions}
              onReviewComplete={(submissionId, status, feedback, score) => {
                setPlayerSubmissions(prev =>
                  prev.map(sub =>
                    sub.id === submissionId
                      ? {
                          ...sub,
                          status,
                          adminFeedback: feedback,
                          adminScore: score,
                          reviewedBy: user?.uid,
                          reviewedAt: new Date()
                        }
                      : sub
                  )
                )
              }}
            />
          ) : activeTab === 'collections' ? (
            /* Collections Tab */
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">אוספי סרטונים</h2>
                  <p className="text-gray-600">נהל אוספי סרטונים מאורגנים</p>
                </div>
                <button
                  onClick={() => setShowCollectionManager(true)}
                  className="btn-primary"
                >
                  <i className="fas fa-plus ml-2"></i>
                  צור אוסף חדש
                </button>
              </div>

              {collections.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-folder-open text-6xl text-gray-300 mb-4"></i>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">אין אוספים</h3>
                  <p className="text-gray-500 mb-4">צור אוסף ראשון כדי לארגן את הסרטונים שלך</p>
                  <button
                    onClick={() => setShowCollectionManager(true)}
                    className="btn-primary"
                  >
                    <i className="fas fa-plus ml-2"></i>
                    צור אוסף ראשון
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collections.map(collection => (
                    <div key={collection.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{collection.title}</h3>
                          <p className="text-gray-600 text-sm line-clamp-2">{collection.description}</p>
                        </div>
                        <div className="flex space-x-1 space-x-reverse ml-2">
                          {collection.isFeatured && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              מומלץ
                            </span>
                          )}
                          {!collection.isPublic && (
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                              פרטי
                            </span>
                          )}
                        </div>
                      </div>

                      {collection.thumbnailUrl && (
                        <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                          <img 
                            src={collection.thumbnailUrl} 
                            alt={collection.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>{collection.videoCount} סרטונים</span>
                        <span>{formatDuration(collection.totalDuration)}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          נוצר: {collection.createdAt.toLocaleDateString('he-IL')}
                        </span>
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => {
                              // TODO: Implement view collection details
                              showMessage('פונקציונליות צפייה באוסף תגיע בקרוב', 'info')
                            }}
                            className="text-primary-600 hover:text-primary-800 text-sm"
                            title="צפה באוסף"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('האם אתה בטוח שברצונך למחוק את האוסף?')) {
                                try {
                                  await videoService.deleteCollection(collection.id)
                                  setCollections(prev => prev.filter(c => c.id !== collection.id))
                                  showMessage('האוסף נמחק בהצלחה', 'success')
                                } catch (error) {
                                  showMessage('שגיאה במחיקת האוסף', 'error')
                                }
                              }
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                            title="מחק אוסף"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'challenges' ? (
            /* Challenges Tab */
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">ניהול אתגרים</h2>
                  <p className="text-gray-600">צור וטפל באתגרים לפי קבוצות גיל ותפקידים</p>
                </div>
                <button
                  onClick={() => setShowChallengeManager(true)}
                  className="btn-primary"
                >
                  <i className="fas fa-plus ml-2"></i>
                  צור אתגר חדש
                </button>
              </div>

              {/* Challenge Filters */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <h4 className="font-medium text-gray-800 mb-3">סינון אתגרים</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">קבוצת גיל</label>
                    <select
                      value={challengeFilters.ageGroup || ''}
                      onChange={(e) => setChallengeFilters(prev => ({ 
                        ...prev, 
                        ageGroup: e.target.value as AgeGroup || undefined 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">כל הגילאים</option>
                      {Object.entries(AGE_GROUP_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
                    <select
                      value={challengeFilters.category || ''}
                      onChange={(e) => setChallengeFilters(prev => ({ 
                        ...prev, 
                        category: e.target.value || undefined 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">כל הקטגוריות</option>
                      {Object.entries(CHALLENGE_CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">רמת קושי</label>
                    <select
                      value={challengeFilters.difficulty || ''}
                      onChange={(e) => setChallengeFilters(prev => ({ 
                        ...prev, 
                        difficulty: e.target.value || undefined 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">כל הרמות</option>
                      {Object.entries(CHALLENGE_DIFFICULTY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">סוג אתגר</label>
                    <select
                      value={challengeFilters.isMonthlyChallenge === undefined ? '' : challengeFilters.isMonthlyChallenge.toString()}
                      onChange={(e) => setChallengeFilters(prev => ({ 
                        ...prev, 
                        isMonthlyChallenge: e.target.value === '' ? undefined : e.target.value === 'true'
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">כל האתגרים</option>
                      <option value="false">אתגרים רגילים</option>
                      <option value="true">אתגרים חודשיים</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setChallengeFilters({})}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                  >
                    נקה סינון
                  </button>
                </div>
              </div>

              {/* Challenges List */}
              {challengesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg">טוען אתגרים...</p>
                </div>
              ) : challenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {challenges.map((challenge) => (
                    <div key={challenge.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                        <div className="flex space-x-2 space-x-reverse">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                            {CHALLENGE_DIFFICULTY_LABELS[challenge.difficulty]}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(challenge.status)}`}>
                            {CHALLENGE_STATUS_LABELS[challenge.status]}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-3">{challenge.description}</p>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">גיל:</span>
                          <span className="mr-2">{AGE_GROUP_LABELS[challenge.ageGroup]}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">קטגוריה:</span>
                          <span className="mr-2">{CHALLENGE_CATEGORY_LABELS[challenge.category]}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">רמה:</span>
                          <span className="mr-2">{challenge.level}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">נקודות:</span>
                          <span className="mr-2">{challenge.rewards.points}</span>
                        </div>
                      </div>

                      {challenge.positions && challenge.positions.length > 0 && (
                        <div className="mb-4">
                          <span className="text-sm font-medium text-gray-700">עמדות:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {challenge.positions.map((position) => (
                              <span key={position} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {POSITION_LABELS[position]}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {challenge.isMonthlyChallenge && (
                        <div className="mb-4">
                          <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            <i className="fas fa-calendar-alt ml-1"></i>
                            אתגר חודשי
                          </span>
                        </div>
                      )}

                      <div className="flex space-x-2 space-x-reverse">
                        <button
                          onClick={() => {
                            setSelectedChallenge(challenge)
                            setShowChallengeModal(true)
                          }}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <i className="fas fa-eye ml-1"></i>
                          צפה בפרטים
                        </button>
                        <button
                          onClick={() => handleEditChallenge(challenge)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className="fas fa-trophy text-6xl text-gray-300 mb-4"></i>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">אין אתגרים זמינים</h3>
                  <p className="text-gray-500 mb-4">צור אתגרים מותאמים אישית לפי קבוצות גיל ותפקידים</p>
                  <button
                    onClick={() => setShowChallengeManager(true)}
                    className="btn-primary"
                  >
                    <i className="fas fa-plus ml-2"></i>
                    צור אתגר ראשון
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Enhanced Video Review Modal */}
        {showModal && selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold">בדיקת סרטון</h2>
                    <p className="text-gray-600 text-sm">{selectedVideo.title}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setSelectedVideo(null)
                      setModerationNotes('')
                    }}
                    className="text-gray-500 hover:text-gray-700 p-2"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Video Player */}
                  <div>
                    <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden">
                      {selectedVideo.videoUrl && selectedVideo.videoUrl !== '#' ? (
                        <video 
                          controls 
                          className="w-full h-full object-cover"
                          poster={selectedVideo.thumbnailUrl}
                        >
                          <source src={selectedVideo.videoUrl} type="video/mp4" />
                          הדפדפן שלך לא תומך בנגן וידאו
                        </video>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <i className="fas fa-play-circle text-6xl text-gray-400 mb-2"></i>
                            <p className="text-gray-600">סרטון לא זמין</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Video Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-lg font-bold text-gray-900">{formatDuration(selectedVideo.duration)}</div>
                        <div className="text-sm text-gray-600">משך</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-lg font-bold text-gray-900">{selectedVideo.views}</div>
                        <div className="text-sm text-gray-600">צפיות</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-lg font-bold text-gray-900">{formatFileSize(selectedVideo.fileSize)}</div>
                        <div className="text-sm text-gray-600">גודל</div>
                      </div>
                    </div>
                  </div>

                  {/* Video Details */}
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">פרטי סרטון</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">כותרת:</span>
                          <span className="font-medium">{selectedVideo.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">קטגוריה:</span>
                          <span>{VIDEO_CATEGORY_LABELS[selectedVideo.category]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">סוג תרגיל:</span>
                          <span>{EXERCISE_TYPE_LABELS[selectedVideo.exerciseType]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">רמת קושי:</span>
                          <span>{selectedVideo.skillLevel === 'beginner' ? 'מתחיל' : selectedVideo.skillLevel === 'intermediate' ? 'בינוני' : 'מתקדם'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">תאריך העלאה:</span>
                          <span>{selectedVideo.uploadedAt.toLocaleDateString('he-IL')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Player Info */}
                    {selectedVideo.playerInfo && (
                      <div className="bg-primary-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-3">פרטי שחקן</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">שם:</span>
                            <span className="font-medium">{selectedVideo.playerInfo.playerName}</span>
                          </div>
                          {selectedVideo.playerInfo.position && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">עמדה:</span>
                              <span>{selectedVideo.playerInfo.position}</span>
                            </div>
                          )}
                          {selectedVideo.playerInfo.age > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">גיל:</span>
                              <span>{selectedVideo.playerInfo.age}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Description and Instructions */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">תיאור</h3>
                      <p className="text-sm text-gray-700 mb-3">{selectedVideo.description}</p>
                      
                      {selectedVideo.instructions && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">הוראות</h4>
                          <p className="text-sm text-gray-700">{selectedVideo.instructions}</p>
                        </div>
                      )}
                    </div>

                    {/* Tags and Equipment */}
                    {(selectedVideo.tags.length > 0 || selectedVideo.requiredEquipment.length > 0) && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        {selectedVideo.tags.length > 0 && (
                          <div className="mb-3">
                            <h4 className="font-medium text-gray-900 mb-2">תגיות</h4>
                            <div className="flex flex-wrap gap-1">
                              {selectedVideo.tags.map(tag => (
                                <span key={tag} className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {selectedVideo.requiredEquipment.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">ציוד נדרש</h4>
                            <div className="flex flex-wrap gap-1">
                              {selectedVideo.requiredEquipment.map(equipment => (
                                <span key={equipment} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                  {equipment}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Moderation Notes */}
                    {selectedVideo.status === 'pending' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          הערות מודרצים (אופציונלי)
                        </label>
                        <textarea
                          value={moderationNotes}
                          onChange={(e) => setModerationNotes(e.target.value)}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          placeholder="הערות לשחקן או לצוות הניהול..."
                        />
                      </div>
                    )}
                    
                    {selectedVideo.moderationNotes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-800 mb-2">הערות מודרצים</h4>
                        <p className="text-sm text-yellow-700">{selectedVideo.moderationNotes}</p>
                        {selectedVideo.moderatedAt && (
                          <p className="text-xs text-yellow-600 mt-2">
                            נכתב: {selectedVideo.moderatedAt.toLocaleDateString('he-IL')} {selectedVideo.moderatedAt.toLocaleTimeString('he-IL')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex space-x-3 space-x-reverse">
                    <button
                      onClick={() => {
                        // TODO: Implement edit functionality
                        showMessage('פונקציונליות עריכה תגיע בקרוב', 'info')
                      }}
                      className="flex-1 btn-primary"
                    >
                      <i className="fas fa-edit ml-2"></i>
                      ערוך סרטון
                    </button>
                    <button
                      onClick={() => handleDeleteVideo(selectedVideo.id)}
                      className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      <i className="fas fa-trash ml-2"></i>
                      מחק סרטון
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Video Modal */}
        {showUploadModal && (
          <MultiStageVideoUpload
            onUploadComplete={handleUploadComplete}
            onCancel={() => setShowUploadModal(false)}
          />
        )}

        {/* Collection Manager Modal */}
        {showCollectionManager && (
          <CollectionManager
            videos={adminVideos}
            onCollectionCreated={(collection) => {
              setCollections(prev => [collection, ...prev])
              setShowCollectionManager(false)
            }}
            onClose={() => setShowCollectionManager(false)}
          />
        )}

        {/* Challenge Manager Modal */}
        {showChallengeManager && (
          <ChallengeManager
            onClose={() => setShowChallengeManager(false)}
          />
        )}

        {/* Challenge Details/Edit Modal */}
        {showChallengeModal && selectedChallenge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingChallenge ? 'עריכת אתגר' : selectedChallenge.title}
                  </h3>
                  <button
                    onClick={() => {
                      // Abort any ongoing uploads
                      if (uploadAbortController) {
                        console.log('Cancelling ongoing uploads...')
                        uploadAbortController.abort()
                        setUploadAbortController(null)
                      }
                      
                      setShowChallengeModal(false)
                      setEditingChallenge(false)
                      setChallengeFormData({})
                      setSelectedVideoFile(null)
                      setSelectedThumbnailFile(null)
                      setUploadingVideo(false)
                      setUploadingThumbnail(false)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                {editingChallenge ? (
                  /* Edit Mode */
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">כותרת</label>
                        <input
                          type="text"
                          value={challengeFormData.title || ''}
                          onChange={(e) => setChallengeFormData(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">קטגוריה</label>
                        <select
                          value={challengeFormData.category || ''}
                          onChange={(e) => setChallengeFormData(prev => ({ ...prev, category: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {Object.entries(CHALLENGE_CATEGORY_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">תיאור</label>
                      <textarea
                        value={challengeFormData.description || ''}
                        onChange={(e) => setChallengeFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">הוראות</label>
                      <textarea
                        value={challengeFormData.instructions || ''}
                        onChange={(e) => setChallengeFormData(prev => ({ ...prev, instructions: e.target.value }))}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="הוראות מפורטות לביצוע האתגר..."
                      />
                    </div>

                    {/* Video and Thumbnail Upload */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">סרטון הדגמה</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleVideoFileSelect(file)
                                // Reset the input
                                e.target.value = ''
                              }
                            }}
                            className="hidden"
                            id="video-upload"
                            disabled={uploadingVideo}
                          />
                          <label htmlFor="video-upload" className="cursor-pointer">
                            {uploadingVideo ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="mr-2">מעלה סרטון...</span>
                              </div>
                            ) : selectedVideoFile ? (
                              <div>
                                <i className="fas fa-video text-2xl text-green-500 mb-2"></i>
                                <p className="text-sm text-green-600">סרטון נבחר: {selectedVideoFile.name}</p>
                                <p className="text-xs text-gray-500">יועלה בעת השמירה</p>
                              </div>
                            ) : (
                              <div>
                                <i className="fas fa-video text-2xl text-gray-400 mb-2"></i>
                                <p className="text-sm text-gray-600">לחץ לבחירת סרטון</p>
                              </div>
                            )}
                          </label>
                          {challengeFormData.videoUrl && (
                            <div className="mt-2">
                              <a 
                                href={challengeFormData.videoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                <i className="fas fa-play ml-1"></i>
                                צפה בסרטון הנוכחי
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">תמונת ממוזערת</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleThumbnailFileSelect(file)
                                // Reset the input
                                e.target.value = ''
                              }
                            }}
                            className="hidden"
                            id="thumbnail-upload"
                            disabled={uploadingThumbnail}
                          />
                          <label htmlFor="thumbnail-upload" className="cursor-pointer">
                            {uploadingThumbnail ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="mr-2">מעלה תמונה...</span>
                              </div>
                            ) : selectedThumbnailFile ? (
                              <div>
                                <i className="fas fa-image text-2xl text-green-500 mb-2"></i>
                                <p className="text-sm text-green-600">תמונה נבחרה: {selectedThumbnailFile.name}</p>
                                <p className="text-xs text-gray-500">תועלה בעת השמירה</p>
                              </div>
                            ) : (
                              <div>
                                <i className="fas fa-image text-2xl text-gray-400 mb-2"></i>
                                <p className="text-sm text-gray-600">לחץ לבחירת תמונה</p>
                              </div>
                            )}
                          </label>
                          {challengeFormData.thumbnailUrl && (
                            <div className="mt-2">
                              <img 
                                src={challengeFormData.thumbnailUrl} 
                                alt="Thumbnail" 
                                className="w-20 h-20 object-cover rounded mx-auto"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">רמת קושי</label>
                        <select
                          value={challengeFormData.difficulty || ''}
                          onChange={(e) => setChallengeFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {Object.entries(CHALLENGE_DIFFICULTY_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">רמה</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={challengeFormData.level || 1}
                          onChange={(e) => setChallengeFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">נקודות</label>
                        <input
                          type="number"
                          min="0"
                          value={challengeFormData.rewards?.points || 100}
                          onChange={(e) => setChallengeFormData(prev => ({ 
                            ...prev, 
                            rewards: { ...prev.rewards, points: parseInt(e.target.value) }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 space-x-reverse pt-6 border-t">
                      <button
                        onClick={testFirebaseStorage}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        בדוק Firebase Storage
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        ביטול
                      </button>
                      <button
                        onClick={handleSaveChallenge}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        שמור שינויים
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">תיאור</h4>
                      <p className="text-gray-600">{selectedChallenge.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">פרטים כלליים</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">קטגוריה:</span>
                            <span>{CHALLENGE_CATEGORY_LABELS[selectedChallenge.category]}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">רמת קושי:</span>
                            <span>{CHALLENGE_DIFFICULTY_LABELS[selectedChallenge.difficulty]}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">רמה:</span>
                            <span>{selectedChallenge.level}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">נקודות:</span>
                            <span>{selectedChallenge.rewards.points}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">גיל:</span>
                            <span>{AGE_GROUP_LABELS[selectedChallenge.ageGroup]}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-700">ניסיונות:</span>
                            <span>{selectedChallenge.attempts}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">עמדות</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedChallenge.positions.map((position) => (
                            <span key={position} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                              {POSITION_LABELS[position]}
                            </span>
                          ))}
                        </div>

                        {selectedChallenge.isMonthlyChallenge && (
                          <div className="mt-4">
                            <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                              <i className="fas fa-calendar-alt ml-1"></i>
                              אתגר חודשי
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedChallenge.instructions && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">הוראות</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <pre className="whitespace-pre-wrap text-sm text-gray-700">{selectedChallenge.instructions}</pre>
                        </div>
                      </div>
                    )}

                    {selectedChallenge.metrics && selectedChallenge.metrics.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">מדדים נמדדים</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedChallenge.metrics.map((metric) => (
                            <div key={metric.id} className="bg-gray-50 p-3 rounded-lg">
                              <div className="font-medium text-gray-900">{metric.name}</div>
                              <div className="text-sm text-gray-600">
                                יחידה: {metric.unit} | 
                                סוג: {metric.type} | 
                                {metric.required ? 'נדרש' : 'אופציונלי'}
                              </div>
                              {metric.description && (
                                <div className="text-xs text-gray-500 mt-1">{metric.description}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedChallenge.videoUrl && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">סרטון הדגמה</h4>
                        <div className="bg-gray-100 p-4 rounded-lg text-center">
                          <a 
                            href={selectedChallenge.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <i className="fas fa-play ml-1"></i>
                            צפה בסרטון הדגמה
                          </a>
                        </div>
                      </div>
                    )}

                    {selectedChallenge.thumbnailUrl && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">תמונת ממוזערת</h4>
                        <div className="bg-gray-100 p-4 rounded-lg text-center">
                          <img 
                            src={selectedChallenge.thumbnailUrl} 
                            alt="Challenge thumbnail" 
                            className="max-w-full h-48 object-cover rounded mx-auto"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 space-x-reverse pt-6 border-t">
                      <button
                        onClick={() => setShowChallengeModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        סגור
                      </button>
                      <button
                        onClick={() => handleEditChallenge(selectedChallenge)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <i className="fas fa-edit ml-1"></i>
                        ערוך אתגר
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  )
}
