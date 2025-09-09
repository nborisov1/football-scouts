# Exercise Constants Usage Examples

This document provides examples of how to use the centralized exercise constants throughout the application.

## Importing Constants

```typescript
// Import specific constants
import { 
  EXERCISE_CATEGORIES, 
  EXERCISE_TYPES, 
  POSITIONS, 
  AGE_GROUPS,
  SKILL_LEVELS 
} from '@/constants'

// Import labels for UI
import { 
  EXERCISE_CATEGORY_LABELS,
  EXERCISE_TYPE_LABELS,
  POSITION_LABELS,
  AGE_GROUP_LABELS,
  SKILL_LEVEL_LABELS
} from '@/constants'

// Import helper functions
import { 
  getDefaultPointsForSkill,
  getTargetAudienceForAge,
  isPositionSuitableForExercise 
} from '@/constants'
```

## Basic Usage Examples

### 1. Exercise Categories

```typescript
// Create a select dropdown for categories
const CategorySelector = () => (
  <select>
    {PRIMARY_CATEGORIES.map(category => (
      <option key={category} value={category}>
        {EXERCISE_CATEGORY_LABELS[category]}
      </option>
    ))}
  </select>
)

// Check category type
if (video.category === EXERCISE_CATEGORIES.FITNESS_TRAINING) {
  // Handle fitness training logic
}
```

### 2. Exercise Types

```typescript
// Filter exercises by technical skills
const technicalExercises = EXERCISE_TYPE_GROUPS.TECHNICAL.map(type => ({
  value: type,
  label: EXERCISE_TYPE_LABELS[type]
}))

// Create exercise metadata
const exerciseData = {
  type: EXERCISE_TYPES.DRIBBLING,
  label: EXERCISE_TYPE_LABELS[EXERCISE_TYPES.DRIBBLING] // 'כדרור'
}
```

### 3. Positions and Suitability

```typescript
// Check if exercise is suitable for position
const isCoachRecommended = isPositionSuitableForExercise(
  POSITIONS.GOALKEEPER, 
  EXERCISE_TYPES.GOALKEEPING
) // returns true

// Get position groups
const defensivePositions = POSITION_GROUPS.DEFENSIVE.map(pos => ({
  value: pos,
  label: POSITION_LABELS[pos]
}))
```

### 4. Age Groups and Progression

```typescript
// Get age-appropriate difficulty
const getAgeAppropriateLevel = (ageGroup: AgeGroup): SkillLevel => {
  if (ageGroup === AGE_GROUPS.U8 || ageGroup === AGE_GROUPS.U10) {
    return SKILL_LEVELS.BEGINNER
  }
  if (ageGroup === AGE_GROUPS.U16 || ageGroup === AGE_GROUPS.U18) {
    return SKILL_LEVELS.INTERMEDIATE
  }
  return SKILL_LEVELS.ADVANCED
}

// Age progression UI
const AgeSelector = ({ value, onChange }) => (
  <select value={value} onChange={onChange}>
    {AGE_GROUP_ORDER.map(age => (
      <option key={age} value={age}>
        {AGE_GROUP_LABELS[age]}
      </option>
    ))}
  </select>
)
```

### 5. Scoring and Points

```typescript
// Calculate points for exercise completion
const calculateExercisePoints = (skillLevel: SkillLevel) => {
  const basePoints = getDefaultPointsForSkill(skillLevel)
  return basePoints * SCORING_SETTINGS.CONSISTENCY_MULTIPLIER
}

// Difficulty thresholds
const canProgress = (currentPoints: number, currentLevel: SkillLevel) => {
  return currentPoints >= DIFFICULTY_THRESHOLDS[currentLevel]
}
```

### 6. Video Settings and Validation

```typescript
// Validate video upload
const validateVideoFile = (file: File) => {
  const isValidSize = file.size <= VIDEO_SETTINGS.MAX_FILE_SIZE
  const extension = file.name.split('.').pop()?.toLowerCase()
  const isValidFormat = VIDEO_SETTINGS.ALLOWED_FORMATS.includes(extension || '')
  
  return { isValidSize, isValidFormat }
}

// Default video configuration
const defaultVideoConfig = {
  resolution: VIDEO_SETTINGS.DEFAULT_RESOLUTION,
  duration: DURATION_SETTINGS.DEFAULT_VIDEO_DURATION,
  quality: VIDEO_SETTINGS.COMPRESSION_QUALITY
}
```

