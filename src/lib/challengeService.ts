/**
 * Challenge Service - Manages the challenge progression system
 */

import { 
  Challenge, 
  PlayerChallengeProgress, 
  ChallengeSubmission, 
  ChallengeSeries,
  PlayerChallengeStats,
  ChallengeStatus,
  ChallengeDifficulty,
  ChallengeType,
  ChallengeCategory
} from '@/types/challenge'
import { UserData } from '@/types/user'

export interface ChallengeFilters {
  type?: ChallengeType
  category?: ChallengeCategory
  difficulty?: ChallengeDifficulty
  status?: ChallengeStatus
  level?: number
}

export class ChallengeService {
  /**
   * Get available challenges for a player
   */
  static getAvailableChallenges(
    player: UserData,
    allChallenges: Challenge[],
    playerProgress: PlayerChallengeProgress[],
    playerStats: PlayerChallengeStats | null
  ): Challenge[] {
    if (!playerStats) return []

    return allChallenges.filter(challenge => {
      // Check if challenge is active
      if (challenge.status !== 'available') return false

      // Check age requirements
      if (challenge.requirements.minAge && player.age && player.age < challenge.requirements.minAge) {
        return false
      }
      if (challenge.requirements.maxAge && player.age && player.age > challenge.requirements.maxAge) {
        return false
      }

      // Check position requirements
      if (challenge.requirements.positions && challenge.requirements.positions.length > 0) {
        if (!player.position || !challenge.requirements.positions.includes(player.position)) {
          return false
        }
      }

      // Check level requirements
      if (challenge.requirements.minLevel) {
        const difficultyOrder = ['beginner', 'intermediate', 'advanced', 'expert']
        const playerLevelIndex = difficultyOrder.indexOf(playerStats.currentLevel.toString())
        const requiredLevelIndex = difficultyOrder.indexOf(challenge.requirements.minLevel)
        if (playerLevelIndex < requiredLevelIndex) return false
      }

      // Check points requirements
      if (challenge.requirements.minPoints && playerStats.totalPoints < challenge.requirements.minPoints) {
        return false
      }

      // Check prerequisite challenges
      if (challenge.prerequisites && challenge.prerequisites.length > 0) {
        const completedChallengeIds = playerProgress
          .filter(progress => progress.status === 'completed')
          .map(progress => progress.challengeId)
        
        const hasAllPrerequisites = challenge.prerequisites.every(prereqId => 
          completedChallengeIds.includes(prereqId)
        )
        if (!hasAllPrerequisites) return false
      }

      // Check if player hasn't already completed this challenge
      const existingProgress = playerProgress.find(progress => progress.challengeId === challenge.id)
      if (existingProgress && existingProgress.status === 'completed') return false

      return true
    })
  }

  /**
   * Get locked challenges for a player
   */
  static getLockedChallenges(
    player: UserData,
    allChallenges: Challenge[],
    playerProgress: PlayerChallengeProgress[],
    playerStats: PlayerChallengeStats | null
  ): Challenge[] {
    if (!playerStats) return allChallenges

    return allChallenges.filter(challenge => {
      // Check if already completed
      const existingProgress = playerProgress.find(progress => progress.challengeId === challenge.id)
      if (existingProgress && existingProgress.status === 'completed') return false

      // Check if available (not locked)
      const availableChallenges = this.getAvailableChallenges(player, allChallenges, playerProgress, playerStats)
      if (availableChallenges.some(available => available.id === challenge.id)) return false

      return true
    })
  }

