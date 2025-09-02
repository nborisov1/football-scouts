/**
 * Football Scouting Website - Authentication System
 * Handles user authentication, registration, and session management using Firebase
 */

'use strict';

// Use global Firebase services instead of imports
// Firebase services are available globally via config/firebase.js

// User types
const USER_TYPES = {
  PLAYER: 'player',
  SCOUT: 'scout',
  ADMIN: 'admin'
};

// Collections
const COLLECTIONS = {
  USERS: 'users'
};

// Local storage keys for compatibility
const STORAGE_KEYS = {
  CURRENT_USER: 'footballScout_currentUser'
};

/**
 * Authentication class
 * Handles all authentication-related functionality using Firebase
 */
class Auth {
  constructor() {
    this.currentUser = null;
    
    // Listen for auth state changes
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // User is signed in
        this.getUserData(user.uid).then(userData => {
          this.currentUser = userData;
          // Store in localStorage for compatibility with existing code
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData));
          // Dispatch event for auth state change
          const event = new CustomEvent('authStateChanged', { detail: { user: userData } });
          document.dispatchEvent(event);
        }).catch(error => {
          console.error('Error getting user data:', error);
        });
      } else {
        // User is signed out
        this.currentUser = null;
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
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
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(adminEmail, adminPassword);
        const uid = userCredential.user.uid;
        
        // Create user document in Firestore
        await firebase.firestore().collection(COLLECTIONS.USERS).doc(uid).set({
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
   * Register a new user
   * @param {Object} userData - User data including name, email, password, etc.
   * @param {string} userType - Type of user (player or scout)
   * @returns {Object} - Result object with success status and message
   */
  register(userData, userType) {
    try {
      // Create user in Firebase Auth
      firebase.auth().createUserWithEmailAndPassword(userData.email, userData.password)
        .then(userCredential => {
          const uid = userCredential.user.uid;
          
          // Create base user object
          const newUser = {
            name: userData.name,
            email: userData.email,
            type: userType,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          };
          
          // Add user type specific data
          if (userType === USER_TYPES.PLAYER) {
            newUser.age = userData.age;
            newUser.position = userData.position;
            newUser.dominantFoot = userData.dominantFoot;
            newUser.level = userData.level;
            newUser.challenges = {
              initial: {
                completed: false,
                videos: []
              }
            };
            newUser.trainingProgram = {
              unlocked: false,
              currentStage: 0,
              completedStages: []
            };
            newUser.stats = {
              consistency: 0,
              improvement: 0,
              ranking: 0
            };
          } else if (userType === USER_TYPES.SCOUT) {
            newUser.club = userData.club;
            newUser.position = userData.position;
            newUser.watchlist = [];
          }
          
          // Save user data to Firestore
          return db.collection(COLLECTIONS.USERS).doc(uid).set(newUser);
        })
        .catch(error => {
          console.error('Error registering user:', error);
          return {
            success: false,
            message: this.handleAuthError(error).message
          };
        });
      
      return {
        success: true,
        message: 'ההרשמה בוצעה בהצלחה'
      };
    } catch (error) {
      console.error('Error in register:', error);
      return {
        success: false,
        message: 'אירעה שגיאה בתהליך ההרשמה'
      };
    }
  }

  /**
   * Log in a user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Object} - Result object with success status and message
   */
  login(email, password) {
    try {
      // Sign in with Firebase
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then(userCredential => {
          // Get user data from Firestore
          return this.getUserData(userCredential.user.uid);
        })
        .then(userData => {
          // Store user data in localStorage for compatibility
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData));
          
          return {
            success: true,
            message: 'התחברת בהצלחה',
            user: userData
          };
        })
        .catch(error => {
          console.error('Error logging in:', error);
          return {
            success: false,
            message: this.handleAuthError(error).message
          };
        });
      
      // Return success for compatibility with synchronous code
      // The actual result will be handled by the auth state change listener
      return {
        success: true,
        message: 'מתחבר...',
        user: null
      };
    } catch (error) {
      console.error('Error in login:', error);
      return {
        success: false,
        message: 'אירעה שגיאה בתהליך ההתחברות'
      };
    }
  }

  /**
   * Log out the current user
   */
  logout() {
    firebase.auth().signOut()
      .then(() => {
        // Clear local storage
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        
        // Redirect to home page
        window.location.href = '/';
      })
      .catch(error => {
        console.error('Error signing out:', error);
      });
  }

  /**
   * Check if a user is logged in
   * @returns {boolean} - True if a user is logged in
   */
  isLoggedIn() {
    return !!firebase.auth().currentUser || !!this.getCurrentUser();
  }

  /**
   * Get the current logged in user
   * @returns {Object|null} - Current user object or null if not logged in
   */
  getCurrentUser() {
    // First check if we have the user in memory
    if (this.currentUser) {
      return this.currentUser;
    }
    
    // Then check localStorage for compatibility with existing code
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
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
   * @param {string} email - User's email
   * @param {Object} updates - Object with properties to update
   * @returns {Object} - Result object with success status and message
   */
  updateUser(email, updates) {
    try {
      // Get current user
      const currentUser = this.getCurrentUser();
      
      if (!currentUser || !currentUser.id) {
        return {
          success: false,
          message: 'המשתמש לא מחובר'
        };
      }
      
      // Update user data in Firestore
      db.collection(COLLECTIONS.USERS).doc(currentUser.id).update(updates)
        .then(() => {
          // Update current user in memory
          Object.assign(this.currentUser, updates);
          
          // Update localStorage for compatibility
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
          
          return {
            success: true,
            message: 'הפרטים עודכנו בהצלחה'
          };
        })
        .catch(error => {
          console.error('Error updating user:', error);
          return {
            success: false,
            message: `Error updating user: ${error.message}`
          };
        });
      
      return {
        success: true,
        message: 'הפרטים עודכנו בהצלחה'
      };
    } catch (error) {
      console.error('Error in updateUser:', error);
      return {
        success: false,
        message: 'אירעה שגיאה בעדכון הפרטים'
      };
    }
  }

  /**
   * Get all users
   * @returns {Object} - Object with all users
   */
  async getUsers() {
    try {
      const snapshot = await db.collection(COLLECTIONS.USERS).get();
      const users = {};
      
      snapshot.forEach(doc => {
        const userData = doc.data();
        userData.id = doc.id;
        users[userData.email] = userData;
      });
      
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      return {};
    }
  }

  /**
   * Save users to Firestore (compatibility method)
   * @param {Object} users - Users object
   */
  saveUsers(users) {
    // This method is kept for compatibility but doesn't do anything
    // as users are saved individually in Firestore
    console.warn('saveUsers is deprecated with Firebase. Use updateUser instead.');
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

// Export the Auth class
const auth = new Auth();