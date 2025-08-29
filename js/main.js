/**
 * Football Scouting Website - Main JavaScript
 * Handles user interactions, form submissions, and dynamic content
 */

// Use strict mode for better error catching and performance
'use strict';

// Wait for the DOM to be fully loaded before executing code
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  initModals();
  initTabs();
  initMobileMenu();
  initTestimonialSlider();
  initFormSubmissions();
  initLeaderboards();
});

/**
 * Modal functionality
 * Handles opening and closing of login and registration modals
 */
function initModals() {
  // Get modal elements
  const loginModal = document.getElementById('login-modal');
  const registerModal = document.getElementById('register-modal');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const playerRegisterBtn = document.getElementById('player-register');
  const scoutRegisterBtn = document.getElementById('scout-register');
  const ctaRegisterBtn = document.getElementById('cta-register');
  const closeButtons = document.querySelectorAll('.close-modal');
  const switchToRegister = document.getElementById('switch-to-register');
  const switchToLogin = document.getElementById('switch-to-login');

  // Open login modal
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      loginModal.style.display = 'block';
    });
  }

  // Open register modal
  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      registerModal.style.display = 'block';
    });
  }

  // Open player registration
  if (playerRegisterBtn) {
    playerRegisterBtn.addEventListener('click', () => {
      registerModal.style.display = 'block';
      // Ensure player tab is active
      document.querySelector('[data-tab="player-tab"]').click();
    });
  }

  // Open scout registration
  if (scoutRegisterBtn) {
    scoutRegisterBtn.addEventListener('click', () => {
      registerModal.style.display = 'block';
      // Ensure scout tab is active
      document.querySelector('[data-tab="scout-tab"]').click();
    });
  }

  // CTA register button
  if (ctaRegisterBtn) {
    ctaRegisterBtn.addEventListener('click', () => {
      registerModal.style.display = 'block';
    });
  }

  // Close modals when clicking the X
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      loginModal.style.display = 'none';
      registerModal.style.display = 'none';
    });
  });

  // Close modals when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
      loginModal.style.display = 'none';
    }
    if (event.target === registerModal) {
      registerModal.style.display = 'none';
    }
  });

  // Switch between login and register
  if (switchToRegister) {
    switchToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      loginModal.style.display = 'none';
      registerModal.style.display = 'block';
    });
  }

  if (switchToLogin) {
    switchToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      registerModal.style.display = 'none';
      loginModal.style.display = 'block';
    });
  }
}

/**
 * Tab functionality
 * Handles switching between tabs in various sections
 */
function initTabs() {
  // Get all tab buttons
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Get the tab target
      const tabTarget = button.getAttribute('data-tab');
      
      // Get the parent container
      const tabContainer = button.closest('.leaderboards-tabs, .register-tabs');
      
      // Remove active class from all buttons in this container
      tabContainer.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Handle different tab containers
      if (tabContainer.classList.contains('leaderboards-tabs')) {
        // Leaderboard tabs
        const leaderboards = document.querySelectorAll('.leaderboard-content');
        leaderboards.forEach(board => {
          board.classList.remove('active');
        });
        document.getElementById(`${tabTarget}-leaderboard`).classList.add('active');
      } else if (tabContainer.classList.contains('register-tabs')) {
        // Registration tabs
        const registerContents = document.querySelectorAll('.register-content');
        registerContents.forEach(content => {
          content.classList.remove('active');
        });
        document.getElementById(tabTarget).classList.add('active');
      }
    });
  });
}

/**
 * Mobile Menu functionality
 * Handles the responsive mobile menu toggle
 */
function initMobileMenu() {
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  const authButtons = document.querySelector('.auth-buttons');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      // Toggle mobile menu visibility
      mainNav.classList.toggle('visible');
      authButtons.classList.toggle('visible');
      
      // Update aria-expanded attribute for accessibility
      const isExpanded = mainNav.classList.contains('visible');
      menuToggle.setAttribute('aria-expanded', isExpanded);
    });
  }
}

