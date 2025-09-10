/**
 * Level Assessment Service - Determines starting level from assessment scores
 * Uses simplified algorithm with direct score-to-level mapping
 */

import { 
  doc, 
  updateDoc, 
  serverTimestamp,
  addDoc,
  collection 
} from 'firebase/firestore'
import { db } from './firebase'
import { AssessmentScore, UserData } from '@/types/user'

export interface LevelAssessmentResult {
  assignedLevel: number
  averageScore: number
  skillCategory: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  strengths: string[]
  areasForImprovement: string[]
  reasoning: string
  nextSteps: string[]
}

export class LevelAssessmentService {
  
  /**
   * Calculate starting level from assessment scores (simplified algorithm)
   * No age, position, or experience weighting - just direct score mapping
   */
  static calculateStartingLevel(assessmentScores: AssessmentScore[]): number {
    if (assessmentScores.length === 0) return 1
    
    // Simple average of all final scores
    const averageScore = assessmentScores.reduce(
      (sum, score) => sum + score.finalScore, 
      0
    ) / assessmentScores.length
    
    return this.mapScoreToLevel(averageScore)
  }

  /**
   * Direct mapping of average score to starting level (1-10)
   */
  private static mapScoreToLevel(averageScore: number): number {
    if (averageScore >= 9.0) return 10
    if (averageScore >= 8.0) return 9
    if (averageScore >= 7.0) return 8
    if (averageScore >= 6.0) return 7
    if (averageScore >= 5.0) return 6
    if (averageScore >= 4.0) return 5
    if (averageScore >= 3.0) return 4
    if (averageScore >= 2.0) return 3
    if (averageScore >= 1.0) return 2
    return 1
  }

  /**
   * Determine skill category based on assigned level
   */
  static getSkillCategoryForLevel(level: number): 'beginner' | 'intermediate' | 'advanced' | 'professional' {
    if (level >= 8) return 'advanced'
    if (level >= 5) return 'intermediate'
    return 'beginner'
  }

  /**
   * Generate comprehensive assessment result with explanations
   */
  static generateLevelAssessmentResult(assessmentScores: AssessmentScore[]): LevelAssessmentResult {
    const averageScore = assessmentScores.reduce(
      (sum, score) => sum + score.finalScore, 
      0
    ) / assessmentScores.length
    
    const assignedLevel = this.calculateStartingLevel(assessmentScores)
    const skillCategory = this.getSkillCategoryForLevel(assignedLevel)
    
    // Analyze strengths and weaknesses
    const { strengths, areasForImprovement } = this.analyzePerformance(assessmentScores)
    
    // Generate reasoning and next steps
    const reasoning = this.generateReasoning(assignedLevel, averageScore, assessmentScores)
    const nextSteps = this.generateNextSteps(assignedLevel, areasForImprovement)
    
    return {
      assignedLevel,
      averageScore: Math.round(averageScore * 10) / 10,
      skillCategory,
      strengths,
      areasForImprovement,
      reasoning,
      nextSteps
    }
  }

  /**
   * Analyze performance to identify strengths and areas for improvement
   */
  private static analyzePerformance(assessmentScores: AssessmentScore[]): {
    strengths: string[]
    areasForImprovement: string[]
  } {
    const strengths: string[] = []
    const areasForImprovement: string[] = []
    
    assessmentScores.forEach(score => {
      if (score.finalScore >= 7.0) {
        // Strong performance
        switch (score.challengeId) {
          case 'ball-control-assessment':
            strengths.push('שליטה מעולה בכדור - יש לך טכניקה טובה')
            break
          case 'passing-accuracy-assessment':
            strengths.push('דיוק מסירות גבוה - אתה מדויק במסירות קצרות')
            break
          case 'shooting-accuracy-assessment':
            strengths.push('בעיטות מדויקות - יש לך כישרון בבעיטה למטרה')
            break
          case 'dribbling-speed-assessment':
            strengths.push('כדרור מהיר - אתה זריז עם הכדור')
            break
          case 'sprint-speed-assessment':
            strengths.push('מהירות ריצה טובה - יש לך כושר גופני מעולה')
            break
        }
      } else if (score.finalScore <= 4.0) {
        // Area for improvement
        switch (score.challengeId) {
          case 'ball-control-assessment':
            areasForImprovement.push('שליטה בכדור - התמקד בשיפור הטכניקה הבסיסית')
            break
          case 'passing-accuracy-assessment':
            areasForImprovement.push('דיוק מסירות - תרגל מסירות קצרות יותר')
            break
          case 'shooting-accuracy-assessment':
            areasForImprovement.push('דיוק בעיטות - השקע זמן בתרגול בעיטות למטרה')
            break
          case 'dribbling-speed-assessment':
            areasForImprovement.push('מהירות כדרור - תרגל כדרור בין קונוסים')
            break
          case 'sprint-speed-assessment':
            areasForImprovement.push('מהירות ריצה - שפר את הכושר הגופני שלך')
            break
        }
      }
    })

    // Add default messages if none found
    if (strengths.length === 0) {
      strengths.push('מוכנות ללמידה - יש לך יסוד טוב לפיתוח')
    }
    
    if (areasForImprovement.length === 0) {
      areasForImprovement.push('המשך לתרגל באופן קבוע לשיפור כללי')
    }

    return { strengths, areasForImprovement }
  }

