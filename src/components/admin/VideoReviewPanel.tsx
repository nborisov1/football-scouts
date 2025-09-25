'use client'

/**
 * Video Review Panel for Admin
 * Allows admins to review and approve/reject player video submissions
 */

import React, { useState } from 'react'
import { showMessage } from '../MessageContainer'
import { PlayerVideoSubmission, VideoMetadata } from '@/types/video'

interface VideoReviewPanelProps {
  submissions: PlayerVideoSubmission[]
  onReviewComplete: (submissionId: string, status: 'approved' | 'rejected' | 'needs-improvement', feedback: string, score: number) => void
}

export default function VideoReviewPanel({ submissions, onReviewComplete }: VideoReviewPanelProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<PlayerVideoSubmission | null>(null)
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected' | 'needs-improvement'>('approved')
  const [feedback, setFeedback] = useState('')
  const [score, setScore] = useState(5)

  const pendingSubmissions = submissions.filter(s => s.status === 'pending')
  const reviewedSubmissions = submissions.filter(s => s.status !== 'pending')

  const handleReview = () => {
    if (!selectedSubmission) return

    if (reviewStatus === 'needs-improvement' && !feedback.trim()) {
      showMessage('נא לכתוב משוב לשיפור', 'error')
      return
    }

    onReviewComplete(selectedSubmission.id, reviewStatus, feedback, score)
    
    // Reset form
    setSelectedSubmission(null)
    setFeedback('')
    setScore(5)
    setReviewStatus('approved')
    
    showMessage('הביקורת נשמרה בהצלחה', 'success')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'אושר'
      case 'rejected': return 'נדחה'
      case 'needs-improvement': return 'דורש שיפור'
      case 'pending': return 'ממתין'
      default: return status
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">ביקורת סרטוני שחקנים</h2>
        <p className="text-gray-600 mt-1">בדוק ואישר סרטונים שהועלו על ידי שחקנים</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Submissions List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            סרטונים ממתינים ({pendingSubmissions.length})
          </h3>
          
          {pendingSubmissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-check-circle text-4xl mb-4 text-green-500"></i>
              <p>אין סרטונים ממתינים לביקורת</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pendingSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  onClick={() => setSelectedSubmission(submission)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedSubmission?.id === submission.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">סרטון תרגיל #{submission.id.slice(-6)}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(submission.submittedAt).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>שחקן: {submission.playerId}</p>
                    <p>סדרה: {submission.seriesId}</p>
                    <p>ניסיונות: {submission.resubmissionCount + 1}/{submission.maxResubmissions}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reviewed Submissions */}
          {reviewedSubmissions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                סרטונים שנבדקו ({reviewedSubmissions.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {reviewedSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">#{submission.id.slice(-6)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(submission.status)}`}>
                        {getStatusLabel(submission.status)}
                      </span>
                    </div>
                    {submission.adminScore && (
                      <div className="text-xs text-gray-500 mt-1">
                        ציון: {submission.adminScore}/10
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Review Panel */}
        <div>
          {selectedSubmission ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ביקורת סרטון</h3>
              
              {/* Video Player */}
              <div className="mb-4">
                <video
                  src={selectedSubmission.videoUrl}
                  controls
                  className="w-full h-48 bg-gray-100 rounded-lg object-cover"
                  crossOrigin="anonymous"
                />
              </div>

              {/* Review Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    החלטה
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="approved"
                        checked={reviewStatus === 'approved'}
                        onChange={(e) => setReviewStatus(e.target.value as any)}
                        className="ml-2"
                      />
                      <span className="text-green-600">✓ אושר</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="needs-improvement"
                        checked={reviewStatus === 'needs-improvement'}
                        onChange={(e) => setReviewStatus(e.target.value as any)}
                        className="ml-2"
                      />
                      <span className="text-yellow-600">⚠ דורש שיפור</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="rejected"
                        checked={reviewStatus === 'rejected'}
                        onChange={(e) => setReviewStatus(e.target.value as any)}
                        className="ml-2"
                      />
                      <span className="text-red-600">✗ נדחה</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ציון (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={score}
                    onChange={(e) => setScore(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    משוב לשחקן
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="כתוב משוב מפורט לשחקן..."
                  />
                </div>

                <div className="flex space-x-3 space-x-reverse">
                  <button
                    onClick={handleReview}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    שמור ביקורת
                  </button>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    ביטול
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-video text-4xl mb-4"></i>
              <p>בחר סרטון לביקורת</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
