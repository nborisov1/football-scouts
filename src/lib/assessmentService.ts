/**
 * Assessment Service - New implementation using level-based system
 * Handles initial skill assessment and level assignment with subcollections
 */

import { 
  collection, 
  addDoc, 
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  updateDoc,
  setDoc
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'
import { COLLECTIONS, USER_SUBCOLLECTIONS, STORAGE_PATHS } from '@/constants/challenges'
import { LevelService } from './levelService'
import type { AssessmentChallenge, UserSubmission } from '@/types/level'

export class AssessmentService {
  
  /**
   * Get standardized assessment challenges from Firebase
   */
  static async getAssessmentExercises(): Promise<AssessmentChallenge[]> {
    try {
      const assessmentChallengesRef = collection(db, COLLECTIONS.ASSESSMENT_CHALLENGES)
      // Use simple query without composite index requirement
      const q = query(assessmentChallengesRef, limit(20))
      const snapshot = await getDocs(q)
      
      const challenges: AssessmentChallenge[] = []
      snapshot.forEach(doc => {
        const data = doc.data()
        // Filter active challenges in code instead of query
        if (data.isActive !== false) { // Include if isActive is true or undefined
          challenges.push({ id: doc.id, ...data } as AssessmentChallenge)
        }
      })
      
      // Sort by order in code instead of query
      challenges.sort((a, b) => (a.order || 0) - (b.order || 0))
      
      console.log(`✅ Loaded ${challenges.length} assessment challenges from Firebase`)
      return challenges.slice(0, 10) // Take first 10
      
    } catch (error) {
      console.error('❌ Error loading assessment challenges:', error)
      throw new Error('Failed to load assessment challenges. Please ensure Firebase is properly configured.')
    }
  }


  /**
   * Get single assessment challenge by ID
   */
  static async getAssessmentExerciseById(exerciseId: string): Promise<AssessmentChallenge | null> {
    try {
      const assessmentRef = doc(db, COLLECTIONS.ASSESSMENT_CHALLENGES, exerciseId)
      const assessmentDoc = await getDoc(assessmentRef)
      
      if (assessmentDoc.exists()) {
        return { id: assessmentDoc.id, ...assessmentDoc.data() } as AssessmentChallenge
      }
      
      console.warn(`❌ Assessment challenge not found: ${exerciseId}`)
      return null
      
    } catch (error) {
      console.error('Error loading exercise:', error)
      return null
    }
  }

  /**
   * Submit assessment challenge with video upload - NEW SUBCOLLECTION APPROACH
   */
  static async submitAssessmentChallenge(
    userId: string,
    challengeId: string,
    videoFile: File,
    count: number,
    videoDuration?: number,
    notes?: string
  ): Promise<string> {
    try {
      // Upload user submission video to Firebase Storage
      const timestamp = Date.now()
      const fileName = `assessment_${challengeId}_${timestamp}.${videoFile.name.split('.').pop()}`
      const videoPath = `${STORAGE_PATHS.USER_ASSESSMENTS}/${userId}/${fileName}`
      const storageRef = ref(storage, videoPath)
      
      const uploadResult = await uploadBytes(storageRef, videoFile)
      const videoUrl = await getDownloadURL(uploadResult.ref)
      
      // Auto-calculate score from count and challenge requirements  
      const autoScore = this.calculateVideoScore(challengeId, count)
      
      // Create submission data with all required fields properly set
      const submissionData = {
        challengeId,
        exerciseId: challengeId, // For backwards compatibility
        type: 'assessment' as const,
        videoUrl,
        videoPath,
        videoDuration: videoDuration || 30,
        count: count,
        autoScore: autoScore,
        manualScore: null, // Use null instead of undefined for Firestore compatibility
        totalScore: autoScore,
        status: 'completed' as const,
        submittedAt: serverTimestamp(),
        notes: notes || '',
        attempt: 1 // For now, assuming first attempt
      }

      // Remove any undefined values before submitting to Firestore
      Object.keys(submissionData).forEach(key => {
        if ((submissionData as any)[key] === undefined) {
          delete (submissionData as any)[key];
        }
      });
      
      // Store in user's submissions subcollection
      const submissionsRef = collection(db, COLLECTIONS.USERS, userId, USER_SUBCOLLECTIONS.SUBMISSIONS)
      const docRef = await addDoc(submissionsRef, submissionData)
      
      // Also create a completion record
      const completionData = {
        exerciseId: challengeId,
        challengeId: challengeId,
        type: 'assessment',
        completedAt: serverTimestamp(),
        score: autoScore,
        attempts: 1,
        bestScore: autoScore,
        submissionId: docRef.id
      }
      
      const completionsRef = collection(db, COLLECTIONS.USERS, userId, USER_SUBCOLLECTIONS.COMPLETIONS)
      await setDoc(doc(completionsRef, challengeId), completionData)
      
      console.log('✅ Assessment submission created:', docRef.id)
      return docRef.id
      
    } catch (error) {
      console.error('❌ Error submitting assessment:', error)
      throw new Error(`Failed to submit assessment: ${error}`)
    }
  }

  /**
   * Get user's completed assessment exercises
   */
  static async getCompletedExercises(userId: string): Promise<string[]> {
    try {
      const submissionsRef = collection(db, COLLECTIONS.USERS, userId, USER_SUBCOLLECTIONS.SUBMISSIONS)
      const q = query(
        submissionsRef,
        where('type', '==', 'assessment'),
        where('status', '==', 'completed')
      )
      
      const querySnapshot = await getDocs(q)
      const completedIds: string[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as UserSubmission
        if (data.challengeId) {
          completedIds.push(data.challengeId)
        }
      })
      
      return [...new Set(completedIds)] // Remove duplicates
      
    } catch (error) {
      console.error('Error fetching completed exercises:', error)
      return []
    }
  }

  /**
   * Calculate overall assessment score and assign initial level
   */
  static async completeAssessment(userId: string): Promise<{
    overallScore: number,
    assignedLevel: number,
    success: boolean
  }> {
    try {
      // Get all user's assessment submissions
      const submissions = await this.getUserAssessmentSubmissions(userId)
      
      if (submissions.length === 0) {
        throw new Error('No assessment submissions found')
      }
      
      // Calculate overall score
      const totalScore = submissions.reduce((sum, sub) => sum + sub.totalScore, 0)
      const overallScore = Math.round(totalScore / submissions.length)
      
      // Assign initial level based on score
      const assignedLevel = LevelService.calculateInitialLevel(overallScore)
      
      // Update user document with assessment completion and initial level
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      await updateDoc(userRef, {
        assessmentCompleted: true,
        currentLevel: assignedLevel,
        skillCategory: this.getSkillCategoryFromLevel(assignedLevel),
        levelProgress: 0,
        completedLevelChallenges: [],
        totalChallengesInLevel: 30, // Default
        updatedAt: serverTimestamp()
      })
      
      // Also initialize user progress using LevelService
      const success = await LevelService.initializeUserProgress(userId, overallScore)
      
      if (success) {
        console.log(`✅ Assessment completed for user ${userId}. Score: ${overallScore}, Level: ${assignedLevel}`)
      }
      
      return {
        overallScore,
        assignedLevel,
        success
      }
      
    } catch (error) {
      console.error('Error completing assessment:', error)
      return {
        overallScore: 0,
        assignedLevel: 1,
        success: false
      }
    }
  }

  /**
   * Get user's assessment submissions
   */
  static async getUserAssessmentSubmissions(userId: string): Promise<UserSubmission[]> {
    try {
      const submissionsRef = collection(db, COLLECTIONS.USERS, userId, USER_SUBCOLLECTIONS.SUBMISSIONS)
      const q = query(
        submissionsRef,
        where('type', '==', 'assessment'),
        orderBy('submittedAt', 'desc')
      )
      
      const snapshot = await getDocs(q)
      const submissions: UserSubmission[] = []
      
      snapshot.forEach(doc => {
        submissions.push({ submissionId: doc.id, ...doc.data() } as UserSubmission)
      })
      
      return submissions
      
    } catch (error) {
      console.error('Error getting user assessment submissions:', error)
      return []
    }
  }

  // Helper methods
  private static calculateVideoScore(challengeId: string, count: number): number {
    // Simple scoring algorithm - can be enhanced based on challenge requirements
    const baseScore = Math.min(10, Math.max(1, count / 2))
    return Math.round(baseScore * 10) / 10 // Round to 1 decimal
  }

  private static mapExerciseTypeToCategory(exerciseType: string): 'technical' | 'physical' | 'tactical' {
    const technicalTypes = ['dribbling', 'passing', 'shooting', 'ball-control']
    const physicalTypes = ['fitness', 'agility', 'speed', 'strength']
    const tacticalTypes = ['defending', 'positioning', 'game-intelligence']
    
    if (technicalTypes.includes(exerciseType)) return 'technical'
    if (physicalTypes.includes(exerciseType)) return 'physical'
    if (tacticalTypes.includes(exerciseType)) return 'tactical'
    
    return 'technical' // Default
  }

  private static getUnitForExerciseType(exerciseType: string): string {
    const unitMap: Record<string, string> = {
      'dribbling': 'כדרורים מוצלחים',
      'passing': 'מסירות מדויקות',
      'shooting': 'בעיטות למטרה',
      'ball-control': 'נגיעות בכדור',
      'fitness': 'חזרות',
      'agility': 'שניות',
      'defending': 'הגנות מוצלחות'
    }
    
    return unitMap[exerciseType] || 'חזרות'
  }

  private static getDescriptionForExerciseType(exerciseType: string): string {
    const descMap: Record<string, string> = {
      'dribbling': 'מספר הכדרורים המוצלחים שבוצעו',
      'passing': 'מספר המסירות המדויקות שהגיעו למטרה',
      'shooting': 'מספר הבעיטות שפגעו במטרה',
      'ball-control': 'מספר הנגיעות הרצופות בכדור',
      'fitness': 'מספר החזרות שבוצעו בזמן הנתון',
      'agility': 'הזמן שלקח לסיים את התרגיל',
      'defending': 'מספר ההגנות המוצלחות'
    }
    
    return descMap[exerciseType] || 'הביצוע שהושג בתרגיל'
  }

  private static getSkillCategoryFromLevel(level: number): 'beginner' | 'intermediate' | 'advanced' | 'professional' {
    if (level >= 5) return 'advanced'
    if (level >= 3) return 'intermediate'
    return 'beginner'
  }
}

export default AssessmentService
