'use client'

import React from 'react'

interface VideoPlayerProps {
  src: string
  title?: string
  className?: string
}

export function VideoPlayer({ src, title, className = '' }: VideoPlayerProps) {

  return (
    <div className={`relative w-full max-w-sm mx-auto ${className}`}>
      {/* Video Container with mobile-first aspect ratio */}
      <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '9/16' }}>
        
        {/* Simple Video Element */}
        <video
          className="w-full h-full object-cover"
          controls
          preload="metadata"
          crossOrigin="anonymous"
        >
          <source src={src} type="video/mp4" />
          <source src={src} type="video/mov" />
          <source src={src} type="video/webm" />
          <p className="text-white p-4 text-center">
            לא ניתן להציג את הסרטון
          </p>
        </video>
      </div>

      {/* Video Title */}
      {title && (
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-medium">🎬</span> {title}
        </div>
      )}
    </div>
  )
}

export default VideoPlayer
