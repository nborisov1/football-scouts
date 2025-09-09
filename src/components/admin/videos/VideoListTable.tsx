'use client'

import React from 'react'
import { Table, Badge, Button, Loading } from '@/components/ui'
import type { TableColumn } from '@/components/ui'
import type { VideoMetadata } from '@/types/video'

interface VideoGroup {
  baseVideo: VideoMetadata
  variants: VideoMetadata[]
}

interface VideoListTableProps {
  groupedVideos: VideoGroup[]
  loading: boolean
  onVideoView: (group: VideoGroup) => void
  onVideoEdit: (group: VideoGroup) => void
  onVideoDelete: (videoId: string) => void
}

export function VideoListTable({ 
  groupedVideos, 
  loading, 
  onVideoView, 
  onVideoEdit, 
  onVideoDelete 
}: VideoListTableProps) {
  
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('he-IL')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const columns: TableColumn[] = [
    {
      key: 'video',
      label: 'סרטון',
      render: (_, group: VideoGroup) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-16 w-20">
            {group.baseVideo.thumbnailUrl ? (
              <img
                className="h-16 w-20 rounded-lg object-cover"
                src={group.baseVideo.thumbnailUrl}
                alt={group.baseVideo.title}
              />
            ) : (
              <div className="h-16 w-20 bg-neutral-200 rounded-lg flex items-center justify-center">
                <i className="fas fa-video text-neutral-400"></i>
              </div>
            )}
          </div>
          <div className="mr-4 min-w-0 flex-1">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="text-sm font-medium text-text-primary truncate">
                {group.baseVideo.title.replace(/ - (מתחיל|בינוני|מתקדם)$/, '')}
              </div>
              {group.variants.length > 0 && (
                <Badge variant="success" size="sm">
                  {[group.baseVideo, ...group.variants].length} רמות
                </Badge>
              )}
            </div>
            <div className="text-sm text-text-muted truncate">{group.baseVideo.description}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'details',
      label: 'פרטים',
      render: (_, group: VideoGroup) => {
        const allVideos = [group.baseVideo, ...group.variants]
        const thresholds = allVideos.map(v => `${v.skillLevel}(${v.difficultyLevel})`).join(', ')
        
        return (
          <div className="text-sm text-text-muted">
            <div>קטגוריה: {group.baseVideo.category}</div>
            <div>סוג: {group.baseVideo.exerciseType}</div>
            <div>רמות: {thresholds}</div>
            <div>עמדות: {
              group.baseVideo.positionSpecific?.length > 0 
                ? group.baseVideo.positionSpecific.includes('all' as any) 
                  ? 'כל העמדות' 
                  : group.baseVideo.positionSpecific.slice(0, 2).join(', ') + (group.baseVideo.positionSpecific.length > 2 ? '...' : '')
                : 'לא צוין'
            }</div>
            <div>גודל: {group.baseVideo.fileSize ? formatFileSize(group.baseVideo.fileSize) : 'לא ידוע'}</div>
          </div>
        )
      },
    },
    {
      key: 'date',
      label: 'תאריך',
      render: (_, group: VideoGroup) => (
        <div className="text-sm text-text-muted">
          {group.baseVideo.uploadedAt ? formatDate(group.baseVideo.uploadedAt) : 'לא ידוע'}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'פעולות',
      render: (_, group: VideoGroup) => (
        <div className="flex space-x-2 space-x-reverse">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVideoView(group)}
            icon="fas fa-eye"
            className="text-info-600 hover:text-info-700"
            aria-label="צפייה"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVideoEdit(group)}
            icon="fas fa-edit"
            className="text-primary-600 hover:text-primary-700"
            aria-label="עריכה"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onVideoDelete(group.baseVideo.id)}
            icon="fas fa-trash"
            className="text-error-600 hover:text-error-700"
            aria-label="מחיקה"
          />
        </div>
      ),
    },
  ]

  if (loading) {
    return <Loading variant="spinner" size="lg" text="טוען סרטונים..." />
  }

  if (groupedVideos.length === 0) {
    return (
      <div className="bg-background-surface rounded-lg border border-neutral-200 p-8 text-center">
        <div className="text-neutral-400 text-4xl mb-4">
          <i className="fas fa-video"></i>
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">אין סרטונים</h3>
        <p className="text-text-muted mb-4">לא נמצאו סרטונים במערכת</p>
      </div>
    )
  }

  return (
    <Table
      columns={columns}
      data={groupedVideos}
      className="mt-6"
    />
  )
}
