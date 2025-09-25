'use client'

/**
 * Homepage - Main landing page with personalized content
 * Preserves exact functionality from original index.html
 */

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'
import RegistrationModal from '@/components/modals/RegistrationModal'
import LoginModal from '@/components/modals/LoginModal'
import { useRankings } from '@/hooks/useRankings'

import { USER_TYPES } from '@/lib/firebase'

// Mock data for demonstration - single ranking leaderboard
const mockLeaderboardData = [
  { name: 'אורי מלכה', score: 95, position: 'חלוץ', age: 18 },
  { name: 'יובל שמעון', score: 92, position: 'קשר', age: 17 },
  { name: 'איתי לוי', score: 90, position: 'מגן', age: 19 },
  { name: 'יוסי כהן', score: 88, position: 'קשר', age: 18 },
  { name: 'דני לוי', score: 85, position: 'חלוץ', age: 17 },
  { name: 'אבי גולן', score: 82, position: 'מגן', age: 16 },
]

export default function HomePage() {
  const { user } = useAuth()
  const [testimonialIndex, setTestimonialIndex] = useState(0)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [registrationType, setRegistrationType] = useState<'player' | 'scout' | null>(null)
  
  // Get top 5 players for homepage preview
  const { filteredRankings: allRankings, loading: rankingsLoading } = useRankings()
  const topPlayers = allRankings.slice(0, 5)

  const testimonials = [
    {
      content: "הפלטפורמה הזו עזרה לי להתפתח כשחקן ולהתחבר עם סקאוטים מקצועיים. היום אני משחק בקבוצת נוער מובילה.",
      author: "יוסי כהן",
      role: "שחקן, גיל 17",
      image: "/images/player1.jpg"
    },
    {
      content: "כסקאוט, מצאתי כאן כישרונות צעירים מדהימים שלא הייתי מגלה בדרך אחרת. הפלטפורמה חוסכת לי זמן רב.",
      author: "דוד לוי",
      role: "סקאוט, מכבי חיפה",
      image: "/images/scout1.jpg"
    }
  ]

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  const openRegistration = (type?: 'player' | 'scout') => {
    setRegistrationType(type || null)
    setShowRegistrationModal(true)
    setShowLoginModal(false)
  }

  const openLogin = () => {
    setShowLoginModal(true)
    setShowRegistrationModal(false)
  }

  const renderGuestHero = () => (
    <section className="bg-field-gradient text-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold mb-4 text-with-shadow">
            גלה את הפוטנציאל שלך בכדורגל
          </h1>
          <p className="text-xl text-white text-with-shadow max-w-3xl mx-auto">
            הפלטפורמה המובילה המחברת בין שחקני כדורגל מוכשרים לסקאוטים מקצועיים
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8">
            <button 
              onClick={() => openRegistration('player')}
              className="bg-transparent text-white px-8 py-4 rounded-xl font-display font-bold text-lg border-2 border-white hover:bg-white hover:text-field-700 transition-all duration-300 hover:scale-105 shadow-stadium flex items-center justify-center"
            >
              <i className="fas fa-search ml-3"></i>
              הרשם כשחקן
            </button>
            <button 
              onClick={() => openRegistration('scout')}
              className="bg-transparent text-white px-8 py-4 rounded-xl font-display font-bold text-lg border-2 border-white hover:bg-white hover:text-field-700 transition-all duration-300 hover:scale-105 shadow-stadium flex items-center justify-center"
            >
              <i className="fas fa-search ml-3"></i>
              הרשם כסקאוט
            </button>
          </div>
        </div>
      </div>
    </section>
  )

  const renderAuthenticatedHero = () => (
    <section className="bg-field-gradient text-white py-12">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold mb-4 text-with-shadow">
            שלום {user?.displayName || user?.firstName || 'חבר'}! 👋
          </h1>
          <p className="text-xl text-white text-with-shadow">
            {user?.type === USER_TYPES.PLAYER && '⚽ ממשיך להתפתח ולהשתפר בכדורגל'}
            {user?.type === USER_TYPES.SCOUT && '🔍 מגלה כישרונות חדשים מדי יום'}
            {user?.type === USER_TYPES.ADMIN && '👑 מנהל את הפלטפורמה בצורה מקצועית'}
          </p>
          
          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8">
            <Link
              href="/challenges"
              className="group bg-transparent text-white px-8 py-4 rounded-xl font-display font-bold border-2 border-white hover:bg-white hover:text-field-700 transition-all duration-300 hover:scale-105 shadow-stadium inline-flex items-center justify-center"
            >
              <i className="fas fa-bullseye ml-3 group-hover:text-field-600 transition-colors"></i>
              התחל אתגרים
            </Link>
            <Link
              href="/challenges"
              className="group bg-transparent text-white px-8 py-4 rounded-xl font-display font-bold border-2 border-white hover:bg-white hover:text-field-700 transition-all duration-300 hover:scale-105 shadow-stadium inline-flex items-center justify-center"
            >
              <i className="fas fa-tasks ml-3 group-hover:text-field-600 transition-colors"></i>
              אתגרים חדשים
            </Link>
          </div>
        </div>
      </div>
    </section>
  )


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      {user ? renderAuthenticatedHero() : renderGuestHero()}

      {/* Features Section - Only for guests */}
      {!user && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-stadium-900">
                איך זה עובד?
              </h2>
              <p className="text-lg text-stadium-600 max-w-2xl mx-auto">
                ארבעה שלבים פשוטים להתחלת המסע שלך בעולם הכדורגל
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: 'fas fa-user-plus',
                  title: 'צור פרופיל',
                  description: 'הרשם ויצור פרופיל אישי עם הפרטים והיכולות שלך',
                  color: 'field-500',
                  step: '01'
                },
                {
                  icon: 'fas fa-tasks',
                  title: 'השלם אתגרים',
                  description: 'בצע סדרת אתגרים ראשוניים כדי לקבוע את רמת המיומנות שלך',
                  color: 'accent-500',
                  step: '02'
                },
                {
                  icon: 'fas fa-dumbbell',
                  title: 'קבל תוכנית אימון',
                  description: 'קבל תוכנית אימון מותאמת אישית בהתאם לרמה שלך',
                  color: 'field-600',
                  step: '03'
                },
                {
                  icon: 'fas fa-trophy',
                  title: 'התקדם ובלוט',
                  description: 'צבור נקודות, השתפר והופע בטבלאות המובילים שלנו',
                  color: 'accent-600',
                  step: '04'
                }
              ].map((feature, index) => (
                <div key={index} className="relative group">
                  <div className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-lg transition-all duration-300 border border-gray-200">
                    {/* Step number */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-field-gradient rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {feature.step}
                    </div>
                    
                    <div className={`w-16 h-16 bg-${feature.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <i className={`${feature.icon} text-white text-2xl`}></i>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-3 text-stadium-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-stadium-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Leaderboards Preview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-stadium-900">
              🏆 טבלת מובילים
            </h2>
            <p className="text-lg text-stadium-600 max-w-2xl mx-auto">
              עקוב אחר השחקנים הטובים ביותר לפי נקודות דירוג
            </p>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 p-4">
              <h3 className="text-lg font-semibold text-stadium-900">
                דירוג השחקנים הטובים ביותר
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">דירוג</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">שחקן</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">עמדה</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">גיל</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">נקודות דירוג</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rankingsLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2"></div>
                          טוען דירוגים...
                        </div>
                      </td>
                    </tr>
                  ) : topPlayers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        אין שחקנים זמינים כרגע
                      </td>
                    </tr>
                  ) : (
                    topPlayers.map((player, index) => (
                      <tr key={player.playerId} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-5 text-sm font-bold">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-yellow-600' : 'bg-gray-500'
                            }`}>
                              {player.rank}
                            </div>
                            {index < 3 && (
                              <i className={`fas fa-medal ml-2 ${
                                index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-yellow-600'
                              }`}></i>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-semibold text-gray-900">
                          {player.playerName}
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-600">
                          <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                            {player.position === 'goalkeeper' ? 'שוער' :
                             player.position === 'defender' ? 'מגן' :
                             player.position === 'midfielder' ? 'קשר' :
                             player.position === 'forward' ? 'חלוץ' : player.position}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-600">{player.age}</td>
                        <td className="px-6 py-5 text-sm">
                          <span className="font-bold text-field-600 text-lg">{player.totalPoints}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/leaderboards"
              className="btn-primary px-8 py-4 text-lg hover:shadow-stadium-glow transition-all duration-300 hover:scale-105 inline-flex items-center"
            >
              <span>צפה בכל הטבלאות</span>
              <i className="fas fa-arrow-left mr-3"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials - Only for guests */}
      {!user && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-stadium-900">
                💬 סיפורי הצלחה
              </h2>
              <p className="text-lg text-stadium-600 max-w-2xl mx-auto">
                שמע מהאנשים שכבר שינו את חייהם באמצעות הפלטפורמה שלנו
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="mb-10">
                  <div className="text-6xl mb-6">💭</div>
                  <p className="text-xl text-stadium-700 italic leading-relaxed mb-8 font-medium">
                    "{testimonials[testimonialIndex].content}"
                  </p>
                  
                  <div className="flex items-center justify-center space-x-6 space-x-reverse">
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-gray-500 text-2xl"></i>
                    </div>
                    <div className="text-right">
                      <h4 className="text-lg font-semibold text-stadium-900">
                        {testimonials[testimonialIndex].author}
                      </h4>
                      <p className="text-sm text-gray-600 font-medium">
                        {testimonials[testimonialIndex].role}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Navigation */}
                <div className="flex justify-center space-x-6 space-x-reverse">
                  <button
                    onClick={() => setTestimonialIndex((prev) => 
                      prev === 0 ? testimonials.length - 1 : prev - 1
                    )}
                    className="w-12 h-12 rounded-full bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center border border-gray-200"
                  >
                    <i className="fas fa-chevron-right text-gray-600"></i>
                  </button>
                  
                  {/* Dots indicator */}
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setTestimonialIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === testimonialIndex 
                            ? 'bg-field-500 scale-125' 
                            : 'bg-gray-300 hover:bg-field-300'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setTestimonialIndex((prev) => 
                      (prev + 1) % testimonials.length
                    )}
                    className="w-12 h-12 rounded-full bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center border border-gray-200"
                  >
                    <i className="fas fa-chevron-left text-gray-600"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Only for guests */}
      {!user && (
        <section className="bg-field-gradient text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold mb-4 text-with-shadow leading-tight">
                  מוכן להתחיל את המסע שלך?
                </h2>
                <p className="text-xl text-white text-with-shadow max-w-2xl mx-auto leading-relaxed">
                  הצטרף עכשיו לקהילת הכדורגל הגדולה בישראל וקח את הקריירה שלך לשלב הבא
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8">
                <button 
                  onClick={() => openRegistration('player')}
                  className="bg-white text-field-700 px-8 py-4 rounded-xl font-display font-bold text-lg hover:bg-field-50 transition-all duration-300 hover:scale-105 shadow-stadium flex items-center justify-center"
                >
                  <i className="fas fa-running ml-3 text-field-600"></i>
                  הרשם כשחקן
                </button>
                <button 
                  onClick={() => openRegistration('scout')}
                  className="bg-transparent text-white px-8 py-4 rounded-xl font-display font-bold text-lg border-2 border-white hover:bg-white hover:text-field-700 transition-all duration-300 hover:scale-105 shadow-stadium flex items-center justify-center"
                >
                  <i className="fas fa-search ml-3"></i>
                  הרשם כסקאוט
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Registration Modal */}
      <RegistrationModal 
        isOpen={showRegistrationModal} 
        onClose={() => setShowRegistrationModal(false)}
        onSwitchToLogin={openLogin}
        initialType={registrationType}
      />

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={openRegistration}
      />
    </div>
  )
}