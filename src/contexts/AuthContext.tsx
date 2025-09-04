'use client'

/**
 * Authentication Context for Football Scouting Platform
 * Provides authentication state and methods across the React app
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { UserData, AuthContextType, RegisterData, UserType } from '@/types/user'

// Dynamic imports for Firebase to avoid server-side execution
let firebaseAuth: any = null
let firebaseDb: any = null
let firebaseImports: any = null
let firestoreImports: any = null
let USER_TYPES: any = null
let COLLECTIONS: any = null

const initializeFirebase = async () => {
  if (typeof window === 'undefined') return false
  
  try {
    const [authModule, firestoreModule, configModule] = await Promise.all([
      import('firebase/auth'),
      import('firebase/firestore'), 
      import('@/lib/firebase')
    ])
    
    firebaseImports = authModule
    firestoreImports = firestoreModule
    firebaseAuth = configModule.auth
    firebaseDb = configModule.db
    USER_TYPES = configModule.USER_TYPES
    COLLECTIONS = configModule.COLLECTIONS
    
    return true
  } catch (error) {
    console.error('Failed to initialize Firebase:', error)
    return false
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window === 'undefined') {
        setLoading(false)
        return
      }
      
      console.log('🔄 Setting up Firebase auth listener...')
      
      const firebaseReady = await initializeFirebase()
      if (!firebaseReady || !firebaseAuth || !firebaseImports) {
        console.log('❌ Firebase not available, proceeding without auth')
        setLoading(false)
        return
      }
      
      try {
        const unsubscribe = firebaseImports.onAuthStateChanged(firebaseAuth, async (firebaseUser: any) => {
          try {
            if (firebaseUser) {
              console.log('✅ Firebase user found:', firebaseUser.email)
              await loadUserData(firebaseUser.uid)
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

        return () => {
          if (unsubscribe) unsubscribe()
        }
      } catch (error) {
        console.error('❌ Error setting up auth listener:', error)
        setLoading(false)
      }
    }
    
    initAuth()
  }, [])

  const loadUserData = async (uid: string) => {
    try {
      if (!uid || typeof window === 'undefined' || !firebaseDb || !firestoreImports) return
      
      console.log('🔄 Loading user data for:', uid)
      const userDoc = await firestoreImports.getDoc(firestoreImports.doc(firebaseDb, COLLECTIONS.USERS, uid))
      
      if (userDoc.exists()) {
        const userData = { uid, ...userDoc.data() } as UserData
        console.log('✅ User data loaded:', userData.email, userData.type)
        setUser(userData)
      } else {
        console.warn('⚠️ User document not found in Firestore for uid:', uid)
        // Create basic user document if missing
        const firebaseUser = firebaseAuth?.currentUser
        if (firebaseUser) {
          await createMissingUserDocument(uid, firebaseUser)
        }
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error)
      setUser(null)
    }
  }

  const createMissingUserDocument = async (uid: string, firebaseUser: any) => {
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

      await firestoreImports.setDoc(firestoreImports.doc(firebaseDb, COLLECTIONS.USERS, uid), {
        ...basicUserData,
        createdAt: firestoreImports.serverTimestamp(),
        updatedAt: firestoreImports.serverTimestamp()
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
      if (!firebaseAuth || !firebaseImports) {
        throw new Error('שירות האימות אינו זמין כרגע')
      }
      
      setLoading(true)
      console.log('🔄 Logging in user:', email)
      
      const userCredential = await firebaseImports.signInWithEmailAndPassword(firebaseAuth, email, password)
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
      if (!firebaseAuth || !firebaseImports || !firebaseDb || !firestoreImports) {
        throw new Error('שירות האימות אינו זמין כרגע')
      }
      
      setLoading(true)
      console.log('🔄 Registering user:', userData.email, 'as', userType)
      
      // Create Firebase Auth account
      const userCredential = await firebaseImports.createUserWithEmailAndPassword(
        firebaseAuth, 
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

      await firestoreImports.setDoc(firestoreImports.doc(firebaseDb, COLLECTIONS.USERS, uid), {
        ...completeUserData,
        createdAt: firestoreImports.serverTimestamp(),
        updatedAt: firestoreImports.serverTimestamp()
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
      if (!firebaseAuth || !firebaseImports) {
        throw new Error('שירות האימות אינו זמין כרגע')
      }
      
      console.log('🔄 Logging out user...')
      await firebaseImports.signOut(firebaseAuth)
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
      if (!firebaseDb || !firestoreImports) throw new Error('שירות האימות אינו זמין כרגע')

      console.log('🔄 Updating user profile...')
      
      await firestoreImports.updateDoc(firestoreImports.doc(firebaseDb, COLLECTIONS.USERS, user.uid), {
        ...updates,
        updatedAt: firestoreImports.serverTimestamp()
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
      // Only run once per session
      if (typeof window !== 'undefined' && window.sessionStorage.getItem('admin-check-done')) {
        return
      }

      const adminEmail = 'admin@example.com'
      const adminPassword = 'admin123'
      
      // Check if admin document exists first
      if (!firebaseDb || !firestoreImports) {
        throw new Error('שירות האימות אינו זמין כרגע')
      }
      
      const adminDoc = await firestoreImports.getDoc(firestoreImports.doc(firebaseDb, COLLECTIONS.USERS, 'admin-uid'))
      if (adminDoc.exists()) {
        console.log('ℹ️ Admin account already exists')
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('admin-check-done', 'true')
        }
        return
      }
      
      // Try to create admin account only if it doesn't exist
      const adminData = {
        email: adminEmail,
        password: adminPassword,
        name: 'מנהל מערכת',
        type: USER_TYPES.ADMIN as UserType
      }
      
      await register(adminData, USER_TYPES.ADMIN)
      console.log('✅ Admin account created successfully')
      
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('admin-check-done', 'true')
      }
    } catch (error: any) {
      // Admin probably already exists, this is fine
      if (error.message.includes('email-already-in-use') || error.code === 'auth/email-already-in-use') {
        console.log('ℹ️ Admin account already exists')
      } else {
        console.log('⚠️ Could not create admin account:', error.message)
      }
      
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('admin-check-done', 'true')
      }
    }
  }

  // Initialize admin on first load (only in development and on manual request)
  // Removed automatic admin initialization to prevent conflicts
  // Admin can be created manually via the UI when needed

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    initializeAdmin
  }

  // Don't render children until auth is initialized on client side
  if (typeof window !== 'undefined' && loading) {
    return (
      <div className="min-h-screen bg-stadium-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-field-gradient rounded-full flex items-center justify-center mx-auto mb-4 animate-glow">
            <i className="fas fa-futbol text-white text-xl"></i>
          </div>
          <p className="text-stadium-600">טוען...</p>
        </div>
      </div>
    )
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
    // Return a safe default instead of throwing
    return {
      user: null,
      loading: true,
      login: async () => { throw new Error('AuthProvider not available') },
      register: async () => { throw new Error('AuthProvider not available') },
      logout: async () => { throw new Error('AuthProvider not available') },
      updateProfile: async () => { throw new Error('AuthProvider not available') },
      initializeAdmin: async () => { throw new Error('AuthProvider not available') }
    }
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
