/**
 * Registration Integration
 * Integrates the MultiStageRegistration component with form submissions
 */

'use strict';

import MultiStageRegistration from '../components/multi-stage-registration.js';

// Wait for the DOM to be fully loaded before executing code
document.addEventListener('DOMContentLoaded', () => {
  // Create the multi-stage registration modal
  createMultiStageModal();
  
  // Add event listeners to the registration forms
  setupFormListeners();
});

/**
 * Create a modal for the multi-stage registration component
 */
function createMultiStageModal() {
  // Create modal element
  const multiStageModal = document.createElement('div');
  multiStageModal.className = 'modal';
  multiStageModal.id = 'multi-stage-modal';
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  
  // Create close button
  const closeButton = document.createElement('span');
  closeButton.className = 'close-modal';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', () => {
    multiStageModal.style.display = 'none';
  });
  
  // Create title
  const title = document.createElement('h2');
  title.textContent = 'הרשמה';
  
  // Create container for multi-stage registration
  const registrationContainer = document.createElement('div');
  registrationContainer.id = 'multi-stage-registration-container';
  
  // Assemble modal
  modalContent.appendChild(closeButton);
  modalContent.appendChild(title);
  modalContent.appendChild(registrationContainer);
  multiStageModal.appendChild(modalContent);
  
  // Add modal to the document
  document.body.appendChild(multiStageModal);
  
  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
    if (event.target === multiStageModal) {
      multiStageModal.style.display = 'none';
    }
  });
}

/**
 * Setup event listeners for the registration forms
 */
function setupFormListeners() {
  // Get the player and scout forms
  const playerForm = document.getElementById('player-form');
  const scoutForm = document.getElementById('scout-form');
  
  // Add event listener to player form
  if (playerForm) {
    playerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Close the registration modal
      document.getElementById('register-modal').style.display = 'none';
      
      // Show the multi-stage modal
      const multiStageModal = document.getElementById('multi-stage-modal');
      multiStageModal.style.display = 'block';
      
      // Initialize the multi-stage registration component
      const multiStageRegistration = new MultiStageRegistration('multi-stage-registration-container');
      
      // Set user type to player
      multiStageRegistration.userData.type = 'player';
      
      // Pre-fill data from the form
      multiStageRegistration.userData.name = document.getElementById('player-name').value;
      multiStageRegistration.userData.email = document.getElementById('player-email').value;
      multiStageRegistration.userData.password = document.getElementById('player-password').value;
      multiStageRegistration.userData.age = parseInt(document.getElementById('player-age').value, 10);
      multiStageRegistration.userData.position = document.getElementById('player-position').value;
      multiStageRegistration.userData.dominantFoot = document.querySelector('input[name="dominant-foot"]:checked').value;
      multiStageRegistration.userData.level = document.getElementById('player-level').value;
      
      // Skip to confirmation stage
      multiStageRegistration.currentStage = 3; // Skip to confirmation stage
      multiStageRegistration.render();
    });
  }
  
  // Add event listener to scout form
  if (scoutForm) {
    scoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Close the registration modal
      document.getElementById('register-modal').style.display = 'none';
      
      // Show the multi-stage modal
      const multiStageModal = document.getElementById('multi-stage-modal');
      multiStageModal.style.display = 'block';
      
      // Initialize the multi-stage registration component
      const multiStageRegistration = new MultiStageRegistration('multi-stage-registration-container');
      
      // Set user type to scout
      multiStageRegistration.userData.type = 'scout';
      
      // Pre-fill data from the form
      multiStageRegistration.userData.name = document.getElementById('scout-name').value;
      multiStageRegistration.userData.email = document.getElementById('scout-email').value;
      multiStageRegistration.userData.password = document.getElementById('scout-password').value;
      multiStageRegistration.userData.club = document.getElementById('scout-club').value;
      multiStageRegistration.userData.scoutPosition = document.getElementById('scout-position').value;
      
      // Skip to confirmation stage
      multiStageRegistration.currentStage = 3; // Skip to confirmation stage
      multiStageRegistration.render();
    });
  }
}