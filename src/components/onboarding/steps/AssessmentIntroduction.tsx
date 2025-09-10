'use client'

import React from 'react'
import { Challenge } from '@/types/challenge'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface AssessmentIntroductionProps {
  challenges: Challenge[]
  onComplete: (data?: any) => void
  onBack: () => void
  loading: boolean
}

export default function AssessmentIntroduction({ 
  challenges, 
  onComplete, 
  onBack, 
  loading 
}: AssessmentIntroductionProps) {
  
  return (
    <div className="space-y-6">
      {/* Main Introduction */}
      <Card className="p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">⚽</div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            מבחן הרמה שלך
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            בואו נבין את הרמה הנוכחית שלך! תבצע {challenges.length} אתגרים קצרים שיעזרו לנו 
            לקבוע את נקודת ההתחלה הטובה ביותר עבורך.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h4 className="font-bold text-blue-900 mb-4 text-xl">איך זה עובד?</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-2">📹</div>
              <div className="font-medium text-blue-800">1. צלם סרטון</div>
              <div className="text-blue-600">בצע את האתגר וצלם את עצמך</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-blue-800">2. הזן נתונים</div>
              <div className="text-blue-600">רשום את התוצאות שלך</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🏆</div>
              <div className="font-medium text-blue-800">3. קבל רמה</div>
              <div className="text-blue-600">נקבע את הרמה שלך</div>
            </div>
          </div>
        </div>

        {/* Time estimate */}
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-3 space-x-reverse">
            <div className="text-green-500 text-xl">⏱️</div>
            <div>
              <div className="font-medium text-green-900">זמן משוער: 15-20 דקות</div>
              <div className="text-sm text-green-700">כולל הכנה וביצוע האתגרים</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Challenges Preview */}
      <Card className="p-6">
        <h4 className="text-xl font-bold text-gray-900 mb-4">
          האתגרים שתבצע ({challenges.length})
        </h4>
        
        <div className="space-y-3">
          {challenges.map((challenge, index) => (
            <div key={challenge.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm mr-4">
                {index + 1}
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-gray-900">{challenge.title}</h5>
                <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
              </div>
              <div className="flex-shrink-0 text-sm text-gray-500">
                {challenge.category}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tips */}
      <Card className="p-6 bg-yellow-50 border border-yellow-200">
        <h4 className="font-bold text-yellow-900 mb-3 flex items-center">
          <span className="text-xl mr-2">💡</span>
          טיפים לביצוע מוצלח
        </h4>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>ודא שיש לך מקום פתוח לביצוע התרגילים</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>הכן כדור כדורגל וכמה קונוסים (או חפצים דומים)</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>צלם מזווית שמראה בבירור את הביצוע</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>אל תלחץ - זה לא מבחן אלא דרך לעזור לך</span>
          </li>
        </ul>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={loading}
          className="sm:w-auto"
        >
          חזור
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={onComplete}
          disabled={loading}
          className="flex-1"
        >
          בואו נתחיל! 🚀
        </Button>
      </div>
    </div>
  )
}
