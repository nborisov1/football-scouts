/**
 * Video Transcoding Service
 * Handles client-side video transcoding to VP9 format using FFmpeg.wasm
 */

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'

export interface TranscodingProgress {
  phase: 'initializing' | 'loading' | 'transcoding' | 'completed' | 'error'
  progress: number // 0-100
  message: string
  timeRemaining?: number // seconds
}

export interface TranscodingOptions {
  quality: 'high' | 'medium' | 'low'
  maxWidth?: number
  maxHeight?: number
  targetBitrate?: string
}

class VideoTranscodingService {
  private ffmpeg: ReturnType<typeof createFFmpeg> | null = null
  private isLoaded = false
  private loadingPromise: Promise<void> | null = null

  constructor() {
    this.initializeFFmpeg()
  }

  private initializeFFmpeg() {
    this.ffmpeg = createFFmpeg({
      log: false, // Set to true for debugging
      corePath: 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/ffmpeg-core.js',
    })
  }

  /**
   * Load FFmpeg.wasm
   */
  private async loadFFmpeg(): Promise<void> {
    if (this.isLoaded) return
    
    if (this.loadingPromise) {
      return this.loadingPromise
    }

    this.loadingPromise = (async () => {
      try {
        if (!this.ffmpeg.isLoaded()) {
          await this.ffmpeg.load()
        }
        this.isLoaded = true
      } catch (error) {
        console.error('Failed to load FFmpeg:', error)
        throw new Error('Failed to initialize video transcoding engine')
      }
    })()

    return this.loadingPromise
  }

  /**
   * Get transcoding options based on quality preset
   */
  private getTranscodingParams(options: TranscodingOptions): string[] {
    const { quality, maxWidth = 1920, maxHeight = 1080 } = options

    let crf: number
    let preset: string
    let audioBitrate: string

    switch (quality) {
      case 'high':
        crf = 23
        preset = 'slow'
        audioBitrate = '128k'
        break
      case 'medium':
        crf = 30
        preset = 'medium'
        audioBitrate = '96k'
        break
      case 'low':
        crf = 35
        preset = 'fast'
        audioBitrate = '64k'
        break
    }

    return [
      '-i', 'input.mp4',
      // Video encoding with VP9
      '-c:v', 'libvpx-vp9',
      '-crf', crf.toString(),
      '-b:v', '0', // Use CRF mode
      '-preset', preset,
      // Audio encoding with Opus
      '-c:a', 'libopus',
      '-b:a', audioBitrate,
      // Resolution constraints
      '-vf', `scale='min(${maxWidth},iw)':'min(${maxHeight},ih)':force_original_aspect_ratio=decrease`,
      // Quality optimizations
      '-deadline', 'good',
      '-cpu-used', '1',
      '-row-mt', '1',
      // Output
      'output.webm'
    ]
  }

  /**
   * Transcode video to VP9 format
   */
  async transcodeVideo(
    file: File,
    options: TranscodingOptions = { quality: 'medium' },
    onProgress?: (progress: TranscodingProgress) => void
  ): Promise<Blob> {
    try {
      // Phase 1: Initializing
      onProgress?.({
        phase: 'initializing',
        progress: 0,
        message: 'מכין את מנוע הקידוד...'
      })

      // Phase 2: Loading FFmpeg
      onProgress?.({
        phase: 'loading',
        progress: 10,
        message: 'טוען ספריות קידוד...'
      })

      await this.loadFFmpeg()

      onProgress?.({
        phase: 'loading',
        progress: 30,
        message: 'מכין את הקובץ לעיבוד...'
      })

      // Write input file to FFmpeg filesystem
      const inputFileName = `input_${Date.now()}.${this.getFileExtension(file)}`
      this.ffmpeg.FS('writeFile', inputFileName, await fetchFile(file))

      // Phase 3: Transcoding
      onProgress?.({
        phase: 'transcoding',
        progress: 40,
        message: 'מתחיל קידוד לפורמט VP9...'
      })

      const params = this.getTranscodingParams(options)
      // Replace input filename in params
      params[1] = inputFileName

      const startTime = Date.now()
      
      // Set up progress monitoring
      this.ffmpeg.setProgress(({ ratio }: { ratio: number }) => {
        const progressPercent = Math.min(Math.max(ratio * 100, 40), 90)
        const elapsed = (Date.now() - startTime) / 1000
        const estimated = elapsed / ratio
        const remaining = Math.max(0, estimated - elapsed)

        onProgress?.({
          phase: 'transcoding',
          progress: progressPercent,
          message: `מקודד וידאו... ${Math.round(progressPercent)}%`,
          timeRemaining: remaining
        })
      })

      // Run transcoding
      await this.ffmpeg.run(...params)

      onProgress?.({
        phase: 'transcoding',
        progress: 95,
        message: 'משלים עיבוד...'
      })

      // Read the output file
      const outputData = this.ffmpeg.FS('readFile', 'output.webm')
      
      // Clean up filesystem
      try {
        this.ffmpeg.FS('unlink', inputFileName)
        this.ffmpeg.FS('unlink', 'output.webm')
      } catch (cleanupError) {
        console.warn('Cleanup warning:', cleanupError)
      }

      // Create blob from output
      const outputBlob = new Blob([outputData.buffer], { type: 'video/webm' })

      // Phase 4: Completed
      onProgress?.({
        phase: 'completed',
        progress: 100,
        message: 'קידוד הושלם בהצלחה!'
      })

      return outputBlob

    } catch (error) {
      console.error('Transcoding error:', error)
      onProgress?.({
        phase: 'error',
        progress: 0,
        message: `שגיאה בקידוד: ${error instanceof Error ? error.message : 'שגיאה לא ידועה'}`
      })
      throw error
    }
  }

  /**
   * Get file extension from File object
   */
  private getFileExtension(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase()
    
    // Map common video extensions
    switch (extension) {
      case 'mov':
      case 'qt':
        return 'mov'
      case 'avi':
        return 'avi'
      case 'mkv':
        return 'mkv'
      case 'webm':
        return 'webm'
      case 'mp4':
      case 'm4v':
      default:
        return 'mp4'
    }
  }

  /**
   * Estimate compression ratio
   */
  estimateOutputSize(inputSize: number, quality: TranscodingOptions['quality']): number {
    let compressionRatio: number
    
    switch (quality) {
      case 'high':
        compressionRatio = 0.7 // 30% reduction
        break
      case 'medium':
        compressionRatio = 0.5 // 50% reduction
        break
      case 'low':
        compressionRatio = 0.3 // 70% reduction
        break
    }
    
    return Math.round(inputSize * compressionRatio)
  }

  /**
   * Check if browser supports required features
   */
  static isSupported(): boolean {
    // Check for WebAssembly support
    if (typeof WebAssembly !== 'object') {
      return false
    }

    // Check for SharedArrayBuffer (required for FFmpeg.wasm)
    if (typeof SharedArrayBuffer === 'undefined') {
      console.warn('SharedArrayBuffer not available. Video transcoding may not work.')
      return false
    }

    return true
  }

  /**
   * Get recommended quality based on file size
   */
  static getRecommendedQuality(fileSize: number): TranscodingOptions['quality'] {
    const sizeMB = fileSize / (1024 * 1024)
    
    if (sizeMB < 10) return 'high'
    if (sizeMB < 50) return 'medium'
    return 'low'
  }
}

// Export singleton instance
export const videoTranscodingService = new VideoTranscodingService()
export default videoTranscodingService
