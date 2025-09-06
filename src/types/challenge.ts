/**
 * Challenge System Types
 * Defines the structure for the advanced challenge progression system
 */

export type ChallengeStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'failed'
export type ChallengeType = 'skill' | 'fitness' | 'tactical' | 'mental' | 'teamwork'
export type ChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type ChallengeCategory = 'dribbling' | 'passing' | 'shooting' | 'defending' | 'goalkeeping' | 'fitness' | 'tactics'

export interface Challenge {
  id: string
  title: string
  description: string
  type: ChallengeType
  category: ChallengeCategory
  difficulty: ChallengeDifficulty
  level: number // 1-10, determines unlock order
  prerequisites: string[] // Challenge IDs that must be completed first
  requirements: ChallengeRequirements
  rewards: ChallengeRewards
  timeLimit?: number // in minutes, optional
  attempts: number // max attempts allowed
  status: ChallengeStatus
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
