'use client'

/**
 * Challenges Page - User challenges and competitions
 * Preserves functionality from pages/challenges.html + js/challenges.js
 */

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'

interface Challenge {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  completed: boolean
  category: 'technical' | 'fitness' | 'tactical'
}

export default function ChallengesPage() {
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const challenges: Challenge[] = [
    {
      id: 'juggling-10',
      title: 'ז\'אגלינג 10 פעמים',
      description: 'שמור על הכדור באוויר 10 פעמים ברצף',
      difficulty: 'easy',
      points: 50,
      completed: false,
      category: 'technical'
    },
    {
      id: 'sprint-100m',
      title: 'ריצת ספרינט 100 מטר',
      description: 'רוץ 100 מטר תחת 15 שניות',
      difficulty: 'medium',
      points: 75,
      completed: true,
      category: 'fitness'
    },
    {
      id: 'accuracy-shooting',
      title: 'דיוק בבעיטות',
      description: 'פגע במטרה 8 מתוך 10 בעיטות',
      difficulty: 'hard',
      points: 100,
      completed: false,
      category: 'technical'
    },
    {
      id: 'endurance-run',
      title: 'ריצת סיבולת',
      description: 'רוץ 5 ק"מ ללא הפסקה',
      difficulty: 'hard',
      points: 120,
      completed: false,
      category: 'fitness'
    },
    {
      id: 'pass-accuracy',
      title: 'דיוק במסירות',
      description: 'בצע 15 מסירות מדויקות ברצף',
      difficulty: 'medium',
      points: 80,
      completed: true,
      category: 'tactical'
    }
  ]

  const categories = [
    { id: 'all', label: 'הכל' },
    { id: 'technical', label: 'טכני' },
    { id: 'fitness', label: 'כושר' },
    { id: 'tactical', label: 'טקטי' }
  ]

  const filteredChallenges = activeCategory === 'all' 
    ? challenges 
    : challenges.filter(challenge => challenge.category === activeCategory)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'קל'
      case 'medium': return 'בינוני'
      case 'hard': return 'קשה'
      default: return difficulty
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return 'fas fa-futbol'
      case 'fitness': return 'fas fa-running'
      case 'tactical': return 'fas fa-chess'
      default: return 'fas fa-trophy'
    }
  }

  const handleStartChallenge = (challenge: Challenge) => {
    if (challenge.completed) {
      showMessage('האתגר כבר הושלם!', 'info')
      return
    }
    showMessage(`מתחיל אתגר: ${challenge.title}`, 'success')
  }

  const totalPoints = challenges.filter(c => c.completed).reduce((sum, c) => sum + c.points, 0)
  const completedCount = challenges.filter(c => c.completed).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-field-gradient text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-with-shadow">אתגרים</h1>
          <p className="text-xl text-white/90 text-with-shadow">
            {user 
              ? `שלום ${user.name}, השלם אתגרים וזכה בנקודות!`
              : 'השלם אתגרים וזכה בנקודות והישגים'
            }
          </p>
        </div>
      </section>

      {/* Stats Section */}
      {user && (
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-field-600">{completedCount}</div>
                <div className="text-sm text-stadium-600">אתגרים הושלמו</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-600">{totalPoints}</div>
                <div className="text-sm text-stadium-600">נקודות שנצברו</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-600">{challenges.length - completedCount}</div>
                <div className="text-sm text-stadium-600">אתגרים זמינים</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-stadium border border-field-200">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-2 rounded-md font-medium transition-all duration-300 ${
                    activeCategory === category.id
                      ? 'bg-field-gradient text-white shadow-stadium-glow'
                      : 'text-stadium-600 hover:text-field-600 hover:bg-field-50'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Challenges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge) => (
              <div 
                key={challenge.id} 
                className={`bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-all ${
                  challenge.completed ? 'border-l-4 border-green-500' : ''
                }`}
              >
                {/* Challenge Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <i className={`${getCategoryIcon(challenge.category)} text-field-600 text-xl ml-3`}></i>
                    <div>
                      <h3 className="text-lg font-bold">{challenge.title}</h3>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                        {getDifficultyLabel(challenge.difficulty)}
                      </span>
                    </div>
                  </div>
                  {challenge.completed && (
                    <i className="fas fa-check-circle text-green-500 text-xl"></i>
                  )}
                </div>

                {/* Challenge Description */}
                <p className="text-gray-600 mb-4">{challenge.description}</p>

                {/* Points */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <i className="fas fa-star text-yellow-500 ml-1"></i>
                    <span className="font-medium text-yellow-600">{challenge.points} נקודות</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleStartChallenge(challenge)}
                  disabled={challenge.completed}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                    challenge.completed
                      ? 'bg-secondary-100 text-secondary-600 cursor-not-allowed'
                      : 'bg-field-gradient text-white hover:shadow-stadium-glow hover:scale-105'
                  }`}
                >
                  {challenge.completed ? 'הושלם' : 'התחל אתגר'}
                </button>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredChallenges.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-trophy text-gray-300 text-6xl mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">אין אתגרים בקטגוריה זו</h3>
              <p className="text-gray-500">נסה לבחור קטגוריה אחרת</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
