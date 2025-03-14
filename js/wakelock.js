/**
 * Wake lock and background processing features
 * Keeps the device awake and the app running in the background
 */

// Objects for wake lock functionality
const WAKELOCK = {
    // NoSleep.js instance
    noSleep: null,
    
    // Web Audio context for keeping the app active
    audioContext: null,
    silentAudio: null,
    
    // Initialize wake lock capabilities
    init: function() {
      // Initialize NoSleep
      this.noSleep = new NoSleep();
      
      // Set up visibility change detection
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    },
    
    // Enable all wake lock mechanisms
    enable: function() {
      // Check if keep screen on setting is enabled
      if (!MENU.isKeepScreenOnEnabled()) {
        console.log('Keep screen on is disabled in settings');
        return;
      }
      
      // Initialize audio context on user gesture if not already done
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Enable NoSleep to prevent screen from turning off
      this.noSleep.enable().then(() => {
        console.log('NoSleep enabled');
      }).catch(err => {
        console.error('NoSleep error:', err);
      });
      
      // Start silent audio to keep iOS Safari active
      this.silentAudio = this.createSilentAudio();
      
      // Keep screen awake using wake lock if available
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').then(wakeLock => {
          console.log('Wake Lock activated');
          
          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
              // Re-request wake lock when app becomes visible again
              navigator.wakeLock.request('screen');
            }
          });
        }).catch(err => {
          console.error('Wake Lock error:', err);
        });
      }
    },
    
    // Disable all wake lock mechanisms
    disable: function() {
      // Disable NoSleep
      this.noSleep.disable();
      console.log('NoSleep disabled');
      
      // Stop silent audio loop
      if (this.silentAudio) {
        this.silentAudio.stop();
        this.silentAudio = null;
      }
    },
    
    // Create and play silent audio to keep the app active
    createSilentAudio: function() {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Create silent audio buffer (1s)
      const buffer = this.audioContext.createBuffer(1, 44100, 44100);
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(this.audioContext.destination);
      source.start();
      
      return source;
    },
    
    // Handle visibility changes (app going to background/foreground)
    handleVisibilityChange: function() {
      APP.background.visibilityState = document.visibilityState;
      
      if (APP.background.visibilityState === 'hidden') {
        // App going to background
        if (APP.workout.currentStage !== 'setup') {
          APP.background.lastTickTime = Date.now();
          console.log('App went to background at:', APP.background.lastTickTime);
        }
      } else if (APP.background.visibilityState === 'visible') {
        // App coming back to foreground
        if (APP.workout.currentStage !== 'setup' && APP.background.lastTickTime > 0) {
          // Calculate how much time passed while in background
          const now = Date.now();
          const timePassed = Math.floor((now - APP.background.lastTickTime) / 1000);
          console.log('App returned to foreground. Seconds passed:', timePassed);
          
          if (timePassed > 1 && !APP.workout.isPaused) {
            // Update timer accordingly
            APP.workout.timeRemaining = Math.max(0, APP.workout.timeRemaining - timePassed);
            APP.updateTimerDisplay();
            
            // If the current stage completed while in background
            if (APP.workout.timeRemaining <= 0) {
              // Handle stage completion
              clearInterval(APP.workout.timer);
              
              // Transition to next phase based on current stage
              switch (APP.workout.currentStage) {
                case 'warm-up':
                  WORKOUT.startIntervals();
                  break;
                case 'fast-run':
                  WORKOUT.startSlowRun();
                  break;
                case 'slow-run':
                  APP.workout.currentRepeat++;
                  if (APP.workout.currentRepeat <= APP.workout.repeats) {
                    WORKOUT.startFastRun();
                  } else {
                    WORKOUT.startCoolDown();
                  }
                  break;
                case 'cool-down':
                  WORKOUT.completeWorkout();
                  break;
              }
            } else {
              // Timer hasn't completed, just restart with new time
              TIMER.startTimer();
            }
          }
        }
      }
    }
  };