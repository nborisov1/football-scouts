'use client'

/**
 * Video Transcoding Component
 * Handles video transcoding UI and progress display
 */

import React, { useState, useEffect } from 'react'
import { videoTranscodingService, TranscodingProgress, TranscodingOptions } from '@/lib/videoTranscodingService'
import { showMessage } from '@/components/MessageContainer'

interface VideoTranscodingProps {
  file: File
  options?: TranscodingOptions
  onTranscodingComplete: (transcodedFile: Blob, originalFile: File) => void
  onTranscodingError: (error: Error) => void
  onCancel?: () => void
  autoStart?: boolean
}

export default function VideoTranscoding({
  file,
  options,
  onTranscodingComplete,
  onTranscodingError,
  onCancel,
  autoStart = false
}: VideoTranscodingProps) {
  const [progress, setProgress] = useState<TranscodingProgress | null>(null)
  const [isTranscoding, setIsTranscoding] = useState(false)
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null)

  useEffect(() => {
    if (autoStart) {
      startTranscoding()
    }
    
    // Estimate output size
    const quality = options?.quality || videoTranscodingService.getRecommendedQuality(file.size)
    const estimated = videoTranscodingService.estimateOutputSize(file.size, quality)
    setEstimatedSize(estimated)
  }, [file, options, autoStart, startTranscoding])

  const startTranscoding = async () => {
    if (!videoTranscodingService.isSupported()) {
      showMessage('הדפדפן שלך לא תומך בקידוד וידאו', 'error')
      onTranscodingError(new Error('Browser not supported'))
      return
    }

    setIsTranscoding(true)
    
    try {
      const transcodedBlob = await videoTranscodingService.transcodeVideo(
        file,
        options || { quality: videoTranscodingService.getRecommendedQuality(file.size) },
        setProgress
      )
      
      onTranscodingComplete(transcodedBlob, file)
      showMessage('קידוד הוידאו הושלם בהצלחה!', 'success')
    } catch (error) {
      console.error('Transcoding failed:', error)
      onTranscodingError(error as Error)
      showMessage('שגיאה בקידוד הוידאו', 'error')
    } finally {
      setIsTranscoding(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPhaseMessage = (phase: TranscodingProgress['phase']): string => {
    switch (phase) {
      case 'initializing': return 'מכין למרת...'
      case 'loading': return 'טוען ספריות...'
      case 'transcoding': return 'מקודד וידאו...'
      case 'completed': return 'הושלם!'
      case 'error': return 'שגיאה'
      default: return ''
    }
  }

  const getProgressColor = (phase: TranscodingProgress['phase']): string => {
    switch (phase) {
      case 'error': return 'bg-red-500'
      case 'completed': return 'bg-green-500'
      default: return 'bg-blue-500'
    }
  }

  if (!progress && !isTranscoding) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-video text-blue-600 text-2xl"></i>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            קידוד וידאו ל-VP9
          </h3>
          
          <p className="text-gray-600 mb-4">
            הקובץ שלך יקודד לפורמט VP9 לשיפור איכות והקטנת גודל
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">גודל נוכחי:</span>
                <span className="font-medium ml-2">{formatFileSize(file.size)}</span>
              </div>
              <div>
                <span className="text-gray-500">גודל משוער:</span>
                <span className="font-medium ml-2 text-green-600">
                  {estimatedSize ? formatFileSize(estimatedSize) : 'מחשב...'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={startTranscoding}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <i className="fas fa-play ml-2"></i>
              התחל קידוד
            </button>
            
            {onCancel && (
              <button
                onClick={onCancel}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                ביטול
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {progress?.phase === 'completed' ? (
            <i className="fas fa-check text-green-600 text-2xl"></i>
          ) : progress?.phase === 'error' ? (
            <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
          ) : (
            <i className="fas fa-cog fa-spin text-blue-600 text-2xl"></i>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {progress ? getPhaseMessage(progress.phase) : 'מעבד וידאו...'}
        </h3>
        
        {progress && (
          <>
            <p className="text-gray-600 mb-4">
              {progress.message}
            </p>
            
            {/* Progress Bar */}
            <div className="bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress.phase)}`}
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            
            {/* Progress Details */}
            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
              <span>{Math.round(progress.progress)}%</span>
              {progress.timeRemaining && progress.timeRemaining > 0 && (
                <span>זמן נותר: {formatTime(progress.timeRemaining)}</span>
              )}
            </div>
            
            {/* File Size Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">קובץ מקורי:</span>
                  <span className="font-medium ml-2">{formatFileSize(file.size)}</span>
                </div>
                <div>
                  <span className="text-gray-500">משוער:</span>
                  <span className="font-medium ml-2 text-green-600">
                    {estimatedSize ? formatFileSize(estimatedSize) : 'מחשב...'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Cancel Button (only during transcoding) */}
            {progress.phase === 'transcoding' && onCancel && (
              <button
                onClick={onCancel}
                className="mt-4 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm"
              >
                ביטול
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
