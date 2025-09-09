/**
 * Exercise and Training Constants for Football Scouting Platform
 * Centralized constants for exercises, positions, skills, ages, and training metadata
 * 
 * Note: All constant values are in English for better maintainability and international compatibility.
 * Hebrew translations are provided in separate label objects for UI display.
 */

// =============================================================================
// SKILL LEVELS & DIFFICULTY
// =============================================================================

export const SKILL_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
} as const

export type SkillLevel = typeof SKILL_LEVELS[keyof typeof SKILL_LEVELS]

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  [SKILL_LEVELS.BEGINNER]: 'מתחיל',
  [SKILL_LEVELS.INTERMEDIATE]: 'בינוני',
  [SKILL_LEVELS.ADVANCED]: 'מתקדם'
}

// Difficulty thresholds for progression (in points)
export const DIFFICULTY_THRESHOLDS: Record<SkillLevel, number> = {
  [SKILL_LEVELS.BEGINNER]: 10,
  [SKILL_LEVELS.INTERMEDIATE]: 30,
  [SKILL_LEVELS.ADVANCED]: 60
}

// Difficulty levels (1-10 scale)
export const DIFFICULTY_SCALE = {
  MIN: 1,
  MAX: 10,
  DEFAULT: 5
} as const

// =============================================================================
// AGE GROUPS
// =============================================================================

export const AGE_GROUPS = {
  U8: 'u8',
  U10: 'u10',
  U12: 'u12',
  U14: 'u14',
  U16: 'u16',
  U18: 'u18',
  U21: 'u21',
  ADULT: 'adult'
} as const

export type AgeGroup = typeof AGE_GROUPS[keyof typeof AGE_GROUPS]

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  [AGE_GROUPS.U8]: 'עד גיל 8',
  [AGE_GROUPS.U10]: 'עד גיל 10',
  [AGE_GROUPS.U12]: 'עד גיל 12',
  [AGE_GROUPS.U14]: 'עד גיל 14',
  [AGE_GROUPS.U16]: 'עד גיל 16',
  [AGE_GROUPS.U18]: 'עד גיל 18',
  [AGE_GROUPS.U21]: 'עד גיל 21',
  [AGE_GROUPS.ADULT]: 'בוגרים'
}

// Age group progression order
export const AGE_GROUP_ORDER: AgeGroup[] = [
  AGE_GROUPS.U8,
  AGE_GROUPS.U10,
  AGE_GROUPS.U12,
  AGE_GROUPS.U14,
  AGE_GROUPS.U16,
  AGE_GROUPS.U18,
  AGE_GROUPS.U21,
  AGE_GROUPS.ADULT
]

// =============================================================================
// PLAYER POSITIONS
// =============================================================================

export const POSITIONS = {
  // All positions
  ALL: 'all',
  
  // Defensive positions
  GOALKEEPER: 'goalkeeper',
  DEFENDER: 'defender',
  CENTER_BACK: 'center-back',
  FULLBACK: 'fullback',
  
  // Midfield positions
  MIDFIELDER: 'midfielder',
  DEFENSIVE_MIDFIELDER: 'defensive-midfielder',
  ATTACKING_MIDFIELDER: 'attacking-midfielder',
  
  // Attacking positions
  WINGER: 'winger',
  STRIKER: 'striker',
  CENTER_FORWARD: 'center-forward'
} as const

export type Position = typeof POSITIONS[keyof typeof POSITIONS]

export const POSITION_LABELS: Record<Position, string> = {
  [POSITIONS.ALL]: 'כל העמדות',
  [POSITIONS.GOALKEEPER]: 'שוער',
  [POSITIONS.DEFENDER]: 'מגן',
  [POSITIONS.CENTER_BACK]: 'מגן מרכזי',
  [POSITIONS.FULLBACK]: 'מגן צדדי',
  [POSITIONS.MIDFIELDER]: 'קשר',
  [POSITIONS.DEFENSIVE_MIDFIELDER]: 'קשר הגנתי',
  [POSITIONS.ATTACKING_MIDFIELDER]: 'קשר התקפי',
  [POSITIONS.WINGER]: 'כנף',
  [POSITIONS.STRIKER]: 'חלוץ',
  [POSITIONS.CENTER_FORWARD]: 'חלוץ מרכזי'
}

