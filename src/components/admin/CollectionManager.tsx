'use client'

/**
 * Collection Manager Component - Create and manage video collections
 * Allows admins to organize videos into curated collections
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { videoService } from '@/lib/videoService'
import { showMessage } from '@/components/MessageContainer'
import type { VideoCollection, VideoMetadata, VideoCategory } from '@/types/video'
import { VIDEO_CATEGORY_LABELS } from '@/types/video'

interface CollectionManagerProps {
  videos: VideoMetadata[]
  onCollectionCreated?: (collection: VideoCollection) => void
  onClose: () => void
}

export default function CollectionManager({ videos, onCollectionCreated, onClose }: CollectionManagerProps) {
  const { user } = useAuth()
  const [collections, setCollections] = useState<VideoCollection[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [editingCollection, setEditingCollection] = useState<VideoCollection | null>(null)
  const [draggedVideoIndex, setDraggedVideoIndex] = useState<number | null>(null)
  const [editingCollectionData, setEditingCollectionData] = useState<Partial<VideoCollection>>({})
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'training-exercise' as VideoCategory,
    tags: '',
    isPublic: true,
    isFeatured: false
  })

  // Load existing collections
  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = async () => {
    try {
      setLoading(true)
      const collectionsData = await videoService.getCollections()
      console.log('Loaded collections:', collectionsData)
      setCollections(collectionsData)
    } catch (error) {
      console.error('Error loading collections:', error)
      showMessage('שגיאה בטעינת האוספים', 'error')
      // Set empty array on error to show empty state
      setCollections([])
    } finally {
      setLoading(false)
    }
  }

  const handleVideoToggle = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    )
  }

  const handleCreateCollection = async () => {
    if (!formData.title.trim()) {
      showMessage('אנא הכנס כותרת לאוסף', 'error')
      return
    }

    // Allow creating collections without videos initially
    // Videos can be added later through the edit functionality

    if (!user?.uid) {
      showMessage('שגיאה: משתמש לא מזוהה', 'error')
      return
    }

    try {
      setLoading(true)
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      
      const collection = await videoService.createCollection(
        formData.title,
        formData.description,
        selectedVideos,
        formData.category,
        tags,
        formData.isPublic,
        formData.isFeatured,
        user.uid
      )

      setCollections(prev => [collection, ...prev])
      onCollectionCreated?.(collection)
      showMessage(`האוסף "${formData.title}" נוצר בהצלחה!${selectedVideos.length > 0 ? ` עם ${selectedVideos.length} סרטונים` : ' (ריק - ניתן להוסיף סרטונים מאוחר יותר)'}`, 'success')
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'training-exercise',
        tags: '',
        isPublic: true,
        isFeatured: false
      })
      setSelectedVideos([])
      setShowCreateForm(false)
      
    } catch (error) {
      console.error('Error creating collection:', error)
      const errorMessage = error instanceof Error ? error.message : 'שגיאה ביצירת האוסף'
      showMessage(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCollection = async (collectionId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את האוסף? פעולה זו לא ניתנת לביטול.')) {
      return
    }

    try {
      setLoading(true)
      await videoService.deleteCollection(collectionId)
      setCollections(prev => prev.filter(c => c.id !== collectionId))
      showMessage('האוסף נמחק בהצלחה', 'success')
    } catch (error) {
      console.error('Error deleting collection:', error)
      showMessage('שגיאה במחיקת האוסף', 'error')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleEditCollection = (collection: VideoCollection) => {
    setEditingCollection(collection)
    setSelectedVideos([...collection.videos])
    setEditingCollectionData({
      title: collection.title,
      description: collection.description,
      category: collection.category,
      tags: collection.tags,
      isPublic: collection.isPublic,
      isFeatured: collection.isFeatured,
      thumbnailUrl: collection.thumbnailUrl
    })
  }

  const handleVideoReorder = (fromIndex: number, toIndex: number) => {
    if (!editingCollection) return
    
    const newVideoOrder = [...editingCollection.videos]
    const [movedVideo] = newVideoOrder.splice(fromIndex, 1)
    newVideoOrder.splice(toIndex, 0, movedVideo)
    
    setEditingCollection({
      ...editingCollection,
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

  const handleUpdateCollection = async () => {
    if (!editingCollection) return

    try {
      setLoading(true)
      
      // Prepare update data
      const updateData: any = {
        videos: editingCollection.videos,
        videoCount: editingCollection.videos.length
      }

      // Add metadata changes if they exist
      if (editingCollectionData.title) updateData.title = editingCollectionData.title
      if (editingCollectionData.description !== undefined) updateData.description = editingCollectionData.description
      if (editingCollectionData.category) updateData.category = editingCollectionData.category
      if (editingCollectionData.tags) updateData.tags = editingCollectionData.tags
      if (editingCollectionData.isPublic !== undefined) updateData.isPublic = editingCollectionData.isPublic
      if (editingCollectionData.isFeatured !== undefined) updateData.isFeatured = editingCollectionData.isFeatured
      if (editingCollectionData.thumbnailUrl !== undefined) updateData.thumbnailUrl = editingCollectionData.thumbnailUrl

      await videoService.updateCollection(editingCollection.id, updateData)

      // Update local state
      const updatedCollection = {
        ...editingCollection,
        ...editingCollectionData,
        videos: editingCollection.videos,
        videoCount: editingCollection.videos.length
      }

      setCollections(prev => 
        prev.map(c => c.id === editingCollection.id ? updatedCollection : c)
      )
      showMessage('האוסף עודכן בהצלחה!', 'success')
      setEditingCollection(null)
      setEditingCollectionData({})
    } catch (error) {
      console.error('Error updating collection:', error)
      showMessage('שגיאה בעדכון האוסף', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddVideoToCollection = (videoId: string) => {
    if (!editingCollection) return
    
    if (!editingCollection.videos.includes(videoId)) {
      setEditingCollection({
        ...editingCollection,
        videos: [...editingCollection.videos, videoId]
      })
    }
  }

  const handleRemoveVideoFromCollection = (videoId: string) => {
    if (!editingCollection) return
    
    setEditingCollection({
      ...editingCollection,
      videos: editingCollection.videos.filter(id => id !== videoId)
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">ניהול אוספי סרטונים</h2>
              <p className="text-gray-600">צור וטפל באוספי סרטונים מאורגנים</p>
            </div>
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="btn-primary"
              >
                <i className="fas fa-plus ml-2"></i>
                צור אוסף חדש
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
          </div>

          {/* Create Collection Form */}
          {showCreateForm && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">צור אוסף חדש</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    כותרת האוסף *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="לדוגמה: תרגילי כדרור למתחילים"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    קטגוריה
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as VideoCategory }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {Object.entries(VIDEO_CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  תיאור
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="תאר את האוסף ואת מטרתו..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תגיות (מופרדות בפסיקים)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="כדרור, מתחילים, קואורדינציה"
                  />
                </div>
                
                <div className="flex items-center space-x-6 space-x-reverse">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="ml-2"
                    />
                    <span className="text-sm text-gray-700">ציבורי</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="ml-2"
                    />
                    <span className="text-sm text-gray-700">מומלץ</span>
                  </label>
                </div>
              </div>

              {/* Video Selection */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">
                  בחר סרטונים ({selectedVideos.length} נבחרו) - אופציונלי
                </h4>
                <p className="text-sm text-gray-500 mb-3">
                  ניתן ליצור אוסף ריק ולהוסיף סרטונים מאוחר יותר
                </p>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {videos.map(video => (
                      <label key={video.id} className="flex items-center space-x-3 space-x-reverse cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedVideos.includes(video.id)}
                          onChange={() => handleVideoToggle(video.id)}
                          className="ml-2"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{video.title}</p>
                          <p className="text-xs text-gray-500">{formatDuration(video.duration)} • {VIDEO_CATEGORY_LABELS[video.category]}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 space-x-reverse">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={handleCreateCollection}
                  disabled={loading || !formData.title.trim()}
                  className="btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'יוצר...' : 'צור אוסף'}
                </button>
              </div>
            </div>
          )}

          {/* Edit Collection Form */}
          {editingCollection && (
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">ערוך אוסף: {editingCollection.title}</h3>
              
              {/* Collection Metadata Editing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    כותרת האוסף
                  </label>
                  <input
                    type="text"
                    value={editingCollectionData.title || ''}
                    onChange={(e) => setEditingCollectionData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="הכנס כותרת לאוסף"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    קטגוריה
                  </label>
                  <select
                    value={editingCollectionData.category || 'training-exercise'}
                    onChange={(e) => setEditingCollectionData(prev => ({ ...prev, category: e.target.value as VideoCategory }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.entries(VIDEO_CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תיאור
                  </label>
                  <textarea
                    value={editingCollectionData.description || ''}
                    onChange={(e) => setEditingCollectionData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="הכנס תיאור לאוסף"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תגיות (מופרדות בפסיק)
                  </label>
                  <input
                    type="text"
                    value={editingCollectionData.tags?.join(', ') || ''}
                    onChange={(e) => setEditingCollectionData(prev => ({ 
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
                    value={editingCollectionData.thumbnailUrl || ''}
                    onChange={(e) => setEditingCollectionData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>
                
                <div className="flex items-center space-x-4 space-x-reverse">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingCollectionData.isPublic || false}
                      onChange={(e) => setEditingCollectionData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="ml-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">ציבורי</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingCollectionData.isFeatured || false}
                      onChange={(e) => setEditingCollectionData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="ml-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">מומלץ</span>
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Videos in Collection with Drag & Drop */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">
                    סרטונים באוסף ({editingCollection.videos.length}) - גרור לסידור מחדש
                  </h4>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-white">
                    {editingCollection.videos.map((videoId, index) => {
                      const video = videos.find(v => v.id === videoId)
                      if (!video) return null
                      
                      return (
                        <div 
                          key={videoId} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-move ${
                            draggedVideoIndex === index ? 'bg-blue-100 border-2 border-blue-300' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="flex flex-col space-y-1">
                              <button
                                onClick={() => handleVideoReorder(index, Math.max(0, index - 1))}
                                disabled={index === 0}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                title="העבר למעלה"
                              >
                                <i className="fas fa-chevron-up"></i>
                              </button>
                              <button
                                onClick={() => handleVideoReorder(index, Math.min(editingCollection.videos.length - 1, index + 1))}
                                disabled={index === editingCollection.videos.length - 1}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                title="העבר למטה"
                              >
                                <i className="fas fa-chevron-down"></i>
                              </button>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{video.title}</p>
                              <p className="text-xs text-gray-500">{formatDuration(video.duration)} • {VIDEO_CATEGORY_LABELS[video.category]}</p>
                            </div>
                            <i className="fas fa-grip-vertical text-gray-400" title="גרור לסידור מחדש"></i>
                          </div>
                          <button
                            onClick={() => handleRemoveVideoFromCollection(videoId)}
                            className="text-red-600 hover:text-red-800"
                            title="הסר מהאוסף"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Available Videos to Add */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">
                    הוסף סרטונים נוספים
                  </h4>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-white">
                    {videos
                      .filter(video => !editingCollection.videos.includes(video.id))
                      .map(video => (
                        <div key={video.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{video.title}</p>
                            <p className="text-xs text-gray-500">{formatDuration(video.duration)} • {VIDEO_CATEGORY_LABELS[video.category]}</p>
                          </div>
                          <button
                            onClick={() => handleAddVideoToCollection(video.id)}
                            className="text-green-600 hover:text-green-800"
                            title="הוסף לאוסף"
                          >
                            <i className="fas fa-plus"></i>
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 space-x-reverse mt-4">
                <button
                  onClick={() => {
                    setEditingCollection(null)
                    setEditingCollectionData({})
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={handleUpdateCollection}
                  disabled={loading}
                  className="btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'מעדכן...' : 'עדכן אוסף'}
                </button>
              </div>
            </div>
          )}

          {/* Collections List */}
          <div>
            <h3 className="text-lg font-semibold mb-4">אוספים קיימים ({collections.length})</h3>
            
            {loading && collections.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">טוען אוספים...</p>
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-folder-open text-6xl text-gray-300 mb-4"></i>
                <h4 className="text-lg font-semibold text-gray-600 mb-2">אין אוספים</h4>
                <p className="text-gray-500">צור אוסף ראשון כדי לארגן את הסרטונים שלך</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map(collection => (
                  <div key={collection.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    {/* Header with Title and Actions */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 space-x-reverse mb-2">
                          <h4 className="font-semibold text-gray-900 text-lg">{collection.title}</h4>
                          <div className="flex space-x-1 space-x-reverse">
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
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              {VIDEO_CATEGORY_LABELS[collection.category]}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{collection.description}</p>
                        
                        {/* Collection Stats */}
                        <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500 mb-3">
                          <span>
                            {collection.videoCount === 0 ? (
                              <span className="text-orange-600 font-medium">אוסף ריק</span>
                            ) : (
                              `${collection.videoCount} סרטונים`
                            )}
                          </span>
                          <span>
                            {collection.videoCount === 0 ? (
                              <span className="text-gray-400">אין סרטונים</span>
                            ) : (
                              formatDuration(collection.totalDuration)
                            )}
                          </span>
                          <span>
                            נוצר: {collection.createdAt.toLocaleDateString('he-IL')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2 space-x-reverse ml-4">
                        <button
                          onClick={() => handleEditCollection(collection)}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          title="ערוך אוסף"
                        >
                          <i className="fas fa-edit ml-1"></i>
                          ערוך
                        </button>
                        <button
                          onClick={() => handleDeleteCollection(collection.id)}
                          className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          title="מחק אוסף"
                        >
                          <i className="fas fa-trash ml-1"></i>
                          מחק
                        </button>
                      </div>
                    </div>

                    {/* Video List */}
                    {collection.videoCount > 0 && (
                      <div className="border-t border-gray-200 pt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">
                          סרטונים באוסף (לפי סדר):
                        </h5>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {collection.videos.map((videoId, index) => {
                            const video = videos.find(v => v.id === videoId)
                            if (!video) return null
                            
                            return (
                              <div key={videoId} className="flex items-center space-x-3 space-x-reverse p-2 bg-gray-50 rounded-lg">
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{video.title}</p>
                                  <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500">
                                    <span>{formatDuration(video.duration)}</span>
                                    <span>•</span>
                                    <span>{VIDEO_CATEGORY_LABELS[video.category]}</span>
                                    <span>•</span>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      video.skillLevel === 'beginner' ? 'bg-green-100 text-green-800' :
                                      video.skillLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {video.skillLevel === 'beginner' ? 'מתחיל' :
                                       video.skillLevel === 'intermediate' ? 'בינוני' : 'מתקדם'}
                                    </span>
                                  </div>
                                </div>
                                {video.thumbnailUrl && (
                                  <div className="flex-shrink-0">
                                    <img 
                                      src={video.thumbnailUrl} 
                                      alt={video.title}
                                      className="w-12 h-8 object-cover rounded"
                                    />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {collection.tags && collection.tags.length > 0 && (
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="flex flex-wrap gap-1">
                          {collection.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
