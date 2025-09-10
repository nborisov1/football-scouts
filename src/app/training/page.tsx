'use client'

/**
 * Training Page - Player Training Dashboard
 * Shows personalized training program and progress
 */

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import ComingSoon from '@/components/ComingSoon'
import TrainingDashboard from '@/components/player/TrainingDashboard'
import LevelDashboard from '@/components/player/LevelDashboard'
import VideoSubmission from '@/components/player/VideoSubmission'
import { USER_TYPES } from '@/lib/firebase'
import { PlayerVideoSubmission } from '@/types/video'
import { Challenge } from '@/types/challenge'

export default function TrainingPage() {
  const { user } = useAuth()
  const [showVideoSubmission, setShowVideoSubmission] = useState(false)
  const [hasTrainingContent, setHasTrainingContent] = useState(true) // Will be updated based on actual data
  const [currentTab, setCurrentTab] = useState<'level' | 'training'>('level')
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [currentVideoSubmission, setCurrentVideoSubmission] = useState<{
    videoId: string
    seriesId: string
    videoTitle: string
    instructions: string
  } | null>(null)

  const handleStartVideoSubmission = (videoId: string, seriesId: string, videoTitle: string, instructions: string) => {
    setCurrentVideoSubmission({
      videoId,
      seriesId,
      videoTitle,
      instructions
    })
    setShowVideoSubmission(true)
  }

  const handleSubmissionComplete = (submission: PlayerVideoSubmission) => {
    setShowVideoSubmission(false)
    setCurrentVideoSubmission(null)
    // Here you would typically save the submission to Firestore
    console.log('Video submission completed:', submission)
  }

  const handleCancelSubmission = () => {
    setShowVideoSubmission(false)
    setCurrentVideoSubmission(null)
  }

  const handleChallengeSelect = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
    // Could navigate to challenge detail page or open challenge modal
    console.log('Selected challenge:', challenge)
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

  // Show Coming Soon page if no training content is available
  if (!hasTrainingContent) {
    return (
      <ProtectedRoute>
        <ComingSoon
          title="תוכנית אימונים בקרוב"
          description="אנחנו עובדים על תוכנית אימונים מתקדמת ומותאמת אישית שתעזור לכם לשפר את הכישורים שלכם. התוכנית תכלול תרגילים מותאמים לפי המיקום, הגיל והרמה שלכם, עם מעקב התקדמות מפורט."
          icon="fas fa-dumbbell"
          features={[
            "תוכנית אימונים מותאמת אישית לפי המיקום שלכם",
            "תרגילים מותאמים לגיל ולרמת הכישורים",
            "מעקב התקדמות מפורט עם סטטיסטיקות",
            "תרגילים אינטראקטיביים עם משוב מיידי",
            "תוכנית שבועית וחודשית מותאמת",
            "תרגילי כושר וטכניקה משולבים",
            "מערכת ניקוד ותגמולים",
            "שיתוף הישגים עם המאמן והחברים"
          ]}
          expectedDate="פברואר 2024"
        />
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {showVideoSubmission && currentVideoSubmission ? (
          <VideoSubmission
            videoId={currentVideoSubmission.videoId}
            seriesId={currentVideoSubmission.seriesId}
            videoTitle={currentVideoSubmission.videoTitle}
            instructions={currentVideoSubmission.instructions}
            onSubmissionComplete={handleSubmissionComplete}
            onCancel={handleCancelSubmission}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">אימונים ומבחנים</h1>
              <p className="text-gray-600 mt-2">התקדם ברמות, השלם אתגרים וצמח כשחקן</p>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 space-x-reverse">
                  <button
                    onClick={() => setCurrentTab('level')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      currentTab === 'level'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    התקדמות ברמות
                  </button>
                  <button
                    onClick={() => setCurrentTab('training')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      currentTab === 'training'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    אימונים מותאמים
                  </button>
                </nav>
              </div>
            </div>

            {/* Content */}
            {currentTab === 'level' ? (
              <LevelDashboard onChallengeSelect={handleChallengeSelect} />
            ) : (
              <TrainingDashboard onContentAvailabilityChange={setHasTrainingContent} />
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}