'use client'

import React from 'react'

interface ComingSoonProps {
  title: string
  description: string
  icon?: string
  features?: string[]
  expectedDate?: string
  className?: string
}

export default function ComingSoon({ 
  title, 
  description, 
  icon = 'fas fa-rocket',
  features = [],
  expectedDate,
  className = ''
}: ComingSoonProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full shadow-2xl">
            <i className={`${icon} text-6xl text-white`}></i>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          {title}
        </h1>

        {/* Description */}
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>

        {/* Features List */}
        {features.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">מה צפוי להגיע:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 space-x-reverse bg-white rounded-lg p-4 shadow-md">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-check text-green-600 text-sm"></i>
                    </div>
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expected Date */}
        {expectedDate && (
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 space-x-reverse bg-yellow-100 text-yellow-800 px-6 py-3 rounded-full">
              <i className="fas fa-calendar-alt"></i>
              <span className="font-semibold">צפוי להשתחרר: {expectedDate}</span>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="space-y-4">
          <p className="text-gray-600">
            רוצה לקבל עדכון כשהתוכן יהיה זמין?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium text-lg">
              <i className="fas fa-bell ml-2"></i>
              הודע לי כשזה יהיה זמין
            </button>
            <button 
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <i className="fas fa-arrow-right ml-2"></i>
              חזור לעמוד הקודם
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-12">
          <div className="flex items-center justify-center space-x-2 space-x-reverse mb-4">
            <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-primary-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-sm text-gray-500">אנחנו עובדים על זה...</p>
        </div>
      </div>
    </div>
  )
}
