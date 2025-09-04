/**
 * User type definitions for the Football Scouting Platform
 */

export type UserType = 'player' | 'scout' | 'admin'

export interface UserData {
  uid: string
  name: string
  type: UserType
  email: string
  createdAt?: Date
  updatedAt?: Date
  
  // Player-specific fields
  age?: number
  position?: string
  dominantFoot?: 'right' | 'left' | 'both'
  level?: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  height?: number
  weight?: number
  experience?: number
  
  // Scout-specific fields
  organization?: string
  certifications?: string[]
  regionsOfInterest?: string[]
  
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
  }
}

export interface AuthContextType {
  user: UserData | null
  loading: boolean
  login: (email: string, password: string) => Promise<any>
  register: (userData: RegisterData, userType: UserType) => Promise<any>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<UserData>) => Promise<void>
  initializeAdmin: () => Promise<void>
}

export interface RegisterData {
  name: string
  email: string
  password: string
  age?: number
  position?: string
  dominantFoot?: string
  level?: string
  organization?: string
}