// Position groups for UI organization
export const POSITION_GROUPS = {
  DEFENSIVE: [POSITIONS.GOALKEEPER, POSITIONS.DEFENDER, POSITIONS.CENTER_BACK, POSITIONS.FULLBACK] as const,
  MIDFIELD: [POSITIONS.MIDFIELDER, POSITIONS.DEFENSIVE_MIDFIELDER, POSITIONS.ATTACKING_MIDFIELDER] as const,
  ATTACKING: [POSITIONS.WINGER, POSITIONS.STRIKER, POSITIONS.CENTER_FORWARD] as const
} as const

// =============================================================================
// EXERCISE CATEGORIES
// =============================================================================

export const EXERCISE_CATEGORIES = {
  FITNESS_TRAINING: 'fitness-training',
  FOOTBALL_TRAINING: 'football-training',
  PLAYER_SUBMISSION: 'player-submission',
  TUTORIAL: 'tutorial',
  CHALLENGE_RESPONSE: 'challenge-response',
  SKILL_DEMONSTRATION: 'skill-demonstration',
  MATCH_ANALYSIS: 'match-analysis',
  TECHNIQUE_BREAKDOWN: 'technique-breakdown'
} as const

export type ExerciseCategory = typeof EXERCISE_CATEGORIES[keyof typeof EXERCISE_CATEGORIES]

export const EXERCISE_CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  [EXERCISE_CATEGORIES.FITNESS_TRAINING]: 'אימון כושר',
  [EXERCISE_CATEGORIES.FOOTBALL_TRAINING]: 'אימון כדורגל',
  [EXERCISE_CATEGORIES.PLAYER_SUBMISSION]: 'העלאת שחקן',
  [EXERCISE_CATEGORIES.TUTORIAL]: 'מדריך',
  [EXERCISE_CATEGORIES.CHALLENGE_RESPONSE]: 'תגובה לאתגר',
  [EXERCISE_CATEGORIES.SKILL_DEMONSTRATION]: 'הדגמת מיומנות',
  [EXERCISE_CATEGORIES.MATCH_ANALYSIS]: 'ניתוח משחק',
  [EXERCISE_CATEGORIES.TECHNIQUE_BREAKDOWN]: 'פירוק טכניקה'
}

// Primary categories for filtering
export const PRIMARY_CATEGORIES: ExerciseCategory[] = [
  EXERCISE_CATEGORIES.FITNESS_TRAINING,
  EXERCISE_CATEGORIES.FOOTBALL_TRAINING
]

// =============================================================================
// EXERCISE TYPES
// =============================================================================

export const EXERCISE_TYPES = {
  // Technical skills
  DRIBBLING: 'dribbling',
  PASSING: 'passing',
  SHOOTING: 'shooting',
  BALL_CONTROL: 'ball-control',
  CROSSING: 'crossing',
  HEADING: 'heading',
  FREE_KICKS: 'free-kicks',
  
  // Tactical & positional
  DEFENDING: 'defending',
  GOALKEEPING: 'goalkeeping',
  TACTICS: 'tactics',
  GAME_INTELLIGENCE: 'game-intelligence',
  
  // Physical & mental
  FITNESS: 'fitness',
  AGILITY: 'agility',
  MENTAL_TRAINING: 'mental-training'
} as const

export type ExerciseType = typeof EXERCISE_TYPES[keyof typeof EXERCISE_TYPES]

export const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  [EXERCISE_TYPES.DRIBBLING]: 'כדרור',
  [EXERCISE_TYPES.PASSING]: 'מסירות',
  [EXERCISE_TYPES.SHOOTING]: 'בעיטות',
  [EXERCISE_TYPES.BALL_CONTROL]: 'שליטה בכדור',
  [EXERCISE_TYPES.CROSSING]: 'חיתוכים',
  [EXERCISE_TYPES.HEADING]: 'בעיטות ראש',
  [EXERCISE_TYPES.FREE_KICKS]: 'בעיטות חופשיות',
  [EXERCISE_TYPES.DEFENDING]: 'הגנה',
  [EXERCISE_TYPES.GOALKEEPING]: 'שוערות',
  [EXERCISE_TYPES.TACTICS]: 'טקטיקה',
  [EXERCISE_TYPES.GAME_INTELLIGENCE]: 'אינטליגנציה משחקית',
  [EXERCISE_TYPES.FITNESS]: 'כושר גופני',
  [EXERCISE_TYPES.AGILITY]: 'זריזות',
  [EXERCISE_TYPES.MENTAL_TRAINING]: 'אימון מנטלי'
}

