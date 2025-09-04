'use client'

/**
 * Discover Page - Discover players and opportunities
 * New page for player discovery functionality
 */

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'

export default function DiscoverPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">גלה שחקנים</h1>
          <p className="text-xl text-purple-100">
            מצא שחקנים מוכשרים ואפשרויות חדשות
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <i className="fas fa-search text-6xl text-gray-300 mb-6"></i>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">עמוד בפיתוח</h2>
            <p className="text-gray-600 mb-8">
              עמוד הגילוי יאפשר לך למצוא שחקנים חדשים ואפשרויות מרתקות. 
              העמוד נמצא בפיתוח ויהיה זמין בקרוב.
            </p>
            <button
              onClick={() => showMessage('תכונה זו תהיה זמינה בקרוב!', 'info')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              הודע לי כשיהיה מוכן
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
