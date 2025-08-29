/**
 * Football Scouting Website - Watchlist JavaScript
 * Handles watchlist functionality for scouts
 */

'use strict';

// Mock data for players (same as in leaderboards.js and discover.js)
const MOCK_PLAYERS = [
  {
    id: 1,
    name: 'דני לוי',
    email: 'danny@example.com',
    age: 17,
    position: 'forward',
    level: 'intermediate',
    dominantFoot: 'right',
    club: 'מכבי תל אביב נוער',
    profileImage: '../images/player1.jpg',
    stats: {
      consistency: 28,
      improvement: 65,
      ranking: 85
    },
    videos: [
      { id: 1, title: 'אתגר 1: שליטה בכדור', date: '2025-01-15', thumbnail: '../images/video-thumbnail-1.jpg' },
      { id: 2, title: 'אתגר 2: כדרור', date: '2025-01-20', thumbnail: '../images/video-thumbnail-2.jpg' },
      { id: 3, title: 'אתגר 3: בעיטות', date: '2025-01-25', thumbnail: '../images/video-thumbnail-3.jpg' }
    ]
  },
  {
    id: 2,
    name: 'יוסי כהן',
    email: 'yossi@example.com',
    age: 18,
    position: 'midfielder',
    level: 'advanced',
    dominantFoot: 'left',
    club: 'הפועל חיפה נוער',
    profileImage: '../images/player2.jpg',
    stats: {
      consistency: 26,
      improvement: 78,
      ranking: 92
    },
    videos: [
      { id: 4, title: 'אתגר 1: שליטה בכדור', date: '2025-01-10', thumbnail: '../images/video-thumbnail-2.jpg' },
      { id: 5, title: 'אתגר 2: כדרור', date: '2025-01-15', thumbnail: '../images/video-thumbnail-3.jpg' },
      { id: 6, title: 'אתגר 3: בעיטות', date: '2025-01-20', thumbnail: '../images/video-thumbnail-1.jpg' }
    ]
  },
  {
    id: 3,
    name: 'אבי גולן',
    email: 'avi@example.com',
    age: 16,
    position: 'defender',
    level: 'intermediate',
    dominantFoot: 'right',
    club: 'בית"ר ירושלים נוער',
    profileImage: '../images/player3.jpg',
    stats: {
      consistency: 24,
      improvement: 72,
      ranking: 90
    },
    videos: [
      { id: 7, title: 'אתגר 1: שליטה בכדור', date: '2025-01-05', thumbnail: '../images/video-thumbnail-3.jpg' },
      { id: 8, title: 'אתגר 2: כדרור', date: '2025-01-10', thumbnail: '../images/video-thumbnail-1.jpg' },
      { id: 9, title: 'אתגר 3: בעיטות', date: '2025-01-15', thumbnail: '../images/video-thumbnail-2.jpg' }
    ]
  },
  {
    id: 4,
    name: 'משה דוד',
    email: 'moshe@example.com',
    age: 19,
    position: 'goalkeeper',
    level: 'advanced',
    dominantFoot: 'right',
    club: 'הפועל באר שבע נוער',
    profileImage: '../images/player4.jpg',
    stats: {
      consistency: 22,
      improvement: 68,
      ranking: 88
    },
    videos: [
      { id: 10, title: 'אתגר 1: שליטה בכדור', date: '2025-01-01', thumbnail: '../images/video-thumbnail-1.jpg' },
      { id: 11, title: 'אתגר 2: כדרור', date: '2025-01-05', thumbnail: '../images/video-thumbnail-2.jpg' },
      { id: 12, title: 'אתגר 3: בעיטות', date: '2025-01-10', thumbnail: '../images/video-thumbnail-3.jpg' }
    ]
  },
  {
    id: 5,
    name: 'עידן אלון',
    email: 'idan@example.com',
    age: 17,
    position: 'forward',
    level: 'beginner',
    dominantFoot: 'left',
    club: 'מכבי נתניה נוער',
    profileImage: '../images/player5.jpg',
    stats: {
      consistency: 20,
      improvement: 65,
      ranking: 85
    },
    videos: [
      { id: 13, title: 'אתגר 1: שליטה בכדור', date: '2025-01-01', thumbnail: '../images/video-thumbnail-2.jpg' },
      { id: 14, title: 'אתגר 2: כדרור', date: '2025-01-05', thumbnail: '../images/video-thumbnail-3.jpg' },
      { id: 15, title: 'אתגר 3: בעיטות', date: '2025-01-10', thumbnail: '../images/video-thumbnail-1.jpg' }
    ]
  },
  {
    id: 6,
    name: 'רועי שמש',
    email: 'roi@example.com',
    age: 16,
    position: 'midfielder',
    level: 'intermediate',
    dominantFoot: 'right',
    club: 'בני יהודה נוער',
    profileImage: '../images/player6.jpg',
    stats: {
      consistency: 18,
      improvement: 85,
      ranking: 80
    },
    videos: [
      { id: 16, title: 'אתגר 1: שליטה בכדור', date: '2025-01-01', thumbnail: '../images/video-thumbnail-3.jpg' },
      { id: 17, title: 'אתגר 2: כדרור', date: '2025-01-05', thumbnail: '../images/video-thumbnail-1.jpg' },
      { id: 18, title: 'אתגר 3: בעיטות', date: '2025-01-10', thumbnail: '../images/video-thumbnail-2.jpg' }
    ]
  },
  {
    id: 7,
    name: 'אלון דגן',
    email: 'alon@example.com',
    age: 18,
    position: 'defender',
    level: 'advanced',
    dominantFoot: 'right',
    club: 'מכבי חיפה נוער',
    profileImage: '../images/player7.jpg',
    stats: {
      consistency: 16,
      improvement: 78,
      ranking: 75
    },
    videos: [
      { id: 19, title: 'אתגר 1: שליטה בכדור', date: '2025-01-01', thumbnail: '../images/video-thumbnail-1.jpg' },
      { id: 20, title: 'אתגר 2: כדרור', date: '2025-01-05', thumbnail: '../images/video-thumbnail-2.jpg' },
      { id: 21, title: 'אתגר 3: בעיטות', date: '2025-01-10', thumbnail: '../images/video-thumbnail-3.jpg' }
    ]
  },
  {
    id: 8,
    name: 'גיא לוי',
    email: 'guy@example.com',
    age: 17,
    position: 'forward',
    level: 'intermediate',
    dominantFoot: 'left',
    club: 'הפועל תל אביב נוער',
    profileImage: '../images/player8.jpg',
    stats: {
      consistency: 14,
      improvement: 72,
      ranking: 70
    },
    videos: [
      { id: 22, title: 'אתגר 1: שליטה בכדור', date: '2025-01-01', thumbnail: '../images/video-thumbnail-2.jpg' },
      { id: 23, title: 'אתגר 2: כדרור', date: '2025-01-05', thumbnail: '../images/video-thumbnail-3.jpg' },
      { id: 24, title: 'אתגר 3: בעיטות', date: '2025-01-10', thumbnail: '../images/video-thumbnail-1.jpg' }
    ]
  },
  {
    id: 9,
    name: 'עומר שלום',
    email: 'omer@example.com',
    age: 19,
    position: 'goalkeeper',
    level: 'beginner',
    dominantFoot: 'right',
    club: 'בית"ר ירושלים נוער',
    profileImage: '../images/player9.jpg',
    stats: {
      consistency: 12,
      improvement: 68,
      ranking: 65
    },
    videos: [
      { id: 25, title: 'אתגר 1: שליטה בכדור', date: '2025-01-01', thumbnail: '../images/video-thumbnail-3.jpg' },
      { id: 26, title: 'אתגר 2: כדרור', date: '2025-01-05', thumbnail: '../images/video-thumbnail-1.jpg' },
      { id: 27, title: 'אתגר 3: בעיטות', date: '2025-01-10', thumbnail: '../images/video-thumbnail-2.jpg' }
    ]
  },
  {
    id: 10,
    name: 'נדב כהן',
    email: 'nadav@example.com',
    age: 18,
    position: 'midfielder',
    level: 'intermediate',
    dominantFoot: 'right',
    club: 'הפועל חיפה נוער',
    profileImage: '../images/player10.jpg',
    stats: {
      consistency: 10,
      improvement: 65,
      ranking: 60
    },
    videos: [
      { id: 28, title: 'אתגר 1: שליטה בכדור', date: '2025-01-01', thumbnail: '../images/video-thumbnail-1.jpg' },
      { id: 29, title: 'אתגר 2: כדרור', date: '2025-01-05', thumbnail: '../images/video-thumbnail-2.jpg' },
      { id: 30, title: 'אתגר 3: בעיטות', date: '2025-01-10', thumbnail: '../images/video-thumbnail-3.jpg' }
    ]
  }
];

