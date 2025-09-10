'use client'

/**
 * Admin Dashboard - Main admin interface
 * Replaces admin/dashboard.html + js/admin.js functionality
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'
import ProtectedRoute from '@/components/ProtectedRoute'

import { USER_TYPES } from '@/lib/firebase'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPlayers: 0,
    totalScouts: 0,
    pendingVideos: 0,
    newUsersToday: 0
  })

  // Redirect if not admin
  if (!user || user.type !== USER_TYPES.ADMIN) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">גישה מוגבלת</h2>
          <p className="text-gray-600">דף זה זמין רק למנהלי המערכת</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    // Load admin statistics
    // This would normally fetch from Firestore
    setStats({
      totalUsers: 145,
      totalPlayers: 98,
      totalScouts: 42,
      pendingVideos: 12,
      newUsersToday: 7
    })
  }, [])

  const StatCard = ({ title, value, icon, color }: {
    title: string
    value: number
    icon: string
    color: string
  }) => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} ml-4`}>
          <i className={`${icon} text-white text-xl`}></i>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">פאנל ניהול</h1>
              <p className="text-gray-600">ברוך הבא, {user.displayName || user.firstName}</p>
            </div>
            <div className="flex space-x-4 space-x-reverse">
              <button
                onClick={() => {/* showMessage('תכונה זו תהיה זמינה בקרוב', 'info') */}}
                className="btn-primary"
              >
                <i className="fas fa-download ml-2"></i>
                ייצא דוח
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="סך המשתמשים"
            value={stats.totalUsers}
            icon="fas fa-users"
            color="bg-primary-500"
          />
          <StatCard
            title="שחקנים"
            value={stats.totalPlayers}
            icon="fas fa-futbol"
            color="bg-green-500"
          />
          <StatCard
            title="סקאוטים"
            value={stats.totalScouts}
            icon="fas fa-search"
            color="bg-primary-500"
          />
          <StatCard
            title="סרטונים ממתינים"
            value={stats.pendingVideos}
            icon="fas fa-video"
            color="bg-orange-500"
          />
          <StatCard
            title="משתמשים חדשים היום"
            value={stats.newUsersToday}
            icon="fas fa-user-plus"
            color="bg-red-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4">פעולות מהירות</h3>
            <div className="space-y-3">
              <button
                onClick={() => showMessage('מעבר לניהול משתמשים', 'info')}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <i className="fas fa-users text-primary-500 ml-3"></i>
                <div>
                  <div className="font-medium">ניהול משתמשים</div>
                  <div className="text-sm text-gray-500">הצג, ערוך והשעה משתמשים</div>
                </div>
              </button>
              <button
                onClick={() => showMessage('מעבר לניהול סרטונים', 'info')}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <i className="fas fa-video text-green-500 ml-3"></i>
                <div>
                  <div className="font-medium">ניהול סרטונים</div>
                  <div className="text-sm text-gray-500">אשר או דחה סרטונים</div>
                </div>
              </button>
              <button
                onClick={() => showMessage('מעבר לניהול תוכניות אימון', 'info')}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <i className="fas fa-dumbbell text-purple-500 ml-3"></i>
                <div>
                  <div className="font-medium">תוכניות אימון</div>
                  <div className="text-sm text-gray-500">צור ועדכן תוכניות אימון</div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4">פעילות אחרונה</h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 rounded-lg bg-gray-50">
                <i className="fas fa-user-plus text-green-500 ml-3"></i>
                <div className="flex-1">
                  <div className="text-sm font-medium">שחקן חדש נרשם</div>
                  <div className="text-xs text-gray-500">לפני 5 דקות</div>
                </div>
              </div>
              <div className="flex items-center p-3 rounded-lg bg-gray-50">
                <i className="fas fa-video text-primary-500 ml-3"></i>
                <div className="flex-1">
                  <div className="text-sm font-medium">סרטון חדש הועלה</div>
                  <div className="text-xs text-gray-500">לפני 12 דקות</div>
                </div>
              </div>
              <div className="flex items-center p-3 rounded-lg bg-gray-50">
                <i className="fas fa-trophy text-yellow-500 ml-3"></i>
                <div className="flex-1">
                  <div className="text-sm font-medium">אתגר הושלם</div>
                  <div className="text-xs text-gray-500">לפני 18 דקות</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Items */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold mb-4">דורש תשומת לב</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border border-orange-200 rounded-lg bg-orange-50">
              <i className="fas fa-video text-orange-500 text-3xl mb-2"></i>
              <div className="text-lg font-bold text-orange-700">{stats.pendingVideos}</div>
              <div className="text-sm text-orange-600">סרטונים ממתינים לאישור</div>
              <button 
                onClick={() => showMessage('מעבר לניהול סרטונים', 'info')}
                className="mt-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                עבור לבדיקה
              </button>
            </div>
            <div className="text-center p-4 border border-primary-200 rounded-lg bg-primary-50">
              <i className="fas fa-user-clock text-primary-500 text-3xl mb-2"></i>
              <div className="text-lg font-bold text-primary-700">3</div>
              <div className="text-sm text-primary-600">משתמשים ממתינים לאישור</div>
              <button 
                onClick={() => showMessage('מעבר לניהול משתמשים', 'info')}
                className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                עבור לאישור
              </button>
            </div>
            <div className="text-center p-4 border border-red-200 rounded-lg bg-red-50">
              <i className="fas fa-flag text-red-500 text-3xl mb-2"></i>
              <div className="text-lg font-bold text-red-700">1</div>
              <div className="text-sm text-red-600">דיווחים על תוכן</div>
              <button 
                onClick={() => showMessage('מעבר לניהול דיווחים', 'info')}
                className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
              >
                עבור לטיפול
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}
