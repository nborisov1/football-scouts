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
import { videoService, formatFileSize, formatDuration } from '@/lib/videoService'
import { USER_TYPES } from '@/lib/firebase'
import type { 
  VideoMetadata, 
  VideoFilter, 
  VideoSort
} from '@/types/video'
import {
  VIDEO_STATUS_LABELS,
  VIDEO_CATEGORY_LABELS,
  EXERCISE_TYPE_LABELS
} from '@/types/video'

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
  
  // Filtering and sorting
  const [filter, setFilter] = useState<VideoFilter>({})
  const [sort, setSort] = useState<VideoSort>({
    field: 'uploadedAt',
    direction: 'desc'
  })
  const [searchQuery, setSearchQuery] = useState('')
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [moderationNotes, setModerationNotes] = useState('')

  // Load videos and statistics
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
      
      if (reset) {
        setVideos(result.videos)
      } else {
        setVideos(prev => [...prev, ...result.videos])
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
  
  
  // Load initial data
  useEffect(() => {
    if (user && user.type === USER_TYPES.ADMIN) {
      loadVideos(true)
    }
  }, [loadVideos, user])
  
  // Reload when filters change
  useEffect(() => {
    if (user && user.type === USER_TYPES.ADMIN) {
      const timeoutId = setTimeout(() => {
        loadVideos(true)
      }, 300) // Debounce search
      
      return () => clearTimeout(timeoutId)
    }
  }, [filter, sort, searchQuery, user, loadVideos])

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

        <div className="max-w-7xl mx-auto px-4 py-8">
          
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

          {/* Videos Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
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

                    {/* Action Buttons */}
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
                        צפה וטפל
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
                    {videos.map((video) => (
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
                            <button
                              onClick={() => {
                                setSelectedVideo(video)
                                setShowModal(true)
                                handleVideoView(video.id)
                              }}
                              className="text-primary-600 hover:text-primary-800"
                              title="צפה וטפל"
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

          {/* Empty State */}
          {!loading && videos.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <i className="fas fa-video text-gray-300 text-6xl mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">אין סרטונים</h3>
              <p className="text-gray-500 mb-4">לא נמצאו סרטונים בקטגוריה זו</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary"
              >
                העלה סרטון ראשון
              </button>
            </div>
          )}
        </div>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">העלאת סרטון חדש</h2>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="text-gray-500 hover:text-gray-700 p-2"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>
                
                <VideoUpload
                  onUploadComplete={handleUploadComplete}
                  onUploadStart={() => {}}
                  allowedCategories={['training-exercise', 'tutorial', 'skill-demonstration', 'match-analysis', 'technique-breakdown']}
                  defaultMetadata={{
                    status: 'approved' // Admin uploads are auto-approved
                  }}
                />
              </div>
            </div>
          </div>
        )}

    </ProtectedRoute>
  )
}
