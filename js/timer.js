/**
 * Timer functionality for the Fartlek Trainer app
 */

const TIMER = {
  // Start the timer with high precision and drift correction
  startTimer: function() {
    // Clear any existing timer
    if (APP.workout.timer) {
      clearInterval(APP.workout.timer);
    }
    
    // Update timer display
    APP.updateTimerDisplay();
    
    // Record start time for drift correction
    const startTime = Date.now();
    let expectedTime = startTime;
    let ticks = 0;
    
    // Start a new timer with drift correction
    APP.workout.timer = setInterval(() => {
      // If paused, do nothing
      if (APP.workout.isPaused) return;
      
      // Calculate expected time vs actual time to correct for drift
      ticks++;
      expectedTime = startTime + (ticks * 1000);
      const drift = Date.now() - expectedTime;
      
      // Correct interval if drift exceeds threshold
      if (Math.abs(drift) > 100) {
        console.log(`Time drift detected: ${drift}ms, correcting...`);
        clearInterval(APP.workout.timer);
        this.startTimer(); // Restart timer
        return;
      }
      
      // Decrease time remaining
      APP.workout.timeRemaining--;
      
      // Update timer display
      APP.updateTimerDisplay();
      
      // Announce countdown for last several seconds
      if (APP.workout.voiceEnabled && APP.workout.timeRemaining <= 5 && APP.workout.timeRemaining > 0 && !APP.workout.countdownAnnounced) {
        // Determine what's coming next
        let nextPhase = '';
        
        switch (APP.workout.currentStage) {
          case 'warm-up':
            nextPhase = 'fast-run';
            break;
          case 'fast-run':
            nextPhase = 'slow-run';
            break;
          case 'slow-run':
            if (APP.workout.currentRepeat < APP.workout.repeats) {
              nextPhase = 'fast-run';
            } else {
              nextPhase = 'cool-down';
            }
            break;
          case 'cool-down':
            nextPhase = 'complete';
            break;
        }
        
        SPEECH.announceCountdown(APP.workout.timeRemaining, nextPhase);
        APP.workout.countdownAnnounced = true;
      }
      
      // Play countdown beeps in the last 3 seconds
      if (APP.workout.timeRemaining <= 3 && APP.workout.timeRemaining > 0) {
        AUDIO.playCountdownBeep();
      }
      
      // Check if current phase is complete
      if (APP.workout.timeRemaining <= 0) {
        clearInterval(APP.workout.timer);
        
        // Transition to next phase
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
      }
    }, 1000);
    
    // Use Web Worker for background timing (if supported)
    this.startBackgroundWorker();
  },
  
  // Start a background worker for timer tracking when app is in background
  startBackgroundWorker: function() {
    if (window.Worker) {
      try {
        // Create a web worker for background timing
        const workerBlob = new Blob([`
          let timerId = null;
          
          self.onmessage = function(e) {
            if (e.data.command === 'start') {
              if (timerId) clearInterval(timerId);
              timerId = setInterval(() => {
                self.postMessage({type: 'tick'});
              }, 1000);
            } else if (e.data.command === 'stop') {
              if (timerId) {
                clearInterval(timerId);
                timerId = null;
              }
            }
          };
        `], {type: 'application/javascript'});
        
        const workerUrl = URL.createObjectURL(workerBlob);
        const worker = new Worker(workerUrl);
        
        worker.onmessage = function(e) {
          if (e.data.type === 'tick' && APP.background.visibilityState === 'hidden' && !APP.workout.isPaused) {
            // Process background ticks
            APP.workout.timeRemaining--;
            
            // Check if phase complete while in background
            if (APP.workout.timeRemaining <= 0) {
              // We'll handle the phase transition when visibility changes back
              worker.postMessage({command: 'stop'});
            }
          }
        };
        
        // Start the worker
        worker.postMessage({command: 'start'});
        
        // Store the worker for cleanup
        APP.workout.worker = worker;
        
        // Clean up URL
        URL.revokeObjectURL(workerUrl);
      } catch (err) {
        console.error('Web Worker error:', err);
      }
    }
  },
  
  // Stop the background worker
  stopBackgroundWorker: function() {
    if (APP.workout.worker) {
      APP.workout.worker.postMessage({command: 'stop'});
      APP.workout.worker = null;
    }
  }
};