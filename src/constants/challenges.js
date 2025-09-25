/**
 * Challenges Constants - Football Scouting Platform
 * All constants for challenges, positions, skills, ages, Firebase collections, and training metadata
 */

// =============================================================================
// FIREBASE COLLECTIONS & STORAGE
// =============================================================================

export const COLLECTIONS = {
  // Core User Management
  USERS: 'users',
  
  // Level System (NEW)
  LEVELS: 'levels',                    // Level definitions & requirements
  CHALLENGES: 'challenges',            // Admin-created challenge templates
  ASSESSMENT_CHALLENGES: 'assessmentChallenges', // Standardized assessment challenges
  
  // Legacy Video Collection (for admin-uploaded demo videos)
  VIDEOS: 'videos',                    // Admin demo videos for challenges
  
  // Competition & Recognition
  LEADERBOARDS: 'leaderboards',        // Global rankings
  SCOUT_ACTIVITY: 'scoutActivity',     // Scout interaction tracking
  ANALYTICS: 'analytics',              // Platform analytics
  
  // Legacy Collections (to be migrated)
  TRAINING: 'training',
  SCOUT_REPORTS: 'scout_reports', 
  USER_PROGRESS: 'user_progress',
  ASSESSMENTS: 'assessments'           // Will be moved to user subcollections
}

// Subcollections under users/{userId}/
export const USER_SUBCOLLECTIONS = {
  ASSESSMENTS: 'assessments',          // Assessment exam submissions
  SUBMISSIONS: 'submissions',          // Challenge video submissions  
  COMPLETIONS: 'completions',          // Exercise completion tracking
  PROGRESS: 'progress',               // Level progress tracking
  ACHIEVEMENTS: 'achievements'         // Unlocked achievements & badges
}

export const STORAGE_PATHS = {
  // Admin uploads (demo videos for challenges)
  CHALLENGE_DEMOS: 'challenges/demos',      // Demo videos for challenges
  ASSESSMENT_DEMOS: 'assessments/demos',    // Demo videos for assessments
  THUMBNAILS: 'thumbnails',
  
  // User uploads (organized by user and type)
  USER_ASSESSMENTS: 'assessments',          // assessments/{userId}/
  USER_SUBMISSIONS: 'submissions',          // submissions/{userId}/
  USER_PROFILES: 'profiles'                 // profiles/{userId}/
}

// =============================================================================
// USER TYPES
// =============================================================================

export const USER_TYPES = {
  PLAYER: 'player',
  SCOUT: 'scout',
  ADMIN: 'admin'
}

// Compatibility function for user data access during transition
export const getLegacyUserField = (user, field) => {
  if (!user) return null
  
  // Handle legacy direct access
  if (user[field] !== undefined) return user[field]
  
  // Handle new structure
  if (user.profile && user.profile[field] !== undefined) return user.profile[field]
  if (user.progress && user.progress[field] !== undefined) return user.progress[field]
  
  return null
}

export const AUTH_STATES = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated'
}

// =============================================================================
// SKILL LEVELS & DIFFICULTY
// =============================================================================

export const SKILL_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  PROFESSIONAL: 'professional'
}

export const SKILL_LEVEL_LABELS = {
  [SKILL_LEVELS.BEGINNER]: 'מתחיל',
  [SKILL_LEVELS.INTERMEDIATE]: 'בינוני',
  [SKILL_LEVELS.ADVANCED]: 'מתקדם',
  [SKILL_LEVELS.PROFESSIONAL]: 'מקצועי'
}

// Difficulty thresholds for progression (in points)
export const DIFFICULTY_THRESHOLDS = {
  [SKILL_LEVELS.BEGINNER]: 10,
  [SKILL_LEVELS.INTERMEDIATE]: 30,
  [SKILL_LEVELS.ADVANCED]: 60,
  [SKILL_LEVELS.PROFESSIONAL]: 100
}

// Difficulty levels (1-10 scale)
export const DIFFICULTY_SCALE = {
  MIN: 1,
  MAX: 10,
  DEFAULT: 5
}

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
}

