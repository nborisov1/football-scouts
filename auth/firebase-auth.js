/**
 * Football Scouting Website - Firebase Authentication System
 * Handles user authentication, registration, and session management using Firebase
 */

'use strict';

import { auth, db } from '../config/firebase.js';

// User types
const USER_TYPES = {
  PLAYER: 'player',
  SCOUT: 'scout',
  ADMIN: 'admin'
};

// Collections
const COLLECTIONS = {
  USERS: 'users',
  CHALLENGES: 'challenges',
  VIDEOS: 'videos',
  TRAINING_PROGRAMS: 'trainingPrograms'
};

/**
 * Firebase Authentication class
 * Handles all authentication-related functionality using Firebase
 */
class FirebaseAuth {
  constructor() {
    // Listen for auth state changes
    this.currentUser = null;
    auth.onAuthStateChanged(user => {
      if (user) {
        // User is signed in
        this.getUserData(user.uid).then(userData => {
          this.currentUser = userData;
          // Dispatch event for auth state change
          const event = new CustomEvent('authStateChanged', { detail: { user: userData } });
          document.dispatchEvent(event);
        });
      } else {
        // User is signed out
        this.currentUser = null;
        // Dispatch event for auth state change
        const event = new CustomEvent('authStateChanged', { detail: { user: null } });
        document.dispatchEvent(event);
      }
    });
    
    // Initialize admin account if not exists
    this.initializeAdmin();
  }

