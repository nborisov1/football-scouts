'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { videoService } from '@/lib/videoService'
import { showMessage } from '@/components/MessageContainer'
import type { VideoCollection, VideoMetadata, VideoCategory } from '@/types/video'
import { VIDEO_CATEGORY_LABELS } from '@/types/video'

interface CollectionDetailPageProps {
  collectionId: string
  videos: VideoMetadata[]
  onCollectionUpdated?: (collection: VideoCollection) => void
  onCollectionDeleted?: (collectionId: string) => void
}

export default function CollectionDetailPage({ 
  collectionId, 
  videos, 
  onCollectionUpdated, 
  onCollectionDeleted 
}: CollectionDetailPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [collection, setCollection] = useState<VideoCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [draggedVideoIndex, setDraggedVideoIndex] = useState<number | null>(null)
  
  // Video search and filtering state
  const [videoSearchTerm, setVideoSearchTerm] = useState('')
  const [videoFilterCategory, setVideoFilterCategory] = useState<string>('all')
  const [videoFilterSkillLevel, setVideoFilterSkillLevel] = useState<string>('all')
  const [showVideoSearch, setShowVideoSearch] = useState(false)
  const [selectedVideosToAdd, setSelectedVideosToAdd] = useState<string[]>([])
  
  // Form state for editing
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'training-exercise' as VideoCategory,
    tags: [] as string[],
    isPublic: true,
    isFeatured: false,
    thumbnailUrl: ''
  })

  // Load collection data
  useEffect(() => {
    const loadCollection = async () => {
      try {
        setLoading(true)
        const collectionData = await videoService.getCollection(collectionId)
        if (collectionData) {
          setCollection(collectionData)
          setFormData({
            title: collectionData.title,
            description: collectionData.description,
            category: collectionData.category,
            tags: collectionData.tags || [],
            isPublic: collectionData.isPublic,
            isFeatured: collectionData.isFeatured,
            thumbnailUrl: collectionData.thumbnailUrl || ''
          })
        }
      } catch (error) {
        console.error('Error loading collection:', error)
        showMessage('שגיאה בטעינת האוסף', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadCollection()
  }, [collectionId])

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Filter available videos based on search and filters
  const getFilteredAvailableVideos = () => {
    if (!collection) return []
    
    return safeVideos
      .filter(video => !collection.videos.includes(video.id))
      .filter(video => {
        // Search term filter
        if (videoSearchTerm) {
          const searchLower = videoSearchTerm.toLowerCase()
          const matchesTitle = video.title.toLowerCase().includes(searchLower)
          const matchesDescription = video.description.toLowerCase().includes(searchLower)
          const matchesTags = video.tags.some(tag => tag.toLowerCase().includes(searchLower))
          if (!matchesTitle && !matchesDescription && !matchesTags) return false
        }
        
        // Category filter
        if (videoFilterCategory !== 'all' && video.category !== videoFilterCategory) {
          return false
        }
        
        // Skill level filter
        if (videoFilterSkillLevel !== 'all' && video.skillLevel !== videoFilterSkillLevel) {
          return false
        }
        
        return true
      })
  }

  const clearVideoFilters = () => {
    setVideoSearchTerm('')
    setVideoFilterCategory('all')
    setVideoFilterSkillLevel('all')
  }

  const handleToggleVideoSelection = (videoId: string) => {
    setSelectedVideosToAdd(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    )
  }

  const handleAddSelectedVideos = () => {
    if (!collection || selectedVideosToAdd.length === 0) return
    
    const updatedCollection = {
      ...collection,
      videos: [...collection.videos, ...selectedVideosToAdd],
      videoCount: collection.videoCount + selectedVideosToAdd.length
    }
    setCollection(updatedCollection)
    setSelectedVideosToAdd([])
    showMessage(`${selectedVideosToAdd.length} סרטונים נוספו לאוסף`, 'success')
  }

  const handleSelectAllVideos = () => {
    const allVideoIds = getFilteredAvailableVideos().map(video => video.id)
    setSelectedVideosToAdd(allVideoIds)
  }

  const handleDeselectAllVideos = () => {
    setSelectedVideosToAdd([])
  }

  const handleEdit = () => {
    setEditing(true)
  }

  const handleCancel = () => {
    if (collection) {
      setFormData({
        title: collection.title,
        description: collection.description,
        category: collection.category,
        tags: collection.tags || [],
        isPublic: collection.isPublic,
        isFeatured: collection.isFeatured,
        thumbnailUrl: collection.thumbnailUrl || ''
      })
    }
    setEditing(false)
  }

  const handleSave = async () => {
    if (!collection) return

    try {
      setLoading(true)
      
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
        isPublic: formData.isPublic,
        isFeatured: formData.isFeatured,
        thumbnailUrl: formData.thumbnailUrl || undefined
      }

      await videoService.updateCollection(collection.id, updateData)
      
      const updatedCollection = { ...collection, ...updateData }
      setCollection(updatedCollection)
      onCollectionUpdated?.(updatedCollection)
      showMessage('האוסף עודכן בהצלחה!', 'success')
      setEditing(false)
    } catch (error) {
      console.error('Error updating collection:', error)
      showMessage('שגיאה בעדכון האוסף', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!collection) return
    
    if (confirm('האם אתה בטוח שברצונך למחוק את האוסף? פעולה זו לא ניתנת לביטול.')) {
      try {
        setLoading(true)
        await videoService.deleteCollection(collection.id)
        onCollectionDeleted?.(collection.id)
        showMessage('האוסף נמחק בהצלחה', 'success')
        router.back()
      } catch (error) {
        console.error('Error deleting collection:', error)
        showMessage('שגיאה במחיקת האוסף', 'error')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleVideoReorder = (fromIndex: number, toIndex: number) => {
    if (!collection) return
    
    const newVideoOrder = [...collection.videos]
    const [movedVideo] = newVideoOrder.splice(fromIndex, 1)
    newVideoOrder.splice(toIndex, 0, movedVideo)
    
    setCollection({
      ...collection,
      videos: newVideoOrder
    })
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedVideoIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedVideoIndex === null || draggedVideoIndex === dropIndex) return
    
    handleVideoReorder(draggedVideoIndex, dropIndex)
    setDraggedVideoIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedVideoIndex(null)
  }

  const handleAddVideo = (videoId: string) => {
    if (!collection) return
    
    if (!collection.videos.includes(videoId)) {
      const updatedCollection = {
        ...collection,
        videos: [...collection.videos, videoId],
        videoCount: collection.videoCount + 1
      }
      setCollection(updatedCollection)
    }
  }

  const handleRemoveVideo = (videoId: string) => {
    if (!collection) return
    
    const updatedCollection = {
      ...collection,
      videos: collection.videos.filter(id => id !== videoId),
      videoCount: collection.videoCount - 1
    }
    setCollection(updatedCollection)
  }

  const handleSaveVideoOrder = async () => {
    if (!collection) return

    try {
      setLoading(true)
      await videoService.updateCollection(collection.id, {
        videos: collection.videos,
        videoCount: collection.videos.length
      })
      showMessage('סדר הסרטונים נשמר בהצלחה!', 'success')
    } catch (error) {
      console.error('Error saving video order:', error)
      showMessage('שגיאה בשמירת סדר הסרטונים', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !collection) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען אוסף...</p>
        </div>
      </div>
    )
  }

  // Ensure videos is always an array
  const safeVideos = Array.isArray(videos) ? videos : []

  if (!Array.isArray(videos)) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען סרטונים...</p>
        </div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-exclamation-triangle text-6xl text-gray-300 mb-4"></i>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">אוסף לא נמצא</h3>
        <p className="text-gray-500 mb-4">האוסף המבוקש לא קיים או נמחק</p>
        <button
          onClick={() => router.back()}
          className="btn-primary"
        >
          חזור לרשימת האוספים
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 space-x-reverse mb-3">
              <button
                onClick={() => router.back()}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="חזור"
              >
                <i className="fas fa-arrow-right"></i>
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{collection.title}</h1>
              <div className="flex space-x-2 space-x-reverse">
                {collection.isFeatured && (
                  <span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                    מומלץ
                  </span>
                )}
                {!collection.isPublic && (
                  <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                    פרטי
                  </span>
                )}
                <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                  {VIDEO_CATEGORY_LABELS[collection.category]}
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 text-lg mb-4">{collection.description}</p>
            
            <div className="flex items-center space-x-6 space-x-reverse text-sm text-gray-500">
              <span><i className="fas fa-video ml-1"></i> {collection.videoCount} סרטונים</span>
              <span><i className="fas fa-clock ml-1"></i> {formatDuration(collection.totalDuration)}</span>
              <span><i className="fas fa-calendar ml-1"></i> נוצר: {collection.createdAt.toLocaleDateString('he-IL')}</span>
              <span><i className="fas fa-edit ml-1"></i> עודכן: {collection.updatedAt.toLocaleDateString('he-IL')}</span>
            </div>
          </div>
          
          <div className="flex space-x-3 space-x-reverse">
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'שומר...' : 'שמור שינויים'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEdit}
                  className="btn-primary"
                >
                  <i className="fas fa-edit ml-2"></i>
                  ערוך אוסף
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <i className="fas fa-trash ml-2"></i>
                  מחק אוסף
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tags */}
        {collection.tags && collection.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {collection.tags.map((tag, index) => (
              <span 
                key={index}
                className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collection Details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">פרטי האוסף</h3>
            
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    כותרת האוסף
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תיאור
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    קטגוריה
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as VideoCategory }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.entries(VIDEO_CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תגיות (מופרדות בפסיק)
                  </label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="תגית1, תגית2, תגית3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תמונת ממוזערת (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="ml-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">אוסף ציבורי</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="ml-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">אוסף מומלץ</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">כותרת</h4>
                  <p className="text-gray-900">{collection.title}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">תיאור</h4>
                  <p className="text-gray-900">{collection.description}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700">קטגוריה</h4>
                  <p className="text-gray-900">{VIDEO_CATEGORY_LABELS[collection.category]}</p>
                </div>
                
                {collection.thumbnailUrl && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">תמונת ממוזערת</h4>
                    <img 
                      src={collection.thumbnailUrl} 
                      alt={collection.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Video Management */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                ניהול סרטונים ({collection.videos.length})
              </h3>
              <div className="flex space-x-3 space-x-reverse">
                <button
                  onClick={() => setShowVideoSearch(!showVideoSearch)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <i className="fas fa-search ml-2"></i>
                  {showVideoSearch ? 'סגור חיפוש' : 'חפש סרטונים'}
                </button>
                {collection.videos.length > 0 && (
                  <button
                    onClick={handleSaveVideoOrder}
                    disabled={loading}
                    className="btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <i className="fas fa-save ml-2"></i>
                    שמור סדר
                  </button>
                )}
              </div>
            </div>

            {/* Video Search and Filters */}
            {showVideoSearch && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-4">חיפוש וסינון סרטונים</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Search Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      חיפוש
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={videoSearchTerm}
                        onChange={(e) => setVideoSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="חפש לפי שם, תיאור או תגיות..."
                      />
                      <i className="fas fa-search absolute right-3 top-3 text-gray-400"></i>
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      קטגוריה
                    </label>
                    <select
                      value={videoFilterCategory}
                      onChange={(e) => setVideoFilterCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">כל הקטגוריות</option>
                      {Object.entries(VIDEO_CATEGORY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Skill Level Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      רמת קושי
                    </label>
                    <select
                      value={videoFilterSkillLevel}
                      onChange={(e) => setVideoFilterSkillLevel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">כל הרמות</option>
                      <option value="beginner">מתחיל</option>
                      <option value="intermediate">בינוני</option>
                      <option value="advanced">מתקדם</option>
                    </select>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    נמצאו {getFilteredAvailableVideos().length} סרטונים
                  </div>
                  <button
                    onClick={clearVideoFilters}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    <i className="fas fa-times ml-1"></i>
                    נקה סינון
                  </button>
                </div>
              </div>
            )}

            {/* Current Videos */}
            {collection.videos.length > 0 ? (
              <div className="space-y-3 mb-6">
                <h4 className="text-md font-medium text-gray-700">סרטונים באוסף (גרור לסידור מחדש)</h4>
                <div className="space-y-2">
                  {collection.videos.map((videoId, index) => {
                    const video = safeVideos.find(v => v.id === videoId)
                    if (!video) return null
                    
                    return (
                      <div 
                        key={videoId} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center space-x-4 space-x-reverse p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-move ${
                          draggedVideoIndex === index ? 'bg-blue-100 border-2 border-blue-300' : ''
                        }`}
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        
                        {video.thumbnailUrl && (
                          <div className="flex-shrink-0">
                            <img 
                              src={video.thumbnailUrl} 
                              alt={video.title}
                              className="w-16 h-12 object-cover rounded"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-gray-900 truncate">{video.title}</h5>
                          <div className="flex items-center space-x-3 space-x-reverse text-xs text-gray-500 mt-1">
                            <span>{formatDuration(video.duration)}</span>
                            <span>•</span>
                            <span>{VIDEO_CATEGORY_LABELS[video.category]}</span>
                            <span>•</span>
                            <span className={`px-2 py-1 rounded-full ${
                              video.skillLevel === 'beginner' ? 'bg-green-100 text-green-800' :
                              video.skillLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {video.skillLevel === 'beginner' ? 'מתחיל' :
                               video.skillLevel === 'intermediate' ? 'בינוני' : 'מתקדם'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <i className="fas fa-grip-vertical text-gray-400" title="גרור לסידור מחדש"></i>
                          <button
                            onClick={() => handleRemoveVideo(videoId)}
                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded"
                            title="הסר מהאוסף"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-video text-4xl mb-3"></i>
                <p>אין סרטונים באוסף זה</p>
              </div>
            )}

            {/* Available Videos to Add */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-gray-700">
                  הוסף סרטונים נוספים ({getFilteredAvailableVideos().length})
                </h4>
                {getFilteredAvailableVideos().length > 0 && (
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={handleSelectAllVideos}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      בחר הכל
                    </button>
                    <button
                      onClick={handleDeselectAllVideos}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      בטל בחירה
                    </button>
                    {selectedVideosToAdd.length > 0 && (
                      <button
                        onClick={handleAddSelectedVideos}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        הוסף {selectedVideosToAdd.length} סרטונים
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {getFilteredAvailableVideos().length > 0 ? (
                  getFilteredAvailableVideos().map(video => (
                    <div 
                      key={video.id} 
                      className={`flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg ${
                        selectedVideosToAdd.includes(video.id) ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3 space-x-reverse flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={selectedVideosToAdd.includes(video.id)}
                          onChange={() => handleToggleVideoSelection(video.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        {video.thumbnailUrl && (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            className="w-12 h-8 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{video.title}</p>
                          <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500">
                            <span>{formatDuration(video.duration)}</span>
                            <span>•</span>
                            <span>{VIDEO_CATEGORY_LABELS[video.category]}</span>
                            <span>•</span>
                            <span className={`px-2 py-1 rounded-full ${
                              video.skillLevel === 'beginner' ? 'bg-green-100 text-green-800' :
                              video.skillLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {video.skillLevel === 'beginner' ? 'מתחיל' :
                               video.skillLevel === 'intermediate' ? 'בינוני' : 'מתקדם'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleAddVideo(video.id)}
                          className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded"
                          title="הוסף לאוסף"
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-search text-4xl mb-3"></i>
                    <p>לא נמצאו סרטונים התואמים לסינון</p>
                    <button
                      onClick={clearVideoFilters}
                      className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                    >
                      נקה סינון
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
