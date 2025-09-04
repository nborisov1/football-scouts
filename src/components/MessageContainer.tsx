'use client'

/**
 * Message Container - Shows success, error, and info messages
 * Preserves functionality from original showMessage system
 */

import React, { useState, useEffect } from 'react'

interface Message {
  id: string
  content: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

let messageId = 0
let addMessageFunction: ((message: Omit<Message, 'id'>) => void) | null = null

// Global function to show messages (like original showMessage)
export const showMessage = (content: string, type: Message['type'] = 'info', duration = 5000) => {
  if (addMessageFunction) {
    addMessageFunction({ content, type, duration })
  }
}

export default function MessageContainer() {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    // Set up global message function
    addMessageFunction = (message: Omit<Message, 'id'>) => {
      const newMessage: Message = {
        ...message,
        id: `message-${++messageId}`
      }
      
      setMessages(prev => [...prev, newMessage])

      // Auto-remove after duration
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== newMessage.id))
      }, message.duration || 5000)
    }

    return () => {
      addMessageFunction = null
    }
  }, [])

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id))
  }

  const getMessageStyles = (type: Message['type']) => {
    const baseStyles = "p-4 rounded-lg shadow-lg flex items-center justify-between mb-3 animate-in slide-in-from-top duration-300"
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-100 border border-green-200 text-green-800`
      case 'error':
        return `${baseStyles} bg-red-100 border border-red-200 text-red-800`
      case 'warning':
        return `${baseStyles} bg-yellow-100 border border-yellow-200 text-yellow-800`
      case 'info':
      default:
        return `${baseStyles} bg-blue-100 border border-blue-200 text-blue-800`
    }
  }

  const getMessageIcon = (type: Message['type']) => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle'
      case 'error':
        return 'fas fa-exclamation-circle'
      case 'warning':
        return 'fas fa-exclamation-triangle'
      case 'info':
      default:
        return 'fas fa-info-circle'
    }
  }

  if (messages.length === 0) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
      {messages.map((message) => (
        <div
          key={message.id}
          className={getMessageStyles(message.type)}
          dir="rtl"
        >
          <div className="flex items-center">
            <i className={`${getMessageIcon(message.type)} ml-3`}></i>
            <span className="text-sm font-medium">{message.content}</span>
          </div>
          <button
            onClick={() => removeMessage(message.id)}
            className="text-current hover:opacity-70 font-bold text-lg leading-none"
            aria-label="סגור הודעה"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
