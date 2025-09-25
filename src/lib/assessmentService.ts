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
   * Get standardized assessment challenges (5 challenges for skill evaluation)
   */
  static async getAssessmentExercises(): Promise<AssessmentChallenge[]> {
    try {
      const assessmentChallengesRef = collection(db, COLLECTIONS.ASSESSMENT_CHALLENGES)
      const q = query(
        assessmentChallengesRef,
        where('isActive', '==', true),
        orderBy('order', 'asc'),
        limit(5)
      )
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        console.warn('⚠️ No assessment challenges found, falling back to legacy method')
        return this.getLegacyAssessmentExercises()
      }
      
      const challenges: AssessmentChallenge[] = []
      snapshot.forEach(doc => {
        challenges.push({ id: doc.id, ...doc.data() } as AssessmentChallenge)
      })
      
      return challenges
      
    } catch (error) {
      console.error('❌ Error loading assessment challenges:', error)
      // Fall back to legacy method
      return this.getLegacyAssessmentExercises()
    }
  }

  /**
   * Legacy method: Get assessment from videos collection (backwards compatibility)
   */
  static async getLegacyAssessmentExercises(): Promise<AssessmentChallenge[]> {
    try {
      // Get approved videos from Firebase
      const videosRef = collection(db, COLLECTIONS.VIDEOS)
      const q = query(
        videosRef, 
        where('status', '==', 'approved'),
        limit(10)
      )
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        return []
      }
      
      const challenges: AssessmentChallenge[] = []
      let order = 1
      
      snapshot.forEach((doc) => {
        const data = doc.data()
        
        // Convert Firebase video to assessment challenge format
        challenges.push({
          id: doc.id,
          title: data.title || 'אתגר כדורגל',
          description: data.description || 'אתגר אימון כדורגל',
          instructions: data.instructions ? [data.instructions] : [
            'צפה בסרטון המדגים את התרגיל',
            `הכן את הציוד הנדרש: ${(data.requiredEquipment || []).join(', ')}`,
            'בצע את התרגיל לפי ההוראות',
            'צלם את עצמך מבצע את התרגיל',
            'העלה את הסרטון ורשום את התוצאות'
          ],
          type: 'assessment',
          category: this.mapExerciseTypeToCategory(data.exerciseType || 'general'),
          order: order++,
          metrics: {
            type: 'count',
            target: 10,
            passingScore: 7,
            excellentScore: 15,
            unit: this.getUnitForExerciseType(data.exerciseType || 'general'),
            description: this.getDescriptionForExerciseType(data.exerciseType || 'general')
          },
          demonstrationVideoUrl: data.videoUrl || data.url || '',
          thumbnailUrl: data.thumbnailUrl,
          equipment: data.requiredEquipment || data.equipment || [],
          spaceRequired: '5x5 meters',
          duration: data.duration || data.expectedDuration || 60,
          maxAttempts: 3,
          createdBy: data.uploadedBy || 'system',
          isActive: true,
          createdAt: data.createdAt || new Date().toISOString()
        } as AssessmentChallenge)
      })
      
      return challenges.slice(0, 5)
      
    } catch (error) {
      console.error('❌ Error loading legacy assessment challenges:', error)
      return []
    }
  }

  /**
   * Get single assessment challenge by ID
   */
  static async getAssessmentExerciseById(exerciseId: string): Promise<AssessmentChallenge | null> {
    try {
      // Try new assessment challenges collection first
      const assessmentRef = doc(db, COLLECTIONS.ASSESSMENT_CHALLENGES, exerciseId)
      const assessmentDoc = await getDoc(assessmentRef)
      
      if (assessmentDoc.exists()) {
        return { id: assessmentDoc.id, ...assessmentDoc.data() } as AssessmentChallenge
      }
      
      // Fall back to videos collection for backwards compatibility
      const videoRef = doc(db, COLLECTIONS.VIDEOS, exerciseId)
      const videoDoc = await getDoc(videoRef)
      
      if (!videoDoc.exists()) {
        return null
      }
      
      const data = videoDoc.data()
      
      return {
        id: videoDoc.id,
        title: data.title || 'אתגר כדורגל',
        description: data.description || 'אתגר אימון כדורגל',
        instructions: data.instructions ? [data.instructions] : ['בצע את התרגיל כפי שמוצג בסרטון'],
        type: 'assessment',
        category: this.mapExerciseTypeToCategory(data.exerciseType || 'general'),
        order: 1,
        metrics: {
          type: 'count',
          target: 10,
          passingScore: 7,
          excellentScore: 15,
          unit: this.getUnitForExerciseType(data.exerciseType || 'general'),
          description: this.getDescriptionForExerciseType(data.exerciseType || 'general')
        },
        demonstrationVideoUrl: data.videoUrl,
        equipment: data.requiredEquipment || [],
        spaceRequired: '5x5 meters',
        duration: data.duration || data.expectedDuration || 60,
        maxAttempts: 3,
        createdBy: data.uploadedBy || 'system',
        isActive: true,
        createdAt: data.createdAt || new Date().toISOString()
      } as AssessmentChallenge
      
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
      
      // Create submission data
      const submissionData: Omit<UserSubmission, 'submissionId'> = {
        challengeId,
        exerciseId: challengeId, // For backwards compatibility
        type: 'assessment',
        videoUrl,
        videoPath,
        videoDuration: videoDuration || 30,
        count: count,
        autoScore: autoScore,
        manualScore: undefined,
        totalScore: autoScore,
        status: 'completed',
        submittedAt: new Date().toISOString(),
        notes: notes || '',
        attempt: 1 // For now, assuming first attempt
      }
      
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
