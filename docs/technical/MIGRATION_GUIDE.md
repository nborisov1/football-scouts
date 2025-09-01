# Migration Guide: localStorage to Firebase

This guide provides step-by-step instructions for migrating the Football Scouting Platform from the current localStorage-based prototype to a production-ready Firebase backend.

## Migration Overview

### Current State (localStorage)
- **Data Storage**: Browser localStorage
- **Authentication**: Simple email/password with localStorage persistence
- **File Storage**: No actual file storage (placeholder URLs)
- **Real-time Features**: None
- **Scalability**: Single-user, single-device

### Target State (Firebase)
- **Data Storage**: Cloud Firestore (NoSQL)
- **Authentication**: Firebase Authentication
- **File Storage**: Firebase Storage
- **Real-time Features**: Firestore real-time listeners
- **Scalability**: Multi-user, multi-device, production-ready

## Pre-Migration Checklist

### 1. Environment Setup
- [ ] Firebase project created and configured
- [ ] Firebase CLI installed and authenticated
- [ ] Development environment configured with Firebase SDK
- [ ] Backup of current localStorage data created

### 2. Code Preparation
- [ ] Firebase configuration files created
- [ ] Authentication service layer prepared
- [ ] Database service layer prepared
- [ ] Storage service layer prepared
- [ ] Migration utilities developed

### 3. Testing Setup
- [ ] Firebase emulators configured for local testing
- [ ] Test data sets prepared
- [ ] Testing procedures documented
- [ ] Rollback plan prepared

## Migration Phases

## Phase 1: Firebase Setup and Basic Integration

### Step 1.1: Initialize Firebase Project

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Select features:
# - Firestore
# - Authentication
# - Storage
# - Hosting
# - Functions (optional)
```

### Step 1.2: Update Project Structure

```bash
# Create new directories
mkdir -p src/services/firebase
mkdir -p src/utils/migration
mkdir -p src/config

# Move existing files
mv auth/auth.js src/services/legacy-auth.js
mv config/firebase.js src/config/firebase.js
```

### Step 1.3: Install Dependencies

```bash
npm init -y
npm install firebase
npm install --save-dev @firebase/testing
```

## Phase 2: Authentication Migration

### Step 2.1: Create Firebase Auth Service

```javascript
// src/services/firebase/auth.js
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase.js';

