'use client'

/**
 * Authentication Context for Football Scouting Platform
 * Provides authentication state and methods across the React app
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserData, AuthContextType, RegisterData, UserType } from '@/types/user'
import { showMessage } from '@/components/MessageContainer'

// Import Firebase directly - Next.js config will handle SSR
import { auth, db, USER_TYPES, COLLECTIONS } from '@/lib/firebase'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const loadUserData = async (uid: string) => {
    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, uid)
      const userDocSnap = await getDoc(userDocRef)
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data()
        console.log('✅ Loaded user data:', userData)
        return userData
      } else {
        console.log('❌ No user document found for:', uid)
        return null
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error)
      return null
    }
  }

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    console.log('🔄 Setting up Firebase auth listener...')

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          console.log('✅ Firebase user found:', firebaseUser.email)
          
          // Get user data from Firestore
          const userData = await loadUserData(firebaseUser.uid)
          
          if (userData) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
              type: userData.type || USER_TYPES.PLAYER,
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              age: userData.age || 0,
              position: userData.position || '',
              team: userData.team || '',
              level: userData.level || 'beginner',
              dominantFoot: userData.dominantFoot || 'right',
              organization: userData.organization || '',
              ...userData
            })
          } else {
            // User document doesn't exist, create basic user data
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
              type: USER_TYPES.PLAYER, // Default type
              firstName: '',
              lastName: '',
              age: 0,
              position: '',
              team: '',
              level: 'beginner',
              dominantFoot: 'right',
              organization: ''
            })
          }
        } else {
          console.log('❌ No Firebase user found')
          setUser(null)
        }
      } catch (error) {
        console.error('❌ Error in auth state change:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log('✅ Login successful:', userCredential.user.email)
      return userCredential
    } catch (error: any) {
      console.error('❌ Login error:', error)
      throw error
    }
  }

  const register = async (registerData: RegisterData) => {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      type, 
      age, 
      position, 
      team, 
      level, 
      dominantFoot, 
      organization 
    } = registerData
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      
      // Create user document in Firestore
      const userData = {
        type,
        firstName,
        lastName,
        age: parseInt(age.toString()) || 0,
        position: position || '',
        team: team || '',
        level: level || 'beginner',
        dominantFoot: dominantFoot || 'right',
        organization: organization || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), userData)
      
      console.log('✅ Registration successful:', firebaseUser.email)
      return userCredential
    } catch (error: any) {
      console.error('❌ Registration error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      console.log('✅ Logout successful')
      setUser(null)
      
      // Show success message and redirect to landing page
      showMessage('התנתקת בהצלחה! מקווים לראותך שוב בקרוב', 'success')
      router.push('/')
    } catch (error: any) {
      console.error('❌ Logout error:', error)
      showMessage('שגיאה בהתנתקות. אנא נסה שוב', 'error')
      throw error
    }
  }

  const updateProfile = async (profileData: Partial<UserData>) => {
    if (!user) {
      throw new Error('No user logged in')
    }

    try {
      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid)
      const updateData = {
        ...profileData,
        updatedAt: serverTimestamp()
      }
      
      await updateDoc(userDocRef, updateData)
      
      // Update local user state
      setUser(prevUser => ({
        ...prevUser!,
        ...profileData
      }))
      
      console.log('✅ Profile updated successfully')
    } catch (error: any) {
      console.error('❌ Profile update error:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}