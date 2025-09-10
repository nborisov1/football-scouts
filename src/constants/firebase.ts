/**
 * Firebase Constants - Football Scouting Platform
 * Collection names, user types, and other Firebase-related constants
 */

export const USER_TYPES = {
  PLAYER: 'player',
  SCOUT: 'scout',
  ADMIN: 'admin'
} as const

export const COLLECTIONS = {
  USERS: 'users',
  TRAINING: 'training',
  CHALLENGES: 'challenges',
  LEADERBOARDS: 'leaderboards',
  SCOUT_REPORTS: 'scout_reports',
  VIDEOS: 'videos',
  ANALYTICS: 'analytics',
  // Add progression-related collections when we implement the system
  EXERCISES: 'exercises',
  USER_PROGRESS: 'user_progress',
  EXERCISE_SUBMISSIONS: 'exercise_submissions'
} as const

export const AUTH_STATES = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated'
} as const

export type UserType = typeof USER_TYPES[keyof typeof USER_TYPES]
export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS]
export type AuthState = typeof AUTH_STATES[keyof typeof AUTH_STATES]