// Watchlist
let watchlist = [];

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in and is a scout
  const currentUser = auth.getCurrentUser();
  
  if (!currentUser) {
    // Redirect to login page if not logged in
    window.location.href = '../index.html';
    return;
  }
  
  if (currentUser.type !== 'scout') {
    // Redirect to home page if not a scout
    window.location.href = '../index.html';
    return;
  }
  
  // Initialize watchlist functionality
  initWatchlist();
});

/**
 * Initialize watchlist functionality
 */
function initWatchlist() {
  // Load watchlist from local storage
  loadWatchlist();
  
  // Set up player profile modal
  setupPlayerProfileModal();
  
  // Set up contact player modal
  setupContactPlayerModal();
  
  // Set up clear watchlist modal
  setupClearWatchlistModal();
  
  // Set up export watchlist
  setupExportWatchlist();
  
  // Load watchlisted players
  loadWatchlistedPlayers();
}

/**
 * Load watchlist from local storage
 */
function loadWatchlist() {
  const currentUser = auth.getCurrentUser();
  
  // Check if user has watchlist
  if (currentUser.watchlist) {
    watchlist = currentUser.watchlist;
  } else {
    // Initialize watchlist
    watchlist = [];
    
    // Save to user data
    const users = auth.getUsers();
    if (users[currentUser.email]) {
      users[currentUser.email].watchlist = watchlist;
      auth.saveUsers(users);
    }
  }
}

