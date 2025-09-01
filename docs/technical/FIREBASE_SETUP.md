# Firebase Setup Guide

This guide provides detailed instructions for setting up Firebase for the Football Scouting Platform, transitioning from the current localStorage-based prototype to a production-ready Firebase backend.

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- Firebase account (free tier available)
- Basic knowledge of JavaScript and web development

## Firebase Project Setup

### 1. Create Firebase Project

1. **Go to Firebase Console**: Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)

2. **Create New Project**:
   - Click "Create a project"
   - Enter project name: `football-scouting-platform`
   - Enable Google Analytics (recommended)
   - Choose or create Google Analytics account
   - Click "Create project"

3. **Add Web App**:
   - Click the web icon (`</>`) to add a web app
   - Register app name: `Football Scouting Web App`
   - Check "Also set up Firebase Hosting"
   - Click "Register app"

### 2. Install Firebase CLI

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify installation
firebase --version
```

### 3. Initialize Firebase in Project

```bash
# Navigate to project directory
cd football-scouting-platform

# Initialize Firebase
firebase init

# Select services to set up:
# [x] Firestore: Configure security rules and indexes for Firestore
# [x] Storage: Configure security rules for Cloud Storage
# [x] Hosting: Configure files for Firebase Hosting
# [x] Functions: Configure a Cloud Functions directory

# Follow the prompts:
# - Use existing project: football-scouting-platform
# - Firestore rules file: firestore.rules
# - Firestore indexes file: firestore.indexes.json
# - Functions language: JavaScript
# - Use ESLint: Yes
# - Install dependencies: Yes
# - Public directory: public (or current directory)
# - Single-page app: Yes
# - Automatic builds and deploys with GitHub: No (for now)
```

## Firebase Configuration

### 1. Get Firebase Config

1. **Navigate to Project Settings**:
   - In Firebase Console, click the gear icon ⚙️ → Project settings
   - Scroll down to "Your apps" section
   - Click on your web app
   - Copy the Firebase configuration object

2. **Update Config File**:
   ```javascript
   // config/firebase.js
   import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';
   import { getFirestore } from 'firebase/firestore';
   import { getStorage } from 'firebase/storage';
   import { getFunctions } from 'firebase/functions';

   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id",
     measurementId: "your-measurement-id"
   };

   // Initialize Firebase
   const app = initializeApp(firebaseConfig);

   // Initialize Firebase services
   export const auth = getAuth(app);
   export const db = getFirestore(app);
   export const storage = getStorage(app);
   export const functions = getFunctions(app);

   export default app;
   ```

## Firebase Authentication Setup

### 1. Enable Authentication Methods

1. **Navigate to Authentication**:
   - In Firebase Console → Authentication → Sign-in method

2. **Enable Email/Password**:
   - Click on "Email/Password"
   - Enable both toggles
   - Save

3. **Optional: Enable Additional Providers**:
   - Google Sign-In
   - Facebook
   - Twitter
   - GitHub

### 2. Authentication Implementation

```javascript
// auth/firebase-auth.js
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase.js';

export class FirebaseAuth {
  
