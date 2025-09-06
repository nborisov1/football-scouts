/**
 * useRankings Hook - Manages player ranking data and operations
 */

import { useState, useEffect, useCallback } from 'react'
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { RankingService, PlayerRanking, RankingFilters } from '@/lib/rankingService'
import { PlayerProgress, PlayerVideoSubmission, VideoMetadata } from '@/types/video'
import { UserData } from '@/types/user'

export interface UseRankingsReturn {
  rankings: PlayerRanking[]
  filteredRankings: PlayerRanking[]
  loading: boolean
  error: string | null
  stats: {
    totalPlayers: number
    averagePoints: number
    topScore: number
    levelDistribution: Record<string, number>
  }
  filters: RankingFilters
  setFilters: (filters: RankingFilters) => void
  refreshRankings: () => void
  getPlayerRanking: (playerId: string) => PlayerRanking | undefined
}

export function useRankings(): UseRankingsReturn {
  const [rankings, setRankings] = useState<PlayerRanking[]>([])
  const [filteredRankings, setFilteredRankings] = useState<PlayerRanking[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<RankingFilters>({})
  const [players, setPlayers] = useState<UserData[]>([])
  const [progressData, setProgressData] = useState<PlayerProgress[]>([])
  const [submissions, setSubmissions] = useState<PlayerVideoSubmission[]>([])
  const [videos, setVideos] = useState<VideoMetadata[]>([])

  // Load players data
  useEffect(() => {
    const playersQuery = query(
      collection(db, 'users'),
      where('type', '==', 'player')
    )

    const unsubscribePlayers = onSnapshot(
      playersQuery,
      (snapshot) => {
        const playersData: UserData[] = []
        snapshot.forEach((doc) => {
          playersData.push({ uid: doc.id, ...doc.data() } as UserData)
        })
        setPlayers(playersData)
      },
      (err) => {
        console.error('Error loading players:', err)
        setError('Failed to load players data')
      }
    )

    return () => unsubscribePlayers()
  }, [])

  // Load progress data
  useEffect(() => {
    const progressQuery = query(
      collection(db, 'playerProgress'),
      orderBy('lastActivity', 'desc')
    )

    const unsubscribeProgress = onSnapshot(
      progressQuery,
      (snapshot) => {
        const progressData: PlayerProgress[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          progressData.push({
            ...data,
            lastActivity: data.lastActivity?.toDate() || new Date(),
            achievements: data.achievements?.map((achievement: any) => ({
              ...achievement,
              earnedAt: achievement.earnedAt?.toDate() || new Date()
            })) || []
          } as PlayerProgress)
        })
        setProgressData(progressData)
      },
      (err) => {
        console.error('Error loading progress data:', err)
        setError('Failed to load progress data')
      }
    )

    return () => unsubscribeProgress()
  }, [])

  // Load submissions data
  useEffect(() => {
    const submissionsQuery = query(
      collection(db, 'playerSubmissions'),
      orderBy('submittedAt', 'desc')
    )

    const unsubscribeSubmissions = onSnapshot(
      submissionsQuery,
      (snapshot) => {
        const submissionsData: PlayerVideoSubmission[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          submissionsData.push({
            ...data,
            submittedAt: data.submittedAt?.toDate() || new Date(),
            reviewedAt: data.reviewedAt?.toDate() || new Date()
          } as PlayerVideoSubmission)
        })
        setSubmissions(submissionsData)
      },
      (err) => {
        console.error('Error loading submissions:', err)
        setError('Failed to load submissions data')
      }
    )

    return () => unsubscribeSubmissions()
  }, [])

  // Load videos data
  useEffect(() => {
    const videosQuery = query(
      collection(db, 'videos'),
      where('status', '==', 'approved')
    )

    const unsubscribeVideos = onSnapshot(
      videosQuery,
      (snapshot) => {
        const videosData: VideoMetadata[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          videosData.push({
            ...data,
            uploadedAt: data.uploadedAt?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as VideoMetadata)
        })
        setVideos(videosData)
      },
      (err) => {
        console.error('Error loading videos:', err)
        setError('Failed to load videos data')
      }
    )

    return () => unsubscribeVideos()
  }, [])

  // Generate rankings when data changes
  useEffect(() => {
    try {
      const newRankings = RankingService.generateRankings(
        players,
        progressData,
        submissions,
        videos
      )
      setRankings(newRankings)
      setLoading(false)
      setError(null)
    } catch (err) {
      console.error('Error generating rankings:', err)
      setError('Failed to generate rankings')
      setLoading(false)
    }
  }, [players, progressData, submissions, videos])

  // Apply filters when rankings or filters change
  useEffect(() => {
    const filtered = RankingService.filterRankings(rankings, filters)
    setFilteredRankings(filtered)
  }, [rankings, filters])

  const refreshRankings = useCallback(() => {
    try {
      const newRankings = RankingService.generateRankings(
        players,
        progressData,
        submissions,
        videos
      )
      setRankings(newRankings)
    } catch (err) {
      console.error('Error refreshing rankings:', err)
      setError('Failed to refresh rankings')
    }
  }, [players, progressData, submissions, videos])

  const getPlayerRanking = useCallback((playerId: string) => {
    return rankings.find(ranking => ranking.playerId === playerId)
  }, [rankings])

  const stats = RankingService.getRankingStats(rankings)

  return {
    rankings,
    filteredRankings,
    loading,
    error,
    stats,
    filters,
    setFilters,
    refreshRankings,
    getPlayerRanking
  }
}