export const AGE_GROUP_LABELS = {
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
export const AGE_GROUP_ORDER = [
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
}

export const POSITION_LABELS = {
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
  DEFENSIVE: [POSITIONS.GOALKEEPER, POSITIONS.DEFENDER, POSITIONS.CENTER_BACK, POSITIONS.FULLBACK],
  MIDFIELD: [POSITIONS.MIDFIELDER, POSITIONS.DEFENSIVE_MIDFIELDER, POSITIONS.ATTACKING_MIDFIELDER],
  ATTACKING: [POSITIONS.WINGER, POSITIONS.STRIKER, POSITIONS.CENTER_FORWARD]
}

// =============================================================================
// CHALLENGE CATEGORIES
// =============================================================================

export const CHALLENGE_CATEGORIES = {
  FITNESS_TRAINING: 'fitness-training',
  FOOTBALL_TRAINING: 'football-training',
  PLAYER_SUBMISSION: 'player-submission',
  TUTORIAL: 'tutorial',
  CHALLENGE_RESPONSE: 'challenge-response',
  SKILL_DEMONSTRATION: 'skill-demonstration',
  MATCH_ANALYSIS: 'match-analysis',
  TECHNIQUE_BREAKDOWN: 'technique-breakdown'
}

export const CHALLENGE_CATEGORY_LABELS = {
  [CHALLENGE_CATEGORIES.FITNESS_TRAINING]: 'אימון כושר',
  [CHALLENGE_CATEGORIES.FOOTBALL_TRAINING]: 'אימון כדורגל',
  [CHALLENGE_CATEGORIES.PLAYER_SUBMISSION]: 'העלאת שחקן',
  [CHALLENGE_CATEGORIES.TUTORIAL]: 'מדריך',
  [CHALLENGE_CATEGORIES.CHALLENGE_RESPONSE]: 'תגובה לאתגר',
  [CHALLENGE_CATEGORIES.SKILL_DEMONSTRATION]: 'הדגמת מיומנות',
  [CHALLENGE_CATEGORIES.MATCH_ANALYSIS]: 'ניתוח משחק',
  [CHALLENGE_CATEGORIES.TECHNIQUE_BREAKDOWN]: 'פירוק טכניקה'
}

// Primary categories for filtering
export const PRIMARY_CATEGORIES = [
  CHALLENGE_CATEGORIES.FITNESS_TRAINING,
  CHALLENGE_CATEGORIES.FOOTBALL_TRAINING
]

// =============================================================================
// CHALLENGE TYPES
// =============================================================================

export const CHALLENGE_TYPES = {
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
}

export const CHALLENGE_TYPE_LABELS = {
  [CHALLENGE_TYPES.DRIBBLING]: 'כדרור',
  [CHALLENGE_TYPES.PASSING]: 'מסירות',
  [CHALLENGE_TYPES.SHOOTING]: 'בעיטות',
  [CHALLENGE_TYPES.BALL_CONTROL]: 'שליטה בכדור',
  [CHALLENGE_TYPES.CROSSING]: 'חיתוכים',
  [CHALLENGE_TYPES.HEADING]: 'בעיטות ראש',
  [CHALLENGE_TYPES.FREE_KICKS]: 'בעיטות חופשיות',
  [CHALLENGE_TYPES.DEFENDING]: 'הגנה',
  [CHALLENGE_TYPES.GOALKEEPING]: 'שוערות',
  [CHALLENGE_TYPES.TACTICS]: 'טקטיקה',
  [CHALLENGE_TYPES.GAME_INTELLIGENCE]: 'אינטליגנציה משחקית',
  [CHALLENGE_TYPES.FITNESS]: 'כושר גופני',
  [CHALLENGE_TYPES.AGILITY]: 'זריזות',
  [CHALLENGE_TYPES.MENTAL_TRAINING]: 'אימון מנטלי'
}

// Challenge type groups for UI organization
export const CHALLENGE_TYPE_GROUPS = {
  TECHNICAL: [
    CHALLENGE_TYPES.DRIBBLING,
    CHALLENGE_TYPES.PASSING,
    CHALLENGE_TYPES.SHOOTING,
    CHALLENGE_TYPES.BALL_CONTROL,
    CHALLENGE_TYPES.CROSSING,
    CHALLENGE_TYPES.HEADING,
    CHALLENGE_TYPES.FREE_KICKS
  ],
  TACTICAL: [
    CHALLENGE_TYPES.DEFENDING,
    CHALLENGE_TYPES.GOALKEEPING,
    CHALLENGE_TYPES.TACTICS,
    CHALLENGE_TYPES.GAME_INTELLIGENCE
  ],
  PHYSICAL: [
    CHALLENGE_TYPES.FITNESS,
    CHALLENGE_TYPES.AGILITY,
    CHALLENGE_TYPES.MENTAL_TRAINING
  ]
}

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
}

export const TRAINING_TYPE_LABELS = {
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
}

export const TARGET_AUDIENCE_LABELS = {
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
]

export const EQUIPMENT_TYPE_LABELS = {
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
// CHALLENGE GOALS & OBJECTIVES
// =============================================================================

export const CHALLENGE_GOALS = [
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
]

export const CHALLENGE_GOAL_LABELS = {
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
  
  // Expected challenge completion (minutes)
  CHALLENGE_MIN: 5,
  CHALLENGE_MAX: 90,
  
  // Default values
  DEFAULT_VIDEO_DURATION: 120, // 2 minutes
  DEFAULT_CHALLENGE_DURATION: 30 // 30 minutes
}

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
  PROFESSIONAL_POINTS: 100,
  
  // Progression multipliers
  CONSISTENCY_MULTIPLIER: 1.2,
  IMPROVEMENT_MULTIPLIER: 1.5,
  CHALLENGE_MULTIPLIER: 2.0
}

// =============================================================================
// VIDEO SETTINGS
// =============================================================================

