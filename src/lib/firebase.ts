/**
 * Firebase Configuration for Football Scouting Platform React App
 * Modern Firebase v9+ setup with TypeScript
 * Proper client-side only initialization
 */

import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase configuration - same as original app
const firebaseConfig = {
  apiKey: "AIzaSyCajKv0i81Fjw_Vv_DDQs1co3GDcsjVeyU",
  authDomain: "football-5e360.firebaseapp.com",
  projectId: "football-5e360",
  storageBucket: "football-5e360.firebasestorage.app",
  messagingSenderId: "1035428109661",
  appId: "1:1035428109661:web:b41e0e45728f762bfb1cb4",
}

// Initialize Firebase only once and only on client
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase services
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app, `gs://${firebaseConfig.storageBucket}`)

// Debug logging in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  console.log('🔥 Firebase initialized with storage bucket:', firebaseConfig.storageBucket)
  console.log('🔥 Storage instance bucket:', storage._delegate?._host || 'unknown')
}

// Set auth language to Hebrew
if (typeof window !== 'undefined' && auth) {
  auth.languageCode = 'he'
}

export { auth, db, storage }

// Constants from original app
export const USER_TYPES = {
  PLAYER: 'player',
  SCOUT: 'scout',
  ADMIN: 'admin'
} as const

export const COLLECTIONS = {
  USERS: 'users',
  TRAINING: 'training',
  CHALLENGES: 'challenges',
  LEADERBOARDS: 'leaderboards',
  SCOUT_REPORTS: 'scout_reports',
  VIDEOS: 'videos',
  ANALYTICS: 'analytics'
} as const

export type UserType = typeof USER_TYPES[keyof typeof USER_TYPES]