/**
 * Save watchlist to local storage
 */
function saveWatchlist() {
  const currentUser = auth.getCurrentUser();
  
  // Save to user data
  const users = auth.getUsers();
  if (users[currentUser.email]) {
    users[currentUser.email].watchlist = watchlist;
    auth.saveUsers(users);
    
    // Update current user in local storage
    currentUser.watchlist = watchlist;
    localStorage.setItem('footballScout_currentUser', JSON.stringify(currentUser));
  }
}

/**
 * Set up player profile modal
 */
function setupPlayerProfileModal() {
  const modal = document.getElementById('player-profile-modal');
  const closeButton = modal.querySelector('.close-modal');
  
  // Close modal when clicking the X
  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}

/**
 * Set up contact player modal
 */
function setupContactPlayerModal() {
  const modal = document.getElementById('contact-player-modal');
  const closeButton = modal.querySelector('.close-modal');
  const contactForm = document.getElementById('contact-form');
  
  // Close modal when clicking the X
  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Contact form submit
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form values
      const subject = document.getElementById('contact-subject').value;
      const message = document.getElementById('contact-message').value;
      
      // Validate form
      if (!subject || !message) {
        showMessage('יש למלא את כל השדות', 'error');
        return;
      }
      
      // In a real application, this would send a message to the player
      // For this demo, we'll just show a success message
      
      // Close modal
      modal.style.display = 'none';
      
      // Show success message
      showMessage('ההודעה נשלחה בהצלחה', 'success');
      
      // Reset form
      contactForm.reset();
    });
  }
}

/**
 * Set up clear watchlist modal
 */
function setupClearWatchlistModal() {
  const clearWatchlistBtn = document.getElementById('clear-watchlist');
  const modal = document.getElementById('clear-watchlist-modal');
  const closeButton = modal.querySelector('.close-modal');
  const confirmButton = document.getElementById('confirm-clear-btn');
  const cancelButton = document.getElementById('cancel-clear-btn');
  
  // Open modal when clicking clear watchlist button
  if (clearWatchlistBtn) {
    clearWatchlistBtn.addEventListener('click', () => {
      modal.style.display = 'block';
    });
  }
  
  // Close modal when clicking the X
  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Close modal when clicking cancel
  if (cancelButton) {
    cancelButton.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
  
  // Clear watchlist when clicking confirm
  if (confirmButton) {
    confirmButton.addEventListener('click', () => {
      // Clear watchlist
      watchlist = [];
      saveWatchlist();
      
      // Close modal
      modal.style.display = 'none';
      
      // Show success message
      showMessage('רשימת המעקב נוקתה בהצלחה', 'success');
      
      // Reload watchlisted players
      loadWatchlistedPlayers();
    });
  }
}

/**
 * Set up export watchlist
 */
function setupExportWatchlist() {
  const exportWatchlistBtn = document.getElementById('export-watchlist');
  
  if (exportWatchlistBtn) {
    exportWatchlistBtn.addEventListener('click', () => {
      exportWatchlist();
    });
  }
}

/**
 * Export watchlist to CSV
 */
function exportWatchlist() {
  // Get watchlisted players
  const watchlistedPlayers = getWatchlistedPlayers();
  
  if (watchlistedPlayers.length === 0) {
    showMessage('אין שחקנים ברשימת המעקב', 'error');
    return;
  }
  
  // Create CSV content
  let csvContent = 'שם,גיל,עמדה,רמה,רגל דומיננטית,מועדון,עקביות,שיפור,דירוג,אימייל\n';
  
  watchlistedPlayers.forEach(player => {
    const row = [
      player.name,
      player.age,
      getHebrewPosition(player.position),
      getHebrewLevel(player.level),
      getHebrewFoot(player.dominantFoot),
      player.club || 'לא צוין',
      player.stats.consistency,
      player.stats.improvement + '%',
      player.stats.ranking,
      player.email
    ];
    
    csvContent += row.join(',') + '\n';
  });
  
  // Create download link
  const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'watchlist.csv');
  document.body.appendChild(link);
  
  // Trigger download
  link.click();
  
  // Remove link
  document.body.removeChild(link);
  
  // Show success message
  showMessage('רשימת המעקב יוצאה בהצלחה', 'success');
}

