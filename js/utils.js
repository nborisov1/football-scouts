/**
 * Football Scouting Website - Utilities
 * Centralized utility functions to eliminate code duplication
 */

'use strict';

// ===== CONSTANTS =====
window.USER_TYPES = {
  PLAYER: 'player',
  SCOUT: 'scout',
  ADMIN: 'admin'
};

window.COLLECTIONS = {
  USERS: 'users',
  VIDEOS: 'videos',
  CHALLENGES: 'challenges'
};

// ===== MOCK DATA =====
window.MOCK_PLAYERS = [
  {
    id: 1,
    name: 'דני לוי',
    age: 17,
    position: 'forward',
    level: 'advanced',
    dominantFoot: 'right',
    club: 'מכבי תל אביב נוער',
    consistency: 28,
    improvement: 85,
    ranking: 95,
    email: 'danny.levy@example.com',
    joinDate: '2024-01-15',
    location: 'תל אביב'
  },
  {
    id: 2,
    name: 'יוסי כהן',
    age: 18,
    position: 'midfielder',
    level: 'intermediate',
    dominantFoot: 'left',
    club: 'הפועל חיפה נוער',
    consistency: 26,
    improvement: 78,
    ranking: 92,
    email: 'yossi.cohen@example.com',
    joinDate: '2024-02-20',
    location: 'חיפה'
  },
  {
    id: 3,
    name: 'אבי גולן',
    age: 16,
    position: 'defender',
    level: 'beginner',
    dominantFoot: 'right',
    club: 'בית"ר ירושלים נוער',
    consistency: 24,
    improvement: 72,
    ranking: 90,
    email: 'avi.golan@example.com',
    joinDate: '2024-03-10',
    location: 'ירושלים'
  },
  {
    id: 4,
    name: 'משה דוד',
    age: 19,
    position: 'goalkeeper',
    level: 'advanced',
    dominantFoot: 'right',
    club: 'מכבי חיפה נוער',
    consistency: 22,
    improvement: 68,
    ranking: 88,
    email: 'moshe.david@example.com',
    joinDate: '2024-01-05',
    location: 'חיפה'
  },
  {
    id: 5,
    name: 'עידן אלון',
    age: 17,
    position: 'forward',
    level: 'intermediate',
    dominantFoot: 'both',
    club: 'הפועל תל אביב נוער',
    consistency: 20,
    improvement: 65,
    ranking: 85,
    email: 'idan.alon@example.com',
    joinDate: '2024-02-28',
    location: 'תל אביב'
  }
];

// ===== TRANSLATION FUNCTIONS =====
window.getHebrewUserType = function(type) {
  switch (type) {
    case USER_TYPES.PLAYER:
      return 'שחקן';
    case USER_TYPES.SCOUT:
      return 'סקאוט';
    case USER_TYPES.ADMIN:
      return 'מנהל';
    default:
      return 'משתמש';
  }
}

window.getHebrewPosition = function(position) {
  switch (position) {
    case 'goalkeeper':
      return 'שוער';
    case 'defender':
      return 'מגן';
    case 'midfielder':
      return 'קשר';
    case 'forward':
      return 'חלוץ';
    default:
      return position;
  }
}

window.getHebrewLevel = function(level) {
  switch (level) {
    case 'beginner':
      return 'מתחיל';
    case 'intermediate':
      return 'בינוני';
    case 'advanced':
      return 'מתקדם';
    default:
      return level;
  }
}

window.getHebrewFoot = function(foot) {
  switch (foot) {
    case 'right':
      return 'ימין';
    case 'left':
      return 'שמאל';
    case 'both':
      return 'שתיהן';
    default:
      return foot;
  }
}

// ===== DATE UTILITIES =====
window.formatDate = function(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL');
}

window.formatTimeAgo = function(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? 'לפני שנה' : `לפני ${interval} שנים`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? 'לפני חודש' : `לפני ${interval} חודשים`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? 'אתמול' : `לפני ${interval} ימים`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? 'לפני שעה' : `לפני ${interval} שעות`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? 'לפני דקה' : `לפני ${interval} דקות`;
  }
  
  return 'עכשיו';
}

// ===== STORAGE UTILITIES =====
// Note: Authentication storage functions removed - using only Firebase Auth state and memory

// ===== URL UTILITIES =====
window.createNavURL = function(path, userData = null) {
  // No longer passing auth data in URLs - relying on Firebase Auth state
  return path;
}

// ===== MESSAGE SYSTEM =====
window.showMessage = function(message, type = 'info', duration = 5000) {
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
  
  // Auto-remove after specified duration
  if (duration > 0) {
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.remove();
      }
    }, duration);
  }
  
  return messageElement;
}