  /**
   * Start a challenge for a player
   */
  static startChallenge(
    playerId: string,
    challengeId: string,
    existingProgress: PlayerChallengeProgress[]
  ): PlayerChallengeProgress {
    const existing = existingProgress.find(progress => progress.challengeId === challengeId)
    
    if (existing) {
      // Update existing progress
      return {
        ...existing,
        status: 'in_progress',
        startedAt: new Date(),
        updatedAt: new Date()
      }
    } else {
      // Create new progress
      return {
        playerId,
        challengeId,
        status: 'in_progress',
        attempts: 0,
        startedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  }

  /**
   * Submit a challenge
   */
  static submitChallenge(
    playerId: string,
    challengeId: string,
    videoUrl: string,
    description: string,
    existingProgress: PlayerChallengeProgress[]
  ): { progress: PlayerChallengeProgress; submission: ChallengeSubmission } {
    const progress = existingProgress.find(p => p.challengeId === challengeId)
    if (!progress) {
      throw new Error('Challenge progress not found')
    }

    const updatedProgress: PlayerChallengeProgress = {
      ...progress,
      status: 'in_progress',
      attempts: progress.attempts + 1,
      submittedAt: new Date(),
      videoSubmission: videoUrl,
      updatedAt: new Date()
    }

    const submission: ChallengeSubmission = {
      id: `${playerId}_${challengeId}_${Date.now()}`,
      playerId,
      challengeId,
      videoUrl,
      description,
      submittedAt: new Date(),
      status: 'pending'
    }

    return { progress: updatedProgress, submission }
  }

  /**
   * Complete a challenge
   */
  static completeChallenge(
    playerId: string,
    challengeId: string,
    score: number,
    existingProgress: PlayerChallengeProgress[]
  ): PlayerChallengeProgress {
    const progress = existingProgress.find(p => p.challengeId === challengeId)
    if (!progress) {
      throw new Error('Challenge progress not found')
    }

    return {
      ...progress,
      status: 'completed',
      bestScore: Math.max(progress.bestScore || 0, score),
      currentScore: score,
      completedAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Fail a challenge
   */
  static failChallenge(
    playerId: string,
    challengeId: string,
    existingProgress: PlayerChallengeProgress[]
  ): PlayerChallengeProgress {
    const progress = existingProgress.find(p => p.challengeId === challengeId)
    if (!progress) {
      throw new Error('Challenge progress not found')
    }

    return {
      ...progress,
      status: 'failed',
      updatedAt: new Date()
    }
  }

  /**
   * Calculate player challenge statistics
   */
  static calculatePlayerStats(
    playerId: string,
    allChallenges: Challenge[],
    playerProgress: PlayerChallengeProgress[]
  ): PlayerChallengeStats {
    const playerChallenges = playerProgress.filter(p => p.playerId === playerId)
    const completedChallenges = playerChallenges.filter(p => p.status === 'completed')
    const failedChallenges = playerChallenges.filter(p => p.status === 'failed')
    
    const totalScore = completedChallenges.reduce((sum, p) => sum + (p.bestScore || 0), 0)
    const averageScore = completedChallenges.length > 0 ? totalScore / completedChallenges.length : 0

    // Calculate current level based on completed challenges
    const currentLevel = this.calculatePlayerLevel(completedChallenges.length)

    // Calculate streak
    const sortedCompleted = completedChallenges
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
    
    let streak = 0
    let longestStreak = 0
    let currentStreak = 0

    for (let i = 0; i < sortedCompleted.length; i++) {
      if (i === 0 || this.isConsecutiveDay(sortedCompleted[i-1].completedAt!, sortedCompleted[i].completedAt!)) {
        currentStreak++
        longestStreak = Math.max(longestStreak, currentStreak)
      } else {
        currentStreak = 1
      }
    }

    streak = currentStreak

    return {
      playerId,
      totalChallenges: allChallenges.length,
      completedChallenges: completedChallenges.length,
      failedChallenges: failedChallenges.length,
      averageScore: Math.round(averageScore * 10) / 10,
      totalPoints: completedChallenges.reduce((sum, p) => {
        const challenge = allChallenges.find(c => c.id === p.challengeId)
        return sum + (challenge?.rewards.points || 0)
      }, 0),
      currentLevel,
      badges: [], // TODO: Implement badge system
      titles: [], // TODO: Implement title system
      streak,
      longestStreak,
      lastActivity: playerChallenges.length > 0 
        ? new Date(Math.max(...playerChallenges.map(p => p.updatedAt.getTime())))
        : new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  /**
   * Calculate player level based on completed challenges
   */
  private static calculatePlayerLevel(completedCount: number): number {
    if (completedCount >= 50) return 10 // Expert
    if (completedCount >= 30) return 9
    if (completedCount >= 20) return 8
    if (completedCount >= 15) return 7
    if (completedCount >= 10) return 6
    if (completedCount >= 7) return 5
    if (completedCount >= 5) return 4
    if (completedCount >= 3) return 3
    if (completedCount >= 2) return 2
    if (completedCount >= 1) return 1
    return 0
  }

  /**
   * Check if two dates are consecutive days
   */
  private static isConsecutiveDay(date1: Date, date2: Date): boolean {
    const day1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate())
    const day2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate())
    const diffTime = Math.abs(day2.getTime() - day1.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays === 1
  }

  /**
   * Get challenge series for a player
   */
  static getAvailableSeries(
    player: UserData,
    allSeries: ChallengeSeries[],
    playerStats: PlayerChallengeStats | null
  ): ChallengeSeries[] {
    if (!playerStats) return []

    return allSeries.filter(series => {
      if (!series.isActive) return false

      // Check level requirements
      const difficultyOrder = ['beginner', 'intermediate', 'advanced', 'expert']
      const playerLevelIndex = difficultyOrder.indexOf(playerStats.currentLevel.toString())
      const requiredLevelIndex = difficultyOrder.indexOf(series.unlockRequirements.minLevel)
      if (playerLevelIndex < requiredLevelIndex) return false

      // Check points requirements
      if (playerStats.totalPoints < series.unlockRequirements.minPoints) return false

      // Check completed challenges requirements
      // TODO: Implement this check when we have the data structure

      return true
    })
  }

  /**
   * Filter challenges based on criteria
   */
  static filterChallenges(challenges: Challenge[], filters: ChallengeFilters): Challenge[] {
    return challenges.filter(challenge => {
      if (filters.type && challenge.type !== filters.type) return false
      if (filters.category && challenge.category !== filters.category) return false
      if (filters.difficulty && challenge.difficulty !== filters.difficulty) return false
      if (filters.status && challenge.status !== filters.status) return false
      if (filters.level && challenge.level !== filters.level) return false
      return true
    })
  }

  /**
   * Get challenge progress summary
   */
  static getProgressSummary(
    playerId: string,
    allChallenges: Challenge[],
    playerProgress: PlayerChallengeProgress[]
  ) {
    const playerChallenges = playerProgress.filter(p => p.playerId === playerId)
    const completed = playerChallenges.filter(p => p.status === 'completed')
    const inProgress = playerChallenges.filter(p => p.status === 'in_progress')
    const available = allChallenges.filter(c => c.status === 'available')
    const locked = allChallenges.filter(c => c.status === 'locked')

    return {
      total: allChallenges.length,
      completed: completed.length,
      inProgress: inProgress.length,
      available: available.length,
      locked: locked.length,
      completionRate: allChallenges.length > 0 ? (completed.length / allChallenges.length) * 100 : 0
    }
  }
}
