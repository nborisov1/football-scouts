/**
 * Challenge Service - Firebase integration for challenge management
 * Handles CRUD operations for challenges with efficient querying
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { 
  Challenge, 
  ChallengeSubmission,
  PlayerChallengeProgress, 
  AgeGroup,
  Position,
  ChallengeMetric,
  ChallengeThreshold
} from '@/types/challenge'

// Collection names
const CHALLENGES_COLLECTION = 'challenges'
const CHALLENGE_SUBMISSIONS_COLLECTION = 'challengeSubmissions'
const PLAYER_PROGRESS_COLLECTION = 'playerChallengeProgress'

export interface ChallengeFilters {
  ageGroup?: AgeGroup
  position?: Position
  category?: string
  difficulty?: string
  isMonthlyChallenge?: boolean
  status?: string
}

export interface ChallengeQueryOptions {
  limit?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
}

export class ChallengeService {
  /**
   * Upload challenge video to Firebase Storage
   */
  static async uploadChallengeVideo(file: File, challengeId: string): Promise<string> {
    try {
      const fileName = `challenges/${challengeId}/video_${Date.now()}.${file.name.split('.').pop()}`
      const storageRef = ref(storage, fileName)
      
      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      return downloadURL
    } catch (error) {
      console.error('Error uploading challenge video:', error)
      throw new Error('Failed to upload challenge video')
    }
  }

  /**
   * Upload challenge thumbnail to Firebase Storage
   */
  static async uploadChallengeThumbnail(file: File, challengeId: string): Promise<string> {
    try {
      console.log('ChallengeService: Starting thumbnail upload for challenge:', challengeId)
      console.log('ChallengeService: File details:', { name: file.name, size: file.size, type: file.type })
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size too large. Maximum size: 5MB')
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Invalid file type. Only images are allowed')
      }
      
      const fileName = `challenges/${challengeId}/thumbnail_${Date.now()}.${file.name.split('.').pop()}`
      console.log('ChallengeService: Generated fileName:', fileName)
      
      const storageRef = ref(storage, fileName)
      console.log('ChallengeService: Created storage reference')
      
      console.log('ChallengeService: Starting uploadBytes...')
      const snapshot = await uploadBytes(storageRef, file)
      console.log('ChallengeService: Upload completed, getting download URL...')
      
      const downloadURL = await getDownloadURL(snapshot.ref)
      console.log('ChallengeService: Got download URL:', downloadURL)
      
      return downloadURL
    } catch (error) {
      console.error('ChallengeService: Error uploading challenge thumbnail:', error)
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('storage/unauthorized')) {
          throw new Error('Unauthorized: Check Firebase Storage rules')
        } else if (error.message.includes('storage/object-not-found')) {
          throw new Error('Storage object not found')
        } else if (error.message.includes('storage/bucket-not-found')) {
          throw new Error('Storage bucket not found')
        } else if (error.message.includes('storage/project-not-found')) {
          throw new Error('Firebase project not found')
        } else if (error.message.includes('storage/quota-exceeded')) {
          throw new Error('Storage quota exceeded')
        } else if (error.message.includes('storage/unauthenticated')) {
          throw new Error('User not authenticated')
        } else {
          throw new Error(`Upload failed: ${error.message}`)
        }
      }
      
      throw new Error('Failed to upload challenge thumbnail')
    }
  }

  /**
   * Delete challenge video from Firebase Storage
   */
  static async deleteChallengeVideo(videoUrl: string): Promise<void> {
    try {
      const videoRef = ref(storage, videoUrl)
      await deleteObject(videoRef)
    } catch (error) {
      console.error('Error deleting challenge video:', error)
      // Don't throw error as the file might not exist
    }
  }

  /**
   * Delete challenge thumbnail from Firebase Storage
   */
  static async deleteChallengeThumbnail(thumbnailUrl: string): Promise<void> {
    try {
      const thumbnailRef = ref(storage, thumbnailUrl)
      await deleteObject(thumbnailRef)
    } catch (error) {
      console.error('Error deleting challenge thumbnail:', error)
      // Don't throw error as the file might not exist
    }
  }

  /**
   * Create a new challenge
   */
  static async createChallenge(challengeData: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'>): Promise<Challenge> {
    try {
      // Filter out undefined values to prevent Firebase errors
      const cleanData = Object.fromEntries(
        Object.entries(challengeData).filter(([_, value]) => value !== undefined)
      )

      const docRef = await addDoc(collection(db, CHALLENGES_COLLECTION), {
        ...cleanData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // Get the created document to return with proper timestamps
      const doc = await getDoc(docRef)
      if (!doc.exists()) {
        throw new Error('Failed to create challenge')
      }

      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Challenge
    } catch (error) {
      console.error('Error creating challenge:', error)
      throw new Error('Failed to create challenge')
    }
  }

  /**
   * Update an existing challenge
   */
  static async updateChallenge(challengeId: string, updates: Partial<Challenge>): Promise<void> {
    try {
      // Filter out undefined values to prevent Firebase errors
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      )

      const challengeRef = doc(db, CHALLENGES_COLLECTION, challengeId)
      await updateDoc(challengeRef, {
        ...cleanUpdates,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating challenge:', error)
      throw new Error('Failed to update challenge')
    }
  }

  /**
   * Delete a challenge
   */
  static async deleteChallenge(challengeId: string): Promise<void> {
    try {
      // First get the challenge to delete associated files
      const challenge = await this.getChallenge(challengeId)
      
      // Delete associated files if they exist
      if (challenge) {
        if (challenge.videoUrl) {
          await this.deleteChallengeVideo(challenge.videoUrl)
        }
        if (challenge.thumbnailUrl) {
          await this.deleteChallengeThumbnail(challenge.thumbnailUrl)
        }
      }
      
      // Delete the challenge document
      const challengeRef = doc(db, CHALLENGES_COLLECTION, challengeId)
      await deleteDoc(challengeRef)
    } catch (error) {
      console.error('Error deleting challenge:', error)
      throw new Error('Failed to delete challenge')
    }
  }

  /**
   * Get a single challenge by ID
   */
  static async getChallenge(challengeId: string): Promise<Challenge | null> {
    try {
      const challengeRef = doc(db, CHALLENGES_COLLECTION, challengeId)
      const challengeDoc = await getDoc(challengeRef)
      
      if (!challengeDoc.exists()) {
        return null
      }

      const data = challengeDoc.data()
      return {
        id: challengeDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Challenge
    } catch (error) {
      console.error('Error getting challenge:', error)
      throw new Error('Failed to get challenge')
    }
  }

  /**
   * Get challenges with filters and options
   */
  static async getChallenges(
    filters: ChallengeFilters = {},
    options: ChallengeQueryOptions = {}
  ): Promise<Challenge[]> {
    try {
      let q = query(collection(db, CHALLENGES_COLLECTION))

      // Apply filters
      if (filters.ageGroup) {
        q = query(q, where('ageGroup', '==', filters.ageGroup))
      }
      
      if (filters.position && filters.position !== 'all') {
        q = query(q, where('positions', 'array-contains', filters.position))
      }
      
      if (filters.category) {
        q = query(q, where('category', '==', filters.category))
      }
      
      if (filters.difficulty) {
        q = query(q, where('difficulty', '==', filters.difficulty))
      }
      
      if (filters.isMonthlyChallenge !== undefined) {
        q = query(q, where('isMonthlyChallenge', '==', filters.isMonthlyChallenge))
      }
      
      if (filters.status) {
        q = query(q, where('status', '==', filters.status))
      }

      // Apply limit (before ordering to avoid index issues)
      if (options.limit) {
        q = query(q, limit(options.limit * 2)) // Get more to allow for client-side filtering
      }

      const querySnapshot = await getDocs(q)
      const challenges: Challenge[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        challenges.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Challenge)
      })

      // Apply client-side sorting to avoid composite index requirements
      const orderField = options.orderBy || 'level'
      const orderDirection = options.orderDirection || 'asc'
      
      challenges.sort((a, b) => {
        let aValue: any = a[orderField as keyof Challenge]
        let bValue: any = b[orderField as keyof Challenge]
        
        // Handle different data types
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }
        
        if (aValue < bValue) {
          return orderDirection === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return orderDirection === 'asc' ? 1 : -1
        }
        return 0
      })

      // Apply final limit after sorting
      if (options.limit) {
        return challenges.slice(0, options.limit)
      }

      return challenges
    } catch (error) {
      console.error('Error getting challenges:', error)
      throw new Error('Failed to get challenges')
    }
  }

  /**
   * Get challenges for a specific age group (optimized for players)
   */
  static async getChallengesForAgeGroup(ageGroup: AgeGroup): Promise<Challenge[]> {
    return this.getChallenges(
      { ageGroup, status: 'available' },
      { orderBy: 'level', orderDirection: 'asc' }
    )
  }

  /**
   * Get challenges for a specific age group and position
   */
  static async getChallengesForPlayer(ageGroup: AgeGroup, position: Position): Promise<Challenge[]> {
    const filters: ChallengeFilters = {
      ageGroup,
      status: 'available'
    }

    // Only filter by position if it's not 'all'
    if (position !== 'all') {
      filters.position = position
    }

    return this.getChallenges(filters, { orderBy: 'level', orderDirection: 'asc' })
  }

  /**
   * Get all age groups that have challenges
   */
  static async getAvailableAgeGroups(): Promise<AgeGroup[]> {
    try {
      const q = query(
        collection(db, CHALLENGES_COLLECTION),
        where('status', '==', 'available')
      )
      
      const querySnapshot = await getDocs(q)
      const ageGroups = new Set<AgeGroup>()
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.ageGroup) {
          ageGroups.add(data.ageGroup)
        }
      })
      
      return Array.from(ageGroups).sort()
    } catch (error) {
      console.error('Error getting available age groups:', error)
      return []
    }
  }

  /**
   * Get challenge statistics for admin dashboard
   */
  static async getChallengeStats(): Promise<{
    total: number
    byAgeGroup: Record<AgeGroup, number>
    byCategory: Record<string, number>
    byDifficulty: Record<string, number>
    monthlyChallenges: number
  }> {
    try {
      const challenges = await this.getChallenges()
      
      const stats = {
        total: challenges.length,
        byAgeGroup: {} as Record<AgeGroup, number>,
        byCategory: {} as Record<string, number>,
        byDifficulty: {} as Record<string, number>,
        monthlyChallenges: 0
      }
      
      challenges.forEach(challenge => {
        // Age group stats
        stats.byAgeGroup[challenge.ageGroup] = (stats.byAgeGroup[challenge.ageGroup] || 0) + 1
        
        // Category stats
        stats.byCategory[challenge.category] = (stats.byCategory[challenge.category] || 0) + 1
        
        // Difficulty stats
        stats.byDifficulty[challenge.difficulty] = (stats.byDifficulty[challenge.difficulty] || 0) + 1
        
        // Monthly challenges
        if (challenge.isMonthlyChallenge) {
          stats.monthlyChallenges++
        }
      })
      
      return stats
    } catch (error) {
      console.error('Error getting challenge stats:', error)
      return {
        total: 0,
        byAgeGroup: {} as Record<AgeGroup, number>,
        byCategory: {} as Record<string, number>,
        byDifficulty: {} as Record<string, number>,
        monthlyChallenges: 0
      }
    }
  }

  /**
   * Submit a challenge (create submission)
   */
  static async submitChallenge(
    submission: Omit<ChallengeSubmission, 'id' | 'submittedAt' | 'videoUrl'>, 
    videoFile?: File
  ): Promise<ChallengeSubmission> {
    try {
      let videoUrl = submission.videoUrl || ''
      
      // Upload video if provided
      if (videoFile) {
        console.log('Uploading challenge submission video...')
        videoUrl = await this.uploadChallengeVideo(videoFile, `submission_${Date.now()}`)
        console.log('Video uploaded successfully:', videoUrl)
      }

      // Filter out undefined values to prevent Firebase errors
      const cleanSubmission = Object.fromEntries(
        Object.entries({
          ...submission,
          videoUrl
        }).filter(([_, value]) => value !== undefined)
      )

      const docRef = await addDoc(collection(db, CHALLENGE_SUBMISSIONS_COLLECTION), {
        ...cleanSubmission,
        submittedAt: serverTimestamp()
      })

      const doc = await getDoc(docRef)
      if (!doc.exists()) {
        throw new Error('Failed to create submission')
      }

      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        videoUrl,
        submittedAt: data.submittedAt?.toDate() || new Date()
      } as ChallengeSubmission
    } catch (error) {
      console.error('Error submitting challenge:', error)
      throw new Error('Failed to submit challenge')
    }
  }

  /**
   * Get player's challenge submissions
   */
  static async getPlayerSubmissions(playerId: string): Promise<ChallengeSubmission[]> {
    try {
      const q = query(
        collection(db, CHALLENGE_SUBMISSIONS_COLLECTION),
        where('playerId', '==', playerId)
      )

      const querySnapshot = await getDocs(q)
      const submissions: ChallengeSubmission[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        submissions.push({
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate() || new Date(),
          reviewedAt: data.reviewedAt?.toDate()
        } as ChallengeSubmission)
      })

      // Sort client-side to avoid composite index requirements
      submissions.sort((a, b) => {
        return b.submittedAt.getTime() - a.submittedAt.getTime() // Descending order
      })

      return submissions
    } catch (error) {
      console.error('Error getting player submissions:', error)
      throw new Error('Failed to get player submissions')
    }
  }

  /**
   * Get player's progress for a specific challenge
   */
  static async getPlayerProgress(playerId: string, challengeId: string): Promise<PlayerChallengeProgress | null> {
    try {
      const q = query(
        collection(db, PLAYER_PROGRESS_COLLECTION),
        where('playerId', '==', playerId),
        where('challengeId', '==', challengeId)
      )

      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return null
      }

      const doc = querySnapshot.docs[0]
      const data = doc.data()
      
      return {
        id: doc.id,
        ...data,
        startedAt: data.startedAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
        submittedAt: data.submittedAt?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as PlayerChallengeProgress
    } catch (error) {
      console.error('Error getting player progress:', error)
      throw new Error('Failed to get player progress')
    }
  }

  /**
   * Update player progress
   */
  static async updatePlayerProgress(progress: PlayerChallengeProgress): Promise<void> {
    try {
      const progressRef = doc(db, PLAYER_PROGRESS_COLLECTION, progress.id)
      await updateDoc(progressRef, {
        ...progress,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating player progress:', error)
      throw new Error('Failed to update player progress')
    }
  }

  /**
   * Create initial player progress for a challenge
   */
  static async createPlayerProgress(progress: Omit<PlayerChallengeProgress, 'id' | 'createdAt' | 'updatedAt'>): Promise<PlayerChallengeProgress> {
    try {
      // Filter out undefined values to prevent Firebase errors
      const cleanProgress = Object.fromEntries(
        Object.entries(progress).filter(([_, value]) => value !== undefined)
      )

      const docRef = await addDoc(collection(db, PLAYER_PROGRESS_COLLECTION), {
        ...cleanProgress,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      const doc = await getDoc(docRef)
      if (!doc.exists()) {
        throw new Error('Failed to create player progress')
      }

      const data = doc.data()
    return {
        id: doc.id,
        ...data,
        startedAt: data.startedAt?.toDate(),
        completedAt: data.completedAt?.toDate(),
        submittedAt: data.submittedAt?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as PlayerChallengeProgress
    } catch (error) {
      console.error('Error creating player progress:', error)
      throw new Error('Failed to create player progress')
    }
  }
}

// Export the class directly since all methods are static
export { ChallengeService as challengeService }