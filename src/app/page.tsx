'use client'

/**
 * Homepage - Main landing page with personalized content
 * Preserves exact functionality from original index.html
 */

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { USER_TYPES } from '@/lib/firebase'
import { showMessage } from '@/components/MessageContainer'

// Mock data for demonstration (same as original)
const mockLeaderboardData = {
  consistent: [
    { name: 'דני לוי', score: 28, position: 'חלוץ', age: 17 },
    { name: 'יוסי כהן', score: 26, position: 'קשר', age: 18 },
    { name: 'אבי גולן', score: 24, position: 'מגן', age: 16 },
  ],
  improved: [
    { name: 'רועי שמש', score: 85, position: 'קשר', age: 16 },
    { name: 'אלון דגן', score: 78, position: 'מגן', age: 18 },
    { name: 'גיא לוי', score: 72, position: 'חלוץ', age: 17 },
  ],
  ranked: [
    { name: 'אורי מלכה', score: 95, position: 'חלוץ', age: 18 },
    { name: 'יובל שמעון', score: 92, position: 'קשר', age: 17 },
    { name: 'איתי לוי', score: 90, position: 'מגן', age: 19 },
  ]
}

export default function HomePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'consistent' | 'improved' | 'ranked'>('consistent')
  const [testimonialIndex, setTestimonialIndex] = useState(0)

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

  const renderGuestHero = () => (
    <section className="bg-gradient-to-l from-blue-600 to-blue-800 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-right">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              גלה את הפוטנציאל שלך בכדורגל
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              פלטפורמה המחברת בין שחקני כדורגל מוכשרים לסקאוטים מקצועיים
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => showMessage('מערכת ההרשמה תיפתח בקרוב', 'info')}
                className="bg-white text-blue-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
              >
                <i className="fas fa-running ml-2"></i>
                הרשם כשחקן
              </button>
              <button 
                onClick={() => showMessage('מערכת ההרשמה תיפתח בקרוב', 'info')}
                className="bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-400 border-2 border-white transition-colors"
              >
                <i className="fas fa-search ml-2"></i>
                הרשם כסקאוט
              </button>
            </div>
          </div>
          <div className="text-center">
            <div className="w-[500px] h-[400px] bg-gray-300 rounded-lg shadow-2xl mx-auto flex items-center justify-center">
              <span className="text-gray-600">תמונת גיבור</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  const renderAuthenticatedHero = () => (
    <section className="bg-gradient-to-l from-green-600 to-green-800 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              שלום {user?.name || 'חבר'}!
            </h1>
            <p className="text-xl mb-6 text-green-100">
              {user?.type === USER_TYPES.PLAYER && 'ממשיך להתפתח ולהשתפר'}
              {user?.type === USER_TYPES.SCOUT && 'מגלה כישרונות חדשים'}
              {user?.type === USER_TYPES.ADMIN && 'מנהל את הפלטפורמה'}
            </p>
            
            {/* User Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <i className="fas fa-calendar-check text-2xl mb-2"></i>
                <div className="text-lg font-semibold">{user?.weeklyTrainings || 0}</div>
                <div className="text-sm">אימונים השבוע</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <i className="fas fa-trophy text-2xl mb-2"></i>
                <div className="text-lg font-semibold">{user?.points || 0}</div>
                <div className="text-sm">נקודות</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 text-center">
                <i className="fas fa-target text-2xl mb-2"></i>
                <div className="text-lg font-semibold">{user?.completedChallenges || 0}</div>
                <div className="text-sm">אתגרים הושלמו</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/training"
                className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors inline-flex items-center justify-center"
              >
                <i className="fas fa-dumbbell ml-2"></i>
                המשך אימון
              </Link>
              <Link
                href="/challenges"
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-400 border-2 border-white transition-colors inline-flex items-center justify-center"
              >
                <i className="fas fa-tasks ml-2"></i>
                אתגרים חדשים
              </Link>
            </div>
          </div>

          {/* Progress Circle */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">{user?.weeklyProgress || 0}%</div>
                  <div className="text-sm">השבוע</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {user ? renderAuthenticatedHero() : renderGuestHero()}

      {/* Features Section - Only for guests */}
      {!user && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              איך זה עובד?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: 'fas fa-user-plus',
                  title: 'צור פרופיל',
                  description: 'הרשם ויצור פרופיל אישי עם הפרטים והיכולות שלך'
                },
                {
                  icon: 'fas fa-tasks',
                  title: 'השלם אתגרים',
                  description: 'בצע סדרת אתגרים ראשוניים כדי לקבוע את רמת המיומנות שלך'
                },
                {
                  icon: 'fas fa-dumbbell',
                  title: 'קבל תוכנית אימון',
                  description: 'קבל תוכנית אימון מותאמת אישית בהתאם לרמה שלך'
                },
                {
                  icon: 'fas fa-trophy',
                  title: 'התקדם ובלוט',
                  description: 'צבור נקודות, השתפר והופע בטבלאות המובילים שלנו'
                }
              ].map((feature, index) => (
                <div key={index} className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="text-4xl text-blue-600 mb-4">
                    <i className={feature.icon}></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Leaderboards Preview */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            טבלאות מובילים
          </h2>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm">
              {[
                { key: 'consistent' as const, label: 'הכי עקביים' },
                { key: 'improved' as const, label: 'השיפור הגדול ביותר' },
                { key: 'ranked' as const, label: 'דירוג הגבוה ביותר' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">דירוג</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">שם</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">עמדה</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">גיל</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    {activeTab === 'consistent' && 'ימים רצופים'}
                    {activeTab === 'improved' && '% שיפור'}
                    {activeTab === 'ranked' && 'נקודות'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockLeaderboardData[activeTab].map((player, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{player.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{player.position}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{player.age}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-blue-600">{player.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/leaderboards"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              צפה בכל הטבלאות
              <i className="fas fa-arrow-left mr-2"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials - Only for guests */}
      {!user && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              סיפורי הצלחה
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="mb-6">
                  <p className="text-lg text-gray-700 italic mb-6">
                    "{testimonials[testimonialIndex].content}"
                  </p>
                  <div className="flex items-center justify-center space-x-4 space-x-reverse">
                    <div className="w-15 h-15 bg-gray-300 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-gray-500"></i>
                    </div>
                    <div className="text-right">
                      <h4 className="font-semibold text-gray-900">
                        {testimonials[testimonialIndex].author}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {testimonials[testimonialIndex].role}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Navigation */}
                <div className="flex justify-center space-x-4 space-x-reverse">
                  <button
                    onClick={() => setTestimonialIndex((prev) => 
                      prev === 0 ? testimonials.length - 1 : prev - 1
                    )}
                    className="p-2 rounded-full bg-white shadow hover:shadow-md transition-shadow"
                  >
                    <i className="fas fa-chevron-right text-gray-600"></i>
                  </button>
                  <button
                    onClick={() => setTestimonialIndex((prev) => 
                      (prev + 1) % testimonials.length
                    )}
                    className="p-2 rounded-full bg-white shadow hover:shadow-md transition-shadow"
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
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              מוכן להתחיל את המסע שלך?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              הצטרף עכשיו וקח את הקריירה שלך לשלב הבא
            </p>
            <button 
              onClick={() => showMessage('מערכת ההרשמה תיפתח בקרוב', 'info')}
              className="bg-white text-blue-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
            >
              הרשם עכשיו
            </button>
          </div>
        </section>
      )}
    </div>
  )
}