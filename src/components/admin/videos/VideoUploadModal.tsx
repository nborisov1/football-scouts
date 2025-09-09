'use client'

import React, { useState, useRef } from 'react'
import { Modal, ModalContent, ModalFooter, Button, Input, Card, Badge } from '@/components/ui'
import { showMessage } from '@/components/MessageContainer'
import { 
  EXERCISE_CATEGORIES, 
  EXERCISE_CATEGORY_LABELS, 
  PRIMARY_CATEGORIES,
  EXERCISE_TYPES,
  EXERCISE_TYPE_LABELS,
  EXERCISE_TYPE_GROUPS
} from '@/constants'
import { 
  generateVideoDefaults, 
  validateExerciseTypeForCategory 
} from '@/lib/videoService'

// Helper function to get available exercise types based on category
const getAvailableExerciseTypes = (category: string) => {
  if (category === EXERCISE_CATEGORIES.FITNESS_TRAINING) {
    return EXERCISE_TYPE_GROUPS.PHYSICAL
  }
  if (category === EXERCISE_CATEGORIES.FOOTBALL_TRAINING) {
    return [...EXERCISE_TYPE_GROUPS.TECHNICAL, ...EXERCISE_TYPE_GROUPS.TACTICAL]
  }
  return Object.values(EXERCISE_TYPES)
}

interface DifficultyLevel {
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  threshold: number
  enabled: boolean
}

interface VideoUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (formData: any) => Promise<void>
  uploading: boolean
  progress: number
}

