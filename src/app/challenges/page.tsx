'use client'

/**
 * Challenges Page - Advanced challenge progression system
 * Comprehensive challenge management with real-time data
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'
import ProtectedRoute from '@/components/ProtectedRoute'
import ComingSoon from '@/components/ComingSoon'
import PlayerChallengesDashboard from '@/components/player/PlayerChallengesDashboard'
import { challengeService, ChallengeFilters } from '@/lib/challengeService'
import { 
  Challenge,
  AgeGroup,
  Position,
  CHALLENGE_TYPE_LABELS, 
  CHALLENGE_DIFFICULTY_LABELS, 
  CHALLENGE_CATEGORY_LABELS,
  CHALLENGE_STATUS_LABELS,
  AGE_GROUP_LABELS,
  POSITION_LABELS
} from '@/types/challenge'

export default function ChallengesPage() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ChallengeFilters>({})
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Load challenges from Firebase
  useEffect(() => {
    loadChallenges()
  }, [filters])

  const loadChallenges = async () => {
    try {
      setLoading(true)
      setError(null)
      const challengesData = await challengeService.getChallenges(filters)
      setChallenges(challengesData)
    } catch (err) {
      console.error('Error loading challenges:', err)
      setError('שגיאה בטעינת האתגרים')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-text-muted">טוען אתגרים...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-6xl text-error-500 mb-4"></i>
            <h2 className="text-2xl font-bold text-text-primary mb-4">שגיאה בטעינת האתגרים</h2>
            <p className="text-text-muted mb-4">{error}</p>
            <button
              onClick={loadChallenges}
              className="btn-page-primary"
            >
              נסה שוב
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Show player-specific dashboard for players
  if (user?.type === 'player') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          {/* Header Section */}
          <section className="bg-field-gradient text-white py-12">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl font-bold mb-4">האתגרים שלי</h1>
              <p className="text-xl text-primary-100">
                אתגרים מותאמים אישית עבורך - התקדם, שפר את הכישורים שלך וזכה בנקודות!
              </p>
            </div>
          </section>

          {/* Player Dashboard */}
          <section className="py-8">
            <div className="container mx-auto px-4">
              <PlayerChallengesDashboard />
            </div>
          </section>
        </div>
      </ProtectedRoute>
    )
  }

  // Show Coming Soon page if no challenges exist for admins/scouts
  if (challenges.length === 0) {
    return (
      <ProtectedRoute>
        <ComingSoon
          title="אתגרים בקרוב"
          description="אנחנו עובדים על מערכת אתגרים מתקדמת שתאפשר לכם להתחרות, להתקדם ולשפר את הכישורים שלכם. המערכת תכלול אתגרים מותאמים אישית, מערכת ניקוד, ותחרויות עם שחקנים אחרים."
          icon="fas fa-trophy"
          features={[
            "אתגרים מותאמים אישית לפי רמת הכישורים",
            "מערכת ניקוד מתקדמת עם ליגות ורמות",
            "תחרויות שבועיות וחודשיות",
            "אתגרים קבוצתיים עם חברים",
            "מעקב התקדמות מפורט",
            "פרסים וציונים מיוחדים",
            "אתגרים אינטראקטיביים עם AI",
            "שיתוף הישגים ברשתות חברתיות"
          ]}
          expectedDate="ינואר 2024"
        />
      </ProtectedRoute>
    )
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-info-100 text-info-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'locked': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header Section */}
        <section className="bg-field-gradient text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">אתגרים</h1>
            <p className="text-xl text-primary-100 mb-8">
              גלה את כל האתגרים הזמינים וסנן אותם לפי הצרכים שלך
            </p>

            {/* Challenge Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold">{challenges.length}</div>
                <div className="text-primary-100">אתגרים זמינים</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {challenges.filter(c => c.isMonthlyChallenge).length}
                </div>
                <div className="text-primary-100">אתגרים חודשיים</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {new Set(challenges.map(c => c.ageGroup)).size}
                </div>
                <div className="text-primary-100">קבוצות גיל</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {new Set(challenges.map(c => c.category)).size}
                </div>
                <div className="text-primary-100">קטגוריות</div>
              </div>
            </div>
          </div>
        </section>


        {/* Filters */}
        <section className="bg-white border-b py-6">
          <div className="container mx-auto px-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">סינון אתגרים</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">קבוצת גיל</label>
                <select
                  value={filters.ageGroup || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    ageGroup: e.target.value as AgeGroup || undefined 
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">כל הגילאים</option>
                  {Object.entries(AGE_GROUP_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">עמדה</label>
                <select
                  value={filters.position || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    position: e.target.value as Position || undefined 
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">כל העמדות</option>
                  {Object.entries(POSITION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    category: e.target.value || undefined 
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  value={filters.difficulty || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    difficulty: e.target.value || undefined 
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  value={filters.isMonthlyChallenge === undefined ? '' : filters.isMonthlyChallenge.toString()}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    isMonthlyChallenge: e.target.value === '' ? undefined : e.target.value === 'true'
                  })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                נקה סינון
              </button>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                אתגרים זמינים ({challenges.length})
              </h2>
            </div>

            {/* Challenges Grid */}
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
                          <span key={position} className="px-2 py-1 bg-info-100 text-info-800 text-xs rounded-full">
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
                        setShowModal(true)
                      }}
                      className="flex-1 btn-page-primary btn-sm"
                    >
                      <i className="fas fa-eye ml-1"></i>
                      צפה בפרטים
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {challenges.length === 0 && (
              <div className="text-center py-12">
                <i className="fas fa-trophy text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  אין אתגרים זמינים
                </h3>
                <p className="text-gray-500">
                  נסה לשנות את הסינון או צור אתגרים חדשים
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Challenge Details Modal */}
        {showModal && selectedChallenge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedChallenge.title}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

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
                          <span key={position} className="px-3 py-1 bg-info-100 text-info-800 text-sm rounded-full">
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
                          className="text-primary-700 hover:text-primary-800 font-medium"
                        >
                          <i className="fas fa-play ml-1"></i>
                          צפה בסרטון הדגמה
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end space-x-3 space-x-reverse">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    סגור
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