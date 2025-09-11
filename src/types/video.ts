/**
 * Video Data Types for Football Scouting Platform
 * Comprehensive type definitions for video management system
 */

export interface VideoMetadata {
  id: string
  title: string
  description: string
  
  // Video file information
  fileName: string
  fileSize: number
  duration: number // in seconds
  format: string
  resolution: string
  thumbnailUrl?: string
  videoUrl: string
  
  // Upload information
  uploadedBy: string // user ID
  uploadedAt: Date
  lastModified: Date
  
  // Admin management - removed (all uploads are active)
  
  // Enhanced Categorization for Training System
  category: VideoCategory
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  exerciseType: ExerciseType
  targetAudience: 'youth' | 'amateur' | 'professional'
  
  // Training System Specific Fields
  trainingType: TrainingType
  positionSpecific: Position[]
  ageGroup: AgeGroup
  difficultyLevel: number // 1-10 scale or progression threshold
  seriesId?: string // Links to training series
  seriesOrder?: number // Order within the series
  prerequisites?: string[] // Required completed videos/exercises
  
  // Difficulty Variants System
  baseVideoId?: string // References the original video if this is a variant
  isVariant?: boolean // Whether this is a difficulty variant
  variantLabel?: string // e.g., "מתחיל+", "בינוני+", "מתקדם+"
  
  // Additional metadata
  tags: string[]
  requiredEquipment: string[]
  instructions: string
  goals: string[]
  expectedDuration: number // Expected time to complete exercise
  
  // Level Assessment
  isLevelAssessment?: boolean // Mark this video as a level assessment exercise
  
  // Analytics
  views: number
  likes: number
  downloads: number
  
  // Player specific (for player-uploaded videos)
  playerInfo?: {
    playerId: string
    playerName: string
    position: string
    age: number
    level: string
  }
  
  // AI Analysis (for future integration)
  aiAnalysis?: {
    completed: boolean
    score?: number
    feedback?: string
    keyMetrics?: Record<string, number>
    suggestions?: string[]
  }
}

export interface VideoUpload {
  file: File
  metadata: Omit<VideoMetadata, 'id' | 'uploadedAt' | 'lastModified' | 'videoUrl' | 'thumbnailUrl' | 'views' | 'likes' | 'downloads'>
  uploadProgress?: number
  uploadStatus?: 'preparing' | 'uploading' | 'processing' | 'completed' | 'error'
  errorMessage?: string
}

export interface VideoFilter {
  // status filter removed - all videos are active
  category?: VideoCategory[]
  skillLevel?: VideoMetadata['skillLevel'][]
  exerciseType?: ExerciseType[]
  targetAudience?: VideoMetadata['targetAudience'][]
  uploadedBy?: string
  dateRange?: {
    start: Date
    end: Date
  }
  searchQuery?: string
  tags?: string[]
}

export interface VideoSort {
  field: 'uploadedAt' | 'title' | 'views' | 'likes' | 'duration'
  direction: 'asc' | 'desc'
}

// Import types from centralized constants
import type { 
  ExerciseCategory, 
  ExerciseType, 
  TrainingType, 
  Position, 
  AgeGroup,
  SkillLevel,
  TargetAudience
} from '@/constants'

// Re-export for backward compatibility
export type VideoCategory = ExerciseCategory
export type { ExerciseType, TrainingType, Position, AgeGroup, SkillLevel, TargetAudience }

// Video Collections for organizing videos
export interface VideoCollection {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  videos: string[] // Video IDs in order
  videoCount: number
  totalDuration: number // Total duration in seconds
  category: VideoCategory
  tags: string[]
  isPublic: boolean
  isFeatured: boolean
  sortOrder: number
  createdBy: string // Admin user ID
  createdAt: Date
  updatedAt: Date
}

// Training Series and Progression
export interface TrainingSeries {
  id: string
  title: string
  description: string
  trainingType: TrainingType
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  positionSpecific: Position[]
  ageGroup: AgeGroup
  difficultyLevel: number
  videos: string[] // Video IDs in order
  prerequisites: string[] // Required completed series
  estimatedDuration: number // Total time in minutes
  isActive: boolean
  createdBy: string // Admin user ID
  createdAt: Date
  updatedAt: Date
}

export interface PlayerProgress {
  playerId: string
  completedSeries: string[] // Series IDs
  completedVideos: string[] // Video IDs
  currentSeries?: string // Currently working on
  currentVideoIndex?: number // Position in current series
  totalPoints: number
  rank: number
  lastActivity: Date
  achievements: Achievement[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  type: 'series-completion' | 'video-completion' | 'milestone' | 'challenge'
  earnedAt: Date
  points: number
}

export interface PlayerVideoSubmission {
  id: string
  playerId: string
  videoId: string // Reference to training video
  seriesId: string
  videoUrl: string
  thumbnailUrl?: string
  submittedAt: Date
  status: 'pending' | 'approved' | 'rejected' | 'needs-improvement'
  adminFeedback?: string
  adminScore?: number // 1-10 scale
  reviewedBy?: string // Admin user ID
  reviewedAt?: Date
  resubmissionCount: number
  maxResubmissions: number
}

export interface VideoStats {
  total: number
  pending: number
  approved: number
  rejected: number
  byCategory: Record<VideoCategory, number>
  byExerciseType: Record<ExerciseType, number>
  recentUploads: number // last 7 days
  totalSize: number // in bytes
  averageDuration: number // in seconds
}

export interface VideoUploadConfig {
  maxFileSize: number // in bytes
  allowedFormats: string[]
  maxDuration: number // in seconds
  requireThumbnail: boolean
  autoGenerateThumbnail: boolean
  compressionEnabled: boolean
  compressionQuality: number
}

// Default configuration
export const DEFAULT_VIDEO_CONFIG: VideoUploadConfig = {
  maxFileSize: 500 * 1024 * 1024, // 500MB
  allowedFormats: ['mp4', 'mov', 'avi', 'webm'],
  maxDuration: 600, // 10 minutes
  requireThumbnail: false,
  autoGenerateThumbnail: true,
  compressionEnabled: true,
  compressionQuality: 0.8
}

// Import labels from centralized constants
import { 
  EXERCISE_CATEGORY_LABELS,
  EXERCISE_TYPE_LABELS,
  TRAINING_TYPE_LABELS,
  POSITION_LABELS,
  AGE_GROUP_LABELS
} from '@/constants'

// Re-export for backward compatibility
export const VIDEO_CATEGORY_LABELS = EXERCISE_CATEGORY_LABELS
export { EXERCISE_TYPE_LABELS, TRAINING_TYPE_LABELS, POSITION_LABELS, AGE_GROUP_LABELS }
