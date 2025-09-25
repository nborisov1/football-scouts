'use client'

/**
 * Individual Exercise Page - Better UX Flow
 * Shows exercise explanation → video upload → metrics input all on one page
 */

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AssessmentService from '@/lib/assessmentService'
import type { AssessmentChallenge } from '@/types/level'
import { showMessage } from '@/components/MessageContainer'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Loading } from '@/components/ui/Loading'
import { VideoPlayer } from '@/components/ui/VideoPlayer'

type ExerciseStep = 'explanation' | 'video-upload' | 'metrics-input' | 'completed'

// Helper function to get single metric for exercise type
function getMetricInfo(exerciseType: string): {key: string, label: string, placeholder: string} {
  const metricMap: Record<string, {key: string, label: string, placeholder: string}> = {
    'defending': { key: 'count', label: 'הגנות מוצלחות', placeholder: 'כמה הגנות הצלחת?' },
    'attacking': { key: 'count', label: 'בעיטות למטרה', placeholder: 'כמה בעיטות עשית?' },
    'passing': { key: 'count', label: 'מסירות מוצלחות', placeholder: 'כמה מסירות הצלחת?' },
    'dribbling': { key: 'count', label: 'כדרורים מוצלחים', placeholder: 'כמה כדרורים עשית?' },
    'fitness': { key: 'count', label: 'קפיצות', placeholder: 'כמה קפיצות עשית?' }
  }
  
  return metricMap[exerciseType] || { key: 'count', label: 'חזרות', placeholder: 'כמה חזרות עשית?' }
}

