/**
 * Football Scouting Website - Main JavaScript
 * Handles user interactions, form submissions, and dynamic content
 */

// Use strict mode for better error catching and performance
'use strict';

// Storage keys for consistency
const STORAGE_KEYS = {
  CURRENT_USER: 'currentUser',
  SESSION_USER: 'sessionUser'
};

// Global user data
let currentUserData = null;

// Wait for the DOM to be fully loaded before executing code
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication first
  checkAuthenticationState();
  
  // Initialize all components
  initModals();
  initTabs();
  initMobileMenu();
  initTestimonialSlider();
  initFormSubmissions();
  initLeaderboards();
});

/**
 * Check authentication state and update UI accordingly
 */
async function checkAuthenticationState() {
  try {
    // Check for user data in storage (immediate check)
    const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    const sessionUser = sessionStorage.getItem(STORAGE_KEYS.SESSION_USER);
    
    if (storedUser || sessionUser) {
      currentUserData = JSON.parse(storedUser || sessionUser);
      console.log('Found stored user data:', currentUserData);
      updateUIForAuthenticatedUser(currentUserData);
      return;
    }

    // Check URL parameters for auth data
    const urlParams = new URLSearchParams(window.location.search);
    const authData = urlParams.get('auth');
    
    if (authData) {
      try {
        currentUserData = JSON.parse(decodeURIComponent(authData));
        console.log('Found auth data in URL:', currentUserData);
        
        // Store in sessionStorage for this session
        sessionStorage.setItem(STORAGE_KEYS.SESSION_USER, JSON.stringify(currentUserData));
        
        // Clean URL
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        updateUIForAuthenticatedUser(currentUserData);
        return;
      } catch (e) {
        console.error('Error parsing auth data from URL:', e);
      }
    }

    // Try Firebase auth if available
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          // User is signed in via Firebase
          loadUserDataFromFirebase(user.uid);
        } else {
          // No user signed in - show default UI
          updateUIForGuestUser();
        }
      });
    } else {
      // No Firebase available - show default UI
      updateUIForGuestUser();
    }
    
  } catch (error) {
    console.error('Error checking authentication state:', error);
    updateUIForGuestUser();
  }
}

/**
 * Load user data from Firebase
 */
async function loadUserDataFromFirebase(uid) {
  try {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      const db = firebase.firestore();
      const userDoc = await db.collection('users').doc(uid).get();
      
      if (userDoc.exists) {
        currentUserData = { uid, ...userDoc.data() };
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUserData));
        updateUIForAuthenticatedUser(currentUserData);
      } else {
        console.log('No user document found');
        updateUIForGuestUser();
      }
    }
  } catch (error) {
    console.error('Error loading user data from Firebase:', error);
    updateUIForGuestUser();
  }
}

/**
 * Update UI for authenticated users
 */
function updateUIForAuthenticatedUser(userData) {
  console.log('Updating UI for authenticated user:', userData);
  
  // Hide auth loading overlay
  const authOverlay = document.getElementById('auth-loading-overlay');
  if (authOverlay) {
    authOverlay.style.display = 'none';
  }
  
  // Remove auth-loading class from body
  document.body.classList.remove('auth-loading');
  
  // Update header
  updateHeaderForAuthenticatedUser(userData);
  
  // Show personalized content
  showPersonalizedContent(userData);
  
  // Hide guest content
  hideGuestContent();
}

/**
 * Update UI for guest users
 */
function updateUIForGuestUser() {
  console.log('Updating UI for guest user');
  
  // Hide auth loading overlay
  const authOverlay = document.getElementById('auth-loading-overlay');
  if (authOverlay) {
    authOverlay.style.display = 'none';
  }
  
  // Remove auth-loading class from body
  document.body.classList.remove('auth-loading');
  
  // Show guest content
  showGuestContent();
  
  // Hide personalized content
  hidePersonalizedContent();
}

/**
 * Update header for authenticated users
 */
