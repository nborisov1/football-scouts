'use client'

/**
 * Leaderboards Page - Shows player rankings with real-time data
 * Uses the new ranking system with comprehensive player statistics
 */

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useRankings } from '@/hooks/useRankings'

interface Filters {
  age: string
  position: string
  level: string
}

export default function LeaderboardsPage() {
  const { user } = useAuth()
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [filters, setFilters] = useState<Filters>({ age: '', position: '', level: '' })
  
  const {
    filteredRankings: rankings,
    loading,
    error,
    stats,
    setFilters: updateFilters
  } = useRankings()

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<Filters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    updateFilters(updatedFilters)
  }

  const getHebrewPosition = (position: string): string => {
    switch (position) {
      case 'goalkeeper': return 'שוער'
      case 'defender': return 'מגן'
      case 'midfielder': return 'קשר'
      case 'forward': return 'חלוץ'
      default: return position
    }
  }

  const getHebrewLevel = (level: string): string => {
    switch (level) {
      case 'beginner': return 'מתחיל'
      case 'intermediate': return 'בינוני'
      case 'advanced': return 'מתקדם'
      default: return level
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">טוען דירוגים...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">שגיאה בטעינת הדירוגים</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              נסה שוב
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <section className="bg-indigo-600 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">טבלת המובילים</h1>
            <p className="text-xl text-indigo-100">
              דירוג שחקנים לפי ביצועים והתקדמות
            </p>
            
            {/* Stats Overview */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold">{stats.totalPlayers}</div>
                <div className="text-indigo-100">סה"כ שחקנים</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold">{stats.averagePoints}</div>
                <div className="text-indigo-100">נקודות ממוצעות</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold">{stats.topScore}</div>
                <div className="text-indigo-100">הציון הגבוה ביותר</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {stats.levelDistribution.advanced || 0}
                </div>
                <div className="text-indigo-100">שחקנים מתקדמים</div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="bg-white border-b py-6">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Age Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  גיל
                </label>
                <select
                  value={filters.age}
                  onChange={(e) => handleFilterChange({ age: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="">כל הגילאים</option>
                  <option value="16-18">16-18</option>
                  <option value="19-21">19-21</option>
                  <option value="22+">22+</option>
                </select>
              </div>

              {/* Position Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  עמדה
                </label>
                <select
                  value={filters.position}
                  onChange={(e) => handleFilterChange({ position: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="">כל העמדות</option>
                  <option value="goalkeeper">שוער</option>
                  <option value="defender">מגן</option>
                  <option value="midfielder">קשר</option>
                  <option value="forward">חלוץ</option>
                </select>
              </div>

              {/* Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  רמה
                </label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange({ level: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="">כל הרמות</option>
                  <option value="beginner">מתחיל</option>
                  <option value="intermediate">בינוני</option>
                  <option value="advanced">מתקדם</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Leaderboard Table */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        דירוג
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        שחקן
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        גיל
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        עמדה
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        רמה
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        נקודות
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        סרטונים הושלמו
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ציון ממוצע
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        פעולות
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rankings.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                          לא נמצאו שחקנים התואמים את הסינון
                        </td>
                      </tr>
                    ) : (
                      rankings.map((player, index) => {
                        const rank = player.rank
                        return (
                          <tr key={player.playerId} className="hover:bg-gray-50">
                            <td className={`px-6 py-4 text-sm font-bold ${
                              rank <= 3 ? 'text-yellow-600' : 'text-gray-900'
                            }`}>
                              <div className="flex items-center">
                                {rank <= 3 && (
                                  <i className={`fas fa-medal mr-2 ${
                                    rank === 1 ? 'text-yellow-500' : 
                                    rank === 2 ? 'text-gray-400' : 'text-yellow-600'
                                  }`}></i>
                                )}
                                {rank}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center ml-3">
                                  <i className="fas fa-user text-gray-500"></i>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {player.playerName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {player.playerEmail}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{player.age}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {getHebrewPosition(player.position)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                player.level === 'advanced' ? 'bg-green-100 text-green-800' :
                                player.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {getHebrewLevel(player.level)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className="font-bold text-indigo-600 text-lg">
                                {player.totalPoints}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {player.completedVideos}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {player.averageScore > 0 ? player.averageScore.toFixed(1) : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              <button
                                onClick={() => {
                                  setSelectedPlayer(player)
                                  setShowModal(true)
                                }}
                                className="text-indigo-600 hover:text-indigo-900 font-medium"
                              >
                                צפה בפרופיל
                              </button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Player Details Modal */}
        {showModal && selectedPlayer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedPlayer.playerName}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">פרטים אישיים</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">דירוג:</span>
                        <span className="mr-2 text-indigo-600 font-bold">#{selectedPlayer.rank}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">גיל:</span>
                        <span className="mr-2">{selectedPlayer.age}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">עמדה:</span>
                        <span className="mr-2">{getHebrewPosition(selectedPlayer.position)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">רמה:</span>
                        <span className="mr-2">{getHebrewLevel(selectedPlayer.level)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">סטטיסטיקות</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">נקודות כולל:</span>
                        <span className="mr-2 text-indigo-600 font-bold">{selectedPlayer.totalPoints}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">סרטונים הושלמו:</span>
                        <span className="mr-2">{selectedPlayer.completedVideos}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">סדרות הושלמו:</span>
                        <span className="mr-2">{selectedPlayer.completedSeries}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">ציון ממוצע:</span>
                        <span className="mr-2">{selectedPlayer.averageScore > 0 ? selectedPlayer.averageScore.toFixed(1) : '-'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">הישגים:</span>
                        <span className="mr-2">{selectedPlayer.achievements}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">ביצועים</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">עקביות</span>
                        <span className="text-sm text-gray-900">{selectedPlayer.consistency}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${selectedPlayer.consistency}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">שיפור</span>
                        <span className="text-sm text-gray-900">{selectedPlayer.improvement}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${selectedPlayer.improvement}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3 space-x-reverse">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    סגור
                  </button>
                  <button
                    onClick={() => {
                      showMessage('פונקציונליות יצירת קשר תגיע בקרוב', 'info')
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    צור קשר
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}