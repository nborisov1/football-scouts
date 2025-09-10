'use client'

import React, { useState, useRef } from 'react'
import { Challenge } from '@/types/challenge'
import { ChallengeService } from '@/lib/challengeService'
import { showMessage } from '@/components/MessageContainer'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface AssessmentVideoUploadProps {
  challenge: Challenge
  onUploadComplete: (videoFile: File) => void
  onCancel: () => void
}

export default function AssessmentVideoUpload({ 
  challenge, 
  onUploadComplete, 
  onCancel 
}: AssessmentVideoUploadProps) {
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

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadProgress(0)

    try {
      // Show initial progress
      setUploadProgress(10)
      
      // REAL Firebase Storage upload
      console.log('🔥 Starting REAL Firebase upload for:', selectedFile.name)
      const videoUrl = await ChallengeService.uploadChallengeVideo(selectedFile, challenge.id)
      console.log('✅ Firebase upload complete! URL:', videoUrl)
      
      setUploadProgress(100)
      onUploadComplete(selectedFile) // Still pass file for metrics flow
    } catch (error) {
      console.error('❌ Firebase upload failed:', error)
      showMessage('שגיאה בהעלאת הסרטון ל-Firebase. נסה שוב.', 'error')
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
        <p className="text-gray-600">
          צלם את עצמך מבצע את האתגר והעלה את הסרטון
        </p>
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
              MP4, MOV, AVI עד 100MB
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
                <span>מעלה סרטון...</span>
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

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h5 className="font-medium text-blue-900 mb-2">הוראות לצילום:</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              {challenge.instructions.split('\n').slice(0, 3).map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
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
            {uploading ? 'מעלה...' : 'העלה סרטון'}
          </Button>
        )}
      </div>
    </Card>
  )
}
