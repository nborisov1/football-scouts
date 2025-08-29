/**
 * Football Scouting Website - Profile Page JavaScript
 * Handles profile data loading, updates, and account management
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  const currentUser = auth.getCurrentUser();
  
  if (!currentUser) {
    // Redirect to login page if not logged in
    window.location.href = '../index.html';
    return;
  }
  
  // Initialize profile
  initProfile();
});

/**
 * Initialize profile functionality
 */
function initProfile() {
  // Load profile data
  loadProfileData();
  
  // Set up form submissions
  setupPersonalInfoForm();
  setupAccountSettingsForm();
  
  // Set up photo change
  setupPhotoChange();
  
  // Set up account deletion
  setupAccountDeletion();
}

/**
 * Load profile data from current user
 */
function loadProfileData() {
  const currentUser = auth.getCurrentUser();
  
  // Load personal info
  document.getElementById('player-name').value = currentUser.name || '';
  document.getElementById('player-email').value = currentUser.email || '';
  document.getElementById('player-age').value = currentUser.age || '';
  
  // Set position
  const positionSelect = document.getElementById('player-position');
  if (currentUser.position && positionSelect) {
    positionSelect.value = currentUser.position;
  }
  
  // Set dominant foot
  if (currentUser.dominantFoot) {
    const footRadio = document.querySelector(`input[name="dominantFoot"][value="${currentUser.dominantFoot}"]`);
    if (footRadio) {
      footRadio.checked = true;
    }
  }
  
  // Set club
  if (currentUser.club) {
    document.getElementById('player-club').value = currentUser.club;
  }
  
  // Load stats
  document.getElementById('player-level').textContent = getHebrewLevel(currentUser.level || 'beginner');
  
  if (currentUser.stats) {
    document.getElementById('player-consistency').textContent = currentUser.stats.consistency || 0;
    document.getElementById('player-improvement').textContent = `${currentUser.stats.improvement || 0}%`;
    document.getElementById('player-ranking').textContent = currentUser.stats.ranking || 0;
  }
  
  // Load profile image
  if (currentUser.profileImage) {
    document.getElementById('profile-image').src = currentUser.profileImage;
  }
  
  // Load videos
  loadPlayerVideos();
}

/**
 * Load player videos
 */
function loadPlayerVideos() {
  const currentUser = auth.getCurrentUser();
  const videosContainer = document.getElementById('player-videos');
  
  // Check if user has videos
  if (!currentUser.challenges || !currentUser.challenges.initial || !currentUser.challenges.initial.videos || currentUser.challenges.initial.videos.length === 0) {
    return; // No videos to display
  }
  
  // Clear container
  videosContainer.innerHTML = '';
  
  // Add videos
  currentUser.challenges.initial.videos.forEach((video, index) => {
    // Create video card
    const videoCard = document.createElement('div');
    videoCard.className = 'video-card';
    
    // Create video thumbnail
    const thumbnail = document.createElement('div');
    thumbnail.className = 'video-thumbnail';
    
    // In a real app, we would use actual video thumbnails
    // For this demo, we'll use placeholder images
    const img = document.createElement('img');
    img.src = `../images/video-thumbnail-${(index % 3) + 1}.jpg`;
    img.alt = `אתגר ${video.challengeId}`;
    
    thumbnail.appendChild(img);
    
    // Create video info
    const videoInfo = document.createElement('div');
    videoInfo.className = 'video-info';
    
    // Create video title
    const title = document.createElement('div');
    title.className = 'video-title';
    title.textContent = getChallengeTitle(video.challengeId);
    
    // Create video meta
    const meta = document.createElement('div');
    meta.className = 'video-meta';
    
    const date = document.createElement('span');
    date.textContent = formatDate(video.uploadDate);
    
    const status = document.createElement('span');
    status.textContent = getStatusText(video.status);
    status.className = `status-${video.status}`;
    
    meta.appendChild(date);
    meta.appendChild(status);
    
    // Assemble video info
    videoInfo.appendChild(title);
    videoInfo.appendChild(meta);
    
    // Assemble video card
    videoCard.appendChild(thumbnail);
    videoCard.appendChild(videoInfo);
    
    // Add to container
    videosContainer.appendChild(videoCard);
  });
}

/**
 * Get challenge title by ID
 * @param {number} challengeId - Challenge ID
 * @returns {string} - Challenge title
 */
function getChallengeTitle(challengeId) {
  switch (challengeId) {
    case 1:
      return 'אתגר 1: שליטה בכדור';
    case 2:
      return 'אתגר 2: כדרור';
    case 3:
      return 'אתגר 3: בעיטות';
    default:
      return `אתגר ${challengeId}`;
  }
}

/**
 * Get status text
 * @param {string} status - Status code
 * @returns {string} - Status text in Hebrew
 */
