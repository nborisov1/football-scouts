/**
 * Multi-Stage Registration Component
 * Provides an interactive, step-by-step registration process
 */

'use strict';

// Firebase auth will be accessed through global window.authManager

// Wrap in IIFE to avoid global pollution but expose the class
(function() {
  'use strict';

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
   * Create a form field with label, input, and error message
   * @param {Object} config - Field configuration
   * @returns {HTMLElement} - Form group element
   */
  createFormField(config) {
    const {
      id,
      label,
      type = 'text',
      placeholder = '',
      value = '',
      required = true,
      className = 'account-details',
      onInput = null,
      validator = null
    } = config;

    const group = document.createElement('div');
    group.className = 'form-group';

    // Label
    const labelElement = document.createElement('label');
    labelElement.htmlFor = id;
    labelElement.textContent = label;
    group.appendChild(labelElement);

    // Input
    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.className = 'form-control';
    input.value = value;
    input.placeholder = placeholder;
    input.required = required;

    // Event listener
    input.addEventListener('input', () => {
      if (onInput) onInput(input.value);
      this.validateStage();
      
      if (validator) {
        const errorElement = document.getElementById(`${id.replace('register-', '')}-error`);
        const validationResult = validator(input.value);
        
        if (validationResult.isValid) {
          errorElement.textContent = '';
          input.classList.remove('is-invalid');
        } else {
          errorElement.textContent = validationResult.message;
          input.classList.add('is-invalid');
        }
      }
    });
    group.appendChild(input);

    // Error message
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.id = `${id.replace('register-', '')}-error`;
    group.appendChild(errorElement);

    return group;
  }

  /**
   * Create account details stage
   * @returns {HTMLElement} - Stage form content
   */
  createAccountDetailsStage() {
    const container = document.createElement('div');
    container.className = 'account-details';
    
    // Name field
    const nameField = this.createFormField({
      id: 'register-name',
      label: 'שם מלא',
      placeholder: 'הזן את שמך המלא',
      value: this.userData.name,
      onInput: (value) => { this.userData.name = value; }
    });
    container.appendChild(nameField);
    
    // Email field
    const emailField = this.createFormField({
      id: 'register-email',
      label: 'אימייל',
      type: 'email',
      placeholder: 'הזן את כתובת האימייל שלך',
      value: this.userData.email,
      onInput: (value) => { this.userData.email = value; },
      validator: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
          isValid: !value || emailRegex.test(value),
          message: 'כתובת אימייל לא תקינה'
        };
      }
    });
    container.appendChild(emailField);
    
    // Password field
    const passwordField = this.createFormField({
      id: 'register-password',
      label: 'סיסמה',
      type: 'password',
      placeholder: 'הזן סיסמה (לפחות 8 תווים)',
      value: this.userData.password,
      onInput: (value) => { this.userData.password = value; },
      validator: (value) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return {
          isValid: !value || passwordRegex.test(value),
          message: 'הסיסמה חייבת להכיל לפחות 8 תווים, אות גדולה, אות קטנה ומספר'
        };
      }
    });
    container.appendChild(passwordField);
    
    // Password confirmation field
    const confirmPasswordField = this.createFormField({
      id: 'register-confirm-password',
      label: 'אימות סיסמה',
      type: 'password',
      placeholder: 'הזן את הסיסמה שוב',
      onInput: () => {}, // No direct userData update
      validator: (value) => {
        return {
          isValid: !value || value === this.userData.password,
          message: 'הסיסמאות אינן תואמות'
        };
      }
    });
    container.appendChild(confirmPasswordField);
    
    // Disable next button if form is not valid
    setTimeout(() => {
      this.validateStage();
    }, 0);
    
    return container;
  }
  
  /**
   * Create a select field with options
   * @param {Object} config - Select field configuration
   * @returns {HTMLElement} - Form group element
   */
  createSelectField(config) {
    const { id, label, options, value, onChange } = config;

    const group = document.createElement('div');
    group.className = 'form-group';

    const labelElement = document.createElement('label');
    labelElement.htmlFor = id;
    labelElement.textContent = label;
    group.appendChild(labelElement);

    const select = document.createElement('select');
    select.id = id;
    select.className = 'form-control';
    select.required = true;

    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      select.appendChild(optionElement);
    });

    select.value = value || '';
    select.addEventListener('change', () => {
      if (onChange) onChange(select.value);
      this.validateStage();
    });
    group.appendChild(select);

    return group;
  }

  /**
   * Create a radio group field
   * @param {Object} config - Radio group configuration
   * @returns {HTMLElement} - Form group element
   */
  createRadioGroup(config) {
    const { label, name, options, value, onChange } = config;

    const group = document.createElement('div');
    group.className = 'form-group';

    const labelElement = document.createElement('label');
    labelElement.textContent = label;
    group.appendChild(labelElement);

    const radioContainer = document.createElement('div');
    radioContainer.className = 'radio-group';

    options.forEach(option => {
      const radioOption = document.createElement('div');
      radioOption.className = 'radio-option';

      const radioInput = document.createElement('input');
      radioInput.type = 'radio';
      radioInput.id = `${name}-${option.value}`;
      radioInput.name = name;
      radioInput.value = option.value;
      radioInput.checked = value === option.value;
      radioInput.addEventListener('change', () => {
        if (onChange) onChange(option.value);
        this.validateStage();
      });
      radioOption.appendChild(radioInput);

      const radioLabel = document.createElement('label');
      radioLabel.htmlFor = `${name}-${option.value}`;
      radioLabel.textContent = option.label;
      radioOption.appendChild(radioLabel);

      radioContainer.appendChild(radioOption);
    });

    group.appendChild(radioContainer);
    return group;
  }

  /**
   * Create player details stage
   * @returns {HTMLElement} - Stage form content
   */
  createPlayerDetailsStage() {
    const container = document.createElement('div');
    container.className = 'player-details';
    
    // Age field
    const ageField = this.createFormField({
      id: 'register-age',
      label: 'גיל',
      type: 'number',
      value: this.userData.age || '',
      onInput: (value) => { this.userData.age = parseInt(value, 10); }
    });
    // Add min/max attributes
    const ageInput = ageField.querySelector('input');
    ageInput.min = 8;
    ageInput.max = 50;
    container.appendChild(ageField);
    
    // Position field
    const positionField = this.createSelectField({
      id: 'register-position',
      label: 'עמדה',
      options: [
        { value: '', label: 'בחר עמדה' },
        { value: 'goalkeeper', label: 'שוער' },
        { value: 'defender', label: 'מגן' },
        { value: 'midfielder', label: 'קשר' },
        { value: 'forward', label: 'חלוץ' }
      ],
      value: this.userData.position,
      onChange: (value) => { this.userData.position = value; }
    });
    container.appendChild(positionField);
    
    // Dominant foot field
    const footField = this.createRadioGroup({
      label: 'רגל דומיננטית',
      name: 'dominant-foot',
      options: [
        { value: 'right', label: 'ימין' },
        { value: 'left', label: 'שמאל' },
        { value: 'both', label: 'שתיהן' }
      ],
      value: this.userData.dominantFoot,
      onChange: (value) => { this.userData.dominantFoot = value; }
    });
    container.appendChild(footField);
    
    // Level field
    const levelField = this.createRadioGroup({
      label: 'רמה',
      name: 'level',
      options: [
        { value: 'beginner', label: 'מתחיל' },
        { value: 'intermediate', label: 'בינוני' },
        { value: 'advanced', label: 'מתקדם' }
      ],
      value: this.userData.level,
      onChange: (value) => { this.userData.level = value; }
    });
    container.appendChild(levelField);
    
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
    const clubField = this.createFormField({
      id: 'register-club',
      label: 'מועדון',
      placeholder: 'הזן את שם המועדון',
      value: this.userData.club || '',
      onInput: (value) => { this.userData.club = value; }
    });
    container.appendChild(clubField);
    
    // Position field
    const positionField = this.createFormField({
      id: 'register-scout-position',
      label: 'תפקיד',
      placeholder: 'הזן את התפקיד שלך במועדון',
      value: this.userData.scoutPosition || '',
      onInput: (value) => { this.userData.scoutPosition = value; }
    });
    container.appendChild(positionField);
    
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
    // Check if current stage is valid
    const visibleStages = this.stages.filter(stage =>
      !stage.condition || stage.condition()
    );
    
    const currentStage = visibleStages[this.currentStage];
    if (!currentStage.isValid()) {
      return;
    }
    
    // Move to next stage
    this.currentStage++;
    
    // Re-render the component
    this.render();
  }
  
  /**
   * Move to the previous stage
   */
  previousStage() {
    if (this.currentStage > 0) {
      this.currentStage--;
      this.render();
    }
  }
  
  /**
   * Validate the current stage
   */
  validateStage() {
    const visibleStages = this.stages.filter(stage =>
      !stage.condition || stage.condition()
    );
    
    const currentStage = visibleStages[this.currentStage];
    const nextButton = document.querySelector('.next-btn');
    
    if (nextButton) {
      nextButton.disabled = !currentStage.isValid();
    }
  }
  
  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Add event listeners for terms and privacy links
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('terms-link')) {
        e.preventDefault();
        alert('Terms and conditions will be displayed here.');
      } else if (e.target.classList.contains('privacy-link')) {
        e.preventDefault();
        alert('Privacy policy will be displayed here.');
      }
    });
  }
  
  /**
   * Submit registration
   */
  async submitRegistration() {
    // Show loading state
    const submitButton = document.querySelector('.next-btn');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'מתבצעת הרשמה...';
    
    try {
      // Check if authManager is available
      if (!window.authManager) {
        throw new Error('מערכת האימות לא זמינה. אנא רענן את הדף ונסה שוב.');
      }

      // Prepare registration data
      const registrationData = {
        name: this.userData.name,
        email: this.userData.email,
        password: this.userData.password
      };
      
      if (this.userData.type === 'player') {
        registrationData.age = this.userData.age;
        registrationData.position = this.userData.position;
        registrationData.dominantFoot = this.userData.dominantFoot;
        registrationData.level = this.userData.level;
      } else if (this.userData.type === 'scout') {
        registrationData.club = this.userData.club;
        registrationData.position = this.userData.scoutPosition;
      }
      
      // Register user with Firebase through authManager
      const result = await window.authManager.register(registrationData, this.userData.type);
      
      if (result.success) {
        // Show success message
        this.showMessage('success', 'ההרשמה הושלמה בהצלחה!');
        
        // Close the modal and update UI after a short delay
        setTimeout(() => {
          // Close the modal
          const multiStageModal = document.getElementById('multi-stage-modal');
          if (multiStageModal) {
            multiStageModal.style.display = 'none';
          }
          
          // The auth state change listener will handle UI updates
          
          // If player, show message about challenges
          if (this.userData.type === 'player') {
            setTimeout(() => {
              this.showGlobalMessage('מעביר אותך לאתגרים הראשוניים...', 'info');
            }, 1000);
          }
        }, 2000);
      } else {
        throw new Error('ההרשמה נכשלה. אנא נסה שוב.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Show user-friendly error message
      let errorMessage = 'שגיאה בהרשמה. אנא נסה שוב.';
      
      if (error.message.includes('email-already-in-use') || error.message.includes('כתובת האימייל כבר בשימוש')) {
        errorMessage = 'כתובת האימייל כבר רשומה במערכת. אנא השתמש בכתובת אחרת או נסה להתחבר.';
      } else if (error.message.includes('weak-password') || error.message.includes('הסיסמה חלשה')) {
        errorMessage = 'הסיסמה חלשה מדי. אנא בחר סיסמה חזקה יותר.';
      } else if (error.message.includes('invalid-email')) {
        errorMessage = 'כתובת אימייל לא תקינה.';
      } else if (error.message.includes('מערכת האימות לא זמינה')) {
        errorMessage = error.message;
      }
      
      this.showMessage('error', errorMessage);
      
      // Reset button
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  }
  
  /**
   * Show a message to the user
   * @param {string} type - Message type (success, error, info)
   * @param {string} text - Message text
   */
  showMessage(type, text) {
    this.showGlobalMessage(text, type, '.multi-stage-registration');
  }
  
  /**
   * Update the UI for a logged in user
   */
  updateUIForLoggedInUser() {
    // Use the global function if available, otherwise implement locally
    if (window.updateUIForLoggedInUser) {
      window.updateUIForLoggedInUser();
    } else {
      this.updateUIForLoggedInUserLocal();
    }
  }
  
  /**
   * Local implementation of UI update for logged in user
   */
  updateUIForLoggedInUserLocal() {
    const authButtons = document.querySelector('.auth-buttons');
    
    if (authButtons) {
      // Replace login/register buttons with user menu
      authButtons.innerHTML = `
        <div class="user-menu">
          <button class="btn user-menu-btn">החשבון שלי <i class="fas fa-user"></i></button>
          <div class="user-dropdown">
            <a href="pages/profile.html">הפרופיל שלי</a>
            <a href="pages/training.html">תוכנית האימון שלי</a>
            <a href="#" id="logout-btn">התנתק</a>
          </div>
        </div>
      `;
      
      // Add event listener for logout
      document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        // In a real app, this would call a logout API
        location.reload(); // For demo, just reload the page
      });
      
      // Toggle user dropdown
      const userMenuBtn = document.querySelector('.user-menu-btn');
      const userDropdown = document.querySelector('.user-dropdown');
      
      userMenuBtn.addEventListener('click', () => {
        userDropdown.classList.toggle('visible');
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu')) {
          userDropdown.classList.remove('visible');
        }
      });
    }
  }
  
  /**
   * Show a global message to the user
   * @param {string} text - Message text
   * @param {string} type - Message type ('success', 'error', 'info')
   * @param {string} container - Optional container selector for scoped messages
   */
  showGlobalMessage(text, type = 'info', container = null) {
    // Use global message function if available
    if (window.showMessage) {
      window.showMessage(text, type);
      return;
    }
    
    // Fallback to local implementation
    if (container) {
      // Show message within specific container (like registration component)
      const targetContainer = document.querySelector(container);
      if (targetContainer) {
        // Remove any existing messages in this container
        const existingMessage = targetContainer.querySelector('.registration-message');
        if (existingMessage) {
          existingMessage.remove();
        }
        
        // Create message element
        const message = document.createElement('div');
        message.className = `registration-message ${type}`;
        message.textContent = text;
        
        // Add message to the component
        targetContainer.insertBefore(message, targetContainer.firstChild);
        
        // Auto-remove success and info messages after a delay
        if (type !== 'error') {
          setTimeout(() => {
            message.remove();
          }, 5000);
        }
        return;
      }
    }
    
    // Global message implementation
    let messageContainer = document.querySelector('.message-container');
    
    if (!messageContainer) {
      messageContainer = document.createElement('div');
      messageContainer.className = 'message-container';
      document.body.appendChild(messageContainer);
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = text;
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'message-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
      messageElement.remove();
    });
    
    messageElement.appendChild(closeBtn);
    messageContainer.appendChild(messageElement);
    
    setTimeout(() => {
      messageElement.remove();
    }, 5000);
  }
  }

  // Expose the class globally for use without modules
  window.MultiStageRegistration = MultiStageRegistration;

})(); // End IIFE