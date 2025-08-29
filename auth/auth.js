/**
 * Football Scouting Website - Authentication System
 * Handles user authentication, registration, and session management
 */

'use strict';

// User types
const USER_TYPES = {
  PLAYER: 'player',
  SCOUT: 'scout',
  ADMIN: 'admin'
};

// Local storage keys
const STORAGE_KEYS = {
  CURRENT_USER: 'footballScout_currentUser',
  USERS: 'footballScout_users'
};

/**
 * Authentication class
 * Handles all authentication-related functionality
 */
class Auth {
  constructor() {
    // Initialize users if not exists
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.initializeUsers();
    }
  }

  /**
   * Initialize users with admin account
   */
  initializeUsers() {
    const initialUsers = {
      'admin@example.com': {
        name: 'מנהל מערכת',
        email: 'admin@example.com',
        password: this.hashPassword('admin123'), // In a real app, use a secure hash
        type: USER_TYPES.ADMIN,
        createdAt: new Date().toISOString()
      }
    };
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
  }

  /**
   * Register a new user
   * @param {Object} userData - User data including name, email, password, etc.
   * @param {string} userType - Type of user (player or scout)
   * @returns {Object} - Result object with success status and message
   */
  register(userData, userType) {
    // Get existing users
    const users = this.getUsers();
    
    // Check if email already exists
    if (users[userData.email]) {
      return {
        success: false,
        message: 'כתובת האימייל כבר קיימת במערכת'
      };
    }
    
    // Create new user object
    const newUser = {
      name: userData.name,
      email: userData.email,
      password: this.hashPassword(userData.password),
      type: userType,
      createdAt: new Date().toISOString()
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
    
    // Add user to users object
    users[userData.email] = newUser;
    
    // Save updated users
    this.saveUsers(users);
    
    // Log in the new user
    this.login(userData.email, userData.password);
    
    return {
      success: true,
      message: 'ההרשמה בוצעה בהצלחה'
    };
  }

  /**
   * Log in a user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Object} - Result object with success status and message
   */
  login(email, password) {
    // Get users
    const users = this.getUsers();
    
    // Check if user exists
    if (!users[email]) {
      return {
        success: false,
        message: 'כתובת האימייל לא קיימת במערכת'
      };
    }
    
    // Check password
    if (users[email].password !== this.hashPassword(password)) {
      return {
        success: false,
        message: 'סיסמה שגויה'
      };
    }
    
    // Create session user (without password)
    const sessionUser = { ...users[email] };
    delete sessionUser.password;
    
    // Save to local storage
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
    
    return {
      success: true,
      message: 'התחברת בהצלחה',
      user: sessionUser
    };
  }

  /**
   * Log out the current user
   */
  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    
    // Redirect to home page
    window.location.href = '/';
  }

  /**
   * Check if a user is logged in
   * @returns {boolean} - True if a user is logged in
   */
  isLoggedIn() {
    return !!this.getCurrentUser();
  }

  /**
   * Get the current logged in user
   * @returns {Object|null} - Current user object or null if not logged in
   */
  getCurrentUser() {
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
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
    // Get users
    const users = this.getUsers();
    
    // Check if user exists
    if (!users[email]) {
      return {
        success: false,
        message: 'המשתמש לא קיים'
      };
    }
    
    // Update user data
    Object.assign(users[email], updates);
    
    // Save updated users
    this.saveUsers(users);
    
    // Update current user if it's the same user
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.email === email) {
      const updatedUser = { ...users[email] };
      delete updatedUser.password;
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    }
    
    return {
      success: true,
      message: 'הפרטים עודכנו בהצלחה'
    };
  }

  /**
   * Get all users
   * @returns {Object} - Object with all users
   */
  getUsers() {
    const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
    return usersJson ? JSON.parse(usersJson) : {};
  }

  /**
   * Save users to local storage
   * @param {Object} users - Users object
   */
  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  /**
   * Simple password hashing (for demo purposes only)
   * In a real application, use a proper hashing algorithm
   * @param {string} password - Password to hash
   * @returns {string} - Hashed password
   */
  hashPassword(password) {
    // This is NOT secure and is only for demonstration
    // In a real app, use bcrypt or another secure hashing algorithm
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
}

// Export the Auth class
const auth = new Auth();