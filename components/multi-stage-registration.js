/**
 * Multi-Stage Registration Component
 * Provides an interactive, step-by-step registration process
 */

'use strict';

import firebaseAuth from '../auth/firebase-auth.js';

class MultiStageRegistration {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container with ID "${containerId}" not found`);
    }
    
    this.currentStage = 0;
    this.userData = {
      email: '',
      password: '',
      name: '',
      type: '',
      // Player specific
      age: null,
      position: '',
      dominantFoot: '',
      level: '',
      // Scout specific
      club: '',
      scoutPosition: ''
    };
    
    this.stages = [
      {
        id: 'user-type',
        title: 'סוג משתמש',
        isValid: () => !!this.userData.type
      },
      {
        id: 'account-details',
        title: 'פרטי חשבון',
        isValid: () => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
          
          return emailRegex.test(this.userData.email) && 
                 passwordRegex.test(this.userData.password) &&
                 this.userData.name.trim().length >= 2;
        }
      },
      {
        id: 'player-details',
        title: 'פרטי שחקן',
        isValid: () => {
          if (this.userData.type !== 'player') return true;
          
          return this.userData.age >= 8 && 
                 this.userData.position &&
                 this.userData.dominantFoot &&
                 this.userData.level;
        },
        condition: () => this.userData.type === 'player'
      },
      {
        id: 'scout-details',
        title: 'פרטי סקאוט',
        isValid: () => {
          if (this.userData.type !== 'scout') return true;
          
          return this.userData.club.trim().length >= 2 && 
                 this.userData.scoutPosition.trim().length >= 2;
        },
        condition: () => this.userData.type === 'scout'
      },
      {
        id: 'confirmation',
        title: 'אישור',
        isValid: () => true
      }
    ];
    
    this.init();
  }
  
  /**
   * Initialize the registration component
   */
  init() {
    this.render();
    this.attachEventListeners();
  }
  
  /**
   * Render the registration component
   */
  render() {
    // Clear container
    this.container.innerHTML = '';
    
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'multi-stage-registration';
    
    // Create header with progress indicator
    const header = this.createHeader();
    wrapper.appendChild(header);
    
    // Create content area
    const content = document.createElement('div');
    content.className = 'registration-content';
    
    // Render current stage
    const currentStageContent = this.renderStage(this.currentStage);
    content.appendChild(currentStageContent);
    
    wrapper.appendChild(content);
    
    // Create footer with navigation buttons
    const footer = this.createFooter();
    wrapper.appendChild(footer);
    
    this.container.appendChild(wrapper);
  }
  
  /**
   * Create the header with progress indicator
   * @returns {HTMLElement} - Header element
   */
  createHeader() {
    const header = document.createElement('div');
    header.className = 'registration-header';
    
    const title = document.createElement('h2');
    title.textContent = 'הרשמה';
    header.appendChild(title);
    
    const progressContainer = document.createElement('div');
    progressContainer.className = 'registration-progress';
    
    // Filter stages based on conditions
    const visibleStages = this.stages.filter(stage => 
      !stage.condition || stage.condition()
    );
    
    visibleStages.forEach((stage, index) => {
      const step = document.createElement('div');
      step.className = `progress-step ${index < this.currentStage ? 'completed' : ''} ${index === this.currentStage ? 'active' : ''}`;
      
      const stepNumber = document.createElement('div');
      stepNumber.className = 'step-number';
      stepNumber.textContent = index + 1;
      step.appendChild(stepNumber);
      
      const stepTitle = document.createElement('div');
      stepTitle.className = 'step-title';
      stepTitle.textContent = stage.title;
      step.appendChild(stepTitle);
      
      progressContainer.appendChild(step);
      
      // Add connector line between steps (except for the last one)
      if (index < visibleStages.length - 1) {
        const connector = document.createElement('div');
        connector.className = `step-connector ${index < this.currentStage ? 'completed' : ''}`;
        progressContainer.appendChild(connector);
      }
    });
    
    header.appendChild(progressContainer);
    return header;
  }
  
  /**
   * Create the footer with navigation buttons
   * @returns {HTMLElement} - Footer element
   */
  createFooter() {
    const footer = document.createElement('div');
    footer.className = 'registration-footer';
    
    // Back button (hidden on first stage)
    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'btn btn-secondary back-btn';
    backButton.textContent = 'חזור';
    backButton.style.display = this.currentStage === 0 ? 'none' : 'block';
    backButton.addEventListener('click', () => this.previousStage());
    footer.appendChild(backButton);
    
    // Next/Submit button
    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.className = 'btn btn-primary next-btn';
    
    // Filter stages based on conditions
    const visibleStages = this.stages.filter(stage => 
      !stage.condition || stage.condition()
    );
    
    const isLastStage = this.currentStage === visibleStages.length - 1;
    nextButton.textContent = isLastStage ? 'הירשם' : 'המשך';
    nextButton.addEventListener('click', () => {
      if (isLastStage) {
        this.submitRegistration();
      } else {
        this.nextStage();
      }
    });
    footer.appendChild(nextButton);
    
    return footer;
  }
  
  /**
   * Render a specific stage
   * @param {number} stageIndex - Index of the stage to render
   * @returns {HTMLElement} - Stage content element
   */
  renderStage(stageIndex) {
    // Filter stages based on conditions
    const visibleStages = this.stages.filter(stage => 
      !stage.condition || stage.condition()
    );
    
    const stage = visibleStages[stageIndex];
    const stageContent = document.createElement('div');
    stageContent.className = 'stage-content';
    stageContent.id = `stage-${stage.id}`;
    
    const stageTitle = document.createElement('h3');
    stageTitle.textContent = stage.title;
    stageContent.appendChild(stageTitle);
    
    const form = document.createElement('form');
    form.addEventListener('submit', (e) => e.preventDefault());
    
    switch (stage.id) {
      case 'user-type':
        form.appendChild(this.createUserTypeStage());
        break;
      case 'account-details':
        form.appendChild(this.createAccountDetailsStage());
        break;
      case 'player-details':
        form.appendChild(this.createPlayerDetailsStage());
        break;
      case 'scout-details':
        form.appendChild(this.createScoutDetailsStage());
        break;
      case 'confirmation':
        form.appendChild(this.createConfirmationStage());
        break;
    }
    
    stageContent.appendChild(form);
    return stageContent;
  }
  
  /**
   * Create user type selection stage
   * @returns {HTMLElement} - Stage form content
   */
  createUserTypeStage() {
    const container = document.createElement('div');
    container.className = 'user-type-selection';
    
    const description = document.createElement('p');
    description.textContent = 'בחר את סוג המשתמש שלך:';
    container.appendChild(description);
    
    const typeOptions = [
      { id: 'player', label: 'שחקן', icon: 'fa-futbol' },
      { id: 'scout', label: 'סקאוט', icon: 'fa-binoculars' }
    ];
    
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'type-options';
    
    typeOptions.forEach(option => {
      const typeCard = document.createElement('div');
      typeCard.className = `type-card ${this.userData.type === option.id ? 'selected' : ''}`;
      typeCard.dataset.type = option.id;
      
      const icon = document.createElement('i');
      icon.className = `fas ${option.icon}`;
      typeCard.appendChild(icon);
      
      const label = document.createElement('span');
      label.textContent = option.label;
      typeCard.appendChild(label);
      
      typeCard.addEventListener('click', () => {
        // Remove selected class from all cards
        document.querySelectorAll('.type-card').forEach(card => {
          card.classList.remove('selected');
        });
        
        // Add selected class to clicked card
        typeCard.classList.add('selected');
        
        // Update user data
        this.userData.type = option.id;
        
        // Enable next button if a type is selected
        document.querySelector('.next-btn').disabled = false;
      });
      
      optionsContainer.appendChild(typeCard);
    });
    
    container.appendChild(optionsContainer);
    
    // Disable next button if no type is selected
    setTimeout(() => {
      document.querySelector('.next-btn').disabled = !this.userData.type;
    }, 0);
    
    return container;
  }
  
  /**
   * Create account details stage
   * @returns {HTMLElement} - Stage form content
   */
  createAccountDetailsStage() {
    const container = document.createElement('div');
    container.className = 'account-details';
    
    // Name field
    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';
    
    const nameLabel = document.createElement('label');
    nameLabel.htmlFor = 'register-name';
    nameLabel.textContent = 'שם מלא';
    nameGroup.appendChild(nameLabel);
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'register-name';
    nameInput.className = 'form-control';
    nameInput.value = this.userData.name;
    nameInput.placeholder = 'הזן את שמך המלא';
    nameInput.required = true;
    nameInput.addEventListener('input', () => {
      this.userData.name = nameInput.value;
      this.validateStage();
    });
    nameGroup.appendChild(nameInput);
    
    const nameError = document.createElement('div');
    nameError.className = 'error-message';
    nameError.id = 'name-error';
    nameGroup.appendChild(nameError);
    
    container.appendChild(nameGroup);
    
    // Email field
    const emailGroup = document.createElement('div');
    emailGroup.className = 'form-group';
    
    const emailLabel = document.createElement('label');
    emailLabel.htmlFor = 'register-email';
    emailLabel.textContent = 'אימייל';
    emailGroup.appendChild(emailLabel);
    
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'register-email';
    emailInput.className = 'form-control';
    emailInput.value = this.userData.email;
    emailInput.placeholder = 'הזן את כתובת האימייל שלך';
    emailInput.required = true;
    emailInput.addEventListener('input', () => {
      this.userData.email = emailInput.value;
      this.validateStage();
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const errorElement = document.getElementById('email-error');
      
      if (emailInput.value && !emailRegex.test(emailInput.value)) {
        errorElement.textContent = 'כתובת אימייל לא תקינה';
        emailInput.classList.add('is-invalid');
      } else {
        errorElement.textContent = '';
        emailInput.classList.remove('is-invalid');
      }
    });
    emailGroup.appendChild(emailInput);
    
    const emailError = document.createElement('div');
    emailError.className = 'error-message';
    emailError.id = 'email-error';
    emailGroup.appendChild(emailError);
    
    container.appendChild(emailGroup);
    
    // Password field
    const passwordGroup = document.createElement('div');
    passwordGroup.className = 'form-group';
    
    const passwordLabel = document.createElement('label');
    passwordLabel.htmlFor = 'register-password';
    passwordLabel.textContent = 'סיסמה';
    passwordGroup.appendChild(passwordLabel);
    
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.id = 'register-password';
    passwordInput.className = 'form-control';
    passwordInput.value = this.userData.password;
    passwordInput.placeholder = 'הזן סיסמה (לפחות 8 תווים)';
    passwordInput.required = true;
    passwordInput.addEventListener('input', () => {
      this.userData.password = passwordInput.value;
      this.validateStage();
      
      // Validate password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      const errorElement = document.getElementById('password-error');
      
      if (passwordInput.value && !passwordRegex.test(passwordInput.value)) {
        errorElement.textContent = 'הסיסמה חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה ומספר';
        passwordInput.classList.add('is-invalid');
      } else {
        errorElement.textContent = '';
        passwordInput.classList.remove('is-invalid');
      }
    });
    passwordGroup.appendChild(passwordInput);
    
    const passwordError = document.createElement('div');
    passwordError.className = 'error-message';
    passwordError.id = 'password-error';
    passwordGroup.appendChild(passwordError);
    
    container.appendChild(passwordGroup);
    
    // Password confirmation field
    const confirmPasswordGroup = document.createElement('div');
    confirmPasswordGroup.className = 'form-group';
    
    const confirmPasswordLabel = document.createElement('label');
    confirmPasswordLabel.htmlFor = 'register-confirm-password';
    confirmPasswordLabel.textContent = 'אימות סיסמה';
    confirmPasswordGroup.appendChild(confirmPasswordLabel);
    
    const confirmPasswordInput = document.createElement('input');
    confirmPasswordInput.type = 'password';
    confirmPasswordInput.id = 'register-confirm-password';
    confirmPasswordInput.className = 'form-control';
    confirmPasswordInput.placeholder = 'הזן את הסיסמה שוב';
    confirmPasswordInput.required = true;
    confirmPasswordInput.addEventListener('input', () => {
      const errorElement = document.getElementById('confirm-password-error');
      
      if (confirmPasswordInput.value && confirmPasswordInput.value !== this.userData.password) {
        errorElement.textContent = 'הסיסמאות אינן תואמות';
        confirmPasswordInput.classList.add('is-invalid');
      } else {
        errorElement.textContent = '';
        confirmPasswordInput.classList.remove('is-invalid');
      }
      
      this.validateStage();
    });
    confirmPasswordGroup.appendChild(confirmPasswordInput);
    
    const confirmPasswordError = document.createElement('div');
    confirmPasswordError.className = 'error-message';
    confirmPasswordError.id = 'confirm-password-error';
    confirmPasswordGroup.appendChild(confirmPasswordError);
    
    container.appendChild(confirmPasswordGroup);
    
    // Disable next button if form is not valid
    setTimeout(() => {
      this.validateStage();
    }, 0);
    
    return container;
  }
  
  /**
   * Create player details stage
   * @returns {HTMLElement} - Stage form content
   */
  createPlayerDetailsStage() {
    const container = document.createElement('div');
    container.className = 'player-details';
    
    // Age field
    const ageGroup = document.createElement('div');
    ageGroup.className = 'form-group';
    
    const ageLabel = document.createElement('label');
    ageLabel.htmlFor = 'register-age';
    ageLabel.textContent = 'גיל';
    ageGroup.appendChild(ageLabel);
    
    const ageInput = document.createElement('input');
    ageInput.type = 'number';
    ageInput.id = 'register-age';
    ageInput.className = 'form-control';
    ageInput.value = this.userData.age || '';
    ageInput.min = 8;
    ageInput.max = 50;
    ageInput.required = true;
    ageInput.addEventListener('input', () => {
      this.userData.age = parseInt(ageInput.value, 10);
      this.validateStage();
    });
    ageGroup.appendChild(ageInput);
    
    container.appendChild(ageGroup);
    
    // Position field
    const positionGroup = document.createElement('div');
    positionGroup.className = 'form-group';
    
    const positionLabel = document.createElement('label');
    positionLabel.htmlFor = 'register-position';
    positionLabel.textContent = 'עמדה';
    positionGroup.appendChild(positionLabel);
    
    const positionSelect = document.createElement('select');
    positionSelect.id = 'register-position';
    positionSelect.className = 'form-control';
    positionSelect.required = true;
    
    const positions = [
      { value: '', label: 'בחר עמדה' },
      { value: 'goalkeeper', label: 'שוער' },
      { value: 'defender', label: 'מגן' },
      { value: 'midfielder', label: 'קשר' },
      { value: 'forward', label: 'חלוץ' }
    ];
    
    positions.forEach(position => {
      const option = document.createElement('option');
      option.value = position.value;
      option.textContent = position.label;
      positionSelect.appendChild(option);
    });
    
    positionSelect.value = this.userData.position || '';
    positionSelect.addEventListener('change', () => {
      this.userData.position = positionSelect.value;
      this.validateStage();
    });
    positionGroup.appendChild(positionSelect);
    
    container.appendChild(positionGroup);
    
    // Dominant foot field
    const footGroup = document.createElement('div');
    footGroup.className = 'form-group';
    
    const footLabel = document.createElement('label');
    footLabel.textContent = 'רגל דומיננטית';
    footGroup.appendChild(footLabel);
    
    const footOptions = document.createElement('div');
    footOptions.className = 'radio-group';
    
    const feet = [
      { value: 'right', label: 'ימין' },
      { value: 'left', label: 'שמאל' },
      { value: 'both', label: 'שתיהן' }
    ];
    
    feet.forEach(foot => {
      const radioContainer = document.createElement('div');
      radioContainer.className = 'radio-option';
      
      const radioInput = document.createElement('input');
      radioInput.type = 'radio';
      radioInput.id = `foot-${foot.value}`;
      radioInput.name = 'dominant-foot';
      radioInput.value = foot.value;
      radioInput.checked = this.userData.dominantFoot === foot.value;
      radioInput.addEventListener('change', () => {
        this.userData.dominantFoot = foot.value;
        this.validateStage();
      });
      radioContainer.appendChild(radioInput);
      
      const radioLabel = document.createElement('label');
      radioLabel.htmlFor = `foot-${foot.value}`;
      radioLabel.textContent = foot.label;
      radioContainer.appendChild(radioLabel);
      
      footOptions.appendChild(radioContainer);
    });
    
    footGroup.appendChild(footOptions);
    container.appendChild(footGroup);
    
    // Level field
    const levelGroup = document.createElement('div');
    levelGroup.className = 'form-group';
    
    const levelLabel = document.createElement('label');
    levelLabel.textContent = 'רמה';
    levelGroup.appendChild(levelLabel);
    
    const levelOptions = document.createElement('div');
    levelOptions.className = 'radio-group';
    
    const levels = [
      { value: 'beginner', label: 'מתחיל' },
      { value: 'intermediate', label: 'בינוני' },
      { value: 'advanced', label: 'מתקדם' }
    ];
    
    levels.forEach(level => {
      const radioContainer = document.createElement('div');
      radioContainer.className = 'radio-option';
      
      const radioInput = document.createElement('input');
      radioInput.type = 'radio';
      radioInput.id = `level-${level.value}`;
      radioInput.name = 'level';
      radioInput.value = level.value;
      radioInput.checked = this.userData.level === level.value;
      radioInput.addEventListener('change', () => {
        this.userData.level = level.value;
        this.validateStage();
      });
      radioContainer.appendChild(radioInput);
      
      const radioLabel = document.createElement('label');
      radioLabel.htmlFor = `level-${level.value}`;
      radioLabel.textContent = level.label;
      radioContainer.appendChild(radioLabel);
      
      levelOptions.appendChild(radioContainer);
    });
    
    levelGroup.appendChild(levelOptions);
    container.appendChild(levelGroup);
    
    // Disable next button if form is not valid
    setTimeout(() => {
      this.validateStage();
    }, 0);
    
    return container;
  }
  
  /**
   * Create scout details stage
   * @returns {HTMLElement} - Stage form content
   */
  createScoutDetailsStage() {
    const container = document.createElement('div');
    container.className = 'scout-details';
    
    // Club field
    const clubGroup = document.createElement('div');
    clubGroup.className = 'form-group';
    
    const clubLabel = document.createElement('label');
    clubLabel.htmlFor = 'register-club';
    clubLabel.textContent = 'מועדון';
    clubGroup.appendChild(clubLabel);
    
    const clubInput = document.createElement('input');
    clubInput.type = 'text';
    clubInput.id = 'register-club';
    clubInput.className = 'form-control';
    clubInput.value = this.userData.club || '';
    clubInput.placeholder = 'הזן את שם המועדון';
    clubInput.required = true;
    clubInput.addEventListener('input', () => {
      this.userData.club = clubInput.value;
      this.validateStage();
    });
    clubGroup.appendChild(clubInput);
    
    container.appendChild(clubGroup);
    
    // Position field
    const positionGroup = document.createElement('div');
    positionGroup.className = 'form-group';
    
    const positionLabel = document.createElement('label');
    positionLabel.htmlFor = 'register-scout-position';
    positionLabel.textContent = 'תפקיד';
    positionGroup.appendChild(positionLabel);
    
    const positionInput = document.createElement('input');
    positionInput.type = 'text';
    positionInput.id = 'register-scout-position';
    positionInput.className = 'form-control';
    positionInput.value = this.userData.scoutPosition || '';
    positionInput.placeholder = 'הזן את התפקיד שלך במועדון';
    positionInput.required = true;
    positionInput.addEventListener('input', () => {
      this.userData.scoutPosition = positionInput.value;
      this.validateStage();
    });
    positionGroup.appendChild(positionInput);
    
    container.appendChild(positionGroup);
    
    // Disable next button if form is not valid
    setTimeout(() => {
      this.validateStage();
    }, 0);
    
    return container;
  }
  
  /**
   * Create confirmation stage
   * @returns {HTMLElement} - Stage form content
   */
  createConfirmationStage() {
    const container = document.createElement('div');
    container.className = 'confirmation-stage';
    
    const message = document.createElement('p');
    message.textContent = 'אנא אשר את הפרטים שלך לפני ההרשמה:';
    container.appendChild(message);
    
    const detailsList = document.createElement('div');
    detailsList.className = 'details-summary';
    
    // Basic details
    const basicDetails = document.createElement('div');
    basicDetails.className = 'details-section';
    
    const basicTitle = document.createElement('h4');
    basicTitle.textContent = 'פרטים בסיסיים';
    basicDetails.appendChild(basicTitle);
    
    const basicItems = [
      { label: 'שם מלא', value: this.userData.name },
      { label: 'אימייל', value: this.userData.email },
      { label: 'סוג משתמש', value: this.userData.type === 'player' ? 'שחקן' : 'סקאוט' }
    ];
    
    const basicList = document.createElement('ul');
    basicItems.forEach(item => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
      basicList.appendChild(listItem);
    });
    basicDetails.appendChild(basicList);
    detailsList.appendChild(basicDetails);
    
    // Type-specific details
    if (this.userData.type === 'player') {
      const playerDetails = document.createElement('div');
      playerDetails.className = 'details-section';
      
      const playerTitle = document.createElement('h4');
      playerTitle.textContent = 'פרטי שחקן';
      playerDetails.appendChild(playerTitle);
      
      const footMap = { right: 'ימין', left: 'שמאל', both: 'שתיהן' };
      const levelMap = { beginner: 'מתחיל', intermediate: 'בינוני', advanced: 'מתקדם' };
      const positionMap = { 
        goalkeeper: 'שוער', 
        defender: 'מגן', 
        midfielder: 'קשר', 
        forward: 'חלוץ' 
      };
      
      const playerItems = [
        { label: 'גיל', value: this.userData.age },
        { label: 'עמדה', value: positionMap[this.userData.position] || this.userData.position },
        { label: 'רגל דומיננטית', value: footMap[this.userData.dominantFoot] || this.userData.dominantFoot },
        { label: 'רמה', value: levelMap[this.userData.level] || this.userData.level }
      ];
      
      const playerList = document.createElement('ul');
      playerItems.forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
        playerList.appendChild(listItem);
      });
      playerDetails.appendChild(playerList);
      detailsList.appendChild(playerDetails);
    } else if (this.userData.type === 'scout') {
      const scoutDetails = document.createElement('div');
      scoutDetails.className = 'details-section';
      
      const scoutTitle = document.createElement('h4');
      scoutTitle.textContent = 'פרטי סקאוט';
      scoutDetails.appendChild(scoutTitle);
      
      const scoutItems = [
        { label: 'מועדון', value: this.userData.club },
        { label: 'תפקיד', value: this.userData.scoutPosition }
      ];
      
      const scoutList = document.createElement('ul');
      scoutItems.forEach(item => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
        scoutList.appendChild(listItem);
      });
      scoutDetails.appendChild(scoutList);
      detailsList.appendChild(scoutDetails);
    }
    
    container.appendChild(detailsList);
    
    const termsGroup = document.createElement('div');
    termsGroup.className = 'form-group terms-group';
    
    const termsCheckbox = document.createElement('input');
    termsCheckbox.type = 'checkbox';
    termsCheckbox.id = 'terms-checkbox';
    termsCheckbox.addEventListener('change', () => {
      document.querySelector('.next-btn').disabled = !termsCheckbox.checked;
    });
    termsGroup.appendChild(termsCheckbox);
    
    const termsLabel = document.createElement('label');
    termsLabel.htmlFor = 'terms-checkbox';
    termsLabel.innerHTML = 'אני מאשר/ת את <a href="#" class="terms-link">תנאי השימוש</a> ו<a href="#" class="privacy-link">מדיניות הפרטיות</a>';
    termsGroup.appendChild(termsLabel);
    
    container.appendChild(termsGroup);
    
    // Disable submit button until terms are accepted
    setTimeout(() => {
      document.querySelector('.next-btn').disabled = true;
    }, 0);
    
    return container;
  }
  
  /**
   * Move to the next stage
   */
  nextStage() {
    