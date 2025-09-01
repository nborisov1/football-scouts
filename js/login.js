/**
 * Login functionality
 * Handles user login forms and authentication
 */

'use strict';

/**
 * Initialize login functionality
 */
function initializeLogin() {
  
  // Setup login form
  setupLoginForm();
  
  // Setup login modal events
  setupLoginModal();
}

/**
 * Setup login form submission
 */
function setupLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) {
    console.warn('Login form not found');
    return;
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    // Validate inputs
    if (!email || !password) {
      showMessage('יש למלא את כל השדות', 'error');
      return;
    }
    
    if (!isValidEmail(email)) {
      showMessage('כתובת אימייל לא תקינה', 'error');
      return;
    }
    
    // Attempt login
    await handleLogin(email, password);
  });
}

/**
 * Setup login modal events
 */
function setupLoginModal() {
  // Login button to open modal
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      openLoginModal();
    });
  }

  // Close modal events
  const loginModal = document.getElementById('login-modal');
  if (loginModal) {
    // Close button
    const closeBtn = loginModal.querySelector('.close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        closeLoginModal();
      });
    }

    // Click outside to close
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) {
        closeLoginModal();
      }
    });
  }
}

/**
 * Handle user login with Firebase authentication
 * @param {string} email - User's email
 * @param {string} password - User's password
 */
async function handleLogin(email, password) {
  try {
    // Check if authManager is available
    if (!window.authManager) {
      showMessage('מערכת האימות לא זמינה. אנא רענן את הדף ונסה שוב.', 'error');
      return;
    }

    // Show loading state
    const submitBtn = document.querySelector('#login-form button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'מתחבר...';
    }

    console.log('🔄 Attempting login for:', email);
    
    // Attempt Firebase authentication
    const result = await window.authManager.signIn(email, password);
    
    if (result && result.success && result.user) {
      console.log('✅ Login successful:', result.user.email, result.user.type);
      
      // Close modal
      closeLoginModal();
      
      // Clear form
      clearLoginForm();
      
      // Success message will be shown by auth state listener in main.js
    } else {
      console.warn('Login failed:', result);
      showMessage('שגיאה בהתחברות. אנא בדוק את הפרטים ונסה שוב.', 'error');
    }
    
  } catch (error) {
    console.error('❌ Login error:', error);
    
    // Show user-friendly error message
    let errorMessage = 'שגיאה בהתחברות. אנא נסה שוב.';
    
    if (error.message.includes('user-not-found') || error.message.includes('משתמש לא נמצא')) {
      errorMessage = 'משתמש לא נמצא. אנא בדוק את כתובת האימייל.';
    } else if (error.message.includes('wrong-password') || error.message.includes('סיסמה שגויה')) {
      errorMessage = 'סיסמה שגויה. אנא נסה שוב.';
    } else if (error.message.includes('invalid-email')) {
      errorMessage = 'כתובת אימייל לא תקינה.';
    } else if (error.message.includes('too-many-requests')) {
      errorMessage = 'יותר מדי ניסיונות. אנא המתן ונסה שוב מאוחר יותר.';
    }
    
    showMessage(errorMessage, 'error');
    
  } finally {
    // Restore button state
    const submitBtn = document.querySelector('#login-form button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'התחבר';
    }
  }
}

/**
 * Open login modal
 */
function openLoginModal() {
  const loginModal = document.getElementById('login-modal');
  if (loginModal) {
    loginModal.style.display = 'block';
    
    // Focus on email field
    const emailField = document.getElementById('login-email');
    if (emailField) {
      setTimeout(() => emailField.focus(), 100);
    }
  }
}

/**
 * Close login modal
 */
function closeLoginModal() {
  const loginModal = document.getElementById('login-modal');
  if (loginModal) {
    loginModal.style.display = 'none';
  }
}

/**
 * Clear login form
 */
function clearLoginForm() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.reset();
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Show message to user (assumes showMessage function exists globally)
 * @param {string} message - Message to show
 * @param {string} type - Message type ('success', 'error', 'info')
 */
function showMessage(message, type) {
  if (typeof window.showMessage === 'function') {
    window.showMessage(message, type);
  } else {
    // Fallback
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(message);
  }
}

// Export to global for compatibility
window.initializeLogin = initializeLogin;
