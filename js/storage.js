/**
 * Storage functionality for the Fartlek Trainer app
 * Handles saving and loading workouts
 */

const STORAGE = {
  // Save the workout from summary screen
  saveWorkout: function() {
    const workoutName = APP.elements.workoutNameInput.value.trim() || 'My Fartlek Workout';
    
    const savedWorkout = {
      name: workoutName,
      warmUp: parseInt(APP.elements.warmUpInput.value),
      fastRun: parseInt(APP.elements.fastRunInput.value),
      slowRun: parseInt(APP.elements.slowRunInput.value),
      repeats: parseInt(APP.elements.repeatsInput.value),
      coolDown: parseInt(APP.elements.coolDownInput.value),
      // Save speed settings
      speeds: SPEED.getSpeedsForStorage(),
      date: new Date().toISOString()
    };
    
    // Get existing workouts
    let savedWorkouts = JSON.parse(localStorage.getItem('fartlekWorkouts')) || [];
    
    // Add new workout
    savedWorkouts.push(savedWorkout);
    
    // Save to localStorage
    localStorage.setItem('fartlekWorkouts', JSON.stringify(savedWorkouts));
    
    // Update saved workouts list
    this.loadSavedWorkouts();
    
    // Return to home
    WORKOUT.returnToHome();
  },
  
  // Save workout from setup screen
  saveSetupWorkout: function() {
    // Prompt for workout name
    const workoutName = prompt('Enter a name for this workout:', 'My Fartlek Workout') || 'My Fartlek Workout';
    
    if (workoutName) {
      const savedWorkout = {
        name: workoutName,
        warmUp: parseInt(APP.elements.warmUpInput.value),
        fastRun: parseInt(APP.elements.fastRunInput.value),
        slowRun: parseInt(APP.elements.slowRunInput.value),
        repeats: parseInt(APP.elements.repeatsInput.value),
        coolDown: parseInt(APP.elements.coolDownInput.value),
        // Save speed settings
        speeds: SPEED.getSpeedsForStorage(),
        date: new Date().toISOString()
      };
      
      // Get existing workouts
      let savedWorkouts = JSON.parse(localStorage.getItem('fartlekWorkouts')) || [];
      
      // Add new workout
      savedWorkouts.push(savedWorkout);
      
      // Save to localStorage
      localStorage.setItem('fartlekWorkouts', JSON.stringify(savedWorkouts));
      
      // Also save speed settings separately
      SPEED.saveSpeedValues();
      
      // Update saved workouts list
      this.loadSavedWorkouts();
      
      // Show confirmation
      alert('Workout saved!');
    }
  },
  
  // Load saved workouts
  loadSavedWorkouts: function() {
    const savedWorkouts = JSON.parse(localStorage.getItem('fartlekWorkouts')) || [];
    
    APP.elements.savedWorkoutsList.innerHTML = '';
    
    if (savedWorkouts.length === 0) {
      APP.elements.savedWorkoutsList.innerHTML = '<p>No saved workouts yet</p>';
      return;
    }
    
    savedWorkouts.forEach((workout, index) => {
      const workoutItem = document.createElement('div');
      workoutItem.className = 'saved-workout-item';
      
      const totalSeconds = (workout.warmUp * 60) + 
                          ((workout.fastRun + workout.slowRun) * workout.repeats) + 
                          (workout.coolDown * 60);
      
      // Prepare speed display
      let speedInfo = '';
      if (workout.speeds) {
        speedInfo = `<br>Fast: ${workout.speeds.fastRunSpeed} ${workout.speeds.units} | Slow: ${workout.speeds.slowRunSpeed} ${workout.speeds.units}`;
      }
      
      workoutItem.innerHTML = `
        <div class="workout-info">
          <strong>${workout.name}</strong><br>
          Warm-up: ${workout.warmUp}m | Fast: ${workout.fastRun}s | Slow: ${workout.slowRun}s<br>
          Repeats: ${workout.repeats} | Cool-down: ${workout.coolDown}m | Total: ${APP.formatTime(totalSeconds)}
          ${speedInfo}
        </div>
        <div class="workout-actions">
          <button class="load-workout">Load</button>
          <button class="delete-workout">Delete</button>
        </div>
      `;
      
      // Load workout button
      workoutItem.querySelector('.load-workout').addEventListener('click', () => {
        APP.elements.warmUpInput.value = workout.warmUp;
        APP.elements.fastRunInput.value = workout.fastRun;
        APP.elements.slowRunInput.value = workout.slowRun;
        APP.elements.repeatsInput.value = workout.repeats;
        APP.elements.coolDownInput.value = workout.coolDown;
        
        // Load speed settings if they exist
        if (workout.speeds) {
          SPEED.setSpeedsFromStorage(workout.speeds);
        }
        
        APP.calculateTotalTime();
      });
      
      // Delete workout button
      workoutItem.querySelector('.delete-workout').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this workout?')) {
          savedWorkouts.splice(index, 1);
          localStorage.setItem('fartlekWorkouts', JSON.stringify(savedWorkouts));
          this.loadSavedWorkouts();
        }
      });
      
      APP.elements.savedWorkoutsList.appendChild(workoutItem);
    });
  },
  
  // Load user preferences from local storage
  loadPreferences: function() {
    // Load voice preferences
    const savedVoiceEnabled = localStorage.getItem('voiceEnabled');
    if (savedVoiceEnabled !== null) {
      APP.elements.voiceEnabledCheckbox.checked = savedVoiceEnabled === 'true';
      APP.workout.voiceEnabled = APP.elements.voiceEnabledCheckbox.checked;
    }
    
    const savedVoiceVolume = localStorage.getItem('voiceVolume');
    if (savedVoiceVolume !== null) {
      APP.elements.voiceVolumeSlider.value = savedVoiceVolume;
      APP.workout.voiceVolume = parseFloat(savedVoiceVolume);
    }
    
    // Load speed units preference
    const savedSpeedUnits = localStorage.getItem('speedUnits');
    if (savedSpeedUnits && APP.elements.unitsSelect) {
      APP.elements.unitsSelect.value = savedSpeedUnits;
    }
    
    // Load screen on preference
    const savedKeepScreenOn = localStorage.getItem('keepScreenOn');
    if (savedKeepScreenOn !== null && APP.elements.keepScreenOnCheckbox) {
      APP.elements.keepScreenOnCheckbox.checked = savedKeepScreenOn === 'true';
    }
  },
  
  // Save all settings 
  saveSettings: function() {
    // Voice settings
    localStorage.setItem('voiceEnabled', APP.elements.voiceEnabledCheckbox.checked);
    localStorage.setItem('voiceVolume', APP.elements.voiceVolumeSlider.value);
    
    // Screen settings
    if (APP.elements.keepScreenOnCheckbox) {
      localStorage.setItem('keepScreenOn', APP.elements.keepScreenOnCheckbox.checked);
    }
    
    // Speed units
    if (APP.elements.unitsSelect) {
      localStorage.setItem('speedUnits', APP.elements.unitsSelect.value);
    }
    
    // Save speed values
    SPEED.saveSpeedValues();
    
    // Get selected voice if any
    if (SPEECH.selectedVoice) {
      const voiceIndex = SPEECH.availableVoices.indexOf(SPEECH.selectedVoice);
      if (voiceIndex !== -1) {
        localStorage.setItem('selectedVoiceIndex', voiceIndex);
      }
    }
  }
};