  // Register new user
  static async register(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update display name
      await updateProfile(user, {
        displayName: userData.name
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: userData.name,
        email: userData.email,
        type: userData.type, // 'player', 'scout', 'admin'
        createdAt: new Date(),
        ...userData
      });
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // Login user
  static async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      return { success: true, user: { ...user, ...userData } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // Logout user
  static async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // Reset password
  static async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
```

## Firestore Database Setup

### 1. Database Structure Design

```javascript
// Database Schema Documentation

// Users Collection
users: {
  [userId]: {
    name: string,
    email: string,
    type: 'player' | 'scout' | 'admin',
    createdAt: timestamp,
    
    // Player-specific fields
    age?: number,
    position?: string,
    dominantFoot?: 'left' | 'right',
    level?: 'beginner' | 'intermediate' | 'advanced',
    assessment?: {
      technical: object,
      physical: object,
      mental: object
    },
    stats?: {
      points: number,
      consistency: number,
      improvement: number,
      ranking: number
    },
    
    // Scout-specific fields
    club?: string,
    experience?: string,
    watchlist?: array,
    
    // Common fields
    profileImage?: string,
    bio?: string,
    isActive: boolean
  }
}

// Training Programs Collection
trainingPrograms: {
  [programId]: {
    title: string,
    description: string,
    level: 'beginner' | 'intermediate' | 'advanced',
    exercises: array,
    createdAt: timestamp,
    updatedAt: timestamp
  }
}

// Challenges Collection
challenges: {
  [challengeId]: {
    title: string,
    description: string,
    level: 'beginner' | 'intermediate' | 'advanced',
    type: string,
    points: number,
    isActive: boolean,
    createdAt: timestamp
  }
}

// Videos Collection
videos: {
  [videoId]: {
    userId: string,
    challengeId?: string,
    title: string,
    description: string,
    url: string,
    status: 'pending' | 'approved' | 'rejected',
    feedback?: string,
    uploadedAt: timestamp,
    reviewedAt?: timestamp,
    reviewedBy?: string
  }
}

// Messages Collection
messages: {
  [messageId]: {
    senderId: string,
    receiverId: string,
    content: string,
    isRead: boolean,
    createdAt: timestamp
  }
}
```

### 2. Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Scouts can read basic player info
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.type == 'scout';
      // Admins can read/write all user data
      allow read, write: if request.auth != null && 
                            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.type == 'admin';
    }
    
    // Training programs - read for all authenticated users, write for admins
    match /trainingPrograms/{programId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.type == 'admin';
    }
    
    // Challenges - read for all authenticated users, write for admins
    match /challenges/{challengeId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.type == 'admin';
    }
    
    // Videos - users can read/write their own, admins can read/write all
    match /videos/{videoId} {
      allow read, write: if request.auth != null && 
                            (resource.data.userId == request.auth.uid || 
                             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.type == 'admin');
    }
    
    // Messages - participants can read/write
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
                            (resource.data.senderId == request.auth.uid || 
                             resource.data.receiverId == request.auth.uid);
    }
  }
}
```

## Firebase Storage Setup

### 1. Storage Security Rules

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Videos - users can upload their own, all authenticated users can read
    match /videos/{userId}/{videoId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Profile images - users can upload their own, all authenticated users can read
    match /profile-images/{userId}/{imageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Training content - read for all authenticated users, write for admins
    match /training-content/{contentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.type == 'admin';
    }
  }
}
```

### 2. Storage Implementation

```javascript
// storage/firebase-storage.js
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase.js';

export class FirebaseStorage {
  
  // Upload video file
  static async uploadVideo(userId, file, videoId) {
    try {
      const videoRef = ref(storage, `videos/${userId}/${videoId}`);
      const snapshot = await uploadBytes(videoRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { success: true, url: downloadURL };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // Upload profile image
  static async uploadProfileImage(userId, file) {
    try {
      const imageRef = ref(storage, `profile-images/${userId}/profile.jpg`);
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return { success: true, url: downloadURL };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // Delete file
  static async deleteFile(filePath) {
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
```

## Cloud Functions Setup

### 1. Initialize Functions

```bash
# Navigate to functions directory
cd functions

# Install additional dependencies
npm install --save firebase-functions@latest firebase-admin@latest
```

### 2. Example Cloud Functions

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Trigger when a new video is uploaded
exports.processVideoUpload = functions.firestore
  .document('videos/{videoId}')
  .onCreate(async (snap, context) => {
    const videoData = snap.data();
    
    // Send notification to admins for review
    const admins = await admin.firestore()
      .collection('users')
      .where('type', '==', 'admin')
      .get();
    
    const notifications = admins.docs.map(doc => {
      return admin.firestore()
        .collection('notifications')
        .add({
          userId: doc.id,
          type: 'video_review',
          videoId: context.params.videoId,
          message: `New video uploaded by ${videoData.userId} requires review`,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          isRead: false
        });
    });
    
    await Promise.all(notifications);
  });

// Calculate player rankings
exports.updateRankings = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const users = await admin.firestore()
      .collection('users')
      .where('type', '==', 'player')
      .get();
    
    // Sort players by points and update rankings
    const players = users.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (b.stats?.points || 0) - (a.stats?.points || 0));
    
    const updates = players.map((player, index) => {
      return admin.firestore()
        .collection('users')
        .doc(player.id)
        .update({
          'stats.ranking': index + 1
        });
    });
    
    await Promise.all(updates);
  });
```

## Deployment

### 1. Deploy to Firebase

```bash
# Build the project (if you have a build process)
npm run build

# Deploy everything
firebase deploy

# Or deploy specific services
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only functions
firebase deploy --only hosting
```

### 2. Environment Configuration

```bash
# Set environment variables for functions
firebase functions:config:set api.key="your-api-key"
firebase functions:config:set smtp.user="your-email@gmail.com"
firebase functions:config:set smtp.password="your-app-password"

# Deploy functions with new config
firebase deploy --only functions
```

## Testing and Monitoring

### 1. Local Testing

```bash
# Start Firebase emulators
firebase emulators:start

# This will start:
# - Authentication Emulator
# - Firestore Emulator
# - Functions Emulator
# - Storage Emulator
# - Hosting Emulator
```

### 2. Production Monitoring

1. **Firebase Console**: Monitor usage, performance, and errors
2. **Cloud Logging**: View detailed logs for Cloud Functions
3. **Performance Monitoring**: Track app performance metrics
4. **Crashlytics**: Monitor app crashes and errors

## Migration from localStorage

### 1. Data Migration Script

```javascript
// migration/localStorage-to-firebase.js
import { FirebaseAuth } from '../auth/firebase-auth.js';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';

export class DataMigration {
  
  static async migrateUsers() {
    const localUsers = JSON.parse(localStorage.getItem('footballScout_users') || '[]');
    
    for (const user of localUsers) {
      if (user.type !== 'admin') { // Skip admin as it will be created manually
        try {
          await FirebaseAuth.register(user.email, 'temporaryPassword', user);
          console.log(`Migrated user: ${user.email}`);
        } catch (error) {
          console.error(`Failed to migrate user ${user.email}:`, error);
        }
      }
    }
  }
  
  static async migrateChallenges() {
    const localChallenges = JSON.parse(localStorage.getItem('footballScout_challenges') || '[]');
    
    for (const challenge of localChallenges) {
      try {
        await addDoc(collection(db, 'challenges'), challenge);
        console.log(`Migrated challenge: ${challenge.title}`);
      } catch (error) {
        console.error(`Failed to migrate challenge:`, error);
      }
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check Firestore security rules
2. **Authentication Errors**: Verify Firebase config and API keys
3. **CORS Issues**: Ensure proper domain configuration in Firebase Console
4. **Function Timeout**: Increase timeout settings for Cloud Functions
5. **Storage Upload Fails**: Check file size limits and storage rules

### Debug Tips

- Use Firebase Emulator Suite for local development
- Enable debug logging in development
- Monitor Firebase Console for real-time errors
- Use browser dev tools to inspect network requests

## Next Steps

1. **Complete Authentication Migration**: Replace localStorage auth with Firebase Auth
2. **Implement Data Layer**: Create service classes for Firestore operations
3. **Set Up Cloud Functions**: Implement serverless logic for complex operations
4. **Configure Analytics**: Set up Firebase Analytics for user tracking
5. **Implement Real-time Features**: Use Firestore real-time listeners
6. **Set Up CI/CD**: Automate deployment with GitHub Actions

---

This guide provides the foundation for migrating from the current localStorage prototype to a production-ready Firebase backend. Follow the development roadmap for a structured implementation approach.