// ===== VALIDATION UTILITIES =====
window.validateEmail = function(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    message: emailRegex.test(email) ? '' : 'כתובת אימייל לא תקינה'
  };
}

window.validatePassword = function(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return {
    isValid: passwordRegex.test(password),
    message: passwordRegex.test(password) ? '' : 'הסיסמה חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה ומספר'
  };
}

window.validateRequired = function(value, fieldName) {
  const isValid = value && value.trim().length > 0;
  return {
    isValid,
    message: isValid ? '' : `${fieldName} הוא שדה חובה`
  };
}

// ===== FILE UTILITIES =====
window.validateVideoFile = function(file) {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  const maxSize = 100 * 1024 * 1024; // 100MB
  
  if (!file) {
    return { isValid: false, message: 'יש לבחור קובץ וידאו' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, message: 'סוג קובץ לא נתמך. יש להעלות קובץ MP4, WebM או OGG' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, message: 'גודל הקובץ חורג מ-100MB' };
  }
  
  return { isValid: true, message: '' };
}

// ===== PROGRESS SIMULATION =====
window.simulateProgress = function(progressBar, progressText, callback, duration = 3000) {
  let progress = 0;
  const increment = 100 / (duration / 100);
  
  const interval = setInterval(() => {
    progress += increment + Math.random() * 5;
    
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      
      if (progressBar) progressBar.style.width = '100%';
      if (progressText) progressText.textContent = 'הושלם';
      
      if (callback) {
        setTimeout(callback, 500);
      }
    } else {
      if (progressBar) progressBar.style.width = `${progress}%`;
      if (progressText) progressText.textContent = `${Math.round(progress)}%`;
    }
  }, 100);
  
  return interval;
}

// ===== DOM UTILITIES =====
window.createElement = function(tag, className = '', textContent = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
}

window.createButton = function(text, className = '', onClick = null) {
  const button = createElement('button', className, text);
  if (onClick) button.addEventListener('click', onClick);
  return button;
}

window.createInput = function(type, id, placeholder = '', value = '') {
  const input = createElement('input');
  input.type = type;
  input.id = id;
  if (placeholder) input.placeholder = placeholder;
  if (value) input.value = value;
  return input;
}

// ===== EXPORT UTILITIES FOR GLOBAL ACCESS =====
// Export all functions to global window object
window.footballScoutUtils = {
  showMessage: window.showMessage,
  getHebrewUserType: window.getHebrewUserType,
  getHebrewPosition: window.getHebrewPosition,
  getHebrewLevel: window.getHebrewLevel,
  getHebrewFoot: window.getHebrewFoot,
  formatDate: window.formatDate,
  formatTimeAgo: window.formatTimeAgo,
  validateEmail: window.validateEmail,
  validatePassword: window.validatePassword,
  validateRequired: window.validateRequired,
  validateVideoFile: window.validateVideoFile,
  simulateProgress: window.simulateProgress,
  createNavURL: window.createNavURL,
  createElement: window.createElement,
  createButton: window.createButton,
  createInput: window.createInput,
  USER_TYPES: window.USER_TYPES,
  COLLECTIONS: window.COLLECTIONS,
  MOCK_PLAYERS: window.MOCK_PLAYERS
};

// ===== AUTHENTICATION UTILITIES =====
/**
 * Get current authenticated user from session (fast, no Firebase queries)
 */
window.getCurrentUserFromSession = function() {
  try {
    const sessionData = localStorage.getItem('footballScout_session');
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData);
    
    // Check if session is expired
    if (session.expires && Date.now() > session.expires) {
      localStorage.removeItem('footballScout_session');
      return null;
    }
    
    return session.user;
  } catch (error) {
    console.error('Error reading user session:', error);
    localStorage.removeItem('footballScout_session');
    return null;
  }
};

/**
 * Check if user is authenticated (fast session check)
 */
window.isUserAuthenticated = function() {
  return !!window.getCurrentUserFromSession();
};

/**
 * Redirect to home if not authenticated
 */
window.requireAuthentication = function(requiredUserType = null) {
  const user = window.getCurrentUserFromSession();
  
  if (!user) {
    console.log('❌ No authenticated user found, redirecting to home...');
    // Prevent infinite redirects by checking current page
    if (!window.location.href.includes('index.html')) {
      window.location.href = '../index.html';
    }
    return null;
  }
  
  if (requiredUserType && user.type !== requiredUserType) {
    console.log(`❌ User type ${user.type} not allowed, required: ${requiredUserType}`);
    console.log(`❌ Current page requires '${requiredUserType}' but user is '${user.type}'`);
    // Prevent infinite redirects by checking current page
    if (!window.location.href.includes('index.html')) {
      window.location.href = '../index.html';
    }
    return null;
  }
  
  console.log('✅ User authenticated:', user.email, 'Type:', user.type);
  return user;
};