export const VIDEO_SETTINGS = {
  // File size limits (bytes)
  MAX_FILE_SIZE: 500 * 1024 * 1024, // 500MB
  
  // Supported formats
  ALLOWED_FORMATS: ['mp4', 'mov', 'avi', 'webm'],
  
  // Video resolutions
  RESOLUTIONS: ['480p', '720p', '1080p', '4K'],
  
  // Default settings
  DEFAULT_RESOLUTION: '1080p',
  COMPRESSION_QUALITY: 0.8
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get appropriate training type based on challenge category
 */
export const getTrainingTypeForCategory = (category) => {
  switch (category) {
    case CHALLENGE_CATEGORIES.FITNESS_TRAINING:
      return TRAINING_TYPES.FITNESS_CONDITIONING
    case CHALLENGE_CATEGORIES.FOOTBALL_TRAINING:
      return TRAINING_TYPES.SKILL_DEVELOPMENT
    default:
      return TRAINING_TYPES.GENERAL_TRAINING
  }
}

/**
 * Get target audience based on age group
 */
export const getTargetAudienceForAge = (ageGroup) => {
  if (ageGroup === AGE_GROUPS.ADULT) {
    return TARGET_AUDIENCES.AMATEUR
  }
  return TARGET_AUDIENCES.YOUTH
}

/**
 * Get default points for skill level
 */
export const getDefaultPointsForSkill = (skillLevel) => {
  switch (skillLevel) {
    case SKILL_LEVELS.BEGINNER:
      return SCORING_SETTINGS.BEGINNER_POINTS
    case SKILL_LEVELS.INTERMEDIATE:
      return SCORING_SETTINGS.INTERMEDIATE_POINTS
    case SKILL_LEVELS.ADVANCED:
      return SCORING_SETTINGS.ADVANCED_POINTS
    case SKILL_LEVELS.PROFESSIONAL:
      return SCORING_SETTINGS.PROFESSIONAL_POINTS
    default:
      return SCORING_SETTINGS.BEGINNER_POINTS
  }
}

/**
 * Check if position is suitable for challenge type
 */
export const isPositionSuitableForChallenge = (position, challengeType) => {
  // All positions can do fitness and agility
  if (challengeType === CHALLENGE_TYPES.FITNESS || challengeType === CHALLENGE_TYPES.AGILITY) {
    return true
  }
  
  // Goalkeeper-specific challenges
  if (challengeType === CHALLENGE_TYPES.GOALKEEPING) {
    return position === POSITIONS.GOALKEEPER
  }
  
  // Defensive challenges
  if (challengeType === CHALLENGE_TYPES.DEFENDING) {
    return POSITION_GROUPS.DEFENSIVE.includes(position) || 
           POSITION_GROUPS.MIDFIELD.includes(position)
  }
  
  // Technical challenges - suitable for all outfield positions
  return position !== POSITIONS.GOALKEEPER
}

/**
 * Get equipment needed for challenge type
 */
export const getRequiredEquipment = (challengeType) => {
  const baseEquipment = ['football']
  
  switch (challengeType) {
    case CHALLENGE_TYPES.AGILITY:
      return [...baseEquipment, 'cones', 'agility-ladders', 'markers']
    case CHALLENGE_TYPES.GOALKEEPING:
      return [...baseEquipment, 'small-goals', 'cones', 'mats']
    case CHALLENGE_TYPES.FITNESS:
      return ['weights', 'resistance-bands', 'mats', 'fitness-equipment']
    case CHALLENGE_TYPES.SHOOTING:
      return [...baseEquipment, 'small-goals', 'cones', 'markers']
    case CHALLENGE_TYPES.DRIBBLING:
      return [...baseEquipment, 'cones', 'markers', 'hurdles']
    case CHALLENGE_TYPES.PASSING:
      return [...baseEquipment, 'cones', 'markers']
    default:
      return baseEquipment
  }
}

/**
 * Get suggested goals for challenge type
 */
export const getSuggestedGoals = (challengeType) => {
  const goals = []
  
  if (CHALLENGE_TYPE_GROUPS.TECHNICAL.includes(challengeType)) {
    goals.push('improve-technique', 'improve-accuracy')
  }
  
  if (CHALLENGE_TYPE_GROUPS.PHYSICAL.includes(challengeType)) {
    goals.push('develop-strength', 'increase-agility', 'develop-endurance')
  }
  
  if (CHALLENGE_TYPE_GROUPS.TACTICAL.includes(challengeType)) {
    goals.push('develop-thinking', 'improve-decisions', 'develop-leadership')
  }
  
  // Always include mental improvement
  goals.push('improve-mental')
  
  return goals
}

/**
 * Get age-appropriate skill level
 */
export const getAgeAppropriateSkillLevel = (ageGroup) => {
  if (ageGroup === AGE_GROUPS.U8 || ageGroup === AGE_GROUPS.U10) {
    return SKILL_LEVELS.BEGINNER
  }
  if (ageGroup === AGE_GROUPS.U16 || ageGroup === AGE_GROUPS.U18 || ageGroup === AGE_GROUPS.U21) {
    return SKILL_LEVELS.INTERMEDIATE
  }
  return SKILL_LEVELS.ADVANCED
}
