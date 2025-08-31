/**
 * Football Scouting Website - Authentication Integration
 * Connects the authentication system with the website UI
 */

'use strict';

// Import the authentication system
import firebaseAuth from './firebase-auth.js';

// Make auth available globally for compatibility
window.firebaseAuth = firebaseAuth;

document.addEventListener('DOMContentLoaded', () => {
  // Check if we have cached auth state from previous page load
  const cachedAuthState = getCachedAuthState();
  
  if (cachedAuthState !== null) {
    // We have cached auth state, use it immediately and hide loading
    console.log('Using cached auth state:', cachedAuthState ? 'User logged in' : 'User logged out');
    hideLoadingOverlay();
    
    // Still initialize Firebase auth to get real-time updates, but don't wait for it
    if (typeof firebase !== 'undefined' && firebase.auth) {
      initAuth();
    } else {
      setTimeout(() => {
        if (typeof firebase !== 'undefined' && firebase.auth) {
          initAuth();
        }
      }, 100);
    }
  } else {
    // No cached auth state, wait for Firebase to determine it
    const fallbackTimeout = setTimeout(() => {
      console.warn('Firebase auth initialization timeout - hiding loading overlay as fallback');
      hideLoadingOverlay();
    }, 3000); // 3 second timeout
    
    // Wait for Firebase to be ready before initializing auth
    if (typeof firebase !== 'undefined' && firebase.auth) {
      clearTimeout(fallbackTimeout);
      initAuth();
    } else {
      setTimeout(() => {
        if (typeof firebase !== 'undefined' && firebase.auth) {
          clearTimeout(fallbackTimeout);
          initAuth();
        }
      }, 100);
    }
  }
  
  // Listen for auth state changes
  document.addEventListener('authStateChanged', (e) => {
    const user = e.detail.user;
    console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
    
    // Update UI when auth state changes
    updateAuthUI();
    
    if (user) {
      // User is logged in
      if (window.showMessage) {
        window.showMessage('התחברת בהצלחה', 'success');
      }
    }
  });
});

/**
 * Get cached authentication state from localStorage
 * @returns {boolean|null} - true if logged in, false if logged out, null if unknown
 */
function getCachedAuthState() {
  try {
    const cached = localStorage.getItem('authState');
    return cached !== null ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error reading cached auth state:', error);
    return null;
  }
}

/**
 * Cache authentication state in localStorage
 * @param {boolean} isLoggedIn - Whether user is logged in
 */
function setCachedAuthState(isLoggedIn) {
  try {
    localStorage.setItem('authState', JSON.stringify(isLoggedIn));
  } catch (error) {
    console.error('Error caching auth state:', error);
  }
}

/**
 * Initialize authentication functionality
 */
function initAuth() {
  // Set up Firebase auth state listener
  firebase.auth().onAuthStateChanged((user) => {
    const isLoggedIn = !!user;
    console.log('Firebase auth state changed:', isLoggedIn ? 'User logged in' : 'User logged out');
    
    // Cache the auth state for future page loads
    setCachedAuthState(isLoggedIn);
    
    // Update UI immediately when auth state changes
    updateAuthUI();
    
    // Hide loading overlay and show page content (only if not already hidden)
    hideLoadingOverlay();
  });
  
  // Check if user is logged in and update UI
  updateAuthUI();
  
  // Set up login form
  setupLoginForm();
  
  // Set up registration forms
  setupPlayerRegistrationForm();
  setupScoutRegistrationForm();
  
  // Set up logout functionality
  setupLogout();
}

/**
 * Hide the loading overlay and show page content
 */
function hideLoadingOverlay() {
  const overlay = document.getElementById('auth-loading-overlay');
  const body = document.body;
  
  // Only hide if not already hidden
  if (overlay && body && body.classList.contains('auth-loading')) {
    // Add fade-out class to overlay
    overlay.classList.add('fade-out');
    
    // Remove auth-loading class and add auth-ready class to body
    body.classList.remove('auth-loading');
    body.classList.add('auth-ready');
    
    // Remove overlay from DOM after transition
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300); // Match CSS transition duration
  }
}

/**
 * Update UI based on authentication status
 */
