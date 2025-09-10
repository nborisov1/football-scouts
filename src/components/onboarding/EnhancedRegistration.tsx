'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { UserData, RegisterData, OnboardingState } from '@/types/user'
import Button from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { AssessmentService } from '@/lib/assessmentService'

// Step Components
import BasicRegistration from './steps/BasicRegistration'
import ProfileSetup from './steps/ProfileSetup'
import AssessmentIntroduction from './steps/AssessmentIntroduction'
import AssessmentChallenges from './steps/AssessmentChallenges'
import LevelAssignment from './steps/LevelAssignment'

interface EnhancedRegistrationProps {
  isOpen: boolean
  onClose: () => void
  userType: 'player' | 'scout' | 'admin'
}

const ONBOARDING_STEPS = [
  { id: 'registration', title: 'רישום בסיסי', description: 'פרטים אישיים ראשוניים' },
  { id: 'profile', title: 'פרופיל כדורגל', description: 'פרטי כדורגל ורקע ספורטיבי' },
  { id: 'assessment-intro', title: 'הכנה למבחן', description: 'הסבר על מבחן הרמה' },
  { id: 'assessment', title: 'מבחן רמה', description: '5 אתגרים לקביעת רמה' },
  { id: 'level-assignment', title: 'קביעת רמה', description: 'תוצאות ורמה אישית' }
] as const

type OnboardingStepId = typeof ONBOARDING_STEPS[number]['id']

