/**
 * Football Scouting Website - Training Program JavaScript
 * Handles training program functionality based on player's skill level
 */

'use strict';

// Training programs for different skill levels
const TRAINING_PROGRAMS = {
  beginner: {
    totalStages: 5,
    stages: [
      {
        id: 1,
        title: 'יסודות שליטה בכדור',
        description: `
          <h4>תיאור התרגיל</h4>
          <p>תרגיל זה מתמקד ביסודות השליטה בכדור, כולל הקפצות בסיסיות ושליטה ברגליים.</p>
          <h4>הוראות</h4>
          <ul>
            <li>התחל עם הקפצות פשוטות ברגל הדומיננטית שלך</li>
            <li>נסה להגיע ל-10 הקפצות רצופות</li>
            <li>עבור להקפצות ברגל השנייה</li>
            <li>שלב בין שתי הרגליים</li>
          </ul>
          <p>חזור על התרגיל לפחות 3 פעמים בשבוע למשך 15 דקות בכל פעם.</p>
        `,
        videoId: 'example1'
      },
      {
        id: 2,
        title: 'כדרור בסיסי',
        description: `
          <h4>תיאור התרגיל</h4>
          <p>תרגיל זה מתמקד בכדרור בסיסי ושליטה בכדור תוך כדי תנועה.</p>
          <h4>הוראות</h4>
          <ul>
            <li>סדר 5 קונוסים בקו ישר במרחק של מטר זה מזה</li>
            <li>כדרר בין הקונוסים בזיגזג</li>
            <li>התחל לאט והתמקד בשליטה מדויקת</li>
            <li>הגבר את המהירות בהדרגה</li>
          </ul>
          <p>חזור על התרגיל לפחות 3 פעמים בשבוע למשך 20 דקות בכל פעם.</p>
        `,
        videoId: 'example2'
      },
      {
        id: 3,
        title: 'מסירות בסיסיות',
        description: `
          <h4>תיאור התרגיל</h4>
          <p>תרגיל זה מתמקד במסירות בסיסיות ודיוק.</p>
          <h4>הוראות</h4>
          <ul>
            <li>עמוד במרחק של 5 מטרים מקיר</li>
            <li>בעט את הכדור לקיר וקבל אותו חזרה</li>
            <li>השתמש בשתי הרגליים</li>
            <li>נסה לשמור על דיוק ועוצמה קבועה</li>
          </ul>
          <p>חזור על התרגיל לפחות 3 פעמים בשבוע למשך 15 דקות בכל פעם.</p>
        `,
        videoId: 'example3'
      },
      {
        id: 4,
        title: 'בעיטות בסיסיות',
        description: `
          <h4>תיאור התרגיל</h4>
          <p>תרגיל זה מתמקד בבעיטות בסיסיות לשער.</p>
          <h4>הוראות</h4>
          <ul>
            <li>הצב את הכדור במרחק של 10 מטרים מהשער</li>
            <li>בעט לפינות השער</li>
            <li>התמקד בדיוק ולא בכוח</li>
            <li>השתמש בשתי הרגליים</li>
          </ul>
          <p>חזור על התרגיל לפחות 3 פעמים בשבוע, 20 בעיטות בכל פעם.</p>
        `,
        videoId: 'example4'
      },
      {
        id: 5,
        title: 'קואורדינציה בסיסית',
        description: `
          <h4>תיאור התרגיל</h4>
          <p>תרגיל זה מתמקד בשיפור הקואורדינציה והזריזות.</p>
          <h4>הוראות</h4>
          <ul>
            <li>סדר סולם זריזות או סמן קווים על הרצפה</li>
            <li>בצע תרגילי קפיצות בין המרווחים</li>
            <li>התחל לאט והגבר את המהירות בהדרגה</li>
            <li>נסה תבניות שונות של קפיצות</li>
          </ul>
          <p>חזור על התרגיל לפחות 3 פעמים בשבוע למשך 10 דקות בכל פעם.</p>
        `,
        videoId: 'example5'
      }
    ]
  },
  intermediate: {
    totalStages: 5,
    stages: [
      {
        id: 1,
        title: 'שליטה בכדור מתקדמת',
        description: `
          <h4>תיאור התרגיל</h4>
          <p>תרגיל זה מתמקד בשליטה מתקדמת בכדור, כולל הקפצות מורכבות ושליטה בכל חלקי הגוף.</p>
          <h4>הוראות</h4>
          <ul>
            <li>בצע הקפצות תוך שילוב בין רגליים, ירכיים וראש</li>
            <li>נסה להגיע ל-30 הקפצות רצופות</li>
            <li>הוסף סיבובים תוך כדי הקפצות</li>
            <li>תרגל מעברים בין חלקי גוף שונים</li>
          </ul>
          <p>חזור על התרגיל לפחות 4 פעמים בשבוע למשך 20 דקות בכל פעם.</p>
        `,
        videoId: 'example6'
      },
      {
        id: 2,
        title: 'כדרור מתקדם',
        description: `
          <h4>תיאור התרגיל</h4>
          <p>תרגיל זה מתמקד בכדרור מתקדם ושינויי כיוון מהירים.</p>
          <h4>הוראות</h4>
          <ul>
            <li>סדר קונוסים בתבנית זיגזג</li>
            <li>כדרר בין הקונוסים במהירות</li>
            <li>הוסף שינויי כיוון חדים</li>
            <li>תרגל פיינטות ותנועות הטעיה</li>
          </ul>
          <p>חזור על התרגיל לפחות 4 פעמים בשבוע למשך 25 דקות בכל פעם.</p>
        `,
        videoId: 'example7'
      },
      {
        id: 3,
        title: 'מסירות מתקדמות',
        description: `
          <h4>תיאור התרגיל</h4>
          <p>תרגיל זה מתמקד במסירות מתקדמות ודיוק בתנאי לחץ.</p>
          <h4>הוראות</h4>
          <ul>
            <li>עבוד עם שותף במרחק של 10-15 מטרים</li>
            <li>בצע מסירות בנגיעה אחת</li>
            <li>שלב מסירות ארוכות וקצרות</li>
            <li>תרגל מסירות עם שתי הרגליים</li>
          </ul>
          <p>חזור על התרגיל לפחות 3 פעמים בשבוע למשך 30 דקות בכל פעם.</p>
        `,
        videoId: 'example8'
      },
      {
        id: 4,
        title: 'בעיטות מתקדמות',
        description: `
          <h4>תיאור התרגיל</h4>
          <p>תרגיל זה מתמקד בבעיטות מתקדמות ממצבים שונים.</p>
          <h4>הוראות</h4>
          <ul>
            <li>תרגל בעיטות מחוץ לרחבה</li>
            <li>בצע בעיטות אחרי כדרור</li>
            <li>תרגל בעיטות וולה</li>
            <li>שלב בעיטות פינה ובעיטות חופשיות</li>
          </ul>
          <p>חזור על התרגיל לפחות 3 פעמים בשבוע, 30 בעיטות בכל פעם.</p>
        `,
        videoId: 'example9'
      },
      {
        id: 5,
        title: 'משחק 1 נגד 1',
        description: `
          <h4>תיאור התרגיל</h4>
          <p>תרגיל זה מתמקד במשחק 1 נגד 1 לשיפור יכולות ההתקפה וההגנה.</p>
          <h4>הוראות</h4>
          <ul>
            <li>הגדר שטח משחק קטן (5x5 מטרים)</li>
            <li>שחק 1 נגד 1 עם שער קטן</li>
            <li>תרגל פיינטות ותנועות הטעיה</li>
            <li>התמקד בשמירה הדוקה כמגן</li>
          </ul>
          <p>חזור על התרגיל לפחות 2 פעמים בשבוע למשך 30 דקות בכל פעם.</p>
        `,
        videoId: 'example10'
      }
    ]
  },
  advanced: {
    totalStages: 5,
    stages: [
      {
        id: 1,
        title: 'שליטה בכדור ברמה גבוהה',
        description: `
          <h4>תיאור התרגיל</h4>
          <p>תרגיל זה מתמקד בשליטה בכדור ברמה גבוהה, כולל טריקים ותנועות מורכבות.</p>
          <h4>הוראות</h4>
          <ul>
            <li>תרגל טריקים כמו סביבונים, מעברים מאחורי הרגל וכו'</li>
            <li>שלב בין טריקים שונים ברצף</li>
            <li>בצע את התרגילים במהירות גבוהה</li>
            <li>הוסף לחץ של מגן פסיבי</li>
          </ul>
          <p>חזור על התרגיל לפחות 5 פעמים בשבוע למשך 30 דקות בכל פעם.</p>
        `,
        videoId: 'example11'
      },
      {
        id: 2,
        title: 'כדרור במהירות גבוהה',
        description: `
          <h4>תיאור התרגיל</h4>
          <p>תרגיל זה מתמקד בכדרור במהירות גבוהה ושינויי כיוון חדים תחת לחץ.</p>
          <h4>הוראות</h4>
          <ul>
            <li>הגדר מסלול מכשולים מורכב</li>
            <li>כדרר במהירות מרבית תוך שמירה על שליטה</li>
            <li>הוסף מגנים פסיביים</li>
            <li>תרגל החלפות קצב ושינויי כיוון</li>
          </ul>
          <p>חזור על התרגיל לפחות 4 פעמים בשבוע למשך 30 דקות בכל פעם.</p>
        `,
        videoId: 'example12'
      },
      {
        id: 3,
        title: 'מסירות תחת לחץ',
        description: `
          <h4>תיאור התרגיל</h4>
          <p>תרגיל זה מתמקד במסירות מדויקות תחת לחץ של מגנים.</p>
          <h4>הוראות</h4>
          <ul>
            <li>עבוד בקבוצה של 4-6 שחקנים</li>
            <li>שחק משחק שמירת כדור (רונדו)</li>
            <li>הגבל למגע אחד או שניים</li>
            <li>שמור על תנועה מתמדת</li>
          </ul>
          <p>חזור על התרגיל לפחות 3 פעמים בשבוע למשך 45 דקות בכל פעם.</p>
        `,
        videoId: 'example13'
      },
      {
        id: 4,
        title: 'סיומות מתקדמות',
        description: `
          <h4>תיאור התרגיל</h4>
          <p>תרגיל זה מתמקד בסיומות מתקדמות ממצבים שונים.</p>
          <h4>הוראות</h4>
          <ul>
            <li>תרגל סיומות אחרי כדרור, מסירה וכדור גבוה</li>
            <li>בצע סיומות מזוויות שונות</li>
            <li>תרגל סיומות תחת לחץ של מגן</li>
            <li>שלב תנועות הטעיה לפני הסיומת</li>
          </ul>
          <p>חזור על התרגיל לפחות 3 פעמים בשבוע, 40 סיומות בכל פעם.</p>
        `,
        videoId: 'example14'
      },
      {
        id: 5,
        title: 'משחק קטן',
        description: `
          <h4>תיאור התרגיל</h4>
          <p>תרגיל זה מתמקד במשחק קטן (5 נגד 5) לשיפור יכולות טקטיות ופיזיות.</p>
          <h4>הוראות</h4>
          <ul>
            <li>שחק במגרש קטן (20x30 מטרים)</li>
            <li>הגבל למגע אחד או שניים</li>
            <li>התמקד בתנועה ללא כדור</li>
            <li>תרגל לחץ גבוה ומעברים מהירים</li>
          </ul>
          <p>חזור על התרגיל לפחות 2 פעמים בשבוע למשך 60 דקות בכל פעם.</p>
        `,
        videoId: 'example15'
      }
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  try {
    // Use fast session-based authentication check
    const currentUser = window.requireAuthentication('player');
    if (!currentUser) return; // requireAuthentication handles redirect
    
    // Initialize training program
    initTrainingProgram();
    
    // Remove loading overlay and show content
    document.body.classList.remove('auth-loading');
    const loadingOverlay = document.getElementById('auth-loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
    
  } catch (error) {
    console.error('Error during training page initialization:', error);
    
    // Still remove loading overlay even on error
    document.body.classList.remove('auth-loading');
    const loadingOverlay = document.getElementById('auth-loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
  }
});

/**
 * Initialize training program
 */
function initTrainingProgram() {
  try {
    // Get current user
    const currentUser = window.getCurrentUserFromSession();
    if (!currentUser) return;
    
    // Check if training program is unlocked
    const isUnlocked = currentUser.trainingProgram && currentUser.trainingProgram.unlocked;
    
    const lockedElement = document.getElementById('training-locked');
    const programElement = document.getElementById('training-program');
    
    if (!isUnlocked) {
      // Show locked message
      if (lockedElement) lockedElement.classList.remove('hidden');
      if (programElement) programElement.classList.add('hidden');
      return;
    }
    
    // Show training program
    if (lockedElement) lockedElement.classList.add('hidden');
    if (programElement) programElement.classList.remove('hidden');
    
    // Load training program
    loadTrainingProgram();
    
  } catch (error) {
    console.error('Error in initTrainingProgram:', error);
  }
}

/**
 * Load training program based on player's level
 */
function loadTrainingProgram() {
  try {
    // Get current user
    const currentUser = window.getCurrentUserFromSession();
    if (!currentUser) return;
    
    // Get player's level
    const level = currentUser.level || 'beginner';
    
    // Get training program for level
    const program = TRAINING_PROGRAMS[level];
    if (!program) {
      window.showMessage('לא נמצאה תוכנית אימון מתאימה', 'error');
      return;
    }
  } catch (error) {
    console.error('Error in loadTrainingProgram:', error);
    return;
  }
  
  // Continue with the training program loading
  const currentUser = window.getCurrentUserFromSession();
  const level = currentUser.level || 'beginner';
  const program = TRAINING_PROGRAMS[level];
  
  // Update player level display
  document.getElementById('player-level').textContent = getHebrewLevel(level);
  
  // Get current stage
  const currentStageId = currentUser.trainingProgram.currentStage || 1;
  
  // Update progress
  updateProgress(currentStageId, program.totalStages);
  
  // Create timeline
  createTimeline(program.stages, currentStageId, currentUser.trainingProgram.completedStages || []);
  
  // Load current stage
  loadStage(program.stages.find(stage => stage.id === currentStageId));
  
  // Set up upload form
  setupUploadForm(currentStageId);
}

/**
 * Update progress display
 * @param {number} currentStage - Current stage ID
 * @param {number} totalStages - Total number of stages
 */
function updateProgress(currentStage, totalStages) {
  const progressBar = document.getElementById('training-progress-bar');
  const currentStageElement = document.getElementById('current-stage');
  const totalStagesElement = document.getElementById('total-stages');
  
  // Update progress bar
  const progress = ((currentStage - 1) / totalStages) * 100;
  progressBar.style.width = `${progress}%`;
  
  // Update text
  currentStageElement.textContent = currentStage;
  totalStagesElement.textContent = totalStages;
}

/**
 * Create timeline
 * @param {Array} stages - Array of stage objects
 * @param {number} currentStageId - Current stage ID
 * @param {Array} completedStages - Array of completed stage IDs
 */
function createTimeline(stages, currentStageId, completedStages) {
  const timelineContainer = document.querySelector('.stages-timeline');
  
  // Clear container
  timelineContainer.innerHTML = '';
  
  // Create timeline items
  stages.forEach(stage => {
    // Create timeline item
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';
    
    // Create timeline icon
    const timelineIcon = document.createElement('div');
    timelineIcon.className = 'timeline-icon';
    
    // Set icon class based on stage status
    if (completedStages.includes(stage.id)) {
      timelineIcon.classList.add('completed');
      timelineIcon.innerHTML = '<i class="fas fa-check"></i>';
    } else if (stage.id === currentStageId) {
      timelineIcon.classList.add('active');
      timelineIcon.textContent = stage.id;
    } else {
      timelineIcon.textContent = stage.id;
    }
    
    // Create timeline content
    const timelineContent = document.createElement('div');
    timelineContent.className = 'timeline-content';
    
    // Create timeline title
    const timelineTitle = document.createElement('div');
    timelineTitle.className = 'timeline-title';
    timelineTitle.textContent = stage.title;
    
    // Create timeline status
    const timelineStatus = document.createElement('div');
    timelineStatus.className = 'timeline-status';
    
    if (completedStages.includes(stage.id)) {
      timelineStatus.classList.add('completed');
      timelineStatus.textContent = 'הושלם';
    } else if (stage.id === currentStageId) {
      timelineStatus.textContent = 'נוכחי';
    } else if (stage.id < currentStageId) {
      timelineStatus.textContent = 'דולג';
    } else {
      timelineStatus.textContent = 'נעול';
    }
    
    // Assemble timeline content
    timelineContent.appendChild(timelineTitle);
    timelineContent.appendChild(timelineStatus);
    
    // Assemble timeline item
    timelineItem.appendChild(timelineIcon);
    timelineItem.appendChild(timelineContent);
    
    // Add to container
    timelineContainer.appendChild(timelineItem);
  });
}

/**
 * Load stage
 * @param {Object} stage - Stage object
 */
function loadStage(stage) {
  if (!stage) {
    showMessage('לא נמצא שלב', 'error');
    return;
  }
  
  // Update stage title
  document.getElementById('stage-title').textContent = `שלב ${stage.id}: ${stage.title}`;
  
  // Update stage description
  document.getElementById('stage-description').innerHTML = stage.description;
  
  // Update demo video
  const demoVideo = document.getElementById('demo-video');
  demoVideo.innerHTML = `
    <iframe width="560" height="315" src="https://www.youtube.com/embed/${stage.videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  `;
  
  // Check if stage is completed
  const currentUser = window.getCurrentUserFromSession();
  const completedStages = currentUser.trainingProgram.completedStages || [];
  
  if (completedStages.includes(stage.id)) {
    // Update stage status
    const stageStatus = document.getElementById('stage-status');
    stageStatus.textContent = 'הושלם';
    stageStatus.classList.add('completed');
    
    // Hide upload form
    document.getElementById('stage-upload-form').classList.add('hidden');
    
    // Show upload progress at 100%
    const uploadProgress = document.getElementById('upload-progress');
    uploadProgress.classList.remove('hidden');
    
    const progressBar = document.getElementById('upload-progress-bar');
    const progressText = document.getElementById('upload-progress-text');
    
    progressBar.style.width = '100%';
    progressText.textContent = '100%';
  } else {
    // Update stage status
    const stageStatus = document.getElementById('stage-status');
    stageStatus.textContent = 'לא הושלם';
    stageStatus.classList.remove('completed');
    
    // Show upload form
    document.getElementById('stage-upload-form').classList.remove('hidden');
    
    // Hide upload progress
    document.getElementById('upload-progress').classList.add('hidden');
  }
}

/**
 * Set up upload form
 * @param {number} stageId - Stage ID
 */
function setupUploadForm(stageId) {
  const uploadForm = document.getElementById('stage-upload-form');
  
  if (uploadForm) {
    uploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get file input
      const fileInput = document.getElementById('video-file');
      
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
      const uploadProgress = document.getElementById('upload-progress');
      const uploadProgressBar = document.getElementById('upload-progress-bar');
      const uploadProgressText = document.getElementById('upload-progress-text');
      
      uploadProgress.classList.remove('hidden');
      
      // Simulate upload progress
      simulateUpload(uploadProgressBar, uploadProgressText, () => {
        // Upload completed
        completeStage(stageId);
      });
    });
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
 * Complete stage
 * @param {number} stageId - Stage ID
 */
function completeStage(stageId) {
  // Get current user
  const currentUser = window.getCurrentUserFromSession();
  const users = auth.getUsers();
  
  // Get player's level
  const level = currentUser.level || 'beginner';
  
  // Get training program for level
  const program = TRAINING_PROGRAMS[level];
  
  if (!program) {
    showMessage('לא נמצאה תוכנית אימון מתאימה', 'error');
    return;
  }
  
  // Add stage to completed stages
  if (!users[currentUser.email].trainingProgram.completedStages) {
    users[currentUser.email].trainingProgram.completedStages = [];
  }
  
  if (!users[currentUser.email].trainingProgram.completedStages.includes(stageId)) {
    users[currentUser.email].trainingProgram.completedStages.push(stageId);
  }
  
  // Update current stage
  const nextStageId = stageId + 1;
  
  if (nextStageId <= program.totalStages) {
    users[currentUser.email].trainingProgram.currentStage = nextStageId;
  } else {
    // Program completed
    users[currentUser.email].trainingProgram.completed = true;
    
    // Update player stats
    if (!users[currentUser.email].stats) {
      users[currentUser.email].stats = {};
    }
    
    // Increase consistency
    users[currentUser.email].stats.consistency = (users[currentUser.email].stats.consistency || 0) + 10;
    
    // Increase improvement
    users[currentUser.email].stats.improvement = (users[currentUser.email].stats.improvement || 0) + 15;
    
    // Increase ranking
    users[currentUser.email].stats.ranking = (users[currentUser.email].stats.ranking || 0) + 20;
  }
  
  // Save users
  auth.saveUsers(users);
  
  // Update current user in local storage
  currentUser.trainingProgram = users[currentUser.email].trainingProgram;
  if (users[currentUser.email].stats) {
    currentUser.stats = users[currentUser.email].stats;
  }
  localStorage.setItem('footballScout_currentUser', JSON.stringify(currentUser));
  
  // Show success message
  showMessage('השלב הושלם בהצלחה!', 'success');
  
  // Check if program is completed
  if (users[currentUser.email].trainingProgram.completed) {
    // Show program complete message
    document.getElementById('program-complete').classList.remove('hidden');
  } else {
    // Reload training program
    setTimeout(() => {
      loadTrainingProgram();
    }, 1500);
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