/**
 * Testimonial Slider functionality
 * Handles the testimonial slider navigation
 */
function initTestimonialSlider() {
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const testimonials = document.querySelectorAll('.testimonial');
  let currentIndex = 0;
  
  // Hide all testimonials except the first one
  if (testimonials.length > 1) {
    for (let i = 1; i < testimonials.length; i++) {
      testimonials[i].style.display = 'none';
    }
  }
  
  // Previous button click
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      testimonials[currentIndex].style.display = 'none';
      currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
      testimonials[currentIndex].style.display = 'block';
    });
  }
  
  // Next button click
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      testimonials[currentIndex].style.display = 'none';
      currentIndex = (currentIndex + 1) % testimonials.length;
      testimonials[currentIndex].style.display = 'block';
    });
  }
}

/**
 * Form Submissions
 * Handles form validation and submission
 */
function initFormSubmissions() {
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form values
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      // Simple validation
      if (!email || !password) {
        showMessage('יש למלא את כל השדות', 'error');
        return;
      }
      
      // In a real application, you would send this data to a server
      // For now, we'll simulate a successful login
      simulateLogin(email);
    });
  }
  
  // Player registration form
  const playerForm = document.getElementById('player-form');
  if (playerForm) {
    playerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form values
      const name = document.getElementById('player-name').value;
      const email = document.getElementById('player-email').value;
      const password = document.getElementById('player-password').value;
      const age = document.getElementById('player-age').value;
      const position = document.getElementById('player-position').value;
      const dominantFoot = document.querySelector('input[name="dominant-foot"]:checked').value;
      const level = document.getElementById('player-level').value;
      
      // Simple validation
      if (!name || !email || !password || !age || !position || !level) {
        showMessage('יש למלא את כל השדות', 'error');
        return;
      }
      
      // In a real application, you would send this data to a server
      // For now, we'll simulate a successful registration
      simulateRegistration('player', name, email);
    });
  }
  
  // Scout registration form
  const scoutForm = document.getElementById('scout-form');
  if (scoutForm) {
    scoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form values
      const name = document.getElementById('scout-name').value;
      const email = document.getElementById('scout-email').value;
      const password = document.getElementById('scout-password').value;
      const club = document.getElementById('scout-club').value;
      const position = document.getElementById('scout-position').value;
      
      // Simple validation
      if (!name || !email || !password || !club || !position) {
        showMessage('יש למלא את כל השדות', 'error');
        return;
      }
      
      // In a real application, you would send this data to a server
      // For now, we'll simulate a successful registration
      simulateRegistration('scout', name, email);
    });
  }
}

/**
 * Leaderboards functionality
 * Populates the leaderboards with mock data
 */
function initLeaderboards() {
  // Mock data for leaderboards
  const consistentPlayers = [
    { name: 'דני לוי', score: 28, position: 'חלוץ', age: 17 },
    { name: 'יוסי כהן', score: 26, position: 'קשר', age: 18 },
    { name: 'אבי גולן', score: 24, position: 'מגן', age: 16 },
    { name: 'משה דוד', score: 22, position: 'שוער', age: 19 },
    { name: 'עידן אלון', score: 20, position: 'חלוץ', age: 17 }
  ];
  
  const improvedPlayers = [
    { name: 'רועי שמש', score: 85, position: 'קשר', age: 16 },
    { name: 'אלון דגן', score: 78, position: 'מגן', age: 18 },
    { name: 'גיא לוי', score: 72, position: 'חלוץ', age: 17 },
    { name: 'עומר שלום', score: 68, position: 'שוער', age: 19 },
    { name: 'נדב כהן', score: 65, position: 'קשר', age: 18 }
  ];
  
  const rankedPlayers = [
    { name: 'אורי מלכה', score: 95, position: 'חלוץ', age: 18 },
    { name: 'יובל שמעון', score: 92, position: 'קשר', age: 17 },
    { name: 'איתי לוי', score: 90, position: 'מגן', age: 19 },
    { name: 'אמיר כהן', score: 88, position: 'קשר', age: 18 },
    { name: 'דור אברהם', score: 85, position: 'שוער', age: 17 }
  ];
  
  // Populate leaderboards
  populateLeaderboard('consistent-leaderboard', consistentPlayers, 'ימים רצופים');
  populateLeaderboard('improved-leaderboard', improvedPlayers, '% שיפור');
  populateLeaderboard('ranked-leaderboard', rankedPlayers, 'נקודות');
}