/**
 * Load watchlisted players
 */
function loadWatchlistedPlayers() {
  const watchlistGrid = document.getElementById('watchlist-grid');
  const emptyWatchlist = document.getElementById('empty-watchlist');
  const watchlistCount = document.getElementById('watchlist-count');
  
  if (!watchlistGrid || !emptyWatchlist || !watchlistCount) return;
  
  // Update watchlist count
  watchlistCount.textContent = watchlist.length;
  
  // Check if watchlist is empty
  if (watchlist.length === 0) {
    watchlistGrid.innerHTML = '';
    emptyWatchlist.classList.remove('hidden');
    return;
  }
  
  // Hide empty watchlist message
  emptyWatchlist.classList.add('hidden');
  
  // Show loading spinner
  watchlistGrid.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
      <p>טוען שחקנים...</p>
    </div>
  `;
  
  // Simulate loading delay
  setTimeout(() => {
    // Get watchlisted players
    const watchlistedPlayers = getWatchlistedPlayers();
    
    // Clear watchlist grid
    watchlistGrid.innerHTML = '';
    
    // Add players to grid
    watchlistedPlayers.forEach(player => {
      const playerCard = document.createElement('div');
      playerCard.className = 'player-card';
      
      // Create player card HTML
      playerCard.innerHTML = `
        <div class="player-avatar">
          <img src="${player.profileImage || '../images/default-profile.jpg'}" alt="${player.name}">
        </div>
        <div class="player-content">
          <div class="player-header">
            <h3 class="player-name">${player.name}</h3>
            <div class="player-info">
              <span>${player.age} שנים</span>
              <span class="player-position">${getHebrewPosition(player.position)}</span>
            </div>
          </div>
          <div class="player-stats">
            <div class="stat-item">
              <div class="stat-value">${player.stats.consistency}</div>
              <div class="stat-label">עקביות</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${player.stats.improvement}%</div>
              <div class="stat-label">שיפור</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${player.stats.ranking}</div>
              <div class="stat-label">דירוג</div>
            </div>
          </div>
          <div class="player-actions">
            <button class="view-profile-btn" data-player-id="${player.id}">צפה בפרופיל</button>
            <button class="contact-btn" data-player-id="${player.id}">צור קשר</button>
            <button class="remove-btn" data-player-id="${player.id}">הסר</button>
          </div>
        </div>
      `;
      
      // Add player card to grid
      watchlistGrid.appendChild(playerCard);
    });
    
    // Add event listeners to buttons
    addPlayerCardEventListeners();
  }, 1000);
}

/**
 * Get watchlisted players
 * @returns {Array} - Array of watchlisted player objects
 */
function getWatchlistedPlayers() {
  return MOCK_PLAYERS.filter(player => watchlist.includes(player.id));
}

/**
 * Add event listeners to player card buttons
 */
function addPlayerCardEventListeners() {
  // View profile buttons
  const viewProfileButtons = document.querySelectorAll('.view-profile-btn');
  viewProfileButtons.forEach(button => {
    button.addEventListener('click', () => {
      const playerId = parseInt(button.getAttribute('data-player-id'));
      showPlayerProfile(playerId);
    });
  });
  
  // Contact buttons
  const contactButtons = document.querySelectorAll('.contact-btn');
  contactButtons.forEach(button => {
    button.addEventListener('click', () => {
      const playerId = parseInt(button.getAttribute('data-player-id'));
      const player = MOCK_PLAYERS.find(p => p.id === playerId);
      if (player) {
        showContactModal(player);
      }
    });
  });
  
  // Remove buttons
  const removeButtons = document.querySelectorAll('.remove-btn');
  removeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const playerId = parseInt(button.getAttribute('data-player-id'));
      removeFromWatchlist(playerId);
    });
  });
}

/**
 * Show player profile in modal
 * @param {number} playerId - Player ID
 */
function showPlayerProfile(playerId) {
  // Find player by ID
  const player = MOCK_PLAYERS.find(p => p.id === playerId);
  
  if (!player) {
    showMessage('לא נמצא שחקן', 'error');
    return;
  }
  
  // Get modal and content
  const modal = document.getElementById('player-profile-modal');
  const content = modal.querySelector('.player-profile-content');
  
  // Show loading spinner
  content.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
    </div>
  `;
  
  // Show modal
  modal.style.display = 'block';
  
  // Simulate loading delay
  setTimeout(() => {
    // Create profile content
    content.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar">
          <img src="${player.profileImage || '../images/default-profile.jpg'}" alt="${player.name}">
        </div>
        <div class="profile-info">
          <h3>${player.name}</h3>
          <p>${getHebrewPosition(player.position)}, ${player.age}</p>
        </div>
      </div>
      
      <div class="profile-details">
        <h4>פרטים אישיים</h4>
        <div class="profile-details-grid">
          <div class="detail-item">
            <div class="detail-label">גיל</div>
            <div class="detail-value">${player.age}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">עמדה</div>
            <div class="detail-value">${getHebrewPosition(player.position)}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">רמה</div>
            <div class="detail-value">${getHebrewLevel(player.level)}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">רגל דומיננטית</div>
            <div class="detail-value">${getHebrewFoot(player.dominantFoot)}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">מועדון נוכחי</div>
            <div class="detail-value">${player.club || 'לא צוין'}</div>
          </div>
        </div>
      </div>
      
      <div class="profile-stats">
        <h4>סטטיסטיקות</h4>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${player.stats.consistency}</div>
            <div class="stat-label">ימים רצופים</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${player.stats.improvement}%</div>
            <div class="stat-label">שיפור</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${player.stats.ranking}</div>
            <div class="stat-label">דירוג</div>
          </div>
        </div>
      </div>
      
      <div class="profile-videos">
        <h4>סרטונים אחרונים</h4>
        <div class="videos-grid">
          ${player.videos.map(video => `
            <div class="video-card">
              <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}">
              </div>
              <div class="video-info">
                <div class="video-title">${video.title}</div>
                <div class="video-date">${formatDate(video.date)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="profile-actions">
        <button class="remove-btn" data-player-id="${player.id}">הסר מרשימת המעקב</button>
        <button class="contact-btn" data-player-id="${player.id}">צור קשר</button>
      </div>
    `;
    
    // Add event listeners to buttons
    const removeBtn = content.querySelector('.remove-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        removeFromWatchlist(player.id);
        modal.style.display = 'none';
      });
    }
    
    const contactBtn = content.querySelector('.contact-btn');
    if (contactBtn) {
      contactBtn.addEventListener('click', () => {
        showContactModal(player);
      });
    }
  }, 1000);
}

/**
 * Show contact modal
 * @param {Object} player - Player object
 */
function showContactModal(player) {
  // Get modal
  const modal = document.getElementById('contact-player-modal');
  
  // Set player name
  document.getElementById('contact-player-name').textContent = player.name;
  
  // Show modal
  modal.style.display = 'block';
}

/**
 * Remove player from watchlist
 * @param {number} playerId - Player ID
 */
function removeFromWatchlist(playerId) {
  // Remove player from watchlist
  watchlist = watchlist.filter(id => id !== playerId);
  saveWatchlist();
  
  // Show success message
  showMessage('השחקן הוסר מרשימת המעקב', 'success');
  
  // Reload watchlisted players
  loadWatchlistedPlayers();
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
 * Get Hebrew translation of skill level
 * @param {string} level - Skill level in English
 * @returns {string} - Skill level in Hebrew
 */
function getHebrewLevel(level) {
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

/**
 * Get Hebrew translation of dominant foot
 * @param {string} foot - Dominant foot in English
 * @returns {string} - Dominant foot in Hebrew
 */
function getHebrewFoot(foot) {
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

/**
 * Format date to Hebrew format
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL');
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