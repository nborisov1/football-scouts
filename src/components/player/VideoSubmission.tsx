'use client'

/**
 * Video Submission Component for Players
 * Allows players to upload videos of themselves performing exercises
 */

import React, { useState, useRef } from 'react'
import { showMessage } from '../MessageContainer'
import { VideoMetadata, PlayerVideoSubmission } from '@/types/video'

interface VideoSubmissionProps {
  videoId: string
  seriesId: string
  videoTitle: string
  instructions: string
  onSubmissionComplete: (submission: PlayerVideoSubmission) => void
  onCancel: () => void
}

export default function VideoSubmission({
  videoId,
  seriesId,
  videoTitle,
  instructions,
  onSubmissionComplete,
  onCancel
}: VideoSubmissionProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: true 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      recordedChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
        const file = new File([blob], `submission-${Date.now()}.webm`, { type: 'video/webm' })
        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(blob))
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      showMessage('שגיאה בהתחלת ההקלטה. אנא בדוק את הרשאות המצלמה', 'error')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      // Stop all tracks
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      showMessage('נא לבחור סרטון להעלאה', 'error')
      return
    }

    setIsUploading(true)
    
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const submission: PlayerVideoSubmission = {
        id: `submission-${Date.now()}`,
        playerId: 'current-player-id', // This will come from auth context
        videoId,
        seriesId,
        videoUrl: 'uploaded-video-url', // This will be the actual uploaded URL
        thumbnailUrl: 'thumbnail-url',
        submittedAt: new Date(),
        status: 'pending',
        resubmissionCount: 0,
        maxResubmissions: 3
      }

      onSubmissionComplete(submission)
    } catch (error) {
      console.error('Upload error:', error)
      showMessage('שגיאה בהעלאת הסרטון. אנא נסה שוב', 'error')
    } finally {
      setIsUploading(false)
    }
  }

  const resetSubmission = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setIsRecording(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">העלאת סרטון תרגיל</h2>
      
      {/* Exercise Information */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">{videoTitle}</h3>
        <p className="text-blue-800 text-sm">{instructions}</p>
      </div>

      {/* Recording/Upload Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Live Recording */}
        <div className="border border-gray-300 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">הקלטה ישירה</h3>
          
          <div className="mb-4">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-48 bg-gray-100 rounded-lg object-cover"
            />
          </div>

          <div className="flex space-x-2 space-x-reverse">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center justify-center"
              >
                <i className="fas fa-video ml-2"></i>
                התחל הקלטה
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center"
              >
                <i className="fas fa-stop ml-2"></i>
                עצור הקלטה
              </button>
            )}
          </div>
        </div>

        {/* File Upload */}
        <div className="border border-gray-300 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">העלאת קובץ</h3>
          
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="text-sm text-gray-500 mb-4">
            <p>פורמטים נתמכים: MP4, MOV, AVI, WebM</p>
            <p>גודל מקסימלי: 500MB</p>
            <p>משך מקסימלי: 10 דקות</p>
          </div>
        </div>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">תצוגה מקדימה</h3>
          <div className="relative">
            <video
              src={previewUrl}
              controls
              className="w-full h-64 bg-gray-100 rounded-lg object-cover"
            />
            <button
              onClick={resetSubmission}
              className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}

      {/* Submission Guidelines */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-yellow-800 mb-2">הנחיות להעלאת סרטון:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• ודא שהסרטון ברור ומואר היטב</li>
          <li>• בצע את התרגיל בדיוק כפי שהוסבר</li>
          <li>• הסרטון צריך להיות באורך 30 שניות עד 5 דקות</li>
          <li>• ודא שהתרגיל נראה במלואו במסגרת הסרטון</li>
          <li>• הסרטון יעבור בדיקה על ידי מנהל המערכת</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 space-x-reverse">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          ביטול
        </button>
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isUploading ? (
            <>
              <i className="fas fa-spinner animate-spin ml-2"></i>
              מעלה...
            </>
          ) : (
            <>
              <i className="fas fa-upload ml-2"></i>
              העלה סרטון
            </>
          )}
        </button>
      </div>
    </div>
  )
}