  /**
   * Generate reasoning for level assignment
   */
  private static generateReasoning(
    level: number, 
    averageScore: number, 
    assessmentScores: AssessmentScore[]
  ): string {
    const roundedScore = Math.round(averageScore * 10) / 10
    
    let reasoning = `הוענקה לך רמה ${level} על בסיס ציון ממוצע של ${roundedScore} במבחנים. `
    
    if (level >= 8) {
      reasoning += 'הביצועים שלך מעולים! אתה מתחיל ברמה גבוהה ויש לך בסיס טכני מצוין.'
    } else if (level >= 5) {
      reasoning += 'הביצועים שלך טובים. יש לך בסיס חזק עם מקום לשיפור בתחומים ספציפיים.'
    } else if (level >= 3) {
      reasoning += 'אתה מתחיל! יש לך פוטנציאל טוב ועם תרגול קבוע תשפר במהירות.'
    } else {
      reasoning += 'אתה בתחילת הדרך. זה בסדר גמור - כולם מתחילים איפשהו. עם תרגול תראה שיפור מהיר.'
    }

    return reasoning
  }

  /**
   * Generate next steps based on level and areas for improvement
   */
  private static generateNextSteps(level: number, areasForImprovement: string[]): string[] {
    const nextSteps: string[] = []
    
    // Level-specific guidance
    if (level <= 2) {
      nextSteps.push('התמקד בלימוד הטכניקות הבסיסיות בכדורגל')
      nextSteps.push('תרגל 20-30 דקות כל יום עם הכדור')
    } else if (level <= 5) {
      nextSteps.push('חזק את הטכניקות הבסיסיות ולמד טכניקות חדשות')
      nextSteps.push('התחל לתרגל בסיטואציות של לחץ')
    } else if (level <= 8) {
      nextSteps.push('שפר את הטכניקות המתקדמות ומהירות הביצוע')
      nextSteps.push('התמקד בטקטיקה ובקריאת משחק')
    } else {
      nextSteps.push('המשך לשפר את רמת הטכניקה והביצוע')
      nextSteps.push('התמקד באספקטים מנטליים ובהובלת משחק')
    }

    // Add specific guidance based on areas for improvement
    nextSteps.push('השלם את האתגרים ברמה הנוכחית לקבלת משוב מפורט')
    nextSteps.push('צפה בסרטוני הדרכה ולמד מהמאמנים הווירטואליים')

    return nextSteps
  }

  /**
   * Save assessment result and update user level
   */
  static async saveAssessmentResult(
    userId: string,
    assessmentResult: LevelAssessmentResult,
    assessmentScores: AssessmentScore[]
  ): Promise<void> {
    try {
      // Update user with assessment results
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        assessmentCompleted: true,
        onboardingCompleted: true,
        currentLevel: assessmentResult.assignedLevel,
        startingLevel: assessmentResult.assignedLevel,
        skillCategory: assessmentResult.skillCategory,
        assessmentScores,
        levelAssignmentReason: assessmentResult.reasoning,
        levelProgress: 0,
        completedLevelChallenges: [],
        totalChallengesInLevel: this.getChallengesRequiredForLevel(assessmentResult.assignedLevel),
        updatedAt: serverTimestamp(),
        'stats.assessmentDate': serverTimestamp(),
        'stats.levelsGained': assessmentResult.assignedLevel - 1 // Starting level counts as levels gained
      })

