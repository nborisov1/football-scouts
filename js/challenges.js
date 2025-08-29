/**
 * Football Scouting Website - Challenges JavaScript
 * Handles challenge video uploads and progress tracking
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in and is a player
  const currentUser = auth.getCurrentUser();
  
  if (!currentUser) {
    // Redirect to login page if not logged in
    window.location.href = '../index.html';
    return;
  }
  
  if (currentUser.type !== 'player') {
    // Redirect to home page if not a player
    window.location.href = '../index.html';
    return;
  }
  
  // Initialize challenges
  initChallenges();
});

/**
 * Initialize challenges functionality
 */
function initChallenges() {
  // Get current user
  const currentUser = auth.getCurrentUser();
  
  // Check if user has challenges data
  if (!currentUser.challenges) {
    // Initialize challenges data
    const users = auth.getUsers();
    users[currentUser.email].challenges = {
      initial: {
        completed: false,
        videos: []
      }
    };
    auth.saveUsers(users);
  }
  
  // Set up upload forms
  setupUploadForms();
  
  // Update challenge status
  updateChallengeStatus();
}

/**
 * Set up upload forms for each challenge
 */
function setupUploadForms() {
  const challengeCount = 3;
  
  for (let i = 1; i <= challengeCount; i++) {
    const uploadForm = document.getElementById(`upload-form-${i}`);
    
    if (uploadForm) {
      uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get file input
        const fileInput = document.getElementById(`video-file-${i}`);
        
        // Check if file is selected
        if (!fileInput.files || !fileInput.files[0]) {
          showMessage('יש לבחור סרטון להעלאה', 'error');
          return;
        }
        
        // Get file
        const file = fileInput.files[0];
        
        // Check file type
        if (!file.type.startsWith('video/')) {
          showMessage('יש לבחור קובץ סרטון בלבד', 'error');
          return;
        }
        
        // Check file size (max 100MB)
        if (file.size > 100 * 1024 * 1024) {
          showMessage('גודל הסרטון לא יכול לעלות על 100MB', 'error');
          return;
        }
        
        // Show upload progress
        const uploadProgress = document.getElementById(`upload-progress-${i}`);
        const uploadProgressBar = document.getElementById(`upload-progress-bar-${i}`);
        const uploadProgressText = document.getElementById(`upload-progress-text-${i}`);
        
        uploadProgress.classList.remove('hidden');
        
        // Simulate upload progress
        simulateUpload(uploadProgressBar, uploadProgressText, () => {
          // Upload completed
          uploadVideo(i, file);
        });
      });
    }
  }
}

/**
 * Simulate video upload with progress
 * @param {HTMLElement} progressBar - Progress bar element
 * @param {HTMLElement} progressText - Progress text element
 * @param {Function} callback - Callback function to execute when upload completes
 */
