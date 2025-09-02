/**
 * Football Scouting Website - Discover Page JavaScript
 * Handles player discovery, filtering, and watchlist functionality
 */

'use strict';

// Mock data for players (same as in leaderboards.js)
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
  search: '',
  age: '',
  position: '',
  level: '',
  foot: '',
  consistency: 0,
  improvement: 0,
  ranking: 0
};

// Current sort
let currentSort = 'ranking';

// Current page
let currentPage = 1;
const playersPerPage = 6;

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
  
  // Initialize discover functionality
  initDiscover();
});

/**
 * Initialize discover functionality
 */
function initDiscover() {
  // Load watchlist from local storage
  loadWatchlist();
  
  // Set up search
  setupSearch();
  
  // Set up filters
  setupFilters();
  
  // Set up sort
  setupSort();
  
  // Set up pagination
  setupPagination();
  
  // Set up player profile modal
  setupPlayerProfileModal();
  
  // Set up contact player modal
  setupContactPlayerModal();
  
  // Load players
  loadPlayers();
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
 * Set up search functionality
 */
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  
  // Search button click
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      currentFilters.search = searchInput.value.trim();
      currentPage = 1;
      loadPlayers();
    });
  }
  
  // Search input enter key
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        currentFilters.search = searchInput.value.trim();
        currentPage = 1;
        loadPlayers();
      }
    });
  }
}

/**
 * Set up filters functionality
 */
function setupFilters() {
  const filtersForm = document.getElementById('filters-form');
  
  if (filtersForm) {
    // Set up range sliders
    setupRangeSlider('consistency-filter', 'consistency-value', '%d+');
    setupRangeSlider('improvement-filter', 'improvement-value', '%d%%+');
    setupRangeSlider('ranking-filter', 'ranking-value', '%d+');
    
    // Form submit
    filtersForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get filter values
      const ageFilter = document.getElementById('age-filter').value;
      const positionFilter = document.getElementById('position-filter').value;
      const levelFilter = document.getElementById('level-filter').value;
      const footFilter = document.getElementById('foot-filter').value;
      const consistencyFilter = parseInt(document.getElementById('consistency-filter').value);
      const improvementFilter = parseInt(document.getElementById('improvement-filter').value);
      const rankingFilter = parseInt(document.getElementById('ranking-filter').value);
      
      // Update current filters
      currentFilters = {
        search: currentFilters.search,
        age: ageFilter,
        position: positionFilter,
        level: levelFilter,
        foot: footFilter,
        consistency: consistencyFilter,
        improvement: improvementFilter,
        ranking: rankingFilter
      };
      
      // Reset to first page
      currentPage = 1;
      
      // Reload players
      loadPlayers();
    });
    
    // Reset filters
    filtersForm.addEventListener('reset', () => {
      // Reset range sliders
      document.getElementById('consistency-filter').value = 0;
      document.getElementById('improvement-filter').value = 0;
      document.getElementById('ranking-filter').value = 0;
      
      // Update range values
      document.getElementById('consistency-value').textContent = '0+';
      document.getElementById('improvement-value').textContent = '0%+';
      document.getElementById('ranking-value').textContent = '0+';
      
      // Clear current filters
      currentFilters = {
        search: currentFilters.search,
        age: '',
        position: '',
        level: '',
        foot: '',
        consistency: 0,
        improvement: 0,
        ranking: 0
      };
      
      // Reset to first page
      currentPage = 1;
      
      // Reload players after a short delay
      setTimeout(() => {
        loadPlayers();
      }, 100);
    });
  }
}

/**
 * Set up range slider
 * @param {string} sliderId - ID of the range slider element
 * @param {string} valueId - ID of the value display element
 * @param {string} format - Format string for the value display
 */
function setupRangeSlider(sliderId, valueId, format) {
  const slider = document.getElementById(sliderId);
  const valueDisplay = document.getElementById(valueId);
  
  if (slider && valueDisplay) {
    slider.addEventListener('input', () => {
      valueDisplay.textContent = format.replace('%d', slider.value);
    });
  }
}

/**
 * Set up sort functionality
 */
