/**
 * Exercise Service - Fetch real exercises from Firebase
 * Better UX flow with random exercise selection
 */

import { 
  collection, 
  getDocs,
  query,
  where,
  limit,
  orderBy
} from 'firebase/firestore'
import { db } from './firebase'
import { COLLECTIONS, CHALLENGE_TYPES, CHALLENGE_TYPE_LABELS } from '@/constants/challenges'

export interface FirebaseExercise {
  id: string
  title: string
  description: string
  instructions: string
  challengeType: string
  skillLevel: string
  ageGroup: string
  duration: number
  equipment: string[]
  videoUrl?: string
  thumbnailUrl?: string
  metrics: Array<{
    id: string
    name: string
    unit: string
    description: string
    targetValue?: number
  }>
}

export interface ExerciseSubmission {
  userId: string
  exerciseId: string
  videoUrl: string
  metrics: Record<string, number>
  submittedAt: Date
  score: number
}

export class ExerciseService {
  
  /**
   * Get exercises from Firebase videos collection
   */
  static async getAssessmentExercises(): Promise<FirebaseExercise[]> {
    try {
      const videosRef = collection(db, COLLECTIONS.VIDEOS)
      const q = query(videosRef, where('status', '==', 'approved'), limit(20))
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        throw new Error('No approved videos found in Firebase. Please ensure videos are properly uploaded and approved.')
      }
      
      const allVideos: FirebaseExercise[] = []
      
      snapshot.forEach((doc) => {
        const data = doc.data()
        
        // Validate required fields
        if (!data.title || !data.description || !data.exerciseType) {
          console.warn(`Skipping incomplete video: ${doc.id}`)
          return
        }
        
        allVideos.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          instructions: data.instructions || this.getDefaultInstructions(data.exerciseType),
          challengeType: data.exerciseType,
          skillLevel: data.skillLevel || 'beginner',
          ageGroup: data.ageGroup || 'adult',
          duration: data.duration || data.expectedDuration || 60,
          equipment: data.requiredEquipment || [],
          videoUrl: data.videoUrl,
          thumbnailUrl: data.thumbnailUrl,
          metrics: this.getMetricsForExerciseType(data.exerciseType)
        })
      })
      
      if (allVideos.length === 0) {
        throw new Error('No valid exercises found. Please check video data quality.')
      }
      
      // Shuffle and pick 5 random exercises
      const shuffled = allVideos.sort(() => 0.5 - Math.random())
      const selectedExercises = shuffled.slice(0, 5)
      
      console.log(`✅ Loaded ${selectedExercises.length} assessment exercises from Firebase`)
      return selectedExercises
      
    } catch (error) {
      console.error('❌ Error loading assessment exercises:', error)
      throw error
    }
  }
  
  /**
   * Submit exercise with video and metrics
   */
  static async submitExercise(
    userId: string,
    exerciseId: string,
    videoFile: File,
    metrics: Record<string, number>
  ): Promise<string> {
    try {
      // Upload video to Firebase Storage
      const { ref: storageRef, uploadBytes, getDownloadURL } = await import('firebase/storage')
      const { storage } = await import('./firebase')
      
      const timestamp = Date.now()
      const fileName = `exercise_${exerciseId}_${timestamp}.${videoFile.name.split('.').pop()}`
      const videoPath = `assessments/${userId}/${fileName}`
      const fileRef = storageRef(storage, videoPath)
      
      const uploadResult = await uploadBytes(fileRef, videoFile)
      const videoUrl = await getDownloadURL(uploadResult.ref)
      
      // Calculate score from metrics
      const score = this.calculateScore(metrics)
      
      // Save submission to Firebase
      const { addDoc, serverTimestamp } = await import('firebase/firestore')
      const submissionsRef = collection(db, COLLECTIONS.ASSESSMENTS)
      
      const submissionData = {
        userId,
        exerciseId,
        videoUrl,
        videoPath,
        metrics,
        score,
        submittedAt: serverTimestamp(),
        type: 'exercise_submission'
      }
      
      const docRef = await addDoc(submissionsRef, submissionData)
      console.log(`✅ Exercise submitted successfully`)
      
      return docRef.id
      
    } catch (error) {
      console.error('❌ Error submitting exercise:', error)
      throw new Error(`Failed to submit exercise: ${error}`)
    }
  }
  
  /**
   * Get default instructions for challenge type
   */
  private static getDefaultInstructions(challengeType: string): string {
    const instructions = {
      [CHALLENGE_TYPES.BALL_CONTROL]: `🎯 הוראות ביצוע:
• החזק את הכדור באוויר למשך דקה שלמה
• השתמש ברגליים, ברך, ראש - כל חלק בגוף חוץ מידיים
• נסה לא לתת לכדור לגעת בקרקע
• ספור כמה נגיעות הצלחת`,
      
      [CHALLENGE_TYPES.PASSING]: `🎯 הוראות ביצוע:
• בצע 10 מסירות מדויקות לקיר ממרחק 5 מטר
• נסה לפגוע באותו מקום בקיר בכל מסירה
• השתמש ברגל החזקה שלך
• ספור כמה מסירות מדויקות הצלחת`,
      
      [CHALLENGE_TYPES.SHOOTING]: `🎯 הוראות ביצוע:
• בצע 5 בעיטות למטרה ממרחק 10 מטר
• נסה לפגוע במטרה (שער, קיר עם סימון)
• השתמש בטכניקה נכונה
• ספור כמה בעיטות מדויקות הצלחת`,
      
      [CHALLENGE_TYPES.DRIBBLING]: `🎯 הוראות ביצוע:
• הצב 5 קונוסים במרחק 2 מטר זה מזה
• בצע כדרור זיג-זג בין הקונוסים
• נסה לא לפגוע בקונוסים
• מדוד את הזמן שלוקח לך להשלים`,
      
      [CHALLENGE_TYPES.FITNESS]: `🎯 הוראות ביצוע:
• רוץ ספרינט למרחק 20 מטר
• מדוד את הזמן שלוקח לך
• נח דקה וחזור על התרגיל
• רשום את הזמן הטוב ביותר`
    }
    
    return instructions[challengeType] || 'בצע את התרגיל לפי ההוראות המוצגות'
  }
  
  /**
   * Get metrics for each challenge type
   */
  private static getMetricsForChallengeType(challengeType: string) {
    const metrics = {
      [CHALLENGE_TYPES.BALL_CONTROL]: [
        { id: 'touches', name: 'מספר נגיעות', unit: 'נגיעות', description: 'כמה נגיעות הצלחת', targetValue: 30 }
      ],
      [CHALLENGE_TYPES.PASSING]: [
        { id: 'accurate_passes', name: 'מסירות מדויקות', unit: 'מסירות', description: 'מתוך 10 מסירות', targetValue: 7 }
      ],
      [CHALLENGE_TYPES.SHOOTING]: [
        { id: 'goals', name: 'בעיטות במטרה', unit: 'בעיטות', description: 'מתוך 5 בעיטות', targetValue: 3 }
      ],
      [CHALLENGE_TYPES.DRIBBLING]: [
        { id: 'time', name: 'זמן', unit: 'שניות', description: 'זמן להשלמת המסלול', targetValue: 15 },
        { id: 'cones_hit', name: 'קונוסים שנפגעו', unit: 'קונוסים', description: 'כמה קונוסים נפגעו', targetValue: 0 }
      ],
      [CHALLENGE_TYPES.FITNESS]: [
        { id: 'time', name: 'זמן ספרינט', unit: 'שניות', description: 'זמן ל-20 מטר', targetValue: 4 }
      ]
    }
    
    return metrics[challengeType] || []
  }
  
  
  /**
   * Get metrics for each exercise type based on your video data
   */
  private static getMetricsForExerciseType(exerciseType: string) {
    const metrics: Record<string, Array<{id: string, name: string, unit: string, description: string, targetValue: number}>> = {
      'defending': [
        { id: 'tackles', name: 'הגנות מוצלחות', unit: 'הגנות', description: 'מספר ההגנות המוצלחות', targetValue: 5 },
        { id: 'interceptions', name: 'יירוטים', unit: 'יירוטים', description: 'מספר היירוטים', targetValue: 3 }
      ],
      'attacking': [
        { id: 'goals', name: 'בעיטות למטרה', unit: 'בעיטות', description: 'מספר הבעיטות למטרה', targetValue: 7 },
        { id: 'shots', name: 'נסיונות', unit: 'נסיונות', description: 'סך הנסיונות', targetValue: 10 }
      ],
      'passing': [
        { id: 'accurate_passes', name: 'מסירות מדויקות', unit: 'מסירות', description: 'מספר המסירות המדויקות', targetValue: 8 }
      ],
      'dribbling': [
        { id: 'successful_dribbles', name: 'כדרורים מוצלחים', unit: 'כדרורים', description: 'מספר הכדרורים המוצלחים', targetValue: 6 }
      ],
      'fitness': [
        { id: 'time', name: 'זמן', unit: 'שניות', description: 'זמן ביצוע', targetValue: 30 }
      ]
    }
    
    return metrics[exerciseType] || [
      { id: 'performance', name: 'ביצוע כללי', unit: 'נקודות', description: 'הערכת הביצוע הכללי', targetValue: 8 }
    ]
  }

  /**
   * Calculate score from metrics
   */
  private static calculateScore(metrics: Record<string, number>): number {
    const values = Object.values(metrics)
    if (values.length === 0) return 5.0
    
    // Simple average with some randomness for realism
    const average = values.reduce((sum, value) => sum + value, 0) / values.length
    const score = Math.min(Math.max(average + (Math.random() - 0.5), 1), 10)
    
    return Math.round(score * 10) / 10
  }
}
