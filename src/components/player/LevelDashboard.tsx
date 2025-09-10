'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ChallengeGatingService } from '@/lib/challengeGatingService'
import { LevelAssessmentService } from '@/lib/levelAssessmentService'
import { Challenge } from '@/types/challenge'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'

interface LevelDashboardProps {
  onChallengeSelect?: (challenge: Challenge) => void
}

export default function LevelDashboard({ onChallengeSelect }: LevelDashboardProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [progressData, setProgressData] = useState<any>(null)
  const [availableChallenges, setAvailableChallenges] = useState<Challenge[]>([])
  const [eligibilityCheck, setEligibilityCheck] = useState<any>(null)

  useEffect(() => {
    loadLevelData()
  }, [user])

  const loadLevelData = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Load all level progression data
      const [summary, challenges, eligibility] = await Promise.all([
        ChallengeGatingService.getLevelProgressionSummary(user.uid, user.currentLevel),
        ChallengeGatingService.getAvailableChallenges(user.uid, user.currentLevel),
        ChallengeGatingService.checkLevelUpEligibility(user.uid, user.currentLevel)
      ])

      setProgressData(summary)
      setAvailableChallenges(challenges)
      setEligibilityCheck(eligibility)
    } catch (error) {
      console.error('Error loading level data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLevelUp = async () => {
    if (!user || !eligibilityCheck?.canAdvance) return

    try {
      await ChallengeGatingService.advancePlayerLevel(user.uid, eligibilityCheck.nextLevel)
      await loadLevelData() // Reload data
    } catch (error) {
      console.error('Error advancing level:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    )
  }

  if (!progressData) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600">לא ניתן לטעון נתוני התקדמות</p>
      </Card>
    )
  }

  const levelSummary = LevelAssessmentService.generateLevelSummary(progressData.currentLevel)

  return (
    <div className="space-y-6">
      {/* Current Level Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="text-4xl">{levelSummary.icon}</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                רמה {progressData.currentLevel}
              </h2>
              <p className="text-gray-600">{levelSummary.title}</p>
            </div>
          </div>
          
          {eligibilityCheck?.canAdvance && (
            <Button
              variant="gradient"
              size="lg"
              onClick={handleLevelUp}
              className="animate-pulse"
            >
              🚀 עבור לרמה {eligibilityCheck.nextLevel}!
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>התקדמות ברמה</span>
            <span>{progressData.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressData.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {progressData.completedChallenges}
            </div>
            <div className="text-sm text-green-700">הושלמו</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {progressData.availableChallenges}
            </div>
            <div className="text-sm text-blue-700">זמינים</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {progressData.totalChallenges}
            </div>
            <div className="text-sm text-purple-700">סה״כ</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {progressData.estimatedTimeToNext}
            </div>
            <div className="text-sm text-orange-700">ימים לרמה הבאה</div>
          </div>
        </div>
      </Card>

      {/* Skill Focus */}
      {progressData.skillFocus.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            מיקוד הרמה הנוכחית
          </h3>
          <div className="flex flex-wrap gap-2">
            {progressData.skillFocus.map((skill: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Available Challenges */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            אתגרים זמינים ({availableChallenges.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={loadLevelData}
          >
            רענן
          </Button>
        </div>

        {availableChallenges.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎉</div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              כל האתגרים הושלמו!
            </h4>
            <p className="text-gray-600 mb-4">
              {eligibilityCheck?.canAdvance 
                ? 'אתה מוכן לעבור לרמה הבאה!'
                : 'יש לך עוד כמה אתגרים שצריכים שיפור.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableChallenges.slice(0, 6).map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onSelect={() => onChallengeSelect?.(challenge)}
              />
            ))}
          </div>
        )}

        {availableChallenges.length > 6 && (
          <div className="text-center mt-4">
            <Button variant="outline">
              צפה בכל האתגרים ({availableChallenges.length})
            </Button>
          </div>
        )}
      </Card>

      {/* Next Level Preview */}
      <Card className="p-6 bg-gradient-to-r from-primary-50 to-blue-50">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          רמה {progressData.nextLevel} - מה מחכה לך?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">תכנים חדשים:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• אתגרים מתקדמים יותר</li>
              <li>• טכניקות חדשות</li>
              <li>• תרגילי טקטיקה</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">יתרונות:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• גישה לתכנים בלעדיים</li>
              <li>• ניקוד גבוה יותר</li>
              <li>• הכרה מסקאוטים</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Challenge Card Component
interface ChallengeCardProps {
  challenge: Challenge
  onSelect: () => void
}

function ChallengeCard({ challenge, onSelect }: ChallengeCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-orange-100 text-orange-800'
      case 'professional': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ball-control': return '⚽'
      case 'passing': return '🎯'
      case 'shooting': return '🥅'
      case 'dribbling': return '🏃‍♂️'
      case 'fitness': return '💪'
      default: return '🏆'
    }
  }

  return (
    <div 
      className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl">{getCategoryIcon(challenge.category)}</div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
          {challenge.difficulty}
        </span>
      </div>
      
      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
        {challenge.title}
      </h4>
      
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
        {challenge.description}
      </p>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>רמה {challenge.level}</span>
        <span>{challenge.category}</span>
      </div>
    </div>
  )
}
