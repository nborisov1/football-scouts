/**
 * Firebase Configuration for Football Scouting Platform React App
 * Modern Firebase v9+ setup with TypeScript
 */

import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

// Firebase configuration - same as original app
const firebaseConfig = {
  apiKey: "AIzaSyCajKv0i81Fjw_Vv_DDQs1co3GDcsjVeyU",
  authDomain: "football-5e360.firebaseapp.com",
  projectId: "football-5e360",
  storageBucket: "football-5e360.appspot.com",
  messagingSenderId: "1035428109661",
  appId: "1:1035428109661:web:b41e0e45728f762bfb1cb4",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Set auth language to Hebrew
auth.languageCode = 'he'

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
  SCOUT_REPORTS: 'scout_reports'
} as const

export type UserType = typeof USER_TYPES[keyof typeof USER_TYPES]

console.log('✅ Firebase v9+ initialized successfully')
