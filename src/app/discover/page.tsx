'use client'

/**
 * Discover Page - Discover players and opportunities
 * New page for player discovery functionality
 */

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import PageLayout from '@/components/PageLayout'

export default function DiscoverPage() {
  const { user } = useAuth()

  return (
    <PageLayout
      title="גלה שחקנים"
      subtitle="מצא שחקנים מוכשרים ואפשרויות חדשות"
      comingSoon={{
        title: "עמוד בפיתוח",
        description: "עמוד הגילוי יאפשר לך למצוא שחקנים חדשים ואפשרויות מרתקות. העמוד נמצא בפיתוח ויהיה זמין בקרוב.",
        icon: "fas fa-search",
        features: [
          "חיפוש מתקדם של שחקנים לפי קריטריונים שונים",
          "מסנני גיל, עמדה ורמת כישורים",
          "צפייה בפרופילי שחקנים מפורטים",
          "מערכת המלצות חכמה",
          "יכולת ליצור רשימות מעקב אישיות",
          "התראות על שחקנים חדשים רלוונטיים",
          "אנליטיקה מתקדמת של ביצועי שחקנים",
          "השוואת שחקנים זה מול זה"
        ],
        expectedDate: "מרץ 2024"
      }}
      headerActions={
        <button className="btn-page-secondary">
          <i className="fas fa-bell"></i>
          הודע לי כשיהיה זמין
        </button>
      }
    >
      {/* This content won't be rendered because comingSoon is active */}
    </PageLayout>
  )
}