function simulateUpload(progressBar, progressText, callback) {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 10;
    
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      
      // Execute callback after a short delay
      setTimeout(callback, 500);
    }
    
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${Math.round(progress)}%`;
  }, 300);
}

/**
 * Upload video for a challenge
 * @param {number} challengeId - Challenge ID
 * @param {File} file - Video file
 */
function uploadVideo(challengeId, file) {
  // In a real application, this would upload the file to a server
  // For this demo, we'll just simulate a successful upload
  
  // Get current user
  const currentUser = auth.getCurrentUser();
  const users = auth.getUsers();
  
  // Add video to user's challenges
  if (!users[currentUser.email].challenges.initial.videos) {
    users[currentUser.email].challenges.initial.videos = [];
  }
  
  // Check if video for this challenge already exists
  const existingVideoIndex = users[currentUser.email].challenges.initial.videos.findIndex(
    video => video.challengeId === challengeId
  );
  
  // Create video object
  const videoObject = {
    challengeId: challengeId,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    uploadDate: new Date().toISOString(),
    status: 'pending' // pending, approved, rejected
  };
  
  // Update or add video
  if (existingVideoIndex !== -1) {
    users[currentUser.email].challenges.initial.videos[existingVideoIndex] = videoObject;
  } else {
    users[currentUser.email].challenges.initial.videos.push(videoObject);
  }
  
  // Save users
  auth.saveUsers(users);
  
  // Update challenge status
  updateChallengeStatus();
  
  // Show success message
  showMessage('הסרטון הועלה בהצלחה ונמצא בבדיקה', 'success');
}

/**
 * Update challenge status based on user data
 */
function updateChallengeStatus() {
  // Get current user
  const currentUser = auth.getCurrentUser();
  const users = auth.getUsers();
  const user = users[currentUser.email];
  
  // Get videos
  const videos = user.challenges.initial.videos || [];
  
  // Count completed challenges
  let completedCount = 0;
  const totalChallenges = 3;
  
  // Update each challenge status
  for (let i = 1; i <= totalChallenges; i++) {
    const challengeCard = document.getElementById(`challenge-${i}`);
    const challengeStatus = challengeCard.querySelector('.challenge-status');
    const uploadForm = document.getElementById(`upload-form-${i}`);
    const uploadProgress = document.getElementById(`upload-progress-${i}`);
    
    // Check if video exists for this challenge
    const video = videos.find(v => v.challengeId === i);
    
    if (video) {
      // Update challenge status
      challengeStatus.textContent = 'הועלה - בבדיקה';
      challengeStatus.classList.add('completed');
      
      // Hide form and show progress
      uploadForm.classList.add('hidden');
      uploadProgress.classList.remove('hidden');
      
      // Update progress bar to 100%
      const progressBar = document.getElementById(`upload-progress-bar-${i}`);
      const progressText = document.getElementById(`upload-progress-text-${i}`);
      
      progressBar.style.width = '100%';
      progressText.textContent = '100%';
      
      // Increment completed count
      completedCount++;
    }
  }
  
  // Update overall progress
  const progressBar = document.getElementById('challenges-progress-bar');
  const completedChallenges = document.getElementById('completed-challenges');
  
  progressBar.style.width = `${(completedCount / totalChallenges) * 100}%`;
  completedChallenges.textContent = completedCount;
  
  // Check if all challenges are completed
  if (completedCount === totalChallenges) {
    // Mark initial challenges as completed
    users[currentUser.email].challenges.initial.completed = true;
    auth.saveUsers(users);
    
    // Show completion message
    document.getElementById('challenges-complete').classList.remove('hidden');
    
    // In a real application, this would trigger a notification to admins
    // to review the videos and assign a skill level
    
    // For demo purposes, automatically assign a skill level after a delay
    setTimeout(() => {
      assignSkillLevel(currentUser.email);
    }, 5000);
  }
}

/**
 * Assign a skill level to a player based on their videos
 * @param {string} email - Player's email
 */
function assignSkillLevel(email) {
  // In a real application, this would be done by admins or an AI system
  // For this demo, we'll randomly assign a skill level
  
  const users = auth.getUsers();
  const skillLevels = ['beginner', 'intermediate', 'advanced'];
  const randomLevel = skillLevels[Math.floor(Math.random() * skillLevels.length)];
  
  // Update user's level
  users[email].level = randomLevel;
  
  // Unlock training program
  users[email].trainingProgram = {
    unlocked: true,
    currentStage: 1,
    completedStages: [],
    level: randomLevel
  };
  
  // Save users
  auth.saveUsers(users);
  
  // Update current user in local storage
  const currentUser = auth.getCurrentUser();
  if (currentUser && currentUser.email === email) {
    currentUser.level = randomLevel;
    currentUser.trainingProgram = users[email].trainingProgram;
    localStorage.setItem('footballScout_currentUser', JSON.stringify(currentUser));
  }
  
  // Show message
  showMessage(`רמת המיומנות שלך נקבעה: ${getHebrewLevel(randomLevel)}. תוכנית האימון שלך זמינה עכשיו!`, 'success');
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