export function VideoUploadModal({ 
  isOpen, 
  onClose, 
  onUpload, 
  uploading, 
  progress 
}: VideoUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    category: EXERCISE_CATEGORIES.FITNESS_TRAINING as any,
    exerciseType: EXERCISE_TYPES.DRIBBLING as any,
    positionSpecific: [] as string[],
    difficultyLevels: [
      { skillLevel: 'beginner' as const, threshold: 10, enabled: false },
      { skillLevel: 'intermediate' as const, threshold: 30, enabled: false },
      { skillLevel: 'advanced' as const, threshold: 60, enabled: false }
    ]
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      showMessage('יש לבחור קובץ וידאו', 'error')
      return
    }

    if (file.size > 500 * 1024 * 1024) {
      showMessage('קובץ גדול מדי (מקסימום 500MB)', 'error')
      return
    }

    setSelectedFile(file)
    setMetadata(prev => ({
      ...prev,
      title: prev.title || file.name.replace(/\.[^/.]+$/, '')
    }))
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      showMessage('יש לבחור קובץ וידאו', 'error')
      return
    }

    if (!metadata.title.trim() || !metadata.description.trim()) {
      showMessage('יש למלא כותרת ותיאור', 'error')
      return
    }

    const enabledLevels = metadata.difficultyLevels.filter(level => level.enabled)
    if (enabledLevels.length === 0) {
      showMessage('יש לבחור לפחות רמת קושי אחת', 'error')
      return
    }

    await onUpload({ selectedFile, metadata })
  }

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null)
      setMetadata({ 
        title: '', 
        description: '', 
        category: EXERCISE_CATEGORIES.FITNESS_TRAINING as any, 
        exerciseType: EXERCISE_TYPES.DRIBBLING as any,
        positionSpecific: [],
        difficultyLevels: [
          { skillLevel: 'beginner' as const, threshold: 10, enabled: false },
          { skillLevel: 'intermediate' as const, threshold: 30, enabled: false },
          { skillLevel: 'advanced' as const, threshold: 60, enabled: false }
        ]
      })
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="העלאת סרטון חדש" size="lg">
      <ModalContent>
        {!selectedFile ? (
          <div
            className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-neutral-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="video/*"
              className="hidden"
            />
            
            <div className="text-4xl text-neutral-400 mb-4">
              <i className="fas fa-video"></i>
            </div>
            
            <h3 className="text-lg font-medium text-text-primary mb-2">בחר קובץ וידאו</h3>
            <p className="text-text-muted mb-4">גרור קובץ לכאן או לחץ לבחירה</p>
            
            <div className="text-sm text-text-muted">
              <p>פורמטים: MP4, MOV, AVI, WebM</p>
              <p>גודל מקסימלי: 500MB</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Info */}
            <Card variant="filled">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <i className="fas fa-video text-primary-600"></i>
                  <div>
                    <p className="font-medium text-text-primary">{selectedFile.name}</p>
                    <p className="text-sm text-text-muted">
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  icon="fas fa-times"
                  className="text-error-600 hover:text-error-700"
                >
                  הסר
                </Button>
              </div>
            </Card>

            {/* Form Fields */}
            <div className="space-y-4">
              <Input
                label="כותרת הסרטון"
                placeholder="כותרת תיאורית לסרטון"
                value={metadata.title}
                onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                icon="fas fa-heading"
                required
              />

              <div>
                <label className="block text-sm font-display font-semibold text-text-secondary mb-2">
                  <i className="fas fa-align-right ml-2 text-primary-500" />
                  תיאור הסרטון
                </label>
                <textarea
                  value={metadata.description}
                  onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-background-surface text-text-primary"
                  placeholder="תיאור מפורט של תוכן הסרטון"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-display font-semibold text-text-secondary mb-2">
                    <i className="fas fa-tag ml-2 text-primary-500" />
                    קטגוריה
                  </label>
                  <select
                    value={metadata.category}
                    onChange={(e) => {
                      const newCategory = e.target.value
                      const availableTypes = getAvailableExerciseTypes(newCategory)
                      const newType = availableTypes[0] // Default to first available type
                      
                      setMetadata(prev => ({ 
                        ...prev, 
                        category: newCategory as any,
                        exerciseType: newType,
                        // Auto-generate smart defaults
                        ...generateVideoDefaults(newCategory, newType)
                      }))
                    }}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-background-surface text-text-primary"
                  >
                    {PRIMARY_CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {EXERCISE_CATEGORY_LABELS[category]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-display font-semibold text-text-secondary mb-2">
                    <i className="fas fa-layer-group ml-2 text-primary-500" />
                    רמות קושי
                  </label>
                  <Card variant="outlined" padding="sm">
                    <div className="space-y-3">
                      {metadata.difficultyLevels.map((level, index) => (
                        <div key={level.skillLevel} className="flex items-center space-x-4 space-x-reverse">
                          <label className="flex items-center min-w-0">
                            <input
                              type="checkbox"
                              checked={level.enabled}
                              onChange={(e) => {
                                setMetadata(prev => ({
                                  ...prev,
                                  difficultyLevels: prev.difficultyLevels.map((l, i) =>
                                    i === index ? { ...l, enabled: e.target.checked } : l
                                  )
                                }))
                              }}
                              className="ml-2 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm font-medium text-text-primary">
                              {level.skillLevel === 'beginner' ? 'מתחיל' : 
                               level.skillLevel === 'intermediate' ? 'בינוני' : 'מתקדם'}
                            </span>
                          </label>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <span className="text-xs text-text-muted whitespace-nowrap">סף התקדמות:</span>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={level.threshold}
                              onChange={(e) => {
                                const newThreshold = parseInt(e.target.value) || 10
                                setMetadata(prev => ({
                                  ...prev,
                                  difficultyLevels: prev.difficultyLevels.map((l, i) =>
                                    i === index ? { ...l, threshold: newThreshold } : l
                                  )
                                }))
                              }}
                              disabled={!level.enabled}
                              className="w-16 px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-neutral-100"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-text-muted mt-2">
                      בחר רמות קושי וקבע לכל אחת סף התקדמות (נקודות נדרשות למעבר לשלב הבא)
                    </p>
                  </Card>
                </div>
              </div>

              {/* Position Selection */}
              <div>
                <label className="block text-sm font-display font-semibold text-text-secondary mb-2">
                  <i className="fas fa-users ml-2 text-primary-500" />
                  עמדות רלוונטיות
                </label>
                <Card variant="outlined" padding="sm">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { value: 'all', label: 'כל העמדות' },
                      { value: 'goalkeeper', label: 'שוער' },
                      { value: 'defender', label: 'בלם' },
                      { value: 'center-back', label: 'בלם מרכזי' },
                      { value: 'fullback', label: 'בלם צדדי' },
                      { value: 'midfielder', label: 'קשר' },
                      { value: 'defensive-midfielder', label: 'קשר הגנתי' },
                      { value: 'attacking-midfielder', label: 'קשר התקפי' },
                      { value: 'winger', label: 'אגף' },
                      { value: 'striker', label: 'חלוץ' },
                      { value: 'center-forward', label: 'חלוץ מרכזי' }
                    ].map(position => (
                      <label key={position.value} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={metadata.positionSpecific.includes(position.value)}
                          onChange={(e) => {
                            if (position.value === 'all') {
                              setMetadata(prev => ({ 
                                ...prev, 
                                positionSpecific: e.target.checked ? ['all'] : [] 
                              }))
                            } else {
                              setMetadata(prev => {
                                let newPositions = [...prev.positionSpecific]
                                if (e.target.checked) {
                                  newPositions = newPositions.filter(p => p !== 'all')
                                  newPositions.push(position.value)
                                } else {
                                  newPositions = newPositions.filter(p => p !== position.value)
                                }
                                return { ...prev, positionSpecific: newPositions }
                              })
                            }
                          }}
                          className="ml-2 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-text-primary">{position.label}</span>
                      </label>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <Card variant="filled" className="bg-primary-50 border-primary-200">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary-900">מעלה סרטון...</span>
                    <span className="text-sm text-primary-700">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-primary-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </ModalContent>

      {selectedFile && (
        <ModalFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
          >
            ביטול
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={uploading || !metadata.title.trim() || !metadata.description.trim()}
            loading={uploading}
          >
            {uploading ? 'מעלה...' : 'העלה סרטון'}
          </Button>
        </ModalFooter>
      )}
    </Modal>
  )
}