/**
 * Populates a leaderboard with player data
 * @param {string} id - The ID of the leaderboard element
 * @param {Array} players - Array of player objects
 * @param {string} scoreLabel - Label for the score column
 */
function populateLeaderboard(id, players, scoreLabel) {
  const leaderboard = document.getElementById(id);
  
  if (leaderboard) {
    // Clear placeholder
    leaderboard.innerHTML = '';
    
    // Create table
    const table = document.createElement('table');
    table.className = 'leaderboard-table';
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['דירוג', 'שם', 'עמדה', 'גיל', scoreLabel];
    
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    
    players.forEach((player, index) => {
      const row = document.createElement('tr');
      
      // Rank
      const rankCell = document.createElement('td');
      rankCell.textContent = index + 1;
      row.appendChild(rankCell);
      
      // Name
      const nameCell = document.createElement('td');
      nameCell.textContent = player.name;
      row.appendChild(nameCell);
      
      // Position
      const positionCell = document.createElement('td');
      positionCell.textContent = player.position;
      row.appendChild(positionCell);
      
      // Age
      const ageCell = document.createElement('td');
      ageCell.textContent = player.age;
      row.appendChild(ageCell);
      
      // Score
      const scoreCell = document.createElement('td');
      scoreCell.textContent = player.score;
      row.appendChild(scoreCell);
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    leaderboard.appendChild(table);
  }
}

/**
 * Simulates a login (for demo purposes)
 * @param {string} email - User's email
 */
function simulateLogin(email) {
  // Hide modal
  document.getElementById('login-modal').style.display = 'none';
  
  // Show success message
  showMessage(`ברוך הבא! התחברת בהצלחה עם ${email}`, 'success');
  
  // Update UI to show logged in state
  updateUIForLoggedInUser();
}

/**
 * Simulates a registration (for demo purposes)
 * @param {string} type - Type of user ('player' or 'scout')
 * @param {string} name - User's name
 * @param {string} email - User's email
 */
function simulateRegistration(type, name, email) {
  // Hide modal
  document.getElementById('register-modal').style.display = 'none';
  
  // Show success message
  const userType = type === 'player' ? 'שחקן' : 'סקאוט';
  showMessage(`ברוך הבא ${name}! נרשמת בהצלחה כ${userType}`, 'success');
  
  // If player, redirect to initial challenges
  if (type === 'player') {
    // In a real app, this would redirect to the challenges page
    setTimeout(() => {
      showMessage('מעביר אותך לאתגרים הראשוניים...', 'info');
    }, 2000);
  } else {
    // Update UI to show logged in state
    updateUIForLoggedInUser();
  }
}

/**
 * Updates the UI for a logged in user
 */
function updateUIForLoggedInUser() {
  const authButtons = document.querySelector('.auth-buttons');
  
  if (authButtons) {
    // Replace login/register buttons with user menu
    authButtons.innerHTML = `
      <div class="user-menu">
        <button class="btn user-menu-btn">החשבון שלי <i class="fas fa-user"></i></button>
        <div class="user-dropdown">
          <a href="pages/profile.html">הפרופיל שלי</a>
          <a href="pages/training.html">תוכנית האימון שלי</a>
          <a href="#" id="logout-btn">התנתק</a>
        </div>
      </div>
    `;
    
    // Add event listener for logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
      e.preventDefault();
      // In a real app, this would call a logout API
      location.reload(); // For demo, just reload the page
    });
    
    // Toggle user dropdown
    const userMenuBtn = document.querySelector('.user-menu-btn');
    const userDropdown = document.querySelector('.user-dropdown');
    
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