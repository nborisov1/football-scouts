/**
 * Constants Index - Football Scouting Platform
 * Central export for all application constants
 */

import { 
  TRAINING_TYPES, 
  POSITIONS, 
  AGE_GROUPS, 
  SKILL_LEVELS, 
  TARGET_AUDIENCES,
  isPositionSuitableForChallenge 
} from './challenges'

// Re-export all challenge constants
export * from './challenges'

// Backward compatibility aliases for legacy code
export const EXERCISE_CATEGORIES = {
  'technical-skills': 'technical-skills',
  'physical-fitness': 'physical-fitness', 
  'general-training': 'general-training'
} as const

export const EXERCISE_CATEGORY_LABELS = {
  'technical-skills': 'כישורים טכניים',
  'physical-fitness': 'כושר גופני',
  'general-training': 'אימון כללי'
} as const

export const EXERCISE_TYPES = {
  DRIBBLING: 'dribbling',
  PASSING: 'passing',
  SHOOTING: 'shooting',
  FITNESS: 'fitness'
} as const

export const EXERCISE_TYPE_LABELS = {
  'dribbling': 'כדרור',
  'passing': 'מסירות',
  'shooting': 'בעיטות',
  'fitness': 'כושר'
} as const

export const EXERCISE_TYPE_GROUPS = {
  TECHNICAL: ['dribbling', 'passing', 'shooting'],
  PHYSICAL: ['fitness']
} as const

// Type aliases for imports
export type ExerciseCategory = keyof typeof EXERCISE_CATEGORIES
export type ExerciseType = keyof typeof EXERCISE_TYPES
export type TrainingType = keyof typeof TRAINING_TYPES
export type Position = keyof typeof POSITIONS
export type AgeGroup = keyof typeof AGE_GROUPS
export type SkillLevel = keyof typeof SKILL_LEVELS
export type TargetAudience = keyof typeof TARGET_AUDIENCES

// Helper function for compatibility
export const isPositionSuitableForExercise = (position: string, exerciseType: string): boolean => {
  return isPositionSuitableForChallenge(position, exerciseType)
}
