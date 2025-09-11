'use client'

import React, { useState, useRef } from 'react'
import { AssessmentChallenge, AssessmentService } from '@/lib/assessmentService'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface AssessmentVideoUploadProps {
  challenge: AssessmentChallenge
  onSubmissionComplete: (submissionId: string) => void
  onCancel: () => void
}

export default function AssessmentVideoUpload({ 
  challenge, 
  onSubmissionComplete, 
  onCancel 
}: AssessmentVideoUploadProps) {
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validation
    if (!file.type.startsWith('video/')) {
      showMessage('יש לבחור קובץ וידאו', 'error')
      return
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      showMessage('הקובץ גדול מדי. מקסימום 100MB', 'error')
      return
    }

    setSelectedFile(file)
  }

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src)
        resolve(video.duration)
      }
      
      video.onerror = () => {
        resolve(30) // Default duration if can't detect
      }
      
      video.src = URL.createObjectURL(file)
    })
  }

  const handleUpload = async () => {
    if (!selectedFile || !user) return

    setUploading(true)
    setUploadProgress(0)

    try {
      setUploadProgress(10)
      
      // Get video duration
      const videoDuration = await getVideoDuration(selectedFile)
      setUploadProgress(30)
      
      console.log(`📤 Submitting assessment for challenge ${challenge.id}`)
      console.log(`🎬 Video: ${selectedFile.name}, Duration: ${videoDuration}s`)
      
      // Submit assessment directly (no manual metrics)
      const submissionId = await AssessmentService.submitAssessmentChallenge(
        user.uid,
        challenge.id,
        selectedFile,
        videoDuration,
        `Assessment video for ${challenge.title}`
      )
      
      setUploadProgress(100)
      showMessage('הסרטון הועלה והתוצאות נשמרו בהצלחה!', 'success')
      
      // Complete submission
      onSubmissionComplete(submissionId)
      
    } catch (error) {
      console.error('❌ Assessment submission failed:', error)
      showMessage('שגיאה בהעלאת הסרטון. נסה שוב.', 'error')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Card className="p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          העלאת סרטון - {challenge.title}
        </h3>
        <p className="text-gray-600 mb-4">
          צלם את עצמך מבצע את האתגר והעלה את הסרטון
        </p>
        
        {/* Challenge Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-right">
          <h4 className="font-bold text-blue-900 mb-2">🎯 הוראות ביצוע:</h4>
          <div className="text-sm text-blue-800 whitespace-pre-line">
            {challenge.instructions}
          </div>
        </div>
        
        {/* Auto Analysis Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h4 className="font-bold text-green-900 mb-2">🤖 ניתוח אוטומטי:</h4>
          <div className="text-sm text-green-800">
            <p className="mb-2">המערכת תנתח את הסרטון שלך אוטומטית ותעניק ציון על בסיס:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {challenge.videoAnalysis.metrics.map((metric, index) => (
                <div key={index} className="flex items-center space-x-2 space-x-reverse">
                  <span className="text-green-600">✓</span>
                  <span className="text-green-800 capitalize">{metric.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-green-700 mt-2">
              ⏱️ זמן מקסימלי: {challenge.timeLimit} שניות
            </div>
          </div>
        </div>
      </div>

      {!selectedFile ? (
        <div>
          {/* Upload Area */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-4xl mb-4">📹</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              בחר קובץ וידאו
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              לחץ כאן או גרור קובץ וידאו לכאן
            </p>
            <Button variant="outline" size="lg">
              בחר קובץ
            </Button>
            <p className="text-xs text-gray-400 mt-3">
              MP4, MOV, AVI עד 100MB | מקסימום {challenge.timeLimit} שניות
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div>
          {/* File Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="flex-shrink-0 text-2xl">🎬</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </h4>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFile(null)}
                disabled={uploading}
              >
                החלף
              </Button>
            </div>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>מעלה ומנתח סרטון...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Ready to Submit */}
          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <h5 className="font-medium text-yellow-900 mb-2">✅ מוכן להעלאה!</h5>
            <p className="text-sm text-yellow-800">
              המערכת תעלה את הסרטון, תנתח אותו אוטומטית ותעניק לך ציון בהתאם לביצועים.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={onCancel}
          disabled={uploading}
          className="sm:w-auto"
        >
          ביטול
        </Button>
        
        {selectedFile && (
          <Button
            variant="primary"
            size="lg"
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1"
          >
            {uploading ? 'מעלה ומנתח...' : 'העלה וסיים אתגר'}
          </Button>
        )}
      </div>
    </Card>
  )
}