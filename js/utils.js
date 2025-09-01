/**
 * Football Scouting Website - Utilities
 * Centralized utility functions to eliminate code duplication
 */

'use strict';

// ===== CONSTANTS =====
export const USER_TYPES = {
  PLAYER: 'player',
  SCOUT: 'scout',
  ADMIN: 'admin'
};

export const COLLECTIONS = {
  USERS: 'users',
  VIDEOS: 'videos',
  CHALLENGES: 'challenges'
};

// ===== MOCK DATA =====
export const MOCK_PLAYERS = [
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
export function getHebrewUserType(type) {
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

export function getHebrewPosition(position) {
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

export function getHebrewLevel(level) {
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

export function getHebrewFoot(foot) {
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
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL');
}

export function formatTimeAgo(timestamp) {
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
export function createNavURL(path, userData = null) {
  // No longer passing auth data in URLs - relying on Firebase Auth state
  return path;
}

// ===== MESSAGE SYSTEM =====
export function showMessage(message, type = 'info', duration = 5000) {
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
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    message: emailRegex.test(email) ? '' : 'כתובת אימייל לא תקינה'
  };
}

export function validatePassword(password) {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return {
    isValid: passwordRegex.test(password),
    message: passwordRegex.test(password) ? '' : 'הסיסמה חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה ומספר'
  };
}

export function validateRequired(value, fieldName) {
  const isValid = value && value.trim().length > 0;
  return {
    isValid,
    message: isValid ? '' : `${fieldName} הוא שדה חובה`
  };
}

// ===== FILE UTILITIES =====
export function validateVideoFile(file) {
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
export function simulateProgress(progressBar, progressText, callback, duration = 3000) {
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
export function createElement(tag, className = '', textContent = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  return element;
}

export function createButton(text, className = '', onClick = null) {
  const button = createElement('button', className, text);
  if (onClick) button.addEventListener('click', onClick);
  return button;
}

export function createInput(type, id, placeholder = '', value = '') {
  const input = createElement('input');
  input.type = type;
  input.id = id;
  if (placeholder) input.placeholder = placeholder;
  if (value) input.value = value;
  return input;
}

// ===== EXPORT UTILITIES FOR GLOBAL ACCESS =====
export function exportToGlobal() {
  // Export commonly used functions to window object for backward compatibility
  window.footballScoutUtils = {
    showMessage,
    getHebrewUserType,
    getHebrewPosition,
    getHebrewLevel,
    getHebrewFoot,
    formatDate,
    formatTimeAgo,
    validateEmail,
    validatePassword,
    validateRequired,
    validateVideoFile,
    simulateProgress,
    createNavURL,
    USER_TYPES,
    MOCK_PLAYERS
  };
}

// Auto-export to global if not in module context
if (typeof window !== 'undefined' && !window.footballScoutUtils) {
  exportToGlobal();
}