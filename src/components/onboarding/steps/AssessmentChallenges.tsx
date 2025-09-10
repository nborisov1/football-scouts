'use client'

import React, { useState } from 'react'
import { Challenge } from '@/types/challenge'
import { AssessmentService } from '@/lib/assessmentService'
import { LevelAssessmentService } from '@/lib/levelAssessmentService'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import AssessmentVideoUpload from '../AssessmentVideoUpload'
import AssessmentMetricsInput from '../AssessmentMetricsInput'

interface AssessmentChallengesProps {
  challenges: Challenge[]
  onComplete: (assessmentData: any) => void
  onBack: () => void
  loading: boolean
  error: string | null
}

type ChallengeStep = 'overview' | 'video' | 'metrics' | 'complete'

interface ChallengeProgress {
  challengeId: string
  videoFile?: File
  metrics?: Record<string, number>
  completed: boolean
}

export default function AssessmentChallenges({ 
  challenges, 
  onComplete, 
  onBack, 
  loading, 
  error 
}: AssessmentChallengesProps) {
  const { user } = useAuth()
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0)
  const [currentStep, setCurrentStep] = useState<ChallengeStep>('overview')
  const [progress, setProgress] = useState<Record<string, ChallengeProgress>>({})
  const [submitting, setSubmitting] = useState(false)

  const currentChallenge = challenges[currentChallengeIndex]
  const isLastChallenge = currentChallengeIndex === challenges.length - 1
  const completedChallenges = Object.values(progress).filter(p => p.completed).length

  const handleVideoUpload = (videoFile: File) => {
    const challengeId = currentChallenge.id
    setProgress(prev => ({
      ...prev,
      [challengeId]: {
        ...prev[challengeId],
        challengeId,
        videoFile,
        completed: false
      }
    }))
    setCurrentStep('metrics')
  }

  const handleMetricsComplete = async (metrics: Record<string, number>) => {
    if (!user) return
    
    const challengeId = currentChallenge.id
    const challengeProgress = progress[challengeId]
    
    if (!challengeProgress?.videoFile) {
      showMessage('שגיאה: לא נמצא סרטון', 'error')
      return
    }

    setSubmitting(true)
    
    try {
      // Create submission using AssessmentService
      const submission = await AssessmentService.submitAssessmentChallenge(
        user.uid,
        challengeId,
        challengeProgress.videoFile,
        metrics,
        `Assessment submission for ${currentChallenge.title}`
      )

      // Update progress
      setProgress(prev => ({
        ...prev,
        [challengeId]: {
          ...prev[challengeId],
          metrics,
          completed: true
        }
      }))

      showMessage('התוצאות נשמרו בהצלחה!', 'success')
      
      if (isLastChallenge) {
        // All challenges completed - calculate level
        await handleAssessmentComplete()
      } else {
        // Move to next challenge
        setCurrentChallengeIndex(prev => prev + 1)
        setCurrentStep('overview')
      }
      
    } catch (error) {
      console.error('Error submitting challenge:', error)
      showMessage('שגיאה בשמירת התוצאות', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAssessmentComplete = async () => {
    if (!user) return

    try {
      // Get all assessment submissions
      const submissions = await AssessmentService.getPlayerAssessmentSubmissions(user.uid)
      
      // Convert to assessment scores
      const assessmentScores = await AssessmentService.convertSubmissionsToScores(submissions)
      
      // Calculate level
      const assignedLevel = LevelAssessmentService.calculateStartingLevel(assessmentScores)
      const assessmentResult = LevelAssessmentService.generateLevelAssessmentResult(assessmentScores)
      
      // Save results
      await LevelAssessmentService.saveAssessmentResult(user.uid, assessmentResult, assessmentScores)
      
      // Pass to parent
      onComplete({
        assignedLevel,
        assessmentResult,
        assessmentScores
      })
      
    } catch (error) {
      console.error('Error completing assessment:', error)
      showMessage('שגיאה בחישוב תוצאות המבחן', 'error')
    }
  }

  const handleChallengeStart = () => {
    setCurrentStep('video')
  }

  const handleBackToVideo = () => {
    setCurrentStep('video')
  }

  const handleNextChallenge = () => {
    if (currentChallengeIndex < challenges.length - 1) {
      setCurrentChallengeIndex(prev => prev + 1)
      setCurrentStep('overview')
    }
  }

  const handlePreviousChallenge = () => {
    if (currentChallengeIndex > 0) {
      setCurrentChallengeIndex(prev => prev - 1)
      setCurrentStep('overview')
    }
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <div className="text-red-500 text-xl mb-4">❌</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">שגיאה בטעינת האתגרים</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button variant="outline" onClick={onBack}>
          חזור
        </Button>
      </Card>
    )
  }

  if (!currentChallenge) {
    return (
      <Card className="p-6 text-center">
        <div className="text-gray-400 text-xl mb-4">⏳</div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">טוען אתגרים...</h3>
      </Card>
    )
  }

  // Show specific step
  if (currentStep === 'video') {
    return (
      <AssessmentVideoUpload
        challenge={currentChallenge}
        onUploadComplete={handleVideoUpload}
        onCancel={() => setCurrentStep('overview')}
      />
    )
  }

  if (currentStep === 'metrics') {
    const videoFile = progress[currentChallenge.id]?.videoFile
    if (!videoFile) {
      setCurrentStep('video')
      return null
    }

    return (
      <AssessmentMetricsInput
        challenge={currentChallenge}
        videoUrl={videoFile.name} // Just show filename for now
        onComplete={handleMetricsComplete}
        onBack={handleBackToVideo}
      />
    )
  }

  // Overview step
  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            אתגר {currentChallengeIndex + 1} מתוך {challenges.length}
          </h3>
          <div className="text-sm text-gray-500">
            {completedChallenges} הושלמו
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedChallenges / challenges.length) * 100}%` }}
          />
        </div>
      </Card>

      {/* Current Challenge */}
      <Card className="p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">⚽</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {currentChallenge.title}
          </h3>
          <p className="text-gray-600 text-lg">
            {currentChallenge.description}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="font-bold text-blue-900 mb-3">הוראות ביצוע:</h4>
          <div className="space-y-2 text-sm text-blue-800">
            {currentChallenge.instructions.split('\n').map((instruction, index) => (
              <div key={index} className="flex items-start">
                <span className="mr-2">{index + 1}.</span>
                <span>{instruction}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 mb-3">מה נמדוד:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentChallenge.metrics.map((metric) => (
              <div key={metric.id} className="flex items-center space-x-2 space-x-reverse">
                <span className="text-primary-600">📊</span>
                <span className="text-sm text-gray-700">
                  {metric.name} ({metric.unit})
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={submitting}
          >
            חזור
          </Button>
          
          {currentChallengeIndex > 0 && (
            <Button
              variant="outline"
              onClick={handlePreviousChallenge}
              disabled={submitting}
            >
              אתגר קודם
            </Button>
          )}
        </div>

        <div className="flex gap-3 sm:mr-auto">
          {progress[currentChallenge.id]?.completed ? (
            <div className="flex items-center space-x-2 space-x-reverse text-green-600">
              <span>✅</span>
              <span className="font-medium">הושלם</span>
            </div>
          ) : null}

          {!isLastChallenge && progress[currentChallenge.id]?.completed && (
            <Button
              variant="outline"
              onClick={handleNextChallenge}
              disabled={submitting}
            >
              אתגר הבא
            </Button>
          )}

          <Button
            variant="primary"
            onClick={handleChallengeStart}
            disabled={submitting}
          >
            {progress[currentChallenge.id]?.completed ? 'בצע שוב' : 'התחל אתגר'}
          </Button>
        </div>
      </div>
    </div>
  )
}
