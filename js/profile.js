/**
 * Football Scouting Website - Profile Page JavaScript
 * Optimized version with auth object passing between components
 */

'use strict';

console.log('Profile.js script loaded!');

// Import Firebase services
import { auth as firebaseAuthService, db } from '../config/firebase.js';

console.log('Firebase imports loaded:', { firebaseAuthService, db });

// Constants
const STORAGE_KEYS = {
  CURRENT_USER: 'footballScout_currentUser',
  SESSION_USER: 'footballScout_sessionUser' // For faster component switching
};
const COLLECTIONS = { USERS: 'users' };
const USER_TYPES = { PLAYER: 'player', SCOUT: 'scout', ADMIN: 'admin' };

// Translation maps
const TRANSLATIONS = {
  userTypes: {
    player: 'שחקן',
    scout: 'סקאוט', 
    admin: 'מנהל'
  },
  positions: {
    goalkeeper: 'שוער',
    defender: 'מגן',
    midfielder: 'קשר',
    forward: 'חלוץ'
  },
  levels: {
    beginner: 'מתחיל',
    intermediate: 'בינוני',
    advanced: 'מתקדם'
  },
  feet: {
    right: 'ימין',
    left: 'שמאל',
    both: 'שתיהן'
  },
  statuses: {
    pending: 'בבדיקה',
    approved: 'אושר',
    rejected: 'נדחה'
  },
  challenges: {
    1: 'אתגר 1: שליטה בכדור',
    2: 'אתגר 2: כדרור',
    3: 'אתגר 3: בעיטות'
  },
  activityIcons: {
    registration: 'fas fa-user-plus',
    challenge: 'fas fa-trophy',
    video: 'fas fa-video',
    training: 'fas fa-dumbbell'
  }
};

// Global state
let currentUserData = null;

// Utility functions
const utils = {
  // Get user from localStorage (persistent)
  getStoredUser: () => {
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
  },

  // Get user from sessionStorage (for fast component switching)
  getSessionUser: () => {
    const userJson = sessionStorage.getItem(STORAGE_KEYS.SESSION_USER);
    return userJson ? JSON.parse(userJson) : null;
  },

  // Store user in both localStorage and sessionStorage
  storeUser: (userData) => {
    const userJson = JSON.stringify(userData);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userJson);
    sessionStorage.setItem(STORAGE_KEYS.SESSION_USER, userJson);
  },

  // Check URL parameters for passed auth data
  getAuthFromURL: () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authData = urlParams.get('auth');
    if (authData) {
      try {
        return JSON.parse(decodeURIComponent(authData));
      } catch (error) {
        console.error('Error parsing auth data from URL:', error);
      }
    }
    return null;
  },

  // Get user data from Firestore (fallback only)
  getUserData: async (uid) => {
    try {
      const doc = await db.collection(COLLECTIONS.USERS).doc(uid).get();
      if (doc.exists) {
        const userData = doc.data();
        userData.id = doc.id;
        return userData;
      }
      throw new Error('User not found');
    } catch (error) {
      throw new Error(`Error getting user data: ${error.message}`);
    }
  },

  // Create navigation URL - no auth parameters needed with session system
  createNavURL: (path, userData = currentUserData) => {
    return path; // Session-based auth eliminates need for URL parameters
  },

  // Translation helper
  translate: (category, key) => TRANSLATIONS[category]?.[key] || key,

  // Format date helper
  formatDate: (timestamp) => {
    if (!timestamp) return 'לא זמין';
    
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else {
      return 'לא זמין';
    }
    
    return date.toLocaleDateString('he-IL');
  },

  // DOM helper
  updateElement: (selector, content) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = content;
  },

  // Show/hide element helper
  toggleElement: (selector, show) => {
    const element = document.querySelector(selector);
    if (element) element.style.display = show ? 'block' : 'none';
  }
};

