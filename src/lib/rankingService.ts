/**
 * Ranking Service - Handles player ranking calculations and leaderboard management
 */

import { PlayerProgress, PlayerVideoSubmission, VideoMetadata } from '@/types/video'
import { UserData } from '@/types/user'

export interface PlayerRanking {
  playerId: string
  playerName: string
  playerEmail: string
  totalPoints: number
  rank: number
  level: 'beginner' | 'intermediate' | 'advanced'
  position: string
  age: number
  completedVideos: number
  completedSeries: number
  averageScore: number
  lastActivity: Date
  achievements: number
  consistency: number // Based on regular activity
  improvement: number // Based on score progression
}

export interface RankingFilters {
  age?: string
  position?: string
  level?: string
  minPoints?: number
  maxPoints?: number
}

export class RankingService {
  /**
   * Calculate player points based on various factors
   */
  static calculatePlayerPoints(
    progress: PlayerProgress,
    submissions: PlayerVideoSubmission[],
    videos: VideoMetadata[]
  ): number {
    let totalPoints = 0

    // Base points for completed videos
    const completedSubmissions = submissions.filter(sub => sub.status === 'approved')
    totalPoints += completedSubmissions.length * 10

    // Bonus points for high scores
    completedSubmissions.forEach(submission => {
      if (submission.adminScore) {
        totalPoints += submission.adminScore * 2 // 2 points per admin score point
      }
    })

    // Series completion bonus
    totalPoints += progress.completedSeries.length * 50

    // Achievement points
    totalPoints += progress.achievements.reduce((sum, achievement) => sum + achievement.points, 0)

    // Consistency bonus (based on regular activity)
    const daysSinceLastActivity = Math.floor(
      (Date.now() - progress.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceLastActivity <= 7) {
      totalPoints += 20 // Active player bonus
    }

    // Level-based multiplier
    const levelMultiplier = this.getLevelMultiplier(progress)
    totalPoints = Math.floor(totalPoints * levelMultiplier)

    return totalPoints
  }

  /**
   * Get level multiplier for point calculation
   */
  private static getLevelMultiplier(progress: PlayerProgress): number {
    const completedVideos = progress.completedVideos.length
    const completedSeries = progress.completedSeries.length

    if (completedSeries >= 5 && completedVideos >= 20) {
      return 1.5 // Advanced
    } else if (completedSeries >= 2 && completedVideos >= 10) {
      return 1.2 // Intermediate
    } else {
      return 1.0 // Beginner
    }
  }

  /**
   * Calculate player level based on progress
   */
  static calculatePlayerLevel(progress: PlayerProgress): 'beginner' | 'intermediate' | 'advanced' {
    const completedVideos = progress.completedVideos.length
    const completedSeries = progress.completedSeries.length

    if (completedSeries >= 5 && completedVideos >= 20) {
      return 'advanced'
    } else if (completedSeries >= 2 && completedVideos >= 10) {
      return 'intermediate'
    } else {
      return 'beginner'
    }
  }

  /**
   * Calculate consistency score (0-100)
   */
  static calculateConsistency(progress: PlayerProgress, submissions: PlayerVideoSubmission[]): number {
    if (submissions.length === 0) return 0

    const approvedSubmissions = submissions.filter(sub => sub.status === 'approved')
    const approvalRate = (approvedSubmissions.length / submissions.length) * 100

    // Factor in regular activity
    const daysSinceLastActivity = Math.floor(
      (Date.now() - progress.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    )
    const activityScore = Math.max(0, 100 - daysSinceLastActivity * 5)

    return Math.round((approvalRate + activityScore) / 2)
  }

  /**
   * Calculate improvement score (0-100)
   */
  static calculateImprovement(submissions: PlayerVideoSubmission[]): number {
    if (submissions.length < 2) return 50 // Neutral score for new players

    const approvedSubmissions = submissions
      .filter(sub => sub.status === 'approved' && sub.adminScore)
      .sort((a, b) => a.submittedAt.getTime() - b.submittedAt.getTime())

    if (approvedSubmissions.length < 2) return 50

    const recentScores = approvedSubmissions.slice(-5) // Last 5 scores
    const olderScores = approvedSubmissions.slice(0, -5) // Previous scores

    if (olderScores.length === 0) return 50

    const recentAverage = recentScores.reduce((sum, sub) => sum + (sub.adminScore || 0), 0) / recentScores.length
    const olderAverage = olderScores.reduce((sum, sub) => sum + (sub.adminScore || 0), 0) / olderScores.length

    const improvement = ((recentAverage - olderAverage) / olderAverage) * 100
    return Math.max(0, Math.min(100, 50 + improvement))
  }

  /**
   * Generate player rankings
   */
  static generateRankings(
    players: UserData[],
    progressData: PlayerProgress[],
    submissions: PlayerVideoSubmission[],
    videos: VideoMetadata[]
  ): PlayerRanking[] {
    const rankings: PlayerRanking[] = []

    players.forEach(player => {
      if (player.type !== 'player') return

      const progress = progressData.find(p => p.playerId === player.uid)
      if (!progress) return

      const playerSubmissions = submissions.filter(sub => sub.playerId === player.uid)
      const totalPoints = this.calculatePlayerPoints(progress, playerSubmissions, videos)
      const level = this.calculatePlayerLevel(progress)
      const consistency = this.calculateConsistency(progress, playerSubmissions)
      const improvement = this.calculateImprovement(playerSubmissions)

      const averageScore = playerSubmissions.length > 0
        ? playerSubmissions
            .filter(sub => sub.adminScore)
            .reduce((sum, sub) => sum + (sub.adminScore || 0), 0) / playerSubmissions.length
        : 0

      rankings.push({
        playerId: player.uid,
        playerName: player.displayName || `${player.firstName} ${player.lastName}`,
        playerEmail: player.email,
        totalPoints,
        rank: 0, // Will be set after sorting
        level,
        position: player.position || 'unknown',
        age: player.age || 0,
        completedVideos: progress.completedVideos.length,
        completedSeries: progress.completedSeries.length,
        averageScore: Math.round(averageScore * 10) / 10,
        lastActivity: progress.lastActivity,
        achievements: progress.achievements.length,
        consistency,
        improvement
      })
    })

    // Sort by total points (descending) and assign ranks
    rankings.sort((a, b) => b.totalPoints - a.totalPoints)
    rankings.forEach((ranking, index) => {
      ranking.rank = index + 1
    })

    return rankings
  }

  /**
   * Filter rankings based on criteria
   */
  static filterRankings(rankings: PlayerRanking[], filters: RankingFilters): PlayerRanking[] {
    return rankings.filter(ranking => {
      // Age filter
      if (filters.age) {
        if (filters.age === '20+') {
          if (ranking.age < 20) return false
        } else {
          const [minAge, maxAge] = filters.age.split('-').map(Number)
          if (ranking.age < minAge || ranking.age > maxAge) return false
        }
      }

      // Position filter
      if (filters.position && ranking.position !== filters.position) {
        return false
      }

      // Level filter
      if (filters.level && ranking.level !== filters.level) {
        return false
      }

      // Points range filter
      if (filters.minPoints && ranking.totalPoints < filters.minPoints) {
        return false
      }
      if (filters.maxPoints && ranking.totalPoints > filters.maxPoints) {
        return false
      }

      return true
    })
  }

  /**
   * Get ranking statistics
   */
  static getRankingStats(rankings: PlayerRanking[]) {
    if (rankings.length === 0) {
      return {
        totalPlayers: 0,
        averagePoints: 0,
        topScore: 0,
        levelDistribution: { beginner: 0, intermediate: 0, advanced: 0 }
      }
    }

    const totalPoints = rankings.reduce((sum, ranking) => sum + ranking.totalPoints, 0)
    const levelDistribution = rankings.reduce((acc, ranking) => {
      acc[ranking.level] = (acc[ranking.level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalPlayers: rankings.length,
      averagePoints: Math.round(totalPoints / rankings.length),
      topScore: rankings[0]?.totalPoints || 0,
      levelDistribution
    }
  }

  /**
   * Update player rank after new activity
   */
  static updatePlayerRank(
    playerId: string,
    rankings: PlayerRanking[]
  ): PlayerRanking[] {
    // Re-sort all rankings
    const sortedRankings = [...rankings].sort((a, b) => b.totalPoints - a.totalPoints)
    
    // Update ranks
    sortedRankings.forEach((ranking, index) => {
      ranking.rank = index + 1
    })

    return sortedRankings
  }
}
