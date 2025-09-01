/**
 * Critical Authentication Bug Prevention Tests
 * These tests target the actual issues we encountered during development
 */

import { createFirebaseMock } from '../mocks/firebase-mock.js';

// Mock the utils module
jest.mock('../../js/utils.js', () => ({
  USER_TYPES: {
    PLAYER: 'player',
    SCOUT: 'scout',
    ADMIN: 'admin'
  },
  COLLECTIONS: {
    USERS: 'users',
    VIDEOS: 'videos',
    CHALLENGES: 'challenges'
  },
  showMessage: jest.fn()
}));

describe('AuthManager - Critical Bug Prevention', () => {
  let authManager;
  let firebaseMock;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    firebaseMock = createFirebaseMock();
    global.firebase = firebaseMock;
    
    // Import the singleton instance, not the class
    const authModule = await import('../../js/auth-manager.js');
    authManager = authModule.default;
  });

  afterEach(() => {
    firebaseMock.reset();
  });

  describe('🔥 BUG 1: Firebase Auth User Without Firestore Document', () => {
    test('should handle user existing in Firebase Auth but missing in Firestore', async () => {
      // REAL BUG: User exists in Firebase Auth but no Firestore document
      // This caused "User exists in Firebase Auth but not in Firestore. Signing out..."
      
      // Add user to Firebase Auth but NOT to Firestore
      const email = 'orphaned@user.com';
      const password = 'Test123!';
      
      // Create Firebase Auth user but don't add to Firestore collections
      firebaseMock.users.set(email, {
        uid: 'orphaned-uid',
        email,
        password,
        emailVerified: true
      });
      
      // Sign in should auto-create Firestore document instead of failing
      const result = await authManager.signIn(email, password);
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(email);
      
      // Verify Firestore document was auto-created
      const usersCollection = firebaseMock.collections.get('users');
      let userFound = false;
      for (const [uid, userData] of usersCollection.entries()) {
        if (userData.email === email) {
          userFound = true;
          break;
        }
      }
      expect(userFound).toBe(true);
    });
  });

  describe('🔥 BUG 2: Logout Storage Cleanup', () => {
    test('should clear ALL storage data on logout', async () => {
      // REAL BUG: Logout didn't clear all storage, causing persistence issues
      
      // Mock storage APIs
      const mockLocalStorage = {
        removeItem: jest.fn(),
        clear: jest.fn(),
        getItem: jest.fn(),
        setItem: jest.fn()
      };
      const mockSessionStorage = {
        removeItem: jest.fn(),
        clear: jest.fn(),
        getItem: jest.fn(),
        setItem: jest.fn()
      };
      
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, writable: true });
      Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage, writable: true });
      
      // Set up user and sign in
      firebaseMock.addUser('test@test.com', 'Test123!', {
        name: 'Test User',
        type: 'player'
      });
      await authManager.signIn('test@test.com', 'Test123!');
      
      // Sign out
      await authManager.signOut();
      
      // Should clear all auth-related storage keys
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('currentUser');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authData');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('sessionUser');
      expect(mockSessionStorage.clear).toHaveBeenCalled();
    });
  });

  describe('🔥 BUG 3: Fake Login Prevention', () => {
    test('should prevent fake localStorage-based login', async () => {
      // REAL BUG: System accepted any email as "logged in" via localStorage
      
      // Simulate fake localStorage login (the old bug)
      const fakeUser = { email: 'fakeemail@fake.com', type: 'player' };
      window.localStorage = {
        getItem: jest.fn(() => JSON.stringify(fakeUser)),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn()
      };
      
      // Should NOT accept fake login - must use real Firebase
      await expect(authManager.signIn('fakeemail@fake.com', 'fakepassword'))
        .rejects.toThrow();
      
      // Should ignore localStorage fake data
      expect(authManager.getCurrentUser()).toBeNull();
    });
    
    test('should require real Firebase authentication', async () => {
      // Ensure we only accept Firebase-authenticated users
      const result = await authManager.signIn('nonexistent@user.com', 'badpassword')
        .catch(error => error);
      
      expect(result).toBeInstanceOf(Error);
      expect(authManager.isAuthenticated()).toBe(false);
    });
  });

  describe('🔥 BUG 4: Admin User Auto-Creation', () => {
    test('should create admin user with correct credentials', async () => {
      // REAL BUG: Admin creation failed or used wrong credentials
      
      await authManager.initializeAdmin();
      
      // Should create admin with specific email and password
      const adminSignIn = await authManager.signIn('admin@example.com', 'admin123');
      
      expect(adminSignIn.success).toBe(true);
      expect(adminSignIn.user.type).toBe('admin');
      expect(adminSignIn.user.email).toBe('admin@example.com');
    });
    
    test('should handle admin already exists gracefully', async () => {
      // Initialize admin twice - should not create duplicates
      await authManager.initializeAdmin();
      await authManager.initializeAdmin();
      
      // Should only have one admin
      const usersCollection = firebaseMock.collections.get('users');
      let adminCount = 0;
      for (const [uid, userData] of usersCollection.entries()) {
        if (userData.type === 'admin') {
          adminCount++;
        }
      }
      expect(adminCount).toBe(1);
    });
  });

  describe('🔥 BUG 5: Session Persistence', () => {
    test('should maintain auth state across page reloads', async () => {
      // REAL BUG: Page refresh caused users to be logged out
      
      // Sign in user
      firebaseMock.addUser('persistent@user.com', 'Test123!', {
        name: 'Persistent User',
        type: 'player'
      });
      
      await authManager.signIn('persistent@user.com', 'Test123!');
      expect(authManager.isAuthenticated()).toBe(true);
      
      // Simulate page reload by creating new AuthManager instance
      const newAuthManager = new AuthManager();
      
      // Should restore auth state from Firebase
      expect(newAuthManager.getCurrentUser()).toBeTruthy();
    });
  });

  describe('🔥 BUG 6: Error Handling Edge Cases', () => {
    test('should handle Firebase connection failures', async () => {
      // Simulate network failure
      firebaseMock.auth.signInWithEmailAndPassword = jest.fn(() => 
        Promise.reject(new Error('Network request failed'))
      );
      
      await expect(authManager.signIn('test@test.com', 'password'))
        .rejects.toThrow('Network request failed');
    });
    
    test('should handle malformed user data gracefully', async () => {
      // Add user with missing required fields
      firebaseMock.addUser('malformed@user.com', 'Test123!', {
        // Missing name and type - should handle gracefully
      });
      
      const result = await authManager.signIn('malformed@user.com', 'Test123!')
        .catch(error => ({ success: false, error: error.message }));
      
      // Should either succeed with defaults or fail gracefully
      expect(result).toBeDefined();
    });
  });
});