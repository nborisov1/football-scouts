'use client'

/**
 * Player Training Dashboard
 * Shows personalized training program based on player profile
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '../MessageContainer'
import { 
  TrainingSeries, 
  PlayerProgress, 
  VideoMetadata,
  PlayerVideoSubmission,
  TRAINING_TYPE_LABELS,
  POSITION_LABELS,
  AGE_GROUP_LABELS
} from '@/types/video'
import { USER_TYPES } from '@/lib/firebase'

interface TrainingDashboardProps {
  onContentAvailabilityChange?: (hasContent: boolean) => void
}

export default function TrainingDashboard({ onContentAvailabilityChange }: TrainingDashboardProps) {
  const { user } = useAuth()
  const [playerProgress, setPlayerProgress] = useState<PlayerProgress | null>(null)
  const [availableSeries, setAvailableSeries] = useState<TrainingSeries[]>([])
  const [currentVideo, setCurrentVideo] = useState<VideoMetadata | null>(null)
  const [pendingSubmissions, setPendingSubmissions] = useState<PlayerVideoSubmission[]>([])

  // Mock data for now - will be replaced with real data from Firestore
  useEffect(() => {
    if (user?.type === USER_TYPES.PLAYER) {
      // Mock player progress
      setPlayerProgress({
        playerId: user.uid,
        completedSeries: [],
        completedVideos: [],
        currentSeries: 'series-1',
        currentVideoIndex: 0,
        totalPoints: 0,
        rank: 0,
        lastActivity: new Date(),
        achievements: []
      })

      // Mock available series based on player profile
      // For now, we'll simulate no content to show Coming Soon page
      const mockSeries: TrainingSeries[] = []
      setAvailableSeries(mockSeries)
      
      // Notify parent about content availability
      if (onContentAvailabilityChange) {
        onContentAvailabilityChange(mockSeries.length > 0)
      }
    }
  }, [user])

  const getAgeGroup = (age: number): string => {
    if (age <= 8) return 'u8'
    if (age <= 10) return 'u10'
    if (age <= 12) return 'u12'
    if (age <= 14) return 'u14'
    if (age <= 16) return 'u16'
    if (age <= 18) return 'u18'
    if (age <= 21) return 'u21'
    return 'adult'
  }

  const getRecommendedSeries = () => {
    if (!user || !availableSeries.length) return []
    
    const playerAgeGroup = getAgeGroup(user.age || 18)
    const playerPosition = user.position || 'midfielder'
    
    return availableSeries.filter(series => 
      series.isActive &&
      series.ageGroup === playerAgeGroup &&
      (series.positionSpecific.length === 0 || series.positionSpecific.includes(playerPosition as any)) &&
      !playerProgress?.completedSeries.includes(series.id)
    )
  }

  const startSeries = (seriesId: string) => {
    setPlayerProgress(prev => ({
      ...prev!,
      currentSeries: seriesId,
      currentVideoIndex: 0
    }))
    showMessage('התחלת סדרת אימונים חדשה!', 'success')
  }

  const submitVideo = (videoId: string, seriesId: string) => {
    // This will open video upload modal
    showMessage('פתיחת מסך העלאת סרטון...', 'info')
  }

  const getProgressPercentage = (series: TrainingSeries) => {
    if (!playerProgress) return 0
    const completedInSeries = series.videos.filter(videoId => 
      playerProgress.completedVideos.includes(videoId)
    ).length
    return Math.round((completedInSeries / series.videos.length) * 100)
  }

  if (!user || user.type !== USER_TYPES.PLAYER) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">גישה מוגבלת</h2>
          <p className="text-gray-600">דף זה זמין רק לשחקנים</p>
        </div>
      </div>
    )
  }

  const recommendedSeries = getRecommendedSeries()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">תוכנית האימון שלי</h1>
              <p className="text-gray-600">
                שלום {user.displayName || user.firstName}, הנה התוכנית המותאמת לך
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">נקודות</div>
              <div className="text-2xl font-bold text-blue-600">{playerProgress?.totalPoints || 0}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Current Progress */}
        {playerProgress?.currentSeries && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">האימון הנוכחי שלי</h2>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-blue-900">אימון בסיסי לחלוצים מתחילים</h3>
                <span className="text-sm text-blue-600">25% הושלם</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
              <div className="flex justify-between text-sm text-blue-700">
                <span>1 מתוך 3 תרגילים</span>
                <span>~30 דקות נותרו</span>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Training Series */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">סדרות אימון מומלצות</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedSeries.map((series) => (
              <div key={series.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{series.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{series.description}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {TRAINING_TYPE_LABELS[series.trainingType]}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">רמת קושי:</span>
                    <span className="font-medium">{series.difficultyLevel}/10</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">משך זמן:</span>
                    <span className="font-medium">{series.estimatedDuration} דקות</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">תרגילים:</span>
                    <span className="font-medium">{series.videos.length}</span>
                  </div>
                </div>

                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={() => startSeries(series.id)}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    התחל אימון
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                    פרטים
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Series */}
        {playerProgress?.completedSeries && playerProgress.completedSeries.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">סדרות שהושלמו</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playerProgress.completedSeries.map((seriesId) => {
                const series = availableSeries.find(s => s.id === seriesId)
                if (!series) return null
                
                return (
                  <div key={seriesId} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{series.title}</h3>
                      <span className="text-green-600 text-sm">✓ הושלם</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{series.description}</p>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{series.videos.length} תרגילים</span>
                      <span>{series.estimatedDuration} דקות</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Pending Submissions */}
        {pendingSubmissions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">סרטונים ממתינים לאישור</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                יש לך {pendingSubmissions.length} סרטונים הממתינים לבדיקה של המנהל
              </p>
            </div>
          </div>
        )}

        {/* Player Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">הסטטיסטיקות שלי</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{playerProgress?.completedSeries.length || 0}</div>
              <div className="text-sm text-gray-500">סדרות הושלמו</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{playerProgress?.completedVideos.length || 0}</div>
              <div className="text-sm text-gray-500">תרגילים הושלמו</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{playerProgress?.totalPoints || 0}</div>
              <div className="text-sm text-gray-500">נקודות</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">#{playerProgress?.rank || 0}</div>
              <div className="text-sm text-gray-500">דירוג</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
