# Authentication & Database Guide - Football Scouting Platform

**Hebrew**: מדריך מערכת האימות ובסיס הנתונים - פוטבול סקאוטינג

This document details the authentication system and database structure of the React-based Football Scouting platform, including admin panel access.

## 🔐 Authentication System Overview

### Technology Stack
- **Firebase Auth v9+** - Modern modular Firebase authentication
- **React Context API** - Application-wide authentication state
- **TypeScript** - Type-safe user data management
- **Next.js App Router** - Protected routes and middleware

### User Types
The system supports three user types with different permissions:

1. **שחקן (PLAYER)** - Players
   - Create and manage profile
   - Complete challenges and upload videos
   - Follow training programs
   - Appear in leaderboards
   - Track personal progress

2. **סקאוט (SCOUT)** - Scouts
   - Search and discover players
   - View detailed player profiles
   - Create and manage watchlists
   - Contact players through messaging
   - Generate scouting reports

3. **מנהל (ADMIN)** - Administrators
   - Full user management capabilities
   - Video approval/rejection system
   - Platform analytics and reports
   - Training program management
   - System configuration

## 🏗️ React Authentication Architecture

### AuthContext Implementation
```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: UserData | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData, userType: UserType) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<UserData>) => Promise<void>
  initializeAdmin: () => Promise<void>
}
```

### User Data Structure
```typescript
// src/types/user.ts
interface UserData {
  uid: string
  name: string
  email: string
  type: 'player' | 'scout' | 'admin'
  createdAt?: Date
  updatedAt?: Date
  
  // Player-specific fields
  age?: number
  position?: string
  dominantFoot?: 'right' | 'left' | 'both'
  level?: 'beginner' | 'intermediate' | 'advanced' | 'professional'
  
  // Scout-specific fields
  organization?: string
  certifications?: string[]
  regionsOfInterest?: string[]
  
  // Progress tracking
  points?: number
  weeklyTrainings?: number
  completedChallenges?: number
  weeklyProgress?: number
}
```

### Firebase Configuration
```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

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
```

## 🗄️ Database Structure (Firestore)

### Collections Overview

#### Users Collection (`/users/{userId}`)
```javascript
{
  uid: "string",
  email: "user@example.com",
  name: "שם המשתמש",
  type: "player" | "scout" | "admin",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  
  // Player-specific
  age: 20,
  position: "midfielder",
  dominantFoot: "right",
  level: "intermediate",
  
  // Scout-specific
  organization: "Real Madrid",
  certifications: ["UEFA A", "FIFA Scout"],
  regionsOfInterest: ["Europe", "South America"],
  
  // Progress tracking
  points: 1250,
  weeklyTrainings: 4,
  completedChallenges: 12,
  weeklyProgress: 15
}
```

#### Training Collection (`/training/{programId}`)
```javascript
{
  id: "program-001",
  title: "כושר בסיסי",
  description: "תוכנית כושר למתחילים",
  difficulty: "beginner",
  duration: 30,
  exercises: [
    {
      name: "ריצה",
      duration: 10,
      instructions: "ריצה קלה"
    }
  ],
  createdBy: "admin-uid",
  createdAt: Timestamp
}
```

#### Challenges Collection (`/challenges/{challengeId}`)
```javascript
{
  id: "challenge-001",
  title: "אתגר ז'אגלינג",
  description: "שמור על הכדור באוויר 10 פעמים",
  difficulty: "easy",
  points: 50,
  category: "technical",
  requirements: {
    minReps: 10,
    timeLimit: 60
  },
  submissions: [
    {
      userId: "player-uid",
      videoUrl: "storage-url",
      status: "pending" | "approved" | "rejected",
      submittedAt: Timestamp
    }
  ]
}
```

## 👑 Admin Panel Access

### Default Admin Account
The system includes a pre-configured admin account:

- **Email**: `admin@example.com`
- **Password**: `admin123`

### Admin Account Creation
```typescript
// Automatically created in development mode
const initializeAdmin = async () => {
  const adminData = {
    email: 'admin@example.com',
    password: 'admin123',
    name: 'מנהל מערכת',
    type: USER_TYPES.ADMIN
  }
  
  await register(adminData, USER_TYPES.ADMIN)
}
```

