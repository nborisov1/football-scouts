/**
 * Firestore Service - Centralized service for all Firestore operations
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firebase'
import { VideoMetadata, TrainingSeries, PlayerProgress, PlayerVideoSubmission } from '@/types/video'
import { Challenge, PlayerChallengeProgress, ChallengeSubmission, ChallengeSeries, PlayerChallengeStats } from '@/types/challenge'
import { UserData } from '@/types/user'

export class FirestoreService {
  // Video Management
  static async saveVideo(video: Omit<VideoMetadata, 'id' | 'uploadedAt' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const videoRef = await addDoc(collection(db, 'videos'), {
      ...video,
      uploadedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return videoRef.id
  }

  static async updateVideo(videoId: string, updates: Partial<VideoMetadata>): Promise<void> {
    const videoRef = doc(db, 'videos', videoId)
    await updateDoc(videoRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  }

  static async deleteVideo(videoId: string): Promise<void> {
    const videoRef = doc(db, 'videos', videoId)
    await deleteDoc(videoRef)
  }

  static async getVideo(videoId: string): Promise<VideoMetadata | null> {
    const videoRef = doc(db, 'videos', videoId)
    const videoSnap = await getDoc(videoRef)
    
    if (videoSnap.exists()) {
      const data = videoSnap.data()
      return {
        ...data,
        id: videoSnap.id,
        uploadedAt: data.uploadedAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as VideoMetadata
    }
    return null
  }

  // Training Series Management
  static async saveTrainingSeries(series: Omit<TrainingSeries, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const seriesRef = await addDoc(collection(db, 'trainingSeries'), {
      ...series,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return seriesRef.id
  }

  static async updateTrainingSeries(seriesId: string, updates: Partial<TrainingSeries>): Promise<void> {
    const seriesRef = doc(db, 'trainingSeries', seriesId)
    await updateDoc(seriesRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  }

  static async getTrainingSeries(seriesId: string): Promise<TrainingSeries | null> {
    const seriesRef = doc(db, 'trainingSeries', seriesId)
    const seriesSnap = await getDoc(seriesRef)
    
    if (seriesSnap.exists()) {
      const data = seriesSnap.data()
      return {
        ...data,
        id: seriesSnap.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as TrainingSeries
    }
    return null
  }

  // Player Progress Management
  static async savePlayerProgress(progress: Omit<PlayerProgress, 'createdAt' | 'updatedAt'>): Promise<string> {
    const progressRef = await addDoc(collection(db, 'playerProgress'), {
      ...progress,
      lastActivity: progress.lastActivity,
      achievements: progress.achievements.map(achievement => ({
        ...achievement,
        earnedAt: achievement.earnedAt
      })),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return progressRef.id
  }

  static async updatePlayerProgress(progressId: string, updates: Partial<PlayerProgress>): Promise<void> {
    const progressRef = doc(db, 'playerProgress', progressId)
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp()
    }

    if (updates.lastActivity) {
      updateData.lastActivity = updates.lastActivity
    }

    if (updates.achievements) {
      updateData.achievements = updates.achievements.map(achievement => ({
        ...achievement,
        earnedAt: achievement.earnedAt
      }))
    }

    await updateDoc(progressRef, updateData)
  }

  static async getPlayerProgress(playerId: string): Promise<PlayerProgress | null> {
    const progressQuery = query(
      collection(db, 'playerProgress'),
      where('playerId', '==', playerId),
      limit(1)
    )
    const progressSnap = await getDocs(progressQuery)
    
    if (!progressSnap.empty) {
      const doc = progressSnap.docs[0]
      const data = doc.data()
      return {
        ...data,
        playerId: data.playerId,
        lastActivity: data.lastActivity?.toDate() || new Date(),
        achievements: data.achievements?.map((achievement: any) => ({
          ...achievement,
          earnedAt: achievement.earnedAt?.toDate() || new Date()
        })) || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as PlayerProgress
    }
    return null
  }

  // Video Submissions Management
  static async saveVideoSubmission(submission: Omit<PlayerVideoSubmission, 'id' | 'submittedAt' | 'reviewedAt'>): Promise<string> {
    const submissionRef = await addDoc(collection(db, 'playerSubmissions'), {
      ...submission,
      submittedAt: serverTimestamp(),
      reviewedAt: submission.reviewedAt || null
    })
    return submissionRef.id
  }

  static async updateVideoSubmission(submissionId: string, updates: Partial<PlayerVideoSubmission>): Promise<void> {
    const submissionRef = doc(db, 'playerSubmissions', submissionId)
    const updateData: any = {
      ...updates
    }

    if (updates.reviewedAt) {
      updateData.reviewedAt = updates.reviewedAt
    }

    await updateDoc(submissionRef, updateData)
  }

  // Challenge Management
  static async saveChallenge(challenge: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const challengeRef = await addDoc(collection(db, 'challenges'), {
      ...challenge,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return challengeRef.id
  }

  static async updateChallenge(challengeId: string, updates: Partial<Challenge>): Promise<void> {
    const challengeRef = doc(db, 'challenges', challengeId)
    await updateDoc(challengeRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  }

  static async saveChallengeProgress(progress: Omit<PlayerChallengeProgress, 'createdAt' | 'updatedAt'>): Promise<string> {
    const progressRef = await addDoc(collection(db, 'playerChallengeProgress'), {
      ...progress,
      startedAt: progress.startedAt || null,
      completedAt: progress.completedAt || null,
      submittedAt: progress.submittedAt || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return progressRef.id
  }

  static async updateChallengeProgress(progressId: string, updates: Partial<PlayerChallengeProgress>): Promise<void> {
    const progressRef = doc(db, 'playerChallengeProgress', progressId)
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp()
    }

    if (updates.startedAt) updateData.startedAt = updates.startedAt
    if (updates.completedAt) updateData.completedAt = updates.completedAt
    if (updates.submittedAt) updateData.submittedAt = updates.submittedAt

    await updateDoc(progressRef, updateData)
  }

  static async saveChallengeSubmission(submission: Omit<ChallengeSubmission, 'id' | 'submittedAt' | 'reviewedAt'>): Promise<string> {
    const submissionRef = await addDoc(collection(db, 'challengeSubmissions'), {
      ...submission,
      submittedAt: serverTimestamp(),
      reviewedAt: submission.reviewedAt || null
    })
    return submissionRef.id
  }

  static async updateChallengeSubmission(submissionId: string, updates: Partial<ChallengeSubmission>): Promise<void> {
    const submissionRef = doc(db, 'challengeSubmissions', submissionId)
    const updateData: any = {
      ...updates
    }

    if (updates.reviewedAt) {
      updateData.reviewedAt = updates.reviewedAt
    }

    await updateDoc(submissionRef, updateData)
  }

  static async saveChallengeSeries(series: Omit<ChallengeSeries, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const seriesRef = await addDoc(collection(db, 'challengeSeries'), {
      ...series,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return seriesRef.id
  }

  static async updateChallengeSeries(seriesId: string, updates: Partial<ChallengeSeries>): Promise<void> {
    const seriesRef = doc(db, 'challengeSeries', seriesId)
    await updateDoc(seriesRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  }

  static async savePlayerChallengeStats(stats: Omit<PlayerChallengeStats, 'createdAt' | 'updatedAt'>): Promise<string> {
    const statsRef = await addDoc(collection(db, 'playerChallengeStats'), {
      ...stats,
      lastActivity: stats.lastActivity,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return statsRef.id
  }

  static async updatePlayerChallengeStats(statsId: string, updates: Partial<PlayerChallengeStats>): Promise<void> {
    const statsRef = doc(db, 'playerChallengeStats', statsId)
    const updateData: any = {
      ...updates,
      updatedAt: serverTimestamp()
    }

    if (updates.lastActivity) {
      updateData.lastActivity = updates.lastActivity
    }

    await updateDoc(statsRef, updateData)
  }

  // Batch Operations
  static async batchUpdatePlayerData(
    playerId: string,
    progressUpdates: Partial<PlayerProgress>,
    statsUpdates: Partial<PlayerChallengeStats>
  ): Promise<void> {
    const batch = writeBatch(db)

    // Update progress
    const progressQuery = query(
      collection(db, 'playerProgress'),
      where('playerId', '==', playerId),
      limit(1)
    )
    const progressSnap = await getDocs(progressQuery)
    
    if (!progressSnap.empty) {
      const progressRef = progressSnap.docs[0].ref
      batch.update(progressRef, {
        ...progressUpdates,
        updatedAt: serverTimestamp()
      })
    }

    // Update stats
    const statsRef = doc(db, 'playerChallengeStats', playerId)
    batch.update(statsRef, {
      ...statsUpdates,
      updatedAt: serverTimestamp()
    })

    await batch.commit()
  }

  // Data Migration and Setup
  static async createInitialPlayerProgress(playerId: string): Promise<string> {
    const initialProgress: Omit<PlayerProgress, 'id' | 'createdAt' | 'updatedAt'> = {
      playerId,
      completedSeries: [],
      completedVideos: [],
      totalPoints: 0,
      rank: 0,
      lastActivity: new Date(),
      achievements: []
    }

    return await this.savePlayerProgress(initialProgress)
  }

  static async createInitialPlayerStats(playerId: string): Promise<string> {
    const initialStats: Omit<PlayerChallengeStats, 'id' | 'createdAt' | 'updatedAt'> = {
      playerId,
      totalChallenges: 0,
      completedChallenges: 0,
      failedChallenges: 0,
      averageScore: 0,
      totalPoints: 0,
      currentLevel: 0,
      badges: [],
      titles: [],
      streak: 0,
      longestStreak: 0,
      lastActivity: new Date()
    }

    return await this.savePlayerChallengeStats(initialStats)
  }

  // Utility Functions
  static async ensurePlayerDataExists(playerId: string): Promise<void> {
    // Check if progress exists
    const progressQuery = query(
      collection(db, 'playerProgress'),
      where('playerId', '==', playerId),
      limit(1)
    )
    const progressSnap = await getDocs(progressQuery)
    
    if (progressSnap.empty) {
      await this.createInitialPlayerProgress(playerId)
    }

    // Check if stats exist
    const statsRef = doc(db, 'playerChallengeStats', playerId)
    const statsSnap = await getDoc(statsRef)
    
    if (!statsSnap.exists()) {
      await this.createInitialPlayerStats(playerId)
    }
  }

  // Real-time Listeners
  static subscribeToPlayerProgress(
    playerId: string,
    callback: (progress: PlayerProgress | null) => void
  ) {
    const progressQuery = query(
      collection(db, 'playerProgress'),
      where('playerId', '==', playerId),
      limit(1)
    )

    return onSnapshot(progressQuery, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        const data = doc.data()
        const progress: PlayerProgress = {
          ...data,
          playerId: data.playerId,
          lastActivity: data.lastActivity?.toDate() || new Date(),
          achievements: data.achievements?.map((achievement: any) => ({
            ...achievement,
            earnedAt: achievement.earnedAt?.toDate() || new Date()
          })) || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        }
        callback(progress)
      } else {
        callback(null)
      }
    })
  }

  static subscribeToPlayerStats(
    playerId: string,
    callback: (stats: PlayerChallengeStats | null) => void
  ) {
    const statsRef = doc(db, 'playerChallengeStats', playerId)

    return onSnapshot(statsRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        const stats: PlayerChallengeStats = {
          ...data,
          playerId: data.playerId,
          lastActivity: data.lastActivity?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        }
        callback(stats)
      } else {
        callback(null)
      }
    })
  }
}