// Exercise type groups for UI organization
export const EXERCISE_TYPE_GROUPS = {
  TECHNICAL: [
    EXERCISE_TYPES.DRIBBLING,
    EXERCISE_TYPES.PASSING,
    EXERCISE_TYPES.SHOOTING,
    EXERCISE_TYPES.BALL_CONTROL,
    EXERCISE_TYPES.CROSSING,
    EXERCISE_TYPES.HEADING,
    EXERCISE_TYPES.FREE_KICKS
  ],
  TACTICAL: [
    EXERCISE_TYPES.DEFENDING,
    EXERCISE_TYPES.GOALKEEPING,
    EXERCISE_TYPES.TACTICS,
    EXERCISE_TYPES.GAME_INTELLIGENCE
  ],
  PHYSICAL: [
    EXERCISE_TYPES.FITNESS,
    EXERCISE_TYPES.AGILITY,
    EXERCISE_TYPES.MENTAL_TRAINING
  ]
} as const

// =============================================================================
// TRAINING TYPES
// =============================================================================

export const TRAINING_TYPES = {
  GENERAL_TRAINING: 'general-training',
  POWER_TRAINING: 'power-training',
  POSITION_SPECIFIC: 'position-specific',
  SKILL_DEVELOPMENT: 'skill-development',
  TACTICAL_TRAINING: 'tactical-training',
  FITNESS_CONDITIONING: 'fitness-conditioning',
  MENTAL_PREPARATION: 'mental-preparation'
} as const

export type TrainingType = typeof TRAINING_TYPES[keyof typeof TRAINING_TYPES]

export const TRAINING_TYPE_LABELS: Record<TrainingType, string> = {
  [TRAINING_TYPES.GENERAL_TRAINING]: 'אימון כללי',
  [TRAINING_TYPES.POWER_TRAINING]: 'אימון כוח',
  [TRAINING_TYPES.POSITION_SPECIFIC]: 'אימון ספציפי לעמדה',
  [TRAINING_TYPES.SKILL_DEVELOPMENT]: 'פיתוח מיומנויות',
  [TRAINING_TYPES.TACTICAL_TRAINING]: 'אימון טקטי',
  [TRAINING_TYPES.FITNESS_CONDITIONING]: 'כושר גופני',
  [TRAINING_TYPES.MENTAL_PREPARATION]: 'הכנה מנטלית'
}

// =============================================================================
// TARGET AUDIENCES
// =============================================================================

export const TARGET_AUDIENCES = {
  YOUTH: 'youth',
  AMATEUR: 'amateur',
  PROFESSIONAL: 'professional'
} as const

export type TargetAudience = typeof TARGET_AUDIENCES[keyof typeof TARGET_AUDIENCES]

export const TARGET_AUDIENCE_LABELS: Record<TargetAudience, string> = {
  [TARGET_AUDIENCES.YOUTH]: 'נוער',
  [TARGET_AUDIENCES.AMATEUR]: 'חובבים',
  [TARGET_AUDIENCES.PROFESSIONAL]: 'מקצועיים'
}

// =============================================================================
// EQUIPMENT & REQUIREMENTS
// =============================================================================

export const EQUIPMENT_TYPES = [
  'football',
  'cones',
  'agility-ladders',
  'small-goals',
  'ropes',
  'hurdles',
  'rebounds',
  'medicine-balls',
  'running-track',
  'stopwatch',
  'fitness-equipment',
  'weights',
  'resistance-bands',
  'mats',
  'markers',
  'speed-ladders',
  'balance-balls',
  'speed-sensors',
  'height-barriers',
  'nets'
] as const

export type EquipmentType = typeof EQUIPMENT_TYPES[number]

export const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  'football': 'כדורי כדורגל',
  'cones': 'קונוסים',
  'agility-ladders': 'סולמות זריזות',
  'small-goals': 'גולים קטנים',
  'ropes': 'חבלים',
  'hurdles': 'מחסומים',
  'rebounds': 'קפיצות',
  'medicine-balls': 'כדורי מדיצינה',
  'running-track': 'שטח ריצה',
  'stopwatch': 'שעון עצר',
  'fitness-equipment': 'מכשירי כושר',
  'weights': 'משקולות',
  'resistance-bands': 'רצועות התנגדות',
  'mats': 'מזרנים',
  'markers': 'חרוטים',
  'speed-ladders': 'סולמות ריצה',
  'balance-balls': 'כדורי שיווי משקל',
  'speed-sensors': 'מדדי מהירות',
  'height-barriers': 'מחסומי גובה',
  'nets': 'רשתות'
}

