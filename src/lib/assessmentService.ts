/**
 * Assessment Service - Uses real Firebase video data for assessments
 * Loads actual football training videos from your videos collection
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
  serverTimestamp 
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'
import { COLLECTIONS } from '@/constants/challenges'

// Assessment challenge interface using real video data
export interface AssessmentChallenge {
  id: string
  title: string
  description: string
  instructions: string
  videoUrl: string // Reference video from Firebase
  exerciseType: string
  skillLevel: string
  ageGroup: string
  duration: number
  requiredEquipment: string[]
  equipment?: string[] // Optional alias for compatibility
  goals: string[]
}

export interface AssessmentSubmission {
  userId: string
  challengeId: string
  videoUrl: string
  videoDuration: number
  autoScore: number // Auto-calculated score
  submittedAt: Date
  totalScore?: number
}

export class AssessmentService {
  
  /**
   * Get real assessment challenges from Firebase videos collection
   */
  static async getAssessmentExercises(): Promise<AssessmentChallenge[]> {
    try {
      
      // Get approved videos from Firebase
      const videosRef = collection(db, COLLECTIONS.VIDEOS)
      const q = query(
        videosRef, 
        where('status', '==', 'approved'),
        limit(10) // Get more videos to choose from
      )
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        return []
      }
      
      const challenges: AssessmentChallenge[] = []
      
      snapshot.forEach((doc) => {
        const data = doc.data()
        
        // Convert Firebase video to assessment challenge
        challenges.push({
          id: doc.id,
          title: data.title || 'אתגר כדורגל',
          description: data.description || 'אתגר אימון כדורגל',
          instructions: data.instructions || `
🎯 הוראות ביצוע:
• צפה בסרטון המדגים
• בצע את התרגיל בדיוק כמו בסרטון
• צלם את עצמך מבצע את התרגיל
• העלה את הסרטון שלך

⏱️ זמן מקסימלי: ${data.duration || 60} שניות`,
          videoUrl: data.videoUrl,
          exerciseType: data.exerciseType || 'general',
          skillLevel: data.skillLevel || 'beginner',
          ageGroup: data.ageGroup || 'adult',
          duration: data.duration || data.expectedDuration || 60,
          requiredEquipment: data.requiredEquipment || [],
          goals: data.goals || []
        })
      })
      
      // Shuffle and pick 5 random challenges for assessment
      const shuffled = challenges.sort(() => 0.5 - Math.random())
      const selectedChallenges = shuffled.slice(0, 5)
      
      return selectedChallenges
      
    } catch (error) {
      console.error('❌ Error loading assessment exercises:', error)
      return []
    }
  }

  /**
   * Get single assessment challenge by ID from Firebase
   */
  static async getAssessmentExerciseById(exerciseId: string): Promise<AssessmentChallenge | null> {
    try {
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
        instructions: data.instructions || 'בצע את התרגיל כפי שמוצג בסרטון',
        videoUrl: data.videoUrl,
        exerciseType: data.exerciseType || 'general',
        skillLevel: data.skillLevel || 'beginner',
        ageGroup: data.ageGroup || 'adult',
        duration: data.duration || data.expectedDuration || 60,
        requiredEquipment: data.requiredEquipment || [],
        goals: data.goals || []
      }
      
    } catch (error) {
      console.error('Error loading exercise:', error)
      return null
    }
  }

  /**
   * Submit assessment challenge with video upload
   */
  static async submitAssessmentChallenge(
    userId: string,
    challengeId: string,
    videoFile: File,
    count: number, // The count they achieved
    videoDuration?: number,
    notes?: string
  ): Promise<string> {
    try {
      
      // Upload user submission video to Firebase Storage (simplified)
      const timestamp = Date.now()
      const fileName = `assessment_${challengeId}_${timestamp}.${videoFile.name.split('.').pop()}`
      const videoPath = `assessments/${userId}/${fileName}`
      const storageRef = ref(storage, videoPath)
      
      const uploadResult = await uploadBytes(storageRef, videoFile)
      const videoUrl = await getDownloadURL(uploadResult.ref)
      
      // Auto-calculate score from video duration and challenge requirements  
      const autoScore = this.calculateVideoScore(challengeId, videoDuration || 30)
      
      // Save assessment submission with user progress
      const submissionData = {
        userId,
        challengeId,
        videoUrl,
        videoPath,
        videoDuration: videoDuration || 30,
        count: count, // The actual count they achieved
        autoScore: Math.min(10, Math.max(1, count / 2)), // Simple score based on count
        totalScore: autoScore,
        notes: notes || '',
        submittedAt: serverTimestamp(),
        type: 'assessment',
        status: 'completed'
      }
      
      // Store in simple assessments collection
      const assessmentsRef = collection(db, 'assessments')
      const docRef = await addDoc(assessmentsRef, submissionData)
      
      return docRef.id
      
    } catch (error) {
      console.error('❌ Error submitting assessment:', error)
      throw new Error(`Failed to submit assessment: ${error}`)
    }
  }

  /**
   * Get player's assessment submissions (simplified)
   */
  static async getPlayerAssessmentSubmissions(userId: string): Promise<AssessmentSubmission[]> {
    try {
      const submissionsRef = collection(db, 'assessments')
      const q = query(
        submissionsRef,
        where('userId', '==', userId),
        where('type', '==', 'assessment'),
        orderBy('submittedAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const submissions: AssessmentSubmission[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        submissions.push({
          userId: data.userId,
          challengeId: data.challengeId,
          videoUrl: data.videoUrl,
          videoDuration: data.videoDuration || 30,
          autoScore: data.autoScore || data.totalScore || 5.0,
          submittedAt: data.submittedAt.toDate(),
          totalScore: data.totalScore || data.autoScore || 5.0
        })
      })
      
      return submissions
      
    } catch (error) {
      console.error('Error fetching assessment submissions:', error)
      throw new Error('Failed to fetch assessment submissions')
    }
  }

  /**
   * Get completed exercise IDs for a user
   */
  static async getCompletedExercises(userId: string): Promise<string[]> {
    try {
      const submissionsRef = collection(db, 'assessments')
      const q = query(
        submissionsRef,
        where('userId', '==', userId),
        where('type', '==', 'assessment'),
        where('status', '==', 'completed')
      )
      
      const querySnapshot = await getDocs(q)
      const completedIds: string[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
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
   * Calculate simple level from assessment submissions
   */
  static calculatePlayerLevel(submissions: AssessmentSubmission[]): number {
    if (submissions.length === 0) return 1
    
    // Calculate average score from all submissions
    const averageScore = submissions.reduce((sum, sub) => sum + (sub.totalScore || 0), 0) / submissions.length
    
    // Simple mapping: score to level (1-10)
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
   * Calculate video score based on duration (simple scoring)
   */
  private static calculateVideoScore(challengeId: string, videoDuration: number): number {
    // Simple scoring based on video duration
    let score = 5.0
    
    if (videoDuration >= 20 && videoDuration <= 120) {
      score = 6.0 + (Math.random() * 3.0) // 6-9 for reasonable duration
    } else if (videoDuration >= 10) {
      score = 4.0 + (Math.random() * 3.0) // 4-7 for short videos  
    } else {
      score = 2.0 + (Math.random() * 3.0) // 2-5 for very short videos
    }
    
    return Math.round(score * 10) / 10
  }
}
