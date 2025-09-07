'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import CollectionDetailPage from '@/components/admin/CollectionDetailPage'
import { videoService } from '@/lib/videoService'
import type { VideoMetadata } from '@/types/video'

export default function CollectionDetailRoute() {
  const params = useParams()
  const collectionId = params.id as string
  const [videos, setVideos] = useState<VideoMetadata[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true)
        const videosData = await videoService.getVideos()
        // Ensure we always set an array
        if (Array.isArray(videosData)) {
          setVideos(videosData)
        } else {
          console.warn('getVideos() returned non-array:', videosData)
          setVideos([])
        }
      } catch (error) {
        console.error('Error loading videos:', error)
        setVideos([]) // Set empty array as fallback
      } finally {
        setLoading(false)
      }
    }

    loadVideos()
  }, [])

  const handleCollectionUpdated = (updatedCollection: any) => {
    // Handle collection update if needed
    console.log('Collection updated:', updatedCollection)
  }

  const handleCollectionDeleted = (deletedCollectionId: string) => {
    // Handle collection deletion if needed
    console.log('Collection deleted:', deletedCollectionId)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    )
  }

  // Debug log
  console.log('Passing videos to CollectionDetailPage:', videos, 'Type:', typeof videos, 'IsArray:', Array.isArray(videos))

  return (
    <CollectionDetailPage
      collectionId={collectionId}
      videos={videos}
      onCollectionUpdated={handleCollectionUpdated}
      onCollectionDeleted={handleCollectionDeleted}
    />
  )
}