// Authentication manager
const authManager = {
  // Get user data immediately (priority order: URL -> sessionStorage -> localStorage -> Firebase)
  getUserDataImmediate: () => {
    console.log('Getting user data with priority order...');
    
    // 1. Check URL parameters first (highest priority - passed from other components)
    const urlAuth = utils.getAuthFromURL();
    if (urlAuth) {
      console.log('Found auth data in URL:', urlAuth);
      currentUserData = urlAuth;
      utils.storeUser(urlAuth); // Store for future use
      return Promise.resolve(urlAuth);
    }
    
    // 2. Check sessionStorage (fast component switching)
    const sessionUser = utils.getSessionUser();
    if (sessionUser) {
      console.log('Found user in sessionStorage:', sessionUser);
      currentUserData = sessionUser;
      return Promise.resolve(sessionUser);
    }
    
    // 3. Check localStorage (persistent storage)
    const storedUser = utils.getStoredUser();
    if (storedUser) {
      console.log('Found user in localStorage:', storedUser);
      currentUserData = storedUser;
      utils.storeUser(storedUser); // Update sessionStorage
      return Promise.resolve(storedUser);
    }
    
    // 4. Fallback to Firebase (slowest - only if no cached data)
    console.log('No cached user found, falling back to Firebase...');
    return authManager.waitForFirebaseAuth();
  },

  // Firebase auth fallback (only used when no cached data available)
  waitForFirebaseAuth: () => {
    return new Promise((resolve, reject) => {
      const unsubscribe = firebaseAuthService.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
          try {
            console.log('Loading fresh user data from Firebase...');
            currentUserData = await utils.getUserData(firebaseUser.uid);
            utils.storeUser(currentUserData); // Cache for future use
            unsubscribe();
            resolve(currentUserData);
          } catch (error) {
            unsubscribe();
            reject(error);
          }
        } else {
          unsubscribe();
          reject(new Error('User not authenticated'));
        }
      });
      
      setTimeout(() => {
        unsubscribe();
        reject(new Error('Authentication timeout'));
      }, 5000);
    });
  },

  // Load user data (now instant in most cases)
  loadUserData: async () => {
    currentUserData = await authManager.getUserDataImmediate();
    
    if (!currentUserData) {
      throw new Error('No user data available');
    }
    
    console.log('Loaded user data:', currentUserData);
    return currentUserData;
  }
};

// UI managers
const uiManager = {
  // Update page header
  updateHeader: () => {
    const profileHeader = document.querySelector('.profile-header h2');
    if (profileHeader && currentUserData) {
      const userType = utils.translate('userTypes', currentUserData.type);
      profileHeader.textContent = `הפרופיל של ${currentUserData.name} (${userType})`;
    }
  },

  // Update sidebar
  updateSidebar: () => {
    const profilePhoto = document.querySelector('.profile-photo');
    if (!profilePhoto || !currentUserData) return;

    let userInfoSection = profilePhoto.querySelector('.user-info-section');
    if (!userInfoSection) {
      userInfoSection = document.createElement('div');
      userInfoSection.className = 'user-info-section';
      profilePhoto.appendChild(userInfoSection);
    }

    const userType = utils.translate('userTypes', currentUserData.type);
    let userInfoHTML = `
      <h3>${currentUserData.name}</h3>
      <p class="user-type">${userType}</p>
    `;

    if (currentUserData.type === USER_TYPES.PLAYER) {
      const position = utils.translate('positions', currentUserData.position);
      const level = utils.translate('levels', currentUserData.level);
      userInfoHTML += `
        <div class="user-details">
          <p><strong>עמדה:</strong> ${position || 'לא צוין'}</p>
          <p><strong>גיל:</strong> ${currentUserData.age || 'לא צוין'}</p>
          <p><strong>רמה:</strong> ${level || 'לא צוין'}</p>
        </div>
      `;
    } else if (currentUserData.type === USER_TYPES.SCOUT) {
      userInfoHTML += `
        <div class="user-details">
          <p><strong>מועדון:</strong> ${currentUserData.club || 'לא צוין'}</p>
          <p><strong>תפקיד:</strong> ${currentUserData.position || 'לא צוין'}</p>
        </div>
      `;
    }

    userInfoSection.innerHTML = userInfoHTML;
  },

  // Configure UI based on user type
  configureForUserType: () => {
    const elements = {
      stats: document.getElementById('profile-stats-section'),
      actions: document.getElementById('profile-actions-section'),
      videos: document.getElementById('videos-section'),
      activity: document.getElementById('activity-section')
    };

    const configs = {
      [USER_TYPES.PLAYER]: {
        show: ['stats', 'actions', 'videos', 'activity'],
        actions: `
          <a href="${utils.createNavURL('training.html')}" class="btn btn-primary btn-block">תוכנית האימון שלי</a>
          <a href="${utils.createNavURL('challenges.html')}" class="btn btn-secondary btn-block">האתגרים שלי</a>
        `
      },
      [USER_TYPES.SCOUT]: {
        show: ['actions', 'activity'],
        actions: `
          <a href="${utils.createNavURL('discover.html')}" class="btn btn-primary btn-block">צפה בשחקנים</a>
          <a href="${utils.createNavURL('leaderboards.html')}" class="btn btn-secondary btn-block">טבלאות מובילים</a>
        `,
        activityMessage: 'אין פעילות סקאוט להצגה'
      },
      [USER_TYPES.ADMIN]: {
        show: ['actions', 'activity'],
        actions: `
          <a href="${utils.createNavURL('../admin/dashboard.html')}" class="btn btn-primary btn-block">ניהול משתמשים</a>
          <a href="${utils.createNavURL('../admin/videos.html')}" class="btn btn-secondary btn-block">ניהול מערכת</a>
        `,
        activityMessage: 'אין פעילות מנהל להצגה'
      }
    };

    const config = configs[currentUserData.type];
    if (!config) return;

    // Show/hide elements
    Object.keys(elements).forEach(key => {
      if (elements[key]) {
        elements[key].style.display = config.show.includes(key) ? 'block' : 'none';
      }
    });

    // Update actions
    if (elements.actions && config.actions) {
      elements.actions.innerHTML = config.actions;
    }

    // Update activity message for non-players
    if (config.activityMessage) {
      const activityContainer = document.getElementById('player-activity');
      if (activityContainer) {
        activityContainer.innerHTML = `<p class="no-activity-message">${config.activityMessage}</p>`;
      }
    }
  },

  // Update stats for players
  updateStats: () => {
    if (currentUserData.type !== USER_TYPES.PLAYER) return;

    const level = utils.translate('levels', currentUserData.level || 'beginner');
    utils.updateElement('#player-level', level);

    const stats = currentUserData.stats || {};
    utils.updateElement('#player-consistency', stats.consistency || 0);
    utils.updateElement('#player-improvement', `${stats.improvement || 0}%`);
    utils.updateElement('#player-ranking', stats.ranking || 0);
  },

  // Update profile image
  updateProfileImage: () => {
    const profileImage = document.getElementById('profile-image');
    if (currentUserData.profileImage && profileImage) {
      profileImage.src = currentUserData.profileImage;
    }

    // Hide change photo button (read-only)
    const changePhotoBtn = document.getElementById('change-photo-btn');
    if (changePhotoBtn) changePhotoBtn.style.display = 'none';
  }
};

