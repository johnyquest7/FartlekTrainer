/**
 * Workout phase management for the Fartlek Trainer app
 */

const WORKOUT = {
    // Start the workout
    startWorkout: function() {
      // Close the menu if it's open
      if (MENU.isOpen) {
        MENU.closeMenu();
      }
      
      // Initialize audio context on user gesture if needed
      if (!WAKELOCK.audioContext) {
        WAKELOCK.init();
      }
      
      // Enable wake lock to keep the device awake
      WAKELOCK.enable();
      
      // Reset background timer variables
      APP.background.lastTickTime = 0;
      
      // Get workout values from inputs
      APP.workout.warmUp = parseInt(APP.elements.warmUpInput.value) * 60;
      APP.workout.fastRun = parseInt(APP.elements.fastRunInput.value);
      APP.workout.slowRun = parseInt(APP.elements.slowRunInput.value);
      APP.workout.repeats = parseInt(APP.elements.repeatsInput.value);
      APP.workout.coolDown = parseInt(APP.elements.coolDownInput.value) * 60;
      
      // Get speed values
      APP.workout.fastRunSpeed = SPEED.getFastRunSpeedWithUnit();
      APP.workout.slowRunSpeed = SPEED.getSlowRunSpeedWithUnit();
      
      // Calculate total time
      APP.workout.totalTime = APP.workout.warmUp + 
                           (APP.workout.fastRun + APP.workout.slowRun) * APP.workout.repeats + 
                           APP.workout.coolDown;
      
      // Make sure workout screen is the first element after header
      const header = document.querySelector('header');
      document.body.insertBefore(APP.elements.workoutScreen, header.nextSibling);
      
      // Show workout screen
      APP.elements.setupScreen.classList.remove('active');
      APP.elements.workoutScreen.classList.add('active');
      
      // Enter fullscreen mode
      APP.elements.workoutScreen.classList.add('fullscreen-mode');
      
      // Request fullscreen if supported
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
          console.log('Error attempting to enable fullscreen:', err);
        });
      }
      
      // Hide address bar on mobile if possible
      window.scrollTo(0, 1);
      
      // Announce workout start
      SPEECH.announcePhase('start');
      
      // Start with warm-up after a brief delay
      setTimeout(() => {
        this.startWarmUp();
      }, 2000);
    },
    
    // Start warm-up phase
    startWarmUp: function() {
      if (APP.workout.warmUp <= 0) {
        this.startIntervals();
        return;
      }
      
      APP.workout.currentStage = 'warm-up';
      APP.elements.currentStageElement.textContent = 'Warm-up';
      APP.elements.currentStageElement.className = 'current-stage warm-up';
      
      APP.workout.timeRemaining = APP.workout.warmUp;
      APP.elements.nextUpElement.textContent = `Next: Fast Run (${APP.workout.fastRun}s)`;
      
      // Reset countdown announcement flag
      APP.workout.countdownAnnounced = false;
      
      // Announce warm-up phase
      SPEECH.announcePhase('warm-up');
      
      // Play starting beep
      AUDIO.playPhaseStartSound('warm-up');
      
      // Start timer
      TIMER.startTimer();
    },
    
    // Start interval training
    startIntervals: function() {
      APP.workout.currentRepeat = 1;
      this.startFastRun();
    },
    
    // Start fast run phase
    startFastRun: function() {
      APP.workout.currentStage = 'fast-run';
      APP.elements.currentStageElement.textContent = `Fast Run (${APP.workout.currentRepeat}/${APP.workout.repeats})`;
      APP.elements.currentStageElement.className = 'current-stage fast-run';
      
      // Add speed display if not already there
      this.updateSpeedDisplay(APP.workout.fastRunSpeed);
      
      APP.workout.timeRemaining = APP.workout.fastRun;
      APP.elements.nextUpElement.textContent = `Next: Slow Run (${APP.workout.slowRun}s)`;
      
      // Reset countdown announcement flag
      APP.workout.countdownAnnounced = false;
      
      // Announce fast run phase with speed
      SPEECH.announcePhaseWithSpeed('fast-run', APP.workout.fastRunSpeed);
      
      // Play fast run beeps
      AUDIO.playPhaseStartSound('fast-run');
      
      // Start timer
      TIMER.startTimer();
    },
    
    // Start slow run phase
    startSlowRun: function() {
      APP.workout.currentStage = 'slow-run';
      APP.elements.currentStageElement.textContent = `Slow Run (${APP.workout.currentRepeat}/${APP.workout.repeats})`;
      APP.elements.currentStageElement.className = 'current-stage slow-run';
      
      // Add speed display if not already there
      this.updateSpeedDisplay(APP.workout.slowRunSpeed);
      
      APP.workout.timeRemaining = APP.workout.slowRun;
      
      if (APP.workout.currentRepeat < APP.workout.repeats) {
        APP.elements.nextUpElement.textContent = `Next: Fast Run (${APP.workout.fastRun}s)`;
      } else {
        APP.elements.nextUpElement.textContent = `Next: Cool-down (${Math.floor(APP.workout.coolDown / 60)}m)`;
      }
      
      // Reset countdown announcement flag
      APP.workout.countdownAnnounced = false;
      
      // Announce slow run phase with speed
      SPEECH.announcePhaseWithSpeed('slow-run', APP.workout.slowRunSpeed);
      
      // Play slow run beeps
      AUDIO.playPhaseStartSound('slow-run');
      
      // Start timer
      TIMER.startTimer();
    },
    
    // Start cool-down phase
    startCoolDown: function() {
      APP.workout.currentStage = 'cool-down';
      APP.elements.currentStageElement.textContent = 'Cool-down';
      APP.elements.currentStageElement.className = 'current-stage cool-down';
      
      // Remove speed display if it exists
      this.removeSpeedDisplay();
      
      APP.workout.timeRemaining = APP.workout.coolDown;
      APP.elements.nextUpElement.textContent = 'Almost done!';
      
      // Reset countdown announcement flag
      APP.workout.countdownAnnounced = false;
      
      // Announce cool-down phase
      SPEECH.announcePhase('cool-down');
      
      // Play cool-down beep
      AUDIO.playPhaseStartSound('cool-down');
      
      // Start timer
      TIMER.startTimer();
    },
    
    // Update or add speed display to the workout screen
    updateSpeedDisplay: function(speedText) {
      // Check if speed display element already exists
      let speedDisplay = document.getElementById('speed-display');
      
      if (!speedDisplay) {
        // Create speed display element
        speedDisplay = document.createElement('div');
        speedDisplay.id = 'speed-display';
        speedDisplay.className = 'speed-display';
        
        // Insert it after current stage element
        APP.elements.currentStageElement.parentNode.insertBefore(
          speedDisplay, 
          APP.elements.currentStageElement.nextSibling
        );
      }
      
      // Update the text
      speedDisplay.textContent = `Target speed: ${speedText}`;
    },
    
    // Remove speed display
    removeSpeedDisplay: function() {
      const speedDisplay = document.getElementById('speed-display');
      if (speedDisplay) {
        speedDisplay.remove();
      }
    },
    
    // Complete the workout
    completeWorkout: function() {
      // Clear timer
      clearInterval(APP.workout.timer);
      
      // Remove speed display if it exists
      this.removeSpeedDisplay();
      
      // Play completion sound
      AUDIO.playPhaseStartSound('complete');
      
      // Announce workout completion
      SPEECH.announcePhase('complete');
      
      // Update summary screen
      APP.elements.summaryTotalTime.textContent = APP.elements.totalTimeElement.textContent;
      APP.elements.summaryIntervals.textContent = `${APP.workout.currentRepeat}/${APP.workout.repeats}`;
      
      // Save completed workout
      this.saveCompletedWorkout();
      
      // Show summary screen
      APP.elements.workoutScreen.classList.remove('active');
      APP.elements.summaryScreen.classList.add('active');
      
      // Keep NoSleep enabled until user returns to home
      // but stop the silent audio as it's not needed for the summary screen
      if (WAKELOCK.silentAudio) {
        WAKELOCK.silentAudio.stop();
        WAKELOCK.silentAudio = null;
      }
    },
    
    // Save completed workout for tracking
    saveCompletedWorkout: function() {
      // Ensure we have accurate time values
      const warmUp = APP.workout.warmUp || 0;
      const fastRun = APP.workout.fastRun || 0;
      const slowRun = APP.workout.slowRun || 0;
      const repeats = APP.workout.currentRepeat || 0; // Use actual completed repeats
      const coolDown = APP.workout.coolDown || 0;
      
      // Calculate the total time based on components to ensure accuracy
      const calculatedTotalTime = warmUp + (fastRun + slowRun) * repeats + coolDown;
      
      // Create completed workout object
      const completedWorkout = {
        name: APP.elements.workoutNameInput.value.trim() || 'Fartlek Workout',
        warmUp: warmUp,
        fastRun: fastRun,
        slowRun: slowRun,
        repeats: APP.workout.repeats,
        completedRepeats: repeats,
        coolDown: coolDown,
        totalTime: calculatedTotalTime, // Use calculated value
        speeds: SPEED.getSpeedsForStorage(),
        date: new Date().toISOString(),
        intervals: `${repeats}/${APP.workout.repeats}`
      };
      
      console.log('Saving workout with total time:', calculatedTotalTime);
      
      // Calculate distance based on speed and time
      const distanceResult = TRACKER.calculateWorkoutDistance(completedWorkout);
      completedWorkout.distance = distanceResult.distance;
      completedWorkout.units = distanceResult.units;
      
      // Get existing completed workouts
      let completedWorkouts = JSON.parse(localStorage.getItem('completedWorkouts')) || [];
      
      // Add new workout
      completedWorkouts.push(completedWorkout);
      
      // Save to localStorage
      localStorage.setItem('completedWorkouts', JSON.stringify(completedWorkouts));
    },
    
    // Toggle pause/resume
    togglePause: function() {
      APP.workout.isPaused = !APP.workout.isPaused;
      
      if (APP.workout.isPaused) {
        APP.elements.pauseWorkoutBtn.textContent = 'Resume';
        
        // Pause the Web Worker if active
        if (APP.workout.worker) {
          APP.workout.worker.postMessage({command: 'stop'});
        }
        
        // Announce pause if voice is enabled
        SPEECH.announcePhase('paused');
      } else {
        APP.elements.pauseWorkoutBtn.textContent = 'Pause';
        
        // Play resume beep
        AUDIO.playBeep(660, 0.1);
        
        // Announce resume if voice is enabled
        SPEECH.announcePhase('resumed');
        
        // Restart the Web Worker if necessary
        if (APP.workout.worker) {
          APP.workout.worker.postMessage({command: 'start'});
        }
      }
    },
    
    // Stop the workout
    stopWorkout: function() {
      // Clear timer
      clearInterval(APP.workout.timer);
      
      // Stop web worker if active
      TIMER.stopBackgroundWorker();
      
      // Ask for confirmation
      if (confirm('Are you sure you want to stop the workout?')) {
        // Announce workout stopped if voice is enabled
        SPEECH.announcePhase('stopped');
        
        // Reset to setup screen
        this.returnToHome();
      } else {
        // Resume timer
        TIMER.startTimer();
      }
    },
    
    // Return to home screen
    returnToHome: function() {
      // Hide current screen
      APP.elements.workoutScreen.classList.remove('active');
      APP.elements.workoutScreen.classList.remove('fullscreen-mode');
      APP.elements.summaryScreen.classList.remove('active');
      
      // Exit fullscreen if we're in it
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.log('Error exiting fullscreen:', err);
        });
      }
      
      // Disable wake lock
      WAKELOCK.disable();
      
      // Show setup screen
      APP.elements.setupScreen.classList.add('active');
      
      // Reset workout state
      APP.workout.currentStage = 'setup';
      APP.workout.isPaused = false;
      APP.elements.pauseWorkoutBtn.textContent = 'Pause';
      
      // Update workout history stats directly (in case user checks workout history next)
      try {
        // Get completed workouts
        const completedWorkouts = JSON.parse(localStorage.getItem('completedWorkouts')) || [];
        
        // If there are workouts, calculate total time
        if (completedWorkouts.length > 0) {
          // Calculate total time
          let totalSeconds = 0;
          completedWorkouts.forEach(workout => {
            if (workout && typeof workout.totalTime === 'number') {
              totalSeconds += workout.totalTime;
            }
          });
          
          // Format time for display
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = Math.floor(totalSeconds % 60);
          
          // Create formatted time string
          let timeDisplay = '0:00';
          if (hours > 0) {
            timeDisplay = `${hours}h ${minutes}m`;
          } else if (minutes > 0) {
            timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          } else {
            timeDisplay = `0:${seconds.toString().padStart(2, '0')}`;
          }
          
          // Update total time element directly (it might be hidden but will be correct when viewed)
          const totalTimeElement = document.getElementById('total-time');
          if (totalTimeElement) {
            console.log(`Updating total-time to: ${timeDisplay}`);
            totalTimeElement.textContent = timeDisplay;
          }
        }
      } catch (err) {
        console.error('Error updating workout stats:', err);
      }
    }
  };