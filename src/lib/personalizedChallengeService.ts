/**
 * Personalized Challenge Service
 * Recommends challenges based on user level, age, position, and progress
 */

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'
import { COLLECTIONS, USER_SUBCOLLECTIONS, STORAGE_PATHS } from '@/constants/challenges'
import { 
  SKILL_LEVELS, 
  AGE_GROUPS, 
  POSITIONS, 
  CHALLENGE_TYPES,
  isPositionSuitableForChallenge,
  getRequiredEquipment,
  getSuggestedGoals
} from '@/constants/challenges'
import type { UserData } from '@/types/user'
import type { PersonalizedChallenge, ChallengeSubmission, ChallengeProgress } from '@/types/challenge'

export interface ChallengeRecommendationCriteria {
  userId: string
  currentLevel: number
  skillCategory: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  age: number
  position: string
  completedChallenges: string[]
  weakAreas?: string[] // Areas needing improvement from assessments
  preferredTypes?: string[] // User preferences
}

export interface PersonalizedChallengeSet {
  daily: PersonalizedChallenge[]
  weekly: PersonalizedChallenge[]
  monthly: PersonalizedChallenge[]
  recommended: PersonalizedChallenge[]
}

export class PersonalizedChallengeService {
  
  /**
   * Get personalized challenges for a user
   */
  static async getPersonalizedChallenges(user: UserData): Promise<PersonalizedChallengeSet> {
    try {
      console.log('🎯 Getting personalized challenges for user:', user.uid)
      
      const criteria: ChallengeRecommendationCriteria = {
        userId: user.uid,
        currentLevel: user.currentLevel || 1,
        skillCategory: user.skillCategory || 'beginner',
        age: user.age || 16,
        position: user.position || 'midfielder',
        completedChallenges: user.completedLevelChallenges || [],
        weakAreas: await this.getUserWeakAreas(user.uid),
        preferredTypes: await this.getUserPreferences(user.uid)
      }

      // Get available challenges from database
      const availableChallenges = await this.getAvailableChallenges(criteria)
      
      // Filter and categorize challenges
      const dailyChallenges = this.selectDailyChallenges(availableChallenges, criteria)
      const weeklyChallenges = this.selectWeeklyChallenges(availableChallenges, criteria)
      const monthlyChallenges = this.selectMonthlyChallenges(availableChallenges, criteria)
      const recommendedChallenges = this.selectRecommendedChallenges(availableChallenges, criteria)

      return {
        daily: dailyChallenges,
        weekly: weeklyChallenges,
        monthly: monthlyChallenges,
        recommended: recommendedChallenges
      }
      
    } catch (error) {
      console.error('❌ Error getting personalized challenges:', error)
      throw error
    }
  }

  /**
   * Get available challenges from database
   */
  private static async getAvailableChallenges(criteria: ChallengeRecommendationCriteria): Promise<PersonalizedChallenge[]> {
    try {
      console.log('🔍 Querying challenges collection...')
      const challengesRef = collection(db, COLLECTIONS.CHALLENGES)
      const q = query(
        challengesRef,
        where('isActive', '==', true),
        where('status', '==', 'approved'),
        limit(100) // Get more challenges for better variety
      )
      
      const snapshot = await getDocs(q)
      const challenges: PersonalizedChallenge[] = []
      
      console.log(`📊 Found ${snapshot.size} active challenges in collection`)
      
      snapshot.forEach(doc => {
        const data = doc.data()
        
        // Convert challenge data to PersonalizedChallenge format
        const challenge: PersonalizedChallenge = {
          id: doc.id,
          title: data.title || 'אתגר ללא שם',
          description: data.description || data.instructions || 'אין תיאור זמין',
          category: data.category || 'training-exercise',
          challengeType: data.exerciseType || 'general',
          skillLevel: data.skillLevel || 'beginner',
          targetAudience: data.targetAudience || 'amateur',
          ageGroups: data.ageGroup ? [data.ageGroup] : ['adult'], // Convert single ageGroup to array
          positions: data.positionSpecific && data.positionSpecific.length > 0 ? data.positionSpecific : ['all'],
          difficulty: data.difficultyLevel || 5,
          duration: data.expectedDuration || 30,
          points: data.points || Math.max(10, Math.min(100, (data.difficultyLevel || 5) * 10)),
          videoUrl: data.videoUrl,
          thumbnailUrl: data.thumbnailUrl,
          instructions: data.instructions || '',
          equipment: data.requiredEquipment || [],
          goals: data.goals || [],
          metrics: data.metrics || this.generateMetricsForChallenge(data.exerciseType || 'general'),
          isLevelSpecific: data.isLevelSpecific || false,
          requiredLevel: data.requiredLevel || 1,
          // Personalization fields
          relevanceScore: 0,
          personalizedReason: '',
          estimatedCompletion: this.estimateCompletionTime(data.difficultyLevel || 5, criteria.skillCategory),
          prerequisites: data.prerequisites || []
        }
        
        // Calculate relevance score
        challenge.relevanceScore = this.calculateRelevanceScore(challenge, criteria)
        challenge.personalizedReason = this.generatePersonalizedReason(challenge, criteria)
        
        console.log(`✅ Processed challenge: ${challenge.title} (score: ${challenge.relevanceScore})`)
        challenges.push(challenge)
      })
      
      console.log(`🎯 Total challenges processed: ${challenges.length}`)
      
      // Sort by relevance score
      const sortedChallenges = challenges.sort((a, b) => b.relevanceScore - a.relevanceScore)
      console.log(`🏆 Top challenge: ${sortedChallenges[0]?.title} (score: ${sortedChallenges[0]?.relevanceScore})`)
      
      return sortedChallenges
      
    } catch (error) {
      console.error('❌ Error fetching challenges:', error)
      return []
    }
  }

