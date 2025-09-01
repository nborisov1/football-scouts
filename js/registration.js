/**
 * Registration functionality
 * Handles user registration forms and account creation
 */

'use strict';

/**
 * Initialize registration functionality
 */
function initializeRegistration() {
  
  // Setup registration forms
  setupPlayerRegistration();
  setupScoutRegistration();
  
  // Setup registration modal events
  setupRegistrationModal();
}

/**
 * Setup player registration form
 */
function setupPlayerRegistration() {
  const playerForm = document.getElementById('player-form');
  if (!playerForm) {
    console.warn('Player registration form not found');
    return;
  }

  playerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const formData = getPlayerFormData();
    
    // Validate inputs
    const validation = validatePlayerData(formData);
    if (!validation.isValid) {
      showMessage(validation.message, 'error');
      return;
    }
    
    // Attempt registration
    await handleRegistration('player', formData);
  });
}

/**
 * Setup scout registration form
 */
function setupScoutRegistration() {
  const scoutForm = document.getElementById('scout-form');
  if (!scoutForm) {
    console.warn('Scout registration form not found');
    return;
  }

  scoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form values
    const formData = getScoutFormData();
    
    // Validate inputs
    const validation = validateScoutData(formData);
    if (!validation.isValid) {
      showMessage(validation.message, 'error');
      return;
    }
    
    // Attempt registration
    await handleRegistration('scout', formData);
  });
}

/**
 * Setup registration modal events
 */
function setupRegistrationModal() {
  // Register button to open modal
  const registerBtn = document.getElementById('register-btn');
  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      openRegistrationModal();
    });
  }

  // Close modal events
  const registrationModal = document.getElementById('multi-stage-modal');
  if (registrationModal) {
    // Close button
    const closeBtn = registrationModal.querySelector('.close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        closeRegistrationModal();
      });
    }

    // Click outside to close
    registrationModal.addEventListener('click', (e) => {
      if (e.target === registrationModal) {
        closeRegistrationModal();
      }
    });
  }
}

/**
 * Get player form data
 * @returns {Object} Player form data
 */
function getPlayerFormData() {
  return {
    name: document.getElementById('player-name')?.value?.trim() || '',
    email: document.getElementById('player-email')?.value?.trim() || '',
    password: document.getElementById('player-password')?.value || '',
    confirmPassword: document.getElementById('player-confirm-password')?.value || '',
    age: parseInt(document.getElementById('player-age')?.value) || 0,
    position: document.getElementById('player-position')?.value || '',
    dominantFoot: document.getElementById('player-foot')?.value || '',
    level: document.getElementById('player-level')?.value || '',
    height: parseInt(document.getElementById('player-height')?.value) || 0,
    weight: parseInt(document.getElementById('player-weight')?.value) || 0
  };
}

/**
 * Get scout form data
 * @returns {Object} Scout form data
 */
function getScoutFormData() {
  return {
    name: document.getElementById('scout-name')?.value?.trim() || '',
    email: document.getElementById('scout-email')?.value?.trim() || '',
    password: document.getElementById('scout-password')?.value || '',
    confirmPassword: document.getElementById('scout-confirm-password')?.value || '',
    club: document.getElementById('scout-club')?.value?.trim() || '',
    position: document.getElementById('scout-position')?.value?.trim() || '',
    experience: parseInt(document.getElementById('scout-experience')?.value) || 0,
    phone: document.getElementById('scout-phone')?.value?.trim() || ''
  };
}

/**
 * Validate player registration data
 * @param {Object} data - Player form data
 * @returns {Object} Validation result
 */
function validatePlayerData(data) {
  if (!data.name) {
    return { isValid: false, message: 'יש למלא שם מלא' };
  }
  
  if (!data.email || !isValidEmail(data.email)) {
    return { isValid: false, message: 'יש להזין כתובת אימייל תקינה' };
  }
  
  if (!data.password || data.password.length < 6) {
    return { isValid: false, message: 'סיסמה חייבת להכיל לפחות 6 תווים' };
  }
  
  if (data.password !== data.confirmPassword) {
    return { isValid: false, message: 'הסיסמאות אינן תואמות' };
  }
  
  if (!data.age || data.age < 13 || data.age > 40) {
    return { isValid: false, message: 'גיל חייב להיות בין 13 ל-40' };
  }
  
  if (!data.position) {
    return { isValid: false, message: 'יש לבחור עמדה' };
  }
  
  if (!data.dominantFoot) {
    return { isValid: false, message: 'יש לבחור רגל דומיננטית' };
  }
  
  if (!data.level) {
    return { isValid: false, message: 'יש לבחור רמה' };
  }
  
  return { isValid: true };
}

/**
 * Validate scout registration data
 * @param {Object} data - Scout form data
 * @returns {Object} Validation result
 */