function setupSort() {
  const sortSelect = document.getElementById('sort-by');
  
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentSort = sortSelect.value;
      loadPlayers();
    });
  }
}

/**
 * Set up pagination functionality
 */
function setupPagination() {
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  
  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        loadPlayers();
      }
    });
  }
  
  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      const totalPlayers = filterPlayers(MOCK_PLAYERS).length;
      const totalPages = Math.ceil(totalPlayers / playersPerPage);
      
      if (currentPage < totalPages) {
        currentPage++;
        loadPlayers();
      }
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
 * Load players
 */
function loadPlayers() {
  const playersGrid = document.getElementById('players-grid');
  
  if (!playersGrid) return;
  
  // Show loading spinner
  playersGrid.innerHTML = `
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
      <p>טוען שחקנים...</p>
    </div>
  `;
  
  // Simulate loading delay
  setTimeout(() => {
    // Filter players
    const filteredPlayers = filterPlayers(MOCK_PLAYERS);
    
    // Sort players
    sortPlayers(filteredPlayers);
    
    // Update results count
    document.getElementById('results-count').textContent = filteredPlayers.length;
    
    // Paginate players
    const paginatedPlayers = paginatePlayers(filteredPlayers);
    
    // Update pagination
    updatePagination(filteredPlayers.length);
    
    // Check if there are players to display
    if (paginatedPlayers.length === 0) {
      playersGrid.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search"></i>
          <h3>לא נמצאו שחקנים</h3>
          <p>נסה לשנות את הסינון או החיפוש</p>
        </div>
      `;
      return;
    }
    
    // Clear players grid
    playersGrid.innerHTML = '';
    
    // Add players to grid
    paginatedPlayers.forEach(player => {
      const playerCard = document.createElement('div');
      playerCard.className = 'player-card';
      
      // Check if player is in watchlist
      const isInWatchlist = watchlist.includes(player.id);
      
      // Create player card HTML
      playerCard.innerHTML = `
        <div class="player-header">
          <div class="player-avatar">
            <img src="${player.profileImage || '../images/default-profile.svg'}" alt="${player.name}">
          </div>
          <div class="player-level">${getHebrewLevel(player.level)}</div>
          <div class="player-position">${getHebrewPosition(player.position)}</div>
        </div>
        <div class="player-content">
          <h3 class="player-name">${player.name}</h3>
          <div class="player-info">
            <span>${player.age} שנים</span>
            <span>${player.club || 'ללא מועדון'}</span>
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
            ${isInWatchlist ? 
              `<button class="remove-watchlist-btn" data-player-id="${player.id}">הסר מהרשימה</button>` : 
              `<button class="add-watchlist-btn" data-player-id="${player.id}">הוסף לרשימה</button>`
            }
          </div>
        </div>
      `;
      
      // Add player card to grid
      playersGrid.appendChild(playerCard);
    });
    
    // Add event listeners to buttons
    addPlayerCardEventListeners();
  }, 1000);
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
  
  // Add to watchlist buttons
  const addWatchlistButtons = document.querySelectorAll('.add-watchlist-btn');
  addWatchlistButtons.forEach(button => {
    button.addEventListener('click', () => {
      const playerId = parseInt(button.getAttribute('data-player-id'));
      addToWatchlist(playerId);
      
      // Update button
      button.className = 'remove-watchlist-btn';
      button.textContent = 'הסר מהרשימה';
      button.addEventListener('click', () => {
        removeFromWatchlist(playerId);
        loadPlayers();
      });
    });
  });
  
  // Remove from watchlist buttons
  const removeWatchlistButtons = document.querySelectorAll('.remove-watchlist-btn');
  removeWatchlistButtons.forEach(button => {
    button.addEventListener('click', () => {
      const playerId = parseInt(button.getAttribute('data-player-id'));
      removeFromWatchlist(playerId);
      
      // Update button
      button.className = 'add-watchlist-btn';
      button.textContent = 'הוסף לרשימה';
      button.addEventListener('click', () => {
        addToWatchlist(playerId);
        loadPlayers();
      });
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
    // Filter by search
    if (currentFilters.search) {
      const searchTerm = currentFilters.search.toLowerCase();
      const playerName = player.name.toLowerCase();
      const playerClub = (player.club || '').toLowerCase();
      
      if (!playerName.includes(searchTerm) && !playerClub.includes(searchTerm)) {
        return false;
      }
    }
    
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
    
    // Filter by dominant foot
    if (currentFilters.foot && player.dominantFoot !== currentFilters.foot) {
      return false;
    }
    
    // Filter by consistency
    if (currentFilters.consistency > 0 && player.stats.consistency < currentFilters.consistency) {
      return false;
    }
    
    // Filter by improvement
    if (currentFilters.improvement > 0 && player.stats.improvement < currentFilters.improvement) {
      return false;
    }
    
    // Filter by ranking
    if (currentFilters.ranking > 0 && player.stats.ranking < currentFilters.ranking) {
      return false;
    }
    
    return true;
  });
}

/**
 * Sort players based on current sort
 * @param {Array} players - Array of player objects
 */
function sortPlayers(players) {
  players.sort((a, b) => {
    switch (currentSort) {
      case 'ranking':
        return b.stats.ranking - a.stats.ranking;
      case 'consistency':
        return b.stats.consistency - a.stats.consistency;
      case 'improvement':
        return b.stats.improvement - a.stats.improvement;
      case 'age':
        return a.age - b.age;
      default:
        return b.stats.ranking - a.stats.ranking;
    }
  });
}

/**
 * Paginate players
 * @param {Array} players - Array of player objects
 * @returns {Array} - Paginated array of player objects
 */
function paginatePlayers(players) {
  const startIndex = (currentPage - 1) * playersPerPage;
  const endIndex = startIndex + playersPerPage;
  return players.slice(startIndex, endIndex);
}

/**
 * Update pagination
 * @param {number} totalPlayers - Total number of players
 */
function updatePagination(totalPlayers) {
  const totalPages = Math.ceil(totalPlayers / playersPerPage);
  const currentPageElement = document.getElementById('current-page');
  const totalPagesElement = document.getElementById('total-pages');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  
  // Update page numbers
  if (currentPageElement) {
    currentPageElement.textContent = currentPage;
  }
  
  if (totalPagesElement) {
    totalPagesElement.textContent = totalPages;
  }
  
  // Update button states
  if (prevPageBtn) {
    prevPageBtn.disabled = currentPage <= 1;
  }
  
  if (nextPageBtn) {
    nextPageBtn.disabled = currentPage >= totalPages;
  }
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
    // Check if player is in watchlist
    const isInWatchlist = watchlist.includes(player.id);
    
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
        ${isInWatchlist ?
          `<button class="watchlist-btn remove-watchlist-btn" data-player-id="${player.id}">הסר מרשימת המעקב</button>` :
          `<button class="watchlist-btn add-watchlist-btn" data-player-id="${player.id}">הוסף לרשימת המעקב</button>`
        }
        <button class="contact-btn" data-player-id="${player.id}">צור קשר</button>
      </div>
    `;
    
    // Add event listeners to buttons
    const watchlistBtn = content.querySelector('.watchlist-btn');
    if (watchlistBtn) {
      if (watchlistBtn.classList.contains('add-watchlist-btn')) {
        watchlistBtn.addEventListener('click', () => {
          addToWatchlist(player.id);
          showPlayerProfile(player.id); // Refresh profile
        });
      } else {
        watchlistBtn.addEventListener('click', () => {
          removeFromWatchlist(player.id);
          showPlayerProfile(player.id); // Refresh profile
        });
      }
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
 * Add player to watchlist
 * @param {number} playerId - Player ID
 */
function addToWatchlist(playerId) {
  // Check if player is already in watchlist
  if (!watchlist.includes(playerId)) {
    watchlist.push(playerId);
    saveWatchlist();
    showMessage('השחקן נוסף לרשימת המעקב', 'success');
  }
}

/**
 * Remove player from watchlist
 * @param {number} playerId - Player ID
 */
function removeFromWatchlist(playerId) {
  // Remove player from watchlist
  watchlist = watchlist.filter(id => id !== playerId);
  saveWatchlist();
  showMessage('השחקן הוסר מרשימת המעקב', 'success');
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