  /**
   * Calculate relevance score for a challenge
   */
  private static calculateRelevanceScore(challenge: PersonalizedChallenge, criteria: ChallengeRecommendationCriteria): number {
    let score = 0
    
    // Level appropriateness (30 points)
    if (challenge.requiredLevel <= criteria.currentLevel) {
      score += 30
      if (challenge.requiredLevel === criteria.currentLevel) {
        score += 10 // Perfect level match
      }
    }
    
    // Position suitability (25 points)
    if (challenge.positions.includes('all') || challenge.positions.includes(criteria.position)) {
      score += 25
    } else if (isPositionSuitableForChallenge(criteria.position, challenge.challengeType)) {
      score += 15
    }
    
    // Age appropriateness (20 points)
    const userAgeGroup = this.getAgeGroupForAge(criteria.age)
    if (challenge.ageGroups.includes(userAgeGroup) || challenge.ageGroups.length === 0) {
      score += 20
    }
    
    // Skill level match (15 points)
    if (challenge.skillLevel === criteria.skillCategory) {
      score += 15
    } else if (this.isSkillLevelClose(challenge.skillLevel, criteria.skillCategory)) {
      score += 8
    }
    
    // Weak areas targeting (10 points)
    if (criteria.weakAreas && criteria.weakAreas.includes(challenge.challengeType)) {
      score += 10
    }
    
    // User preferences (5 points)
    if (criteria.preferredTypes && criteria.preferredTypes.includes(challenge.challengeType)) {
      score += 5
    }
    
    // Novelty bonus (not completed yet)
    if (!criteria.completedChallenges.includes(challenge.id)) {
      score += 5
    }
    
    return Math.max(0, Math.min(100, score))
  }

  /**
   * Generate personalized reason for recommendation
   */
  private static generatePersonalizedReason(challenge: PersonalizedChallenge, criteria: ChallengeRecommendationCriteria): string {
    const reasons = []
    
    if (challenge.requiredLevel === criteria.currentLevel) {
      reasons.push('מתאים לרמה שלך')
    }
    
    if (challenge.positions.includes(criteria.position)) {
      reasons.push(`מותאם לעמדת ${criteria.position}`)
    }
    
    if (criteria.weakAreas && criteria.weakAreas.includes(challenge.challengeType)) {
      reasons.push('יעזור לשפר נקודות חולשה')
    }
    
    if (challenge.skillLevel === criteria.skillCategory) {
      reasons.push('מתאים לרמת הכישורים שלך')
    }
    
    if (reasons.length === 0) {
      reasons.push('מומלץ עבורך')
    }
    
    return reasons.join(' • ')
  }

  /**
   * Select daily challenges (1-2 quick challenges)
   */
  private static selectDailyChallenges(challenges: PersonalizedChallenge[], criteria: ChallengeRecommendationCriteria): PersonalizedChallenge[] {
    return challenges
      .filter(c => c.duration <= 15 && c.difficulty <= 6) // Quick and not too hard
      .slice(0, 2)
  }