// =============================================================================
// EXERCISE GOALS & OBJECTIVES
// =============================================================================

export const EXERCISE_GOALS = [
  'improve-technique',
  'develop-strength',
  'increase-agility',
  'improve-accuracy',
  'develop-speed',
  'strengthen-muscles',
  'improve-balance',
  'develop-endurance',
  'improve-coordination',
  'develop-aerobic',
  'improve-mental',
  'develop-thinking',
  'improve-decisions',
  'develop-creativity',
  'improve-communication',
  'develop-leadership'
] as const

export type ExerciseGoal = typeof EXERCISE_GOALS[number]

export const EXERCISE_GOAL_LABELS: Record<ExerciseGoal, string> = {
  'improve-technique': 'שיפור טכניקה',
  'develop-strength': 'פיתוח כוח',
  'increase-agility': 'הגברת זריזות',
  'improve-accuracy': 'שיפור דיוק',
  'develop-speed': 'פיתוח מהירות',
  'strengthen-muscles': 'חיזוק שרירים',
  'improve-balance': 'שיפור איזון',
  'develop-endurance': 'פיתוח סיבולת',
  'improve-coordination': 'שיפור קואורדינציה',
  'develop-aerobic': 'פיתוח אירובי',
  'improve-mental': 'שיפור מנטלי',
  'develop-thinking': 'פיתוח חשיבה',
  'improve-decisions': 'שיפור החלטות',
  'develop-creativity': 'פיתוח יצירתיות',
  'improve-communication': 'שיפור תקשורת',
  'develop-leadership': 'פיתוח מנהיגות'
}

// =============================================================================
// DURATION SETTINGS
// =============================================================================

export const DURATION_SETTINGS = {
  // Video duration (seconds)
  VIDEO_MIN: 30,
  VIDEO_MAX: 600, // 10 minutes
  
  // Expected exercise completion (minutes)
  EXERCISE_MIN: 5,
  EXERCISE_MAX: 90,
  
  // Default values
  DEFAULT_VIDEO_DURATION: 120, // 2 minutes
  DEFAULT_EXERCISE_DURATION: 30 // 30 minutes
} as const

// =============================================================================
// SCORING & PROGRESSION
// =============================================================================

export const SCORING_SETTINGS = {
  // Points range
  POINTS_MIN: 1,
  POINTS_MAX: 100,
  
  // Default points by difficulty
  BEGINNER_POINTS: 10,
  INTERMEDIATE_POINTS: 25,
  ADVANCED_POINTS: 50,
  
  // Progression multipliers
  CONSISTENCY_MULTIPLIER: 1.2,
  IMPROVEMENT_MULTIPLIER: 1.5,
  CHALLENGE_MULTIPLIER: 2.0
} as const

// =============================================================================
// VIDEO SETTINGS
// =============================================================================

export const VIDEO_SETTINGS = {
  // File size limits (bytes)
  MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB
  
  // Supported formats
  ALLOWED_FORMATS: ['mp4', 'mov', 'avi', 'webm'],
  
  // Video resolutions
  RESOLUTIONS: ['480p', '720p', '1080p', '4K'] as const,
  
  // Default settings
  DEFAULT_RESOLUTION: '1080p' as const,
  COMPRESSION_QUALITY: 0.8
} as const

// Status types removed - all admin uploads are automatically active

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get appropriate training type based on exercise category
 */
export const getTrainingTypeForCategory = (category: ExerciseCategory): TrainingType => {
  switch (category) {
    case EXERCISE_CATEGORIES.FITNESS_TRAINING:
      return TRAINING_TYPES.FITNESS_CONDITIONING
    case EXERCISE_CATEGORIES.FOOTBALL_TRAINING:
      return TRAINING_TYPES.SKILL_DEVELOPMENT
    default:
      return TRAINING_TYPES.GENERAL_TRAINING
  }
}

/**
 * Get target audience based on age group
 */
