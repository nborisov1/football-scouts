/**
 * User type definitions for the Football Scouting Platform
 */

export type UserType = 'player' | 'scout' | 'admin'

export interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified: boolean
  type: UserType
  firstName: string
  lastName: string
  age: number
  position: string
  team: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  dominantFoot: 'right' | 'left' | 'both'
  organization: string
  createdAt?: any
  updatedAt?: any
  
  // Two-Phase Level System
  onboardingCompleted: boolean
  assessmentCompleted: boolean
  currentLevel: number // 1-50
  skillCategory: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  
  // Assessment Results (Phase 1)
  assessmentScores?: AssessmentScore[]
  startingLevel?: number
  levelAssignmentReason?: string
  
  // Level Progression (Phase 2)
  levelProgress: number // 0-100 percentage to next level
  completedLevelChallenges: string[] // challenge IDs completed for current level
  totalChallengesInLevel: number // total challenges required for current level
  
  // Enhanced Profile Data
  experienceYears?: string // '0-1', '2-5', '6-10', '10+'
  height?: number // cm
  weight?: number // kg
  previousClub?: string
  
  // Progress tracking
  points?: number
  weeklyTrainings?: number
  completedChallenges?: number
  weeklyProgress?: number
  
  // Statistics
  stats?: {
    trainingHours: number
    challengesCompleted: number
    rank: number
    improvementRate: number
    levelsGained: number
    assessmentDate?: Date
  }
}

export interface AuthContextType {
  user: UserData | null
  loading: boolean
  login: (email: string, password: string) => Promise<any>
  register: (userData: RegisterData) => Promise<any>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<UserData>) => Promise<void>
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  type: UserType
  age: number
  position: string
  team: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  dominantFoot: 'right' | 'left' | 'both'
  organization: string
  // Extended profile data
  experienceYears?: string
  height?: number
  weight?: number
  previousClub?: string
}

// =============================================================================
// ASSESSMENT SYSTEM TYPES (Phase 1)
// =============================================================================

export interface AssessmentScore {
  challengeId: string
  challengeName: string
  performanceScore: number // 1-10 based on metrics
  videoTechniqueScore: number // 1-10 from video analysis
  finalScore: number // simple average of performance + technique
  submittedAt: Date
}

export interface AssessmentChallenge {
  id: string
  title: string
  description: string
  instructions: string[]
  demoVideoUrl?: string
  thumbnailUrl?: string
  
  // Assessment specific
  isAssessmentChallenge: true
  assessmentOrder: number // 1-5 for the 5 standard challenges
  
  // Performance metrics expected
  metrics: AssessmentMetric[]
  expectedDuration: number // in minutes
  maxAttempts: number
}

export interface AssessmentMetric {
  id: string
  name: string
  unit: string // e.g., 'shots', 'seconds', 'passes'
  type: 'count' | 'time' | 'percentage'
  description: string
  expectedRange: {
    min: number
    max: number
  }
}

export interface AssessmentSubmission {
  id: string
  playerId: string
  challengeId: string
  videoUrl: string
  metrics: Record<string, number> // metricId -> value
  performanceScore: number
  videoTechniqueScore: number
  finalScore: number
  attempt: number // which attempt this is (1-3)
  submittedAt: Date
  reviewedAt?: Date
  feedback?: string
}

// =============================================================================
// LEVEL PROGRESSION TYPES (Phase 2)
// =============================================================================

export interface LevelProgressionData {
  currentLevel: number
  totalChallenges: number
  completedChallenges: number
  requiredChallenges: string[] // challenge IDs for current level
  nextLevelRequirements: {
    challengesRemaining: number
    estimatedTimeToComplete: number // in days
    skillFocusAreas: string[]
  }
}

export interface OnboardingStep {
  step: 'registration' | 'profile' | 'assessment' | 'level-assignment' | 'dashboard'
  completed: boolean
  data?: any
}

export interface OnboardingState {
  currentStep: OnboardingStep['step']
  completedSteps: OnboardingStep['step'][]
  assessmentChallenges: AssessmentChallenge[]
  assessmentSubmissions: AssessmentSubmission[]
  assignedLevel?: number
  canProceed: boolean
}
