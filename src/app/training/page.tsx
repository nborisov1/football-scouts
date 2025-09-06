'use client'

/**
 * Training Page - Player Training Dashboard
 * Shows personalized training program and progress
 */

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import TrainingDashboard from '@/components/player/TrainingDashboard'
import VideoSubmission from '@/components/player/VideoSubmission'
import { USER_TYPES } from '@/lib/firebase'
import { PlayerVideoSubmission } from '@/types/video'

export default function TrainingPage() {
  const { user } = useAuth()
  const [showVideoSubmission, setShowVideoSubmission] = useState(false)
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
          <TrainingDashboard />
        )}
      </div>
    </ProtectedRoute>
  )
}