export const getTargetAudienceForAge = (ageGroup: AgeGroup): TargetAudience => {
  if (ageGroup === AGE_GROUPS.ADULT) {
    return TARGET_AUDIENCES.AMATEUR
  }
  return TARGET_AUDIENCES.YOUTH
}

/**
 * Get default points for skill level
 */
export const getDefaultPointsForSkill = (skillLevel: SkillLevel): number => {
  switch (skillLevel) {
    case SKILL_LEVELS.BEGINNER:
      return SCORING_SETTINGS.BEGINNER_POINTS
    case SKILL_LEVELS.INTERMEDIATE:
      return SCORING_SETTINGS.INTERMEDIATE_POINTS
    case SKILL_LEVELS.ADVANCED:
      return SCORING_SETTINGS.ADVANCED_POINTS
    default:
      return SCORING_SETTINGS.BEGINNER_POINTS
  }
}

/**
 * Check if position is suitable for exercise type
 */
export const isPositionSuitableForExercise = (
  position: Position, 
  exerciseType: ExerciseType
): boolean => {
  // All positions can do fitness and agility
  if (exerciseType === EXERCISE_TYPES.FITNESS || exerciseType === EXERCISE_TYPES.AGILITY) {
    return true
  }
  
  // Goalkeeper-specific exercises
  if (exerciseType === EXERCISE_TYPES.GOALKEEPING) {
    return position === POSITIONS.GOALKEEPER
  }
  
  // Defensive exercises
  if (exerciseType === EXERCISE_TYPES.DEFENDING) {
    return (POSITION_GROUPS.DEFENSIVE as readonly Position[]).includes(position) || 
           (POSITION_GROUPS.MIDFIELD as readonly Position[]).includes(position)
  }
  
  // Technical exercises - suitable for all outfield positions
  return position !== POSITIONS.GOALKEEPER
}

/**
 * Get equipment needed for exercise type
 */
export const getRequiredEquipment = (exerciseType: ExerciseType): EquipmentType[] => {
  const baseEquipment: EquipmentType[] = ['football']
  
  switch (exerciseType) {
    case EXERCISE_TYPES.AGILITY:
      return [...baseEquipment, 'cones', 'agility-ladders', 'markers']
    case EXERCISE_TYPES.GOALKEEPING:
      return [...baseEquipment, 'small-goals', 'cones', 'mats']
    case EXERCISE_TYPES.FITNESS:
      return ['weights', 'resistance-bands', 'mats', 'fitness-equipment']
    case EXERCISE_TYPES.SHOOTING:
      return [...baseEquipment, 'small-goals', 'cones', 'markers']
    case EXERCISE_TYPES.DRIBBLING:
      return [...baseEquipment, 'cones', 'markers', 'hurdles']
    case EXERCISE_TYPES.PASSING:
      return [...baseEquipment, 'cones', 'markers']
    default:
      return baseEquipment
  }
}

/**
 * Get suggested goals for exercise type
 */
export const getSuggestedGoals = (exerciseType: ExerciseType): ExerciseGoal[] => {
  const goals: ExerciseGoal[] = []
  
  if ((EXERCISE_TYPE_GROUPS.TECHNICAL as readonly ExerciseType[]).includes(exerciseType)) {
    goals.push('improve-technique', 'improve-accuracy')
  }
  
  if ((EXERCISE_TYPE_GROUPS.PHYSICAL as readonly ExerciseType[]).includes(exerciseType)) {
    goals.push('develop-strength', 'increase-agility', 'develop-endurance')
  }
  
  if ((EXERCISE_TYPE_GROUPS.TACTICAL as readonly ExerciseType[]).includes(exerciseType)) {
    goals.push('develop-thinking', 'improve-decisions', 'develop-leadership')
  }
  
  // Always include mental improvement
  goals.push('improve-mental')
  
  return goals
}

/**
 * Get age-appropriate skill level
 */
export const getAgeAppropriateSkillLevel = (ageGroup: AgeGroup): SkillLevel => {
  if (ageGroup === AGE_GROUPS.U8 || ageGroup === AGE_GROUPS.U10) {
    return SKILL_LEVELS.BEGINNER
  }
  if (ageGroup === AGE_GROUPS.U16 || ageGroup === AGE_GROUPS.U18 || ageGroup === AGE_GROUPS.U21) {
    return SKILL_LEVELS.INTERMEDIATE
  }
  return SKILL_LEVELS.ADVANCED
}

// Types are already exported above with their respective constants