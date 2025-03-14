/**
 * Main application initialization and event binding for the Fartlek Trainer app
 */

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initApp();
});

// Initialize the app
function initApp() {
  // Set up initial calculations
  APP.calculateTotalTime();
  
  // Initialize speed functionality
  SPEED.init();
  
  // Load saved workouts
  STORAGE.loadSavedWorkouts();
  
  // Initialize speech synthesis
  SPEECH.init();
  
  // Initialize wake lock capabilities
  WAKELOCK.init();
  
  // Initialize menu
  MENU.init();
  
  // Load user preferences
  STORAGE.loadPreferences();
  
  // Set up input change event listeners
  APP.elements.warmUpInput.addEventListener('input', APP.calculateTotalTime);
  APP.elements.fastRunInput.addEventListener('input', APP.calculateTotalTime);
  APP.elements.slowRunInput.addEventListener('input', APP.calculateTotalTime);
  APP.elements.repeatsInput.addEventListener('input', APP.calculateTotalTime);
  APP.elements.coolDownInput.addEventListener('input', APP.calculateTotalTime);
  
  // Speed input event listeners to save values
  APP.elements.fastRunSpeed.addEventListener('change', SPEED.saveSpeedValues.bind(SPEED));
  APP.elements.slowRunSpeed.addEventListener('change', SPEED.saveSpeedValues.bind(SPEED));
  
  // Set up button event listeners
  APP.elements.startWorkoutBtn.addEventListener('click', WORKOUT.startWorkout.bind(WORKOUT));
  APP.elements.pauseWorkoutBtn.addEventListener('click', WORKOUT.togglePause.bind(WORKOUT));
  APP.elements.stopWorkoutBtn.addEventListener('click', WORKOUT.stopWorkout.bind(WORKOUT));
  APP.elements.saveWorkoutBtn.addEventListener('click', STORAGE.saveWorkout.bind(STORAGE));
  APP.elements.returnHomeBtn.addEventListener('click', WORKOUT.returnToHome.bind(WORKOUT));
  APP.elements.saveSetupWorkoutBtn.addEventListener('click', STORAGE.saveSetupWorkout.bind(STORAGE));
  
  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service worker registered', reg))
      .catch(err => console.log('Service worker registration failed:', err));
  }
  
  // If app was added to home screen, suggest opening it from there
  if (window.navigator.standalone) {
    console.log("App is running in standalone mode");
  } else if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log("App is running in standalone mode");
  } else if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    const lastPrompt = localStorage.getItem('homeScreenPromptTime');
    const now = new Date().getTime();
    
    // Show prompt once per day
    if (!lastPrompt || (now - lastPrompt > 24 * 60 * 60 * 1000)) {
      setTimeout(() => {
        if (confirm("For best experience with timers, add this app to your home screen and open it from there.")) {
          alert("To add to home screen: tap the share icon, then 'Add to Home Screen'");
        }
        localStorage.setItem('homeScreenPromptTime', now);
      }, 3000);
    }
  }
}