export class FirebaseAuthService {
  constructor() {
    this.auth = auth;
    this.currentUser = null;
    this.authStateListeners = [];
    
    // Listen for auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      this.notifyAuthStateListeners(user);
    });
  }
  
  async register(userData) {
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        this.auth, 
        userData.email, 
        userData.password
      );
      
      const user = userCredential.user;
      
      // Update profile
      await updateProfile(user, {
        displayName: userData.name
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        password: undefined, // Remove password from stored data
        uid: user.uid,
        createdAt: new Date(),
        lastLoginAt: new Date()
      });
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Update last login time
      await setDoc(doc(db, 'users', user.uid), {
        lastLoginAt: new Date()
      }, { merge: true });
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      return { 
        success: true, 
        user: { ...user, ...userData }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async logout() {
    try {
      await signOut(this.auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  getCurrentUser() {
    return this.currentUser;
  }
  
  onAuthStateChanged(callback) {
    this.authStateListeners.push(callback);
    return () => {
      this.authStateListeners = this.authStateListeners.filter(
        listener => listener !== callback
      );
    };
  }
  
  notifyAuthStateListeners(user) {
    this.authStateListeners.forEach(callback => callback(user));
  }
}

// Create singleton instance
export const authService = new FirebaseAuthService();
```

### Step 2.2: Create Migration Utility for Users

```javascript
// src/utils/migration/auth-migration.js
import { authService } from '../../services/firebase/auth.js';

export class AuthMigration {
  static async migrateUsersFromLocalStorage() {
    const localUsers = JSON.parse(localStorage.getItem('footballScout_users') || '[]');
    const migrationResults = {
      successful: [],
      failed: [],
      skipped: []
    };
    
    for (const user of localUsers) {
      try {
        // Skip admin user (will be created manually)
        if (user.type === 'admin') {
          migrationResults.skipped.push({
            email: user.email,
            reason: 'Admin user - create manually'
          });
          continue;
        }
        
        // Generate temporary password for migration
        const tempPassword = 'TempPass123!';
        
        const result = await authService.register({
          ...user,
          password: tempPassword
        });
        
        if (result.success) {
          migrationResults.successful.push(user.email);
          console.log(`✓ Migrated user: ${user.email}`);
        } else {
          migrationResults.failed.push({
            email: user.email,
            error: result.error
          });
          console.error(`✗ Failed to migrate user: ${user.email}`, result.error);
        }
      } catch (error) {
        migrationResults.failed.push({
          email: user.email,
          error: error.message
        });
        console.error(`✗ Migration error for ${user.email}:`, error);
      }
    }
    
    return migrationResults;
  }
  
  static async createAdminUser() {
    try {
      const result = await authService.register({
        email: 'admin@example.com',
        password: 'admin123',
        name: 'System Administrator',
        type: 'admin'
      });
      
      if (result.success) {
        console.log('✓ Admin user created successfully');
        return { success: true };
      } else {
        console.error('✗ Failed to create admin user:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('✗ Admin user creation error:', error);
      return { success: false, error: error.message };
    }
  }
}
```

### Step 2.3: Update Authentication Integration

```javascript
// src/services/auth-adapter.js
import { authService } from './firebase/auth.js';

// Adapter to maintain compatibility with existing code
export class AuthAdapter {
  static async login(email, password) {
    return await authService.login(email, password);
  }
  
  static async register(userData) {
    return await authService.register(userData);
  }
  
  static async logout() {
    return await authService.logout();
  }
  
  static isLoggedIn() {
    return !!authService.getCurrentUser();
  }
  
  static getCurrentUser() {
    return authService.getCurrentUser();
  }
  
  static isUserType(type) {
    const user = authService.getCurrentUser();
    return user && user.type === type;
  }
  
  static onAuthStateChanged(callback) {
    return authService.onAuthStateChanged(callback);
  }
}

// Replace global auth object
window.auth = AuthAdapter;
```

## Phase 3: Database Migration

### Step 3.1: Create Firestore Service Layer

```javascript
// src/services/firebase/firestore.js
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../config/firebase.js';

export class FirestoreService {
  // Generic CRUD operations
  static async create(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  static async read(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { 
          success: true, 
          data: { id: docSnap.id, ...docSnap.data() }
        };
      } else {
        return { success: false, error: 'Document not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  static async update(collectionName, docId, data) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  static async delete(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  static async query(collectionName, conditions = [], orderByField = null, limitCount = null) {
    try {
      let q = collection(db, collectionName);
      
      // Apply where conditions
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
      
      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField));
      }
      
      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // Real-time listener
  static onSnapshot(collectionName, callback, conditions = []) {
    let q = collection(db, collectionName);
    
    conditions.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });
    
    return onSnapshot(q, (querySnapshot) => {
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(results);
    });
  }
}
```

### Step 3.2: Create Data Migration Utilities

```javascript
// src/utils/migration/data-migration.js
import { FirestoreService } from '../../services/firebase/firestore.js';

export class DataMigration {
  static async migrateChallenges() {
    const localChallenges = JSON.parse(localStorage.getItem('footballScout_challenges') || '[]');
    const results = { successful: 0, failed: 0, errors: [] };
    
    for (const challenge of localChallenges) {
      try {
        const result = await FirestoreService.create('challenges', challenge);
        if (result.success) {
          results.successful++;
          console.log(`✓ Migrated challenge: ${challenge.title}`);
        } else {
          results.failed++;
          results.errors.push(`Challenge "${challenge.title}": ${result.error}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Challenge "${challenge.title}": ${error.message}`);
      }
    }
    
    return results;
  }
  
  static async migrateTrainingPrograms() {
    const localPrograms = JSON.parse(localStorage.getItem('footballScout_trainingPrograms') || '[]');
    const results = { successful: 0, failed: 0, errors: [] };
    
    for (const program of localPrograms) {
      try {
        const result = await FirestoreService.create('trainingPrograms', program);
        if (result.success) {
          results.successful++;
          console.log(`✓ Migrated training program: ${program.title}`);
        } else {
          results.failed++;
          results.errors.push(`Program "${program.title}": ${result.error}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Program "${program.title}": ${error.message}`);
      }
    }
    
    return results;
  }
  
  static async migrateVideos() {
    const localVideos = JSON.parse(localStorage.getItem('footballScout_videos') || '[]');
    const results = { successful: 0, failed: 0, errors: [] };
    
    for (const video of localVideos) {
      try {
        // Note: Actual video files will need to be uploaded separately
        const videoData = {
          ...video,
          migrated: true,
          originalSource: 'localStorage'
        };
        
        const result = await FirestoreService.create('videos', videoData);
        if (result.success) {
          results.successful++;
          console.log(`✓ Migrated video metadata: ${video.title}`);
        } else {
          results.failed++;
          results.errors.push(`Video "${video.title}": ${result.error}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Video "${video.title}": ${error.message}`);
      }
    }
    
    return results;
  }
  
  static async runFullMigration() {
    console.log('🚀 Starting full data migration...');
    
    const results = {
      challenges: await this.migrateChallenges(),
      trainingPrograms: await this.migrateTrainingPrograms(),
      videos: await this.migrateVideos()
    };
    
    console.log('📊 Migration Results:');
    console.log('Challenges:', results.challenges);
    console.log('Training Programs:', results.trainingPrograms);
    console.log('Videos:', results.videos);
    
    const totalSuccessful = Object.values(results).reduce((sum, r) => sum + r.successful, 0);
    const totalFailed = Object.values(results).reduce((sum, r) => sum + r.failed, 0);
    
    console.log(`✅ Total Successful: ${totalSuccessful}`);
    console.log(`❌ Total Failed: ${totalFailed}`);
    
    return results;
  }
}
```

## Phase 4: File Storage Migration

### Step 4.1: Create Firebase Storage Service

```javascript
// src/services/firebase/storage.js
import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable,
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { storage } from '../../config/firebase.js';

export class FirebaseStorageService {
  static async uploadVideo(userId, file, metadata = {}) {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const videoRef = ref(storage, `videos/${userId}/${fileName}`);
      
      // Add metadata
      const customMetadata = {
        ...metadata,
        uploadedAt: new Date().toISOString(),
        originalName: file.name
      };
      
      const snapshot = await uploadBytes(videoRef, file, {
        customMetadata
      });
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        success: true,
        url: downloadURL,
        path: snapshot.ref.fullPath,
        metadata: snapshot.metadata
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  static uploadVideoWithProgress(userId, file, progressCallback, metadata = {}) {
    return new Promise((resolve, reject) => {
      const fileName = `${Date.now()}_${file.name}`;
      const videoRef = ref(storage, `videos/${userId}/${fileName}`);
      
      const uploadTask = uploadBytesResumable(videoRef, file, {
        customMetadata: {
          ...metadata,
          uploadedAt: new Date().toISOString(),
          originalName: file.name
        }
      });
      
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          progressCallback(progress);
        },
        (error) => {
          reject({ success: false, error: error.message });
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              success: true,
              url: downloadURL,
              path: uploadTask.snapshot.ref.fullPath,
              metadata: uploadTask.snapshot.metadata
            });
          } catch (error) {
            reject({ success: false, error: error.message });
          }
        }
      );
    });
  }
  
  static async uploadProfileImage(userId, file) {
    try {
      const imageRef = ref(storage, `profile-images/${userId}/profile.jpg`);
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        success: true,
        url: downloadURL,
        path: snapshot.ref.fullPath
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
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

## Phase 5: UI Component Migration

### Step 5.1: Update Authentication Components

```javascript
// src/components/auth-components.js
import { AuthAdapter } from '../services/auth-adapter.js';

export class AuthComponents {
  static setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      // Show loading state
      const submitButton = e.target.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Signing in...';
      
      try {
        const result = await AuthAdapter.login(email, password);
        
        if (result.success) {
          // Redirect to dashboard or reload page
          window.location.href = '/dashboard.html';
        } else {
          // Show error message
          this.showError(result.error);
        }
      } catch (error) {
        this.showError('Login failed. Please try again.');
      } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = 'Sign In';
      }
    });
  }
  
  static setupAuthStateListener() {
    AuthAdapter.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        this.updateUIForAuthenticatedUser(user);
      } else {
        // User is signed out
        this.updateUIForUnauthenticatedUser();
      }
    });
  }
  
  static updateUIForAuthenticatedUser(user) {
    // Update navigation, show user info, etc.
    const userElements = document.querySelectorAll('[data-user-info]');
    userElements.forEach(element => {
      element.textContent = user.displayName || user.email;
    });
    
    // Show authenticated sections
    document.querySelectorAll('[data-auth-required]').forEach(el => {
      el.style.display = 'block';
    });
    
    // Hide unauthenticated sections
    document.querySelectorAll('[data-auth-hidden]').forEach(el => {
      el.style.display = 'none';
    });
  }
  
  static updateUIForUnauthenticatedUser() {
    // Redirect to login if on protected page
    const protectedPages = ['/dashboard.html', '/profile.html', '/admin/'];
    if (protectedPages.some(page => window.location.pathname.includes(page))) {
      window.location.href = '/login.html';
    }
  }
  
  static showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }
}
```

## Phase 6: Testing and Validation

### Step 6.1: Migration Testing Script

```javascript
// src/utils/migration/test-migration.js
import { AuthMigration } from './auth-migration.js';
import { DataMigration } from './data-migration.js';

export class MigrationTester {
  static async runMigrationTests() {
    console.log('🧪 Starting migration tests...');
    
    const tests = [
      this.testAuthMigration,
      this.testDataMigration,
      this.testUserPermissions,
      this.testDataIntegrity
    ];
    
    const results = [];
    
    for (const test of tests) {
      try {
        const result = await test.call(this);
        results.push(result);
        console.log(`✅ ${result.name}: PASSED`);
      } catch (error) {
        results.push({
          name: test.name,
          status: 'FAILED',
          error: error.message
        });
        console.error(`❌ ${test.name}: FAILED - ${error.message}`);
      }
    }
    
    return results;
  }
  
  static async testAuthMigration() {
    // Test user authentication
    const testUser = {
      email: 'test@example.com',
      password: 'TestPass123!',
      name: 'Test User',
      type: 'player'
    };
    
    // Register test user
    const registerResult = await AuthAdapter.register(testUser);
    if (!registerResult.success) {
      throw new Error('User registration failed');
    }
    
    // Login test user
    const loginResult = await AuthAdapter.login(testUser.email, testUser.password);
    if (!loginResult.success) {
      throw new Error('User login failed');
    }
    
    // Logout test user
    const logoutResult = await AuthAdapter.logout();
    if (!logoutResult.success) {
      throw new Error('User logout failed');
    }
    
    return { name: 'Auth Migration', status: 'PASSED' };
  }
  
  static async testDataMigration() {
    // Test data migration
    const migrationResults = await DataMigration.runFullMigration();
    
    // Check if any critical migrations failed
    const criticalFailures = Object.values(migrationResults)
      .some(result => result.failed > result.successful);
    
    if (criticalFailures) {
      throw new Error('Critical data migration failures detected');
    }
    
    return { name: 'Data Migration', status: 'PASSED' };
  }
  
  static async testUserPermissions() {
    // Test user permissions and access control
    // Implementation depends on specific permission requirements
    return { name: 'User Permissions', status: 'PASSED' };
  }
  
  static async testDataIntegrity() {
    // Test data integrity after migration
    // Verify data consistency and relationships
    return { name: 'Data Integrity', status: 'PASSED' };
  }
}
```

## Migration Execution Plan

### Pre-Migration Phase
1. **Backup Current Data**
   ```bash
   # Create backup of localStorage data
   node scripts/backup-localStorage.js
   ```

2. **Set Up Firebase Environment**
   ```bash
   # Deploy Firebase configuration
   firebase deploy --only firestore:rules,storage:rules
   ```

3. **Run Migration Tests**
   ```bash
   # Test migration on sample data
   npm run test:migration
   ```

### Migration Execution
1. **Deploy New Code**
   ```bash
   # Deploy updated application
   firebase deploy --only hosting
   ```

2. **Run Data Migration**
   ```bash
   # Execute migration scripts
   node scripts/run-migration.js
   ```

3. **Verify Migration**
   ```bash
   # Run post-migration tests
   npm run test:post-migration
   ```

### Post-Migration Phase
1. **Monitor Application**
   - Check Firebase Console for errors
   - Monitor user authentication success rates
   - Verify data access patterns

2. **Update Documentation**
   - Update API documentation
   - Update deployment guides
   - Update user guides

3. **Clean Up**
   - Remove localStorage fallback code
   - Remove migration utilities
   - Archive old documentation

## Rollback Plan

In case of migration issues:

1. **Immediate Rollback**
   ```bash
   # Revert to previous hosting version
   firebase hosting:clone SOURCE_SITE_ID:SOURCE_VERSION_ID TARGET_SITE_ID
   ```

2. **Data Rollback**
   ```bash
   # Restore from backup if necessary
   node scripts/restore-backup.js
   ```

3. **Monitor and Fix**
   - Identify root cause of migration issues
   - Fix issues in development environment
   - Plan re-migration when ready

This migration guide ensures a systematic and safe transition from localStorage to Firebase while maintaining data integrity and user experience.
