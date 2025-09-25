/**
 * Level Service - Football Scouts Platform
 * Handles level-based progression, challenge assignment, and advancement logic
 */

import { 
  collection, 
  doc,
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'
import { COLLECTIONS, USER_SUBCOLLECTIONS } from '@/constants/challenges'
import type { 
  Level, 
  Challenge, 
  UserProgress, 
  UserSubmission, 
  UserCompletion,
  ChallengeType 
} from '@/types/level'

export class LevelService {
  
  /**
   * Get level definition by level number
   */
  static async getLevel(levelNumber: number): Promise<Level | null> {
    try {
      const levelRef = doc(db, COLLECTIONS.LEVELS, levelNumber.toString())
      const levelDoc = await getDoc(levelRef)
      
      if (!levelDoc.exists()) {
        console.error(`Level ${levelNumber} not found`)
        return null
      }
      
      return { id: levelDoc.id, ...levelDoc.data() } as Level
      
    } catch (error) {
      console.error('Error getting level:', error)
      return null
    }
  }
  
  /**
   * Get all available levels (for admin management)
   */
  static async getAllLevels(): Promise<Level[]> {
    try {
      const levelsRef = collection(db, COLLECTIONS.LEVELS)
      const q = query(levelsRef, orderBy('levelNumber', 'asc'))
      const snapshot = await getDocs(q)
      
      const levels: Level[] = []
      snapshot.forEach(doc => {
        levels.push({ id: doc.id, ...doc.data() } as Level)
      })
      
      return levels
      
    } catch (error) {
      console.error('Error getting all levels:', error)
      return []
    }
  }
  
  /**
   * Get challenges available for a specific level
   */
  static async getLevelChallenges(levelNumber: number): Promise<Challenge[]> {
    try {
      const challengesRef = collection(db, COLLECTIONS.CHALLENGES)
      const q = query(
        challengesRef, 
        where('level', '==', levelNumber),
        where('isActive', '==', true),
        orderBy('type'),
        orderBy('difficulty')
      )
      const snapshot = await getDocs(q)
      
      const challenges: Challenge[] = []
      snapshot.forEach(doc => {
        challenges.push({ id: doc.id, ...doc.data() } as Challenge)
      })
      
      return challenges
      
    } catch (error) {
      console.error('Error getting level challenges:', error)
      return []
    }
  }
  
  /**
   * Get user's current progress
   */
  static async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const progressRef = doc(db, COLLECTIONS.USERS, userId)
      const userDoc = await getDoc(progressRef)
      
      if (!userDoc.exists()) {
        console.error(`User ${userId} not found`)
        return null
      }
      
      const userData = userDoc.data()
      return userData.progress as UserProgress || null
      
    } catch (error) {
      console.error('Error getting user progress:', error)
      return null
    }
  }
  
  /**
   * Get user's completed challenges in current level
   */
  static async getUserCompletions(userId: string): Promise<string[]> {
    try {
      const completionsRef = collection(db, COLLECTIONS.USERS, userId, USER_SUBCOLLECTIONS.SUBMISSIONS)
      const q = query(
        completionsRef,
        where('type', '==', 'challenge'),
        where('status', '==', 'completed')
      )
      const snapshot = await getDocs(q)
      
      const completedChallengeIds: string[] = []
      snapshot.forEach(doc => {
        const data = doc.data() as UserSubmission
        if (data.challengeId && !completedChallengeIds.includes(data.challengeId)) {
          completedChallengeIds.push(data.challengeId)
        }
      })
      
      return completedChallengeIds
      
    } catch (error) {
      console.error('Error getting user completions:', error)
      return []
    }
  }
  
  /**
   * Check if user meets level advancement criteria
   */
  static async checkLevelAdvancement(userId: string): Promise<{
    canAdvance: boolean,
    currentLevel: number,
    nextLevel: number | null,
    progress: {
      completed: number,
      required: number,
      averageScore: number,
      threshold: number
    }
  }> {
    try {
      const userProgress = await this.getUserProgress(userId)
      if (!userProgress) {
        throw new Error('User progress not found')
      }
      
      const currentLevel = await this.getLevel(userProgress.currentLevel)
      if (!currentLevel) {
        throw new Error('Current level not found')
      }
      
      const completedChallenges = await this.getUserCompletions(userId)
      const requiredChallenges = currentLevel.challenges.filter(c => c.required)
      
      // Calculate completion and average score
      const completedCount = completedChallenges.length
      const requiredCount = requiredChallenges.length
      const averageScore = userProgress.currentLevelChallenges.averageScore || 0
      const threshold = currentLevel.requirements.completionThreshold
      
      // Check advancement criteria
      const canAdvance = completedCount >= requiredCount && averageScore >= threshold
      
      return {
        canAdvance,
        currentLevel: userProgress.currentLevel,
        nextLevel: currentLevel.progression.nextLevel,
        progress: {
          completed: completedCount,
          required: requiredCount,
          averageScore,
          threshold
        }
      }
      
    } catch (error) {
      console.error('Error checking level advancement:', error)
      return {
        canAdvance: false,
        currentLevel: 1,
        nextLevel: null,
        progress: { completed: 0, required: 0, averageScore: 0, threshold: 70 }
      }
    }
  }
  
  /**
   * Advance user to next level
   */
  static async advanceUserLevel(userId: string): Promise<boolean> {
    try {
      const advancement = await this.checkLevelAdvancement(userId)
      
      if (!advancement.canAdvance || !advancement.nextLevel) {
        console.log('User does not meet advancement criteria or is at max level')
        return false
      }
      
      // Update user progress
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      await updateDoc(userRef, {
        'progress.currentLevel': advancement.nextLevel,
        'progress.levelProgress': 0,
        'progress.lastLevelUp': serverTimestamp(),
        'progress.readyForLevelUp': false,
        'progress.currentLevelChallenges': {
          required: [],
          completed: [],
          averageScore: 0,
          completionRate: 0
        }
      })
      
      // Award level completion points (basic implementation)
      const currentLevel = await this.getLevel(advancement.currentLevel)
      if (currentLevel) {
        const userProgress = await this.getUserProgress(userId)
        if (userProgress) {
          await updateDoc(userRef, {
            'progress.totalScore': (userProgress.totalScore || 0) + 100 // Default points
          })
        }
      }
      
      console.log(`✅ User ${userId} advanced to level ${advancement.nextLevel}`)
      return true
      
    } catch (error) {
      console.error('Error advancing user level:', error)
      return false
    }
  }
  
  /**
   * Calculate initial level from assessment results
   */
  static calculateInitialLevel(assessmentScore: number): number {
    // Simple algorithm based on assessment score
    if (assessmentScore >= 90) return 5      // Advanced start
    if (assessmentScore >= 80) return 4      // Upper intermediate
    if (assessmentScore >= 70) return 3      // Intermediate
    if (assessmentScore >= 60) return 2      // Lower intermediate
    return 1                                 // Beginner
  }
  
  /**
   * Initialize user progress after assessment
   */
  static async initializeUserProgress(
    userId: string, 
    assessmentScore: number
  ): Promise<boolean> {
    try {
      const initialLevel = this.calculateInitialLevel(assessmentScore)
      const level = await this.getLevel(initialLevel)
      
      if (!level) {
        throw new Error(`Level ${initialLevel} not found`)
      }
      
      const progress: UserProgress = {
        // Assessment Phase
        assessmentCompleted: true,
        assessmentScore,
        initialLevel,
        
        // Current Status
        currentLevel: initialLevel,
        levelProgress: 0,
        totalScore: 0,
        
        // Level Requirements
        currentLevelChallenges: {
          required: level.challenges.filter(c => c.required).map(c => c.challengeId),
          completed: [],
          averageScore: 0,
          completionRate: 0
        },
        
        // Advancement Tracking
        levelUpThreshold: level.requirements.completionThreshold,
        readyForLevelUp: false,
        
        // Activity
        lastActivity: new Date().toISOString(),
        joinDate: new Date().toISOString(),
        totalChallengesCompleted: 0,
        streakDays: 1
      }
      
      // Update user document
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      await updateDoc(userRef, { progress })
      
      console.log(`✅ User ${userId} initialized at level ${initialLevel}`)
      return true
      
    } catch (error) {
      console.error('Error initializing user progress:', error)
      return false
    }
  }
  
  /**
   * Update user progress after challenge completion
   */
  static async updateProgressAfterChallenge(
    userId: string,
    challengeId: string,
    score: number
  ): Promise<void> {
    try {
      const userProgress = await this.getUserProgress(userId)
      if (!userProgress) throw new Error('User progress not found')
      
      // Add to completed challenges if not already completed
      const completed = userProgress.currentLevelChallenges.completed
      if (!completed.includes(challengeId)) {
        completed.push(challengeId)
      }
      
      // Recalculate average score
      const completions = await this.getUserCompletions(userId)
      const scores = await this.getUserChallengeScores(userId)
      const averageScore = scores.length > 0 
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length 
        : 0
      
      // Calculate completion rate
      const requiredCount = userProgress.currentLevelChallenges.required.length
      const completionRate = requiredCount > 0 
        ? (completed.length / requiredCount) * 100 
        : 0
      
      // Update user progress
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      await updateDoc(userRef, {
        'progress.currentLevelChallenges.completed': completed,
        'progress.currentLevelChallenges.averageScore': averageScore,
        'progress.currentLevelChallenges.completionRate': completionRate,
        'progress.totalChallengesCompleted': userProgress.totalChallengesCompleted + 1,
        'progress.lastActivity': serverTimestamp()
      })
      
      // Check if ready for level up
      const advancement = await this.checkLevelAdvancement(userId)
      if (advancement.canAdvance) {
        await updateDoc(userRef, {
          'progress.readyForLevelUp': true
        })
      }
      
    } catch (error) {
      console.error('Error updating progress after challenge:', error)
      throw error
    }
  }
  
  /**
   * Get user's challenge scores for current level
   */
  private static async getUserChallengeScores(userId: string): Promise<number[]> {
    try {
      const submissionsRef = collection(db, COLLECTIONS.USERS, userId, USER_SUBCOLLECTIONS.SUBMISSIONS)
      const q = query(
        submissionsRef,
        where('type', '==', 'challenge'),
        where('status', '==', 'completed')
      )
      const snapshot = await getDocs(q)
      
      const scores: number[] = []
      snapshot.forEach(doc => {
        const data = doc.data() as UserSubmission
        scores.push(data.totalScore)
      })
      
      return scores
      
    } catch (error) {
      console.error('Error getting user challenge scores:', error)
      return []
    }
  }
}

export default LevelService