  /**
   * Initialize admin account if it doesn't exist
   */
  async initializeAdmin() {
    try {
      // Check if admin exists
      const adminQuery = await db.collection(COLLECTIONS.USERS)
        .where('type', '==', USER_TYPES.ADMIN)
        .limit(1)
        .get();
      
      if (adminQuery.empty) {
        // Create admin account
        const adminEmail = 'admin@example.com';
        const adminPassword = 'admin123';
        
        // Create user in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(adminEmail, adminPassword);
        const uid = userCredential.user.uid;
        
        // Create user document in Firestore
        await db.collection(COLLECTIONS.USERS).doc(uid).set({
          name: 'מנהל מערכת',
          email: adminEmail,
          type: USER_TYPES.ADMIN,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Admin account created successfully');
      }
    } catch (error) {
      console.error('Error initializing admin account:', error);
    }
  }

  /**
   * Register a new user with email and password
   * @param {Object} userData - Basic user data (email, password)
   * @returns {Promise} - Promise that resolves with the user ID
   */
  async registerWithEmail(userData) {
    try {
      // Create user in Firebase Auth
      const userCredential = await auth.createUserWithEmailAndPassword(
        userData.email, 
        userData.password
      );
      
      return userCredential.user.uid;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }
  
  /**
   * Complete user profile after registration
   * @param {string} uid - User ID
   * @param {Object} profileData - User profile data
   * @param {string} userType - Type of user (player or scout)
   * @returns {Promise} - Promise that resolves with the user data
   */
  async completeUserProfile(uid, profileData, userType) {
    try {
      // Create base user object
      const userData = {
        name: profileData.name,
        email: profileData.email,
        type: userType,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      // Add user type specific data
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
          unlocked: false,
          currentStage: 0,
          completedStages: []
        };
        userData.stats = {
          consistency: 0,
          improvement: 0,
          ranking: 0
        };
      } else if (userType === USER_TYPES.SCOUT) {
        userData.club = profileData.club;
        userData.position = profileData.position;
        userData.watchlist = [];
      }
      
      // Save user data to Firestore
      await db.collection(COLLECTIONS.USERS).doc(uid).set(userData);
      
      return userData;
    } catch (error) {
      throw new Error(`Error completing user profile: ${error.message}`);
    }
  }

  /**
   * Log in a user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} - Promise that resolves with the user data
   */
  async login(email, password) {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const userData = await this.getUserData(userCredential.user.uid);
      
      return {
        success: true,
        message: 'התחברת בהצלחה',
        user: userData
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Log out the current user
   * @returns {Promise} - Promise that resolves when the user is logged out
   */
  async logout() {
    try {
      await auth.signOut();
      return {
        success: true,
        message: 'התנתקת בהצלחה'
      };
    } catch (error) {
      throw new Error(`Error logging out: ${error.message}`);
    }
  }

  /**
   * Check if a user is logged in
   * @returns {boolean} - True if a user is logged in
   */
  isLoggedIn() {
    return !!auth.currentUser;
  }

  /**
   * Get the current logged in user
   * @returns {Object|null} - Current user object or null if not logged in
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get user data from Firestore
   * @param {string} uid - User ID
   * @returns {Promise} - Promise that resolves with the user data
   */
  async getUserData(uid) {
    try {
      const doc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
      
      if (doc.exists) {
        const userData = doc.data();
        userData.id = doc.id;
        return userData;
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      throw new Error(`Error getting user data: ${error.message}`);
    }
  }

  /**
   * Check if current user is of a specific type
   * @param {string} type - User type to check
   * @returns {boolean} - True if current user is of the specified type
   */
  isUserType(type) {
    const currentUser = this.getCurrentUser();
    return currentUser && currentUser.type === type;
  }

  /**
   * Update user data
   * @param {string} uid - User ID
   * @param {Object} updates - Object with properties to update
   * @returns {Promise} - Promise that resolves when the user is updated
   */
  async updateUser(uid, updates) {
    try {
      await db.collection(COLLECTIONS.USERS).doc(uid).update(updates);
      
      // Update current user if it's the same user
      if (this.currentUser && this.currentUser.id === uid) {
        Object.assign(this.currentUser, updates);
      }
      
      return {
        success: true,
        message: 'הפרטים עודכנו בהצלחה'
      };
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  /**
   * Delete user data from Firestore
   * @param {string} uid - User ID
   * @returns {Promise} - Promise that resolves when the user is deleted
   */
  async deleteUser(uid) {
    try {
      await db.collection(COLLECTIONS.USERS).doc(uid).delete();
      
      // Clear current user if it's the same user
      if (this.currentUser && this.currentUser.id === uid) {
        this.currentUser = null;
      }
      
      return {
        success: true,
        message: 'החשבון נמחק בהצלחה'
      };
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  /**
   * Get all users
   * @returns {Promise} - Promise that resolves with all users
   */
  async getAllUsers() {
    try {
      const snapshot = await db.collection(COLLECTIONS.USERS).get();
      const users = [];
      
      snapshot.forEach(doc => {
        const userData = doc.data();
        userData.id = doc.id;
        users.push(userData);
      });
      
      return users;
    } catch (error) {
      throw new Error(`Error getting users: ${error.message}`);
    }
  }

  /**
   * Get users by type
   * @param {string} type - User type to filter by
   * @returns {Promise} - Promise that resolves with filtered users
   */
  async getUsersByType(type) {
    try {
      const snapshot = await db.collection(COLLECTIONS.USERS)
        .where('type', '==', type)
        .get();
      
      const users = [];
      
      snapshot.forEach(doc => {
        const userData = doc.data();
        userData.id = doc.id;
        users.push(userData);
      });
      
      return users;
    } catch (error) {
      throw new Error(`Error getting users by type: ${error.message}`);
    }
  }

  /**
   * Reset password
   * @param {string} email - User's email
   * @returns {Promise} - Promise that resolves when the password reset email is sent
   */
  async resetPassword(email) {
    try {
      await auth.sendPasswordResetEmail(email);
      
      return {
        success: true,
        message: 'הוראות לאיפוס סיסמה נשלחו לאימייל שלך'
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Handle Firebase authentication errors
   * @param {Object} error - Firebase auth error
   * @returns {Object} - Error object with message
   */
  handleAuthError(error) {
    let message = 'אירעה שגיאה. אנא נסה שוב.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'כתובת האימייל כבר קיימת במערכת';
        break;
      case 'auth/invalid-email':
        message = 'כתובת אימייל לא תקינה';
        break;
      case 'auth/user-not-found':
        message = 'משתמש לא קיים';
        break;
      case 'auth/wrong-password':
        message = 'סיסמה שגויה';
        break;
      case 'auth/weak-password':
        message = 'הסיסמה חלשה מדי. יש להשתמש בלפחות 6 תווים';
        break;
      case 'auth/too-many-requests':
        message = 'יותר מדי ניסיונות כניסה. אנא נסה שוב מאוחר יותר';
        break;
    }
    
    return {
      success: false,
      message: message,
      originalError: error
    };
  }
}

// Export the FirebaseAuth class
const firebaseAuth = new FirebaseAuth();
export default firebaseAuth;