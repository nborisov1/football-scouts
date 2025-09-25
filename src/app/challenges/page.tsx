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
import PersonalizedChallengeCard from '@/components/player/PersonalizedChallengeCard'
import { PersonalizedChallengeService } from '@/lib/personalizedChallengeService'
import type { PersonalizedChallenge, ChallengeSubmission, PersonalizedChallengeSet } from '@/types/challenge'

export default function ChallengesPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [challengeSet, setChallengeSet] = useState<PersonalizedChallengeSet | null>(null)
  const [selectedChallenge, setSelectedChallenge] = useState<PersonalizedChallenge | null>(null)
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'recommended'>('daily')

  useEffect(() => {
    if (user && user.currentLevel > 0) {
      loadPersonalizedChallenges()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadPersonalizedChallenges = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const challenges = await PersonalizedChallengeService.getPersonalizedChallenges(user)
      setChallengeSet(challenges)
      console.log('📊 Loaded personalized challenges:', challenges)
    } catch (error) {
      console.error('❌ Error loading challenges:', error)
      showMessage('שגיאה בטעינת האתגרים', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChallengeSubmission = (submission: ChallengeSubmission) => {
    console.log('✅ Challenge submitted:', submission)
    setSelectedChallenge(null)
    // Reload challenges to update progress
    loadPersonalizedChallenges()
  }

  // Show player-specific page for players
  if (user?.type === 'player') {
    // Check if user has completed level assessment first
    // User is considered to have completed assessment if currentLevel > 0
    if (user.currentLevel === 0) {
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

    if (loading) {
      return (
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-field-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <i className="fas fa-futbol text-white text-xl"></i>
              </div>
              <p className="text-stadium-600">טוען את האתגרים שלך...</p>
            </div>
          </div>
        </ProtectedRoute>
      )
    }

    // Show individual challenge view
    if (selectedChallenge) {
      return (
        <ProtectedRoute>
          <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
              <div className="max-w-4xl mx-auto">
                <Button
                  onClick={() => setSelectedChallenge(null)}
                  variant="secondary"
                  className="mb-6"
                >
                  <i className="fas fa-arrow-right ml-2"></i>
                  חזור לרשימת האתגרים
                </Button>
                
                <PersonalizedChallengeCard
                  challenge={selectedChallenge}
                  onSubmissionComplete={handleChallengeSubmission}
                />
              </div>
            </div>
          </div>
        </ProtectedRoute>
      )
    }

    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          {/* Header Section */}
          <section className="bg-field-gradient text-white py-12">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl font-bold mb-4">האתגרים שלי</h1>
              <p className="text-xl text-white text-opacity-90 mb-6">
                אתגרים מותאמים אישית לרמה שלך, עמדה וגיל
              </p>
              <div className="flex items-center space-x-6 space-x-reverse">
                <div className="flex items-center">
                  <i className="fas fa-level-up-alt text-white text-opacity-80 ml-2"></i>
                  <span>רמה {user.currentLevel}</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-user-tag text-white text-opacity-80 ml-2"></i>
                  <span>{user.position || 'כל העמדות'}</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-birthday-cake text-white text-opacity-80 ml-2"></i>
                  <span>גיל {user.age}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Challenge Navigation */}
          <section className="py-6 bg-white border-b">
            <div className="container mx-auto px-4">
              <div className="flex space-x-4 space-x-reverse">
                {[
                  { key: 'daily', label: 'יומי', icon: 'fas fa-calendar-day' },
                  { key: 'weekly', label: 'שבועי', icon: 'fas fa-calendar-week' },
                  { key: 'monthly', label: 'חודשי', icon: 'fas fa-calendar-alt' },
                  { key: 'recommended', label: 'מומלצים', icon: 'fas fa-star' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as 'daily' | 'weekly' | 'monthly' | 'recommended')}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <i className={`${tab.icon} ml-2`}></i>
                    {tab.label}
                    {challengeSet && (
                      <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center mr-2">
                        {challengeSet[tab.key as keyof PersonalizedChallengeSet].length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Challenge Grid */}
          <section className="py-8">
            <div className="container mx-auto px-4">
              {challengeSet ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {challengeSet[activeTab].map((challenge: PersonalizedChallenge) => (
                    <div
                      key={challenge.id}
                      className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedChallenge(challenge)}
                    >
                      {challenge.thumbnailUrl && (
                        <img
                          src={challenge.thumbnailUrl}
                          alt={challenge.title}
                          className="w-full h-32 object-cover rounded-lg mb-4"
                        />
                      )}
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{challenge.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{challenge.description}</p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <i className="fas fa-clock text-gray-400 ml-1"></i>
                          <span className="text-sm text-gray-600">{challenge.estimatedCompletion} דק&apos;</span>
                        </div>
                        <div className="flex items-center">
                          <i className="fas fa-coins text-yellow-500 ml-1"></i>
                          <span className="text-sm font-medium text-yellow-600">{challenge.points}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          {[...Array(10)].map((_, i) => (
                            <i 
                              key={i} 
                              className={`fas fa-circle text-xs ${i < challenge.difficulty ? 'text-orange-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {challenge.personalizedReason && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4">
                          <p className="text-xs text-blue-700">{challenge.personalizedReason}</p>
                        </div>
                      )}
                      
                      <Button className="w-full" size="sm">
                        התחל אתגר
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">אין אתגרים זמינים</h2>
                  <p className="text-gray-600 mb-6">
                    לא מצאנו אתגרים מתאימים עבורך כרגע. נסה שוב מאוחר יותר.
                  </p>
                  <Button onClick={loadPersonalizedChallenges}>
                    רענן אתגרים
                  </Button>
                </div>
              )}
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