      // Save detailed assessment result for analytics
      await addDoc(collection(db, 'assessmentResults'), {
        userId,
        ...assessmentResult,
        assessmentScores,
        createdAt: serverTimestamp()
      })

      console.log(`Assessment completed for user ${userId}. Assigned level: ${assessmentResult.assignedLevel}`)
    } catch (error) {
      console.error('Error saving assessment result:', error)
      throw new Error('Failed to save assessment result')
    }
  }

  /**
   * Get number of challenges required for a specific level
   * For now, return a placeholder - will be implemented with challenge gating service
   */
  private static getChallengesRequiredForLevel(level: number): number {
    // Placeholder - will be updated when challenge sets are created
    return 50 // Each level requires 50 challenges
  }

  /**
   * Generate level assignment summary for display
   */
  static generateLevelSummary(level: number): {
    title: string
    description: string
    icon: string
    color: string
    estimatedTime: string
  } {
    const summaries = {
      1: {
        title: 'מתחיל חדש',
        description: 'אתה מתחיל את המסע שלך בכדורגל. זמן ללמוד את היסודות!',
        icon: '🌱',
        color: 'bg-green-100 text-green-800',
        estimatedTime: '2-3 שבועות'
      },
      2: {
        title: 'מתחיל מתפתח',
        description: 'יש לך בסיס ראשוני. הגיע הזמן לחזק את הטכניקות הבסיסיות.',
        icon: '🌿',
        color: 'bg-green-200 text-green-800',
        estimatedTime: '3-4 שבועות'
      },
      3: {
        title: 'מתחיל מתקדם',
        description: 'אתה מתקדם יפה! ממשיך ללמוד ולשפר את הכישורים.',
        icon: '🌳',
        color: 'bg-blue-100 text-blue-800',
        estimatedTime: '4-5 שבועות'
      },
      4: {
        title: 'שחקן מתפתח',
        description: 'יש לך בסיס טוב. זמן להתמקד בטכניקות מתקדמות יותר.',
        icon: '⚽',
        color: 'bg-blue-200 text-blue-800',
        estimatedTime: '5-6 שבועות'
      },
      5: {
        title: 'בינוני מתחיל',
        description: 'רמה טובה! אתה מבין את היסודות ומתחיל לפתח סגנון משחק.',
        icon: '🏃‍♂️',
        color: 'bg-indigo-100 text-indigo-800',
        estimatedTime: '6-7 שבועות'
      },
      6: {
        title: 'בינוני',
        description: 'רמה מוצקה! יש לך שליטה טובה ובטחון עם הכדור.',
        icon: '🎯',
        color: 'bg-indigo-200 text-indigo-800',
        estimatedTime: '7-8 שבועות'
      },
      7: {
        title: 'בינוני מתקדם',
        description: 'ביצועים טובים מאוד! אתה מתחיל לחשוב טקטית.',
        icon: '🏆',
        color: 'bg-purple-100 text-purple-800',
        estimatedTime: '8-10 שבועות'
      },
      8: {
        title: 'מתקדם מתחיל',
        description: 'רמה גבוהה! יש לך טכניקה מעולה ובנה משחק טובה.',
        icon: '🌟',
        color: 'bg-purple-200 text-purple-800',
        estimatedTime: '10-12 שבועות'
      },
      9: {
        title: 'מתקדם',
        description: 'מעולה! אתה שחקן מתקדם עם יכולות גבוהות.',
        icon: '💎',
        color: 'bg-yellow-100 text-yellow-800',
        estimatedTime: '12-15 שבועות'
      },
      10: {
        title: 'מומחה מתחיל',
        description: 'יוצא מן הכלל! יש לך כישרון טבעי וטכניקה מצוינת.',
        icon: '👑',
        color: 'bg-yellow-200 text-yellow-800',
        estimatedTime: '15+ שבועות'
      }
    }

    return summaries[level as keyof typeof summaries] || summaries[1]
  }
}
