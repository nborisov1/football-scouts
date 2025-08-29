/**
 * Football Scouting Website - Admin Videos JavaScript
 * Handles admin videos page functionality
 */

'use strict';

// Mock data for videos
const MOCK_VIDEOS = [
  {
    id: 31,
    title: 'אתגר 1: שליטה בכדור',
    player: {
      id: 5,
      name: 'עידן אלון',
      age: 17,
      position: 'forward',
      level: 'beginner'
    },
    thumbnail: '../images/video-thumbnail-2.jpg',
    videoUrl: 'https://www.youtube.com/embed/example1',
    uploadDate: '2025-01-28T09:45:12Z',
    status: 'pending'
  },
  {
    id: 32,
    title: 'אתגר 2: כדרור',
    player: {
      id: 11,
      name: 'אריאל לוי',
      age: 16,
      position: 'midfielder',
      level: 'intermediate'
    },
    thumbnail: '../images/video-thumbnail-1.jpg',
    videoUrl: 'https://www.youtube.com/embed/example2',
    uploadDate: '2025-01-28T08:15:30Z',
    status: 'pending'
  },
  {
    id: 33,
    title: 'אתגר 3: בעיטות',
    player: {
      id: 6,
      name: 'רועי שמש',
      age: 16,
      position: 'midfielder',
      level: 'intermediate'
    },
    thumbnail: '../images/video-thumbnail-3.jpg',
    videoUrl: 'https://www.youtube.com/embed/example3',
    uploadDate: '2025-01-27T14:30:45Z',
    status: 'pending'
  },
  {
    id: 28,
    title: 'אתגר 1: שליטה בכדור',
    player: {
      id: 10,
      name: 'נדב כהן',
      age: 18,
      position: 'midfielder',
      level: 'intermediate'
    },
    thumbnail: '../images/video-thumbnail-1.jpg',
    videoUrl: 'https://www.youtube.com/embed/example4',
    uploadDate: '2025-01-26T10:20:15Z',
    status: 'approved'
  },
  {
    id: 29,
    title: 'אתגר 2: כדרור',
    player: {
      id: 10,
      name: 'נדב כהן',
      age: 18,
      position: 'midfielder',
      level: 'intermediate'
    },
    thumbnail: '../images/video-thumbnail-2.jpg',
    videoUrl: 'https://www.youtube.com/embed/example5',
    uploadDate: '2025-01-26T10:25:30Z',
    status: 'approved'
  },
  {
    id: 30,
    title: 'אתגר 3: בעיטות',
    player: {
      id: 10,
      name: 'נדב כהן',
      age: 18,
      position: 'midfielder',
      level: 'intermediate'
    },
    thumbnail: '../images/video-thumbnail-3.jpg',
    videoUrl: 'https://www.youtube.com/embed/example6',
    uploadDate: '2025-01-26T10:30:45Z',
    status: 'rejected'
  },
  {
    id: 25,
    title: 'אתגר 1: שליטה בכדור',
    player: {
      id: 9,
      name: 'עומר שלום',
      age: 19,
      position: 'goalkeeper',
      level: 'beginner'
    },
    thumbnail: '../images/video-thumbnail-3.jpg',
    videoUrl: 'https://www.youtube.com/embed/example7',
    uploadDate: '2025-01-25T15:10:20Z',
    status: 'approved'
  },
  {
    id: 26,
    title: 'אתגר 2: כדרור',
    player: {
      id: 9,
      name: 'עומר שלום',
      age: 19,
      position: 'goalkeeper',
      level: 'beginner'
    },
    thumbnail: '../images/video-thumbnail-1.jpg',
    videoUrl: 'https://www.youtube.com/embed/example8',
    uploadDate: '2025-01-25T15:15:30Z',
    status: 'rejected'
  },
  {
    id: 27,
    title: 'אתגר 3: בעיטות',
    player: {
      id: 9,
      name: 'עומר שלום',
      age: 19,
      position: 'goalkeeper',
      level: 'beginner'
    },
    thumbnail: '../images/video-thumbnail-2.jpg',
    videoUrl: 'https://www.youtube.com/embed/example9',
    uploadDate: '2025-01-25T15:20:45Z',
    status: 'approved'
  }
];

// Current filters
let currentFilters = {
  status: 'pending',
  challenge: '',
  player: '',
  date: ''
};

