'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'
import { 
  Challenge, 
  ChallengeMetric, 
  ChallengeThreshold,
  AgeGroup, 
  Position,
  AGE_GROUP_LABELS,
  POSITION_LABELS,
  CHALLENGE_TYPE_LABELS,
  CHALLENGE_CATEGORY_LABELS,
  CHALLENGE_DIFFICULTY_LABELS,
  METRIC_TYPE_LABELS,
  RATING_LABELS
} from '@/types/challenge'
import { challengeService, ChallengeFilters } from '@/lib/challengeService'

interface ChallengeManagerProps {
  onClose: () => void
}

export default function ChallengeManager({ onClose }: ChallengeManagerProps) {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
  const [filters, setFilters] = useState<ChallengeFilters>({})
  const [availableAgeGroups, setAvailableAgeGroups] = useState<AgeGroup[]>([])
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null)
  const [uploadAbortController, setUploadAbortController] = useState<AbortController | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<Partial<Challenge>>({
    title: '',
    description: '',
    type: 'skill',
    category: 'dribbling',
    difficulty: 'beginner',
    level: 1,
    ageGroup: 'u12',
    positions: ['all'],
    prerequisites: [],
    timeLimit: undefined,
    attempts: 3,
    videoUrl: '',
    instructions: '',
    metrics: [],
    thresholds: [],
    isMonthlyChallenge: false
  })

  const [newMetric, setNewMetric] = useState<Partial<ChallengeMetric>>({
    name: '',
    unit: '',
    type: 'numeric',
    required: true,
    description: ''
  })

  const [newThreshold, setNewThreshold] = useState<Partial<ChallengeThreshold>>({
    metricId: '',
    level: 1,
    thresholds: {
      poor: 0,
      fair: 0,
      good: 0,
      excellent: 0,
      outstanding: 0
    }
  })

  // Load challenges
  useEffect(() => {
    loadChallenges()
    loadAvailableAgeGroups()
  }, [filters])

  // Cleanup uploads on component unmount
  useEffect(() => {
    return () => {
      if (uploadAbortController) {
        console.log('Component unmounting, aborting uploads...')
        uploadAbortController.abort()
      }
    }
  }, [uploadAbortController])

  const loadChallenges = async () => {
    try {
      setLoading(true)
      const challengesData = await challengeService.getChallenges(filters)
      setChallenges(challengesData)
    } catch (error) {
      console.error('Error loading challenges:', error)
      showMessage('שגיאה בטעינת האתגרים', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableAgeGroups = async () => {
    try {
      const ageGroups = await challengeService.getAvailableAgeGroups()
      setAvailableAgeGroups(ageGroups)
    } catch (error) {
      console.error('Error loading age groups:', error)
    }
  }

  const handleCreateChallenge = async () => {
    if (!formData.title?.trim()) {
      showMessage('אנא הכנס כותרת לאתגר', 'error')
      return
    }

    if (!user) {
      showMessage('אינך מחובר למערכת', 'error')
      return
    }

    // Create abort controller for this upload session
    const abortController = new AbortController()
    setUploadAbortController(abortController)

    try {
      setUploadingVideo(true)
      setUploadingThumbnail(true)
      
      // First create the challenge to get an ID
      const challengeData = {
        title: formData.title!,
        description: formData.description || '',
        type: formData.type!,
        category: formData.category!,
        difficulty: formData.difficulty!,
        level: formData.level!,
        ageGroup: formData.ageGroup!,
        positions: formData.positions!,
        prerequisites: formData.prerequisites || [],
        requirements: formData.requirements || {},
        rewards: formData.rewards || { points: 100, badge: 'challenger' },
        timeLimit: formData.timeLimit,
        attempts: formData.attempts!,
        status: 'available' as const,
        videoUrl: formData.videoUrl,
        thumbnailUrl: formData.thumbnailUrl,
        instructions: formData.instructions || '',
        metrics: formData.metrics || [],
        thresholds: formData.thresholds || [],
        isMonthlyChallenge: formData.isMonthlyChallenge || false,
        createdBy: user.uid
      }

      const newChallenge = await challengeService.createChallenge(challengeData)
      console.log('Challenge created with ID:', newChallenge.id)
      
      // Upload files if they were selected
      let finalVideoUrl = formData.videoUrl
      let finalThumbnailUrl = formData.thumbnailUrl
      
      if (selectedVideoFile) {
        console.log('Uploading video file...')
        // Check if upload was cancelled
        if (abortController.signal.aborted) {
          console.log('Upload cancelled by user')
          return
        }
        finalVideoUrl = await challengeService.uploadChallengeVideo(selectedVideoFile, newChallenge.id)
        console.log('Video uploaded successfully:', finalVideoUrl)
      }
      
      if (selectedThumbnailFile) {
        console.log('Uploading thumbnail file...')
        // Check if upload was cancelled
        if (abortController.signal.aborted) {
          console.log('Upload cancelled by user')
          return
        }
        finalThumbnailUrl = await challengeService.uploadChallengeThumbnail(selectedThumbnailFile, newChallenge.id)
        console.log('Thumbnail uploaded successfully:', finalThumbnailUrl)
      }
      
      // Check if upload was cancelled before updating challenge
      if (abortController.signal.aborted) {
        console.log('Upload cancelled by user')
        return
      }
      
      // Update the challenge with the uploaded file URLs
      if (selectedVideoFile || selectedThumbnailFile) {
        await challengeService.updateChallenge(newChallenge.id, {
          videoUrl: finalVideoUrl,
          thumbnailUrl: finalThumbnailUrl
        })
      }
      
      showMessage('האתגר נוצר בהצלחה!', 'success')
      setShowCreateForm(false)
      resetForm()
      loadChallenges()
    } catch (error) {
      console.error('Error creating challenge:', error)
      if (abortController.signal.aborted) {
        console.log('Upload was cancelled')
        showMessage('העלאה בוטלה', 'info')
      } else {
        showMessage('שגיאה ביצירת האתגר', 'error')
      }
    } finally {
      setUploadingVideo(false)
      setUploadingThumbnail(false)
      setUploadAbortController(null)
    }
  }

  const handleEditChallenge = (challenge: Challenge) => {
    setEditingChallenge(challenge)
    setFormData(challenge)
    setShowCreateForm(true)
  }

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את האתגר?')) {
      return
    }

    try {
      await challengeService.deleteChallenge(challengeId)
      showMessage('האתגר נמחק בהצלחה!', 'success')
      loadChallenges()
    } catch (error) {
      console.error('Error deleting challenge:', error)
      showMessage('שגיאה במחיקת האתגר', 'error')
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
    setFormData(prev => ({ ...prev, videoUrl }))
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
    setFormData(prev => ({ ...prev, thumbnailUrl }))
    showMessage('תמונה נבחרה - תועלה בעת השמירה', 'success')
  }

  const resetForm = () => {
    // Abort any ongoing uploads
    if (uploadAbortController) {
      console.log('Cancelling ongoing uploads...')
      uploadAbortController.abort()
      setUploadAbortController(null)
    }
    
    setFormData({
      title: '',
      description: '',
      type: 'skill',
      category: 'dribbling',
      difficulty: 'beginner',
      level: 1,
      ageGroup: 'u12',
      positions: ['all'],
      prerequisites: [],
      timeLimit: undefined,
      attempts: 3,
      videoUrl: '',
      thumbnailUrl: '',
      instructions: '',
      metrics: [],
      thresholds: [],
      isMonthlyChallenge: false
    })
    setEditingChallenge(null)
    setSelectedVideoFile(null)
    setSelectedThumbnailFile(null)
    setUploadingVideo(false)
    setUploadingThumbnail(false)
  }

  const addMetric = () => {
    if (!newMetric.name?.trim()) {
      showMessage('אנא הכנס שם למדד', 'error')
      return
    }

    const metric: ChallengeMetric = {
      id: `metric-${Date.now()}`,
      name: newMetric.name!,
      unit: newMetric.unit || '',
      type: newMetric.type || 'numeric',
      required: newMetric.required || false,
      description: newMetric.description || ''
    }

    setFormData(prev => ({
      ...prev,
      metrics: [...(prev.metrics || []), metric]
    }))

    setNewMetric({
      name: '',
      unit: '',
      type: 'numeric',
      required: true,
      description: ''
    })
  }

  const removeMetric = (metricId: string) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics?.filter(m => m.id !== metricId) || []
    }))
  }

  const addThreshold = () => {
    if (!newThreshold.metricId) {
      showMessage('אנא בחר מדד', 'error')
      return
    }

    const threshold: ChallengeThreshold = {
      metricId: newThreshold.metricId!,
      level: newThreshold.level || 1,
      thresholds: newThreshold.thresholds || {
        poor: 0,
        fair: 0,
        good: 0,
        excellent: 0,
        outstanding: 0
      }
    }

    setFormData(prev => ({
      ...prev,
      thresholds: [...(prev.thresholds || []), threshold]
    }))

    setNewThreshold({
      metricId: '',
      level: 1,
      thresholds: {
        poor: 0,
        fair: 0,
        good: 0,
        excellent: 0,
        outstanding: 0
      }
    })
  }

  const removeThreshold = (index: number) => {
    setFormData(prev => ({
      ...prev,
      thresholds: prev.thresholds?.filter((_, i) => i !== index) || []
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">ניהול אתגרים</h2>
              <p className="text-green-100 mt-1">צור וטפל באתגרים לפי קבוצות גיל ותפקידים</p>
            </div>
            <div className="flex space-x-3 space-x-reverse">
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium"
              >
                <i className="fas fa-plus ml-2"></i>
                צור אתגר חדש
              </button>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          {/* Create/Edit Challenge Form */}
          {showCreateForm && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border border-green-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <i className="fas fa-trophy text-green-600 ml-2"></i>
                  {editingChallenge ? 'ערוך אתגר' : 'צור אתגר חדש'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    resetForm()
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">מידע בסיסי</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      כותרת האתגר *
                    </label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                      placeholder="לדוגמה: אתגר כדרור מהיר"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      תיאור
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                      placeholder="תאר את האתגר ואת המטרה שלו"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      הוראות מפורטות
                    </label>
                    <textarea
                      value={formData.instructions || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                      placeholder="הוראות מפורטות לשחקן כיצד לבצע את האתגר"
                    />
                  </div>
                </div>

                {/* Video and Thumbnail Upload */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">מדיה</h4>
                  
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
                            id="challenge-video-upload"
                            disabled={uploadingVideo}
                          />
                        <label htmlFor="challenge-video-upload" className="cursor-pointer">
                          {uploadingVideo ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
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
                              <p className="text-sm text-gray-600">לחץ לבחירת סרטון הדגמה</p>
                            </div>
                          )}
                        </label>
                        {formData.videoUrl && (
                          <div className="mt-2">
                            <a 
                              href={formData.videoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              <i className="fas fa-play ml-1"></i>
                              צפה בסרטון
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
                            id="challenge-thumbnail-upload"
                            disabled={uploadingThumbnail}
                          />
                        <label htmlFor="challenge-thumbnail-upload" className="cursor-pointer">
                          {uploadingThumbnail ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
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
                              <p className="text-sm text-gray-600">לחץ לבחירת תמונת ממוזערת</p>
                            </div>
                          )}
                        </label>
                        {formData.thumbnailUrl && (
                          <div className="mt-2">
                            <img 
                              src={formData.thumbnailUrl} 
                              alt="Thumbnail" 
                              className="w-20 h-20 object-cover rounded mx-auto"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuration */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">הגדרות</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        סוג אתגר
                      </label>
                      <select
                        value={formData.type || 'skill'}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                      >
                        {Object.entries(CHALLENGE_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        קטגוריה
                      </label>
                      <select
                        value={formData.category || 'dribbling'}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                      >
                        {Object.entries(CHALLENGE_CATEGORY_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        רמת קושי
                      </label>
                      <select
                        value={formData.difficulty || 'beginner'}
                        onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                      >
                        {Object.entries(CHALLENGE_DIFFICULTY_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        רמה
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.level || 1}
                        onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        קבוצת גיל
                      </label>
                      <select
                        value={formData.ageGroup || 'u12'}
                        onChange={(e) => setFormData(prev => ({ ...prev, ageGroup: e.target.value as AgeGroup }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                      >
                        {Object.entries(AGE_GROUP_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ניסיונות מקסימליים
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.attempts || 3}
                        onChange={(e) => setFormData(prev => ({ ...prev, attempts: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      תפקידים
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(POSITION_LABELS).map(([value, label]) => (
                        <label key={value} className="flex items-center p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.positions?.includes(value as Position) || false}
                            onChange={(e) => {
                              const positions = formData.positions || []
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, positions: [...positions, value as Position] }))
                              } else {
                                setFormData(prev => ({ ...prev, positions: positions.filter(p => p !== value) }))
                              }
                            }}
                            className="ml-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isMonthlyChallenge || false}
                        onChange={(e) => setFormData(prev => ({ ...prev, isMonthlyChallenge: e.target.checked }))}
                        className="ml-3 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">אתגר חודשי</span>
                        <p className="text-xs text-gray-500">אתגר להתקדמות רמות</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Metrics Configuration */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 mb-4 border-b border-gray-200 pb-2">מדדים לאתגר</h4>
                
                {/* Add New Metric */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                  <h5 className="font-medium text-gray-700 mb-3">הוסף מדד חדש</h5>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">שם המדד</label>
                      <input
                        type="text"
                        value={newMetric.name || ''}
                        onChange={(e) => setNewMetric(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="לדוגמה: זמן"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">יחידה</label>
                      <input
                        type="text"
                        value={newMetric.unit || ''}
                        onChange={(e) => setNewMetric(prev => ({ ...prev, unit: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="לדוגמה: שניות"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">סוג</label>
                      <select
                        value={newMetric.type || 'numeric'}
                        onChange={(e) => setNewMetric(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        {Object.entries(METRIC_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newMetric.required || false}
                          onChange={(e) => setNewMetric(prev => ({ ...prev, required: e.target.checked }))}
                          className="ml-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">חובה</span>
                      </label>
                    </div>
                    <div>
                      <button
                        onClick={addMetric}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <i className="fas fa-plus ml-1"></i>
                        הוסף
                      </button>
                    </div>
                  </div>
                </div>

                {/* Current Metrics */}
                {formData.metrics && formData.metrics.length > 0 && (
                  <div className="space-y-2">
                    {formData.metrics.map((metric) => (
                      <div key={metric.id} className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-3">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <span className="font-medium text-gray-900">{metric.name}</span>
                          <span className="text-sm text-gray-500">({metric.unit})</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {METRIC_TYPE_LABELS[metric.type]}
                          </span>
                          {metric.required && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">חובה</span>
                          )}
                        </div>
                        <button
                          onClick={() => removeMetric(metric.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    resetForm()
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  <i className="fas fa-times ml-2"></i>
                  ביטול
                </button>
                <button
                  onClick={handleCreateChallenge}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center"
                >
                  <i className="fas fa-save ml-2"></i>
                  {editingChallenge ? 'עדכן אתגר' : 'צור אתגר'}
                </button>
              </div>
            </div>
          )}

          {/* Challenges List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <i className="fas fa-trophy text-green-600 ml-2"></i>
                אתגרים קיימים ({challenges.length})
              </h3>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-800 mb-3">סינון אתגרים</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">קבוצת גיל</label>
                  <select
                    value={filters.ageGroup || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      ageGroup: e.target.value as AgeGroup || undefined 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                    value={filters.category || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      category: e.target.value || undefined 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">כל הקטגוריות</option>
                    {Object.entries(CHALLENGE_CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">רמת קושי</label>
                  <select
                    value={filters.difficulty || ''}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      difficulty: e.target.value || undefined 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">כל הרמות</option>
                    {Object.entries(CHALLENGE_DIFFICULTY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">סוג אתגר</label>
                  <select
                    value={filters.isMonthlyChallenge === undefined ? '' : filters.isMonthlyChallenge.toString()}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      isMonthlyChallenge: e.target.value === '' ? undefined : e.target.value === 'true'
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">כל האתגרים</option>
                    <option value="false">אתגרים רגילים</option>
                    <option value="true">אתגרים חודשיים</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setFilters({})}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                >
                  נקה סינון
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">טוען אתגרים...</p>
              </div>
            ) : challenges.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <i className="fas fa-trophy text-8xl text-gray-400 mb-6"></i>
                <h4 className="text-xl font-semibold text-gray-600 mb-3">אין אתגרים עדיין</h4>
                <p className="text-gray-500 mb-6 text-lg">צור אתגר ראשון כדי להתחיל</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-lg"
                >
                  <i className="fas fa-plus ml-2"></i>
                  צור אתגר ראשון
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-gray-900 text-lg">{challenge.title}</h4>
                      <div className="flex space-x-2 space-x-reverse">
                        <button
                          onClick={() => handleEditChallenge(challenge)}
                          className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-colors"
                          title="ערוך אתגר"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteChallenge(challenge.id)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="מחק אתגר"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {challenge.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">קבוצת גיל:</span>
                        <span className="font-medium">{AGE_GROUP_LABELS[challenge.ageGroup]}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">רמה:</span>
                        <span className="font-medium">{challenge.level}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">מדדים:</span>
                        <span className="font-medium">{challenge.metrics.length}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2 space-x-reverse">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                          {CHALLENGE_CATEGORY_LABELS[challenge.category]}
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                          {CHALLENGE_DIFFICULTY_LABELS[challenge.difficulty]}
                        </span>
                        {challenge.isMonthlyChallenge && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                            חודשי
                          </span>
                        )}
                      </div>
                    </div>
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
