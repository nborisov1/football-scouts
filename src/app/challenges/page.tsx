'use client'

/**
 * Challenges Page - Advanced challenge progression system
 * Comprehensive challenge management with real-time data
 */

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useChallenges } from '@/hooks/useChallenges'
import { 
  CHALLENGE_TYPE_LABELS, 
  CHALLENGE_DIFFICULTY_LABELS, 
  CHALLENGE_CATEGORY_LABELS,
  CHALLENGE_STATUS_LABELS 
} from '@/types/challenge'

export default function ChallengesPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'available' | 'in_progress' | 'completed' | 'series'>('available')
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [submissionData, setSubmissionData] = useState({ videoUrl: '', description: '' })

  const {
    challenges,
    availableChallenges,
    lockedChallenges,
    playerProgress,
    playerStats,
    challengeSeries,
    availableSeries,
    loading,
    error,
    filters,
    setFilters,
    startChallenge,
    submitChallenge,
    completeChallenge,
    failChallenge,
    getProgressSummary
  } = useChallenges(user || undefined)

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">טוען אתגרים...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">שגיאה בטעינת האתגרים</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              נסה שוב
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const progressSummary = getProgressSummary()

  const getChallengesForTab = () => {
    switch (activeTab) {
      case 'available':
        return availableChallenges
      case 'in_progress':
        return challenges.filter(challenge => {
          const progress = playerProgress.find(p => p.challengeId === challenge.id)
          return progress && progress.status === 'in_progress'
        })
      case 'completed':
        return challenges.filter(challenge => {
          const progress = playerProgress.find(p => p.challengeId === challenge.id)
          return progress && progress.status === 'completed'
        })
      case 'series':
        return availableSeries
      default:
        return []
    }
  }

  const handleStartChallenge = async (challengeId: string) => {
    try {
      await startChallenge(challengeId)
      showMessage('האתגר התחיל בהצלחה!', 'success')
    } catch (err) {
      showMessage('שגיאה בהתחלת האתגר', 'error')
    }
  }

  const handleSubmitChallenge = async () => {
    if (!selectedChallenge) return
    
    if (!submissionData.videoUrl.trim()) {
      showMessage('אנא הכנס קישור לסרטון', 'error')
      return
    }

    try {
      await submitChallenge(selectedChallenge.id, submissionData.videoUrl, submissionData.description)
      showMessage('האתגר נשלח לבדיקה!', 'success')
      setShowSubmissionModal(false)
      setSubmissionData({ videoUrl: '', description: '' })
    } catch (err) {
      showMessage('שגיאה בשליחת האתגר', 'error')
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <section className="bg-indigo-600 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">אתגרים</h1>
            <p className="text-xl text-indigo-100 mb-8">
              התקדם דרך אתגרים מותאמים אישית ופתח את הפוטנציאל שלך
            </p>

            {/* Progress Overview */}
            {playerStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="text-2xl font-bold">{playerStats.completedChallenges}</div>
                  <div className="text-indigo-100">אתגרים הושלמו</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="text-2xl font-bold">{playerStats.currentLevel}</div>
                  <div className="text-indigo-100">רמה נוכחית</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="text-2xl font-bold">{playerStats.totalPoints}</div>
                  <div className="text-indigo-100">נקודות כולל</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="text-2xl font-bold">{playerStats.streak}</div>
                  <div className="text-indigo-100">רצף נוכחי</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="bg-white border-b">
          <div className="container mx-auto px-4">
            <nav className="flex space-x-8 space-x-reverse">
              <button
                onClick={() => setActiveTab('available')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'available'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-unlock ml-2"></i>
                זמינים ({availableChallenges.length})
              </button>
              <button
                onClick={() => setActiveTab('in_progress')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'in_progress'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-play ml-2"></i>
                בתהליך ({playerProgress.filter(p => p.status === 'in_progress').length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'completed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-check ml-2"></i>
                הושלמו ({playerProgress.filter(p => p.status === 'completed').length})
              </button>
              <button
                onClick={() => setActiveTab('series')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'series'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className="fas fa-trophy ml-2"></i>
                סדרות ({availableSeries.length})
              </button>
            </nav>
          </div>
        </section>

        {/* Filters */}
        <section className="bg-white border-b py-4">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as any || undefined })}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="">כל הסוגים</option>
                {Object.entries(CHALLENGE_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>

              <select
                value={filters.category || ''}
                onChange={(e) => setFilters({ ...filters, category: e.target.value as any || undefined })}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="">כל הקטגוריות</option>
                {Object.entries(CHALLENGE_CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>

              <select
                value={filters.difficulty || ''}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value as any || undefined })}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="">כל הרמות</option>
                {Object.entries(CHALLENGE_DIFFICULTY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>

              <select
                value={filters.level || ''}
                onChange={(e) => setFilters({ ...filters, level: e.target.value ? parseInt(e.target.value) : undefined })}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="">כל הרמות</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                  <option key={level} value={level}>רמה {level}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {activeTab === 'series' ? (
              /* Challenge Series */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableSeries.map((series) => (
                  <div key={series.id} className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{series.title}</h3>
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                        {series.challenges.length} אתגרים
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{series.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {series.rewards.seriesPoints} נקודות
                      </div>
                      <button
                        onClick={() => showMessage('פונקציונליות סדרות תגיע בקרוב', 'info')}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                      >
                        התחל סדרה
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Individual Challenges */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getChallengesForTab().map((challenge) => {
                  const progress = playerProgress.find(p => p.challengeId === challenge.id)
                  const status = progress?.status || 'available'

                  return (
                    <div key={challenge.id} className="bg-white rounded-lg shadow-sm border p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                        <div className="flex space-x-2 space-x-reverse">
                          {'difficulty' in challenge && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                              {CHALLENGE_DIFFICULTY_LABELS[challenge.difficulty]}
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {CHALLENGE_STATUS_LABELS[status]}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{challenge.description}</p>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        {'type' in challenge && (
                          <div>
                            <span className="font-medium text-gray-700">סוג:</span>
                            <span className="mr-2">{CHALLENGE_TYPE_LABELS[challenge.type]}</span>
                          </div>
                        )}
                        {'category' in challenge && (
                          <div>
                            <span className="font-medium text-gray-700">קטגוריה:</span>
                            <span className="mr-2">{CHALLENGE_CATEGORY_LABELS[challenge.category]}</span>
                          </div>
                        )}
                        {'level' in challenge && (
                          <div>
                            <span className="font-medium text-gray-700">רמה:</span>
                            <span className="mr-2">{challenge.level}</span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-700">נקודות:</span>
                          <span className="mr-2">
                            {'points' in challenge.rewards ? challenge.rewards.points : challenge.rewards.seriesPoints}
                          </span>
                        </div>
                      </div>

                      {progress && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-600">
                            <div>ניסיונות: {progress.attempts}</div>
                            {progress.bestScore && (
                              <div>ציון הטוב ביותר: {progress.bestScore}</div>
                            )}
                            {progress.currentScore && (
                              <div>ציון נוכחי: {progress.currentScore}</div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2 space-x-reverse">
                        {status === 'available' && (
                          <button
                            onClick={() => handleStartChallenge(challenge.id)}
                            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                          >
                            התחל אתגר
                          </button>
                        )}
                        
                        {status === 'in_progress' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedChallenge(challenge)
                                setShowSubmissionModal(true)
                              }}
                              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              שלח סרטון
                            </button>
                            <button
                              onClick={() => failChallenge(challenge.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              נכשל
                            </button>
                          </>
                        )}

                        {status === 'completed' && (
                          <div className="flex-1 text-center text-green-600 font-medium">
                            <i className="fas fa-check-circle ml-1"></i>
                            הושלם בהצלחה
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setSelectedChallenge(challenge)
                            setShowModal(true)
                          }}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                          פרטים
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {getChallengesForTab().length === 0 && (
              <div className="text-center py-12">
                <i className="fas fa-trophy text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {activeTab === 'available' ? 'אין אתגרים זמינים' :
                   activeTab === 'in_progress' ? 'אין אתגרים בתהליך' :
                   activeTab === 'completed' ? 'אין אתגרים שהושלמו' :
                   'אין סדרות זמינות'}
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'available' ? 'השלם אתגרים קודמים כדי לפתוח אתגרים חדשים' :
                   activeTab === 'in_progress' ? 'התחל אתגר חדש כדי לראות אותו כאן' :
                   activeTab === 'completed' ? 'התחל אתגרים כדי לראות את ההתקדמות שלך' :
                   'השלם דרישות כדי לפתוח סדרות אתגרים'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Challenge Details Modal */}
        {showModal && selectedChallenge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">תיאור</h4>
                    <p className="text-gray-600">{selectedChallenge.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">פרטים</h4>
                      <div className="space-y-2 text-sm">
                        {'type' in selectedChallenge && (
                          <div>
                            <span className="font-medium">סוג:</span>
                            <span className="mr-2">{CHALLENGE_TYPE_LABELS[selectedChallenge.type as keyof typeof CHALLENGE_TYPE_LABELS]}</span>
                          </div>
                        )}
                        {'category' in selectedChallenge && (
                          <div>
                            <span className="font-medium">קטגוריה:</span>
                            <span className="mr-2">{CHALLENGE_CATEGORY_LABELS[selectedChallenge.category as keyof typeof CHALLENGE_CATEGORY_LABELS]}</span>
                          </div>
                        )}
                        {'difficulty' in selectedChallenge && (
                          <div>
                            <span className="font-medium">רמת קושי:</span>
                            <span className="mr-2">{CHALLENGE_DIFFICULTY_LABELS[selectedChallenge.difficulty as keyof typeof CHALLENGE_DIFFICULTY_LABELS]}</span>
                          </div>
                        )}
                        {'level' in selectedChallenge && (
                          <div>
                            <span className="font-medium">רמה:</span>
                            <span className="mr-2">{selectedChallenge.level}</span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">נקודות:</span>
                          <span className="mr-2">
                            {'points' in selectedChallenge.rewards ? selectedChallenge.rewards.points : selectedChallenge.rewards.seriesPoints}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">דרישות</h4>
                      <div className="space-y-2 text-sm">
                        {selectedChallenge.requirements.minAge && (
                          <div>גיל מינימלי: {selectedChallenge.requirements.minAge}</div>
                        )}
                        {selectedChallenge.requirements.maxAge && (
                          <div>גיל מקסימלי: {selectedChallenge.requirements.maxAge}</div>
                        )}
                        {selectedChallenge.requirements.positions && (
                          <div>עמדות: {selectedChallenge.requirements.positions.join(', ')}</div>
                        )}
                        {selectedChallenge.requirements.minPoints && (
                          <div>נקודות מינימליות: {selectedChallenge.requirements.minPoints}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedChallenge.timeLimit && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">זמן מוגבל</h4>
                      <p className="text-gray-600">{selectedChallenge.timeLimit} דקות</p>
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

        {/* Submission Modal */}
        {showSubmissionModal && selectedChallenge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    שלח סרטון לאתגר: {selectedChallenge.title}
                  </h3>
                  <button
                    onClick={() => setShowSubmissionModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      קישור לסרטון
                    </label>
                    <input
                      type="url"
                      value={submissionData.videoUrl}
                      onChange={(e) => setSubmissionData({ ...submissionData, videoUrl: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      תיאור (אופציונלי)
                    </label>
                    <textarea
                      value={submissionData.description}
                      onChange={(e) => setSubmissionData({ ...submissionData, description: e.target.value })}
                      placeholder="תאר את הביצוע שלך..."
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    שלח
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