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
}