### Accessing Admin Features

#### 1. Login as Admin
1. Navigate to the homepage
2. Click "התחברות" (Login)
3. Enter admin credentials
4. Click "התחבר" (Login)

#### 2. Admin Navigation
Once logged in as admin, additional menu items appear:
- **פאנל ניהול** (Admin Dashboard) - `/admin`
- **ניהול סרטונים** (Video Management) - `/admin/videos`

#### 3. Direct Access
- Admin Dashboard: `http://localhost:3000/admin`
- Video Management: `http://localhost:3000/admin/videos`

### Admin Dashboard Features

#### Statistics Overview
- Total users count (players + scouts + admins)
- New user registrations
- Pending video approvals
- Platform activity metrics

#### Quick Actions
- User management (coming soon)
- Video moderation
- Training program management
- System reports

#### Recent Activity Feed
- New user registrations
- Video uploads
- Challenge completions
- System events

### Video Management System

#### Video Approval Workflow
1. **Upload**: Players upload challenge videos
2. **Queue**: Videos appear in admin approval queue
3. **Review**: Admins can preview videos with player details
4. **Decision**: Approve or reject with optional feedback
5. **Notification**: Players receive approval/rejection status

#### Filter Options
- **All Videos**: Complete video library
- **Pending**: Videos awaiting approval
- **Approved**: Successfully approved videos
- **Rejected**: Videos that were rejected

## 🔒 Security Implementation

### Route Protection
```typescript
// Admin pages check user type
if (!user || user.type !== USER_TYPES.ADMIN) {
  return <AccessDenied />
}
```

### Firebase Security Rules
```javascript
// Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // Admins have full access
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.type == 'admin';
    }
    
    // Public read access for leaderboards
    match /leaderboards/{document} {
      allow read: if true;
    }
  }
}
```

### Authentication State Management
```typescript
// Real-time auth state listener
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Load user data from Firestore
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid))
      setUser(userDoc.data() as UserData)
    } else {
      setUser(null)
    }
    setLoading(false)
  })
  
  return unsubscribe
}, [])
```

## 🚀 Development Setup

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Firebase Project Setup
1. Create Firebase project
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Configure security rules
5. Enable Storage for video uploads

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access application
http://localhost:3000

# Admin account is created automatically
```

## 🧪 Testing Authentication

### Unit Tests
```typescript
// tests/unit/auth-manager.test.js
describe('Authentication System', () => {
  test('should create admin user correctly', async () => {
    await authManager.initializeAdmin()
    const adminSignIn = await authManager.signIn('admin@example.com', 'admin123')
    
    expect(adminSignIn.success).toBe(true)
    expect(adminSignIn.user.type).toBe('admin')
  })
})
```

### Integration Tests
```typescript
// tests/integration/auth-flow.test.js
describe('Admin Panel Access', () => {
  test('should allow admin login and access', async () => {
    const result = await authManager.signIn('admin@example.com', 'admin123')
    
    expect(result.user.type).toBe('admin')
    expect(authManager.isUserType('admin')).toBe(true)
  })
})
```

## 🆘 Troubleshooting

### Common Issues

#### Admin Account Not Working
1. Check Firebase console for user existence
2. Verify user document in Firestore has `type: 'admin'`
3. Clear browser cache and localStorage
4. Check console for authentication errors

#### Permission Denied Errors
1. Verify Firebase security rules are deployed
2. Check user authentication status
3. Confirm user type in Firestore document
4. Review browser network tab for failed requests

#### Development Environment Issues
```bash
# Reset admin account
# In browser console:
localStorage.clear()

# Restart development server
npm run dev
```

### Debug Commands
```typescript
// In browser console
console.log('Current user:', auth.currentUser)
console.log('User type:', user?.type)
console.log('Is admin:', user?.type === 'admin')
```

## 📞 Support

For authentication and database issues:
1. Check browser console for error messages
2. Verify Firebase project configuration
3. Review Firestore security rules
4. Test with different user accounts
5. Check network connectivity

---

**Authentication system is production-ready with full admin capabilities! 🔐**