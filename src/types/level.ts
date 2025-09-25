/**
 * Level System Types - Football Scouts Platform
 * Interfaces for the progressive level-based challenge system
 */

// =============================================================================
// LEVEL SYSTEM INTERFACES
// =============================================================================

export interface Level {
  // Level Identity
  levelNumber: number
  levelName: string
  description: string
  
  // Level Requirements
  requirements: {
    completionThreshold: number        // Must achieve X%+ average (e.g., 70%)
    requiredChallenges: number         // Must complete all challenges
    minimumScore: number               // Minimum score per challenge
    bonusThreshold: number             // Bonus points threshold
    
    // Challenge Categories Required
    categories: {
      technical: number                // Technical challenges required
      physical: number                 // Physical challenges required  
      tactical: number                 // Tactical challenges required
    }
  }
  
  // Available Challenges for this Level
  challenges: LevelChallenge[]
  
  // Progression & Rewards
  progression: {
    pointsAwarded: number              // Points for completing level
    nextLevel: number | null           // Next level number (null for max level)
    unlocks: string[]                  // Features/content unlocked
    badge: string                      // Badge identifier
    title: string                      // Title earned
  }
  
  // Level Characteristics
  characteristics: {
    averageCompletionTime: string      // "2-3 weeks"
    successRate: number                // Percentage of users who complete
    popularityRank: number             // How popular this level is
    difficultyRating: number           // Overall difficulty (1-10)
  }
  
  // Metadata
  createdBy: string
  isActive: boolean
  createdAt: string
}

export interface LevelChallenge {
  challengeId: string
  type: 'technical' | 'physical' | 'tactical'
  category: string                     // specific skill category
  title: string
  required: boolean                    // Is this challenge required?
  difficultyScore: number              // Challenge difficulty (1-10)
}

// =============================================================================
// CHALLENGE TEMPLATE INTERFACES
// =============================================================================

export interface Challenge {
  // Basic Info
  id: string
  title: string
  description: string
  
  // Challenge Classification
  level: number                        // Associated level
  type: 'technical' | 'physical' | 'tactical'
  category: string                     // specific skill category (passing, dribbling, etc.)
  difficulty: number                   // 1-10 difficulty scale
  
  // Instructions & Setup
  instructions: string[]               // Step-by-step instructions
  demoVideoUrl?: string               // Demo video URL
  thumbnailUrl?: string               // Thumbnail image
  
  // Performance Criteria
  metrics: ChallengeMetrics
  
  // Requirements
  equipment: string[]                  // Required equipment
  spaceRequired: string               // Space requirements
  maxDuration: number                 // Maximum time allowed (seconds)
  maxAttempts: number                 // Maximum attempts allowed
  
  // Position & Age Suitability  
  suitablePositions: string[]         // Suitable player positions
  suitableAgeGroups: string[]         // Suitable age groups
  
  // Level Integration
  prerequisites: string[]             // Required completed challenges
  unlocks: string[]                   // Challenges this unlocks
  
  // Tips and Guidance
  tips?: string[]                     // Success tips for players
  commonMistakes?: string[]           // Common mistakes to avoid
  
  // Analytics & Tracking
  analyticsConfig: {
    trackAttempts: boolean
    trackImprovement: boolean
    recordTechnique: boolean
    generateFeedback: boolean
  }
  
  // Metadata
  createdBy: string
  isActive: boolean
  createdAt: string
  lastModified: string
}

export interface ChallengeMetrics {
  type: 'count' | 'time' | 'accuracy' | 'technique'
  target: number                      // Target value to achieve
  passingScore: number               // Minimum value to pass
  excellentScore: number             // Value for excellent performance
  unit: string                       // Unit of measurement
  description: string                // Description of what's being measured
}

// =============================================================================
// ASSESSMENT SYSTEM INTERFACES
// =============================================================================

export interface AssessmentChallenge {
  // Basic Info
  id: string
  title: string
  description: string
  instructions: string[]
  
