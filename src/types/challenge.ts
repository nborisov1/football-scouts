/**
 * Challenge System Types
 * Defines the structure for the advanced challenge progression system
 */

// New Personalized Challenge Types
export interface PersonalizedChallenge {
  id: string
  title: string
  description: string
  category: string
  challengeType: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  targetAudience: 'youth' | 'amateur' | 'professional'
  ageGroups: string[]
  positions: string[]
  difficulty: number // 1-10 scale
  duration: number // expected completion time in minutes
  points: number
  videoUrl?: string
  thumbnailUrl?: string
  instructions: string
  equipment: string[]
  goals: string[]
  metrics: ChallengeMetric[]
  isLevelSpecific: boolean
  requiredLevel: number
  
  // Personalization fields
  relevanceScore: number
  personalizedReason: string
  estimatedCompletion: number
  prerequisites: string[]
}

export interface ChallengeSubmission {
  id: string
  userId: string
  challengeId: string
  videoUrl: string
  videoFileName: string
  metrics: Record<string, number>
  completionTime: number // actual time taken in minutes
  notes?: string
  submittedAt: Date
  status: 'submitted' | 'under_review' | 'approved' | 'needs_improvement'
  reviewed: boolean
  score?: number | null
  feedback?: string | null
}

export interface ChallengeProgress {
  userId: string
  challengeId: string
  status: 'available' | 'in_progress' | 'completed' | 'locked'
  attempts: number
  bestScore?: number
  startedAt?: Date
  completedAt?: Date
  submissions: string[] // submission IDs
}

export interface PersonalizedChallengeSet {
  daily: PersonalizedChallenge[]
  weekly: PersonalizedChallenge[]
  monthly: PersonalizedChallenge[]
  recommended: PersonalizedChallenge[]
}

export type ChallengeStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'failed'
export type ChallengeType = 'skill' | 'fitness' | 'tactical' | 'mental' | 'teamwork'
export type ChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type ChallengeCategory = 'dribbling' | 'passing' | 'shooting' | 'defending' | 'goalkeeping' | 'fitness' | 'tactics'
export type AgeGroup = 'u8' | 'u10' | 'u12' | 'u14' | 'u16' | 'u18' | 'u21' | 'adult'
export type Position = 'goalkeeper' | 'defender' | 'midfielder' | 'striker' | 'all'

export interface ChallengeMetric {
  id: string
  name: string
  unit: string // e.g., 'seconds', 'touches', 'meters', 'percentage'
  type: 'numeric' | 'time' | 'count' | 'percentage'
  required: boolean
  description?: string
}

export interface ChallengeThreshold {
  metricId: string
  level: number // 1-5 (Beginner, Intermediate, Advanced, Expert, Elite)
  thresholds: {
    poor: number
    fair: number
    good: number
    excellent: number
    outstanding: number
  }
}

export interface Challenge {
  id: string
  title: string
  description: string
  type: ChallengeType
  category: ChallengeCategory
  difficulty: ChallengeDifficulty
  level: number // 1-10, determines unlock order within age group
  ageGroup: AgeGroup
  positions: Position[] // Which positions this challenge applies to
  prerequisites: string[] // Challenge IDs that must be completed first
  requirements: ChallengeRequirements
  rewards: ChallengeRewards
  timeLimit?: number // in minutes, optional
  attempts: number // max attempts allowed
  status: ChallengeStatus
  videoUrl?: string // Demo video for the challenge
  thumbnailUrl?: string // Thumbnail image for the challenge
  instructions: string // Detailed instructions for the player
  metrics: ChallengeMetric[] // Configurable metrics to track
  thresholds: ChallengeThreshold[] // Scoring thresholds for each metric
  isMonthlyChallenge: boolean // Monthly challenges for level progression
  createdAt: Date
  updatedAt: Date
  createdBy: string // Admin user ID
}

export interface ChallengeRequirements {
  minAge?: number
  maxAge?: number
  positions?: string[] // Allowed positions
  minLevel?: ChallengeDifficulty
  completedChallenges?: string[] // Required completed challenges
  minPoints?: number // Minimum ranking points required
  skills?: string[] // Required skills
}

