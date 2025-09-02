/**
 * Football Scouting Website - Leaderboards JavaScript
 * Handles leaderboards functionality and player profiles
 */

'use strict';

// Mock data for leaderboards
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

// Current filters
let currentFilters = {
  age: '',
  position: '',
  level: ''
};

document.addEventListener('DOMContentLoaded', () => {
  // Initialize leaderboards
  initLeaderboards();
});

/**
 * Initialize leaderboards functionality
 */
function initLeaderboards() {
  // Load leaderboards data
  loadLeaderboardsData();
  
  // Set up tabs
  setupTabs();
  
  // Set up filters
  setupFilters();
  
  // Set up player profile modal
  setupPlayerProfileModal();
}

/**
 * Load leaderboards data
 */
function loadLeaderboardsData() {
  // In a real application, this would fetch data from a server
  // For this demo, we'll use the mock data
  
  // Load consistent players leaderboard
  const consistentPlayers = [...MOCK_PLAYERS].sort((a, b) => b.stats.consistency - a.stats.consistency);
  populateLeaderboard('consistent-players', consistentPlayers, 'consistency', 'ימים רצופים');
  
  // Load improved players leaderboard
  const improvedPlayers = [...MOCK_PLAYERS].sort((a, b) => b.stats.improvement - a.stats.improvement);
  populateLeaderboard('improved-players', improvedPlayers, 'improvement', 'אחוז שיפור');
  
  // Load ranked players leaderboard
  const rankedPlayers = [...MOCK_PLAYERS].sort((a, b) => b.stats.ranking - a.stats.ranking);
  populateLeaderboard('ranked-players', rankedPlayers, 'ranking', 'נקודות');
}

/**
 * Populate leaderboard with players
 * @param {string} leaderboardId - ID of the leaderboard element
 * @param {Array} players - Array of player objects
 * @param {string} statKey - Key of the stat to display
 * @param {string} statLabel - Label for the stat column
 */
function populateLeaderboard(leaderboardId, players, statKey, statLabel) {
  const leaderboard = document.getElementById(leaderboardId);
  
  if (!leaderboard) return;
  
  // Clear leaderboard
  leaderboard.innerHTML = '';
  
  // Filter players based on current filters
  const filteredPlayers = filterPlayers(players);
  
  // Check if there are players to display
  if (filteredPlayers.length === 0) {
    leaderboard.innerHTML = `
      <tr>
        <td colspan="7" class="no-results">לא נמצאו שחקנים התואמים את הסינון</td>
      </tr>
    `;
    return;
  }
  
  // Add players to leaderboard
  filteredPlayers.forEach((player, index) => {
    const rank = index + 1;
    const row = document.createElement('tr');
    
    // Rank
    const rankCell = document.createElement('td');
    rankCell.className = `rank rank-${rank <= 3 ? rank : ''}`;
    rankCell.textContent = rank;
    row.appendChild(rankCell);
    
    // Player
    const playerCell = document.createElement('td');
    playerCell.innerHTML = `
      <div class="player-info">
        <div class="player-avatar">
          <img src="${player.profileImage || '../images/default-profile.svg'}" alt="${player.name}">
        </div>
        <div class="player-name">${player.name}</div>
      </div>
    `;
    row.appendChild(playerCell);
    
    // Age
    const ageCell = document.createElement('td');
    ageCell.textContent = player.age;
    row.appendChild(ageCell);
    
    // Position
    const positionCell = document.createElement('td');
    positionCell.textContent = getHebrewPosition(player.position);
    row.appendChild(positionCell);
    
    // Level
    const levelCell = document.createElement('td');
    levelCell.textContent = getHebrewLevel(player.level);
    row.appendChild(levelCell);
    
    // Stat
    const statCell = document.createElement('td');
    statCell.textContent = player.stats[statKey];
    if (statKey === 'improvement') {
      statCell.textContent += '%';
    }
    row.appendChild(statCell);
    
    // Actions
    const actionsCell = document.createElement('td');
    actionsCell.innerHTML = `
      <button class="view-profile-btn" data-player-id="${player.id}">צפה בפרופיל</button>
    `;
    row.appendChild(actionsCell);
    
    // Add row to leaderboard
    leaderboard.appendChild(row);
  });
  
  // Add event listeners to view profile buttons
  const viewProfileButtons = leaderboard.querySelectorAll('.view-profile-btn');
  viewProfileButtons.forEach(button => {
    button.addEventListener('click', () => {
      const playerId = parseInt(button.getAttribute('data-player-id'));
      showPlayerProfile(playerId);
    });
  });
}

/**
 * Filter players based on current filters
 * @param {Array} players - Array of player objects
 * @returns {Array} - Filtered array of player objects
 */
function filterPlayers(players) {
  return players.filter(player => {
    // Filter by age
    if (currentFilters.age) {
      const [minAge, maxAge] = currentFilters.age.split('-');
      if (minAge && maxAge) {
        if (player.age < parseInt(minAge) || player.age > parseInt(maxAge)) {
          return false;
        }
      } else if (minAge === '20+') {
        if (player.age < 20) {
          return false;
        }
      }
    }
    
    // Filter by position
    if (currentFilters.position && player.position !== currentFilters.position) {
      return false;
    }
    
    // Filter by level
    if (currentFilters.level && player.level !== currentFilters.level) {
      return false;
    }
    
    return true;
  });
}

/**
 * Set up tabs functionality
 */
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Get the tab target
      const tabTarget = button.getAttribute('data-tab');
      
      // Remove active class from all buttons
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Add active class to clicked button
      button.classList.add('active');
      
      // Hide all leaderboards
      const leaderboards = document.querySelectorAll('.leaderboard');
      leaderboards.forEach(board => {
        board.classList.remove('active');
      });
      
      // Show the target leaderboard
      document.getElementById(`${tabTarget}-leaderboard`).classList.add('active');
    });
  });
}

/**
 * Set up filters functionality
 */
function setupFilters() {
  const filtersForm = document.getElementById('filters-form');
  
  if (filtersForm) {
    filtersForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get filter values
      const ageFilter = document.getElementById('age-filter').value;
      const positionFilter = document.getElementById('position-filter').value;
      const levelFilter = document.getElementById('level-filter').value;
      
      // Update current filters
      currentFilters = {
        age: ageFilter,
        position: positionFilter,
        level: levelFilter
      };
      
      // Reload leaderboards data
      loadLeaderboardsData();
    });
    
    // Reset filters
    filtersForm.addEventListener('reset', () => {
      // Clear current filters
      currentFilters = {
        age: '',
        position: '',
        level: ''
      };
      
      // Reload leaderboards data after a short delay
      setTimeout(() => {
        loadLeaderboardsData();
      }, 100);
    });
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
          <img src="${player.profileImage || '../images/default-profile.svg'}" alt="${player.name}">
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
        <button class="contact-btn" data-player-id="${player.id}">צור קשר</button>
      </div>
    `;
    
    // Add event listener to contact button
    const contactButton = content.querySelector('.contact-btn');
    contactButton.addEventListener('click', () => {
      // In a real application, this would open a contact form
      // For this demo, we'll just show a message
      showMessage(`נשלחה בקשת יצירת קשר עם ${player.name}`, 'success');
      modal.style.display = 'none';
    });
  }, 1000);
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