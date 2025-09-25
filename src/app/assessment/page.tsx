'use client'

/**
 * Level Assessment Page - Determines user's starting level
 * Uses real Firebase videos and assessment challenges
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import AssessmentService from '@/lib/assessmentService'
import type { AssessmentChallenge } from '@/types/level'
import { showMessage } from '@/components/MessageContainer'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

// Types and Interfaces
interface ChallengeWithStatus extends AssessmentChallenge {
  isCompleted?: boolean
}

type AssessmentStep = 'introduction' | 'challenges' | 'level-assignment'

interface AssessmentResult {
  assignedLevel: number
  assessmentResult: { assignedLevel: number; averageScore: number }
  assessmentScores: Array<{ challengeId: string; score: number }>
}

export default function AssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('introduction')
  const [exercises, setExercises] = useState<ChallengeWithStatus[]>([])
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAssessmentData = useCallback(async () => {error
    try {
      setLoading(true)
      setError(null)
      
      // Load exercises and completed status
      const [assessmentExercises, completedIds] = await Promise.all([
        AssessmentService.getAssessmentExercises(),
        user ? AssessmentService.getCompletedExercises(user.uid) : Promise.resolve([])
      ])
      
      if (assessmentExercises.length === 0) {
        setError('לא נמצאו תרגילי הערכה. אנא נסה שוב מאוחר יותר.')
        return
      }
      
      // Mark exercises as completed
      const exercisesWithStatus = assessmentExercises.map(exercise => ({
        ...exercise,
        isCompleted: completedIds.includes(exercise.id)
      }))
      
      setExercises(exercisesWithStatus)
    } catch (error) {
      console.error('❌ Error loading assessment challenges:', error)
      setError('שגיאה בטעינת אתגרי ההערכה')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadAssessmentData()
    }
  }, [user, loadAssessmentData])
  
  // Force refresh when returning from completed exercise
  useEffect(() => {
    const refresh = searchParams.get('refresh')
    if (refresh && user) {
      loadAssessmentData()
      router.replace('/assessment', { scroll: false })
    }
  }, [searchParams, user, loadAssessmentData, router])

  // Check if assessment should be completed
  useEffect(() => {
    const checkAssessmentCompletion = async () => {
      if (!user || exercises.length === 0) return
      
      const completedCount = exercises.filter(ex => ex.isCompleted).length
      const totalExercises = exercises.length
      
      // If all exercises are completed, complete the assessment
      if (completedCount >= totalExercises && completedCount > 0) {
        try {
          console.log('🎯 All assessment exercises completed. Completing assessment...')
          
          const result = await AssessmentService.completeAssessment(user.uid)
          
          if (result.success) {
            setAssessmentResult({
              assignedLevel: result.assignedLevel,
              assessmentResult: { 
                assignedLevel: result.assignedLevel, 
                averageScore: result.overallScore 
              },
              assessmentScores: [] // Can be populated later
            })
            setCurrentStep('level-assignment')
            
            showMessage(`🎉 מזל טוב! הערכת הרמה הושלמה. הרמה שלך: ${result.assignedLevel}`, 'success')
          }
        } catch (error) {
          console.error('Error completing assessment:', error)
          showMessage('שגיאה בסיום ההערכה', 'error')
        }
      }
    }
    
    checkAssessmentCompletion()
  }, [exercises, user])

  useEffect(() => {
    // If user has completed assessment (currentLevel > 0), redirect to challenges
    if (user && user.currentLevel > 0) {
      console.log('User has already completed assessment, redirecting to challenges')
      router.push('/challenges')
      return
    }
  }, [user, router])

  const handleIntroductionComplete = () => {
    setCurrentStep('challenges')
  }
  
  const handleExerciseClick = (exerciseId: string) => {
    router.push(`/assessment/exercise/${exerciseId}`)
  }

  const handleLevelAssignmentComplete = () => {
    // Assessment completed! Redirect to challenges
    showMessage(`מזל טוב! הרמה שלך נקבעה: ${assessmentResult?.assignedLevel}`, 'success')
    router.push('/challenges')
  }



  // Handle loading and errors
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Loading text="טוען אתגרי הערכה..." />
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-4xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">שגיאה בטעינת אתגרי ההערכה</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={loadAssessmentData}>
              נסה שוב
            </Button>
          </div>
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
                <h1 className="text-2xl font-bold text-gray-900">
                  מבחן הרמה שלך
                </h1>
                <p className="text-gray-600 mt-1">
                  בואו נקבע את נקודת ההתחלה הטובה ביותר עבורך
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {currentStep === 'introduction' && 'הקדמה'}
                {currentStep === 'challenges' && `${exercises.length} תרגילי הערכה`}
                {currentStep === 'level-assignment' && 'קביעת רמה'}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Introduction Step */}
          {currentStep === 'introduction' && (
            <div className="space-y-6">
              <Card className="p-8 text-center">
                <div className="mb-6">
                  <div className="text-6xl mb-4">⚽</div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    מבחן הרמה שלך
                  </h3>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    בואו נבין את הרמה הנוכחית שלך! תבצע {exercises.length} תרגילים קצרים מתוך התרגילים שלנו
                    שיעזרו לנו לקבוע את נקודת ההתחלה הטובה ביותר עבורך.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <h4 className="font-bold text-blue-900 mb-4 text-xl">איך זה עובד?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📹</div>
                      <div className="font-medium text-blue-800">1. צלם סרטון</div>
                      <div className="text-blue-600">בצע את האתגר וצלם את עצמך</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-2">📊</div>
                      <div className="font-medium text-blue-800">2. הזן נתונים</div>
                      <div className="text-blue-600">רשום את התוצאות שלך</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-2">🏆</div>
                      <div className="font-medium text-blue-800">3. קבל רמה</div>
                      <div className="text-blue-600">נקבע את הרמה שלך</div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center space-x-3 space-x-reverse">
                    <div className="text-green-500 text-xl">⏱️</div>
                    <div>
                      <div className="font-medium text-green-900">זמן משוער: 15-20 דקות</div>
                      <div className="text-sm text-green-700">כולל הכנה וביצוע האתגרים</div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleIntroductionComplete}
                  disabled={loading}
                  className="px-12 py-4 text-lg"
                >
                  בואו נתחיל! 🚀
                </Button>
              </Card>
            </div>
          )}

          {/* Challenges Step */}
          {currentStep === 'challenges' && exercises.length > 0 && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  בחר תרגיל להתחלה
                </h3>
                <p className="text-gray-600 text-center mb-8">
                  לחץ על כל תרגיל כדי לקרוא את ההוראות ולבצע אותו
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {exercises.map((exercise, index) => (
                    <Card 
                      key={exercise.id}
                      className={`p-4 hover:shadow-lg transition-shadow cursor-pointer border-2 ${
                        exercise.isCompleted 
                          ? 'border-green-400 bg-green-50' 
                          : 'hover:border-blue-400'
                      }`}
                      onClick={() => handleExerciseClick(exercise.id)}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-3">
                          {exercise.isCompleted ? '🏆' : (
                            <>
                              {index === 0 && '⚽'} {/* Ball Control */}
                              {index === 1 && '🎯'} {/* Passing */}
                              {index === 2 && '⚡'} {/* Shooting */}
                              {index === 3 && '🏃'} {/* Dribbling */}
                              {index === 4 && '💪'} {/* Fitness */}
                            </>
                          )}
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                          {exercise.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {exercise.description}
                        </p>
                        
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                          <span>⏱️ {exercise.duration}s</span>
                          <span>🎯 {exercise.category}</span>
                        </div>
                        
                        <Button
                          variant={exercise.isCompleted ? "secondary" : "primary"}
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleExerciseClick(exercise.id)
                          }}
                        >
                          {exercise.isCompleted ? '✅ הושלם - צפה שוב' : 'התחל תרגיל'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div className="text-center mt-8">
                  <p className="text-sm text-gray-500 mb-4">
                    המערכת תחשב את רמתך על בסיס הביצועים בכל התרגילים
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Level Assignment Step */}
          {currentStep === 'level-assignment' && assessmentResult && (
            <div className="space-y-6">
              <Card className="p-8 text-center">
                <div className="mb-6">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    הרמה שלך נקבעה!
                  </h3>
                  <div className="inline-block px-6 py-3 rounded-full text-2xl font-bold bg-green-100 text-green-800 mb-4">
                    רמה {assessmentResult.assignedLevel}
                  </div>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    בהתבסס על הביצועים שלך, נקבעה עבורך רמת התחלה מתאימה. 
                    עכשיו תוכל להתחיל עם האתגרים!
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <h4 className="font-bold text-blue-900 mb-3">מה הלאה?</h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <div>• תקבל אתגרים מותאמים לרמה שלך</div>
                    <div>• תוכל להתקדם בקצב שלך</div>
                    <div>• תראה את ההתקדמות שלך לאורך זמן</div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleLevelAssignmentComplete}
                  disabled={loading}
                  className="px-12 py-4 text-lg"
                >
                  בואו נתחיל עם האתגרים! ⚽
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
