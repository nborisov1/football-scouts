'use client'

/**
 * Leaderboards Page - Shows player rankings in different categories
 * Preserves exact functionality from pages/leaderboards.html + js/leaderboards.js
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'
import ProtectedRoute from '@/components/ProtectedRoute'

// Mock data (same as original)
interface Player {
  id: number
  name: string
  email: string
  age: number
  position: 'goalkeeper' | 'defender' | 'midfielder' | 'forward'
  level: 'beginner' | 'intermediate' | 'advanced'
  dominantFoot: 'right' | 'left' | 'both'
  club: string
  profileImage: string
  stats: {
    consistency: number
    improvement: number
    ranking: number
  }
  videos: Array<{
    id: number
    title: string
    date: string
    thumbnail: string
  }>
}

const MOCK_PLAYERS: Player[] = [
  {
    id: 1,
    name: 'דני לוי',
    email: 'danny@example.com',
    age: 17,
    position: 'forward',
    level: 'intermediate',
    dominantFoot: 'right',
    club: 'מכבי תל אביב נוער',
    profileImage: '/images/player1.jpg',
    stats: { consistency: 28, improvement: 65, ranking: 85 },
    videos: [
      { id: 1, title: 'אתגר 1: שליטה בכדור', date: '2025-01-15', thumbnail: '/images/video-thumbnail-1.jpg' },
      { id: 2, title: 'אתגר 2: כדרור', date: '2025-01-20', thumbnail: '/images/video-thumbnail-2.jpg' },
      { id: 3, title: 'אתגר 3: בעיטות', date: '2025-01-25', thumbnail: '/images/video-thumbnail-3.jpg' }
    ]
  },
  {
    id: 2,
    name: 'יוסי כהן',
    email: 'yossi@example.com',
    age: 18,
    position: 'midfielder',
    level: 'advanced',
    dominantFoot: 'left',
    club: 'הפועל חיפה נוער',
    profileImage: '/images/player2.jpg',
    stats: { consistency: 26, improvement: 78, ranking: 92 },
    videos: [
      { id: 4, title: 'אתגר 1: שליטה בכדור', date: '2025-01-10', thumbnail: '/images/video-thumbnail-2.jpg' },
      { id: 5, title: 'אתגר 2: כדרור', date: '2025-01-15', thumbnail: '/images/video-thumbnail-3.jpg' }
    ]
  },
  // Additional players can be added here...
  {
    id: 3,
    name: 'אבי גולן',
    email: 'avi@example.com',
    age: 16,
    position: 'defender',
    level: 'intermediate',
    dominantFoot: 'right',
    club: 'בית"ר ירושלים נוער',
    profileImage: '/images/player3.jpg',
    stats: { consistency: 24, improvement: 72, ranking: 90 },
    videos: []
  },
  {
    id: 4,
    name: 'רועי שמש',
    email: 'roi@example.com',
    age: 16,
    position: 'midfielder',
    level: 'intermediate',
    dominantFoot: 'right',
    club: 'בני יהודה נוער',
    profileImage: '/images/player4.jpg',
    stats: { consistency: 18, improvement: 85, ranking: 80 },
    videos: []
  },
  {
    id: 5,
    name: 'אלון דגן',
    email: 'alon@example.com',
    age: 18,
    position: 'defender',
    level: 'advanced',
    dominantFoot: 'right',
    club: 'מכבי חיפה נוער',
    profileImage: '/images/player5.jpg',
    stats: { consistency: 16, improvement: 78, ranking: 75 },
    videos: []
  }
]

type LeaderboardType = 'consistent' | 'improved' | 'ranked'
type StatKey = 'consistency' | 'improvement' | 'ranking'

interface Filters {
  age: string
  position: string
  level: string
}

export default function LeaderboardsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<LeaderboardType>('consistent')
  const [filters, setFilters] = useState<Filters>({ age: '', position: '', level: '' })
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [showModal, setShowModal] = useState(false)

  const getStatKey = (type: LeaderboardType): StatKey => {
    switch (type) {
      case 'consistent': return 'consistency'
      case 'improved': return 'improvement'
      case 'ranked': return 'ranking'
    }
  }

  const getStatLabel = (type: LeaderboardType): string => {
    switch (type) {
      case 'consistent': return 'ימים רצופים'
      case 'improved': return 'אחוז שיפור'
      case 'ranked': return 'נקודות'
    }
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

  const getHebrewFoot = (foot: string): string => {
    switch (foot) {
      case 'right': return 'ימין'
      case 'left': return 'שמאל'
      case 'both': return 'שתיהן'
      default: return foot
    }
  }

  const filterPlayers = (players: Player[]): Player[] => {
    return players.filter(player => {
      // Filter by age
      if (filters.age) {
        if (filters.age === '20+') {
          if (player.age < 20) return false
        } else {
          const [minAge, maxAge] = filters.age.split('-').map(Number)
          if (player.age < minAge || player.age > maxAge) return false
        }
      }

      // Filter by position
      if (filters.position && player.position !== filters.position) {
        return false
      }

      // Filter by level
      if (filters.level && player.level !== filters.level) {
        return false
      }

      return true
    })
  }

  const getSortedPlayers = (type: LeaderboardType): Player[] => {
    const statKey = getStatKey(type)
    return [...MOCK_PLAYERS].sort((a, b) => b.stats[statKey] - a.stats[statKey])
  }

  const getFilteredAndSortedPlayers = (type: LeaderboardType): Player[] => {
    const sortedPlayers = getSortedPlayers(type)
    return filterPlayers(sortedPlayers)
  }

  const handleViewProfile = (player: Player) => {
    setSelectedPlayer(player)
    setShowModal(true)
  }

  const handleContactPlayer = (player: Player) => {
    showMessage(`נשלחה בקשת יצירת קשר עם ${player.name}`, 'success')
    setShowModal(false)
  }

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Filters are already applied via state
  }

  const handleFilterReset = () => {
    setFilters({ age: '', position: '', level: '' })
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('he-IL')
  }

  const tabs = [
    { key: 'consistent' as const, label: 'הכי עקביים', description: 'שחקנים אלה מתאמנים באופן קבוע ומשלימים את האתגרים שלהם בזמן' },
    { key: 'improved' as const, label: 'השיפור הגדול ביותר', description: 'שחקנים אלה הראו את השיפור הגדול ביותר בביצועים שלהם לאורך זמן' },
    { key: 'ranked' as const, label: 'דירוג הגבוה ביותר', description: 'שחקנים אלה צברו את הדירוג הגבוה ביותר במערכת' }
  ]

  const currentPlayers = getFilteredAndSortedPlayers(activeTab)
  const currentTab = tabs.find(tab => tab.key === activeTab)!

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-field-gradient text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-with-shadow">טבלאות מובילים</h1>
          <p className="text-xl text-white/90 text-with-shadow">גלה את השחקנים המובילים בקטגוריות שונות</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-stadium border border-field-200">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-300 ${
                    activeTab === tab.key
                      ? 'bg-field-gradient text-white shadow-stadium-glow'
                      : 'text-stadium-600 hover:text-field-600 hover:bg-field-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Current Tab Header */}
          <div className="bg-white rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-2">{currentTab.label}</h2>
            <p className="text-gray-600">{currentTab.description}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Leaderboard */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">דירוג</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">שחקן</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">גיל</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">עמדה</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">רמה</th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                        {getStatLabel(activeTab)}
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-medium text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentPlayers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          לא נמצאו שחקנים התואמים את הסינון
                        </td>
                      </tr>
                    ) : (
                      currentPlayers.map((player, index) => {
                        const rank = index + 1
                        const statKey = getStatKey(activeTab)
                        return (
                          <tr key={player.id} className="hover:bg-gray-50">
                            <td className={`px-6 py-4 text-sm font-bold ${
                              rank <= 3 ? 'text-yellow-600' : 'text-gray-900'
                            }`}>
                              {rank <= 3 && <i className="fas fa-medal mr-1"></i>}
                              {rank}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center ml-3">
                                  <i className="fas fa-user text-gray-500"></i>
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                  {player.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{player.age}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {getHebrewPosition(player.position)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {getHebrewLevel(player.level)}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-field-600">
                              {player.stats[statKey]}
                              {activeTab === 'improved' && '%'}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleViewProfile(player)}
                                className="text-field-600 hover:text-field-800 text-sm font-medium transition-colors"
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

            {/* Filters */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">סינון</h3>
                <form onSubmit={handleFilterSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="age-filter" className="block text-sm font-medium text-gray-700 mb-1">
                      גיל
                    </label>
                    <select
                      id="age-filter"
                      value={filters.age}
                      onChange={(e) => setFilters(prev => ({ ...prev, age: e.target.value }))}
                      className="w-full px-3 py-2 border border-stadium-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500 bg-white text-stadium-900 hover:border-field-400 transition-colors"
                    >
                      <option value="">הכל</option>
                      <option value="8-12">8-12</option>
                      <option value="13-16">13-16</option>
                      <option value="17-19">17-19</option>
                      <option value="20+">20+</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="position-filter" className="block text-sm font-medium text-gray-700 mb-1">
                      עמדה
                    </label>
                    <select
                      id="position-filter"
                      value={filters.position}
                      onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full px-3 py-2 border border-stadium-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500 bg-white text-stadium-900 hover:border-field-400 transition-colors"
                    >
                      <option value="">הכל</option>
                      <option value="goalkeeper">שוער</option>
                      <option value="defender">מגן</option>
                      <option value="midfielder">קשר</option>
                      <option value="forward">חלוץ</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="level-filter" className="block text-sm font-medium text-gray-700 mb-1">
                      רמה
                    </label>
                    <select
                      id="level-filter"
                      value={filters.level}
                      onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                      className="w-full px-3 py-2 border border-stadium-300 rounded-md focus:outline-none focus:ring-2 focus:ring-field-500 bg-white text-stadium-900 hover:border-field-400 transition-colors"
                    >
                      <option value="">הכל</option>
                      <option value="beginner">מתחיל</option>
                      <option value="intermediate">בינוני</option>
                      <option value="advanced">מתקדם</option>
                    </select>
                  </div>

                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      type="submit"
                      className="flex-1 bg-field-gradient text-white py-2 px-4 rounded-md hover:shadow-stadium-glow transition-all duration-300 font-medium"
                    >
                      סנן
                    </button>
                    <button
                      type="button"
                      onClick={handleFilterReset}
                      className="flex-1 bg-stadium-200 text-stadium-700 py-2 px-4 rounded-md hover:bg-stadium-300 transition-all duration-300 font-medium"
                    >
                      נקה
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Player Profile Modal */}
      {showModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">פרופיל שחקן</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Profile Header */}
            <div className="flex items-center mb-6 pb-6 border-b">
              <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center ml-4">
                <i className="fas fa-user text-gray-500 text-2xl"></i>
              </div>
              <div>
                <h3 className="text-xl font-semibold">{selectedPlayer.name}</h3>
                <p className="text-gray-600">{getHebrewPosition(selectedPlayer.position)}, {selectedPlayer.age}</p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4">פרטים אישיים</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">גיל</div>
                  <div className="font-medium">{selectedPlayer.age}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">עמדה</div>
                  <div className="font-medium">{getHebrewPosition(selectedPlayer.position)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">רמה</div>
                  <div className="font-medium">{getHebrewLevel(selectedPlayer.level)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">רגל דומיננטית</div>
                  <div className="font-medium">{getHebrewFoot(selectedPlayer.dominantFoot)}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-500">מועדון נוכחי</div>
                  <div className="font-medium">{selectedPlayer.club || 'לא צוין'}</div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4">סטטיסטיקות</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-field-50 rounded-lg border border-field-200">
                  <div className="text-2xl font-bold text-field-600">{selectedPlayer.stats.consistency}</div>
                  <div className="text-sm text-stadium-600">ימים רצופים</div>
                </div>
                <div className="text-center p-4 bg-field-50 rounded-lg border border-field-200">
                  <div className="text-2xl font-bold text-secondary-600">{selectedPlayer.stats.improvement}%</div>
                  <div className="text-sm text-stadium-600">שיפור</div>
                </div>
                <div className="text-center p-4 bg-field-50 rounded-lg border border-field-200">
                  <div className="text-2xl font-bold text-accent-600">{selectedPlayer.stats.ranking}</div>
                  <div className="text-sm text-stadium-600">דירוג</div>
                </div>
              </div>
            </div>

            {/* Videos */}
            {selectedPlayer.videos.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">סרטונים אחרונים</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedPlayer.videos.map((video) => (
                    <div key={video.id} className="border rounded-lg p-3">
                      <div className="w-full h-24 bg-gray-200 rounded mb-2 flex items-center justify-center">
                        <i className="fas fa-play text-gray-500"></i>
                      </div>
                      <div className="text-sm font-medium">{video.title}</div>
                      <div className="text-xs text-gray-500">{formatDate(video.date)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end">
              <button
                onClick={() => handleContactPlayer(selectedPlayer)}
                className="bg-field-gradient text-white px-6 py-2 rounded-lg hover:shadow-stadium-glow transition-all duration-300 font-medium"
              >
                צור קשר
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  )
}
