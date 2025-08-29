/**
 * Football Scouting Website - Authentication Integration
 * Connects the authentication system with the website UI
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize authentication
  initAuth();
});

/**
 * Initialize authentication functionality
 */
function initAuth() {
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
 * Update UI based on authentication status
 */
function updateAuthUI() {
  const currentUser = auth.getCurrentUser();
  const authButtons = document.querySelector('.auth-buttons');
  
  if (!authButtons) return;
  
  if (currentUser) {
    // User is logged in
    authButtons.innerHTML = createUserMenuHTML(currentUser);
    
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
    
    // Update navigation based on user type
    updateNavigationForUserType(currentUser.type);
  } else {
    // User is not logged in
    authButtons.innerHTML = `
      <button id="login-btn" class="btn">התחברות</button>
      <button id="register-btn" class="btn btn-primary">הרשמה</button>
    `;
    
    // Re-attach event listeners for login/register buttons
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        document.getElementById('login-modal').style.display = 'block';
      });
    }
    
    if (registerBtn) {
      registerBtn.addEventListener('click', () => {
        document.getElementById('register-modal').style.display = 'block';
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
      
      // Attempt login
      const result = auth.login(email, password);
      
      if (result.success) {
        // Close modal
        document.getElementById('login-modal').style.display = 'none';
        
        // Show success message
        showMessage(result.message, 'success');
        
        // Update UI
        updateAuthUI();
        
        // Redirect based on user type
        redirectAfterLogin(result.user);
      } else {
        // Show error message
        showMessage(result.message, 'error');
      }
    });
  }
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
      
      // Register player
      const result = auth.register(userData, 'player');
      
      if (result.success) {
        // Close modal
        document.getElementById('register-modal').style.display = 'none';
        
        // Show success message
        showMessage(result.message, 'success');
        
        // Update UI
        updateAuthUI();
        
        // Redirect to challenges page
        setTimeout(() => {
          window.location.href = 'pages/challenges.html';
        }, 1500);
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
      
      // Register scout
      const result = auth.register(userData, 'scout');
      
      if (result.success) {
        // Close modal
        document.getElementById('register-modal').style.display = 'none';
        
        // Show success message
        showMessage(result.message, 'success');
        
        // Update UI
        updateAuthUI();
        
        // Redirect to discover page
        setTimeout(() => {
          window.location.href = 'pages/discover.html';
        }, 1500);
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
      
      // Log out
      auth.logout();
      
      // Show message
      showMessage('התנתקת בהצלחה', 'success');
      
      // Update UI
      updateAuthUI();
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