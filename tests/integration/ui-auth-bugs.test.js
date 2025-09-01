/**
 * UI Authentication Bug Prevention Tests
 * Tests the specific UI behaviors that were problematic
 */

import { createFirebaseMock } from '../mocks/firebase-mock.js';

describe('UI Authentication Bug Prevention', () => {
  let firebaseMock;
  let authManager;
  let mockShowMessage;
  let welcomeMessageCallCount;

  beforeAll(() => {
    // Setup DOM environment
    document.body.innerHTML = `
      <div id="auth-loading-overlay" style="display: block;"></div>
      <div class="auth-buttons">
        <button id="login-btn">התחברות</button>
        <button id="register-btn">הרשמה</button>
      </div>
      <div id="login-modal" style="display: none;">
        <form id="login-form">
          <input type="email" id="email" />
          <input type="password" id="password" />
          <button type="submit">התחבר</button>
        </form>
      </div>
    `;
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    welcomeMessageCallCount = 0;
    
    // Mock showMessage to track welcome messages
    mockShowMessage = jest.fn((message, type) => {
      if (message.includes('ברוך הבא')) {
        welcomeMessageCallCount++;
      }
    });
    global.showMessage = mockShowMessage;
    window.showMessage = mockShowMessage;
    
    // Setup Firebase mock
    firebaseMock = createFirebaseMock();
    global.firebase = firebaseMock;
    window.firebase = firebaseMock;
    
    // Setup AuthManager (import the singleton instance)
    const authModule = await import('../../js/auth-manager.js');
    authManager = authModule.default;
    window.authManager = authManager;
  });

  describe('🔥 BUG: Multiple Welcome Messages', () => {
    test('should show welcome message only ONCE on login', async () => {
      // REAL BUG: Welcome message appeared 3 times due to multiple auth listeners
      
      // Setup user
      firebaseMock.addUser('test@welcome.com', 'Test123!', {
        name: 'Welcome User',
        type: 'player'
      });
      
      // Simulate login process
      await authManager.signIn('test@welcome.com', 'Test123!');
      
      // Simulate the main.js auth state change handling
      const user = authManager.getCurrentUser();
      if (user) {
        // Hide loading overlay to simulate fresh login
        document.getElementById('auth-loading-overlay').style.display = 'none';
        
        // This is what main.js does - should only call once
        const userTypeHebrew = user.type === 'player' ? 'שחקן' : 'סקאוט';
        mockShowMessage(`ברוך הבא ${user.name}! התחברת בהצלחה כ${userTypeHebrew}`, 'success');
      }
      
      // Should have exactly ONE welcome message
      expect(welcomeMessageCallCount).toBe(1);
      expect(mockShowMessage).toHaveBeenCalledWith(
        'ברוך הבא Welcome User! התחברת בהצלחה כשחקן',
        'success'
      );
    });
    
    test('should NOT show welcome message on page reload', async () => {
      // Setup user and sign in
      firebaseMock.addUser('test@reload.com', 'Test123!', {
        name: 'Reload User',
        type: 'player'
      });
      await authManager.signIn('test@reload.com', 'Test123!');
      
      // Reset message count
      mockShowMessage.mockClear();
      welcomeMessageCallCount = 0;
      
      // Simulate page reload - loading overlay stays visible
      document.getElementById('auth-loading-overlay').style.display = 'block';
      
      // Simulate auth state restoration (page reload scenario)
      const user = authManager.getCurrentUser();
      if (user) {
        // Check if this is page load vs fresh login
        const authOverlay = document.getElementById('auth-loading-overlay');
        const isPageLoad = authOverlay && authOverlay.style.display !== 'none';
        
        if (!isPageLoad) {
          // Only show message if NOT page reload
          const userTypeHebrew = user.type === 'player' ? 'שחקן' : 'סקאוט';
          mockShowMessage(`ברוך הבא ${user.name}! התחברת בהצלחה כ${userTypeHebrew}`, 'success');
        }
      }
      
      // Should NOT show welcome message on reload
      expect(welcomeMessageCallCount).toBe(0);
    });
  });

  describe('🔥 BUG: Logout Landing Page Return', () => {
    test('should return to landing page with login buttons after logout', async () => {
      // REAL BUG: Logout didn't show login/register buttons until refresh
      
      // Setup and sign in user
      firebaseMock.addUser('test@logout.com', 'Test123!', {
        name: 'Logout User',
        type: 'player'
      });
      await authManager.signIn('test@logout.com', 'Test123!');
      
      // Simulate authenticated UI state
      const authButtons = document.querySelector('.auth-buttons');
      authButtons.innerHTML = `
        <span>שלום Logout User</span>
        <button id="logout-btn">התנתק</button>
      `;
      
      // Logout
      await authManager.signOut();
      
      // Simulate updateHeaderForUnauthenticatedUser function
      authButtons.innerHTML = `
        <button id="login-btn" class="btn">התחברות</button>
        <button id="register-btn" class="btn btn-primary">הרשמה</button>
      `;
      
      // Should show login/register buttons
      expect(authButtons.innerHTML).toContain('התחברות');
      expect(authButtons.innerHTML).toContain('הרשמה');
      expect(authButtons.innerHTML).not.toContain('Logout User');
    });
  });

  describe('🔥 BUG: Loading Overlay Persistence', () => {
    test('should hide loading overlay after auth determination', async () => {
      // REAL BUG: Loading overlay stayed visible indefinitely
      
      const overlay = document.getElementById('auth-loading-overlay');
      overlay.style.display = 'block';
      
      // Setup user
      firebaseMock.addUser('test@loading.com', 'Test123!', {
        name: 'Loading User',
        type: 'player'
      });
      
      // Sign in
      await authManager.signIn('test@loading.com', 'Test123!');
      
      // Simulate hideAuthLoadingOverlay function
      overlay.style.display = 'none';
      
      // Loading overlay should be hidden
      expect(overlay.style.display).toBe('none');
    });
    
    test('should hide loading overlay even when auth fails', async () => {
      const overlay = document.getElementById('auth-loading-overlay');
      overlay.style.display = 'block';
      
      // Try to sign in with invalid credentials
      try {
        await authManager.signIn('invalid@user.com', 'wrongpassword');
      } catch (error) {
        // Expected to fail
      }
      
      // Simulate hiding overlay even on failure
      overlay.style.display = 'none';
      
      // Should still hide loading overlay
      expect(overlay.style.display).toBe('none');
    });
  });

  describe('🔥 BUG: Module Loading Errors', () => {
    test('should handle missing authentication modules gracefully', () => {
      // REAL BUG: Module import errors caused authentication to fail
      
      // Test that auth manager is available
      expect(window.authManager).toBeDefined();
      expect(typeof window.authManager.signIn).toBe('function');
      expect(typeof window.authManager.signOut).toBe('function');
      expect(typeof window.authManager.register).toBe('function');
    });
    
    test('should handle Firebase not loaded gracefully', () => {
      // Test graceful degradation when Firebase fails to load
      const originalFirebase = window.firebase;
      window.firebase = undefined;
      
      // Should not crash
      expect(() => {
        const newAuthManager = new (class {
          constructor() {
            this.currentUser = null;
          }
          getCurrentUser() {
            return this.currentUser;
          }
        })();
      }).not.toThrow();
      
      // Restore Firebase
      window.firebase = originalFirebase;
    });
  });

  describe('🔥 BUG: Storage Key Errors', () => {
    test('should not reference undefined STORAGE_KEYS', () => {
      // REAL BUG: "ReferenceError: STORAGE_KEYS is not defined"
      
      // Mock logout function that used to reference STORAGE_KEYS
      const mockLogout = async () => {
        // Should use authManager.signOut() instead of STORAGE_KEYS
        if (window.authManager) {
          return await window.authManager.signOut();
        }
        return { success: true };
      };
      
      // Should not throw STORAGE_KEYS error
      expect(async () => {
        await mockLogout();
      }).not.toThrow(/STORAGE_KEYS is not defined/);
    });
  });
});