export default function EnhancedRegistration({ isOpen, onClose, userType }: EnhancedRegistrationProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<OnboardingStepId>('registration')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Onboarding state
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    currentStep: 'registration',
    completedSteps: [],
    assessmentChallenges: [],
    assessmentSubmissions: [],
    canProceed: false
  })

  // Registration data
  const [registrationData, setRegistrationData] = useState<RegisterData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    type: userType,
    age: 16,
    position: '',
    team: '',
    level: 'beginner',
    dominantFoot: 'right',
    organization: ''
  })

  useEffect(() => {
    // Load assessment challenges when component mounts
    const loadAssessmentChallenges = async () => {
      if (userType === 'player') {
        try {
          const challenges = await AssessmentService.getInitialAssessmentChallenges()
          setOnboardingState(prev => ({
            ...prev,
            assessmentChallenges: challenges
          }))
        } catch (error) {
          console.error('Failed to load assessment challenges:', error)
          setError('שגיאה בטעינת אתגרי המבחן')
        }
      }
    }

    loadAssessmentChallenges()
  }, [userType])

  // Only show onboarding for players
  if (userType !== 'player') {
    return (
      <BasicPlayerRegistration 
        isOpen={isOpen}
        onClose={onClose}
        userType={userType}
      />
    )
  }

  const handleStepComplete = async (stepData: any) => {
    setError(null)
    setLoading(true)

    try {
      switch (currentStep) {
        case 'registration':
          await handleBasicRegistration(stepData)
          break
        case 'profile':
          await handleProfileSetup(stepData)
          break
        case 'assessment-intro':
          handleAssessmentIntroduction()
          break
        case 'assessment':
          await handleAssessmentComplete(stepData)
          break
        case 'level-assignment':
          await handleLevelAssignmentComplete()
          break
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה לא צפויה')
    } finally {
      setLoading(false)
    }
  }

  const handleBasicRegistration = async (data: RegisterData) => {
    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      )

      // Update display name
      await updateProfile(userCredential.user, {
        displayName: `${data.firstName} ${data.lastName}`
      })

      // Save registration data
      setRegistrationData(data)
      
      // Mark step complete and move to next
      setOnboardingState(prev => ({
        ...prev,
        completedSteps: [...prev.completedSteps, 'registration'],
        currentStep: 'profile'
      }))
      setCurrentStep('profile')

    } catch (error: any) {
      console.error('Registration error:', error)
      throw new Error(getFirebaseErrorMessage(error.code))
    }
  }

  const handleProfileSetup = async (profileData: Partial<RegisterData>) => {
    try {
      const updatedData = { ...registrationData, ...profileData }
      setRegistrationData(updatedData)

      // Create initial user document
      const user = auth.currentUser
      if (!user) throw new Error('משתמש לא מחובר')

      const userData: Partial<UserData> = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        type: 'player',
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        age: updatedData.age,
        position: updatedData.position,
        team: updatedData.team,
        level: 'beginner',
        dominantFoot: updatedData.dominantFoot,
        organization: updatedData.organization,
        experienceYears: updatedData.experienceYears,
        height: updatedData.height,
        weight: updatedData.weight,
        previousClub: updatedData.previousClub,
        onboardingCompleted: false,
        assessmentCompleted: false,
        currentLevel: 1,
        skillCategory: 'beginner',
        levelProgress: 0,
        completedLevelChallenges: [],
        totalChallengesInLevel: 50,
        points: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await setDoc(doc(db, 'users', user.uid), userData)

      // Move to assessment introduction
      setOnboardingState(prev => ({
        ...prev,
        completedSteps: [...prev.completedSteps, 'profile'],
        currentStep: 'assessment-intro'
      }))
      setCurrentStep('assessment-intro')

    } catch (error) {
      console.error('Profile setup error:', error)
      throw new Error('שגיאה בשמירת הפרופיל')
    }
  }

  const handleAssessmentIntroduction = () => {
    // Just move to assessment step
    setOnboardingState(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps, 'assessment-intro'],
      currentStep: 'assessment'
    }))
    setCurrentStep('assessment')
  }

  const handleAssessmentComplete = async (assessmentData: any) => {
    try {
      const { assignedLevel, assessmentResult } = assessmentData
      
      // Update onboarding state with assignment
      setOnboardingState(prev => ({
        ...prev,
        completedSteps: [...prev.completedSteps, 'assessment'],
        currentStep: 'level-assignment',
        assignedLevel
      }))
      setCurrentStep('level-assignment')

    } catch (error) {
      console.error('Assessment completion error:', error)
      throw new Error('שגיאה בעיבוד תוצאות המבחן')
    }
  }

  const handleLevelAssignmentComplete = async () => {
    try {
      // Mark onboarding as complete
      const user = auth.currentUser
      if (!user) throw new Error('משתמש לא מחובר')

      // Close modal and redirect to dashboard
      onClose()
      router.push('/training') // Or wherever you want to redirect after onboarding

    } catch (error) {
      console.error('Level assignment completion error:', error)
      throw new Error('שגיאה בהשלמת התהליך')
    }
  }

  const handleBackStep = () => {
    const currentIndex = ONBOARDING_STEPS.findIndex(step => step.id === currentStep)
    if (currentIndex > 0) {
      const previousStep = ONBOARDING_STEPS[currentIndex - 1].id as OnboardingStepId
      setCurrentStep(previousStep)
      setOnboardingState(prev => ({
        ...prev,
        currentStep: previousStep
      }))
    }
  }

  const getStepComponent = () => {
    switch (currentStep) {
      case 'registration':
        return (
          <BasicRegistration
            data={registrationData}
            onComplete={handleStepComplete}
            loading={loading}
            error={error}
          />
        )
      case 'profile':
        return (
          <ProfileSetup
            data={registrationData}
            onComplete={handleStepComplete}
            onBack={handleBackStep}
            loading={loading}
            error={error}
          />
        )
      case 'assessment-intro':
        return (
          <AssessmentIntroduction
            challenges={onboardingState.assessmentChallenges}
            onComplete={handleStepComplete}
            onBack={handleBackStep}
            loading={loading}
          />
        )
      case 'assessment':
        return (
          <AssessmentChallenges
            challenges={onboardingState.assessmentChallenges}
            onComplete={handleStepComplete}
            onBack={handleBackStep}
            loading={loading}
            error={error}
          />
        )
      case 'level-assignment':
        return (
          <LevelAssignment
            assignedLevel={onboardingState.assignedLevel || 1}
            onComplete={handleStepComplete}
            loading={loading}
          />
        )
      default:
        return null
    }
  }

  const currentStepIndex = ONBOARDING_STEPS.findIndex(step => step.id === currentStep)
  const progress = Math.round(((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100)

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing during onboarding
      title="הצטרפות לפלטפורמה"
      size="xl"
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {ONBOARDING_STEPS[currentStepIndex]?.title}
            </h2>
            <span className="text-sm text-gray-500">
              שלב {currentStepIndex + 1} מתוך {ONBOARDING_STEPS.length}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Step Description */}
          <p className="text-sm text-gray-600 mt-2">
            {ONBOARDING_STEPS[currentStepIndex]?.description}
          </p>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {getStepComponent()}
        </div>
      </div>
    </Modal>
  )
}

// Helper function for Firebase error messages
function getFirebaseErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'האימייל כבר בשימוש'
    case 'auth/weak-password':
      return 'הסיסמה חלשה מדי'
    case 'auth/invalid-email':
      return 'כתובת אימייל לא תקינה'
    default:
      return 'שגיאה ברישום. נסה שוב.'
  }
}

// Simplified registration for non-player users
function BasicPlayerRegistration({ isOpen, onClose, userType }: { 
  isOpen: boolean
  onClose: () => void
  userType: 'scout' | 'admin'
}) {
  // Implement basic registration for scouts/admins
  // This is simplified since they don't need the full onboarding flow
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="רישום">
      <div className="p-6">
        <p>רישום בסיסי עבור {userType === 'scout' ? 'סקאוט' : 'אדמין'}</p>
        {/* Add basic registration form here */}
      </div>
    </Modal>
  )
}
