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

import { ProfileManager } from './profile-manager.js';

/**
 * Unified Authentication Manager
 * Handles all authentication-related functionality using Firebase
 */
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];
    this.profileManager = new ProfileManager();
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
          // CRITICAL FIX: Clear all storage when Firebase auth state becomes null
          this.clearAllStorageData();
          this.handleAuthStateChange(null);
        }
      });
    }
  }

  /**
   * CRITICAL FIX: Clear all storage data to prevent persistence after logout
   */
  clearAllStorageData() {
    // Clear localStorage data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionUser');
    localStorage.removeItem('footballScout_currentUser');
    localStorage.removeItem('authData');
    
    // Clear sessionStorage data
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('sessionUser');
    sessionStorage.removeItem('footballScout_currentUser');
    sessionStorage.removeItem('authData');
    
    // Clear URL parameters
    if (window.history && window.history.replaceState) {
      const url = new URL(window.location);
      url.searchParams.delete('auth');
      url.searchParams.delete('user');
      window.history.replaceState({}, '', url.toString());
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
          console.warn('⚠️ User exists in Firebase Auth but not in Firestore. Creating user document...', uid);
          
          // Get user info from Firebase Auth
          const firebaseUser = firebase.auth().currentUser;
          if (firebaseUser) {
            // Create a basic user document in Firestore
            const basicUserData = {
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              type: 'player', // Default to player, can be changed later
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
              // Add default player data
              age: 18,
              position: '',
              dominantFoot: 'right',
              level: 'beginner'
            };
            
            // Save to Firestore
            await db.collection(COLLECTIONS.USERS).doc(uid).set(basicUserData);
            console.log('✅ Created missing Firestore document for user:', firebaseUser.email);
            
            // Load the newly created user data
            const userData = { uid, ...basicUserData };
            this.handleAuthStateChange(userData);
            return userData;
          } else {
            // No Firebase user, sign out
            await firebase.auth().signOut();
            this.handleAuthStateChange(null);
            return null;
          }
        }
      } else {
        throw new Error('Firebase Firestore not available');
      }
    } catch (error) {
      console.error('Error loading user data from Firebase:', error);
      // Sign out on any error to prevent infinite loading
      if (firebase.auth && firebase.auth().currentUser) {
        await firebase.auth().signOut();
      }
      this.handleAuthStateChange(null);
      return null;
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
      // Use ProfileManager to create complete profile
      const userData = {
        uid,
        name: profileData.name,
        email: profileData.email,
        ...profileData // Include all additional profile data
      };

      const completeUserData = await this.profileManager.createProfile(userType, userData);
      completeUserData.uid = uid;
      
      // Update local user data - store only in memory
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

      console.log('🔄 Signing in user:', email);
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const userData = await this.loadUserDataFromFirebase(userCredential.user.uid);
      
      if (userData) {
        console.log('✅ Sign in successful:', userData.email, userData.type);
        return { success: true, user: userData };
      } else {
        console.error('❌ Failed to load user data after successful authentication');
        throw new Error('Failed to load user data');
      }
    } catch (error) {
      console.error('❌ Sign in error:', error);
      throw new Error(this.getAuthErrorMessage(error));
    }
  }

  /**
   * Sign out user - FIXED: Properly clear all persistent data
   */
  async signOut() {
    try {
      // Clear current user in memory
      this.currentUser = null;
      
      // CRITICAL FIX: Clear all localStorage data that might persist
      localStorage.removeItem('currentUser');
      localStorage.removeItem('sessionUser');
      localStorage.removeItem('footballScout_currentUser');
      localStorage.removeItem('authData');
      
      // CRITICAL FIX: Clear sessionStorage data
      sessionStorage.removeItem('currentUser');
      sessionStorage.removeItem('sessionUser');
      sessionStorage.removeItem('footballScout_currentUser');
      sessionStorage.removeItem('authData');
      
      // Clear any URL parameters that might contain auth data
      if (window.history && window.history.replaceState) {
        const url = new URL(window.location);
        url.searchParams.delete('auth');
        url.searchParams.delete('user');
        window.history.replaceState({}, '', url.toString());
      }
      
      // Sign out from Firebase
      if (firebase.auth) {
        await firebase.auth().signOut();
      }
      
      // Update local state
      this.handleAuthStateChange(null);
      
      console.log('✅ All user data cleared from all storage locations');
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
   * Check if user is of specific type - FIXED with debug logging
   */
  isUserType(type) {
    const currentUser = this.getCurrentUser();
    const result = currentUser && currentUser.type === type;
    
    // ADMIN FIX: Add debug logging for admin access issues
    if (type === USER_TYPES.ADMIN) {
      console.log('🔍 Admin access check:', {
        hasUser: !!currentUser,
        userType: currentUser?.type,
        isAdmin: result,
        email: currentUser?.email
      });
    }
    
    return result;
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
   * Initialize admin account if needed - FIXED for proper admin access
   */
  async initializeAdmin() {
    try {
      if (!firebase.firestore) {
        console.log('⚠️ Firebase Firestore not available for admin initialization');
        return;
      }

      const db = firebase.firestore();
      
      // ADMIN FIX: Use the same admin credentials that are expected by the system
      const adminEmail = 'admin@example.com';
      const adminPassword = 'admin123';
      
      // Check if admin exists
      const adminQuery = await db.collection(COLLECTIONS.USERS)
        .where('type', '==', USER_TYPES.ADMIN)
        .limit(1)
        .get();

      if (adminQuery.empty) {
        console.log('🔄 Creating admin account...');
        
        try {
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

          console.log('✅ Admin account created successfully');
          showMessage('חשבון מנהל נוצר בהצלחה', 'success');
          
          // CRITICAL FIX: Sign out the admin after creation so login works properly
          await firebase.auth().signOut();
          
        } catch (createError) {
          // ADMIN FIX: If admin already exists in Auth but not in Firestore, add to Firestore
          if (createError.code === 'auth/email-already-in-use') {
            console.log('⚠️ Admin exists in Auth, creating Firestore document...');
            
            try {
              const userCredential = await firebase.auth().signInWithEmailAndPassword(adminEmail, adminPassword);
              const uid = userCredential.user.uid;
              
              await db.collection(COLLECTIONS.USERS).doc(uid).set({
                name: 'מנהל מערכת',
                email: adminEmail,
                type: USER_TYPES.ADMIN,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
              });
              
              console.log('✅ Admin Firestore document created');
              await firebase.auth().signOut();
              
            } catch (signInError) {
              console.error('❌ Could not sign in to create admin document:', signInError);
            }
          } else {
            throw createError;
          }
        }
      } else {
        console.log('✅ Admin account already exists');
      }
    } catch (error) {
      console.error('❌ Error initializing admin:', error);
    }
  }
}

// Create singleton instance
const authManager = new AuthManager();

// Export to global window for non-module usage
window.authManager = authManager;
  
  // DEBUGGING HELPER: Add debugging function for troubleshooting
  window.debugAuth = () => {
    console.log('🔍 Auth Debug Info:', {
      currentUser: authManager.getCurrentUser(),
      isAuthenticated: authManager.isAuthenticated(),
      isPlayer: authManager.isUserType('player'),
      isScout: authManager.isUserType('scout'),
      isAdmin: authManager.isUserType('admin'),
      localStorage: {
        currentUser: localStorage.getItem('currentUser'),
        sessionUser: localStorage.getItem('sessionUser'),
        footballScout_currentUser: localStorage.getItem('footballScout_currentUser')
      },
      sessionStorage: {
        currentUser: sessionStorage.getItem('currentUser'),
        sessionUser: sessionStorage.getItem('sessionUser')
      },
      firebaseUser: firebase.auth()?.currentUser
    });
  };
  
  // DEBUGGING HELPER: Force logout function for troubleshooting
  window.forceLogout = async () => {
    console.log('🔧 FORCE LOGOUT - Clearing everything');
    authManager.clearAllStorageData();
    
    if (firebase.auth && firebase.auth().currentUser) {
      await firebase.auth().signOut();
    }
    
    authManager.handleAuthStateChange(null);
    
    console.log('✅ Force logout complete');
    if (confirm('Force logout complete. Reload page to ensure clean state?')) {
      window.location.reload();
    }
  };
}