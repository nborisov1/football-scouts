/**
 * User type definitions for the Football Scouting Platform
 * Updated to match the new Firebase database structure
 */

import type { UserProgress, UserAchievement } from './level'

export type UserType = 'player' | 'scout' | 'admin'

export interface UserData {
  // Basic Firebase Auth Info
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  emailVerified?: boolean
  
  // User Classification
  type: UserType
  
  // Basic Profile Data (current implementation)
  firstName: string
  lastName: string
  age: number
  position: string
  team: string
  level: string
  dominantFoot: 'right' | 'left' | 'both'
  organization: string
  
  // Level progression fields
  onboardingCompleted: boolean
  assessmentCompleted: boolean
  currentLevel: number
  skillCategory: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  levelProgress: number
  completedLevelChallenges: string[]
  totalChallengesInLevel: number
  
  // New structured data (for future migration)
  profile?: UserProfile
  progress?: UserProgress
  settings?: UserSettings
  rankings?: UserRankings
  scoutMetrics?: ScoutMetrics
  
  // Timestamps
  createdAt?: any
  updatedAt?: any
}

export interface UserProfile {
  // Personal Information
  firstName: string
  lastName: string
  age: number
  dateOfBirth?: string
  
  // Football-specific Profile
  position: string[]              // Can play multiple positions
  preferredFoot: 'right' | 'left' | 'both'
  experienceYears: string         // '0-1', '2-5', '6-10', '10+'
  skillCategory: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  
  // Physical Data
  height?: number                 // cm
  weight?: number                 // kg
  
  // Current Club/Team Information
  currentTeam?: string
  previousClub?: string
  organization?: string
  
  // Contact & Location
  phoneNumber?: string
  city?: string
  country?: string
  
  // Media
  profilePictureUrl?: string
  
  // Preferences
  languagePreference: 'he' | 'en'
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
}

export interface UserSettings {
  // Privacy Settings
  profileVisibility: 'public' | 'scouts_only' | 'private'
  allowScoutContact: boolean
  shareVideoWithScouts: boolean
  
  // Platform Preferences
  preferredVideoQuality: 'auto' | 'high' | 'medium' | 'low'
  autoUploadVideos: boolean
  
  // Notification Preferences
  notifications: {
    newChallenges: boolean
    levelUp: boolean
    scoutInterest: boolean
    weeklyProgress: boolean
    achievements: boolean
  }
  
  // Coaching Preferences
  feedbackPreference: 'immediate' | 'weekly' | 'monthly'
  trainingReminders: boolean
  
  // Data & Analytics
  dataSharing: boolean
  analyticsOptIn: boolean
}

export interface UserRankings {
  // Global Rankings
  globalRank?: number
  globalScore: number
  
  // Level-specific Rankings
  levelRank?: number
  levelScore: number
  
  // Category Rankings
  technicalRank?: number
  physicalRank?: number
  tacticalRank?: number
  
  // Regional Rankings
  cityRank?: number
  countryRank?: number
  
  // Weekly/Monthly Rankings
  weeklyRank?: number
  monthlyRank?: number
  
  // Peak Rankings (best ever achieved)
  peakGlobalRank?: number
  peakLevelRank?: number
  
  // Last Updated
  lastUpdated: string
}

export interface ScoutMetrics {
  // Scout Activity
  totalVideosViewed: number
  totalPlayersViewed: number
  totalReports: number
  
  // Scout Engagement
  averageViewTime: number         // Average time spent viewing videos
  favoritePositions: string[]    // Positions most frequently scouted
  
  // Scout Success Metrics
  playersRecommended: number
  successfulRecommendations: number
  
  // Preferences
  preferredAgeGroups: string[]
  preferredSkillLevels: string[]
  searchFilters: {
    minLevel: number
    maxLevel: number
    positions: string[]
    locations: string[]
  }
  
  // Activity Timeline
  lastActiveDate: string
  totalSessionTime: number
}

// =============================================================================
// AUTH CONTEXT
// =============================================================================

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
  level: string
  dominantFoot: 'right' | 'left' | 'both'
  organization?: string
  
  // Optional extended profile data (for future use)
  experienceYears?: string
  height?: number
  weight?: number
  currentTeam?: string
  previousClub?: string
  city?: string
  country?: string
  phoneNumber?: string
}

// =============================================================================
// LEGACY TYPES (for backwards compatibility)
// =============================================================================

export interface LegacyUserData {
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
  
  // Legacy progression fields
  onboardingCompleted: boolean
  assessmentCompleted: boolean
  currentLevel: number
  skillCategory: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  levelProgress: number
  completedLevelChallenges: string[]
  totalChallengesInLevel: number
}

export interface LegacyAssessmentScore {
  challengeId: string
  challengeName: string
  performanceScore: number
  videoTechniqueScore: number
  finalScore: number
  submittedAt: Date
}

export interface LegacyAssessmentSubmission {
  id: string
  playerId: string
  challengeId: string
  videoUrl: string
  metrics: Record<string, number>
  performanceScore: number
  videoTechniqueScore: number
  finalScore: number
  attempt: number
  submittedAt: Date
  reviewedAt?: Date
  feedback?: string
}

// =============================================================================
// ONBOARDING TYPES
// =============================================================================

export interface OnboardingStep {
  step: 'registration' | 'profile' | 'assessment-intro' | 'assessment' | 'level-assignment' | 'dashboard'
  completed: boolean
  data?: any
}

export interface OnboardingState {
  currentStep: OnboardingStep['step']
  completedSteps: OnboardingStep['step'][]
  assessmentChallenges: any[]
  assessmentSubmissions: any[]
  assignedLevel?: number
  canProceed: boolean
}