function updateHeaderForAuthenticatedUser(userData) {
  const authButtons = document.querySelector('.auth-buttons');
  
  if (authButtons) {
    // Create navigation URL with auth data
    const createNavURL = (path) => {
      const authParam = encodeURIComponent(JSON.stringify(userData));
      return `${path}?auth=${authParam}`;
    };
    
    // Replace login/register buttons with user menu
    authButtons.innerHTML = `
      <div class="user-menu">
        <button class="btn user-menu-btn">${userData.name || 'החשבון שלי'} <i class="fas fa-user"></i></button>
        <div class="user-dropdown">
          <a href="${createNavURL('pages/profile.html')}">הפרופיל שלי</a>
          <a href="${createNavURL('pages/training.html')}">תוכנית האימון שלי</a>
          <a href="${createNavURL('pages/challenges.html')}">אתגרים</a>
          <a href="${createNavURL('pages/watchlist.html')}">רשימת המעקב</a>
          <a href="#" id="logout-btn">התנתק</a>
        </div>
      </div>
    `;
    
    // Add event listener for logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    }
    
    // Toggle user dropdown
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
}

/**
 * Show personalized content for authenticated users
 */
function showPersonalizedContent(userData) {
  // Create personalized hero section
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const container = heroSection.querySelector('.container');
    if (container) {
      container.innerHTML = `
        <div class="hero-content authenticated">
          <h2>שלום ${userData.name || 'חבר'}!</h2>
          <p class="user-type-badge">${getUserTypeBadge(userData.type)}</p>
          <div class="user-stats">
            <div class="stat-item">
              <i class="fas fa-calendar-check"></i>
              <span>אימונים השבוע: ${userData.weeklyTrainings || 0}</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-trophy"></i>
              <span>נקודות: ${userData.points || 0}</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-target"></i>
              <span>אתגרים הושלמו: ${userData.completedChallenges || 0}</span>
            </div>
          </div>
          <div class="quick-actions">
            <a href="pages/training.html?auth=${encodeURIComponent(JSON.stringify(userData))}" class="btn btn-primary">
              <i class="fas fa-dumbbell"></i> המשך אימון
            </a>
            <a href="pages/challenges.html?auth=${encodeURIComponent(JSON.stringify(userData))}" class="btn btn-secondary">
              <i class="fas fa-tasks"></i> אתגרים חדשים
            </a>
          </div>
        </div>
        <div class="hero-image authenticated">
          <div class="progress-circle">
            <div class="progress-text">
              <span class="progress-number">${userData.weeklyProgress || 0}%</span>
              <span class="progress-label">השבוע</span>
            </div>
          </div>
        </div>
      `;
    }
  }

  // Show upcoming sessions section
  showUpcomingSessions(userData);
  
  // Show recent activity
  showRecentActivity(userData);
}

/**
 * Show upcoming training sessions
 */
function showUpcomingSessions(userData) {
  // Find or create upcoming sessions section
  let upcomingSection = document.querySelector('.upcoming-sessions');
  
  if (!upcomingSection) {
    // Create the section after hero
    const heroSection = document.querySelector('.hero');
    upcomingSection = document.createElement('section');
    upcomingSection.className = 'upcoming-sessions';
    
    if (heroSection && heroSection.nextElementSibling) {
      heroSection.parentNode.insertBefore(upcomingSection, heroSection.nextElementSibling);
    } else if (heroSection) {
      heroSection.parentNode.appendChild(upcomingSection);
    }
  }
  
  // Get upcoming sessions based on user type
  const sessions = getUpcomingSessions(userData);
  
  upcomingSection.innerHTML = `
    <div class="container">
      <h2 class="section-title">האימונים הקרובים שלך</h2>
      <div class="sessions-grid">
        ${sessions.map(session => `
          <div class="session-card">
            <div class="session-header">
              <h3>${session.title}</h3>
              <span class="session-type ${session.type}">${session.typeLabel}</span>
            </div>
            <div class="session-details">
              <div class="session-time">
                <i class="fas fa-clock"></i>
                <span>${session.time}</span>
              </div>
              <div class="session-duration">
                <i class="fas fa-hourglass-half"></i>
                <span>${session.duration} דקות</span>
              </div>
              <div class="session-difficulty">
                <i class="fas fa-signal"></i>
                <span>רמה: ${session.difficulty}</span>
              </div>
            </div>
            <div class="session-actions">
              <button class="btn btn-primary btn-small" onclick="startSession('${session.id}')">
                התחל עכשיו
              </button>
              <button class="btn btn-secondary btn-small" onclick="viewSession('${session.id}')">
                פרטים
              </button>
            </div>
          </div>
        `).join('')}
      </div>
      ${sessions.length === 0 ? '<p class="no-sessions">אין אימונים מתוכננים כרגע. <a href="pages/training.html">צפה בתוכניות אימון זמינות</a></p>' : ''}
    </div>
  `;
}

/**
 * Show recent activity
 */
