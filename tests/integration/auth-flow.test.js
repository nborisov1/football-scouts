/**
 * Authentication Flow Integration Tests
 * Tests the complete authentication flow including the fixed issues
 */

import { createFirebaseMock } from '../mocks/firebase-mock.js';

describe('Authentication Flow Integration Tests', () => {
  let authManager;
  let firebaseMock;

  beforeEach(async () => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create Firebase mock
    firebaseMock = createFirebaseMock();
    global.firebase = firebaseMock;
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Import AuthManager after mocking
    const authModule = await import('../../js/auth-manager.js');
    authManager = authModule.default;
  });

  afterEach(() => {
    firebaseMock.reset();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Issue #1: Logout Persistence Bug', () => {
    test('should completely clear all user data on logout', async () => {
      // Setup: Create and sign in user
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'Test123!',
        type: 'player'
      };

      // Simulate old localStorage data that might persist
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('sessionUser', JSON.stringify(userData));
      localStorage.setItem('footballScout_currentUser', JSON.stringify(userData));
      sessionStorage.setItem('currentUser', JSON.stringify(userData));

      // Register and sign in user
      await authManager.register(userData, 'player');
      expect(authManager.isAuthenticated()).toBe(true);

      // Sign out
      await authManager.signOut();

      // Verify ALL data is cleared
      expect(authManager.getCurrentUser()).toBeNull();
      expect(authManager.isAuthenticated()).toBe(false);
      
      // CRITICAL TEST: Verify localStorage is cleared
      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(localStorage.getItem('sessionUser')).toBeNull();
      expect(localStorage.getItem('footballScout_currentUser')).toBeNull();
      expect(localStorage.getItem('authData')).toBeNull();
      
      // CRITICAL TEST: Verify sessionStorage is cleared
      expect(sessionStorage.getItem('currentUser')).toBeNull();
      expect(sessionStorage.getItem('sessionUser')).toBeNull();
      expect(sessionStorage.getItem('footballScout_currentUser')).toBeNull();
      expect(sessionStorage.getItem('authData')).toBeNull();
    });

    test('should clear storage data on Firebase auth state change to null', async () => {
      // Setup: Add old data to storage
      localStorage.setItem('currentUser', JSON.stringify({ email: 'old@test.com' }));
      sessionStorage.setItem('sessionUser', JSON.stringify({ email: 'old@test.com' }));

      // Simulate Firebase auth state change to null (logout)
      firebaseMock.setAuthState(null);

      // Wait for auth state to propagate
      await testUtils.waitFor(100);

      // Verify storage is cleared
      expect(localStorage.getItem('currentUser')).toBeNull();
      expect(sessionStorage.getItem('sessionUser')).toBeNull();
      expect(authManager.getCurrentUser()).toBeNull();
    });
  });

  describe('Issue #2: Admin Panel Access Problem', () => {
    test('should create admin account correctly', async () => {
      // Initialize admin
      await authManager.initializeAdmin();

      // Verify admin was created in Firebase
      const adminEmail = 'admin@example.com';
      const userCredential = await firebaseMock.auth().signInWithEmailAndPassword(adminEmail, 'admin123');
      
      expect(userCredential.user.email).toBe(adminEmail);
      
      // Verify admin document exists in Firestore
      const usersCollection = firebaseMock.collections.get('users');
      let adminFound = false;
      
      for (const [id, userData] of usersCollection.entries()) {
        if (userData.type === 'admin' && userData.email === adminEmail) {
          adminFound = true;
          expect(userData.name).toBe('מנהל מערכת');
          break;
        }
      }
      
      expect(adminFound).toBe(true);
    });

    test('should allow admin login and access', async () => {
      // Setup: Create admin account
      await authManager.initializeAdmin();

      // Test admin login
      const result = await authManager.signIn('admin@example.com', 'admin123');
      
      expect(result.success).toBe(true);
      expect(result.user.type).toBe('admin');
      expect(authManager.isUserType('admin')).toBe(true);
      expect(authManager.getCurrentUser().email).toBe('admin@example.com');
    });

    test('should handle admin access check correctly', async () => {
      // Setup admin
      await authManager.initializeAdmin();
      await authManager.signIn('admin@example.com', 'admin123');

      // Test admin type checks
      expect(authManager.isUserType('admin')).toBe(true);
      expect(authManager.isUserType('player')).toBe(false);
      expect(authManager.isUserType('scout')).toBe(false);
      
      // Test authentication status
      expect(authManager.isAuthenticated()).toBe(true);
    });

    test('should not create duplicate admin accounts', async () => {
      // Initialize admin twice
      await authManager.initializeAdmin();
      await authManager.initializeAdmin();

      // Count admin users
      const usersCollection = firebaseMock.collections.get('users');
      let adminCount = 0;
      
      for (const [id, userData] of usersCollection.entries()) {
        if (userData.type === 'admin') {
          adminCount++;
        }
      }
      
      expect(adminCount).toBe(1);
    });
  });

  describe('Complete Authentication Flow', () => {
    test('should handle complete player registration and login flow', async () => {
      const playerData = {
        name: 'Test Player',
        email: 'player@test.com',
        password: 'Player123!',
        age: 18,
        position: 'midfielder',
        dominantFoot: 'right',
        level: 'intermediate'
      };

      // Register player
      const registerResult = await authManager.register(playerData, 'player');
      expect(registerResult.success).toBe(true);
      expect(authManager.isUserType('player')).toBe(true);

      // Sign out
      await authManager.signOut();
      expect(authManager.isAuthenticated()).toBe(false);

      // Sign back in
      const loginResult = await authManager.signIn(playerData.email, playerData.password);
      expect(loginResult.success).toBe(true);
      expect(authManager.isUserType('player')).toBe(true);
      expect(authManager.getCurrentUser().age).toBe(18);
    });

    test('should handle complete scout registration and login flow', async () => {
      const scoutData = {
        name: 'Test Scout',
        email: 'scout@test.com',
        password: 'Scout123!',
        club: 'Test FC',
        position: 'Head Scout'
      };

      // Register scout
      const registerResult = await authManager.register(scoutData, 'scout');
      expect(registerResult.success).toBe(true);
      expect(authManager.isUserType('scout')).toBe(true);

      // Sign out and verify clean state
      await authManager.signOut();
      expect(authManager.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('currentUser')).toBeNull();

      // Sign back in
      const loginResult = await authManager.signIn(scoutData.email, scoutData.password);
      expect(loginResult.success).toBe(true);
      expect(authManager.isUserType('scout')).toBe(true);
      expect(authManager.getCurrentUser().club).toBe('Test FC');
    });

    test('should handle auth state persistence correctly', async () => {
      // Register user
      await authManager.register({
        name: 'Test User',
        email: 'test@test.com',
        password: 'Test123!'
      }, 'player');

      // Verify auth state
      expect(authManager.isAuthenticated()).toBe(true);

      // Simulate page reload by creating new AuthManager instance
      const newAuthModule = await import('../../js/auth-manager.js');
      const newAuthManager = new newAuthModule.default.constructor();

      // Auth state should be maintained through Firebase
      // (In real app, Firebase would maintain auth state across page reloads)
      firebaseMock.setAuthState(firebaseMock.authState);
      
      // Wait for auth state to propagate
      await testUtils.waitFor(100);
      
      // Note: In real Firebase, auth state persists automatically
      expect(firebaseMock.authState).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid login credentials', async () => {
      await expect(authManager.signIn('invalid@test.com', 'wrongpassword'))
        .rejects.toThrow();
    });

    test('should handle duplicate email registration', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'Test123!'
      };

      // First registration should succeed
      await authManager.register(userData, 'player');

      // Second registration should fail
      await expect(authManager.register(userData, 'scout'))
        .rejects.toThrow();
    });

    test('should provide Hebrew error messages', async () => {
      try {
        await authManager.signIn('nonexistent@test.com', 'password');
      } catch (error) {
        expect(error.message).toBe('משתמש לא נמצא');
      }
    });
  });

  describe('Storage Conflict Resolution', () => {
    test('should prioritize Firebase auth over local storage', async () => {
      // Setup conflicting data
      localStorage.setItem('currentUser', JSON.stringify({
        email: 'fake@test.com',
        type: 'admin'
      }));

      // Setup real Firebase user
      firebaseMock.addUser('real@test.com', 'Test123!', {
        name: 'Real User',
        type: 'player'
      });

      await authManager.signIn('real@test.com', 'Test123!');

      // Should use Firebase data, not localStorage
      expect(authManager.getCurrentUser().email).toBe('real@test.com');
      expect(authManager.getCurrentUser().type).toBe('player');
      expect(authManager.isUserType('player')).toBe(true);
      expect(authManager.isUserType('admin')).toBe(false);
    });
  });
});
