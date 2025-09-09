'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui'

interface VideoStatsProps {
  totalVideos: number
}

export function VideoStats({ totalVideos }: VideoStatsProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-display font-medium text-text-primary">
          כל הסרטונים ({totalVideos})
        </h2>
      </CardContent>
    </Card>
  )
}
