'use client'

/**
 * Player Challenges Dashboard - Personalized challenge interface for players
 * Shows only relevant challenges based on player's age and position
 * Allows video submission with measurements
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'
import { challengeService } from '@/lib/challengeService'
import { 
  Challenge,
  AgeGroup,
  Position,
  ChallengeSubmission,
  CHALLENGE_DIFFICULTY_LABELS, 
  CHALLENGE_CATEGORY_LABELS,
  AGE_GROUP_LABELS,
  POSITION_LABELS
} from '@/types/challenge'

interface PlayerChallengesDashboardProps {
  onSubmissionComplete?: () => void
}

export default function PlayerChallengesDashboard({ onSubmissionComplete }: PlayerChallengesDashboardProps) {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Submission form state
  const [submissionVideo, setSubmissionVideo] = useState<File | null>(null)
  const [metricValues, setMetricValues] = useState<Record<string, number>>({})
  const [submissionNotes, setSubmissionNotes] = useState('')

  // Get player's age group and position from user data
  const getPlayerAgeGroup = (): AgeGroup => {
    if (!user?.age) return 'u12' // Default fallback
    
    const age = user.age
    if (age < 8) return 'u8'
    if (age < 10) return 'u10'
    if (age < 12) return 'u12'
    if (age < 14) return 'u14'
    if (age < 16) return 'u16'
    if (age < 18) return 'u18'
    if (age < 21) return 'u21'
    return 'adult'
  }

  const getPlayerPosition = (): Position => {
    return (user?.position as Position) || 'all'
  }

  // Load challenges relevant to the player
  useEffect(() => {
    loadPlayerChallenges()
  }, [user])

  const loadPlayerChallenges = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      
      const playerAgeGroup = getPlayerAgeGroup()
      const playerPosition = getPlayerPosition()
      
      console.log('Loading challenges for player:', {
        age: user.age,
        ageGroup: playerAgeGroup,
        position: playerPosition
      })

      // Get challenges for the player's age group and position
      const challengesData = await challengeService.getChallengesForPlayer(
        playerAgeGroup,
        playerPosition
      )
      
      setChallenges(challengesData)
    } catch (err) {
      console.error('Error loading player challenges:', err)
      setError('שגיאה בטעינת האתגרים')
    } finally {
      setLoading(false)
    }
  }

  const handleStartChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
    setShowSubmissionModal(true)
    setMetricValues({})
    setSubmissionNotes('')
    setSubmissionVideo(null)
  }

  const handleVideoSelect = (file: File) => {
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
    
    setSubmissionVideo(file)
    // showMessage('סרטון נבחר בהצלחה!', 'success')
  }

  const handleMetricChange = (metricId: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setMetricValues(prev => ({
      ...prev,
      [metricId]: numValue
    }))
  }

  const handleSubmitChallenge = async () => {
    if (!selectedChallenge || !user) return

    // Validate required fields
    if (!submissionVideo) {
      showMessage('אנא בחר סרטון של האתגר', 'error')
      return
    }

    // Validate required metrics
    const requiredMetrics = selectedChallenge.metrics?.filter(m => m.required) || []
    for (const metric of requiredMetrics) {
      if (!metricValues[metric.id] || metricValues[metric.id] <= 0) {
        showMessage(`אנא הכנס ערך עבור ${metric.name}`, 'error')
        return
      }
    }

    try {
      setSubmitting(true)
      
      // Create submission data
      const submissionData: Omit<ChallengeSubmission, 'id' | 'submittedAt' | 'videoUrl' | 'status'> = {
        challengeId: selectedChallenge.id,
        playerId: user.uid,
        playerName: user.name || user.email || 'שחקן',
        metricValues,
        notes: submissionNotes,
        score: 0, // Will be calculated
        rating: 'pending' as const,
        reviewedAt: null,
        reviewerId: null,
        reviewerNotes: null
      }

      // Submit the challenge (this will handle video upload and scoring)
      await challengeService.submitChallenge(submissionData, submissionVideo)
      
      // showMessage('האתגר נשלח בהצלחה!', 'success')
      setShowSubmissionModal(false)
      setSelectedChallenge(null)
      setSubmissionVideo(null)
      setMetricValues({})
      setSubmissionNotes('')
      
      // Reload challenges to show updated status
      loadPlayerChallenges()
      
      if (onSubmissionComplete) {
        onSubmissionComplete()
      }
    } catch (error) {
      console.error('Error submitting challenge:', error)
      showMessage('שגיאה בשליחת האתגר', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-orange-100 text-orange-800'
      case 'expert': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען אתגרים...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">שגיאה בטעינת האתגרים</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadPlayerChallenges}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          נסה שוב
        </button>
      </div>
    )
  }

  if (challenges.length === 0) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-trophy text-6xl text-gray-300 mb-4"></i>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          אין אתגרים זמינים עבורך
        </h3>
        <p className="text-gray-500">
          לא נמצאו אתגרים המתאימים לגיל שלך ({AGE_GROUP_LABELS[getPlayerAgeGroup()]}) ועמדה שלך ({POSITION_LABELS[getPlayerPosition()]})
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Player Info Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">האתגרים שלך</h2>
        <p className="text-indigo-100">
          אתגרים מותאמים אישית עבור {user?.name || 'שחקן'} - 
          גיל {user?.age || 'לא מוגדר'} ({AGE_GROUP_LABELS[getPlayerAgeGroup()]}) | 
          עמדה: {POSITION_LABELS[getPlayerPosition()]}
        </p>
        <div className="mt-4 text-sm text-indigo-100">
          {challenges.length} אתגרים זמינים עבורך
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                {CHALLENGE_DIFFICULTY_LABELS[challenge.difficulty]}
              </span>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-3">{challenge.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
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
              <div>
                <span className="font-medium text-gray-700">ניסיונות:</span>
                <span className="mr-2">{challenge.attempts}</span>
              </div>
            </div>

            {challenge.isMonthlyChallenge && (
              <div className="mb-4">
                <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  <i className="fas fa-calendar-alt ml-1"></i>
                  אתגר חודשי
                </span>
              </div>
            )}

            {challenge.thumbnailUrl && (
              <div className="mb-4">
                <img 
                  src={challenge.thumbnailUrl} 
                  alt={challenge.title}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}

            <button
              onClick={() => handleStartChallenge(challenge)}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <i className="fas fa-play ml-1"></i>
              התחל אתגר
            </button>
          </div>
        ))}
      </div>

      {/* Challenge Submission Modal */}
      {showSubmissionModal && selectedChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedChallenge.title}
                </h3>
                <button
                  onClick={() => setShowSubmissionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <div className="space-y-6">
                {/* Challenge Instructions */}
                {selectedChallenge.instructions && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">הוראות האתגר</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700">{selectedChallenge.instructions}</pre>
                    </div>
                  </div>
                )}

                {/* Demo Video */}
                {selectedChallenge.videoUrl && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">סרטון הדגמה</h4>
                    <div className="bg-gray-100 p-4 rounded-lg text-center">
                      <a 
                        href={selectedChallenge.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        <i className="fas fa-play ml-1"></i>
                        צפה בסרטון הדגמה
                      </a>
                    </div>
                  </div>
                )}

                {/* Video Upload */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">העלאת סרטון האתגר</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleVideoSelect(file)
                          e.target.value = ''
                        }
                      }}
                      className="hidden"
                      id="challenge-video-upload"
                    />
                    <label htmlFor="challenge-video-upload" className="cursor-pointer">
                      {submissionVideo ? (
                        <div>
                          <i className="fas fa-video text-2xl text-green-500 mb-2"></i>
                          <p className="text-sm text-green-600">סרטון נבחר: {submissionVideo.name}</p>
                        </div>
                      ) : (
                        <div>
                          <i className="fas fa-video text-2xl text-gray-400 mb-2"></i>
                          <p className="text-sm text-gray-600">לחץ לבחירת סרטון האתגר</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Metrics Input */}
                {selectedChallenge.metrics && selectedChallenge.metrics.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">מדדים נמדדים</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedChallenge.metrics.map((metric) => (
                        <div key={metric.id} className="bg-gray-50 p-4 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {metric.name}
                            {metric.required && <span className="text-red-500 mr-1">*</span>}
                          </label>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={metricValues[metric.id] || ''}
                              onChange={(e) => handleMetricChange(metric.id, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder={`הכנס ${metric.name.toLowerCase()}`}
                            />
                            <span className="text-sm text-gray-500">{metric.unit}</span>
                          </div>
                          {metric.description && (
                            <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    הערות נוספות (אופציונלי)
                  </label>
                  <textarea
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="שתף הערות על הביצוע שלך..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3 space-x-reverse">
                <button
                  onClick={() => setShowSubmissionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={handleSubmitChallenge}
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block ml-2"></div>
                      שולח...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane ml-1"></i>
                      שלח אתגר
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
