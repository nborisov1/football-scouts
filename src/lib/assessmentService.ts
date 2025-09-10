/**
 * Assessment Service - Manages the initial player assessment phase
 * Fetches standardized challenges from Firebase for all players to determine starting level
 */

import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import { 
  AssessmentSubmission, 
  AssessmentScore
} from '@/types/user'
import { 
  Challenge, 
  ChallengeSubmission 
} from '@/types/challenge'
import { ChallengeService } from './challengeService'

// Assessment challenge IDs that should be fetched from Firebase
// These should be marked as assessment challenges in the Firebase database
const ASSESSMENT_CHALLENGE_CATEGORIES = ['ball-control', 'passing', 'shooting', 'dribbling', 'fitness']

// Default assessment challenge count
const ASSESSMENT_CHALLENGE_COUNT = 5

export class AssessmentService {
  
  /**
   * Get the standardized assessment challenges from Firebase (same for all players)
   */
  static async getInitialAssessmentChallenges(): Promise<Challenge[]> {
    try {
      // Query for challenges that are marked as assessment challenges
      // We'll look for challenges with specific categories that work for assessment
      const challengesQuery = query(
        collection(db, 'challenges'),
        where('status', '==', 'available'),
        where('difficulty', 'in', ['beginner', 'intermediate']), // Suitable for initial assessment
        orderBy('level', 'asc')
      )

      const querySnapshot = await getDocs(challengesQuery)
      const challenges: Challenge[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const challenge: Challenge = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Challenge
        challenges.push(challenge)
      })

      // Filter and select assessment-appropriate challenges
      const assessmentChallenges = this.selectAssessmentChallenges(challenges)
      
      console.log(`Found ${assessmentChallenges.length} assessment challenges`)
      return assessmentChallenges
    } catch (error) {
      console.error('Error fetching assessment challenges:', error)
      
      // Return empty array if fetch fails - UI should handle this gracefully
      return []
    }
  }

  /**
   * Select the best challenges for assessment from available challenges
   */
  private static selectAssessmentChallenges(challenges: Challenge[]): Challenge[] {
    const selectedChallenges: Challenge[] = []
    const usedCategories = new Set<string>()

    // Prioritize challenges from different categories for a well-rounded assessment
    const priorityCategories = ['ball-control', 'passing', 'shooting', 'dribbling', 'fitness']
    
    // First pass: try to get one challenge from each priority category
    for (const category of priorityCategories) {
      const categoryChallenge = challenges.find(challenge => 
        challenge.category.toLowerCase().includes(category) &&
        !usedCategories.has(challenge.category) &&
        challenge.difficulty === 'beginner' // Start with beginner level for assessment
      )
      
      if (categoryChallenge) {
        selectedChallenges.push(categoryChallenge)
        usedCategories.add(categoryChallenge.category)
      }
      
      if (selectedChallenges.length >= ASSESSMENT_CHALLENGE_COUNT) {
        break
      }
    }

    // Second pass: fill remaining slots with any suitable challenges
    if (selectedChallenges.length < ASSESSMENT_CHALLENGE_COUNT) {
      const remainingChallenges = challenges.filter(challenge => 
        !selectedChallenges.some(selected => selected.id === challenge.id) &&
        (challenge.difficulty === 'beginner' || challenge.difficulty === 'intermediate')
      )

      for (const challenge of remainingChallenges) {
        selectedChallenges.push(challenge)
        if (selectedChallenges.length >= ASSESSMENT_CHALLENGE_COUNT) {
          break
        }
      }
    }

    return selectedChallenges.slice(0, ASSESSMENT_CHALLENGE_COUNT)
  }

  /**
   * Get a specific challenge by ID (using existing ChallengeService)
   */
  static async getAssessmentChallenge(challengeId: string): Promise<Challenge | null> {
    return await ChallengeService.getChallenge(challengeId)
  }

  /**
   * Submit an assessment challenge using the existing challenge submission system
   */
  static async submitAssessmentChallenge(
    playerId: string,
    challengeId: string,
    videoFile: File,
    performanceMetrics: Record<string, number>,
    description: string = 'Assessment submission'
  ): Promise<ChallengeSubmission> {
    try {
      // Get the challenge to understand its metrics and scoring
      const challenge = await this.getAssessmentChallenge(challengeId)
      if (!challenge) {
        throw new Error('Challenge not found')
      }

      // Calculate scores based on performance metrics
      const scores = this.calculateChallengeScores(challenge, performanceMetrics)
      const totalScore = this.calculateTotalScore(scores)

      // Create submission using existing challenge submission format
      const submissionData: Omit<ChallengeSubmission, 'id' | 'submittedAt' | 'videoUrl'> = {
        playerId,
        challengeId,
        description,
        metrics: performanceMetrics,
        scores,
        totalScore,
        overallRating: this.getOverallRating(totalScore),
        status: 'approved' // Auto-approve assessment submissions
      }

      // Submit using existing challenge service (it will handle video upload)
      return await ChallengeService.submitChallenge(submissionData, videoFile)
    } catch (error) {
      console.error('Error submitting assessment challenge:', error)
      throw new Error('Failed to submit assessment challenge')
    }
  }

  /**
   * Calculate scores for challenge metrics
   */
  private static calculateChallengeScores(
    challenge: Challenge, 
    performanceMetrics: Record<string, number>
  ): Record<string, any> {
    const scores: Record<string, any> = {}

    challenge.metrics.forEach(metric => {
      const value = performanceMetrics[metric.id]
      if (value !== undefined) {
        // Use the challenge's thresholds if available, otherwise use a default scoring
        const threshold = challenge.thresholds.find(t => t.metricId === metric.id)
        
        if (threshold) {
          const score = this.calculateMetricScore(value, threshold.thresholds)
          scores[metric.id] = {
            value,
            level: score.level,
            rating: score.rating,
            points: score.points
          }
        } else {
          // Default scoring for assessment (1-10 scale)
          const normalizedScore = Math.min(10, Math.max(1, value))
          scores[metric.id] = {
            value,
            level: Math.ceil(normalizedScore / 2), // Convert to 1-5 scale
            rating: this.getScoreRating(normalizedScore),
            points: normalizedScore * 10 // Convert to points
          }
        }
      }
    })

    return scores
  }

  /**
   * Calculate metric score based on thresholds
   */
  private static calculateMetricScore(value: number, thresholds: any): {
    level: number
    rating: string
    points: number
  } {
    if (value >= thresholds.outstanding) {
      return { level: 5, rating: 'outstanding', points: 100 }
    } else if (value >= thresholds.excellent) {
      return { level: 4, rating: 'excellent', points: 80 }
    } else if (value >= thresholds.good) {
      return { level: 3, rating: 'good', points: 60 }
    } else if (value >= thresholds.fair) {
      return { level: 2, rating: 'fair', points: 40 }
    } else {
      return { level: 1, rating: 'poor', points: 20 }
    }
  }

  /**
   * Get rating from score (1-10)
   */
  private static getScoreRating(score: number): string {
    if (score >= 9) return 'outstanding'
    if (score >= 7) return 'excellent'  
    if (score >= 5) return 'good'
    if (score >= 3) return 'fair'
    return 'poor'
  }

  /**
   * Calculate total score from individual metric scores
   */
  private static calculateTotalScore(scores: Record<string, any>): number {
    const scoreValues = Object.values(scores).map((score: any) => score.points || 0)
    return scoreValues.length > 0 
      ? Math.round(scoreValues.reduce((sum, points) => sum + points, 0) / scoreValues.length)
      : 0
  }

  /**
   * Get overall rating from total score
   */
  private static getOverallRating(totalScore: number): 'poor' | 'fair' | 'good' | 'excellent' | 'outstanding' {
    if (totalScore >= 90) return 'outstanding'
    if (totalScore >= 70) return 'excellent'
    if (totalScore >= 50) return 'good'
    if (totalScore >= 30) return 'fair'
    return 'poor'
  }

  /**
   * Get all assessment submissions for a player (using existing challenge submissions)
   */
  static async getPlayerAssessmentSubmissions(playerId: string): Promise<ChallengeSubmission[]> {
    try {
      // Get assessment challenges first
      const assessmentChallenges = await this.getInitialAssessmentChallenges()
      const assessmentChallengeIds = assessmentChallenges.map(c => c.id)

      if (assessmentChallengeIds.length === 0) {
        return []
      }

      // Get player's submissions for assessment challenges
      const allSubmissions = await ChallengeService.getPlayerSubmissions(playerId)
      
      // Filter only assessment challenge submissions
      const assessmentSubmissions = allSubmissions.filter(submission =>
        assessmentChallengeIds.includes(submission.challengeId)
      )

      // Sort by submission time
      assessmentSubmissions.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
      
      return assessmentSubmissions
    } catch (error) {
      console.error('Error getting player assessment submissions:', error)
      throw new Error('Failed to get assessment submissions')
    }
  }

  /**
   * Get the best (highest scoring) submission for each assessment challenge
   */
  static getBestAssessmentSubmissions(submissions: ChallengeSubmission[]): ChallengeSubmission[] {
    const bestSubmissions: Record<string, ChallengeSubmission> = {}
    
    submissions.forEach(submission => {
      const existing = bestSubmissions[submission.challengeId]
      if (!existing || submission.totalScore > existing.totalScore) {
        bestSubmissions[submission.challengeId] = submission
      }
    })
    
    return Object.values(bestSubmissions)
  }

  /**
   * Convert challenge submissions to assessment scores for level calculation
   */
  static async convertSubmissionsToScores(submissions: ChallengeSubmission[]): Promise<AssessmentScore[]> {
    const bestSubmissions = this.getBestAssessmentSubmissions(submissions)
    const scores: AssessmentScore[] = []
    
    for (const submission of bestSubmissions) {
      const challenge = await this.getAssessmentChallenge(submission.challengeId)
      
      // Convert challenge submission score to assessment score format
      const assessmentScore: AssessmentScore = {
        challengeId: submission.challengeId,
        challengeName: challenge?.title || 'Unknown Challenge',
        performanceScore: submission.totalScore / 10, // Convert 0-100 to 0-10 scale
        videoTechniqueScore: 7, // Default video technique score (can be enhanced later)
        finalScore: (submission.totalScore / 10 + 7) / 2, // Average of performance and technique
        submittedAt: submission.submittedAt
      }
      
      scores.push(assessmentScore)
    }
    
    return scores
  }

  /**
   * Check if player has completed all assessment challenges
   */
  static async hasCompletedAllAssessments(submissions: ChallengeSubmission[]): Promise<boolean> {
    const assessmentChallenges = await this.getInitialAssessmentChallenges()
    const completedChallenges = new Set(submissions.map(sub => sub.challengeId))
    return assessmentChallenges.every(challenge => completedChallenges.has(challenge.id))
  }

  /**
   * Get assessment progress for a player
   */
  static async getAssessmentProgress(submissions: ChallengeSubmission[]): Promise<{
    completed: number
    total: number
    percentage: number
    nextChallenge?: Challenge
  }> {
    const assessmentChallenges = await this.getInitialAssessmentChallenges()
    const completedChallenges = new Set(submissions.map(sub => sub.challengeId))
    const completed = completedChallenges.size
    const total = assessmentChallenges.length
    const percentage = Math.round((completed / total) * 100)
    
    // Find next challenge to complete
    const nextChallenge = assessmentChallenges.find(
      challenge => !completedChallenges.has(challenge.id)
    )
    
    return {
      completed,
      total,
      percentage,
      nextChallenge
    }
  }
}
