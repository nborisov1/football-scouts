/**
 * Football Scouting Website - Admin Panel JavaScript
 * Handles admin panel functionality
 */

'use strict';

// Mock data for admin panel
const MOCK_ACTIVITY = [
  {
    id: 1,
    type: 'user_register',
    user: {
      id: 11,
      name: 'אריאל לוי',
      type: 'player'
    },
    timestamp: '2025-01-28T10:15:30Z'
  },
  {
    id: 2,
    type: 'video_upload',
    user: {
      id: 5,
      name: 'עידן אלון',
      type: 'player'
    },
    video: {
      id: 31,
      title: 'אתגר 1: שליטה בכדור'
    },
    timestamp: '2025-01-28T09:45:12Z'
  },
  {
    id: 3,
    type: 'challenge_complete',
    user: {
      id: 3,
      name: 'אבי גולן',
      type: 'player'
    },
    challenge: 'אתגרים ראשוניים',
    timestamp: '2025-01-28T08:30:45Z'
  },
  {
    id: 4,
    type: 'user_register',
    user: {
      id: 12,
      name: 'יעל כהן',
      type: 'scout'
    },
    timestamp: '2025-01-27T16:20:10Z'
  },
  {
    id: 5,
    type: 'video_approve',
    user: {
      id: 1,
      name: 'מנהל מערכת',
      type: 'admin'
    },
    video: {
      id: 28,
      title: 'אתגר 1: שליטה בכדור',
      player: 'נדב כהן'
    },
    timestamp: '2025-01-27T15:10:22Z'
  }
];

const MOCK_PENDING_VIDEOS = [
  {
    id: 31,
    title: 'אתגר 1: שליטה בכדור',
    player: {
      id: 5,
      name: 'עידן אלון'
    },
    thumbnail: '../images/video-thumbnail-2.jpg',
    uploadDate: '2025-01-28T09:45:12Z'
  },
  {
    id: 32,
    title: 'אתגר 2: כדרור',
    player: {
      id: 11,
      name: 'אריאל לוי'
    },
    thumbnail: '../images/video-thumbnail-1.jpg',
    uploadDate: '2025-01-28T08:15:30Z'
  },
  {
    id: 33,
    title: 'אתגר 3: בעיטות',
    player: {
      id: 6,
      name: 'רועי שמש'
    },
    thumbnail: '../images/video-thumbnail-3.jpg',
    uploadDate: '2025-01-27T14:30:45Z'
  }
];

const MOCK_NEW_USERS = [
  {
    id: 11,
    name: 'אריאל לוי',
    email: 'ariel@example.com',
    type: 'player',
    age: 16,
    position: 'midfielder',
    profileImage: '../images/player11.jpg',
    registerDate: '2025-01-28T10:15:30Z'
  },
  {
    id: 12,
    name: 'יעל כהן',
    email: 'yael@example.com',
    type: 'scout',
    club: 'מכבי תל אביב',
    profileImage: '../images/scout1.jpg',
    registerDate: '2025-01-27T16:20:10Z'
  },
  {
    id: 13,
    name: 'אורי מלכה',
    email: 'uri@example.com',
    type: 'player',
    age: 18,
    position: 'forward',
    profileImage: '../images/player12.jpg',
    registerDate: '2025-01-27T11:05:22Z'
  }
];

const MOCK_TOP_PLAYERS = [
  {
    id: 2,
    name: 'יוסי כהן',
    age: 18,
    position: 'midfielder',
    level: 'advanced',
    profileImage: '../images/player2.jpg',
    stats: {
      ranking: 92
    }
  },
  {
    id: 3,
    name: 'אבי גולן',
    age: 16,
    position: 'defender',
    level: 'intermediate',
    profileImage: '../images/player3.jpg',
    stats: {
      ranking: 90
    }
  },
  {
    id: 4,
    name: 'משה דוד',
    age: 19,
    position: 'goalkeeper',
    level: 'advanced',
    profileImage: '../images/player4.jpg',
    stats: {
      ranking: 88
    }
  }
];

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in and is an admin
  const currentUser = auth.getCurrentUser();
  
  if (!currentUser) {
    // Redirect to login page if not logged in
    window.location.href = '../index.html';
    return;
  }
  
  if (currentUser.type !== 'admin') {
    // Redirect to home page if not an admin
    window.location.href = '../index.html';
    return;
  }
  
  // Initialize admin panel
  initAdminPanel();
});

/**
 * Initialize admin panel
 */
function initAdminPanel() {
  // Set up sidebar toggle
  setupSidebarToggle();
  
  // Set up admin dropdown
  setupAdminDropdown();
  
  // Set up admin logout
  setupAdminLogout();
  
  // Load dashboard data
  loadDashboardData();
}

/**
 * Set up sidebar toggle
 */