### 7. Training Program Generation

```typescript
// Create training program metadata
const createTrainingProgram = (ageGroup: AgeGroup, position: Position) => ({
  targetAudience: getTargetAudienceForAge(ageGroup),
  trainingType: getTrainingTypeForCategory(EXERCISE_CATEGORIES.FOOTBALL_TRAINING),
  skillLevel: getAgeAppropriateLevel(ageGroup),
  positionSpecific: position !== POSITIONS.ALL,
  exercises: [] // populate with suitable exercises
})
```

### 8. Equipment and Goals

```typescript
// Generate exercise requirements
const generateExerciseRequirements = (exerciseType: ExerciseType) => {
  const baseEquipment = ['כדורי כדורגל']
  
  if (exerciseType === EXERCISE_TYPES.AGILITY) {
    baseEquipment.push('קונוסים', 'סולמות זריזות')
  }
  
  if (exerciseType === EXERCISE_TYPES.GOALKEEPING) {
    baseEquipment.push('גולים קטנים', 'כפפות שוער')
  }
  
  return baseEquipment
}

// Exercise goals selection
const getExerciseGoals = (exerciseType: ExerciseType) => {
  const goals = []
  
  if (EXERCISE_TYPE_GROUPS.TECHNICAL.includes(exerciseType)) {
    goals.push('שיפור טכניקה', 'שיפור דיוק')
  }
  
  if (EXERCISE_TYPE_GROUPS.PHYSICAL.includes(exerciseType)) {
    goals.push('פיתוח כוח', 'שיפור זריזות')
  }
  
  return goals
}
```

## Advanced Usage Patterns

### 1. Dynamic Form Generation

```typescript
const ExerciseFormBuilder = ({ category }: { category: ExerciseCategory }) => {
  const relevantTypes = category === EXERCISE_CATEGORIES.FITNESS_TRAINING 
    ? EXERCISE_TYPE_GROUPS.PHYSICAL 
    : EXERCISE_TYPE_GROUPS.TECHNICAL

  return (
    <div>
      <label>סוג תרגיל:</label>
      <select>
        {relevantTypes.map(type => (
          <option key={type} value={type}>
            {EXERCISE_TYPE_LABELS[type]}
          </option>
        ))}
      </select>
    </div>
  )
}
```

### 2. Smart Filtering

```typescript
const filterExercisesByPosition = (exercises: Exercise[], position: Position) => {
  return exercises.filter(exercise => 
    isPositionSuitableForExercise(position, exercise.type)
  )
}

const getRecommendedDifficulty = (ageGroup: AgeGroup, position: Position) => {
  const baseLevel = getAgeAppropriateLevel(ageGroup)
  
  // Goalkeepers might need different progression
  if (position === POSITIONS.GOALKEEPER) {
    return baseLevel === SKILL_LEVELS.BEGINNER 
      ? SKILL_LEVELS.BEGINNER 
      : SKILL_LEVELS.INTERMEDIATE
  }
  
  return baseLevel
}
```

### 3. Internationalization Ready

```typescript
// All labels are already in Hebrew, but structure supports i18n
const getLocalizedLabel = (
  key: string, 
  labelMap: Record<string, string>, 
  locale = 'he'
) => {
  // Future: could extend to support multiple languages
  return labelMap[key] || key
}
```

## Benefits of This Centralized Approach

1. **Consistency**: All parts of the app use the same values
2. **Maintainability**: Changes in one place update everywhere
3. **Type Safety**: TypeScript ensures correct usage
4. **Extensibility**: Easy to add new categories, types, etc.
5. **Validation**: Helper functions provide business logic
6. **Performance**: Constants are computed once at build time
7. **Developer Experience**: Autocomplete and IntelliSense support
8. **Reduced Bugs**: No magic strings or typos in category names

## Migration Notes

When migrating existing code:

1. Replace hardcoded strings with constants
2. Use helper functions instead of custom logic
3. Import from `@/constants` instead of local definitions
4. Update types to use the centralized type definitions
5. Test all functionality to ensure nothing breaks

This centralized approach makes the codebase more robust and easier to maintain as the application grows.