function validateScoutData(data) {
  if (!data.name) {
    return { isValid: false, message: 'יש למלא שם מלא' };
  }
  
  if (!data.email || !isValidEmail(data.email)) {
    return { isValid: false, message: 'יש להזין כתובת אימייל תקינה' };
  }
  
  if (!data.password || data.password.length < 6) {
    return { isValid: false, message: 'סיסמה חייבת להכיל לפחות 6 תווים' };
  }
  
  if (data.password !== data.confirmPassword) {
    return { isValid: false, message: 'הסיסמאות אינן תואמות' };
  }
  
  if (!data.club) {
    return { isValid: false, message: 'יש למלא שם מועדון' };
  }
  
  if (!data.position) {
    return { isValid: false, message: 'יש למלא תפקיד' };
  }
  
  return { isValid: true };
}

/**
 * Handle user registration with Firebase
 * @param {string} userType - Type of user ('player' or 'scout')
 * @param {Object} userData - User registration data
 */
async function handleRegistration(userType, userData) {
  try {
    // Check if authManager is available
    if (!window.authManager) {
      showMessage('מערכת האימות לא זמינה. אנא רענן את הדף ונסה שוב.', 'error');
      return;
    }

    // Show loading state
    const submitBtn = document.querySelector(`#${userType}-form button[type="submit"]`);
    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'נרשם...';
    }

    console.log(`🔄 Attempting registration for ${userType}:`, userData.email);
    
    // Prepare user data for Firebase
    const registrationData = {
      name: userData.name,
      email: userData.email,
      password: userData.password
    };

    // Add type-specific data
    if (userType === 'player') {
      registrationData.age = userData.age;
      registrationData.position = userData.position;
      registrationData.dominantFoot = userData.dominantFoot;
      registrationData.level = userData.level;
      if (userData.height > 0) registrationData.height = userData.height;
      if (userData.weight > 0) registrationData.weight = userData.weight;
    } else if (userType === 'scout') {
      registrationData.club = userData.club;
      registrationData.position = userData.position;
      if (userData.experience > 0) registrationData.experience = userData.experience;
      if (userData.phone) registrationData.phone = userData.phone;
    }
    
    // Attempt Firebase registration
    const result = await window.authManager.register(registrationData, userType);
    
    if (result.success) {
      console.log('✅ Registration successful:', result.uid);
      
      // Close modal
      closeRegistrationModal();
      
      // Clear form
      clearRegistrationForm(userType);
      
      // Show success message
      const userTypeHebrew = userType === 'player' ? 'שחקן' : 'סקאוט';
      showMessage(`הרשמה הושלמה בהצלחה! ברוך הבא ${userData.name} כ${userTypeHebrew}`, 'success');
      
      // If player, show additional info about challenges
      if (userType === 'player') {
        setTimeout(() => {
          showMessage('כעת תוכל להתחיל באתגרים הראשוניים לבניית הפרופיל שלך', 'info');
        }, 2000);
      }
      
    } else {
      showMessage('שגיאה ברישום. אנא נסה שוב.', 'error');
    }
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Show user-friendly error message
    let errorMessage = 'שגיאה ברישום. אנא נסה שוב.';
    
    if (error.message.includes('email-already-in-use') || error.message.includes('כתובת האימייל כבר בשימוש')) {
      errorMessage = 'כתובת האימייל כבר רשומה במערכת. אנא השתמש בכתובת אחרת או נסה להתחבר.';
    } else if (error.message.includes('weak-password') || error.message.includes('הסיסמה חלשה')) {
      errorMessage = 'הסיסמה חלשה מדי. אנא בחר סיסמה חזקה יותר.';
    } else if (error.message.includes('invalid-email')) {
      errorMessage = 'כתובת אימייל לא תקינה.';
    }
    
    showMessage(errorMessage, 'error');
    
  } finally {
    // Restore button state
    const submitBtn = document.querySelector(`#${userType}-form button[type="submit"]`);
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = userType === 'player' ? 'הרשם כשחקן' : 'הרשם כסקאוט';
    }
  }
}

/**
 * Open registration modal
 */
function openRegistrationModal() {
  const registrationModal = document.getElementById('multi-stage-modal');
  if (registrationModal) {
    registrationModal.style.display = 'block';
  }
}

/**
 * Close registration modal
 */
function closeRegistrationModal() {
  const registrationModal = document.getElementById('multi-stage-modal');
  if (registrationModal) {
    registrationModal.style.display = 'none';
  }
}

/**
 * Clear registration form
 * @param {string} userType - Type of form to clear
 */
function clearRegistrationForm(userType) {
  const form = document.getElementById(`${userType}-form`);
  if (form) {
    form.reset();
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Show message to user (assumes showMessage function exists globally)
 * @param {string} message - Message to show
 * @param {string} type - Message type ('success', 'error', 'info')
 */
function showMessage(message, type) {
  if (typeof window.showMessage === 'function') {
    window.showMessage(message, type);
  } else {
    // Fallback
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(message);
  }
}

// Export to global for compatibility
window.initializeRegistration = initializeRegistration;