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
  
  // Admin management
  status: 'pending' | 'approved' | 'rejected'
  moderatedBy?: string // admin user ID
  moderatedAt?: Date
  moderationNotes?: string
  
  // Categorization
  category: VideoCategory
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  exerciseType: ExerciseType
  targetAudience: 'youth' | 'amateur' | 'professional'
  
  // Additional metadata
  tags: string[]
  requiredEquipment: string[]
  instructions: string
  goals: string[]
  
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