function showRecentActivity(userData) {
  // Find or create recent activity section
  let activitySection = document.querySelector('.recent-activity');
  
  if (!activitySection) {
    // Create the section
    const upcomingSection = document.querySelector('.upcoming-sessions');
    activitySection = document.createElement('section');
    activitySection.className = 'recent-activity';
    
    if (upcomingSection && upcomingSection.nextElementSibling) {
      upcomingSection.parentNode.insertBefore(activitySection, upcomingSection.nextElementSibling);
    } else if (upcomingSection) {
      upcomingSection.parentNode.appendChild(activitySection);
    }
  }
  
  const activities = getRecentActivities(userData);
  
  activitySection.innerHTML = `
    <div class="container">
      <h2 class="section-title">פעילות אחרונה</h2>
      <div class="activity-list">
        ${activities.map(activity => `
          <div class="activity-item">
            <div class="activity-icon ${activity.type}">
              <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
              <h4>${activity.title}</h4>
              <p>${activity.description}</p>
              <span class="activity-time">${activity.time}</span>
            </div>
            <div class="activity-score">
              ${activity.score ? `<span class="score">+${activity.score}</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Get upcoming sessions based on user data
 */
function getUpcomingSessions(userData) {
  // Mock data - in real app this would come from API
  const baseSessions = [
    {
      id: 'session1',
      title: 'אימון כושר בסיסי',
      type: 'fitness',
      typeLabel: 'כושר',
      time: 'היום 18:00',
      duration: 45,
      difficulty: 'בינונית'
    },
    {
      id: 'session2',
      title: 'תרגילי כדרור',
      type: 'technical',
      typeLabel: 'טכני',
      time: 'מחר 16:30',
      duration: 60,
      difficulty: 'קשה'
    },
    {
      id: 'session3',
      title: 'אימון קבוצתי',
      type: 'team',
      typeLabel: 'קבוצתי',
      time: 'יום ג\' 19:00',
      duration: 90,
      difficulty: 'בינונית'
    }
  ];
  
  // Filter based on user type and level
  return baseSessions.filter(session => {
    if (userData.type === 'scout') {
      // Scouts might have different session types
      return session.type === 'team';
    }
    return true;
  });
}

/**
 * Get recent activities based on user data
 */
function getRecentActivities(userData) {
  // Mock data - in real app this would come from API
  return [
    {
      type: 'training',
      icon: 'fas fa-dumbbell',
      title: 'השלמת אימון כושר',
      description: 'אימון כושר בסיסי - 45 דקות',
      time: 'לפני 2 שעות',
      score: 15
    },
    {
      type: 'challenge',
      icon: 'fas fa-trophy',
      title: 'אתגר הושלם',
      description: 'אתגר דיוק בבעיטות - 8/10 מטרות',
      time: 'אתמול',
      score: 25
    },
    {
      type: 'achievement',
      icon: 'fas fa-medal',
      title: 'הישג חדש!',
      description: 'עלית לרמה 5 באימוני כושר',
      time: 'לפני 3 ימים',
      score: null
    }
  ];
}

/**
 * Get user type badge text
 */
function getUserTypeBadge(type) {
  switch (type) {
    case 'player':
      return 'שחקן';
    case 'scout':
      return 'סקאוט';
    case 'admin':
      return 'מנהל';
    default:
      return 'משתמש';
  }
}

/**
 * Hide guest content sections
 */
function hideGuestContent() {
  const guestSections = [
    '.features',
    '.testimonials',
    '.cta'
  ];
  
  guestSections.forEach(selector => {
    const section = document.querySelector(selector);
    if (section) {
      section.style.display = 'none';
    }
  });
}

/**
 * Show guest content sections
 */
function showGuestContent() {
  const guestSections = [
    '.features',
    '.testimonials',
    '.cta'
  ];
  
  guestSections.forEach(selector => {
    const section = document.querySelector(selector);
    if (section) {
      section.style.display = 'block';
    }
  });
}

/**
 * Hide personalized content sections
 */
function hidePersonalizedContent() {
  const personalizedSections = [
    '.upcoming-sessions',
    '.recent-activity'
  ];
  
  personalizedSections.forEach(selector => {
    const section = document.querySelector(selector);
    if (section) {
      section.style.display = 'none';
    }
  });
}

/**
 * Logout function
 */
function logout() {
  // Clear stored data
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  sessionStorage.removeItem(STORAGE_KEYS.SESSION_USER);
  
  // Sign out from Firebase if available
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().signOut();
  }
  
  // Reset global user data
  currentUserData = null;
  
  // Reload page to reset UI
  window.location.reload();
}

/**
 * Session action functions
 */
function startSession(sessionId) {
  if (currentUserData) {
    const authParam = encodeURIComponent(JSON.stringify(currentUserData));
    window.location.href = `pages/training.html?auth=${authParam}&session=${sessionId}`;
  }
}

function viewSession(sessionId) {
  if (currentUserData) {
    const authParam = encodeURIComponent(JSON.stringify(currentUserData));
    window.location.href = `pages/training.html?auth=${authParam}&view=${sessionId}`;
  }
}

/**
 * Modal functionality
 * Handles opening and closing of login and registration modals
 */
/**
 * Initialize and show multi-stage registration modal
 * @param {string} userType - Optional user type to pre-select ('player' or 'scout')
 */
function showMultiStageRegistration(userType = null) {
  // Ensure the multi-stage modal exists, create it if it doesn't
  let multiStageModal = document.getElementById('multi-stage-modal');
  if (!multiStageModal) {
    createMultiStageModal();
    multiStageModal = document.getElementById('multi-stage-modal');
  }
  
  if (multiStageModal) {
    multiStageModal.style.display = 'block';
    
    // Initialize the multi-stage registration component
    const container = document.getElementById('multi-stage-registration-container');
    if (container) {
      // Clear any existing content
      container.innerHTML = '';
      
      // Create new MultiStageRegistration instance
      import('../components/multi-stage-registration.js').then(module => {
        const MultiStageRegistration = module.default;
        const multiStageRegistration = new MultiStageRegistration('multi-stage-registration-container');
        
        // Set user type if provided
        if (userType) {
          multiStageRegistration.userData.type = userType;
        }
        
        // Start from the first stage
        multiStageRegistration.currentStage = 0;
        multiStageRegistration.render();
      });
    }
  }
}

function initModals() {
  // Get modal elements
  const loginModal = document.getElementById('login-modal');
  const multiStageModal = document.getElementById('multi-stage-modal');
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
      showMultiStageRegistration();
    });
  }

  // Open player registration
  if (playerRegisterBtn) {
    playerRegisterBtn.addEventListener('click', () => {
      showMultiStageRegistration('player');
    });
  }

  // Open scout registration
  if (scoutRegisterBtn) {
    scoutRegisterBtn.addEventListener('click', () => {
      showMultiStageRegistration('scout');
    });
  }

  // CTA register button
  if (ctaRegisterBtn) {
    ctaRegisterBtn.addEventListener('click', () => {
      showMultiStageRegistration();
    });
  }

  // Close modals when clicking the X
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (loginModal) loginModal.style.display = 'none';
      if (multiStageModal) multiStageModal.style.display = 'none';
    });
  });

  // Close modals when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
      loginModal.style.display = 'none';
    }
    if (event.target === multiStageModal) {
      multiStageModal.style.display = 'none';
    }
  });

  // Switch between login and register
  if (switchToRegister) {
    switchToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      if (loginModal) loginModal.style.display = 'none';
      showMultiStageRegistration();
    });
  }

  if (switchToLogin) {
    switchToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      const multiStageModal = document.getElementById('multi-stage-modal');
      if (multiStageModal) multiStageModal.style.display = 'none';
      if (loginModal) loginModal.style.display = 'block';
    });
  }
}

/**
 * Create a modal for the multi-stage registration component
 */
function createMultiStageModal() {
  // Create modal element
  const multiStageModal = document.createElement('div');
  multiStageModal.className = 'modal';
  multiStageModal.id = 'multi-stage-modal';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  // Create close button
  const closeButton = document.createElement('span');
  closeButton.className = 'close-modal';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', () => {
    multiStageModal.style.display = 'none';
  });
  
  // Create title
  const title = document.createElement('h2');
  title.textContent = 'הרשמה';
  
  // Create container for multi-stage registration
  const registrationContainer = document.createElement('div');
  registrationContainer.id = 'multi-stage-registration-container';
  
  // Assemble modal
  modalContent.appendChild(closeButton);
  modalContent.appendChild(title);
  modalContent.appendChild(registrationContainer);
  multiStageModal.appendChild(modalContent);
  
  // Add modal to the document
  document.body.appendChild(multiStageModal);
  
  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === multiStageModal) {
      multiStageModal.style.display = 'none';
    }
  });
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
  const multiStageModal = document.getElementById('multi-stage-modal');
  if (multiStageModal) {
    multiStageModal.style.display = 'none';
  }
  
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

// Expose global functions for reuse across components
window.showMessage = showMessage;
window.updateUIForLoggedInUser = updateUIForLoggedInUser;
window.showMultiStageRegistration = showMultiStageRegistration;