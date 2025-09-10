'use client'

import React from 'react'
import { LevelAssessmentService } from '@/lib/levelAssessmentService'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface LevelAssignmentProps {
  assignedLevel: number
  onComplete: (data?: any) => void
  loading: boolean
}

export default function LevelAssignment({ 
  assignedLevel, 
  onComplete, 
  loading 
}: LevelAssignmentProps) {
  const levelSummary = LevelAssessmentService.generateLevelSummary(assignedLevel)

  return (
    <div className="space-y-6">
      {/* Main Result */}
      <Card className="p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">{levelSummary.icon}</div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            הרמה שלך נקבעה!
          </h3>
          <div className={`inline-block px-6 py-3 rounded-full text-2xl font-bold ${levelSummary.color} mb-4`}>
            רמה {assignedLevel} - {levelSummary.title}
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {levelSummary.description}
          </p>
        </div>
      </Card>

      {/* Level Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What This Means */}
        <Card className="p-6">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-3">💡</span>
            מה זה אומר?
          </h4>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              <span>אתה מתחיל ברמה {assignedLevel} מתוך 50 רמות</span>
            </div>
            <div className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              <span>זמן משוער להתקדמות לרמה הבאה: {levelSummary.estimatedTime}</span>
            </div>
            <div className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              <span>תוכל לשפר את הרמה שלך על ידי השלמת אתגרים</span>
            </div>
            <div className="flex items-start">
              <span className="text-primary-600 mr-2">•</span>
              <span>כל רמה פותחת אתגרים ותכנים חדשים</span>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-6">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-3">🎯</span>
            הצעדים הבאים
          </h4>
          <div className="space-y-3 text-gray-700">
            <div className="flex items-start">
              <span className="text-green-600 mr-2">1.</span>
              <span>צפה באתגרים הזמינים עבור הרמה שלך</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2">2.</span>
              <span>בחר אתגר שמעניין אותך ותתחיל לתרגל</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2">3.</span>
              <span>צפה בסרטוני הדרכה ולמד טכניקות חדשות</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-600 mr-2">4.</span>
              <span>השלם אתגרים כדי להתקדם לרמה הבאה</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Path */}
      <Card className="p-6">
        <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-3">🛤️</span>
          המסלול שלך
        </h4>
        
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute right-8 top-8 bottom-8 w-0.5 bg-gray-200"></div>
          
          <div className="space-y-6">
            {/* Current Level */}
            <div className="flex items-center">
              <div className="flex-shrink-0 w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold border-4 border-primary-600">
                {assignedLevel}
              </div>
              <div className="mr-4">
                <div className="font-bold text-gray-900">הרמה הנוכחית שלך</div>
                <div className="text-sm text-gray-600">{levelSummary.title}</div>
              </div>
            </div>

            {/* Next Level */}
            <div className="flex items-center opacity-60">
              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold border-2 border-gray-300">
                {assignedLevel + 1}
              </div>
              <div className="mr-4">
                <div className="font-bold text-gray-700">הרמה הבאה</div>
                <div className="text-sm text-gray-500">נפתח לאחר השלמת האתגרים</div>
              </div>
            </div>

            {/* Future Levels */}
            <div className="flex items-center opacity-30">
              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold border border-gray-200">
                {assignedLevel + 2}+
              </div>
              <div className="mr-4">
                <div className="font-bold text-gray-500">רמות עתידיות</div>
                <div className="text-sm text-gray-400">תיפתחנה בהדרגה</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Motivation */}
      <Card className="p-6 bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200">
        <div className="text-center">
          <h4 className="text-xl font-bold text-primary-900 mb-3">
            🚀 מוכן להתחיל את המסע?
          </h4>
          <p className="text-primary-800 mb-4">
            זה רק ההתחלה! הפלטפורמה שלנו תעזור לך להתקדם צעד אחר צעד ולהשיג את המטרות שלך בכדורגל.
          </p>
          <div className="text-sm text-primary-700">
            זכור: כל אלוף התחיל כמו שאתה מתחיל עכשיו
          </div>
        </div>
      </Card>

      {/* Continue Button */}
      <div className="text-center">
        <Button
          variant="primary"
          size="lg"
          onClick={onComplete}
          disabled={loading}
          className="px-12 py-4 text-lg"
        >
          {loading ? 'מעבד...' : 'בואו נתחיל לתרגל! ⚽'}
        </Button>
      </div>
    </div>
  )
}
