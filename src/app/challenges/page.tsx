'use client'

/**
 * Challenges Page - Advanced challenge progression system
 * Comprehensive challenge management with real-time data
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'
import ProtectedRoute from '@/components/ProtectedRoute'
import ComingSoon from '@/components/ComingSoon'
import Button from '@/components/ui/Button'

export default function ChallengesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Simple loading simulation
    setLoading(false)
  }, [])

  // Show player-specific page for players
  if (user?.type === 'player') {
    // Check if user has completed level assessment first
    if (!user.assessmentCompleted) {
      return (
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-6">⚽</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                בואו נקבע את הרמה שלך!
              </h2>
              <p className="text-gray-600 mb-6">
                לפני שתוכל להתחיל עם האתגרים, אנחנו צריכים לבדוק את הרמה הנוכחית שלך. 
                זה ייקח רק כמה דקות ויעזור לנו לתת לך אתגרים מתאימים.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>מה כולל מבחן הרמה?</strong><br/>
                  • 5 תרגילים קצרים<br/>
                  • צילום סרטון של הביצוע<br/>
                  • הזנת התוצאות שלך<br/>
                  • קביעת הרמה המתאימה עבורך
                </p>
              </div>
              <Button
                onClick={() => window.location.href = '/assessment'}
                className="px-8 py-3"
                size="lg"
              >
                🎯 בואו נתחיל את מבחן הרמה
              </Button>
            </div>
          </div>
        </ProtectedRoute>
      )
    }

    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          {/* Header Section */}
          <section className="bg-blue-600 text-white py-12">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl font-bold mb-4">האתגרים שלי</h1>
              <p className="text-xl text-blue-100">
                ברכות! סיימת את מבחן הרמה. האתגרים הבאים יהיו זמינים בקרוב!
              </p>
            </div>
          </section>

          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  הרמה שלך: {user.currentLevel || 1}
                </h2>
                <p className="text-gray-600 mb-6">
                  אתגרים מותאמים לרמה שלך יהיו זמינים בקרוב. 
                  המערכת תכלול אתגרים מתקדמים והתקדמות לרמות גבוהות יותר.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>בינתיים:</strong> תוכל לחזור למבחן הרמה לשיפור הציון שלך
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </ProtectedRoute>
    )
  }

  // Show Coming Soon page for admins/scouts
  return (
    <ProtectedRoute>
      <ComingSoon
        title="אתגרים בקרוב"
        description="אנחנו עובדים על מערכת אתגרים מתקדמת שתאפשר לכם להתחרות, להתקדם ולשפר את הכישורים שלכם. המערכת תכלול אתגרים מותאמים אישית, מערכת ניקוד, ותחרויות עם שחקנים אחרים."
        icon="fas fa-trophy"
        features={[
          "אתגרים מותאמים אישית לפי רמת הכישורים",
          "מערכת ניקוד מתקדמת עם ליגות ורמות",
          "תחרויות שבועיות וחודשיות",
          "אתגרים קבוצתיים עם חברים",
          "מעקב התקדמות מפורט",
          "פרסים וציונים מיוחדים",
          "אתגרים אינטראקטיביים עם AI",
          "שיתוף הישגים ברשתות חברתיות"
        ]}
        expectedDate="ינואר 2024"
      />
    </ProtectedRoute>
  )
}