function getStatusText(status) {
  switch (status) {
    case 'pending':
      return 'בבדיקה';
    case 'approved':
      return 'אושר';
    case 'rejected':
      return 'נדחה';
    default:
      return status;
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
 * Set up personal info form submission
 */
function setupPersonalInfoForm() {
  const personalInfoForm = document.getElementById('personal-info-form');
  
  if (personalInfoForm) {
    personalInfoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form values
      const name = document.getElementById('player-name').value;
      const age = document.getElementById('player-age').value;
      const position = document.getElementById('player-position').value;
      const dominantFoot = document.querySelector('input[name="dominantFoot"]:checked').value;
      const club = document.getElementById('player-club').value;
      
      // Validate form
      if (!name || !age || !position || !dominantFoot) {
        showMessage('יש למלא את כל השדות החובה', 'error');
        return;
      }
      
      // Get current user
      const currentUser = auth.getCurrentUser();
      
      // Update user data
      const updates = {
        name,
        age,
        position,
        dominantFoot,
        club
      };
      
      // Save updates
      const result = auth.updateUser(currentUser.email, updates);
      
      if (result.success) {
        showMessage('הפרטים עודכנו בהצלחה', 'success');
      } else {
        showMessage(result.message, 'error');
      }
    });
  }
}

/**
 * Set up account settings form submission
 */
function setupAccountSettingsForm() {
  const accountSettingsForm = document.getElementById('account-settings-form');
  
  if (accountSettingsForm) {
    accountSettingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get form values
      const currentPassword = document.getElementById('current-password').value;
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      // Validate form
      if (!currentPassword || !newPassword || !confirmPassword) {
        showMessage('יש למלא את כל השדות', 'error');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        showMessage('הסיסמאות החדשות אינן תואמות', 'error');
        return;
      }
      
      // Get current user
      const currentUser = auth.getCurrentUser();
      const users = auth.getUsers();
      
      // Check current password
      if (users[currentUser.email].password !== auth.hashPassword(currentPassword)) {
        showMessage('הסיסמה הנוכחית שגויה', 'error');
        return;
      }
      
      // Update password
      users[currentUser.email].password = auth.hashPassword(newPassword);
      auth.saveUsers(users);
      
      // Clear form
      accountSettingsForm.reset();
      
      // Show success message
      showMessage('הסיסמה עודכנה בהצלחה', 'success');
    });
  }
}

/**
 * Set up photo change functionality
 */
function setupPhotoChange() {
  const changePhotoBtn = document.getElementById('change-photo-btn');
  const changePhotoModal = document.getElementById('change-photo-modal');
  const closeModalBtns = document.querySelectorAll('.close-modal');
  const photoUploadForm = document.getElementById('photo-upload-form');
  const photoFile = document.getElementById('photo-file');
  const photoPreview = document.getElementById('photo-preview');
  
  // Open modal
  if (changePhotoBtn) {
    changePhotoBtn.addEventListener('click', () => {
      changePhotoModal.style.display = 'block';
    });
  }
  
  // Close modal
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      changePhotoModal.style.display = 'none';
    });
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === changePhotoModal) {
      changePhotoModal.style.display = 'none';
    }
  });
  
  // Preview image
  if (photoFile) {
    photoFile.addEventListener('change', () => {
      if (photoFile.files && photoFile.files[0]) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          photoPreview.src = e.target.result;
          photoPreview.style.display = 'block';
        };
        
        reader.readAsDataURL(photoFile.files[0]);
      }
    });
  }
  
  // Upload photo
  if (photoUploadForm) {
    photoUploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Check if file is selected
      if (!photoFile.files || !photoFile.files[0]) {
        showMessage('יש לבחור תמונה', 'error');
        return;
      }
      
      // Get file
      const file = photoFile.files[0];
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        showMessage('יש לבחור קובץ תמונה בלבד', 'error');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showMessage('גודל התמונה לא יכול לעלות על 5MB', 'error');
        return;
      }
      
      // In a real application, this would upload the file to a server
      // For this demo, we'll use the FileReader to get a data URL
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const imageDataUrl = e.target.result;
        
        // Update user's profile image
        const currentUser = auth.getCurrentUser();
        const users = auth.getUsers();
        
        users[currentUser.email].profileImage = imageDataUrl;
        auth.saveUsers(users);
        
        // Update current user in local storage
        currentUser.profileImage = imageDataUrl;
        localStorage.setItem('footballScout_currentUser', JSON.stringify(currentUser));
        
        // Update profile image
        document.getElementById('profile-image').src = imageDataUrl;
        
        // Close modal
        changePhotoModal.style.display = 'none';
        
        // Show success message
        showMessage('תמונת הפרופיל עודכנה בהצלחה', 'success');
      };
      
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Set up account deletion functionality
 */
function setupAccountDeletion() {
  const deleteAccountBtn = document.getElementById('delete-account-btn');
  const deleteAccountModal = document.getElementById('delete-account-modal');
  const closeModalBtns = document.querySelectorAll('.close-modal');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  
  // Open modal
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', () => {
      deleteAccountModal.style.display = 'block';
    });
  }
  
  // Close modal
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      deleteAccountModal.style.display = 'none';
    });
  });
  
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
      deleteAccountModal.style.display = 'none';
    });
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === deleteAccountModal) {
      deleteAccountModal.style.display = 'none';
    }
  });
  
  // Confirm delete
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
      // Get current user
      const currentUser = auth.getCurrentUser();
      const users = auth.getUsers();
      
      // Delete user
      delete users[currentUser.email];
      auth.saveUsers(users);
      
      // Clear current user
      localStorage.removeItem('footballScout_currentUser');
      
      // Show message
      showMessage('החשבון נמחק בהצלחה', 'success');
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 2000);
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