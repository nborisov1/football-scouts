'use client'

/**
 * Training Page - Training programs and exercises
 * Preserves functionality from pages/training.html + js/training.js
 */

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { showMessage } from '@/components/MessageContainer'

export default function TrainingPage() {
  const { user } = useAuth()
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null)

  const trainingPrograms = [
    {
      id: 'fitness-basic',
      title: 'כושר בסיסי',
      description: 'תוכנית כושר בסיסית למתחילים',
      duration: '30 דקות',
      difficulty: 'קל',
      exercises: ['ריצה', 'כפיפות בטן', 'שכיבות סמיכה']
    },
    {
      id: 'technical-skills',
      title: 'מיומנויות טכניות',
      description: 'פיתוח מיומנויות טכניות עם הכדור',
      duration: '45 דקות',
      difficulty: 'בינוני',
      exercises: ['כדרור', 'שליטה בכדור', 'מסירות']
    },
    {
      id: 'tactical-training',
      title: 'אימון טקטי',
      description: 'הבנת טקטיקות משחק',
      duration: '60 דקות',
      difficulty: 'מתקדם',
      exercises: ['תרגילי קבוצה', 'עמדות', 'מעבר התקפה-הגנה']
    }
  ]

  const handleStartProgram = (programId: string) => {
    showMessage(`מתחיל תוכנית: ${trainingPrograms.find(p => p.id === programId)?.title}`, 'success')
    setSelectedProgram(programId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-green-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">תוכניות אימון</h1>
          <p className="text-xl text-green-100">
            {user 
              ? `שלום ${user.name}, בחר תוכנית אימון מותאמת לרמה שלך`
              : 'תוכניות אימון מותאמות לכל רמה'
            }
          </p>
        </div>
      </section>

      {/* Training Programs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainingPrograms.map((program) => (
              <div key={program.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold mb-3">{program.title}</h3>
                <p className="text-gray-600 mb-4">{program.description}</p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">משך זמן:</span>
                    <span className="text-sm font-medium">{program.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">רמת קושי:</span>
                    <span className={`text-sm font-medium ${
                      program.difficulty === 'קל' ? 'text-green-600' :
                      program.difficulty === 'בינוני' ? 'text-yellow-600' : 'text-red-600'
                    }`}>{program.difficulty}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-2">תרגילים:</h4>
                  <ul className="space-y-1">
                    {program.exercises.map((exercise, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <i className="fas fa-check text-green-500 ml-2"></i>
                        {exercise}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleStartProgram(program.id)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  התחל אימון
                </button>
              </div>
            ))}
          </div>

          {/* User Progress Section */}
          {user && (
            <div className="mt-16 bg-white rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6">ההתקדמות שלי</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{user.weeklyTrainings || 0}</div>
                  <div className="text-sm text-gray-600">אימונים השבוע</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{user.points || 0}</div>
                  <div className="text-sm text-gray-600">נקודות כושר</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{user.weeklyProgress || 0}%</div>
                  <div className="text-sm text-gray-600">שיפור השבוע</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