function updateAuthUI() {
  // Check both firebaseAuth.getCurrentUser() and Firebase auth directly
  const currentUser = firebaseAuth.getCurrentUser();
  const firebaseUser = firebase.auth().currentUser;
  const authButtons = document.querySelector('.auth-buttons');
  
  if (!authButtons) return;
  
  // User is considered logged in if either method returns a user
  if (currentUser || firebaseUser) {
    const user = currentUser || firebaseUser;
    // User is logged in - use the global updateUIForLoggedInUser if available
    if (window.updateUIForLoggedInUser) {
      window.updateUIForLoggedInUser();
    } else {
      // Fallback to local implementation
      // If we only have firebaseUser, create a basic user object
      const userForMenu = currentUser || {
        name: firebaseUser.displayName || firebaseUser.email,
        email: firebaseUser.email,
        type: 'player' // Default type, will be updated when full user data loads
      };
      authButtons.innerHTML = createUserMenuHTML(userForMenu);
      
      // Set up user menu dropdown
      const userMenuBtn = document.querySelector('.user-menu-btn');
      const userDropdown = document.querySelector('.user-dropdown');
      
      if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', () => {
          userDropdown.classList.toggle('visible');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
          if (!e.target.closest('.user-menu')) {
            userDropdown.classList.remove('visible');
          }
        });
      }
    }
    
    // Update navigation based on user type
    if (currentUser && currentUser.type) {
      updateNavigationForUserType(currentUser.type);
    }
  } else {
    // User is not logged in
    authButtons.innerHTML = `
      <button id="login-btn" class="btn">התחברות</button>
      <button id="register-btn" class="btn btn-primary">הרשמה</button>
    `;
    
    // Re-attach event listeners for login/register buttons using global function if available
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
          loginModal.style.display = 'block';
        }
      });
    }
    
    if (registerBtn) {
      registerBtn.addEventListener('click', () => {
        // Use global registration function if available
        if (window.showMultiStageRegistration) {
          window.showMultiStageRegistration();
        } else {
          const registerModal = document.getElementById('register-modal');
          if (registerModal) {
            registerModal.style.display = 'block';
          }
        }
      });
    }
  }
}

/**
 * Create HTML for user menu
 * @param {Object} user - User object
 * @returns {string} - HTML for user menu
 */
function createUserMenuHTML(user) {
  const userTypeText = user.type === 'player' ? 'שחקן' : user.type === 'scout' ? 'סקאוט' : 'מנהל';
  
  let profileLink = 'pages/profile.html';
  let dashboardLink = '';
  
  if (user.type === 'player') {
    dashboardLink = `<a href="pages/training.html">תוכנית האימון שלי</a>`;
  } else if (user.type === 'scout') {
    dashboardLink = `<a href="pages/watchlist.html">רשימת המעקב שלי</a>`;
  } else if (user.type === 'admin') {
    dashboardLink = `<a href="admin/dashboard.html">לוח בקרה</a>`;
  }
  
  return `
    <div class="user-menu">
      <button class="btn user-menu-btn">${user.name} <i class="fas fa-user"></i></button>
      <div class="user-dropdown">
        <div class="user-info">
          <p>${userTypeText}</p>
        </div>
        <a href="${profileLink}">הפרופיל שלי</a>
        ${dashboardLink}
        <a href="#" id="logout-btn">התנתק</a>
      </div>
    </div>
  `;
}

/**
 * Update navigation based on user type
 * @param {string} userType - Type of user
 */
function updateNavigationForUserType(userType) {
  const mainNav = document.querySelector('.main-nav ul');
  
  if (!mainNav) return;
  
  // Add type-specific navigation items
  if (userType === 'player') {
    // Check if player-specific items already exist
    if (!document.querySelector('[data-nav="player-challenges"]')) {
      mainNav.innerHTML += `
        <li><a href="pages/challenges.html" data-nav="player-challenges">האתגרים שלי</a></li>
      `;
    }
  } else if (userType === 'scout') {
    // Check if scout-specific items already exist
    if (!document.querySelector('[data-nav="scout-players"]')) {
      mainNav.innerHTML += `
        <li><a href="pages/discover.html" data-nav="scout-players">גלה שחקנים</a></li>
      `;
    }
  } else if (userType === 'admin') {
    // Check if admin-specific items already exist
    if (!document.querySelector('[data-nav="admin"]')) {
      mainNav.innerHTML += `
        <li><a href="admin/dashboard.html" data-nav="admin">ניהול</a></li>
      `;
    }
  }
}

/**
 * Set up login form
 */
function setupLoginForm() {
  const loginForm = document.getElementById('login-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form values
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      // Validate form
      if (!email || !password) {
        showMessage('יש למלא את כל השדות', 'error');
        return;
      }
      
      // Show loading message
      showMessage('מתחבר...', 'info');
      
      // Attempt login using Firebase Auth
      firebaseAuth.login(email, password)
        .then(result => {
          if (result.success) {
            // Close modal
            const loginModal = document.getElementById('login-modal');
            if (loginModal) {
              loginModal.style.display = 'none';
            }
            
            // Show success message
            if (window.showMessage) {
              window.showMessage(result.message, 'success');
            }
          } else {
            // Show error message
            if (window.showMessage) {
              window.showMessage(result.message, 'error');
            }
          }
        })
        .catch(error => {
          console.error('Login error:', error);
          if (window.showMessage) {
            window.showMessage(error.message || 'שגיאה בהתחברות', 'error');
          }
        });
    });
  }
  
  // Listen for auth state changes
  document.addEventListener('authStateChanged', (e) => {
    const user = e.detail.user;
    
    if (user) {
      // User is logged in
      showMessage('התחברת בהצלחה', 'success');
      
      // Update UI
      updateAuthUI();
      
      // Redirect based on user type
      redirectAfterLogin(user);
    }
  });
}

