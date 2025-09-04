'use client'

/**
 * Admin Videos Management - Video approval/rejection interface
 * Replaces admin/videos.html + js/admin-videos.js functionality
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { USER_TYPES } from '@/lib/firebase'
import { showMessage } from '@/components/MessageContainer'

interface Video {
  id: string
  title: string
  playerName: string
  playerId: string
  uploadDate: string
  duration: string
  status: 'pending' | 'approved' | 'rejected'
  thumbnailUrl: string
  videoUrl: string
  description: string
  challenge?: string
}

export default function AdminVideos() {
  const { user } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Redirect if not admin
  if (!user || user.type !== USER_TYPES.ADMIN) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">גישה מוגבלת</h2>
          <p className="text-gray-600">דף זה זמין רק למנהלי המערכת</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    // Load videos - this would normally fetch from Firestore
    const mockVideos: Video[] = [
      {
        id: '1',
        title: 'אתגר ז\'אגלינג',
        playerName: 'יוסי כהן',
        playerId: 'player1',
        uploadDate: '2025-01-15',
        duration: '2:34',
        status: 'pending',
        thumbnailUrl: '/images/placeholder.md',
        videoUrl: '#',
        description: 'ביצוע אתגר ז\'אגלינג 20 פעמים',
        challenge: 'אתגר ז\'אגלינג'
      },
      {
        id: '2',
        title: 'תרגיל דריבל',
        playerName: 'מיכל לוי',
        playerId: 'player2',
        uploadDate: '2025-01-14',
        duration: '1:45',
        status: 'pending',
        thumbnailUrl: '/images/placeholder.md',
        videoUrl: '#',
        description: 'ביצוע תרגיל דריבל מורכב',
        challenge: 'תרגיל דריבל'
      },
      {
        id: '3',
        title: 'בעיטות מדויקות',
        playerName: 'דני שמיר',
        playerId: 'player3',
        uploadDate: '2025-01-13',
        duration: '3:12',
        status: 'approved',
        thumbnailUrl: '/images/placeholder.md',
        videoUrl: '#',
        description: '10 בעיטות מדויקות למטרה',
        challenge: 'בעיטות מדויקות'
      }
    ]
    setVideos(mockVideos)
  }, [])

  const filteredVideos = videos.filter(video => 
    filter === 'all' ? true : video.status === filter
  )

  const handleVideoAction = (videoId: string, action: 'approve' | 'reject', feedback?: string) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { ...video, status: action === 'approve' ? 'approved' : 'rejected' }
        : video
    ))
    
    const actionText = action === 'approve' ? 'אושר' : 'נדחה'
    showMessage(`הסרטון ${actionText} בהצלחה`, 'success')
    setShowModal(false)
    setSelectedVideo(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'ממתין'
      case 'approved': return 'אושר'
      case 'rejected': return 'נדחה'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ניהול סרטונים</h1>
              <p className="text-gray-600">אשר או דחה סרטונים שהועלו על ידי שחקנים</p>
            </div>
            <div className="flex space-x-4 space-x-reverse">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="all">כל הסרטונים</option>
                <option value="pending">ממתינים לאישור</option>
                <option value="approved">מאושרים</option>
                <option value="rejected">נדחים</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Video Thumbnail */}
              <div className="aspect-video bg-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-play-circle text-4xl text-gray-400"></i>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(video.status)}`}>
                    {getStatusText(video.status)}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </span>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{video.title}</h3>
                <p className="text-gray-600 text-sm mb-2">שחקן: {video.playerName}</p>
                <p className="text-gray-500 text-sm mb-3">{video.description}</p>
                {video.challenge && (
                  <p className="text-blue-600 text-sm mb-3">
                    <i className="fas fa-trophy ml-1"></i>
                    {video.challenge}
                  </p>
                )}
                <p className="text-gray-400 text-xs mb-4">
                  הועלה: {new Date(video.uploadDate).toLocaleDateString('he-IL')}
                </p>

                {/* Action Buttons */}
                <div className="flex space-x-2 space-x-reverse">
                  <button
                    onClick={() => {
                      setSelectedVideo(video)
                      setShowModal(true)
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <i className="fas fa-eye ml-1"></i>
                    צפה וטפל
                  </button>
                  {video.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleVideoAction(video.id, 'approve')}
                        className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button
                        onClick={() => handleVideoAction(video.id, 'reject')}
                        className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-video text-gray-300 text-6xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">אין סרטונים</h3>
            <p className="text-gray-500">לא נמצאו סרטונים בקטגוריה זו</p>
          </div>
        )}
      </div>

      {/* Video Review Modal */}
      {showModal && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">בדיקת סרטון</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              {/* Video Player Placeholder */}
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-play-circle text-6xl text-gray-400 mb-2"></i>
                  <p className="text-gray-600">נגן וידאו יהיה כאן</p>
                </div>
              </div>

              {/* Video Details */}
              <div className="space-y-3 mb-6">
                <div>
                  <span className="font-medium">כותרת: </span>
                  <span>{selectedVideo.title}</span>
                </div>
                <div>
                  <span className="font-medium">שחקן: </span>
                  <span>{selectedVideo.playerName}</span>
                </div>
                <div>
                  <span className="font-medium">תיאור: </span>
                  <span>{selectedVideo.description}</span>
                </div>
                <div>
                  <span className="font-medium">אתגר: </span>
                  <span>{selectedVideo.challenge}</span>
                </div>
                <div>
                  <span className="font-medium">משך: </span>
                  <span>{selectedVideo.duration}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedVideo.status === 'pending' && (
                <div className="flex space-x-3 space-x-reverse">
                  <button
                    onClick={() => handleVideoAction(selectedVideo.id, 'approve')}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <i className="fas fa-check ml-2"></i>
                    אשר סרטון
                  </button>
                  <button
                    onClick={() => handleVideoAction(selectedVideo.id, 'reject')}
                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <i className="fas fa-times ml-2"></i>
                    דחה סרטון
                  </button>
                </div>
              )}

              {selectedVideo.status !== 'pending' && (
                <div className="text-center p-3 rounded-lg bg-gray-100">
                  <span className="text-gray-600">
                    סרטון זה כבר {getStatusText(selectedVideo.status)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