// Content managers
const contentManager = {
  // Load player videos
  loadVideos: async () => {
    const videosContainer = document.getElementById('player-videos');
    if (!videosContainer || currentUserData.type !== USER_TYPES.PLAYER) return;

    try {
      const videos = currentUserData.challenges?.initial?.videos;
      if (!videos || videos.length === 0) {
        videosContainer.innerHTML = '<p class="no-videos-message">אין סרטונים להצגה</p>';
        return;
      }

      videosContainer.innerHTML = '';
      videos.forEach((video, index) => {
        const videoCard = contentManager.createVideoCard(video, index);
        videosContainer.appendChild(videoCard);
      });
    } catch (error) {
      console.error('Error loading player videos:', error);
      videosContainer.innerHTML = '<p class="no-videos-message">שגיאה בטעינת הסרטונים</p>';
    }
  },

  // Create video card element
  createVideoCard: (video, index) => {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';

    const thumbnail = document.createElement('div');
    thumbnail.className = 'video-thumbnail';

    const img = document.createElement('img');
    img.src = `../images/video-thumbnail-${(index % 3) + 1}.jpg`;
    img.alt = `אתגר ${video.challengeId}`;
    img.onerror = () => { img.src = '../images/default-video-thumbnail.jpg'; };

    const videoInfo = document.createElement('div');
    videoInfo.className = 'video-info';

    const title = document.createElement('div');
    title.className = 'video-title';
    title.textContent = utils.translate('challenges', video.challengeId) || `אתגר ${video.challengeId}`;

    const meta = document.createElement('div');
    meta.className = 'video-meta';

    const date = document.createElement('span');
    date.textContent = utils.formatDate(video.uploadDate);

    const status = document.createElement('span');
    status.textContent = utils.translate('statuses', video.status);
    status.className = `status-${video.status}`;

    // Assemble elements
    thumbnail.appendChild(img);
    meta.appendChild(date);
    meta.appendChild(status);
    videoInfo.appendChild(title);
    videoInfo.appendChild(meta);
    videoCard.appendChild(thumbnail);
    videoCard.appendChild(videoInfo);

    return videoCard;
  },

  // Load recent activity
  loadActivity: async () => {
    const activityContainer = document.getElementById('player-activity');
    if (!activityContainer) return;

    try {
      const activities = contentManager.generateActivities();
      
      if (activities.length === 0) {
        activityContainer.innerHTML = '<p class="no-activity-message">אין פעילות להצגה</p>';
        return;
      }

      // Sort by date (newest first)
      activities.sort((a, b) => {
        const dateA = new Date(a.date.seconds ? a.date.seconds * 1000 : a.date);
        const dateB = new Date(b.date.seconds ? b.date.seconds * 1000 : b.date);
        return dateB - dateA;
      });

      activityContainer.innerHTML = '';
      activities.slice(0, 5).forEach(activity => {
        const activityItem = contentManager.createActivityItem(activity);
        activityContainer.appendChild(activityItem);
      });
    } catch (error) {
      console.error('Error loading recent activity:', error);
      activityContainer.innerHTML = '<p class="no-activity-message">שגיאה בטעינת הפעילות</p>';
    }
  },

  // Generate activities array
  generateActivities: () => {
    const activities = [];

    // Registration activity
    if (currentUserData.createdAt) {
      activities.push({
        type: 'registration',
        date: currentUserData.createdAt,
        description: 'הצטרף לפלטפורמה'
      });
    }

    // Player-specific activities
    if (currentUserData.type === USER_TYPES.PLAYER) {
      const challenges = currentUserData.challenges?.initial;
      
      // Challenge completion
      if (challenges?.completed) {
        activities.push({
          type: 'challenge',
          date: challenges.completedAt || currentUserData.createdAt,
          description: 'השלים את האתגרים הראשוניים'
        });
      }

      // Video uploads
      challenges?.videos?.forEach(video => {
        const challengeTitle = utils.translate('challenges', video.challengeId) || `אתגר ${video.challengeId}`;
        activities.push({
          type: 'video',
          date: video.uploadDate || currentUserData.createdAt,
          description: `העלה סרטון עבור ${challengeTitle}`
        });
      });

      // Training program activities
      const training = currentUserData.trainingProgram;
      if (training?.unlocked) {
        activities.push({
          type: 'training',
          date: training.unlockedAt || currentUserData.createdAt,
          description: 'פתח את תוכנית האימון'
        });
      }

      training?.completedStages?.forEach((stage, index) => {
        activities.push({
          type: 'training',
          date: stage.completedAt || currentUserData.createdAt,
          description: `השלים שלב ${index + 1} בתוכנית האימון`
        });
      });
    }

    return activities;
  },

  // Create activity item element
  createActivityItem: (activity) => {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';

    const activityIcon = document.createElement('div');
    activityIcon.className = `activity-icon ${activity.type}`;
    const iconClass = utils.translate('activityIcons', activity.type);
    activityIcon.innerHTML = `<i class="${iconClass}"></i>`;

    const activityContent = document.createElement('div');
    activityContent.className = 'activity-content';

    const activityDescription = document.createElement('div');
    activityDescription.className = 'activity-description';
    activityDescription.textContent = activity.description;

    const activityDate = document.createElement('div');
    activityDate.className = 'activity-date';
    activityDate.textContent = utils.formatDate(activity.date);

    activityContent.appendChild(activityDescription);
    activityContent.appendChild(activityDate);
    activityItem.appendChild(activityIcon);
    activityItem.appendChild(activityContent);

    return activityItem;
  }
};

