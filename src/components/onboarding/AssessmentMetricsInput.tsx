'use client'

import React, { useState, useEffect } from 'react'
import { Challenge, ChallengeMetric } from '@/types/challenge'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface AssessmentMetricsInputProps {
  challenge: Challenge
  videoUrl: string
  onComplete: (metrics: Record<string, number>) => void
  onBack: () => void
}

export default function AssessmentMetricsInput({ 
  challenge, 
  videoUrl, 
  onComplete, 
  onBack 
}: AssessmentMetricsInputProps) {
  const [metrics, setMetrics] = useState<Record<string, number>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleMetricChange = (metricId: string, value: string) => {
    const numValue = parseFloat(value)
    
    // Clear error when user starts typing
    if (errors[metricId]) {
      setErrors(prev => ({ ...prev, [metricId]: '' }))
    }

    if (value === '' || !isNaN(numValue)) {
      setMetrics(prev => ({
        ...prev,
        [metricId]: value === '' ? 0 : numValue
      }))
    }
  }

  const validateMetrics = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    challenge.metrics.forEach(metric => {
      const value = metrics[metric.id]
      
      if (value === undefined || value === null) {
        newErrors[metric.id] = 'שדה חובה'
        return
      }

      // Basic validation based on type
      if (metric.type === 'time' && value < 0) {
        newErrors[metric.id] = 'זמן לא יכול להיות שלילי'
      }
      if (metric.type === 'count' && (value < 0 || !Number.isInteger(value))) {
        newErrors[metric.id] = 'חייב להיות מספר שלם חיובי'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateMetrics()) {
      onComplete(metrics)
    }
  }

  const getMetricIcon = (metric: ChallengeMetric): string => {
    switch (metric.type) {
      case 'time': return '⏱️'
      case 'count': return '🔢'
      case 'numeric': return '📏'
      case 'percentage': return '📊'
      default: return '📝'
    }
  }

  const getMetricPlaceholder = (metric: ChallengeMetric): string => {
    switch (metric.id) {
      case 'successful-touches': return '8'
      case 'control-time': return '25.5'
      case 'accurate-passes': return '15'
      case 'shots-on-target': return '7'
      case 'dribbling-time': return '12.3'
      case 'cones-touched': return '2'
      case 'sprint-time': return '5.2'
      default: return '0'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            רישום תוצאות - {challenge.title}
          </h3>
          <p className="text-gray-600">
            הזן את התוצאות שהשגת באתגר
          </p>
        </div>
      </Card>

      {/* Video Preview */}
      <Card className="p-4">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="text-2xl">🎬</div>
          <div>
            <h4 className="font-medium text-gray-900">הסרטון שלך הועלה בהצלחה</h4>
            <p className="text-sm text-gray-500">ניתן לעבור לשלב הבא</p>
          </div>
          <div className="flex-1"></div>
          <div className="text-green-500 text-xl">✅</div>
        </div>
      </Card>

      {/* Metrics Input */}
      <Card className="p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">
          הזן את התוצאות שלך
        </h4>
        
        <div className="space-y-4">
          {challenge.metrics.map((metric) => (
            <div key={metric.id} className="space-y-2">
              <label className="block">
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <span className="text-lg">{getMetricIcon(metric)}</span>
                  <span className="font-medium text-gray-900">{metric.name}</span>
                  <span className="text-sm text-gray-500">({metric.unit})</span>
                </div>
                
                <Input
                  type="number"
                  value={metrics[metric.id]?.toString() || ''}
                  onChange={(e) => handleMetricChange(metric.id, e.target.value)}
                  placeholder={getMetricPlaceholder(metric)}
                  error={errors[metric.id]}
                  min={metric.type === 'time' || metric.type === 'count' ? 0 : undefined}
                  step={metric.type === 'count' ? 1 : 0.1}
                />
                
                {metric.description && (
                  <p className="text-sm text-gray-500 mt-1">{metric.description}</p>
                )}
              </label>
            </div>
          ))}
        </div>

        {/* Instructions Reminder */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">תזכורת:</h5>
          <div className="text-sm text-blue-800 space-y-1">
            {challenge.instructions.split('\n').map((instruction, index) => (
              <div key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{instruction}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          className="sm:w-auto"
        >
          חזור לסרטון
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          className="flex-1"
        >
          שמור תוצאות והמשך
        </Button>
      </div>
    </div>
  )
}