function setupSidebarToggle() {
  const toggleBtn = document.getElementById('toggle-sidebar');
  const adminLayout = document.body;
  
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      adminLayout.classList.toggle('sidebar-collapsed');
    });
  }
  
  // Check screen size on load
  checkScreenSize();
  
  // Check screen size on resize
  window.addEventListener('resize', checkScreenSize);
}

/**
 * Check screen size and adjust sidebar
 */
function checkScreenSize() {
  const adminLayout = document.body;
  
  if (window.innerWidth <= 992) {
    adminLayout.classList.add('sidebar-collapsed');
  } else {
    adminLayout.classList.remove('sidebar-collapsed');
  }
}

/**
 * Set up admin dropdown
 */
function setupAdminDropdown() {
  const adminUser = document.querySelector('.admin-user');
  const adminDropdown = document.querySelector('.admin-dropdown');
  
  if (adminUser && adminDropdown) {
    adminUser.addEventListener('click', () => {
      adminDropdown.classList.toggle('visible');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.admin-user')) {
        adminDropdown.classList.remove('visible');
      }
    });
  }
}

/**
 * Set up admin logout
 */
function setupAdminLogout() {
  const logoutBtn = document.getElementById('admin-logout');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Log out
      auth.logout();
      
      // Redirect to home page
      window.location.href = '../index.html';
    });
  }
}

/**
 * Load dashboard data
 */
function loadDashboardData() {
  // Update admin name
  updateAdminName();
  
  // Load stats
  loadStats();
  
  // Load recent activity
  loadRecentActivity();
  
  // Load pending videos
  loadPendingVideos();
  
  // Load new users
  loadNewUsers();
  
  // Load top players
  loadTopPlayers();
}

/**
 * Update admin name
 */
function updateAdminName() {
  const adminName = document.getElementById('admin-name');
  const currentUser = auth.getCurrentUser();
  
  if (adminName && currentUser) {
    adminName.textContent = currentUser.name;
  }
}

/**
 * Load stats
 */
function loadStats() {
  // In a real application, these would be fetched from a server
  // For this demo, we'll use mock data
  
  document.getElementById('new-users-count').textContent = MOCK_NEW_USERS.length;
  document.getElementById('new-videos-count').textContent = MOCK_PENDING_VIDEOS.length;
  document.getElementById('completed-challenges-count').textContent = '2';
  document.getElementById('new-messages-count').textContent = '5';
}

/**
 * Load recent activity
 */
function loadRecentActivity() {
  const activityList = document.getElementById('recent-activity');
  
  if (!activityList) return;
  
  // Clear activity list
  activityList.innerHTML = '';
  
  // Add activity items
  MOCK_ACTIVITY.forEach(activity => {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    
    // Set icon based on activity type
    let icon = '';
    let text = '';
    
    switch (activity.type) {
      case 'user_register':
        icon = 'fa-user-plus';
        text = `<strong>${activity.user.name}</strong> נרשם כ${getHebrewUserType(activity.user.type)}`;
        break;
      case 'video_upload':
        icon = 'fa-video';
        text = `<strong>${activity.user.name}</strong> העלה סרטון "${activity.video.title}"`;
        break;
      case 'challenge_complete':
        icon = 'fa-check-circle';
        text = `<strong>${activity.user.name}</strong> השלים את ${activity.challenge}`;
        break;
      case 'video_approve':
        icon = 'fa-check';
        text = `<strong>${activity.user.name}</strong> אישר את הסרטון "${activity.video.title}" של ${activity.video.player}`;
        break;
      default:
        icon = 'fa-bell';
        text = 'פעילות חדשה';
    }
    
    // Create activity item HTML
    activityItem.innerHTML = `
      <div class="activity-icon">
        <i class="fas ${icon}"></i>
      </div>
      <div class="activity-content">
        <div class="activity-text">${text}</div>
        <div class="activity-time">${formatTimeAgo(activity.timestamp)}</div>
      </div>
    `;
    
    // Add activity item to list
    activityList.appendChild(activityItem);
  });
}

/**
 * Load pending videos
 */
function loadPendingVideos() {
  const videosList = document.getElementById('pending-videos');
  
  if (!videosList) return;
  
  // Clear videos list
  videosList.innerHTML = '';
  
  // Add video cards
  MOCK_PENDING_VIDEOS.forEach(video => {
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    
    // Create video card HTML
    videoCard.innerHTML = `
      <div class="video-thumbnail">
        <img src="${video.thumbnail}" alt="${video.title}">
      </div>
      <div class="video-info">
        <div class="video-title">${video.title}</div>
        <div class="video-meta">
          <span>${video.player.name}</span>
          <span>${formatTimeAgo(video.uploadDate)}</span>
        </div>
        <div class="video-actions">
          <button class="approve-btn" data-video-id="${video.id}">אשר</button>
          <button class="reject-btn" data-video-id="${video.id}">דחה</button>
        </div>
      </div>
    `;
    
    // Add video card to list
    videosList.appendChild(videoCard);
  });
  
  // Add event listeners to buttons
  addVideoActionEventListeners();
}

