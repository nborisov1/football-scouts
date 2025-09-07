/**
 * Challenge Scoring Service
 * Handles automatic scoring and rating calculation for challenge submissions
 */

import { 
  Challenge, 
  ChallengeSubmission, 
  ChallengeThreshold,
  ChallengeMetric 
} from '@/types/challenge'

export interface ScoreResult {
  rating: 'poor' | 'fair' | 'good' | 'excellent' | 'outstanding'
  points: number
  level: number
}

export interface MetricScore {
  metricId: string
  value: number
  score: ScoreResult
}

export interface OverallScore {
  totalPoints: number
  averageScore: number
  overallRating: 'poor' | 'fair' | 'good' | 'excellent' | 'outstanding'
  metricScores: MetricScore[]
}

export class ChallengeScoringService {
  /**
   * Calculate score for a single metric based on its value and thresholds
   */
  static calculateMetricScore(
    metric: ChallengeMetric,
    value: number,
    threshold: ChallengeThreshold
  ): ScoreResult {
    const { thresholds } = threshold
    
    // Determine rating based on thresholds
    let rating: 'poor' | 'fair' | 'good' | 'excellent' | 'outstanding' = 'poor'
    let points = 0
    
    if (value >= thresholds.outstanding) {
      rating = 'outstanding'
      points = 100
    } else if (value >= thresholds.excellent) {
      rating = 'excellent'
      points = 80
    } else if (value >= thresholds.good) {
      rating = 'good'
      points = 60
    } else if (value >= thresholds.fair) {
      rating = 'fair'
      points = 40
    } else {
      rating = 'poor'
      points = 20
    }

    return {
      rating,
      points,
      level: threshold.level
    }
  }

  /**
   * Calculate overall score for a challenge submission
   */
  static calculateOverallScore(
    challenge: Challenge,
    metrics: { [metricId: string]: number }
  ): OverallScore {
    const metricScores: MetricScore[] = []
    let totalPoints = 0
    let totalWeight = 0

    // Calculate score for each metric
    challenge.metrics.forEach(metric => {
      const value = metrics[metric.id] || 0
      const threshold = challenge.thresholds.find(t => t.metricId === metric.id)
      
      if (threshold) {
        const score = this.calculateMetricScore(metric, value, threshold)
        metricScores.push({
          metricId: metric.id,
          value,
          score
        })
        
        // Weight calculation (required metrics have higher weight)
        const weight = metric.required ? 2 : 1
        totalPoints += score.points * weight
        totalWeight += weight
      }
    })

    // Calculate average score
    const averageScore = totalWeight > 0 ? totalPoints / totalWeight : 0

    // Determine overall rating
    let overallRating: 'poor' | 'fair' | 'good' | 'excellent' | 'outstanding' = 'poor'
    if (averageScore >= 90) {
      overallRating = 'outstanding'
    } else if (averageScore >= 70) {
      overallRating = 'excellent'
    } else if (averageScore >= 50) {
      overallRating = 'good'
    } else if (averageScore >= 30) {
      overallRating = 'fair'
    }

    return {
      totalPoints: Math.round(totalPoints),
      averageScore: Math.round(averageScore),
      overallRating,
      metricScores
    }
  }

  /**
   * Create a complete challenge submission with calculated scores
   */
  static createSubmission(
    playerId: string,
    challenge: Challenge,
    videoUrl: string,
    description: string,
    metrics: { [metricId: string]: number }
  ): ChallengeSubmission {
    const overallScore = this.calculateOverallScore(challenge, metrics)
    
    // Create scores object for each metric
    const scores: { [metricId: string]: any } = {}
    overallScore.metricScores.forEach(metricScore => {
      scores[metricScore.metricId] = {
        value: metricScore.value,
        level: metricScore.score.level,
        rating: metricScore.score.rating,
        points: metricScore.score.points
      }
    })

    return {
      id: `submission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      playerId,
      challengeId: challenge.id,
      videoUrl,
      description,
      metrics,
      scores,
      totalScore: overallScore.averageScore,
      overallRating: overallScore.overallRating,
      submittedAt: new Date(),
      status: 'pending'
    }
  }

  /**
   * Get improvement trend for a player's challenge submissions
   */
  static getImprovementTrend(submissions: ChallengeSubmission[]): 'improving' | 'stable' | 'declining' {
    if (submissions.length < 2) return 'stable'

    // Sort by submission date
    const sortedSubmissions = submissions.sort((a, b) => 
      a.submittedAt.getTime() - b.submittedAt.getTime()
    )

    // Calculate trend over last 5 submissions
    const recentSubmissions = sortedSubmissions.slice(-5)
    const scores = recentSubmissions.map(s => s.totalScore)
    
    // Simple linear regression to determine trend
    const n = scores.length
    const x = Array.from({ length: n }, (_, i) => i)
    const y = scores
    
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    
    if (slope > 2) return 'improving'
    if (slope < -2) return 'declining'
    return 'stable'
  }

  /**
   * Calculate player statistics for a specific challenge
   */
  static getPlayerChallengeStats(
    challengeId: string,
    submissions: ChallengeSubmission[]
  ): {
    bestScore: number
    averageScore: number
    totalAttempts: number
    improvementTrend: 'improving' | 'stable' | 'declining'
    lastSubmission?: ChallengeSubmission
  } {
    const challengeSubmissions = submissions.filter(s => s.challengeId === challengeId)
    
    if (challengeSubmissions.length === 0) {
      return {
        bestScore: 0,
        averageScore: 0,
        totalAttempts: 0,
        improvementTrend: 'stable'
      }
    }

    const scores = challengeSubmissions.map(s => s.totalScore)
    const bestScore = Math.max(...scores)
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length
    const improvementTrend = this.getImprovementTrend(challengeSubmissions)
    const lastSubmission = challengeSubmissions.sort((a, b) => 
      b.submittedAt.getTime() - a.submittedAt.getTime()
    )[0]

    return {
      bestScore,
      averageScore: Math.round(averageScore),
      totalAttempts: challengeSubmissions.length,
      improvementTrend,
      lastSubmission
    }
  }

  /**
   * Validate metrics against challenge requirements
   */
  static validateMetrics(
    challenge: Challenge,
    metrics: { [metricId: string]: number }
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check required metrics
    const requiredMetrics = challenge.metrics.filter(m => m.required)
    const missingMetrics = requiredMetrics.filter(m => 
      metrics[m.id] === undefined || metrics[m.id] === null
    )

    if (missingMetrics.length > 0) {
      errors.push(`מדדים נדרשים חסרים: ${missingMetrics.map(m => m.name).join(', ')}`)
    }

    // Validate metric values
    challenge.metrics.forEach(metric => {
      const value = metrics[metric.id]
      if (value !== undefined && value !== null) {
        // Check for negative values where not appropriate
        if (metric.type !== 'numeric' && value < 0) {
          errors.push(`${metric.name} לא יכול להיות שלילי`)
        }

        // Check for percentage values > 100
        if (metric.type === 'percentage' && value > 100) {
          errors.push(`${metric.name} לא יכול להיות מעל 100%`)
        }
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Get score distribution for a challenge
   */
  static getScoreDistribution(submissions: ChallengeSubmission[]): {
    poor: number
    fair: number
    good: number
    excellent: number
    outstanding: number
  } {
    const distribution = {
      poor: 0,
      fair: 0,
      good: 0,
      excellent: 0,
      outstanding: 0
    }

    submissions.forEach(submission => {
      distribution[submission.overallRating]++
    })

    return distribution
  }
}