  // Assessment Specific
  type: 'assessment'
  category: 'technical' | 'physical' | 'tactical'
  order: number                       // Order in assessment sequence (1-5)
  
  // Scoring Criteria
  metrics: ChallengeMetrics
  
  // Media
  demonstrationVideoUrl?: string
  thumbnailUrl?: string
  
  // Requirements
  equipment: string[]
  spaceRequired: string
  duration: number                    // Expected duration in seconds
  maxAttempts: number
  
  // Metadata
  createdBy: string
  isActive: boolean
  createdAt: string
}

// =============================================================================
// USER PROGRESS INTERFACES
// =============================================================================

export interface UserProgress {
  // Assessment Phase
  assessmentCompleted: boolean
  assessmentScore: number             // Overall assessment score (1-100)
  initialLevel: number               // Assigned after assessment
  
  // Current Status
  currentLevel: number               // Current level (1-10 or 1-50)
  levelProgress: number              // Progress towards next level (0-100%)
  totalScore: number                 // Cumulative platform score
  
  // Level Requirements
  currentLevelChallenges: {
    required: string[]                // Required challenge IDs
    completed: string[]               // Completed challenge IDs
    averageScore: number              // Average score in current level
    completionRate: number            // Percentage completed
  }
  
  // Advancement Tracking
  levelUpThreshold: number           // Required average score to advance
  readyForLevelUp: boolean          // Meets advancement criteria
  lastLevelUp?: string              // Timestamp of last level up
  
  // Activity
  lastActivity: string
  joinDate: string
  totalChallengesCompleted: number
  streakDays: number                // Consecutive days active
}

export interface UserSubmission {
  // Reference Data
  submissionId: string
  challengeId: string               // Reference to challenge template
  exerciseId?: string              // For backwards compatibility
  type: 'assessment' | 'challenge'
  
  // Submission Data
  videoUrl: string
  videoPath: string
  videoDuration: number
  count: number                    // User's performance count
  
  // Scoring
  autoScore: number                // Algorithm-calculated score
  manualScore?: number             // Optional scout/admin review
  totalScore: number               // Final score used
  
  // Status & Review
  status: 'completed' | 'under_review' | 'approved'
  submittedAt: string
  notes?: string
  reviewedBy?: string
  reviewedAt?: string
  
  // Metadata
  attempt: number                  // Which attempt this is
  retakes?: number                // Number of retakes before submission
}

export interface UserCompletion {
  exerciseId: string
  challengeId?: string
  type: 'assessment' | 'challenge'
  completedAt: string
  score: number
  attempts: number
  bestScore: number
  submissionId: string            // Reference to best submission
}

export interface UserAchievement {
  // Achievement Identity
  achievementId: string
  title: string
  description: string
  icon: string
  category: 'progression' | 'performance' | 'consistency' | 'special'
  
  // Achievement Data
  unlockedAt: string
  difficulty: 'common' | 'uncommon' | 'rare' | 'legendary'
  pointsAwarded: number
  
  // Criteria Met
  requirements: Record<string, any>
  
  // Recognition
  badgeUrl?: string
  shareableLink?: string
  publicDisplay: boolean
  
  // Progress Tracking (for multi-step achievements)
  progress: {
    current: number               // Current progress
    total: number                // Total required
    percentage: number           // Completion percentage
  }
}

// =============================================================================
// HELPER TYPES
// =============================================================================

export type ChallengeType = 'technical' | 'physical' | 'tactical'
export type ChallengeCategory = 'passing' | 'dribbling' | 'shooting' | 'defending' | 'fitness' | 'agility' | 'positioning'
export type MetricType = 'count' | 'time' | 'accuracy' | 'technique'
export type SubmissionStatus = 'completed' | 'under_review' | 'approved'
export type AchievementDifficulty = 'common' | 'uncommon' | 'rare' | 'legendary'
export type AchievementCategory = 'progression' | 'performance' | 'consistency' | 'special'


