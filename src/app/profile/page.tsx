'use client'

/**
 * Profile Page - User profile management
 * Preserves functionality from pages/profile.html + js/profile.js
 */

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'
import ProtectedRoute from '@/components/ProtectedRoute'

import { USER_TYPES } from '@/lib/firebase'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age || 18,
    position: user?.position || '',
    dominantFoot: user?.dominantFoot || 'right',
    level: user?.level || 'beginner',
    organization: user?.organization || ''
  })


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    }))
  }

  const handleSave = async () => {
    try {
      await updateProfile(formData)
      showMessage('הפרופיל עודכן בהצלחה!', 'success')
      setIsEditing(false)
    } catch (error) {
      showMessage('שגיאה בעדכון הפרופיל', 'error')
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      age: user.age || 18,
      position: user.position || '',
      dominantFoot: user.dominantFoot || 'right',
      level: user.level || 'beginner',
      organization: user.organization || ''
    })
    setIsEditing(false)
  }

  const getPositionHebrew = (position: string) => {
    switch (position) {
      case 'goalkeeper': return 'שוער'
      case 'defender': return 'מגן'
      case 'midfielder': return 'קשר'
      case 'forward': return 'חלוץ'
      default: return position
    }
  }

  const getLevelHebrew = (level: string) => {
    switch (level) {
      case 'beginner': return 'מתחיל'
      case 'intermediate': return 'בינוני'
      case 'advanced': return 'מתקדם'
      case 'professional': return 'מקצועי'
      default: return level
    }
  }

  const getFootHebrew = (foot: string) => {
    switch (foot) {
      case 'right': return 'ימין'
      case 'left': return 'שמאל'
      case 'both': return 'שתיהן'
      default: return foot
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center ml-6">
              <i className="fas fa-user text-3xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-blue-100">
                {user.type === USER_TYPES.PLAYER && 'שחקן'}
                {user.type === USER_TYPES.SCOUT && 'סקאוט'}
                {user.type === USER_TYPES.ADMIN && 'מנהל'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">פרטים אישיים</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <i className="fas fa-edit ml-2"></i>
                      ערוך פרופיל
                    </button>
                  ) : (
                    <div className="space-x-2 space-x-reverse">
                      <button
                        onClick={handleSave}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        שמור
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        ביטול
                      </button>
                    </div>
                  )}
                </div>

                {!isEditing ? (
                  // View Mode
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">שם מלא</label>
                      <p className="text-lg font-medium">{user.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">אימייל</label>
                      <p className="text-lg font-medium">{user.email}</p>
                    </div>
                    
                    {user.type === USER_TYPES.PLAYER && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">גיל</label>
                          <p className="text-lg font-medium">{user.age}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">עמדה</label>
                          <p className="text-lg font-medium">{getPositionHebrew(user.position || '')}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">רגל דומיננטית</label>
                          <p className="text-lg font-medium">{getFootHebrew(user.dominantFoot || '')}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">רמת ניסיון</label>
                          <p className="text-lg font-medium">{getLevelHebrew(user.level || '')}</p>
                        </div>
                      </>
                    )}

                    {user.type === USER_TYPES.SCOUT && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">ארגון</label>
                        <p className="text-lg font-medium">{user.organization || 'לא צוין'}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Edit Mode
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">אימייל</label>
                      <p className="text-lg font-medium text-gray-400">{user.email}</p>
                      <small className="text-gray-500">לא ניתן לשנות</small>
                    </div>
                    
                    {user.type === USER_TYPES.PLAYER && (
                      <>
                        <div>
                          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">גיל</label>
                          <input
                            type="number"
                            id="age"
                            name="age"
                            value={formData.age}
                            onChange={handleInputChange}
                            min="13"
                            max="50"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">עמדה</label>
                          <select
                            id="position"
                            name="position"
                            value={formData.position}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">בחר עמדה</option>
                            <option value="goalkeeper">שוער</option>
                            <option value="defender">מגן</option>
                            <option value="midfielder">קשר</option>
                            <option value="forward">חלוץ</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="dominantFoot" className="block text-sm font-medium text-gray-700 mb-1">רגל דומיננטית</label>
                          <select
                            id="dominantFoot"
                            name="dominantFoot"
                            value={formData.dominantFoot}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="right">ימין</option>
                            <option value="left">שמאל</option>
                            <option value="both">שתיהן</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">רמת ניסיון</label>
                          <select
                            id="level"
                            name="level"
                            value={formData.level}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="beginner">מתחיל</option>
                            <option value="intermediate">בינוני</option>
                            <option value="advanced">מתקדם</option>
                            <option value="professional">מקצועי</option>
                          </select>
                        </div>
                      </>
                    )}

                    {user.type === USER_TYPES.SCOUT && (
                      <div>
                        <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">ארגון</label>
                        <input
                          type="text"
                          id="organization"
                          name="organization"
                          value={formData.organization}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="שם הארגון או הקבוצה"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold mb-4">סטטיסטיקות</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">נקודות:</span>
                    <span className="font-bold text-blue-600">{user.points || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">אימונים השבוע:</span>
                    <span className="font-bold text-green-600">{user.weeklyTrainings || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">אתגרים הושלמו:</span>
                    <span className="font-bold text-purple-600">{user.completedChallenges || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">שיפור השבוע:</span>
                    <span className="font-bold text-orange-600">{user.weeklyProgress || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h3 className="text-lg font-bold mb-4">פעילות אחרונה</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <i className="fas fa-dumbbell text-green-500 ml-2"></i>
                    <span>השלמת אימון כושר</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <i className="fas fa-trophy text-yellow-500 ml-2"></i>
                    <span>אתגר הושלם בהצלחה</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <i className="fas fa-chart-line text-blue-500 ml-2"></i>
                    <span>עליה בדירוג</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </ProtectedRoute>
  )
}
