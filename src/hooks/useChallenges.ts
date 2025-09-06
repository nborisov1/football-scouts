/**
 * useChallenges Hook - Manages challenge data and operations
 */

import { useState, useEffect, useCallback } from 'react'
import { collection, query, orderBy, onSnapshot, where, doc, addDoc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { FirestoreService } from '@/lib/firestoreService'
import { ChallengeService, ChallengeFilters } from '@/lib/challengeService'
import { 
  Challenge, 
  PlayerChallengeProgress, 
  ChallengeSubmission, 
  ChallengeSeries,
  PlayerChallengeStats 
} from '@/types/challenge'
import { UserData } from '@/types/user'

export interface UseChallengesReturn {
  challenges: Challenge[]
  availableChallenges: Challenge[]
  lockedChallenges: Challenge[]
  playerProgress: PlayerChallengeProgress[]
  playerStats: PlayerChallengeStats | null
  challengeSeries: ChallengeSeries[]
  availableSeries: ChallengeSeries[]
  submissions: ChallengeSubmission[]
  loading: boolean
  error: string | null
  filters: ChallengeFilters
  setFilters: (filters: ChallengeFilters) => void
  startChallenge: (challengeId: string) => Promise<void>
  submitChallenge: (challengeId: string, videoUrl: string, description: string) => Promise<void>
  completeChallenge: (challengeId: string, score: number) => Promise<void>
  failChallenge: (challengeId: string) => Promise<void>
  refreshChallenges: () => void
  getProgressSummary: () => any
}

export function useChallenges(player?: UserData): UseChallengesReturn {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([])
  const [lockedChallenges, setLockedChallenges] = useState<Challenge[]>([])
  const [playerProgress, setPlayerProgress] = useState<PlayerChallengeProgress[]>([])
  const [playerStats, setPlayerStats] = useState<PlayerChallengeStats | null>(null)
  const [challengeSeries, setChallengeSeries] = useState<ChallengeSeries[]>([])
  const [availableSeries, setAvailableSeries] = useState<ChallengeSeries[]>([])
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ChallengeFilters>({})

  // Load challenges
  useEffect(() => {
    const challengesQuery = query(
      collection(db, 'challenges'),
      orderBy('level', 'asc')
    )

    const unsubscribeChallenges = onSnapshot(
      challengesQuery,
      (snapshot) => {
        const challengesData: Challenge[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          challengesData.push({
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as Challenge)
        })
        setChallenges(challengesData)
      },
      (err) => {
        console.error('Error loading challenges:', err)
        setError('Failed to load challenges')
      }
    )

    return () => unsubscribeChallenges()
  }, [])

  // Load challenge series
  useEffect(() => {
    const seriesQuery = query(
      collection(db, 'challengeSeries'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    )

    const unsubscribeSeries = onSnapshot(
      seriesQuery,
      (snapshot) => {
        const seriesData: ChallengeSeries[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          seriesData.push({
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as ChallengeSeries)
        })
        setChallengeSeries(seriesData)
      },
      (err) => {
        console.error('Error loading challenge series:', err)
        setError('Failed to load challenge series')
      }
    )

    return () => unsubscribeSeries()
  }, [])

  // Load player progress
  useEffect(() => {
    if (!player || player.type !== 'player') {
      setPlayerProgress([])
      setPlayerStats(null)
      return
    }

    const progressQuery = query(
      collection(db, 'playerChallengeProgress'),
      where('playerId', '==', player.uid),
      orderBy('updatedAt', 'desc')
    )

    const unsubscribeProgress = onSnapshot(
      progressQuery,
      (snapshot) => {
        const progressData: PlayerChallengeProgress[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          progressData.push({
            ...data,
            startedAt: data.startedAt?.toDate(),
            completedAt: data.completedAt?.toDate(),
            submittedAt: data.submittedAt?.toDate(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as PlayerChallengeProgress)
        })
        setPlayerProgress(progressData)
      },
      (err) => {
        console.error('Error loading player progress:', err)
        setError('Failed to load player progress')
      }
    )

    return () => unsubscribeProgress()
  }, [player])

  // Load player stats
  useEffect(() => {
    if (!player || player.type !== 'player') {
      setPlayerStats(null)
      return
    }

    const statsDoc = doc(db, 'playerChallengeStats', player.uid)
    const unsubscribeStats = onSnapshot(
      statsDoc,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data()
          setPlayerStats({
            ...data,
            lastActivity: data.lastActivity?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as PlayerChallengeStats)
        } else {
          // Create initial stats if they don't exist
          const initialStats = ChallengeService.calculatePlayerStats(
            player.uid,
            challenges,
            playerProgress
          )
          setPlayerStats(initialStats)
        }
      },
      (err) => {
        console.error('Error loading player stats:', err)
        setError('Failed to load player stats')
      }
    )

    return () => unsubscribeStats()
  }, [player, challenges, playerProgress])

  // Load submissions
  useEffect(() => {
    if (!player || player.type !== 'player') {
      setSubmissions([])
      return
    }

    const submissionsQuery = query(
      collection(db, 'challengeSubmissions'),
      where('playerId', '==', player.uid),
      orderBy('submittedAt', 'desc')
    )

    const unsubscribeSubmissions = onSnapshot(
      submissionsQuery,
      (snapshot) => {
        const submissionsData: ChallengeSubmission[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          submissionsData.push({
            ...data,
            submittedAt: data.submittedAt?.toDate() || new Date(),
            reviewedAt: data.reviewedAt?.toDate()
          } as ChallengeSubmission)
        })
        setSubmissions(submissionsData)
      },
      (err) => {
        console.error('Error loading submissions:', err)
        setError('Failed to load submissions')
      }
    )

    return () => unsubscribeSubmissions()
  }, [player])

  // Calculate available and locked challenges
  useEffect(() => {
    if (!player || player.type !== 'player' || challenges.length === 0) {
      setAvailableChallenges([])
      setLockedChallenges([])
      return
    }

    const available = ChallengeService.getAvailableChallenges(
      player,
      challenges,
      playerProgress,
      playerStats
    )
    const locked = ChallengeService.getLockedChallenges(
      player,
      challenges,
      playerProgress,
      playerStats
    )

    setAvailableChallenges(available)
    setLockedChallenges(locked)
  }, [player, challenges, playerProgress, playerStats])

  // Calculate available series
  useEffect(() => {
    if (!player || player.type !== 'player') {
      setAvailableSeries([])
      return
    }

    const available = ChallengeService.getAvailableSeries(
      player,
      challengeSeries,
      playerStats
    )
    setAvailableSeries(available)
  }, [player, challengeSeries, playerStats])

  // Set loading state
  useEffect(() => {
    setLoading(challenges.length === 0)
  }, [challenges])

  const startChallenge = useCallback(async (challengeId: string) => {
    if (!player) throw new Error('No player logged in')

    try {
      // Ensure player data exists
      await FirestoreService.ensurePlayerDataExists(player.uid)

      const progress = ChallengeService.startChallenge(
        player.uid,
        challengeId,
        playerProgress
      )

      // Save to Firestore using the service
      await FirestoreService.saveChallengeProgress(progress)

      console.log('Challenge started successfully')
    } catch (err) {
      console.error('Error starting challenge:', err)
      throw err
    }
  }, [player, playerProgress])

  const submitChallenge = useCallback(async (challengeId: string, videoUrl: string, description: string) => {
    if (!player) throw new Error('No player logged in')

    try {
      const { progress, submission } = ChallengeService.submitChallenge(
        player.uid,
        challengeId,
        videoUrl,
        description,
        playerProgress
      )

      // Save progress update using Firestore service
      const progressDoc = playerProgress.find(p => p.challengeId === challengeId)
      if (progressDoc) {
        await FirestoreService.updateChallengeProgress(progressDoc.playerId + '_' + challengeId, progress)
      }

      // Save submission using Firestore service
      await FirestoreService.saveChallengeSubmission(submission)

      console.log('Challenge submitted successfully')
    } catch (err) {
      console.error('Error submitting challenge:', err)
      throw err
    }
  }, [player, playerProgress])

  const completeChallenge = useCallback(async (challengeId: string, score: number) => {
    if (!player) throw new Error('No player logged in')

    try {
      const progress = ChallengeService.completeChallenge(
        player.uid,
        challengeId,
        score,
        playerProgress
      )

      // Update in Firestore using service
      const progressDoc = playerProgress.find(p => p.challengeId === challengeId)
      if (progressDoc) {
        await FirestoreService.updateChallengeProgress(progressDoc.playerId + '_' + challengeId, progress)
      }

      console.log('Challenge completed successfully')
    } catch (err) {
      console.error('Error completing challenge:', err)
      throw err
    }
  }, [player, playerProgress])

  const failChallenge = useCallback(async (challengeId: string) => {
    if (!player) throw new Error('No player logged in')

    try {
      const progress = ChallengeService.failChallenge(
        player.uid,
        challengeId,
        playerProgress
      )

      // Update in Firestore using service
      const progressDoc = playerProgress.find(p => p.challengeId === challengeId)
      if (progressDoc) {
        await FirestoreService.updateChallengeProgress(progressDoc.playerId + '_' + challengeId, progress)
      }

      console.log('Challenge failed')
    } catch (err) {
      console.error('Error failing challenge:', err)
      throw err
    }
  }, [player, playerProgress])

  const refreshChallenges = useCallback(() => {
    // This will trigger the useEffect hooks to reload data
    setError(null)
  }, [])

  const getProgressSummary = useCallback(() => {
    if (!player) return null
    return ChallengeService.getProgressSummary(
      player.uid,
      challenges,
      playerProgress
    )
  }, [player, challenges, playerProgress])

  return {
    challenges,
    availableChallenges,
    lockedChallenges,
    playerProgress,
    playerStats,
    challengeSeries,
    availableSeries,
    submissions,
    loading,
    error,
    filters,
    setFilters,
    startChallenge,
    submitChallenge,
    completeChallenge,
    failChallenge,
    refreshChallenges,
    getProgressSummary
  }
}