/**
 * Set up player registration form
 */
function setupPlayerRegistrationForm() {
  const playerForm = document.getElementById('player-form');
  
  if (playerForm) {
    playerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form values
      const userData = {
        name: document.getElementById('player-name').value,
        email: document.getElementById('player-email').value,
        password: document.getElementById('player-password').value,
        age: document.getElementById('player-age').value,
        position: document.getElementById('player-position').value,
        dominantFoot: document.querySelector('input[name="dominant-foot"]:checked').value,
        level: document.getElementById('player-level').value
      };
      
      // Validate form
      if (!userData.name || !userData.email || !userData.password ||
          !userData.age || !userData.position || !userData.level) {
        showMessage('יש למלא את כל השדות', 'error');
        return;
      }
      
      // Show loading message
      showMessage('יוצר חשבון...', 'info');
      
      // Register player
      const result = auth.register(userData, 'player');
      
      if (result.success) {
        // Close modal
        document.getElementById('register-modal').style.display = 'none';
      } else {
        // Show error message
        showMessage(result.message, 'error');
      }
    });
  }
}

/**
 * Set up scout registration form
 */
function setupScoutRegistrationForm() {
  const scoutForm = document.getElementById('scout-form');
  
  if (scoutForm) {
    scoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form values
      const userData = {
        name: document.getElementById('scout-name').value,
        email: document.getElementById('scout-email').value,
        password: document.getElementById('scout-password').value,
        club: document.getElementById('scout-club').value,
        position: document.getElementById('scout-position').value
      };
      
      // Validate form
      if (!userData.name || !userData.email || !userData.password ||
          !userData.club || !userData.position) {
        showMessage('יש למלא את כל השדות', 'error');
        return;
      }
      
      // Show loading message
      showMessage('יוצר חשבון...', 'info');
      
      // Register scout
      const result = auth.register(userData, 'scout');
      
      if (result.success) {
        // Close modal
        document.getElementById('register-modal').style.display = 'none';
      } else {
        // Show error message
        showMessage(result.message, 'error');
      }
    });
  }
}

/**
 * Set up logout functionality
 */
function setupLogout() {
  // We need to use event delegation since the logout button
  // is dynamically added to the DOM
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'logout-btn') {
      e.preventDefault();
      
      // Log out using Firebase Auth
      firebaseAuth.logout()
        .then(result => {
          // Clear cached auth state
          setCachedAuthState(false);
          
          // Show message
          if (window.showMessage) {
            window.showMessage(result.message, 'success');
          }
          
          // Update UI
          updateAuthUI();
        })
        .catch(error => {
          console.error('Logout error:', error);
          if (window.showMessage) {
            window.showMessage('שגיאה בהתנתקות', 'error');
          }
        });
    }
  });
}

/**
 * Redirect user after login based on user type
 * @param {Object} user - User object
 */
function redirectAfterLogin(user) {
  if (user.type === 'player') {
    // Check if player has completed initial challenges
    if (user.challenges && user.challenges.initial && user.challenges.initial.completed) {
      // Redirect to training program
      setTimeout(() => {
        window.location.href = 'pages/training.html';
      }, 1500);
    } else {
      // Redirect to initial challenges
      setTimeout(() => {
        window.location.href = 'pages/challenges.html';
      }, 1500);
    }
  } else if (user.type === 'scout') {
    // Redirect to discover page
    setTimeout(() => {
      window.location.href = 'pages/discover.html';
    }, 1500);
  } else if (user.type === 'admin') {
    // Redirect to admin dashboard
    setTimeout(() => {
      window.location.href = 'admin/dashboard.html';
    }, 1500);
  }
}

/**
 * Shows a message to the user
 * @param {string} message - The message to display
 * @param {string} type - Message type ('success', 'error', 'info')
 */
function showMessage(message, type = 'info') {
  // Check if a message container already exists
  let messageContainer = document.querySelector('.message-container');
  
  // If not, create one
  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.className = 'message-container';
    document.body.appendChild(messageContainer);
  }
  
  // Create message element
  const messageElement = document.createElement('div');
  messageElement.className = `message message-${type}`;
  messageElement.textContent = message;
  
  // Add close button
  const closeBtn = document.createElement('span');
  closeBtn.className = 'message-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => {
    messageElement.remove();
  });
  
  messageElement.appendChild(closeBtn);
  messageContainer.appendChild(messageElement);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    messageElement.remove();
  }, 5000);
}