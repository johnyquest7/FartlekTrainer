/**
 * Configuration and state management for the Fartlek Trainer app
 */

// Global app state
const APP = {
  // DOM Elements
  elements: {
    setupScreen: document.getElementById('setup-screen'),
    workoutScreen: document.getElementById('workout-screen'),
    summaryScreen: document.getElementById('summary-screen'),
    startWorkoutBtn: document.getElementById('start-workout'),
    pauseWorkoutBtn: document.getElementById('pause-workout'),
    stopWorkoutBtn: document.getElementById('stop-workout'),
    saveWorkoutBtn: document.getElementById('save-workout'),
    returnHomeBtn: document.getElementById('return-home'),
    timerDisplay: document.getElementById('timer-display'),
    currentStageElement: document.getElementById('current-stage'),
    nextUpElement: document.getElementById('next-up'),
    progressBar: document.getElementById('progress-bar'),
    sessionSummary: document.getElementById('session-summary'),
    totalTimeElement: document.getElementById('total-time'),
    summaryTotalTime: document.getElementById('summary-total-time'),
    summaryIntervals: document.getElementById('summary-intervals'),
    savedWorkoutsList: document.getElementById('saved-workouts-list'),
    saveSetupWorkoutBtn: document.getElementById('save-setup-workout'),
    
    // Menu elements
    menuButton: document.getElementById('menu-button'),
    settingsPanel: document.getElementById('settings-panel'),
    closeSettingsBtn: document.getElementById('close-settings'),
    overlay: document.getElementById('overlay'),
    
    // Input elements
    warmUpInput: document.getElementById('warm-up-time'),
    fastRunInput: document.getElementById('fast-run-time'),
    slowRunInput: document.getElementById('slow-run-time'),
    repeatsInput: document.getElementById('repeats'),
    coolDownInput: document.getElementById('cool-down-time'),
    workoutNameInput: document.getElementById('workout-name'),
    
    // Speed input elements
    fastRunSpeed: document.getElementById('fast-run-speed'),
    slowRunSpeed: document.getElementById('slow-run-speed'),
    fastSpeedUnit: document.getElementById('fast-speed-unit'),
    slowSpeedUnit: document.getElementById('slow-speed-unit'),
    unitsSelect: document.getElementById('units-select'),
    
    // Voice settings elements
    voiceEnabledCheckbox: document.getElementById('voice-enabled'),
    voiceSelector: document.getElementById('voice-selector'),
    voiceVolumeSlider: document.getElementById('voice-volume'),
    testVoiceButton: document.getElementById('test-voice'),
    keepScreenOnCheckbox: document.getElementById('keep-screen-on')
  },
  
  // Workout state
  workout: {
    warmUp: 5 * 60, // 5 minutes in seconds
    fastRun: 30,
    slowRun: 60,
    repeats: 5,
    coolDown: 5 * 60,
    currentStage: 'setup',
    currentRepeat: 0,
    timeRemaining: 0,
    totalTime: 0,
    timer: null,
    isPaused: false,
    worker: null,
    // Speed settings
    fastRunSpeed: '6.0 mph',
    slowRunSpeed: '3.0 mph',
    // Voice settings
    voiceEnabled: true,
    voiceVolume: 1.0,
    // Countdown flags to prevent multiple announcements
    countdownAnnounced: false
  },
  
  // Background and visibility state
  background: {
    lastTickTime: 0,
    visibilityState: 'visible'
  },
  
  // Format time for display (MM:SS)
  formatTime: function(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },
  
  // Format time in a way suitable for speaking
  formatTimeForSpeech: function(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    let result = '';
    
    if (minutes > 0) {
      result += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      if (remainingSeconds > 0) {
        result += ` and ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
      }
    } else {
      result += `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
    }
    
    return result;
  },
  
  // Calculate total workout time
  calculateTotalTime: function() {
    const warmUp = parseInt(APP.elements.warmUpInput.value) * 60;
    const fastRun = parseInt(APP.elements.fastRunInput.value);
    const slowRun = parseInt(APP.elements.slowRunInput.value);
    const repeats = parseInt(APP.elements.repeatsInput.value);
    const coolDown = parseInt(APP.elements.coolDownInput.value) * 60;
    
    const totalSeconds = warmUp + (fastRun + slowRun) * repeats + coolDown;
    
    APP.elements.totalTimeElement.textContent = APP.formatTime(totalSeconds);
    
    return totalSeconds;
  },
  
  // Update timer display and progress bar
  updateTimerDisplay: function() {
    APP.elements.timerDisplay.textContent = APP.formatTime(APP.workout.timeRemaining);
    
    // Update progress bar
    let totalElapsedTime = 0;
    
    switch (APP.workout.currentStage) {
      case 'warm-up':
        totalElapsedTime = APP.workout.warmUp - APP.workout.timeRemaining;
        break;
      case 'fast-run':
      case 'slow-run':
        totalElapsedTime = APP.workout.warmUp + 
                          (APP.workout.fastRun + APP.workout.slowRun) * (APP.workout.currentRepeat - 1) +
                          (APP.workout.currentStage === 'fast-run' ? 0 : APP.workout.fastRun) +
                          (APP.workout.fastRun + APP.workout.slowRun - APP.workout.timeRemaining);
        break;
      case 'cool-down':
        totalElapsedTime = APP.workout.totalTime - APP.workout.coolDown + (APP.workout.coolDown - APP.workout.timeRemaining);
        break;
    }
    
    const progressPercentage = (totalElapsedTime / APP.workout.totalTime) * 100;
    APP.elements.progressBar.style.width = `${progressPercentage}%`;
  }
};