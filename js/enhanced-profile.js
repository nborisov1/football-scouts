/**
 * Enhanced Profile Manager - Complete Profile System with Firestore Integration
 * Handles profile display, editing, completion tracking, and recommendations
 */

'use strict';

import { AuthManager } from './auth-manager.js';
import { ProfileManager, PROFILE_TRANSLATIONS } from './profile-manager.js';
import { USER_TYPES, showMessage } from './utils.js';

/**
 * Enhanced Profile UI Manager
 */
class EnhancedProfileManager {
  constructor() {
    this.authManager = new AuthManager();
    this.profileManager = new ProfileManager();
    this.currentUser = null;
    this.isEditing = false;
  }

  /**
   * Initialize the profile page
   */
  async init() {
    console.log('🔄 Initializing Enhanced Profile Manager...');
    
    try {
      // Get current user
      this.currentUser = this.authManager.getCurrentUser();
      
      if (!this.currentUser) {
        throw new Error('No authenticated user found');
      }

      console.log('✅ User found:', this.currentUser);

      // Initialize UI
      this.setupEventListeners();
      this.updateProfileHeader();
      this.updateProfileCompletion();
      this.displayProfileInfo();
      this.displayRecommendations();
      this.configureForUserType();
      this.loadUserContent();

      console.log('✅ Enhanced Profile Manager initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing profile:', error);
      showMessage('שגיאה בטעינת הפרופיל', 'error');
      
      // Redirect to home if no user
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 2000);
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Edit profile button
    const editBtn = document.getElementById('edit-profile-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => this.openEditModal());
    }

    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        if (modal) {
          modal.style.display = 'none';
        }
      });
    });

    // Edit form submission
    const editForm = document.getElementById('edit-profile-form');
    if (editForm) {
      editForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
    }

    // Cancel edit button
    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closeEditModal());
    }

    // Modal backdrop clicks
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    });
  }

  /**
   * Update profile header
   */
  updateProfileHeader() {
    const header = document.querySelector('.profile-header h2');
    if (header) {
      const userType = this.translateUserType(this.currentUser.type);
      header.textContent = `הפרופיל של ${this.currentUser.name} (${userType})`;
    }
  }

  /**
   * Update profile completion section
   */
  updateProfileCompletion() {
    const completion = this.profileManager.getProfileCompletion(this.currentUser);
    
    // Update completion bar
    const progressBar = document.getElementById('completion-progress');
    const percentageText = document.getElementById('completion-percentage');
    
    if (progressBar) {
      progressBar.style.width = `${completion}%`;
      progressBar.className = `completion-progress ${this.getCompletionClass(completion)}`;
    }
    
    if (percentageText) {
      percentageText.textContent = `${completion}%`;
    }
  }

  /**
   * Get completion bar CSS class based on percentage
   */
  getCompletionClass(percentage) {
    if (percentage >= 80) return 'high';
    if (percentage >= 50) return 'medium';
    return 'low';
  }

  /**
   * Display profile information
   */
  displayProfileInfo() {
    const infoGrid = document.getElementById('profile-info-grid');
    if (!infoGrid) return;

    const info = this.generateProfileInfo();
    
    infoGrid.innerHTML = info.map(item => `
      <div class="info-item">
        <div class="info-label">${item.label}</div>
        <div class="info-value">${item.value}</div>
      </div>
    `).join('');
  }

  /**
   * Generate profile information based on user type
   */
  generateProfileInfo() {
    const info = [
      { label: 'שם', value: this.currentUser.name || 'לא צוין' },
      { label: 'אימייל', value: this.currentUser.email || 'לא צוין' },
      { label: 'סוג משתמש', value: this.translateUserType(this.currentUser.type) }
    ];

    if (this.currentUser.type === USER_TYPES.PLAYER) {
      info.push(
        { label: 'גיל', value: this.currentUser.age || 'לא צוין' },
        { label: 'עמדה', value: this.translatePosition(this.currentUser.position) },
        { label: 'רגל דומיננטית', value: this.translateFoot(this.currentUser.dominantFoot) },
        { label: 'רמה', value: this.translateLevel(this.currentUser.level) }
      );

      if (this.currentUser.height) {
        info.push({ label: 'גובה', value: `${this.currentUser.height} ס"מ` });
      }
      if (this.currentUser.weight) {
        info.push({ label: 'משקל', value: `${this.currentUser.weight} ק"ג` });
      }
    }

    if (this.currentUser.type === USER_TYPES.SCOUT) {
      info.push(
        { label: 'מועדון', value: this.currentUser.club || 'לא צוין' },
        { label: 'תפקיד', value: this.translateScoutPosition(this.currentUser.position) },
        { label: 'ניסיון', value: this.currentUser.experience || 'לא צוין' },
        { label: 'התמחות', value: this.currentUser.specialization || 'לא צוין' }
      );
    }

    if (this.currentUser.city) {
      info.push({ label: 'עיר', value: this.currentUser.city });
    }

    return info;
  }

  /**
   * Display profile recommendations
   */
  displayRecommendations() {
    const container = document.getElementById('profile-recommendations');
    if (!container) return;

    const recommendations = this.profileManager.getProfileRecommendations(this.currentUser);
    
    if (recommendations.length === 0) {
      container.innerHTML = '<p class="no-recommendations">הפרופיל שלך מושלם! 🎉</p>';
      return;
    }

    container.innerHTML = recommendations.map(rec => `
      <div class="recommendation ${rec.priority}">
        <div class="recommendation-icon">
          <i class="fas ${this.getRecommendationIcon(rec.type)}"></i>
        </div>
        <div class="recommendation-content">
          <div class="recommendation-message">${rec.message}</div>
          <button class="recommendation-action btn btn-sm" data-action="${rec.action}">
            בצע עכשיו
          </button>
        </div>
      </div>
    `).join('');

    // Add event listeners for recommendation actions
    container.querySelectorAll('.recommendation-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.handleRecommendationAction(e.target.dataset.action);
      });
    });
  }

  /**
   * Get recommendation icon
   */
  getRecommendationIcon(type) {
    const icons = {
      image: 'fa-camera',
      basic_info: 'fa-user-edit',
      challenges: 'fa-trophy',
      activity: 'fa-search'
    };
    return icons[type] || 'fa-info-circle';
  }

  /**
   * Handle recommendation actions
   */
  handleRecommendationAction(action) {
    switch (action) {
      case 'edit_profile':
        this.openEditModal();
        break;
      case 'upload_photo':
        document.getElementById('change-photo-modal').style.display = 'block';
        break;
      case 'start_challenges':
        window.location.href = 'challenges.html';
        break;
      case 'discover_players':
        window.location.href = 'discover.html';
        break;
      default:
        showMessage('פעולה זו עדיין לא זמינה', 'info');
    }
  }

  /**
   * Configure UI based on user type
   */
  configureForUserType() {
    const elements = {
      videos: document.getElementById('videos-section'),
      watchlist: document.getElementById('watchlist-section'),
      stats: document.getElementById('profile-stats-section')
    };

    // Hide/show sections based on user type
    if (this.currentUser.type === USER_TYPES.PLAYER) {
      this.showElement(elements.videos);
      this.hideElement(elements.watchlist);
      this.updatePlayerStats();
    } else if (this.currentUser.type === USER_TYPES.SCOUT) {
      this.hideElement(elements.videos);
      this.showElement(elements.watchlist);
      this.hideElement(elements.stats);
      this.loadScoutWatchlist();
    } else {
      this.hideElement(elements.videos);
      this.hideElement(elements.watchlist);
      this.hideElement(elements.stats);
    }
  }

  /**
   * Update player statistics
   */
  updatePlayerStats() {
    if (this.currentUser.type !== USER_TYPES.PLAYER) return;

    const stats = this.currentUser.stats || {};
    
    this.updateElement('#player-level', this.translateLevel(this.currentUser.level));
    this.updateElement('#player-consistency', stats.consistency || 0);
    this.updateElement('#player-improvement', `${stats.improvement || 0}%`);
    this.updateElement('#player-ranking', stats.ranking || 'לא דורג');
  }

  /**
   * Load scout watchlist
   */
  async loadScoutWatchlist() {
    if (this.currentUser.type !== USER_TYPES.SCOUT) return;

    const container = document.getElementById('scout-watchlist');
    if (!container) return;

    try {
      if (!this.currentUser.watchlist || this.currentUser.watchlist.length === 0) {
        container.innerHTML = '<p class="no-watchlist-message">רשימת המעקב ריקה. <a href="discover.html">התחל לעקוב אחרי שחקנים</a></p>';
        return;
      }

      container.innerHTML = '<p class="loading-message">טוען רשימת מעקב...</p>';

      // Load watched players (simulated for now)
      const watchlistHTML = this.currentUser.watchlist.map(playerId => `
        <div class="watchlist-item">
          <div class="player-avatar">
            <i class="fas fa-user"></i>
          </div>
          <div class="player-info">
            <div class="player-name">שחקן ${playerId.slice(-4)}</div>
            <div class="player-position">קשר</div>
          </div>
          <div class="watchlist-actions">
            <button class="btn btn-sm btn-secondary" data-player-id="${playerId}">
              צפה בפרופיל
            </button>
          </div>
        </div>
      `).join('');

      container.innerHTML = watchlistHTML;
    } catch (error) {
      console.error('❌ Error loading watchlist:', error);
      container.innerHTML = '<p class="error-message">שגיאה בטעינת רשימת המעקב</p>';
    }
  }

  /**
   * Load user content (videos, activity, etc.)
   */
  async loadUserContent() {
    if (this.currentUser.type === USER_TYPES.PLAYER) {
      await this.loadPlayerVideos();
    }
    await this.loadRecentActivity();
  }

  /**
   * Load player videos
   */
  async loadPlayerVideos() {
    const container = document.getElementById('player-videos');
    if (!container) return;

    try {
      const videos = this.currentUser.challenges?.initial?.videos || [];
      
      if (videos.length === 0) {
        container.innerHTML = `
          <div class="no-videos-state">
            <i class="fas fa-video fa-3x"></i>
            <h4>אין סרטונים עדיין</h4>
            <p>התחל את האתגרים שלך כדי להעלות סרטונים</p>
            <a href="challenges.html" class="btn btn-primary">התחל אתגרים</a>
          </div>
        `;
        return;
      }

      const videosHTML = videos.map((video, index) => `
        <div class="video-card">
          <div class="video-thumbnail">
            <i class="fas fa-play"></i>
          </div>
          <div class="video-info">
            <div class="video-title">אתגר ${video.challengeId}</div>
            <div class="video-meta">
              <span class="video-date">${this.formatDate(video.uploadDate)}</span>
              <span class="video-status status-${video.status}">
                ${this.translateStatus(video.status)}
              </span>
            </div>
          </div>
        </div>
      `).join('');

      container.innerHTML = videosHTML;
    } catch (error) {
      console.error('❌ Error loading videos:', error);
      container.innerHTML = '<p class="error-message">שגיאה בטעינת הסרטונים</p>';
    }
  }

  /**
   * Load recent activity
   */
  async loadRecentActivity() {
    const container = document.getElementById('player-activity');
    if (!container) return;

    try {
      const activities = this.generateActivityList();
      
      if (activities.length === 0) {
        container.innerHTML = '<p class="no-activity-message">אין פעילות להצגה</p>';
        return;
      }

      const activitiesHTML = activities.slice(0, 5).map(activity => `
        <div class="activity-item">
          <div class="activity-icon ${activity.type}">
            <i class="fas ${activity.icon}"></i>
          </div>
          <div class="activity-content">
            <div class="activity-description">${activity.description}</div>
            <div class="activity-date">${this.formatDate(activity.date)}</div>
          </div>
        </div>
      `).join('');

      container.innerHTML = activitiesHTML;
    } catch (error) {
      console.error('❌ Error loading activity:', error);
      container.innerHTML = '<p class="error-message">שגיאה בטעינת הפעילות</p>';
    }
  }

  /**
   * Generate activity list
   */
  generateActivityList() {
    const activities = [];

    // Registration activity
    if (this.currentUser.createdAt) {
      activities.push({
        type: 'registration',
        icon: 'fa-user-plus',
        description: 'הצטרף לפלטפורמה',
        date: this.currentUser.createdAt
      });
    }

    // Type-specific activities
    if (this.currentUser.type === USER_TYPES.PLAYER) {
      // Challenge activities
      const challenges = this.currentUser.challenges?.initial;
      if (challenges?.completed) {
        activities.push({
          type: 'challenge',
          icon: 'fa-trophy',
          description: 'השלים את האתגרים הראשוניים',
          date: challenges.completedAt || this.currentUser.createdAt
        });
      }

      // Video uploads
      challenges?.videos?.forEach(video => {
        activities.push({
          type: 'video',
          icon: 'fa-video',
          description: `העלה סרטון עבור אתגר ${video.challengeId}`,
          date: video.uploadDate || this.currentUser.createdAt
        });
      });
    }

    // Sort by date (newest first)
    return activities.sort((a, b) => {
      const dateA = new Date(a.date.seconds ? a.date.seconds * 1000 : a.date);
      const dateB = new Date(b.date.seconds ? b.date.seconds * 1000 : b.date);
      return dateB - dateA;
    });
  }

  /**
   * Open edit profile modal
   */
  openEditModal() {
    const modal = document.getElementById('edit-profile-modal');
    if (!modal) return;

    // Populate form with current data
    this.populateEditForm();
    
    // Show/hide sections based on user type
    const playerFields = document.getElementById('player-fields');
    const scoutFields = document.getElementById('scout-fields');
    
    if (playerFields) {
      playerFields.style.display = this.currentUser.type === USER_TYPES.PLAYER ? 'block' : 'none';
    }
    if (scoutFields) {
      scoutFields.style.display = this.currentUser.type === USER_TYPES.SCOUT ? 'block' : 'none';
    }

    modal.style.display = 'block';
    this.isEditing = true;
  }

  /**
   * Close edit profile modal
   */
  closeEditModal() {
    const modal = document.getElementById('edit-profile-modal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.isEditing = false;
  }

  /**
   * Populate edit form with current user data
   */
  populateEditForm() {
    // Basic fields
    this.setFormValue('edit-name', this.currentUser.name);
    this.setFormValue('edit-email', this.currentUser.email);
    this.setFormValue('edit-city', this.currentUser.city);
    this.setFormValue('edit-country', this.currentUser.country);
    
    // Privacy setting
    const isPublicCheckbox = document.getElementById('edit-is-public');
    if (isPublicCheckbox) {
      isPublicCheckbox.checked = this.currentUser.isPublic !== false;
    }

    // Player-specific fields
    if (this.currentUser.type === USER_TYPES.PLAYER) {
      this.setFormValue('edit-age', this.currentUser.age);
      this.setFormValue('edit-position', this.currentUser.position);
      this.setFormValue('edit-dominant-foot', this.currentUser.dominantFoot);
      this.setFormValue('edit-level', this.currentUser.level);
      this.setFormValue('edit-height', this.currentUser.height);
      this.setFormValue('edit-weight', this.currentUser.weight);
    }

    // Scout-specific fields
    if (this.currentUser.type === USER_TYPES.SCOUT) {
      this.setFormValue('edit-club', this.currentUser.club);
      this.setFormValue('edit-scout-position', this.currentUser.position);
      this.setFormValue('edit-experience', this.currentUser.experience);
      this.setFormValue('edit-specialization', this.currentUser.specialization);
    }
  }

  /**
   * Set form field value
   */
  setFormValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field && value !== undefined && value !== null) {
      field.value = value;
    }
  }

  /**
   * Handle profile update form submission
   */
  async handleProfileUpdate(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const updates = {};

    // Basic fields
    updates.name = formData.get('name');
    updates.city = formData.get('city');
    updates.country = formData.get('country');
    updates.isPublic = formData.has('isPublic');

    // Type-specific fields
    if (this.currentUser.type === USER_TYPES.PLAYER) {
      updates.age = parseInt(formData.get('age')) || null;
      updates.position = formData.get('position');
      updates.dominantFoot = formData.get('dominantFoot');
      updates.level = formData.get('level');
      updates.height = parseInt(formData.get('height')) || null;
      updates.weight = parseInt(formData.get('weight')) || null;
    }

    if (this.currentUser.type === USER_TYPES.SCOUT) {
      updates.club = formData.get('club');
      updates.position = formData.get('position');
      updates.experience = formData.get('experience');
      updates.specialization = formData.get('specialization');
    }

    try {
      // Update in Firestore
      await this.profileManager.updateProfile(this.currentUser.uid, updates);
      
      // Update local data
      Object.assign(this.currentUser, updates);
      
      // Update auth manager's current user
      this.authManager.handleAuthStateChange(this.currentUser);
      
      // Refresh UI
      this.updateProfileCompletion();
      this.displayProfileInfo();
      this.displayRecommendations();
      
      // Close modal
      this.closeEditModal();
      
      showMessage('הפרופיל עודכן בהצלחה!', 'success');
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      showMessage('שגיאה בעדכון הפרופיל', 'error');
    }
  }

  // Utility methods
  updateElement(selector, content) {
    const element = document.querySelector(selector);
    if (element) element.textContent = content;
  }

  showElement(element) {
    if (element) element.style.display = 'block';
  }

  hideElement(element) {
    if (element) element.style.display = 'none';
  }

  translateUserType(type) {
    const translations = {
      player: 'שחקן',
      scout: 'סקאוט',
      admin: 'מנהל'
    };
    return translations[type] || type;
  }

  translatePosition(position) {
    return PROFILE_TRANSLATIONS.positions?.[position] || position || 'לא צוין';
  }

  translateLevel(level) {
    return PROFILE_TRANSLATIONS.levels?.[level] || level || 'לא צוין';
  }

  translateFoot(foot) {
    return PROFILE_TRANSLATIONS.feet?.[foot] || foot || 'לא צוין';
  }

  translateScoutPosition(position) {
    return PROFILE_TRANSLATIONS.scoutPositions?.[position] || position || 'לא צוין';
  }

  translateStatus(status) {
    const statuses = {
      pending: 'בבדיקה',
      approved: 'אושר',
      rejected: 'נדחה'
    };
    return statuses[status] || status;
  }

  formatDate(timestamp) {
    if (!timestamp) return 'לא זמין';
    
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('he-IL');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔄 DOM loaded, initializing Enhanced Profile Manager...');
  
  const profileManager = new EnhancedProfileManager();
  profileManager.init();
});

// Export for other modules
export { EnhancedProfileManager };
