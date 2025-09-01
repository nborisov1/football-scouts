/**
 * Football Scouting Website - Unified Authentication Manager
 * Consolidates all authentication functionality to eliminate duplication
 * Uses only Firebase Auth state and in-memory storage - no localStorage/sessionStorage
 */

'use strict';

import {
  USER_TYPES,
  COLLECTIONS,
  showMessage
} from './utils.js';

/**
 * Unified Authentication Manager
 * Handles all authentication-related functionality using Firebase
 */
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];
    this.initializeAuth();
  }

  /**
   * Initialize authentication system
   */
  initializeAuth() {
    // Set up Firebase auth state listener if available
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.loadUserDataFromFirebase(user.uid);
        } else {
          this.handleAuthStateChange(null);
        }
      });
    }
  }

  /**
   * Get user data immediately without waiting for Firebase
   */
  async getUserDataImmediate() {
    return new Promise((resolve, reject) => {
      // Check if we already have user data in memory
      if (this.currentUser) {
        resolve(this.currentUser);
        return;
      }

      // Wait for Firebase with timeout
      if (typeof firebase !== 'undefined' && firebase.auth) {
        const timeout = setTimeout(() => {
          reject(new Error('Authentication timeout'));
        }, 5000);

        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
          clearTimeout(timeout);
          unsubscribe();
          
          if (user) {
            this.loadUserDataFromFirebase(user.uid)
              .then(() => resolve(this.currentUser))
              .catch(reject);
          } else {
            reject(new Error('No authenticated user'));
          }
        });
      } else {
        reject(new Error('Firebase not available'));
      }
    });
  }

  /**
   * Load user data from Firebase
   */
  async loadUserDataFromFirebase(uid) {
    try {
      if (typeof firebase !== 'undefined' && firebase.firestore) {
        const db = firebase.firestore();
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
        
        if (userDoc.exists) {
          const userData = { uid, ...userDoc.data() };
          // Store only in memory - no local storage
          this.handleAuthStateChange(userData);
          return userData;
        } else {
          throw new Error('User document not found');
        }
      } else {
        throw new Error('Firebase Firestore not available');
      }
    } catch (error) {
      console.error('Error loading user data from Firebase:', error);
      throw error;
    }
  }

  /**
   * Handle authentication state changes
   */
  handleAuthStateChange(userData) {
    this.currentUser = userData;
    
    // Dispatch custom event
    const event = new CustomEvent('authStateChanged', { 
      detail: { user: userData } 
    });
    document.dispatchEvent(event);

    // Notify listeners
    this.authStateListeners.forEach(listener => {
      try {
        listener(userData);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }

  /**
   * Add auth state change listener
   */
  onAuthStateChanged(callback) {
    this.authStateListeners.push(callback);
    
    // Call immediately if we have current user
    if (this.currentUser) {
      callback(this.currentUser);
    }
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Register new user
   */
  async register(userData, userType) {
    try {
      if (!firebase.auth) {
        throw new Error('Firebase Auth not available');
      }

      // Create user in Firebase Auth
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(
        userData.email,
        userData.password
      );
      
      const uid = userCredential.user.uid;
      
      // Complete user profile
      await this.completeUserProfile(uid, userData, userType);
      
      return { success: true, uid };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(this.getAuthErrorMessage(error));
    }
  }

  /**
   * Complete user profile after registration
   */
  async completeUserProfile(uid, profileData, userType) {
    try {
      const db = firebase.firestore();
      
      // Create base user object
      const userData = {
        name: profileData.name,
        email: profileData.email,
        type: userType,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Add type-specific data
      if (userType === USER_TYPES.PLAYER) {
        userData.age = profileData.age;
        userData.position = profileData.position;
        userData.dominantFoot = profileData.dominantFoot;
        userData.level = profileData.level;
        userData.challenges = {
          initial: {
            completed: false,
            videos: []
          }
        };
        userData.trainingProgram = {
          currentStage: 0,
          completedStages: []
        };
      } else if (userType === USER_TYPES.SCOUT) {
        userData.club = profileData.club;
        userData.position = profileData.position;
        userData.watchlist = [];
      }

      // Save to Firestore
      await db.collection(COLLECTIONS.USERS).doc(uid).set(userData);
      
      // Update local user data - store only in memory
      const completeUserData = { uid, ...userData };
      this.handleAuthStateChange(completeUserData);
      
      return completeUserData;
    } catch (error) {
      console.error('Error completing user profile:', error);
      throw error;
    }
  }

  /**
   * Sign in user
   */
  async signIn(email, password) {
    try {
      if (!firebase.auth) {
        throw new Error('Firebase Auth not available');
      }

      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const userData = await this.loadUserDataFromFirebase(userCredential.user.uid);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error(this.getAuthErrorMessage(error));
    }
  }

  /**
   * Sign out user
   */
  async signOut() {
    try {
      // Clear current user in memory
      this.currentUser = null;
      
      // Sign out from Firebase
      if (firebase.auth) {
        await firebase.auth().signOut();
      }
      
      // Update local state
      this.handleAuthStateChange(null);
      
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is of specific type
   */
  isUserType(type) {
    const currentUser = this.getCurrentUser();
    return currentUser && currentUser.type === type;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getCurrentUser();
  }

  /**
   * Wait for authentication to be determined
   */
  async waitForAuth(timeout = 5000) {
    return new Promise((resolve, reject) => {
      // If already authenticated, resolve immediately
      if (this.currentUser) {
        resolve(this.currentUser);
        return;
      }

      // Check immediate sources
      if (this.checkImmediateAuth()) {
        resolve(this.currentUser);
        return;
      }

      // Wait for Firebase auth state
      const timeoutId = setTimeout(() => {
        unsubscribe();
        reject(new Error('Authentication timeout'));
      }, timeout);

      const unsubscribe = this.onAuthStateChanged((user) => {
        clearTimeout(timeoutId);
        unsubscribe();
        
        if (user) {
          resolve(user);
        } else {
          reject(new Error('No authenticated user'));
        }
      });
    });
  }

  /**
   * Update user data
   */
  async updateUserData(updates) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      if (firebase.firestore) {
        const db = firebase.firestore();
        await db.collection(COLLECTIONS.USERS).doc(currentUser.uid).update({
          ...updates,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      // Update local data - store only in memory
      const updatedUser = { ...currentUser, ...updates };
      this.handleAuthStateChange(updatedUser);
      
      return updatedUser;
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }

  /**
   * Get user-friendly error message
   */
  getAuthErrorMessage(error) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'משתמש לא נמצא';
      case 'auth/wrong-password':
        return 'סיסמה שגויה';
      case 'auth/email-already-in-use':
        return 'כתובת האימייל כבר בשימוש';
      case 'auth/weak-password':
        return 'הסיסמה חלשה מדי';
      case 'auth/invalid-email':
        return 'כתובת אימייל לא תקינה';
      case 'auth/too-many-requests':
        return 'יותר מדי ניסיונות. נסה שוב מאוחר יותר';
      case 'auth/network-request-failed':
        return 'בעיית רשת. בדוק את החיבור לאינטרנט';
      default:
        return error.message || 'אירעה שגיאה. אנא נסה שוב.';
    }
  }

  /**
   * Initialize admin account if needed
   */
  async initializeAdmin() {
    try {
      if (!firebase.firestore) {
        return;
      }

      const db = firebase.firestore();
      
      // Check if admin exists
      const adminQuery = await db.collection(COLLECTIONS.USERS)
        .where('type', '==', USER_TYPES.ADMIN)
        .limit(1)
        .get();

      if (adminQuery.empty) {
        // Create admin account
        const adminEmail = 'admin@footballscouting.co.il';
        const adminPassword = 'Admin123!';

        // Create user in Firebase Auth
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(adminEmail, adminPassword);
        const uid = userCredential.user.uid;

        // Create admin user document
        await db.collection(COLLECTIONS.USERS).doc(uid).set({
          name: 'מנהל מערכת',
          email: adminEmail,
          type: USER_TYPES.ADMIN,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('Admin account created successfully');
        showMessage('חשבון מנהל נוצר בהצלחה', 'success');
      }
    } catch (error) {
      console.error('Error initializing admin:', error);
    }
  }
}

// Create singleton instance
const authManager = new AuthManager();

// Export for ES6 modules
export default authManager;

// Export to global for backward compatibility
if (typeof window !== 'undefined') {
  window.authManager = authManager;
}