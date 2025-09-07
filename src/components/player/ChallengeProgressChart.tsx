'use client'

import React from 'react'
import { ChallengeSubmission } from '@/types/challenge'

interface ChallengeProgressChartProps {
  submissions: ChallengeSubmission[]
  challengeTitle: string
  metricName?: string
}

export default function ChallengeProgressChart({ 
  submissions, 
  challengeTitle,
  metricName = 'ציון כללי'
}: ChallengeProgressChartProps) {
  if (submissions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">התקדמות</h3>
        <div className="text-center py-8">
          <i className="fas fa-chart-line text-4xl text-gray-300 mb-2"></i>
          <p className="text-gray-500">אין נתונים להצגה</p>
        </div>
      </div>
    )
  }

  // Sort submissions by date
  const sortedSubmissions = submissions.sort((a, b) => 
    a.submittedAt.getTime() - b.submittedAt.getTime()
  )

  // Get data points
  const dataPoints = sortedSubmissions.map((submission, index) => ({
    x: index + 1,
    y: submission.totalScore,
    date: submission.submittedAt,
    rating: submission.overallRating
  }))

  // Calculate chart dimensions
  const maxScore = Math.max(...dataPoints.map(d => d.y))
  const minScore = Math.min(...dataPoints.map(d => d.y))
  const scoreRange = maxScore - minScore
  const padding = scoreRange * 0.1 || 10

  const chartHeight = 200
  const chartWidth = 400
  const margin = { top: 20, right: 20, bottom: 40, left: 40 }

  // Calculate positions
  const xScale = (x: number) => 
    margin.left + (x - 1) * (chartWidth - margin.left - margin.right) / (dataPoints.length - 1)
  
  const yScale = (y: number) => 
    margin.top + chartHeight - margin.top - margin.bottom - 
    ((y - (minScore - padding)) / (maxScore - minScore + 2 * padding)) * (chartHeight - margin.top - margin.bottom)

  // Generate path for line
  const pathData = dataPoints.map((point, index) => {
    const x = xScale(point.x)
    const y = yScale(point.y)
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  // Get trend
  const getTrend = () => {
    if (dataPoints.length < 2) return 'stable'
    
    const firstHalf = dataPoints.slice(0, Math.ceil(dataPoints.length / 2))
    const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2))
    
    const firstAvg = firstHalf.reduce((sum, p) => sum + p.y, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, p) => sum + p.y, 0) / secondHalf.length
    
    const improvement = secondAvg - firstAvg
    
    if (improvement > 5) return 'improving'
    if (improvement < -5) return 'declining'
    return 'stable'
  }

  const trend = getTrend()
  const trendColor = trend === 'improving' ? 'text-green-600' : 
                    trend === 'declining' ? 'text-red-600' : 'text-gray-600'
  const trendIcon = trend === 'improving' ? 'fas fa-arrow-up' : 
                   trend === 'declining' ? 'fas fa-arrow-down' : 'fas fa-minus'

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">התקדמות - {challengeTitle}</h3>
        <div className={`flex items-center space-x-1 space-x-reverse ${trendColor}`}>
          <i className={`${trendIcon} text-sm`}></i>
          <span className="text-sm font-medium">
            {trend === 'improving' ? 'משתפר' : 
             trend === 'declining' ? 'יורד' : 'יציב'}
          </span>
        </div>
      </div>

      <div className="relative">
        <svg width={chartWidth} height={chartHeight} className="w-full">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(score => {
            const y = yScale(score)
            return (
              <g key={score}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={chartWidth - margin.right}
                  y2={y}
                  stroke="#f3f4f6"
                  strokeWidth={1}
                />
                <text
                  x={margin.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-500"
                >
                  {score}
                </text>
              </g>
            )
          })}

          {/* Line chart */}
          <path
            d={pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {dataPoints.map((point, index) => {
            const x = xScale(point.x)
            const y = yScale(point.y)
            const color = {
              poor: '#ef4444',
              fair: '#f97316',
              good: '#eab308',
              excellent: '#3b82f6',
              outstanding: '#10b981'
            }[point.rating] || '#6b7280'

            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r={4}
                  fill={color}
                  stroke="white"
                  strokeWidth={2}
                />
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {point.y}
                </text>
              </g>
            )
          })}

          {/* X-axis labels */}
          {dataPoints.map((point, index) => {
            const x = xScale(point.x)
            return (
              <text
                key={index}
                x={x}
                y={chartHeight - margin.bottom + 15}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {index + 1}
              </text>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-4 space-x-reverse mt-4 text-xs">
          <div className="flex items-center space-x-1 space-x-reverse">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600">חלש</span>
          </div>
          <div className="flex items-center space-x-1 space-x-reverse">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-gray-600">בינוני</span>
          </div>
          <div className="flex items-center space-x-1 space-x-reverse">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600">טוב</span>
          </div>
          <div className="flex items-center space-x-1 space-x-reverse">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600">מעולה</span>
          </div>
          <div className="flex items-center space-x-1 space-x-reverse">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">מצוין</span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Math.max(...dataPoints.map(d => d.y))}
          </div>
          <div className="text-sm text-gray-500">ציון מקסימלי</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(dataPoints.reduce((sum, d) => sum + d.y, 0) / dataPoints.length)}
          </div>
          <div className="text-sm text-gray-500">ממוצע</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {dataPoints.length}
          </div>
          <div className="text-sm text-gray-500">ניסיונות</div>
        </div>
      </div>
    </div>
  )
}
