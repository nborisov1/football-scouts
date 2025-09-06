'use client'

/**
 * Watchlist Page - Scout's player watchlist
 * For scouts to track interesting players
 */

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'
import ProtectedRoute from '@/components/ProtectedRoute'

import { USER_TYPES } from '@/lib/firebase'

export default function WatchlistPage() {
  const { user } = useAuth()


  if (user?.type !== USER_TYPES.SCOUT) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">גישה מוגבלת</h2>
          <p className="text-gray-600">רשימת המעקב זמינה רק לסקאוטים</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-indigo-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">רשימת המעקב שלי</h1>
          <p className="text-xl text-indigo-100">
            עקוב אחר שחקנים מעניינים וצפה בהתקדמותם
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <i className="fas fa-list text-6xl text-gray-300 mb-6"></i>
            <h2 className="text-2xl font-bold text-gray-700 mb-4">רשימת המעקב ריקה</h2>
            <p className="text-gray-600 mb-8">
              התחל לעקוב אחר שחקנים מעניינים מעמוד הגילוי או מטבלאות המובילים. 
              השחקנים שתוסיף יופיעו כאן לצורך מעקב נוח.
            </p>
            <button
              onClick={() => showMessage('עבור לעמוד הגילוי כדי למצוא שחקנים', 'info')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              מצא שחקנים
            </button>
          </div>
        </div>
      </section>
      </div>
    </ProtectedRoute>
  )
}