export default function ExercisePage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const exerciseId = params.id as string
  
  const [exercise, setExercise] = useState<AssessmentChallenge | null>(null)
  const [currentStep, setCurrentStep] = useState<ExerciseStep>('explanation')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [metrics, setMetrics] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadExercise()
  }, [exerciseId])

  const loadExercise = async () => {
    try {
      setLoading(true)
      const exercise = await AssessmentService.getAssessmentExerciseById(exerciseId)
      
      if (!exercise) {
        showMessage('תרגיל לא נמצא', 'error')
        router.push('/assessment')
        return
      }
      
      setExercise(exercise)
      setMetrics({ count: 0 })
      
    } catch (error) {
      console.error('Error loading exercise:', error)
      showMessage('שגיאה בטעינת התרגיל', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      showMessage('יש לבחור קובץ וידאו', 'error')
      return
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      showMessage('הקובץ גדול מדי. מקסימום 100MB', 'error')
      return
    }

    setSelectedFile(file)
    setCurrentStep('metrics-input')
  }

  const handleMetricChange = (metricId: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setMetrics(prev => ({
      ...prev,
      [metricId]: numValue
    }))
  }

  const handleSubmit = async () => {
    if (!user || !exercise || !selectedFile) return

    setSubmitting(true)
    setUploadProgress(0)

    try {
      setUploadProgress(30)
      
      // Submit exercise assessment
      await AssessmentService.submitAssessmentChallenge(
        user.uid,
        exercise.id,
        selectedFile,
        metrics.count || 0, // The count they achieved
        selectedFile.size / 1000000, // rough duration estimation
        'Assessment submission'
      )
      
      setUploadProgress(100)
      showMessage('התרגיל הושלם בהצלחה!', 'success')
      setCurrentStep('completed')
      
      // Redirect back to exercise selection (challenges step) after 2 seconds
      setTimeout(() => {
        router.push('/assessment?step=challenges')
      }, 2000)
      
    } catch (error) {
      console.error('Error submitting exercise:', error)
      showMessage('שגיאה בשליחת התרגיל', 'error')
    } finally {
      setSubmitting(false)
      setUploadProgress(0)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Loading text="טוען תרגיל..." />
        </div>
      </ProtectedRoute>
    )
  }

  if (!exercise) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="p-6 text-center max-w-md">
            <div className="text-red-500 text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">תרגיל לא נמצא</h2>
            <p className="text-gray-600 mb-4">התרגיל המבוקש לא קיים במערכת</p>
            <Button onClick={() => router.push('/assessment')}>
              חזור להערכה
            </Button>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{exercise.title}</h1>
                <p className="text-gray-600">{exercise.description}</p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => router.push('/assessment')}
              >
                חזור להערכה
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-6">
            
            {/* Step 1: Exercise Explanation */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h2 className="text-xl font-bold text-gray-900">הוראות התרגיל</h2>
              </div>
              
              {/* Demo Video */}
              {exercise.demonstrationVideoUrl && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">🎬 סרטון הדגמה</h3>
                  <VideoPlayer 
                    src={exercise.demonstrationVideoUrl}
                    title="סרטון הדגמה"
                  />
                </div>
              )}
              
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="text-sm text-blue-800 whitespace-pre-line">
                  {exercise.instructions}
                </div>
              </div>

              {/* Equipment & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-bold text-green-900 mb-2">⏱️ משך זמן:</h4>
                  <p className="text-green-800">{exercise.duration} שניות</p>
                </div>
                
                {exercise.equipment && exercise.equipment.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-bold text-yellow-900 mb-2">🏃‍♂️ ציוד נדרש:</h4>
                    <p className="text-yellow-800">{exercise.equipment.join(', ')}</p>
                  </div>
                )}
              </div>

              {/* Metrics Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">📊 מה נמדוד:</h4>
                <div className="flex items-center space-x-2 space-x-reverse text-sm">
                  <span className="text-blue-600">✓</span>
                  <span className="text-gray-800">
                    <strong>{getMetricInfo(exercise.category).label}</strong>
                  </span>
                </div>
              </div>

              {currentStep === 'explanation' && (
                <div className="mt-6">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    onClick={() => setCurrentStep('video-upload')}
                    className="w-full"
                  >
                    הבנתי - עבור לצילום סרטון
                  </Button>
                </div>
              )}
            </Card>

            {/* Step 2: Video Upload */}
            {currentStep !== 'explanation' && (
              <Card className="p-6">
                <div className="flex items-center space-x-3 space-x-reverse mb-4">
                  <div className={`flex-shrink-0 w-8 h-8 ${currentStep === 'video-upload' ? 'bg-blue-600' : 'bg-green-600'} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                    2
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">העלאת סרטון</h2>
                  {selectedFile && (
                    <span className="text-green-600 text-sm">✅ סרטון נבחר</span>
                  )}
                </div>

                {!selectedFile ? (
                  <div>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="text-4xl mb-4">📹</div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        בחר קובץ וידאו
                      </h4>
                      <p className="text-sm text-gray-500 mb-4">
                        צלם את עצמך מבצע את התרגיל והעלה כאן
                      </p>
                      <Button variant="outline" size="lg">
                        בחר קובץ
                      </Button>
                      <p className="text-xs text-gray-400 mt-3">
                        MP4, MOV, AVI עד 100MB
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="flex-shrink-0 text-2xl">🎬</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-green-900 truncate">
                          {selectedFile.name}
                        </h4>
                        <p className="text-sm text-green-700">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null)
                          setCurrentStep('video-upload')
                        }}
                      >
                        החלף
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Step 3: Metrics Input */}
            {currentStep === 'metrics-input' && (
              <Card className="p-6">
                <div className="flex items-center space-x-3 space-x-reverse mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">הזנת תוצאות</h2>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getMetricInfo(exercise.category).label}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={metrics.count || ''}
                    onChange={(e) => handleMetricChange('count', e.target.value)}
                    placeholder={getMetricInfo(exercise.category).placeholder}
                    className="w-full text-lg p-4"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    ספר כמה פעמים הצלחת לבצע את התרגיל
                  </p>
                </div>

                {/* Submit Progress */}
                {submitting && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>שולח תרגיל...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setCurrentStep('video-upload')}
                    disabled={submitting}
                    className="sm:w-auto"
                  >
                    חזור לסרטון
                  </Button>
                  
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? 'שולח...' : 'סיים תרגיל'}
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 4: Completion */}
            {currentStep === 'completed' && (
              <Card className="p-6 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-green-900 mb-2">
                  כל הכבוד!
                </h2>
                <p className="text-green-700 mb-4">
                  התרגיל הושלם בהצלחה והתוצאות נשמרו במערכת
                </p>
                <div className="text-sm text-gray-500">
                  מעביר אותך חזרא להערכה...
                </div>
              </Card>
            )}

          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
