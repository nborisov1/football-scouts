/**
 * Firebase Video Service for Football Scouting Platform
 * Handles video upload, storage, metadata management, and retrieval
 */

import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  getMetadata,
  updateMetadata as updateStorageMetadata
} from 'firebase/storage'
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
  startAfter,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore'
import { storage, db } from './firebase'
import type { 
  VideoMetadata, 
  VideoUpload, 
  VideoFilter, 
  VideoSort, 
  VideoStats,
  VideoUploadConfig,
  VideoCollection
} from '@/types/video'
import { DEFAULT_VIDEO_CONFIG } from '@/types/video'

// Collection names
const VIDEOS_COLLECTION = 'videos'
const VIDEO_COLLECTIONS_COLLECTION = 'videoCollections'
const VIDEO_STATS_DOC = 'videoStats'

/**
 * Video Service Class
 * Provides all video-related operations
 */
export class VideoService {
  private config: VideoUploadConfig

  constructor(config: VideoUploadConfig = DEFAULT_VIDEO_CONFIG) {
    this.config = config
  }

  /**
   * Upload a video file with metadata to Firebase Storage and Firestore
   */
  async uploadVideo(
    videoUpload: VideoUpload,
    onProgress?: (progress: number) => void,
    onStatusChange?: (status: VideoUpload['uploadStatus']) => void
  ): Promise<VideoMetadata> {
    try {
      onStatusChange?.('preparing')
      
      // Validate file
      this.validateVideoFile(videoUpload.file)
      
      // Generate unique filename
      const timestamp = Date.now()
      const fileName = `${timestamp}_${videoUpload.file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const videoRef = ref(storage, `videos/${fileName}`)
      
      onStatusChange?.('uploading')
      
      // Start upload with progress tracking
      const uploadTask = uploadBytesResumable(videoRef, videoUpload.file, {
        customMetadata: {
          originalName: videoUpload.file.name,
          uploadedBy: videoUpload.metadata.uploadedBy,
          category: videoUpload.metadata.category,
          exerciseType: videoUpload.metadata.exerciseType
        }
      })
      
      // Monitor upload progress
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            onProgress?.(progress)
          },
          (error) => {
            console.error('Upload error:', error)
            reject(new Error(`Upload failed: ${error.message}`))
          },
          async () => {
            try {
              onStatusChange?.('processing')
              
              // Get download URL
              const videoUrl = await getDownloadURL(uploadTask.snapshot.ref)
              
              // Generate thumbnail if needed
              let thumbnailUrl: string | undefined
              if (this.config.autoGenerateThumbnail) {
                thumbnailUrl = await this.generateThumbnail(videoUrl, fileName)
              }
              
              // Create complete metadata
              const videoMetadata: VideoMetadata = {
                ...videoUpload.metadata,
                id: '', // Will be set by Firestore
                fileName,
                fileSize: videoUpload.file.size,
                videoUrl,
                thumbnailUrl,
                uploadedAt: new Date(),
                lastModified: new Date(),
                views: 0,
                likes: 0,
                downloads: 0
              }
              
              // Prepare data for Firestore, excluding undefined values
              const firestoreData: any = {
                ...videoMetadata,
                uploadedAt: serverTimestamp(),
                lastModified: serverTimestamp()
              }
              
              // Remove undefined fields
              Object.keys(firestoreData).forEach(key => {
                if (firestoreData[key] === undefined) {
                  delete firestoreData[key]
                }
              })
              
              // Save metadata to Firestore
              const docRef = await addDoc(collection(db, VIDEOS_COLLECTION), firestoreData)
              
              // Update with document ID
              videoMetadata.id = docRef.id
              await updateDoc(docRef, { id: docRef.id })
              
              // Update statistics
              await this.updateVideoStats('upload', videoMetadata)
              
              onStatusChange?.('completed')
              resolve(videoMetadata)
              
            } catch (error) {
              console.error('Post-upload processing error:', error)
              reject(new Error(`Post-upload processing failed: ${error}`))
            }
          }
        )
      })
      
    } catch (error) {
      console.error('Video upload error:', error)
      throw error
    }
  }

  /**
   * Validate video file against configuration
   */
  private validateVideoFile(file: File): void {
    // Check file size
    if (file.size > this.config.maxFileSize) {
      throw new Error(`קובץ גדול מדי. גודל מקסימלי: ${this.formatFileSize(this.config.maxFileSize)}`)
    }
    
    // Check file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !this.config.allowedFormats.includes(fileExtension)) {
      throw new Error(`פורמט קובץ לא נתמך. פורמטים נתמכים: ${this.config.allowedFormats.join(', ')}`)
    }
    
    // Additional validations can be added here
    if (file.type && !file.type.startsWith('video/')) {
      throw new Error('הקובץ חייב להיות קובץ וידאו')
    }
  }

  /**
   * Generate thumbnail for video (placeholder implementation)
   */
  private async generateThumbnail(videoUrl: string, fileName: string): Promise<string | undefined> {
    // This is a placeholder - in a real implementation, you might use:
    // - Canvas API to extract frame from video
    // - Third-party service for thumbnail generation
    // - Cloud function for server-side thumbnail generation
    
    try {
      // For now, return undefined - thumbnails can be uploaded manually
      // TODO: Implement actual thumbnail generation
      return undefined
    } catch (error) {
      console.warn('Thumbnail generation failed:', error)
      return undefined
    }
  }

  /**
   * Upload thumbnail image for a video
   */
  async uploadThumbnail(
    videoId: string,
    thumbnailFile: File,
    onProgress?: (progress: number) => void,
    onStatusChange?: (status: 'preparing' | 'uploading' | 'processing' | 'completed' | 'error') => void
  ): Promise<string> {
    try {
      onStatusChange?.('preparing')
      
      // Validate file
      if (!thumbnailFile.type.startsWith('image/')) {
        throw new Error('הקובץ חייב להיות תמונה')
      }
      
      // Check file size (max 5MB for thumbnails)
      if (thumbnailFile.size > 5 * 1024 * 1024) {
        throw new Error('קובץ התמונה גדול מדי (מקסימום 5MB)')
      }
      
      // Generate unique filename
      const timestamp = Date.now()
      const fileName = `thumbnails/${timestamp}_${thumbnailFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const thumbnailRef = ref(storage, fileName)
      
      onStatusChange?.('uploading')
      
      // Start upload with progress tracking
      const uploadTask = uploadBytesResumable(thumbnailRef, thumbnailFile, {
        customMetadata: {
          originalName: thumbnailFile.name,
          videoId: videoId,
          uploadedBy: 'admin' // This should be passed as parameter
        }
      })
      
      // Monitor upload progress
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            onProgress?.(progress)
          },
          (error) => {
            console.error('Thumbnail upload error:', error)
            onStatusChange?.('error')
            reject(new Error(`Thumbnail upload failed: ${error.message}`))
          },
          async () => {
            try {
              onStatusChange?.('processing')
              
              // Get download URL
              const thumbnailUrl = await getDownloadURL(uploadTask.snapshot.ref)
              
              // Update video metadata with thumbnail URL
              await this.updateVideo(videoId, { thumbnailUrl })
              
              onStatusChange?.('completed')
              resolve(thumbnailUrl)
              
            } catch (error) {
              console.error('Thumbnail processing error:', error)
              onStatusChange?.('error')
              reject(new Error(`Thumbnail processing failed: ${error}`))
            }
          }
        )
      })
      
    } catch (error) {
      console.error('Thumbnail upload error:', error)
      onStatusChange?.('error')
      throw error
    }
  }


  /**
   * Get videos with filtering and pagination
   */
  async getVideos(
    filter?: VideoFilter,
    sort?: VideoSort,
    pageSize: number = 20,
    lastDocId?: string
  ): Promise<{ videos: VideoMetadata[], hasMore: boolean, lastDocId?: string }> {
    try {
      let baseQuery = collection(db, VIDEOS_COLLECTION)
      let constraints: any[] = []
      
      // Simplified filtering to avoid complex composite indexes
      // We'll apply most filters client-side for now
      
      // Avoid composite index requirements by using only single field queries
      // We'll do all filtering client-side to avoid index issues
      
      // Simple sorting (uploadedAt is auto-indexed)
      const sortField = sort?.field === 'uploadedAt' ? 'uploadedAt' : 'uploadedAt'
      const sortDirection = sort?.direction || 'desc'
      constraints.push(orderBy(sortField, sortDirection))
      
      // Apply pagination
      if (lastDocId) {
        const lastDoc = await getDoc(doc(db, VIDEOS_COLLECTION, lastDocId))
        if (lastDoc.exists()) {
          constraints.push(startAfter(lastDoc))
        }
      }
      
      constraints.push(limit(pageSize + 1)) // Get one extra to check if there are more
      
      const q = query(baseQuery, ...constraints)
      
      const snapshot = await getDocs(q)
      const videos: VideoMetadata[] = []
      const hasMore = snapshot.docs.length > pageSize
      
      // Take only the requested pageSize
      const docsToProcess = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs
      
      docsToProcess.forEach((doc) => {
        const data = doc.data()
        videos.push({
          ...data,
          id: doc.id,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          lastModified: data.lastModified?.toDate() || new Date(),
          moderatedAt: data.moderatedAt?.toDate()
        } as VideoMetadata)
      })
      
      
      // Apply client-side filters
      let filteredVideos = videos
      
      if (filter) {
        // Status filter (if not already applied server-side)
        if (filter.status && filter.status.length > 1) {
          filteredVideos = filteredVideos.filter(video => filter.status!.includes(video.status))
        }
        
        // Category filter
        if (filter.category && filter.category.length > 0) {
          filteredVideos = filteredVideos.filter(video => filter.category!.includes(video.category))
        }
        
        // Exercise type filter
        if (filter.exerciseType && filter.exerciseType.length > 0) {
          filteredVideos = filteredVideos.filter(video => filter.exerciseType!.includes(video.exerciseType))
        }
        
        // Skill level filter
        if (filter.skillLevel && filter.skillLevel.length > 0) {
          filteredVideos = filteredVideos.filter(video => filter.skillLevel!.includes(video.skillLevel))
        }
        
        // Tags filter
        if (filter.tags && filter.tags.length > 0) {
          filteredVideos = filteredVideos.filter(video => 
            filter.tags!.some(tag => video.tags.includes(tag))
          )
        }
        
        // Text search filter
        if (filter.searchQuery) {
          const searchTerm = filter.searchQuery.toLowerCase()
          filteredVideos = filteredVideos.filter(video => 
            video.title.toLowerCase().includes(searchTerm) ||
            video.description.toLowerCase().includes(searchTerm) ||
            video.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
            video.playerInfo?.playerName.toLowerCase().includes(searchTerm)
          )
        }
      }
      
      // Apply client-side sorting if different from server-side
      if (sort && sort.field !== 'uploadedAt') {
        filteredVideos.sort((a, b) => {
          let aValue: any, bValue: any
          
          switch (sort.field) {
            case 'title':
              aValue = a.title.toLowerCase()
              bValue = b.title.toLowerCase()
              break
            case 'views':
              aValue = a.views
              bValue = b.views
              break
            case 'status':
              aValue = a.status
              bValue = b.status
              break
            case 'duration':
              aValue = a.duration
              bValue = b.duration
              break
            default:
              return 0
          }
          
          if (sort.direction === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
          }
        })
      }
      
      // Since we're not doing complex filtering for admin, just return the results
      return {
        videos: filteredVideos,
        hasMore,
        lastDocId: filteredVideos.length > 0 ? filteredVideos[filteredVideos.length - 1].id : undefined
      }
      
    } catch (error) {
      console.error('Error getting videos:', error)
      throw new Error('Failed to fetch videos from database')
    }
  }

  /**
   * Get a single video by ID
   */
  async getVideo(id: string): Promise<VideoMetadata | null> {
    try {
      const docRef = doc(db, VIDEOS_COLLECTION, id)
      const snapshot = await getDoc(docRef)
      
      if (!snapshot.exists()) {
        return null
      }
      
      const data = snapshot.data()
      return {
        ...data,
        id: snapshot.id,
        uploadedAt: data.uploadedAt?.toDate() || new Date(),
        lastModified: data.lastModified?.toDate() || new Date(),
        moderatedAt: data.moderatedAt?.toDate()
      } as VideoMetadata
      
    } catch (error) {
      console.error('Error getting video:', error)
      throw new Error('Failed to fetch video')
    }
  }

  /**
   * Create a difficulty variant of an existing video
   */
  async createVariant(
    baseVideoId: string, 
    variantMetadata: Omit<VideoMetadata, 'id' | 'uploadedAt' | 'lastModified' | 'videoUrl' | 'thumbnailUrl' | 'views' | 'likes' | 'downloads'>
  ): Promise<VideoMetadata> {
    try {
      // Get base video to copy video file references
      const baseVideoDoc = await this.getVideo(baseVideoId)
      if (!baseVideoDoc) {
        throw new Error('Base video not found')
      }
      
      // Create variant metadata with same video file but different metadata
      const completeVariantMetadata: VideoMetadata = {
        ...variantMetadata,
        id: '', // Will be set by Firestore
        videoUrl: baseVideoDoc.videoUrl, // Same video file
        thumbnailUrl: baseVideoDoc.thumbnailUrl, // Same thumbnail
        uploadedAt: new Date(),
        lastModified: new Date(),
        views: 0,
        likes: 0,
        downloads: 0
      }
      
      // Prepare data for Firestore
      const firestoreData: any = {
        ...completeVariantMetadata,
        uploadedAt: serverTimestamp(),
        lastModified: serverTimestamp()
      }
      
      // Remove undefined fields
      Object.keys(firestoreData).forEach(key => {
        if (firestoreData[key] === undefined) {
          delete firestoreData[key]
        }
      })
      
      // Save to Firestore
      const docRef = await addDoc(collection(db, VIDEOS_COLLECTION), firestoreData)
      
      // Return complete metadata
      const createdVariant: VideoMetadata = {
        ...completeVariantMetadata,
        id: docRef.id,
        uploadedAt: new Date(),
        lastModified: new Date()
      }
      
      return createdVariant
      
    } catch (error) {
      console.error('Error creating video variant:', error)
      throw new Error(error instanceof Error ? error.message : 'Failed to create video variant')
    }
  }

  /**
   * Update video metadata
   */
  async updateVideo(id: string, updates: Partial<VideoMetadata>): Promise<void> {
    try {
      const docRef = doc(db, VIDEOS_COLLECTION, id)
      
      const updateData = {
        ...updates,
        lastModified: serverTimestamp()
      }
      
      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData]
        }
      })
      
      await updateDoc(docRef, updateData)
      
    } catch (error) {
      console.error('Error updating video:', error)
      throw new Error('Failed to update video')
    }
  }

  /**
   * Moderate video (approve/reject)
   */
  async moderateVideo(
    id: string, 
    status: 'approved' | 'rejected', 
    moderatorId: string,
    notes?: string
  ): Promise<void> {
    try {
      const updateData = {
        status,
        moderatedBy: moderatorId,
        moderatedAt: serverTimestamp(),
        moderationNotes: notes,
        lastModified: serverTimestamp()
      }
      
      await updateDoc(doc(db, VIDEOS_COLLECTION, id), updateData)
      
      // Update statistics
      const video = await this.getVideo(id)
      if (video) {
        await this.updateVideoStats('moderate', video)
      }
      
    } catch (error) {
      console.error('Error moderating video:', error)
      throw new Error('Failed to moderate video')
    }
  }

  /**
   * Delete video and associated files
   */
  async deleteVideo(id: string): Promise<void> {
    try {
      // Get video metadata first
      const video = await this.getVideo(id)
      if (!video) {
        throw new Error('Video not found')
      }
      
      // Delete from Firestore
      await deleteDoc(doc(db, VIDEOS_COLLECTION, id))
      
      // Delete video file from Storage
      if (video.fileName) {
        const videoRef = ref(storage, `videos/${video.fileName}`)
        try {
          await deleteObject(videoRef)
        } catch (error) {
          console.warn('Failed to delete video file from storage:', error)
        }
      }
      
      // Delete thumbnail if exists
      if (video.thumbnailUrl) {
        const thumbnailName = video.thumbnailUrl.split('/').pop()?.split('?')[0]
        if (thumbnailName) {
          const thumbnailRef = ref(storage, `thumbnails/${thumbnailName}`)
          try {
            await deleteObject(thumbnailRef)
          } catch (error) {
            console.warn('Failed to delete thumbnail from storage:', error)
          }
        }
      }
      
      // Update statistics
      await this.updateVideoStats('delete', video)
      
    } catch (error) {
      console.error('Error deleting video:', error)
      throw new Error('Failed to delete video')
    }
  }

  /**
   * Get video statistics
   */
  async getVideoStats(): Promise<VideoStats> {
    try {
      // This could be cached in a separate document for performance
      const snapshot = await getDocs(collection(db, VIDEOS_COLLECTION))
      
      let total = 0
      let pending = 0
      let approved = 0
      let rejected = 0
      const byCategory: Record<string, number> = {}
      const byExerciseType: Record<string, number> = {}
      let totalSize = 0
      let totalDuration = 0
      let recentUploads = 0
      
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      snapshot.docs.forEach(doc => {
        const data = doc.data() as VideoMetadata
        total++
        
        // Status counts
        switch (data.status) {
          case 'pending': pending++; break
          case 'approved': approved++; break
          case 'rejected': rejected++; break
        }
        
        // Category counts
        byCategory[data.category] = (byCategory[data.category] || 0) + 1
        
        // Exercise type counts
        byExerciseType[data.exerciseType] = (byExerciseType[data.exerciseType] || 0) + 1
        
        // Size and duration
        totalSize += data.fileSize || 0
        totalDuration += data.duration || 0
        
        // Recent uploads
        const uploadDate = data.uploadedAt instanceof Date ? data.uploadedAt : new Date(data.uploadedAt)
        if (uploadDate > weekAgo) {
          recentUploads++
        }
      })
      
      return {
        total,
        pending,
        approved,
        rejected,
        byCategory: byCategory as any,
        byExerciseType: byExerciseType as any,
        recentUploads,
        totalSize,
        averageDuration: total > 0 ? totalDuration / total : 0
      }
      
    } catch (error) {
      console.error('Error getting video stats:', error)
      throw new Error('Failed to fetch video statistics')
    }
  }

  /**
   * Update video statistics (helper method)
   */
  private async updateVideoStats(operation: 'upload' | 'delete' | 'moderate', video: VideoMetadata): Promise<void> {
    try {
      // This is a simplified implementation
      // In a production app, you might want to use Cloud Functions for this
      const statsRef = doc(db, 'analytics', VIDEO_STATS_DOC)
      
      const updates: Record<string, any> = {
        lastUpdated: serverTimestamp()
      }
      
      switch (operation) {
        case 'upload':
          updates.totalUploads = increment(1)
          updates.totalSize = increment(video.fileSize)
          break
        case 'delete':
          updates.totalDeletes = increment(1)
          break
        case 'moderate':
          if (video.status === 'approved') {
            updates.totalApproved = increment(1)
          } else if (video.status === 'rejected') {
            updates.totalRejected = increment(1)
          }
          break
      }
      
      await updateDoc(statsRef, updates)
      
    } catch (error) {
      console.warn('Failed to update video stats:', error)
      // Don't throw error as this is not critical
    }
  }

  /**
   * Increment video view count
   */
  async incrementViews(id: string): Promise<void> {
    try {
      const docRef = doc(db, VIDEOS_COLLECTION, id)
      await updateDoc(docRef, {
        views: increment(1),
        lastModified: serverTimestamp()
      })
    } catch (error) {
      console.warn('Failed to increment view count:', error)
    }
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Create a new video collection
   */
  async createCollection(
    title: string,
    description: string,
    videoIds: string[],
    category: VideoCollection['category'],
    tags: string[] = [],
    isPublic: boolean = true,
    isFeatured: boolean = false,
    createdBy: string
  ): Promise<VideoCollection> {
    try {
      // Get video details to calculate metadata
      const videos = await Promise.all(
        videoIds.map(id => this.getVideo(id))
      )
      
      const validVideos = videos.filter(video => video !== null) as VideoMetadata[]
      const totalDuration = validVideos.reduce((sum, video) => sum + video.duration, 0)
      
      // Generate thumbnail from first video if available
      const thumbnailUrl = validVideos.length > 0 ? validVideos[0].thumbnailUrl : undefined
      
      const collectionData: Omit<VideoCollection, 'id'> = {
        title,
        description,
        thumbnailUrl,
        videos: videoIds,
        videoCount: videoIds.length,
        totalDuration,
        category,
        tags,
        isPublic,
        isFeatured,
        sortOrder: 0,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // Prepare data for Firestore, excluding undefined values
      const firestoreData: any = {
        title: collectionData.title,
        description: collectionData.description,
        videos: collectionData.videos,
        videoCount: collectionData.videoCount,
        totalDuration: collectionData.totalDuration,
        category: collectionData.category,
        tags: collectionData.tags,
        isPublic: collectionData.isPublic,
        isFeatured: collectionData.isFeatured,
        sortOrder: collectionData.sortOrder,
        createdBy: collectionData.createdBy,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      // Only include thumbnailUrl if it's not undefined
      if (collectionData.thumbnailUrl !== undefined) {
        firestoreData.thumbnailUrl = collectionData.thumbnailUrl
      }
      
      const docRef = await addDoc(collection(db, VIDEO_COLLECTIONS_COLLECTION), firestoreData)
      
      return {
        ...collectionData,
        id: docRef.id
      }
      
    } catch (error) {
      console.error('Error creating collection:', error)
      throw new Error('Failed to create collection')
    }
  }

  /**
   * Get all video collections
   */
  async getCollections(): Promise<VideoCollection[]> {
    try {
      const q = query(
        collection(db, VIDEO_COLLECTIONS_COLLECTION),
        orderBy('createdAt', 'desc')
      )
      
      const snapshot = await getDocs(q)
      const collections: VideoCollection[] = []
      
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        collections.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as VideoCollection)
      })
      
      return collections
      
    } catch (error) {
      console.error('Error getting collections:', error)
      throw new Error('Failed to fetch collections')
    }
  }

  /**
   * Get a single collection by ID
   */
  async getCollection(id: string): Promise<VideoCollection | null> {
    try {
      const docRef = doc(db, VIDEO_COLLECTIONS_COLLECTION, id)
      const snapshot = await getDoc(docRef)
      
      if (!snapshot.exists()) {
        return null
      }
      
      const data = snapshot.data()
      return {
        ...data,
        id: snapshot.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as VideoCollection
      
    } catch (error) {
      console.error('Error getting collection:', error)
      throw new Error('Failed to fetch collection')
    }
  }

  /**
   * Update a video collection
   */
  async updateCollection(
    id: string, 
    updates: Partial<Omit<VideoCollection, 'id' | 'createdAt' | 'createdBy'>>
  ): Promise<void> {
    try {
      const docRef = doc(db, VIDEO_COLLECTIONS_COLLECTION, id)
      
      // If videos are being updated, recalculate metadata
      if (updates.videos) {
        const videos = await Promise.all(
          updates.videos.map(videoId => this.getVideo(videoId))
        )
        const validVideos = videos.filter(video => video !== null) as VideoMetadata[]
        
        updates.videoCount = updates.videos.length
        updates.totalDuration = validVideos.reduce((sum, video) => sum + video.duration, 0)
        
        // Update thumbnail if first video changed
        if (validVideos.length > 0) {
          updates.thumbnailUrl = validVideos[0].thumbnailUrl
        }
      }
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      }
      
      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData]
        }
      })
      
      await updateDoc(docRef, updateData)
      
    } catch (error) {
      console.error('Error updating collection:', error)
      throw new Error('Failed to update collection')
    }
  }

  /**
   * Delete a video collection
   */
  async deleteCollection(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, VIDEO_COLLECTIONS_COLLECTION, id))
    } catch (error) {
      console.error('Error deleting collection:', error)
      throw new Error('Failed to delete collection')
    }
  }

  /**
   * Add videos to a collection
   */
  async addVideosToCollection(collectionId: string, videoIds: string[]): Promise<void> {
    try {
      const collection = await this.getCollection(collectionId)
      if (!collection) {
        throw new Error('Collection not found')
      }
      
      const updatedVideos = [...new Set([...collection.videos, ...videoIds])]
      await this.updateCollection(collectionId, { videos: updatedVideos })
      
    } catch (error) {
      console.error('Error adding videos to collection:', error)
      throw new Error('Failed to add videos to collection')
    }
  }

  /**
   * Remove videos from a collection
   */
  async removeVideosFromCollection(collectionId: string, videoIds: string[]): Promise<void> {
    try {
      const collection = await this.getCollection(collectionId)
      if (!collection) {
        throw new Error('Collection not found')
      }
      
      const updatedVideos = collection.videos.filter(id => !videoIds.includes(id))
      await this.updateCollection(collectionId, { videos: updatedVideos })
      
    } catch (error) {
      console.error('Error removing videos from collection:', error)
      throw new Error('Failed to remove videos from collection')
    }
  }
}

// Export singleton instance
export const videoService = new VideoService()

// Export additional utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 בייט'
  
  const k = 1024
  const sizes = ['בייט', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const validateVideoFile = (file: File, config: VideoUploadConfig = DEFAULT_VIDEO_CONFIG): { valid: boolean, error?: string } => {
  try {
    const service = new VideoService(config)
    service['validateVideoFile'](file) // Access private method for validation
    return { valid: true }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
