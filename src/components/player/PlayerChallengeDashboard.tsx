'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'
import ChallengeSubmission from './ChallengeSubmission'
import { 
  Challenge, 
  ChallengeSubmission as ChallengeSubmissionType,
  PlayerChallengeProgress,
  AGE_GROUP_LABELS,
  POSITION_LABELS,
  CHALLENGE_CATEGORY_LABELS,
  CHALLENGE_DIFFICULTY_LABELS,
  RATING_LABELS
} from '@/types/challenge'
import { challengeService } from '@/lib/challengeService'

interface PlayerChallengeDashboardProps {
  // Props will be added as we integrate with backend
}

export default function PlayerChallengeDashboard({}: PlayerChallengeDashboardProps) {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [playerProgress, setPlayerProgress] = useState<PlayerChallengeProgress[]>([])
  const [submissions, setSubmissions] = useState<ChallengeSubmissionType[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'available' | 'in_progress' | 'completed' | 'monthly'>('available')
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)

  // Load challenges from Firebase
  useEffect(() => {
    if (user?.type === 'player') {
      loadChallenges()
    }
  }, [user])

  const loadChallenges = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // For now, we'll use a default age group and position
      // In a real app, these would come from the user's profile
      const playerAgeGroup = 'u12' // TODO: Get from user profile
      const playerPosition = 'all' // TODO: Get from user profile
      
      const challengesData = await challengeService.getChallengesForPlayer(
        playerAgeGroup as any,
        playerPosition as any
      )
      
      setChallenges(challengesData)
      
      // Load player submissions and progress
      const submissionsData = await challengeService.getPlayerSubmissions(user.uid)
      setSubmissions(submissionsData)
      
    } catch (error) {
      console.error('Error loading challenges:', error)
      showMessage('שגיאה בטעינת האתגרים', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getChallengesForTab = (): Challenge[] => {
    switch (activeTab) {
      case 'available':
        return challenges.filter(challenge => 
          challenge.status === 'available' && 
          !challenge.isMonthlyChallenge
        )
      case 'in_progress':
        return challenges.filter(challenge => 
          playerProgress.some(progress => 
            progress.challengeId === challenge.id && 
            progress.status === 'in_progress'
          )
        )
      case 'completed':
        return challenges.filter(challenge => 
          playerProgress.some(progress => 
            progress.challengeId === challenge.id && 
            progress.status === 'completed'
          )
        )
      case 'monthly':
        return challenges.filter(challenge => challenge.isMonthlyChallenge)
      default:
        return []
    }
  }

  const handleStartChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
    setShowSubmissionModal(true)
  }

  const handleSubmissionComplete = async (submission: ChallengeSubmissionType) => {
    try {
      // Save submission to Firebase
      const savedSubmission = await challengeService.submitChallenge(submission)
      
      // Update local state
      setSubmissions(prev => [savedSubmission, ...prev])
      setShowSubmissionModal(false)
      setSelectedChallenge(null)
    } catch (error) {
      console.error('Error submitting challenge:', error)
      showMessage('שגיאה בשליחת האתגר', 'error')
    }
  }

  const getProgressForChallenge = (challengeId: string): PlayerChallengeProgress | undefined => {
    return playerProgress.find(progress => progress.challengeId === challengeId)
  }

  const getSubmissionForChallenge = (challengeId: string): ChallengeSubmissionType | undefined => {
    return submissions.find(submission => submission.challengeId === challengeId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען אתגרים...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">אתגרים</h1>
              <p className="text-gray-600 mt-1">התקדם דרך אתגרים מותאמים אישית</p>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-500">נקודות</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-500">הושלמו</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8 space-x-reverse">
            {[
              { key: 'available', label: 'זמינים', icon: 'fas fa-unlock' },
              { key: 'in_progress', label: 'בתהליך', icon: 'fas fa-play' },
              { key: 'completed', label: 'הושלמו', icon: 'fas fa-check' },
              { key: 'monthly', label: 'חודשיים', icon: 'fas fa-calendar' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <i className={`${tab.icon} ml-2`}></i>
                {tab.label}
                {getChallengesForTab().length > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {getChallengesForTab().length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {getChallengesForTab().length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-trophy text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {activeTab === 'available' ? 'אין אתגרים זמינים' :
               activeTab === 'in_progress' ? 'אין אתגרים בתהליך' :
               activeTab === 'completed' ? 'אין אתגרים שהושלמו' :
               'אין אתגרים חודשיים'}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'available' ? 'השלם אתגרים קודמים כדי לפתוח אתגרים חדשים' :
               activeTab === 'in_progress' ? 'התחל אתגר חדש כדי לראות אותו כאן' :
               activeTab === 'completed' ? 'התחל אתגרים כדי לראות את ההתקדמות שלך' :
               'אתגרים חודשיים יופיעו כאן'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getChallengesForTab().map((challenge) => {
              const progress = getProgressForChallenge(challenge.id)
              const submission = getSubmissionForChallenge(challenge.id)
              
              return (
                <div key={challenge.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{challenge.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{challenge.description}</p>
                    </div>
                    {challenge.isMonthlyChallenge && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                        חודשי
                      </span>
                    )}
                  </div>

                  {/* Challenge Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">רמה:</span>
                      <span className="font-medium">{challenge.level}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">קטגוריה:</span>
                      <span className="font-medium">{CHALLENGE_CATEGORY_LABELS[challenge.category]}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">ניסיונות:</span>
                      <span className="font-medium">
                        {progress ? `${progress.attempts}/${challenge.attempts}` : `0/${challenge.attempts}`}
                      </span>
                    </div>
                  </div>

                  {/* Metrics Preview */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">מדדים:</h4>
                    <div className="space-y-1">
                      {challenge.metrics.slice(0, 2).map((metric) => (
                        <div key={metric.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">{metric.name}:</span>
                          <span className="text-gray-500">{metric.unit}</span>
                        </div>
                      ))}
                      {challenge.metrics.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{challenge.metrics.length - 2} מדדים נוספים
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress/Status */}
                  {progress && (
                    <div className="mb-4">
                      {progress.status === 'completed' && submission && (
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-green-800">הושלם</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              submission.overallRating === 'outstanding' ? 'bg-green-100 text-green-800' :
                              submission.overallRating === 'excellent' ? 'bg-blue-100 text-blue-800' :
                              submission.overallRating === 'good' ? 'bg-yellow-100 text-yellow-800' :
                              submission.overallRating === 'fair' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {RATING_LABELS[submission.overallRating]}
                            </span>
                          </div>
                          <div className="text-sm text-green-700 mt-1">
                            ציון: {submission.totalScore.toFixed(0)}/100
                          </div>
                        </div>
                      )}
                      
                      {progress.status === 'in_progress' && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-800">בתהליך</span>
                            <span className="text-sm text-blue-600">
                              {progress.attempts}/{challenge.attempts} ניסיונות
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex space-x-2 space-x-reverse">
                    {progress?.status === 'completed' ? (
                      <button
                        onClick={() => handleStartChallenge(challenge)}
                        className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        disabled
                      >
                        הושלם
                      </button>
                    ) : progress?.attempts >= challenge.attempts ? (
                      <button
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                        disabled
                      >
                        ניסיונות אזלו
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartChallenge(challenge)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        {progress?.status === 'in_progress' ? 'המשך' : 'התחל'}
                      </button>
                    )}
                    
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                      <i className="fas fa-info-circle"></i>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Challenge Submission Modal */}
      {showSubmissionModal && selectedChallenge && (
        <ChallengeSubmission
          challenge={selectedChallenge}
          onSubmissionComplete={handleSubmissionComplete}
          onCancel={() => {
            setShowSubmissionModal(false)
            setSelectedChallenge(null)
          }}
        />
      )}
    </div>
  )
}