// Current sort
let currentSort = 'date-desc';

// Current page
let currentPage = 1;
const videosPerPage = 5;

// Current video
let currentVideo = null;

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
  
  // Initialize videos page
  initVideosPage();
});

/**
 * Initialize videos page
 */
function initVideosPage() {
  // Set up filters
  setupFilters();
  
  // Set up sort
  setupSort();
  
  // Set up pagination
  setupPagination();
  
  // Set up video preview modal
  setupVideoPreviewModal();
  
  // Load videos
  loadVideos();
  
  // Load stats
  loadStats();
}

/**
 * Set up filters
 */
function setupFilters() {
  const filterForm = document.getElementById('videos-filter-form');
  
  if (filterForm) {
    filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get filter values
      const statusFilter = document.getElementById('status-filter').value;
      const challengeFilter = document.getElementById('challenge-filter').value;
      const playerSearch = document.getElementById('player-search').value;
      const dateFilter = document.getElementById('date-filter').value;
      
      // Update current filters
      currentFilters = {
        status: statusFilter,
        challenge: challengeFilter,
        player: playerSearch,
        date: dateFilter
      };
      
      // Reset to first page
      currentPage = 1;
      
      // Reload videos
      loadVideos();
    });
    
    // Reset filters
    filterForm.addEventListener('reset', () => {
      // Reset to default filters
      currentFilters = {
        status: 'pending',
        challenge: '',
        player: '',
        date: ''
      };
      
      // Reset to first page
      currentPage = 1;
      
      // Reload videos after a short delay
      setTimeout(() => {
        // Update status filter select
        document.getElementById('status-filter').value = 'pending';
        
        // Reload videos
        loadVideos();
      }, 100);
    });
  }
}

/**
 * Set up sort
 */
function setupSort() {
  const sortSelect = document.getElementById('videos-sort');
  
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentSort = sortSelect.value;
      loadVideos();
    });
  }
}

/**
 * Set up pagination
 */
function setupPagination() {
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  
  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        loadVideos();
      }
    });
  }
  
  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      const filteredVideos = filterVideos(MOCK_VIDEOS);
      const totalPages = Math.ceil(filteredVideos.length / videosPerPage);
      
      if (currentPage < totalPages) {
        currentPage++;
        loadVideos();
      }
    });
  }
}

/**
 * Set up video preview modal
 */
function setupVideoPreviewModal() {
  const modal = document.getElementById('video-preview-modal');
  const closeButton = modal.querySelector('.close-modal');
  const approveButton = document.getElementById('approve-video-btn');
  const rejectButton = document.getElementById('reject-video-btn');
  
  // Close modal when clicking the X
  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
    
    // Clear video player
    document.querySelector('.video-player').innerHTML = '';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
      
      // Clear video player
      document.querySelector('.video-player').innerHTML = '';
    }
  });
  
  // Approve video
  if (approveButton) {
    approveButton.addEventListener('click', () => {
      if (currentVideo) {
        // Get feedback
        const feedback = document.getElementById('video-feedback').value;
        
        // Approve video
        approveVideo(currentVideo.id, feedback);
        
        // Close modal
        modal.style.display = 'none';
        
        // Clear video player
        document.querySelector('.video-player').innerHTML = '';
      }
    });
  }
  
  // Reject video
  if (rejectButton) {
    rejectButton.addEventListener('click', () => {
      if (currentVideo) {
        // Get feedback
        const feedback = document.getElementById('video-feedback').value;
        
        // Reject video
        rejectVideo(currentVideo.id, feedback);
        
        // Close modal
        modal.style.display = 'none';
        
        // Clear video player
        document.querySelector('.video-player').innerHTML = '';
      }
    });
  }
}

/**
 * Load videos
 */