  /**
   * Select weekly challenges (2-3 moderate challenges)
   */
  private static selectWeeklyChallenges(challenges: PersonalizedChallenge[], criteria: ChallengeRecommendationCriteria): PersonalizedChallenge[] {
    return challenges
      .filter(c => c.duration > 15 && c.duration <= 45 && c.difficulty >= 4 && c.difficulty <= 8)
      .slice(0, 3)
  }

  /**
   * Select monthly challenges (1-2 advanced challenges)
   */
  private static selectMonthlyChallenges(challenges: PersonalizedChallenge[], criteria: ChallengeRecommendationCriteria): PersonalizedChallenge[] {
    return challenges
      .filter(c => c.duration > 30 && c.difficulty >= 6)
      .slice(0, 2)
  }

  /**
   * Select general recommended challenges
   */
  private static selectRecommendedChallenges(challenges: PersonalizedChallenge[], criteria: ChallengeRecommendationCriteria): PersonalizedChallenge[] {
    return challenges.slice(0, 6)
  }

  /**
   * Submit challenge with video and metrics
   */
  static async submitChallenge(
    userId: string,
    challengeId: string,
    videoFile: File,
    metrics: Record<string, number>,
    completionTime: number,
    notes?: string
  ): Promise<ChallengeSubmission> {
    try {
      console.log('📤 Submitting challenge:', challengeId)
      
      // Upload video to storage
      const videoFileName = `challenge_${challengeId}_${Date.now()}.${videoFile.name.split('.').pop()}`
      const videoRef = ref(storage, `${STORAGE_PATHS.USER_SUBMISSIONS}/${userId}/${videoFileName}`)
      
      const uploadResult = await uploadBytes(videoRef, videoFile)
      const videoUrl = await getDownloadURL(uploadResult.ref)
      
      // Create submission document
      const submissionData: Omit<ChallengeSubmission, 'id'> = {
        userId,
        challengeId,
        videoUrl,
        videoFileName,
        metrics,
        completionTime,
        notes: notes || '',
        submittedAt: new Date(),
        status: 'submitted',
        reviewed: false,
        score: null,
        feedback: null
      }
      
      // Add to user's submissions subcollection
      const userSubmissionsRef = collection(db, `${COLLECTIONS.USERS}/${userId}/${USER_SUBCOLLECTIONS.SUBMISSIONS}`)
      const docRef = await addDoc(userSubmissionsRef, {
        ...submissionData,
        submittedAt: serverTimestamp()
      })
      
      // Update user's completed challenges
      await this.updateUserProgress(userId, challengeId)
      
      console.log('✅ Challenge submitted successfully:', docRef.id)
      
      return {
        id: docRef.id,
        ...submissionData
      }
      
    } catch (error) {
      console.error('❌ Error submitting challenge:', error)
      throw error
    }
  }

  /**
   * Update user progress after challenge completion
   */
  private static async updateUserProgress(userId: string, challengeId: string): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      const userDoc = await getDoc(userRef)
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        const completedChallenges = userData.completedLevelChallenges || []
        