// Message system
const messageManager = {
  show: (message, type = 'info') => {
    let messageContainer = document.querySelector('.message-container');
    
    if (!messageContainer) {
      messageContainer = document.createElement('div');
      messageContainer.className = 'message-container';
      document.body.appendChild(messageContainer);
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'message-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => messageElement.remove());
    
    messageElement.appendChild(closeBtn);
    messageContainer.appendChild(messageElement);
    
    setTimeout(() => messageElement.remove(), 5000);
  }
};

// Main initialization
const profileManager = {
  init: async () => {
    console.log('initProfile called with currentUserData:', currentUserData);
    try {
      await authManager.loadUserData();
      
      // Update all UI components
      uiManager.updateHeader();
      uiManager.updateSidebar();
      uiManager.configureForUserType();
      uiManager.updateStats();
      uiManager.updateProfileImage();
      
      // Load content
      await contentManager.loadVideos();
      await contentManager.loadActivity();
      
    } catch (error) {
      console.error('Error initializing profile:', error);
      messageManager.show('שגיאה בטעינת הפרופיל', 'error');
      
      if (error.message.includes('authenticated')) {
        setTimeout(() => {
          window.location.href = '../index.html';
        }, 2000);
      }
    }
  }
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded - Profile page');
  console.log('LocalStorage test:', localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
  console.log('SessionStorage test:', sessionStorage.getItem(STORAGE_KEYS.SESSION_USER));
  
  // Use immediate auth system - this should be instant in most cases
  authManager.getUserDataImmediate()
    .then((userData) => {
      console.log('Got user data immediately:', userData);
      currentUserData = userData;
      profileManager.init();
    })
    .catch((error) => {
      console.error('Authentication error:', error);
      messageManager.show('שגיאה בטעינת נתוני המשתמש', 'error');
      
      // Redirect to login if authentication fails
      if (error.message !== 'Authentication timeout') {
        setTimeout(() => {
          window.location.href = '../index.html';
        }, 2000);
      }
    });
});

// Export utility for other components to use
window.footballScoutAuth = {
  createNavURL: utils.createNavURL,
  storeUser: utils.storeUser,
  getCurrentUser: () => currentUserData
};