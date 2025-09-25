'use client'

import React, { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'
import { 
  Challenge, 
  ChallengeSubmission as ChallengeSubmissionType,
  ChallengeMetric,
  RATING_LABELS
} from '@/types/challenge'
import { ChallengeScoringService } from '@/lib/challengeScoringService'

interface ChallengeSubmissionProps {
  challenge: Challenge
  onSubmissionComplete: (submission: ChallengeSubmissionType) => void
  onCancel: () => void
}

export default function ChallengeSubmission({ 
  challenge, 
  onSubmissionComplete, 
  onCancel 
}: ChallengeSubmissionProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<'video' | 'metrics' | 'review'>('video')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [metrics, setMetrics] = useState<{[key: string]: number}>({})
  const [description, setDescription] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleVideoUpload = async (file: File) => {
    setUploading(true)
    try {
      // TODO: Implement actual video upload to Firebase Storage
      // For now, simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      const mockUrl = `https://example.com/videos/${file.name}`
      setVideoUrl(mockUrl)
      setCurrentStep('metrics')
      showMessage('הסרטון הועלה בהצלחה!', 'success')
    } catch (error) {
      console.error('Error uploading video:', error)
      showMessage('שגיאה בהעלאת הסרטון', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        showMessage('הקובץ גדול מדי. מקסימום 100MB', 'error')
        return
      }
      setVideoFile(file)
      handleVideoUpload(file)
    }
  }

  const handleMetricChange = (metricId: string, value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      setMetrics(prev => ({
        ...prev,
        [metricId]: numValue
      }))
    }
  }

  const calculateScore = (metricId: string, value: number): { rating: string; points: number } => {
    const metric = challenge.metrics.find(m => m.id === metricId)
    const threshold = challenge.thresholds.find(t => t.metricId === metricId)
    
    if (!metric || !threshold) {
      return { rating: 'poor', points: 0 }
    }

    const { thresholds } = threshold
    
    if (value >= thresholds.outstanding) {
      return { rating: 'outstanding', points: 100 }
    } else if (value >= thresholds.excellent) {
      return { rating: 'excellent', points: 80 }
    } else if (value >= thresholds.good) {
      return { rating: 'good', points: 60 }
    } else if (value >= thresholds.fair) {
      return { rating: 'fair', points: 40 }
    } else {
      return { rating: 'poor', points: 20 }
    }
  }

  const handleSubmit = async () => {
    if (!videoUrl) {
      showMessage('אנא העלה סרטון', 'error')
      return
    }

    if (!user) {
      showMessage('אינך מחובר למערכת', 'error')
      return
    }

    // Validate metrics
    const validation = ChallengeScoringService.validateMetrics(challenge, metrics)
    if (!validation.isValid) {
      showMessage(validation.errors.join(', '), 'error')
      return
    }

    try {
      // Create submission using the scoring service
      const submission = ChallengeScoringService.createSubmission(
        user.uid,
        challenge,
        videoUrl,
        description,
        metrics
      )

      showMessage('האתגר נשלח בהצלחה!', 'success')
      onSubmissionComplete(submission)
    } catch (error) {
      console.error('Error submitting challenge:', error)
      showMessage('שגיאה בשליחת האתגר', 'error')
    }
  }

  const renderVideoStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">העלה סרטון</h3>
        <p className="text-gray-600">העלה סרטון של עצמך מבצע את האתגר</p>
      </div>

      {challenge.videoUrl && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">סרטון הדגמה</h4>
          <video 
            src={challenge.videoUrl} 
            controls 
            className="w-full max-w-md mx-auto rounded-lg"
            crossOrigin="anonymous"
          >
            הדפדפן שלך לא תומך בסרטונים
          </video>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">הוראות האתגר</h4>
        <div className="prose prose-sm text-gray-700">
          {challenge.instructions.split('\n').map((line, index) => (
            <p key={index} className="mb-2">{line}</p>
          ))}
        </div>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {uploading ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">מעלה סרטון...</p>
          </div>
        ) : videoFile ? (
          <div className="space-y-4">
            <i className="fas fa-check-circle text-4xl text-green-500"></i>
            <div>
              <p className="font-medium text-gray-900">{videoFile.name}</p>
              <p className="text-sm text-gray-500">
                {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              החלף סרטון
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <i className="fas fa-video text-4xl text-gray-400"></i>
            <div>
              <p className="text-lg font-medium text-gray-900">העלה סרטון</p>
              <p className="text-sm text-gray-500">לחץ לבחירת קובץ או גרור לכאן</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              בחר קובץ
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const renderMetricsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">מדדים</h3>
        <p className="text-gray-600">מלא את המדדים הרלוונטיים לביצוע שלך</p>
      </div>

      <div className="space-y-4">
        {challenge.metrics.map((metric) => (
          <div key={metric.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium text-gray-900">
                {metric.name}
                {metric.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <span className="text-sm text-gray-500">{metric.unit}</span>
            </div>
            
            {metric.description && (
              <p className="text-sm text-gray-600 mb-3">{metric.description}</p>
            )}

            <input
              type="number"
              step="0.01"
              value={metrics[metric.id] || ''}
              onChange={(e) => handleMetricChange(metric.id, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`הכנס ${metric.name.toLowerCase()}`}
            />

            {metrics[metric.id] && (
              <div className="mt-2 text-sm">
                <span className="text-gray-600">ציון משוער: </span>
                <span className="font-medium text-blue-600">
                  {RATING_LABELS[calculateScore(metric.id, metrics[metric.id]).rating]}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          הערות נוספות (אופציונלי)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="הוסף הערות על הביצוע שלך..."
        />
      </div>
    </div>
  )

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">סקירה</h3>
        <p className="text-gray-600">בדוק את הפרטים לפני השליחה</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">פרטי האתגר</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">אתגר:</span>
            <span className="font-medium">{challenge.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">סרטון:</span>
            <span className="font-medium">{videoFile?.name}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">מדדים</h4>
        <div className="space-y-3">
          {challenge.metrics.map((metric) => {
            const value = metrics[metric.id]
            const score = value ? calculateScore(metric.id, value) : null
            
            return (
              <div key={metric.id} className="flex items-center justify-between">
                <span className="text-gray-600">{metric.name}:</span>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="font-medium">{value} {metric.unit}</span>
                  {score && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      score.rating === 'outstanding' ? 'bg-green-100 text-green-800' :
                      score.rating === 'excellent' ? 'bg-blue-100 text-blue-800' :
                      score.rating === 'good' ? 'bg-yellow-100 text-yellow-800' :
                      score.rating === 'fair' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {RATING_LABELS[score.rating]}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {description && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-2">הערות</h4>
          <p className="text-gray-700">{description}</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{challenge.title}</h2>
              <p className="text-blue-100 mt-1">שלח את הביצוע שלך</p>
            </div>
            <button
              onClick={onCancel}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-center space-x-8 space-x-reverse">
            {[
              { key: 'video', label: 'העלאת סרטון', icon: 'fas fa-video' },
              { key: 'metrics', label: 'מדדים', icon: 'fas fa-chart-line' },
              { key: 'review', label: 'סקירה', icon: 'fas fa-check' }
            ].map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep === step.key ? 'bg-blue-600 text-white' :
                  ['video', 'metrics', 'review'].indexOf(currentStep) > index ? 'bg-green-600 text-white' :
                  'bg-gray-300 text-gray-600'
                }`}>
                  <i className={`${step.icon} text-sm`}></i>
                </div>
                <span className={`mr-3 text-sm font-medium ${
                  currentStep === step.key ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
                {index < 2 && (
                  <div className={`w-8 h-0.5 ${
                    ['video', 'metrics', 'review'].indexOf(currentStep) > index ? 'bg-green-600' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {currentStep === 'video' && renderVideoStep()}
          {currentStep === 'metrics' && renderMetricsStep()}
          {currentStep === 'review' && renderReviewStep()}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ביטול
          </button>
          
          <div className="flex space-x-3 space-x-reverse">
            {currentStep === 'metrics' && (
              <button
                onClick={() => setCurrentStep('video')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                חזור
              </button>
            )}
            
            {currentStep === 'review' && (
              <button
                onClick={() => setCurrentStep('metrics')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                חזור
              </button>
            )}
            
            {currentStep === 'video' && videoUrl && (
              <button
                onClick={() => setCurrentStep('metrics')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                המשך
              </button>
            )}
            
            {currentStep === 'metrics' && (
              <button
                onClick={() => setCurrentStep('review')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                המשך
              </button>
            )}
            
            {currentStep === 'review' && (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                שלח אתגר
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