export interface ChallengeRewards {
  points: number
  badges?: string[] // Badge IDs
  unlocks?: string[] // Unlock challenge IDs
  title?: string // Special title earned
  description?: string // Description of rewards
}

export interface PlayerChallengeProgress {
  playerId: string
  challengeId: string
  status: ChallengeStatus
  attempts: number
  bestScore?: number
  currentScore?: number
  startedAt?: Date
  completedAt?: Date
  submittedAt?: Date
  adminFeedback?: string
  adminScore?: number
  videoSubmission?: string // Video URL or ID
  notes?: string // Player's notes
  createdAt: Date
  updatedAt: Date
}

export interface ChallengeSubmission {
  id: string
  playerId: string
  challengeId: string
  videoUrl: string
  description: string
  metrics: {
    [metricId: string]: number // Metric ID -> Value
  }
  scores: {
    [metricId: string]: {
      value: number
      level: number // 1-5
      rating: 'poor' | 'fair' | 'good' | 'excellent' | 'outstanding'
      points: number
    }
  }
  totalScore: number
  overallRating: 'poor' | 'fair' | 'good' | 'excellent' | 'outstanding'
  submittedAt: Date
  status: 'pending' | 'approved' | 'rejected' | 'needs_improvement'
  adminFeedback?: string
  adminScore?: number
  reviewedBy?: string
  reviewedAt?: Date
}

export interface ChallengeSeries {
  id: string
  title: string
  description: string
  challenges: string[] // Challenge IDs in order
  unlockRequirements: {
    minLevel: ChallengeDifficulty
    minPoints: number
    completedChallenges: string[]
  }
  rewards: {
    seriesPoints: number
    badge: string
    title: string
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface PlayerChallengeStats {
  playerId: string
  totalChallenges: number
  completedChallenges: number
  failedChallenges: number
  averageScore: number
  totalPoints: number
  currentLevel: number
  badges: string[]
  titles: string[]
  streak: number // Current completion streak
  longestStreak: number
  lastActivity: Date
  createdAt: Date
  updatedAt: Date
}

// Hebrew translations for UI
export const CHALLENGE_TYPE_LABELS: Record<ChallengeType, string> = {
  skill: 'כישורים',
  fitness: 'כושר גופני',
  tactical: 'טקטי',
  mental: 'מנטלי',
  teamwork: 'עבודת צוות'
}

export const CHALLENGE_DIFFICULTY_LABELS: Record<ChallengeDifficulty, string> = {
  beginner: 'מתחיל',
  intermediate: 'בינוני',
  advanced: 'מתקדם',
  expert: 'מומחה'
}

export const CHALLENGE_CATEGORY_LABELS: Record<ChallengeCategory, string> = {
  dribbling: 'כדרור',
  passing: 'מסירה',
  shooting: 'בעיטה',
  defending: 'הגנה',
  goalkeeping: 'שוערות',
  fitness: 'כושר',
  tactics: 'טקטיקה'
}

export const CHALLENGE_STATUS_LABELS: Record<ChallengeStatus, string> = {
  locked: 'נעול',
  available: 'זמין',
  in_progress: 'בתהליך',
  completed: 'הושלם',
  failed: 'נכשל'
}

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  u8: 'עד גיל 8',
  u10: 'עד גיל 10',
  u12: 'עד גיל 12',
  u14: 'עד גיל 14',
  u16: 'עד גיל 16',
  u18: 'עד גיל 18',
  u21: 'עד גיל 21',
  adult: 'בוגרים'
}

export const POSITION_LABELS: Record<Position, string> = {
  goalkeeper: 'שוער',
  defender: 'הגנה',
  midfielder: 'קישור',
  striker: 'התקפה',
  all: 'כל התפקידים'
}

export const METRIC_TYPE_LABELS: Record<string, string> = {
  numeric: 'מספר',
  time: 'זמן',
  count: 'מונה',
  percentage: 'אחוז'
}

export const RATING_LABELS: Record<string, string> = {
  poor: 'חלש',
  fair: 'בינוני',
  good: 'טוב',
  excellent: 'מעולה',
  outstanding: 'מצוין'
}
