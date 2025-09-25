'use client'

import React, { useState } from 'react'
import { PersonalizedChallenge, ChallengeSubmission } from '@/types/challenge'
import { PersonalizedChallengeService } from '@/lib/personalizedChallengeService'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'
import VideoUpload from '@/components/VideoUpload'
import Button from '@/components/ui/Button'

interface PersonalizedChallengeCardProps {
  challenge: PersonalizedChallenge
  onSubmissionComplete?: (submission: ChallengeSubmission) => void
  className?: string
}

type ChallengeStep = 'overview' | 'demo' | 'recording' | 'metrics' | 'submitting' | 'completed'

interface ChallengeMetrics {
  completionTime: number
  [key: string]: number
}

export default function PersonalizedChallengeCard({
  challenge,
  onSubmissionComplete,
  className = ''
}: PersonalizedChallengeCardProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<ChallengeStep>('overview')
  const [recordedVideo, setRecordedVideo] = useState<File | null>(null)
  const [metrics, setMetrics] = useState<ChallengeMetrics>({ completionTime: 0 })
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleStartChallenge = () => {
    setStartTime(new Date())
    setCurrentStep('demo')
  }

  const handleWatchDemo = () => {
    setCurrentStep('recording')
  }

  const handleSkipDemo = () => {
    setCurrentStep('recording')
  }

  const handleVideoUpload = (videoFile: File) => {
    setRecordedVideo(videoFile)
    const endTime = new Date()
    const completionTime = startTime ? Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)) : 0
    setMetrics(prev => ({ ...prev, completionTime }))
    setCurrentStep('metrics')
  }

  const handleMetricsSubmit = async () => {
    if (!user || !recordedVideo) {
      showMessage('חסרים נתונים לשליחה', 'error')
      return
    }

    setSubmitting(true)
    setCurrentStep('submitting')

    try {
      const submission = await PersonalizedChallengeService.submitChallenge(
        user.uid,
        challenge.id,
        recordedVideo,
        metrics,
        metrics.completionTime,
        notes
      )

      setCurrentStep('completed')
      showMessage('האתגר נשלח בהצלחה! מחכה לבדיקה', 'success')
      onSubmissionComplete?.(submission)

    } catch (error) {
      console.error('Error submitting challenge:', error)
      showMessage('שגיאה בשליחת האתגר', 'error')
      setCurrentStep('metrics')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} דקות`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours} שעות ${remainingMinutes > 0 ? `ו-${remainingMinutes} דקות` : ''}`
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Challenge Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-trophy text-blue-600 text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{challenge.title}</h2>
        <p className="text-gray-600 mb-4">{challenge.description}</p>
        
        {challenge.personalizedReason && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <i className="fas fa-lightbulb text-blue-500 ml-2"></i>
              <span className="text-blue-800 font-medium">למה זה מתאים לך:</span>
            </div>
            <p className="text-blue-700 mt-1">{challenge.personalizedReason}</p>
          </div>
        )}
      </div>

      {/* Challenge Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <i className="fas fa-clock text-gray-500 ml-2"></i>
            <span className="font-medium text-gray-700">זמן משוער</span>
          </div>
          <p className="text-gray-900">{formatDuration(challenge.estimatedCompletion)}</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <i className="fas fa-star text-gray-500 ml-2"></i>
            <span className="font-medium text-gray-700">קושי</span>
          </div>
          <div className="flex items-center">
            {[...Array(10)].map((_, i) => (
              <i 
                key={i} 
                className={`fas fa-circle text-xs ${i < challenge.difficulty ? 'text-yellow-400' : 'text-gray-300'} ml-1`}
              />
            ))}
            <span className="text-gray-600 mr-2">({challenge.difficulty}/10)</span>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <i className="fas fa-coins text-gray-500 ml-2"></i>
            <span className="font-medium text-gray-700">נקודות</span>
          </div>
          <p className="text-gray-900">{challenge.points} נקודות</p>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <i className="fas fa-tools text-gray-500 ml-2"></i>
            <span className="font-medium text-gray-700">ציוד נדרש</span>
          </div>
          <p className="text-gray-900">
            {challenge.equipment.length > 0 ? challenge.equipment.join(', ') : 'ללא ציוד מיוחד'}
          </p>
        </div>
      </div>

      {/* Instructions */}
      {challenge.instructions && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">
            <i className="fas fa-info-circle ml-2"></i>
            הוראות האתגר
          </h3>
          <p className="text-yellow-700">{challenge.instructions}</p>
        </div>
      )}

      {/* Goals */}
      {challenge.goals.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-800 mb-2">
            <i className="fas fa-target ml-2"></i>
            מטרות האתגר
          </h3>
          <ul className="list-disc list-inside text-green-700 space-y-1">
            {challenge.goals.map((goal, index) => (
              <li key={index}>{goal}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Start Button */}
      <div className="text-center">
        <Button
          onClick={handleStartChallenge}
          className="px-8 py-3"
          size="lg"
        >
          <i className="fas fa-play ml-2"></i>
          התחל את האתגר
        </Button>
      </div>
    </div>
  )

  const renderDemo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">צפה בהדגמה</h2>
        <p className="text-gray-600 mb-6">
          לפני שתתחיל, צפה בסרטון ההדגמה כדי להבין איך לבצע את האתגר נכון
        </p>
      </div>

      {challenge.videoUrl && (
        <div className="bg-black rounded-lg overflow-hidden">
          <video
            src={challenge.videoUrl}
            controls
            className="w-full h-64 object-cover"
            crossOrigin="anonymous"
          >
            לא ניתן להציג את הסרטון
          </video>
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <Button
          onClick={handleWatchDemo}
          variant="secondary"
        >
          צפה שוב בהדגמה
        </Button>
        <Button
          onClick={handleSkipDemo}
        >
          <i className="fas fa-forward ml-2"></i>
          המשך לצילום
        </Button>
      </div>
    </div>
  )

  const renderRecording = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">הקלט את הביצוע שלך</h2>
        <p className="text-gray-600 mb-6">
          הקלט סרטון של הביצוע שלך לאתגר. וודא שהביצוע ברור ונראה במלואו
        </p>
      </div>

      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          accept="video/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              handleVideoUpload(file)
            }
          }}
          className="hidden"
          id="challenge-video-upload"
        />
        <label htmlFor="challenge-video-upload" className="cursor-pointer">
          <div className="text-4xl text-gray-400 mb-4">
            <i className="fas fa-video"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            הקלט את הביצוע שלך
          </h3>
          <p className="text-gray-600 mb-4">
            לחץ כאן לבחירת קובץ וידאו או גרור קובץ לכאן
          </p>
          <Button type="button">
            <i className="fas fa-upload ml-2"></i>
            בחר קובץ וידאו
          </Button>
        </label>
      </div>
    </div>
  )

  const renderMetrics = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">הוסף פרטים על הביצוע</h2>
        <p className="text-gray-600 mb-6">
          ספר לנו על הביצוע שלך - כמה זמן לקח ואיך הרגשת
        </p>
      </div>

      <div className="space-y-4">
        {/* Completion Time */}
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            זמן ביצוע (דקות)
          </label>
          <input
            type="number"
            value={metrics.completionTime}
            onChange={(e) => setMetrics(prev => ({ ...prev, completionTime: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="180"
          />
        </div>

        {/* Additional Metrics */}
        {challenge.metrics.map((metric) => (
          <div key={metric.id} className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {metric.name} {metric.unit && `(${metric.unit})`}
              {metric.required && <span className="text-red-500"> *</span>}
            </label>
            <input
              type="number"
              value={metrics[metric.id] || ''}
              onChange={(e) => setMetrics(prev => ({ 
                ...prev, 
                [metric.id]: parseFloat(e.target.value) || 0 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={metric.description}
              required={metric.required}
            />
          </div>
        ))}

        {/* Notes */}
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            הערות נוספות (אופציונלי)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="איך הרגשת? מה היה קשה? מה למדת?"
          />
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => setCurrentStep('recording')}
          variant="secondary"
        >
          חזור לצילום
        </Button>
        <Button
          onClick={handleMetricsSubmit}
          disabled={metrics.completionTime === 0}
        >
          <i className="fas fa-paper-plane ml-2"></i>
          שלח את האתגר
        </Button>
      </div>
    </div>
  )

  const renderSubmitting = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <i className="fas fa-spinner fa-spin text-blue-600 text-2xl"></i>
      </div>
      <h2 className="text-2xl font-bold text-gray-900">שולח את האתגר...</h2>
      <p className="text-gray-600">אנא המתן, האתגר שלך נשלח למערכת</p>
    </div>
  )

  const renderCompleted = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <i className="fas fa-check text-green-600 text-2xl"></i>
      </div>
      <h2 className="text-2xl font-bold text-gray-900">כל הכבוד!</h2>
      <p className="text-gray-600">
        האתגר נשלח בהצלחה ומחכה לבדיקה. תקבל משוב בקרוב!
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          <strong>זכית ב-{challenge.points} נקודות!</strong><br/>
          המשך להתאמן כדי לשפר את הכישורים שלך
        </p>
      </div>
    </div>
  )

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      {currentStep === 'overview' && renderOverview()}
      {currentStep === 'demo' && renderDemo()}
      {currentStep === 'recording' && renderRecording()}
      {currentStep === 'metrics' && renderMetrics()}
      {currentStep === 'submitting' && renderSubmitting()}
      {currentStep === 'completed' && renderCompleted()}
    </div>
  )
}
