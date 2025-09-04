'use client'

/**
 * Authentication Context for Football Scouting Platform
 * Provides authentication state and methods across the React app
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore'
import { auth, db, USER_TYPES, COLLECTIONS, UserType } from '@/lib/firebase'
import { UserData, AuthContextType, RegisterData } from '@/types/user'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔄 Setting up Firebase auth listener...')
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('✅ Firebase user found:', firebaseUser.email)
        await loadUserData(firebaseUser.uid)
      } else {
        console.log('❌ No Firebase user found')
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const loadUserData = async (uid: string) => {
    try {
      console.log('🔄 Loading user data for:', uid)
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid))
      
      if (userDoc.exists()) {
        const userData = { uid, ...userDoc.data() } as UserData
        console.log('✅ User data loaded:', userData.email, userData.type)
        setUser(userData)
      } else {
        console.warn('⚠️ User document not found in Firestore for uid:', uid)
        // Create basic user document if missing
        const firebaseUser = auth.currentUser
        if (firebaseUser) {
          await createMissingUserDocument(uid, firebaseUser)
        }
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error)
      setUser(null)
    }
  }

  const createMissingUserDocument = async (uid: string, firebaseUser: FirebaseUser) => {
    try {
      const basicUserData: Partial<UserData> = {
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'משתמש',
        email: firebaseUser.email || '',
        type: USER_TYPES.PLAYER, // Default to player
        createdAt: new Date(),
        updatedAt: new Date(),
        age: 18,
        position: '',
        dominantFoot: 'right',
        level: 'beginner',
        points: 0,
        weeklyTrainings: 0,
        completedChallenges: 0,
        weeklyProgress: 0
      }

      await setDoc(doc(db, COLLECTIONS.USERS, uid), {
        ...basicUserData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      console.log('✅ Created missing user document for:', firebaseUser.email)
      const userData = { uid, ...basicUserData } as UserData
      setUser(userData)
    } catch (error) {
      console.error('❌ Error creating user document:', error)
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      console.log('🔄 Logging in user:', email)
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log('✅ Firebase login successful')
      
      // User data will be loaded by the auth state listener
      return userCredential
    } catch (error: any) {
      console.error('❌ Login error:', error)
      
      // Provide more specific error messages
      if (error.code === 'auth/invalid-credential') {
        throw new Error('אימייל או סיסמה שגויים. אנא בדוק את הפרטים ונסה שוב.')
      } else if (error.code === 'auth/user-not-found') {
        throw new Error('משתמש לא נמצא. אנא הירשם תחילה.')
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('יותר מדי ניסיונות התחברות. נסה שוב מאוחר יותר.')
      }
      
      throw new Error(getAuthErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData, userType: UserType) => {
    try {
      setLoading(true)
      console.log('🔄 Registering user:', userData.email, 'as', userType)
      
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      )

      const uid = userCredential.user.uid

      // Create complete user profile in Firestore
      const completeUserData: Partial<UserData> = {
        name: userData.name,
        email: userData.email,
        type: userType,
        createdAt: new Date(),
        updatedAt: new Date(),
        points: 0,
        weeklyTrainings: 0,
        completedChallenges: 0,
        weeklyProgress: 0
      }

      // Add type-specific fields
      if (userType === USER_TYPES.PLAYER) {
        completeUserData.age = userData.age || 18
        completeUserData.position = userData.position || ''
        completeUserData.dominantFoot = userData.dominantFoot as 'right' | 'left' | 'both' || 'right'
        completeUserData.level = userData.level as any || 'beginner'
      } else if (userType === USER_TYPES.SCOUT) {
        completeUserData.organization = userData.organization || ''
        completeUserData.certifications = []
        completeUserData.regionsOfInterest = []
      }

      await setDoc(doc(db, COLLECTIONS.USERS, uid), {
        ...completeUserData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      console.log('✅ User registration completed successfully')
      
      // User data will be loaded by the auth state listener
      return userCredential
    } catch (error: any) {
      console.error('❌ Registration error:', error)
      throw new Error(getAuthErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      console.log('🔄 Logging out user...')
      await firebaseSignOut(auth)
      setUser(null)
      console.log('✅ Logout successful')
      
      // Redirect to home page after logout
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    } catch (error: any) {
      console.error('❌ Logout error:', error)
      throw error
    }
  }

  const updateProfile = async (updates: Partial<UserData>) => {
    try {
      if (!user) throw new Error('No authenticated user')

      console.log('🔄 Updating user profile...')
      
      await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
        ...updates,
        updatedAt: serverTimestamp()
      })

      // Update local state
      setUser(prev => prev ? { ...prev, ...updates } : null)
      console.log('✅ Profile updated successfully')
    } catch (error: any) {
      console.error('❌ Profile update error:', error)
      throw error
    }
  }

  // Initialize admin account if it doesn't exist (for testing)
  const initializeAdmin = async () => {
    try {
      // Check if admin already exists
      const adminEmail = 'admin@example.com'
      const adminPassword = 'admin123'
      
      // Try to create admin account
      const adminData = {
        email: adminEmail,
        password: adminPassword,
        name: 'מנהל מערכת',
        type: USER_TYPES.ADMIN as UserType
      }
      
      await register(adminData, USER_TYPES.ADMIN)
      console.log('✅ Admin account created successfully')
    } catch (error: any) {
      // Admin probably already exists, this is fine
      if (error.message.includes('email-already-in-use')) {
        console.log('ℹ️ Admin account already exists')
      } else {
        console.log('⚠️ Could not create admin account:', error.message)
      }
    }
  }

  // Initialize admin on first load (only in development)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      initializeAdmin()
    }
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    initializeAdmin
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

// Helper function to get user-friendly error messages
function getAuthErrorMessage(error: any): string {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'משתמש לא נמצא'
    case 'auth/wrong-password':
      return 'סיסמה שגויה'
    case 'auth/email-already-in-use':
      return 'כתובת האימייל כבר בשימוש'
    case 'auth/weak-password':
      return 'הסיסמה חלשה מדי'
    case 'auth/invalid-email':
      return 'כתובת אימייל לא תקינה'
    case 'auth/too-many-requests':
      return 'יותר מדי ניסיונות. נסה שוב מאוחר יותר'
    case 'auth/network-request-failed':
      return 'בעיית רשת. בדוק את החיבור לאינטרנט'
    default:
      return error.message || 'אירעה שגיאה. אנא נסה שוב.'
  }
}
