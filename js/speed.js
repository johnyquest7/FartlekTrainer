/**
 * Speed settings functionality for the Fartlek Trainer app
 * Handles speed unit conversions and related functionality
 */

const SPEED = {
    // DOM Elements
    elements: {
      unitsSelect: document.getElementById('units-select'),
      fastRunSpeed: document.getElementById('fast-run-speed'),
      slowRunSpeed: document.getElementById('slow-run-speed'),
      fastSpeedUnit: document.getElementById('fast-speed-unit'),
      slowSpeedUnit: document.getElementById('slow-speed-unit')
    },
    
    // Default speeds
    defaults: {
      fastRunSpeedMph: 6.0,
      slowRunSpeedMph: 3.0,
      fastRunSpeedKph: 9.7, // 6.0 mph converted to kph
      slowRunSpeedKph: 4.8  // 3.0 mph converted to kph
    },
    
    // Current units
    units: 'mph',
    
    // Initialize speed functionality
    init: function() {
      // Load saved units preference
      const savedUnits = localStorage.getItem('speedUnits');
      if (savedUnits) {
        this.units = savedUnits;
        this.elements.unitsSelect.value = savedUnits;
      }
      
      // Update unit display
      this.updateUnitDisplay();
      
      // Add event listeners
      this.elements.unitsSelect.addEventListener('change', () => {
        this.changeUnits(this.elements.unitsSelect.value);
      });
      
      // Set initial values
      this.loadSpeedValues();
    },
    
    // Change units between mph and kph
    changeUnits: function(newUnits) {
      if (newUnits === this.units) return;
      
      // Get current speeds in current units
      const currentFastSpeed = parseFloat(this.elements.fastRunSpeed.value);
      const currentSlowSpeed = parseFloat(this.elements.slowRunSpeed.value);
      
      // Convert speeds to new units
      let newFastSpeed, newSlowSpeed;
      
      if (newUnits === 'kph' && this.units === 'mph') {
        // Convert mph to kph (multiply by 1.60934)
        newFastSpeed = (currentFastSpeed * 1.60934).toFixed(1);
        newSlowSpeed = (currentSlowSpeed * 1.60934).toFixed(1);
      } else if (newUnits === 'mph' && this.units === 'kph') {
        // Convert kph to mph (divide by 1.60934)
        newFastSpeed = (currentFastSpeed / 1.60934).toFixed(1);
        newSlowSpeed = (currentSlowSpeed / 1.60934).toFixed(1);
      }
      
      // Update the input values
      this.elements.fastRunSpeed.value = newFastSpeed;
      this.elements.slowRunSpeed.value = newSlowSpeed;
      
      // Update unit labels
      this.units = newUnits;
      this.updateUnitDisplay();
      
      // Save the unit preference
      localStorage.setItem('speedUnits', newUnits);
    },
    
    // Update the unit display in the UI
    updateUnitDisplay: function() {
      this.elements.fastSpeedUnit.textContent = this.units;
      this.elements.slowSpeedUnit.textContent = this.units;
    },
    
    // Load speed values from storage or defaults
    loadSpeedValues: function() {
      // Load saved speed values if they exist
      const savedFastSpeed = localStorage.getItem('fastRunSpeed');
      const savedSlowSpeed = localStorage.getItem('slowRunSpeed');
      
      if (this.units === 'mph') {
        this.elements.fastRunSpeed.value = savedFastSpeed || this.defaults.fastRunSpeedMph;
        this.elements.slowRunSpeed.value = savedSlowSpeed || this.defaults.slowRunSpeedMph;
      } else {
        this.elements.fastRunSpeed.value = savedFastSpeed || this.defaults.fastRunSpeedKph;
        this.elements.slowRunSpeed.value = savedSlowSpeed || this.defaults.slowRunSpeedKph;
      }
    },
    
    // Save current speed values
    saveSpeedValues: function() {
      localStorage.setItem('fastRunSpeed', this.elements.fastRunSpeed.value);
      localStorage.setItem('slowRunSpeed', this.elements.slowRunSpeed.value);
    },
    
    // Get current fast run speed with unit
    getFastRunSpeedWithUnit: function() {
      return `${this.elements.fastRunSpeed.value} ${this.units}`;
    },
    
    // Get current slow run speed with unit
    getSlowRunSpeedWithUnit: function() {
      return `${this.elements.slowRunSpeed.value} ${this.units}`;
    },
    
    // Get speeds as part of workout data
    getSpeedsForStorage: function() {
      return {
        fastRunSpeed: this.elements.fastRunSpeed.value,
        slowRunSpeed: this.elements.slowRunSpeed.value,
        units: this.units
      };
    },
    
    // Set speeds from stored workout data
    setSpeedsFromStorage: function(speedData) {
      if (!speedData) return;
      
      // If units match, just set the values
      if (speedData.units === this.units) {
        this.elements.fastRunSpeed.value = speedData.fastRunSpeed;
        this.elements.slowRunSpeed.value = speedData.slowRunSpeed;
      } else {
        // Units don't match, convert values
        if (speedData.units === 'mph' && this.units === 'kph') {
          // Convert mph to kph
          this.elements.fastRunSpeed.value = (speedData.fastRunSpeed * 1.60934).toFixed(1);
          this.elements.slowRunSpeed.value = (speedData.slowRunSpeed * 1.60934).toFixed(1);
        } else if (speedData.units === 'kph' && this.units === 'mph') {
          // Convert kph to mph
          this.elements.fastRunSpeed.value = (speedData.fastRunSpeed / 1.60934).toFixed(1);
          this.elements.slowRunSpeed.value = (speedData.slowRunSpeed / 1.60934).toFixed(1);
        }
      }
    }
  };