function loadVideos() {
  const videosList = document.getElementById('videos-list');
  
  if (!videosList) return;
  
  // Show loading
  videosList.innerHTML = `
    <tr>
      <td colspan="6" class="loading-cell">
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>טוען סרטונים...</p>
        </div>
      </td>
    </tr>
  `;
  
  // Simulate loading delay
  setTimeout(() => {
    // Filter videos
    const filteredVideos = filterVideos(MOCK_VIDEOS);
    
    // Sort videos
    sortVideos(filteredVideos);
    
    // Paginate videos
    const paginatedVideos = paginateVideos(filteredVideos);
    
    // Update pagination
    updatePagination(filteredVideos.length);
    
    // Clear videos list
    videosList.innerHTML = '';
    
    // Check if there are videos to display
    if (paginatedVideos.length === 0) {
      videosList.innerHTML = `
        <tr>
          <td colspan="6" class="empty-cell">
            <div class="empty-message">
              <i class="fas fa-search"></i>
              <p>לא נמצאו סרטונים</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }
    
    // Add videos to list
    paginatedVideos.forEach(video => {
      const row = document.createElement('tr');
      
      // Create status class
      let statusClass = '';
      let statusText = '';
      
      switch (video.status) {
        case 'pending':
          statusClass = 'status-pending';
          statusText = 'ממתין לאישור';
          break;
        case 'approved':
          statusClass = 'status-approved';
          statusText = 'מאושר';
          break;
        case 'rejected':
          statusClass = 'status-rejected';
          statusText = 'נדחה';
          break;
      }
      
      // Create row HTML
      row.innerHTML = `
        <td>
          <div class="video-thumbnail-small">
            <img src="${video.thumbnail}" alt="${video.title}">
          </div>
        </td>
        <td>${video.title}</td>
        <td>${video.player.name}</td>
        <td>${formatDate(video.uploadDate)}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>
          <div class="table-actions">
            <button class="action-btn preview-btn" data-video-id="${video.id}" title="צפה בסרטון">
              <i class="fas fa-play"></i>
            </button>
            ${video.status === 'pending' ? `
              <button class="action-btn approve-btn" data-video-id="${video.id}" title="אשר סרטון">
                <i class="fas fa-check"></i>
              </button>
              <button class="action-btn reject-btn" data-video-id="${video.id}" title="דחה סרטון">
                <i class="fas fa-times"></i>
              </button>
            ` : ''}
          </div>
        </td>
      `;
      
      // Add row to table
      videosList.appendChild(row);
    });
    
    // Add event listeners to buttons
    addVideoButtonEventListeners();
  }, 1000);
}

/**
 * Add event listeners to video buttons
 */
function addVideoButtonEventListeners() {
  // Preview buttons
  const previewButtons = document.querySelectorAll('.preview-btn');
  previewButtons.forEach(button => {
    button.addEventListener('click', () => {
      const videoId = parseInt(button.getAttribute('data-video-id'));
      previewVideo(videoId);
    });
  });
  
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
 * Preview video
 * @param {number} videoId - Video ID
 */
function previewVideo(videoId) {
  // Find video
  const video = MOCK_VIDEOS.find(v => v.id === videoId);
  
  if (!video) {
    showMessage('לא נמצא סרטון', 'error');
    return;
  }
  
  // Set current video
  currentVideo = video;
  
  // Get modal
  const modal = document.getElementById('video-preview-modal');
  
  // Update modal content
  document.getElementById('video-title').textContent = video.title;
  document.getElementById('video-player-name').textContent = video.player.name;
  document.getElementById('video-player-age').textContent = video.player.age;
  document.getElementById('video-player-position').textContent = getHebrewPosition(video.player.position);
  document.getElementById('video-player-level').textContent = getHebrewLevel(video.player.level);
  document.getElementById('video-upload-date').textContent = formatDate(video.uploadDate);
  
  // Clear feedback
  document.getElementById('video-feedback').value = '';
  
  // Show/hide approve/reject buttons based on status
  const approveButton = document.getElementById('approve-video-btn');
  const rejectButton = document.getElementById('reject-video-btn');
  
  if (video.status === 'pending') {
    approveButton.style.display = 'block';
    rejectButton.style.display = 'block';
  } else {
    approveButton.style.display = 'none';
    rejectButton.style.display = 'none';
  }
  
  // Load video player
  const videoPlayer = document.querySelector('.video-player');
  videoPlayer.innerHTML = `
    <iframe width="100%" height="400" src="${video.videoUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  `;
  
  // Show modal
  modal.style.display = 'block';
}

/**
 * Approve video
 * @param {number} videoId - Video ID
 * @param {string} feedback - Feedback message
 */
function approveVideo(videoId, feedback = '') {
  // Find video
  const videoIndex = MOCK_VIDEOS.findIndex(v => v.id === videoId);
  
  if (videoIndex === -1) {
    showMessage('לא נמצא סרטון', 'error');
    return;
  }
  
  // Update video status
  MOCK_VIDEOS[videoIndex].status = 'approved';
  
  // In a real application, this would send feedback to the player
  
  // Show message
  showMessage('הסרטון אושר בהצלחה', 'success');
  
  // Reload videos
  loadVideos();
  
  // Reload stats
  loadStats();
}

/**
 * Reject video
 * @param {number} videoId - Video ID
 * @param {string} feedback - Feedback message
 */
function rejectVideo(videoId, feedback = '') {
  // Find video
  const videoIndex = MOCK_VIDEOS.findIndex(v => v.id === videoId);
  
  if (videoIndex === -1) {
    showMessage('לא נמצא סרטון', 'error');
    return;
  }
  
  // Update video status
  MOCK_VIDEOS[videoIndex].status = 'rejected';
  
  // In a real application, this would send feedback to the player
  
  // Show message
  showMessage('הסרטון נדחה', 'error');
  
  // Reload videos
  loadVideos();
  
  // Reload stats
  loadStats();
}

/**
 * Filter videos based on current filters
 * @param {Array} videos - Array of video objects
 * @returns {Array} - Filtered array of video objects
 */
function filterVideos(videos) {
  return videos.filter(video => {
    // Filter by status
    if (currentFilters.status && video.status !== currentFilters.status) {
      return false;
    }
    
    // Filter by challenge
    if (currentFilters.challenge) {
      const challengeId = parseInt(currentFilters.challenge);
      if (!video.title.includes(`אתגר ${challengeId}`)) {
        return false;
      }
    }
    
    // Filter by player
    if (currentFilters.player) {
      const playerName = currentFilters.player.toLowerCase();
      if (!video.player.name.toLowerCase().includes(playerName)) {
        return false;
      }
    }
    
    // Filter by date
    if (currentFilters.date) {
      const uploadDate = new Date(video.uploadDate);
      const now = new Date();
      
      switch (currentFilters.date) {
        case 'today':
          // Check if upload date is today
          if (uploadDate.toDateString() !== now.toDateString()) {
            return false;
          }
          break;
        case 'week':
          // Check if upload date is within the last 7 days
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          if (uploadDate < weekAgo) {
            return false;
          }
          break;
        case 'month':
          // Check if upload date is within the last 30 days
          const monthAgo = new Date();
          monthAgo.setDate(now.getDate() - 30);
          if (uploadDate < monthAgo) {
            return false;
          }
          break;
      }
    }
    
    return true;
  });
}

/**
 * Sort videos based on current sort
 * @param {Array} videos - Array of video objects
 */
function sortVideos(videos) {
  videos.sort((a, b) => {
    switch (currentSort) {
      case 'date-desc':
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      case 'date-asc':
        return new Date(a.uploadDate) - new Date(b.uploadDate);
      case 'player-asc':
        return a.player.name.localeCompare(b.player.name);
      case 'player-desc':
        return b.player.name.localeCompare(a.player.name);
      default:
        return new Date(b.uploadDate) - new Date(a.uploadDate);
    }
  });
}

/**
 * Paginate videos
 * @param {Array} videos - Array of video objects
 * @returns {Array} - Paginated array of video objects
 */
function paginateVideos(videos) {
  const startIndex = (currentPage - 1) * videosPerPage;
  const endIndex = startIndex + videosPerPage;
  return videos.slice(startIndex, endIndex);
}

/**
 * Update pagination
 * @param {number} totalVideos - Total number of videos
 */
function updatePagination(totalVideos) {
  const totalPages = Math.ceil(totalVideos / videosPerPage);
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
 * Load stats
 */
function loadStats() {
  // Count videos by status
  const pendingCount = MOCK_VIDEOS.filter(v => v.status === 'pending').length;
  const approvedCount = MOCK_VIDEOS.filter(v => v.status === 'approved').length;
  const rejectedCount = MOCK_VIDEOS.filter(v => v.status === 'rejected').length;
  const totalCount = MOCK_VIDEOS.length;
  
  // Update stats
  document.getElementById('pending-videos-count').textContent = pendingCount;
  document.getElementById('approved-videos-count').textContent = approvedCount;
  document.getElementById('rejected-videos-count').textContent = rejectedCount;
  document.getElementById('total-videos-count').textContent = totalCount;
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
 * Format date
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