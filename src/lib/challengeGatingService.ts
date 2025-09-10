/**
 * Challenge Gating Service - Manages Phase 2 level progression
 * Handles challenge unlocking, performance thresholds, and level advancement
 */

import { 
  collection, 
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import { Challenge, ChallengeSubmission } from '@/types/challenge'
import { UserData } from '@/types/user'
import { ChallengeService } from './challengeService'

export interface LevelChallengeSet {
  level: number
  requiredChallenges: Challenge[]
  totalChallenges: number
  passingScore: number // Minimum score required to count as "completed"
  skillFocus: string[]
  estimatedTimeToComplete: number // in days
}

export interface LevelProgressionResult {
  canAdvance: boolean
  completedChallenges: number
  totalChallenges: number
  missingChallenges: Challenge[]
  belowThresholdChallenges: ChallengeSubmission[]
  nextLevel?: number
  progressPercentage: number
}

export class ChallengeGatingService {
  
  /**
   * Get all required challenges for a specific level
   * Each level has ~50 challenges that must be completed to advance
   */
  static async getRequiredChallengesForLevel(currentLevel: number): Promise<Challenge[]> {
    try {
      // Define level ranges and difficulty mapping
      const levelConfig = this.getLevelConfig(currentLevel)
      
      const challengesQuery = query(
        collection(db, 'challenges'),
        where('status', '==', 'available'),
        where('difficulty', '==', levelConfig.difficulty),
        where('level', '<=', currentLevel), // Only challenges for current level or below
        orderBy('level', 'asc'),
        orderBy('category', 'asc')
      )

      const querySnapshot = await getDocs(challengesQuery)
      const challenges: Challenge[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        challenges.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Challenge)
      })

      // If we don't have enough challenges, fill with additional ones
      if (challenges.length < levelConfig.targetCount) {
        const additionalChallenges = await this.getAdditionalChallenges(
          currentLevel, 
          levelConfig.targetCount - challenges.length
        )
        challenges.push(...additionalChallenges)
      }

      return challenges.slice(0, levelConfig.targetCount)
    } catch (error) {
      console.error('Error getting required challenges for level:', error)
      return []
    }
  }

  /**
   * Get challenges that are currently available to the player
   * (Required for their level and not yet completed with passing score)
   */
  static async getAvailableChallenges(
    userId: string, 
    currentLevel: number
  ): Promise<Challenge[]> {
    try {
      const requiredChallenges = await this.getRequiredChallengesForLevel(currentLevel)
      const playerSubmissions = await ChallengeService.getPlayerSubmissions(userId)
      
      // Get challenges not yet completed with passing score
      const passingScore = this.getPassingScoreForLevel(currentLevel)
      const completedChallengeIds = new Set(
        playerSubmissions
          .filter(sub => sub.totalScore >= passingScore)
          .map(sub => sub.challengeId)
      )

      return requiredChallenges.filter(challenge => 
        !completedChallengeIds.has(challenge.id)
      )
    } catch (error) {
      console.error('Error getting available challenges:', error)
      return []
    }
  }

  /**
   * Check if player can advance to the next level
   */
  static async checkLevelUpEligibility(
    userId: string,
    currentLevel: number
  ): Promise<LevelProgressionResult> {
    try {
      const requiredChallenges = await this.getRequiredChallengesForLevel(currentLevel)
      const playerSubmissions = await ChallengeService.getPlayerSubmissions(userId)
      const passingScore = this.getPassingScoreForLevel(currentLevel)

      // Group submissions by challenge ID (keep best score)
      const bestSubmissions = new Map<string, ChallengeSubmission>()
      playerSubmissions.forEach(submission => {
        const existing = bestSubmissions.get(submission.challengeId)
        if (!existing || submission.totalScore > existing.totalScore) {
          bestSubmissions.set(submission.challengeId, submission)
        }
      })

      // Check which challenges are completed with passing score
      const completedChallenges: Challenge[] = []
      const missingChallenges: Challenge[] = []
      const belowThresholdChallenges: ChallengeSubmission[] = []

      requiredChallenges.forEach(challenge => {
        const submission = bestSubmissions.get(challenge.id)
        
        if (!submission) {
          missingChallenges.push(challenge)
        } else if (submission.totalScore < passingScore) {
          belowThresholdChallenges.push(submission)
        } else {
          completedChallenges.push(challenge)
        }
      })

      const progressPercentage = Math.round(
        (completedChallenges.length / requiredChallenges.length) * 100
      )

      const canAdvance = missingChallenges.length === 0 && belowThresholdChallenges.length === 0

      return {
        canAdvance,
        completedChallenges: completedChallenges.length,
        totalChallenges: requiredChallenges.length,
        missingChallenges,
        belowThresholdChallenges,
        nextLevel: canAdvance ? currentLevel + 1 : undefined,
        progressPercentage
      }
    } catch (error) {
      console.error('Error checking level up eligibility:', error)
      return {
        canAdvance: false,
        completedChallenges: 0,
        totalChallenges: 0,
        missingChallenges: [],
        belowThresholdChallenges: [],
        progressPercentage: 0
      }
    }
  }

  /**
   * Advance player to next level
   */
  static async advancePlayerLevel(userId: string, newLevel: number): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        currentLevel: newLevel,
        levelProgress: 0,
        completedLevelChallenges: [],
        totalChallengesInLevel: await this.getChallengeCountForLevel(newLevel),
        updatedAt: serverTimestamp(),
        'stats.levelsGained': newLevel - 1
      })

      console.log(`Player ${userId} advanced to level ${newLevel}`)
    } catch (error) {
      console.error('Error advancing player level:', error)
      throw new Error('Failed to advance player level')
    }
  }

  /**
   * Get level configuration based on current level
   */
  private static getLevelConfig(level: number): {
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'professional'
    targetCount: number
    skillFocus: string[]
  } {
    if (level <= 10) {
      return {
        difficulty: 'beginner',
        targetCount: 30,
        skillFocus: ['basic-skills', 'ball-control', 'passing']
      }
    } else if (level <= 25) {
      return {
        difficulty: 'intermediate',
        targetCount: 40,
        skillFocus: ['shooting', 'dribbling', 'tactics']
      }
    } else if (level <= 40) {
      return {
        difficulty: 'advanced',
        targetCount: 50,
        skillFocus: ['advanced-tactics', 'finishing', 'speed']
      }
    } else {
      return {
        difficulty: 'professional',
        targetCount: 60,
        skillFocus: ['professional-skills', 'leadership', 'mental-strength']
      }
    }
  }

  /**
   * Get additional challenges if not enough are available for the level
   */
  private static async getAdditionalChallenges(
    level: number, 
    needed: number
  ): Promise<Challenge[]> {
    try {
      // Get challenges from adjacent difficulty levels
      const adjacentDifficulties = level <= 10 
        ? ['beginner', 'intermediate']
        : level <= 25 
        ? ['beginner', 'intermediate', 'advanced']
        : ['intermediate', 'advanced', 'professional']

      const challengesQuery = query(
        collection(db, 'challenges'),
        where('status', '==', 'available'),
        where('difficulty', 'in', adjacentDifficulties),
        orderBy('level', 'asc')
      )

      const querySnapshot = await getDocs(challengesQuery)
      const challenges: Challenge[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        challenges.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Challenge)
      })

      return challenges.slice(0, needed)
    } catch (error) {
      console.error('Error getting additional challenges:', error)
      return []
    }
  }

  /**
   * Get passing score threshold for a level
   */
  private static getPassingScoreForLevel(level: number): number {
    // Higher levels require higher scores to pass
    if (level <= 10) return 60    // 60% to pass
    if (level <= 25) return 70    // 70% to pass
    if (level <= 40) return 80    // 80% to pass
    return 85                     // 85% to pass for highest levels
  }

  /**
   * Get total challenge count for a level
   */
  private static async getChallengeCountForLevel(level: number): Promise<number> {
    const config = this.getLevelConfig(level)
    return config.targetCount
  }

  /**
   * Get level progression summary for dashboard
   */
  static async getLevelProgressionSummary(
    userId: string,
    currentLevel: number
  ): Promise<{
    currentLevel: number
    nextLevel: number
    completedChallenges: number
    totalChallenges: number
    progressPercentage: number
    availableChallenges: number
    estimatedTimeToNext: number
    skillFocus: string[]
  }> {
    try {
      const levelConfig = this.getLevelConfig(currentLevel)
      const eligibility = await this.checkLevelUpEligibility(userId, currentLevel)
      const availableChallenges = await this.getAvailableChallenges(userId, currentLevel)

      // Estimate time to next level based on remaining challenges
      const remainingChallenges = eligibility.totalChallenges - eligibility.completedChallenges
      const estimatedTimeToNext = Math.ceil(remainingChallenges * 0.5) // Assume 2 challenges per day

      return {
        currentLevel,
        nextLevel: currentLevel + 1,
        completedChallenges: eligibility.completedChallenges,
        totalChallenges: eligibility.totalChallenges,
        progressPercentage: eligibility.progressPercentage,
        availableChallenges: availableChallenges.length,
        estimatedTimeToNext,
        skillFocus: levelConfig.skillFocus
      }
    } catch (error) {
      console.error('Error getting level progression summary:', error)
      return {
        currentLevel,
        nextLevel: currentLevel + 1,
        completedChallenges: 0,
        totalChallenges: 0,
        progressPercentage: 0,
        availableChallenges: 0,
        estimatedTimeToNext: 30,
        skillFocus: []
      }
    }
  }
}