/**
 * Add event listeners to video action buttons
 */
function addVideoActionEventListeners() {
  // Approve buttons
  const approveButtons = document.querySelectorAll('.approve-btn');
  approveButtons.forEach(button => {
    button.addEventListener('click', () => {
      const videoId = parseInt(button.getAttribute('data-video-id'));
      approveVideo(videoId);
    });
  });
  
  // Reject buttons
  const rejectButtons = document.querySelectorAll('.reject-btn');
  rejectButtons.forEach(button => {
    button.addEventListener('click', () => {
      const videoId = parseInt(button.getAttribute('data-video-id'));
      rejectVideo(videoId);
    });
  });
}

/**
 * Approve video
 * @param {number} videoId - Video ID
 */
function approveVideo(videoId) {
  // In a real application, this would send a request to a server
  // For this demo, we'll just remove the video from the list
  
  // Find video card
  const videoCard = document.querySelector(`.approve-btn[data-video-id="${videoId}"]`).closest('.video-card');
  
  // Remove video card with animation
  videoCard.style.opacity = '0';
  setTimeout(() => {
    videoCard.remove();
    
    // Update stats
    const newVideosCount = document.getElementById('new-videos-count');
    newVideosCount.textContent = parseInt(newVideosCount.textContent) - 1;
    
    // Show message
    showMessage('הסרטון אושר בהצלחה', 'success');
  }, 300);
}

/**
 * Reject video
 * @param {number} videoId - Video ID
 */
function rejectVideo(videoId) {
  // In a real application, this would send a request to a server
  // For this demo, we'll just remove the video from the list
  
  // Find video card
  const videoCard = document.querySelector(`.reject-btn[data-video-id="${videoId}"]`).closest('.video-card');
  
  // Remove video card with animation
  videoCard.style.opacity = '0';
  setTimeout(() => {
    videoCard.remove();
    
    // Update stats
    const newVideosCount = document.getElementById('new-videos-count');
    newVideosCount.textContent = parseInt(newVideosCount.textContent) - 1;
    
    // Show message
    showMessage('הסרטון נדחה', 'error');
  }, 300);
}

/**
 * Load new users
 */
function loadNewUsers() {
  const usersList = document.getElementById('new-users');
  
  if (!usersList) return;
  
  // Clear users list
  usersList.innerHTML = '';
  
  // Add user items
  MOCK_NEW_USERS.forEach(user => {
    const userItem = document.createElement('div');
    userItem.className = 'user-item';
    
    // Create user item HTML
    userItem.innerHTML = `
      <div class="user-avatar">
        <img src="${user.profileImage}" alt="${user.name}">
      </div>
      <div class="user-info">
        <div class="user-name">${user.name}</div>
        <div class="user-meta">
          <span>${user.email}</span>
          <span>${formatTimeAgo(user.registerDate)}</span>
        </div>
      </div>
      <div class="user-type ${user.type}">${getHebrewUserType(user.type)}</div>
    `;
    
    // Add user item to list
    usersList.appendChild(userItem);
  });
}

/**
 * Load top players
 */
function loadTopPlayers() {
  const playersList = document.getElementById('top-players');
  
  if (!playersList) return;
  
  // Clear players list
  playersList.innerHTML = '';
  
  // Add player items
  MOCK_TOP_PLAYERS.forEach(player => {
    const playerItem = document.createElement('div');
    playerItem.className = 'user-item';
    
    // Create player item HTML
    playerItem.innerHTML = `
      <div class="user-avatar">
        <img src="${player.profileImage}" alt="${player.name}">
      </div>
      <div class="user-info">
        <div class="user-name">${player.name}</div>
        <div class="user-meta">
          <span>${player.age} שנים</span>
          <span>${getHebrewPosition(player.position)}</span>
        </div>
      </div>
      <div class="user-type player">${player.stats.ranking} נקודות</div>
    `;
    
    // Add player item to list
    playersList.appendChild(playerItem);
  });
}

/**
 * Get Hebrew translation of user type
 * @param {string} type - User type in English
 * @returns {string} - User type in Hebrew
 */
function getHebrewUserType(type) {
  switch (type) {
    case 'player':
      return 'שחקן';
    case 'scout':
      return 'סקאוט';
    case 'admin':
      return 'מנהל';
    default:
      return type;
  }
}

/**
 * Get Hebrew translation of position
 * @param {string} position - Position in English
 * @returns {string} - Position in Hebrew
 */
function getHebrewPosition(position) {
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

/**
 * Format time ago
 * @param {string} timestamp - ISO timestamp
 * @returns {string} - Time ago in Hebrew
 */
function formatTimeAgo(timestamp) {
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
  
  return 'לפני מספר שניות';
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