        if (!completedChallenges.includes(challengeId)) {
          await updateDoc(userRef, {
            completedLevelChallenges: [...completedChallenges, challengeId],
            levelProgress: (userData.levelProgress || 0) + 1,
            updatedAt: serverTimestamp()
          })
        }
      }
    } catch (error) {
      console.error('❌ Error updating user progress:', error)
    }
  }

  /**
   * Get user's weak areas from assessment results
   */
  private static async getUserWeakAreas(userId: string): Promise<string[]> {
    try {
      // Get assessment results from user subcollection
      const assessmentsRef = collection(db, `${COLLECTIONS.USERS}/${userId}/${USER_SUBCOLLECTIONS.ASSESSMENTS}`)
      const q = query(assessmentsRef, orderBy('submittedAt', 'desc'), limit(1))
      const snapshot = await getDocs(q)
      
      if (!snapshot.empty) {
        const latestAssessment = snapshot.docs[0].data()
        const scores = latestAssessment.scores || {}
        
        // Find areas with scores below average
        const weakAreas = []
        const averageScore = Object.values(scores).reduce((sum: number, score: any) => sum + score, 0) / Object.keys(scores).length
        
        for (const [area, score] of Object.entries(scores)) {
          if (typeof score === 'number' && score < averageScore * 0.8) { // 20% below average
            weakAreas.push(area)
          }
        }
        
        return weakAreas
      }
      
      return []
    } catch (error) {
      console.error('❌ Error getting weak areas:', error)
      return []
    }
  }

  /**
   * Get user preferences (can be expanded later)
   */
  private static async getUserPreferences(userId: string): Promise<string[]> {
    // For now, return empty array - can be expanded with user preference system
    return []
  }

  // Helper methods
  private static getApplicableSkillLevels(userSkill: string): string[] {
    const levels = [SKILL_LEVELS.BEGINNER, SKILL_LEVELS.INTERMEDIATE, SKILL_LEVELS.ADVANCED, SKILL_LEVELS.PROFESSIONAL]
    const userIndex = levels.indexOf(userSkill)
    
    if (userIndex === -1) return [SKILL_LEVELS.BEGINNER]
    
    // Include current level and one level above/below
    const result = [levels[userIndex]]
    if (userIndex > 0) result.push(levels[userIndex - 1])
    if (userIndex < levels.length - 1) result.push(levels[userIndex + 1])
    
    return result
  }

  private static getAgeGroupForAge(age: number): string {
    if (age <= 8) return AGE_GROUPS.U8
    if (age <= 10) return AGE_GROUPS.U10
    if (age <= 12) return AGE_GROUPS.U12
    if (age <= 14) return AGE_GROUPS.U14
    if (age <= 16) return AGE_GROUPS.U16
    if (age <= 18) return AGE_GROUPS.U18
    if (age <= 21) return AGE_GROUPS.U21
    return AGE_GROUPS.ADULT
  }

  private static isSkillLevelClose(level1: string, level2: string): boolean {
    const levels = [SKILL_LEVELS.BEGINNER, SKILL_LEVELS.INTERMEDIATE, SKILL_LEVELS.ADVANCED, SKILL_LEVELS.PROFESSIONAL]
    const index1 = levels.indexOf(level1)
    const index2 = levels.indexOf(level2)
    
    return Math.abs(index1 - index2) <= 1
  }

  private static estimateCompletionTime(difficulty: number, skillLevel: string): number {
    const baseTime = 30 // minutes
    const difficultyMultiplier = difficulty / 5
    const skillMultiplier = skillLevel === SKILL_LEVELS.BEGINNER ? 1.5 : 
                           skillLevel === SKILL_LEVELS.INTERMEDIATE ? 1.2 : 
                           skillLevel === SKILL_LEVELS.ADVANCED ? 1.0 : 0.8
    
    return Math.round(baseTime * difficultyMultiplier * skillMultiplier)
  }

  /**
   * Generate basic metrics for challenges based on exercise type
   */
  private static generateMetricsForChallenge(exerciseType: string): any[] {
    const baseMetrics = [
      {
        id: 'completion_time',
        name: 'זמן ביצוע',
        unit: 'דקות',
        type: 'time',
        required: true,
        description: 'כמה זמן לקח לך לבצע את התרגיל'
      },
      {
        id: 'difficulty_rating',
        name: 'דירוג קושי',
        unit: '1-10',
        type: 'numeric',
        required: true,
        description: 'איך דירגת את רמת הקושי של התרגיל'
      }
    ]

    // Add exercise-specific metrics
    switch (exerciseType) {
      case 'shooting':
        baseMetrics.push({
          id: 'shots_taken',
          name: 'מספר בעיטות',
          unit: 'בעיטות',
          type: 'count',
          required: false,
          description: 'כמה בעיטות ביצעת בסך הכל'
        })
        baseMetrics.push({
          id: 'shots_on_target',
          name: 'בעיטות למטרה',
          unit: 'בעיטות',
          type: 'count',
          required: false,
          description: 'כמה בעיטות פגעו במטרה'
        })
        break
      case 'dribbling':
        baseMetrics.push({
          id: 'touches_count',
          name: 'מספר נגיעות',
          unit: 'נגיעות',
          type: 'count',
          required: false,
          description: 'כמה נגיעות בכדור ביצעת'
        })
        break
      case 'passing':
        baseMetrics.push({
          id: 'passes_completed',
          name: 'מסירות מוצלחות',
          unit: 'מסירות',
          type: 'count',
          required: false,
          description: 'כמה מסירות הצלחת להשלים'
        })
        break
      case 'fitness':
        baseMetrics.push({
          id: 'repetitions',
          name: 'מספר חזרות',
          unit: 'חזרות',
          type: 'count',
          required: false,
          description: 'כמה חזרות ביצעת'
        })
        break
    }

    return baseMetrics
  }
}
