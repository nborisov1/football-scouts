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
  
  // Admin management (deprecated)
  status?: 'pending' | 'approved' | 'rejected'
  moderatedBy?: string // admin user ID
  moderatedAt?: Date
  moderationNotes?: string
  
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
  status?: VideoMetadata['status'][]
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
  field: 'uploadedAt' | 'title' | 'views' | 'likes' | 'duration' | 'status'
  direction: 'asc' | 'desc'
}

export type VideoCategory = 
  | 'training-exercise' 
  | 'player-submission' 
  | 'tutorial' 
  | 'challenge-response' 
  | 'skill-demonstration'
  | 'match-analysis'
  | 'technique-breakdown'

export type ExerciseType = 
  | 'dribbling'
  | 'passing'
  | 'shooting'
  | 'defending'
  | 'goalkeeping'
  | 'fitness'
  | 'agility'
  | 'ball-control'
  | 'crossing'
  | 'heading'
  | 'free-kicks'
  | 'tactics'
  | 'game-intelligence'
  | 'mental-training'

// New Training System Types
export type TrainingType = 
  | 'general-training'
  | 'power-training'
  | 'position-specific'
  | 'skill-development'
  | 'tactical-training'
  | 'fitness-conditioning'
  | 'mental-preparation'

export type Position = 
  | 'goalkeeper'
  | 'defender'
  | 'midfielder'
  | 'striker'
  | 'winger'
  | 'fullback'
  | 'center-back'
  | 'defensive-midfielder'
  | 'attacking-midfielder'
  | 'center-forward'

export type AgeGroup = 
  | 'u8' | 'u10' | 'u12' | 'u14' | 'u16' | 'u18' | 'u21' | 'adult'

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

// Video status translations for Hebrew UI
export const VIDEO_STATUS_LABELS: Record<VideoMetadata['status'], string> = {
  pending: 'ממתין לאישור',
  approved: 'מאושר',
  rejected: 'נדחה'
}

// Category translations for Hebrew UI
export const VIDEO_CATEGORY_LABELS: Record<VideoCategory, string> = {
  'training-exercise': 'תרגיל אימון',
  'player-submission': 'העלאת שחקן',
  'tutorial': 'מדריך',
  'challenge-response': 'תגובה לאתגר',
  'skill-demonstration': 'הדגמת מיומנות',
  'match-analysis': 'ניתוח משחק',
  'technique-breakdown': 'פירוק טכניקה'
}

// Exercise type translations for Hebrew UI
export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  dribbling: 'כדרור',
  passing: 'מסירות',
  shooting: 'בעיטות',
  defending: 'הגנה',
  goalkeeping: 'שוערות',
  fitness: 'כושר גופני',
  agility: 'זריזות',
  'ball-control': 'שליטה בכדור',
  crossing: 'חיתוכים',
  heading: 'בעיטות ראש',
  'free-kicks': 'בעיטות חופשיות',
  tactics: 'טקטיקה',
  'game-intelligence': 'אינטליגנציה משחקית',
  'mental-training': 'אימון מנטלי'
}

// Training type translations for Hebrew UI
export const TRAINING_TYPE_LABELS: Record<TrainingType, string> = {
  'general-training': 'אימון כללי',
  'power-training': 'אימון כוח',
  'position-specific': 'אימון ספציפי לעמדה',
  'skill-development': 'פיתוח מיומנויות',
  'tactical-training': 'אימון טקטי',
  'fitness-conditioning': 'כושר גופני',
  'mental-preparation': 'הכנה מנטלית'
}

// Position translations for Hebrew UI
export const POSITION_LABELS: Record<Position, string> = {
  goalkeeper: 'שוער',
  defender: 'מגן',
  midfielder: 'קשר',
  striker: 'חלוץ',
  winger: 'כנף',
  'fullback': 'מגן צדדי',
  'center-back': 'מגן מרכזי',
  'defensive-midfielder': 'קשר הגנתי',
  'attacking-midfielder': 'קשר התקפי',
  'center-forward': 'חלוץ מרכזי'
}

// Age group translations for Hebrew UI
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
