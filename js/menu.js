/**
 * Menu functionality for the Fartlek Trainer app
 * Handles the settings menu and related functionality
 */

const MENU = {
    // DOM Elements
    elements: {
      menuButton: document.getElementById('menu-button'),
      settingsPanel: document.getElementById('settings-panel'),
      closeSettings: document.getElementById('close-settings'),
      overlay: document.getElementById('overlay'),
      keepScreenOn: document.getElementById('keep-screen-on')
    },
    
    // State
    isOpen: false,
    
    // Initialize menu functionality
    init: function() {
      // Set up event listeners
      this.elements.menuButton.addEventListener('click', this.openMenu.bind(this));
      this.elements.closeSettings.addEventListener('click', this.closeMenu.bind(this));
      this.elements.overlay.addEventListener('click', this.closeMenu.bind(this));
      
      // Keep screen on checkbox
      if (this.elements.keepScreenOn) {
        this.elements.keepScreenOn.addEventListener('change', function() {
          localStorage.setItem('keepScreenOn', this.checked);
          // If in a workout, apply the change immediately
          if (APP.workout.currentStage !== 'setup' && !this.checked) {
            WAKELOCK.disable();
          } else if (APP.workout.currentStage !== 'setup' && this.checked) {
            WAKELOCK.enable();
          }
        });
        
        // Load saved preference
        const savedKeepScreenOn = localStorage.getItem('keepScreenOn');
        if (savedKeepScreenOn !== null) {
          this.elements.keepScreenOn.checked = savedKeepScreenOn === 'true';
        }
      }
    },
    
    // Open the menu
    openMenu: function() {
      this.elements.settingsPanel.classList.add('open');
      this.elements.overlay.classList.add('visible');
      this.isOpen = true;
      
      // Prevent body scrolling when menu is open
      document.body.classList.add('no-scroll');
    },
    
    // Close the menu
    closeMenu: function() {
      this.elements.settingsPanel.classList.remove('open');
      this.elements.overlay.classList.remove('visible');
      this.isOpen = false;
      
      // Re-enable body scrolling
      document.body.classList.remove('no-scroll');
    },
    
    // Check if "keep screen on" is enabled
    isKeepScreenOnEnabled: function() {
      if (this.elements.keepScreenOn) {
        return this.elements.keepScreenOn.checked;
      }
      
      // Default to true if element not found
      return true;
    }
  };