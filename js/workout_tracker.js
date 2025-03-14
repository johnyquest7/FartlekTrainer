/**
 * Workout tracking functionality for the Fartlek Trainer app
 * Handles tracking completed workouts and statistics
 */

const TRACKER = {
  // DOM Elements to be populated in init
  elements: {},
  
  // Initialize tracker
  init: function() {
    // Get DOM elements
    this.elements = {
      trackerScreen: document.getElementById('tracker-screen'),
      workoutHistoryList: document.getElementById('workout-history-list'),
      statsContainer: document.getElementById('stats-container'),
      totalWorkouts: document.getElementById('total-workouts'),
      totalTime: document.getElementById('total-time'),
      totalDistance: document.getElementById('total-distance'),
      viewTrackerBtn: document.getElementById('view-tracker-btn'),
      returnFromTrackerBtn: document.getElementById('return-from-tracker')
    };
    
    // Add event listeners
    if (this.elements.viewTrackerBtn) {
      this.elements.viewTrackerBtn.addEventListener('click', this.showTracker.bind(this));
      console.log('View tracker button listener added');
    } else {
      console.error('View tracker button not found');
    }
    
    if (this.elements.returnFromTrackerBtn) {
      this.elements.returnFromTrackerBtn.addEventListener('click', this.hideTracker.bind(this));
    }
    
    // Filter controls
    const filterWeekBtn = document.getElementById('filter-week');
    const filterMonthBtn = document.getElementById('filter-month');
    const filterAllBtn = document.getElementById('filter-all');
    
    if (filterWeekBtn) {
      filterWeekBtn.addEventListener('click', () => this.filterHistory('week'));
    }
    if (filterMonthBtn) {
      filterMonthBtn.addEventListener('click', () => this.filterHistory('month'));
    }
    if (filterAllBtn) {
      filterAllBtn.addEventListener('click', () => this.filterHistory('all'));
    }
    
    // Load tracking data
    this.loadWorkoutHistory();
  },
  
  // Show tracker screen
  showTracker: function() {
    console.log('showTracker function called');
    
    // Hide other screens
    APP.elements.setupScreen.classList.remove('active');
    APP.elements.workoutScreen.classList.remove('active');
    APP.elements.summaryScreen.classList.remove('active');
    
    // Show tracker screen
    if (this.elements.trackerScreen) {
      console.log('Adding active class to tracker screen');
      this.elements.trackerScreen.classList.add('active');
    } else {
      console.error('Tracker screen element not found');
    }
    
    // Reload data in case it was updated
    this.loadWorkoutHistory();
  },
  
  // Hide tracker screen and return to setup
  hideTracker: function() {
    console.log('hideTracker function called');
    
    // Direct DOM manipulation to ensure reliability
    const trackerScreen = document.getElementById('tracker-screen');
    const setupScreen = document.getElementById('setup-screen');
    
    if (trackerScreen && setupScreen) {
      trackerScreen.classList.remove('active');
      setupScreen.classList.add('active');
      console.log('Switched from tracker to setup screen');
    } else {
      console.error('Could not find tracker or setup screen elements');
    }
  },
  
  // Load and display workout history
  loadWorkoutHistory: function(filter = 'all') {
    // Get completed workouts
    const completedWorkouts = JSON.parse(localStorage.getItem('completedWorkouts')) || [];
    
    // Debug output of raw workouts
    console.log('Raw completed workouts:', JSON.stringify(completedWorkouts));
    
    // Ensure all workouts have valid totalTime
    completedWorkouts.forEach(workout => {
      if (!workout.totalTime || typeof workout.totalTime !== 'number') {
        // Calculate from components
        const warmUp = workout.warmUp || 0;
        const fastRun = workout.fastRun || 0;
        const slowRun = workout.slowRun || 0;
        const repeats = workout.completedRepeats || workout.repeats || 0;
        const coolDown = workout.coolDown || 0;
        
        workout.totalTime = warmUp + (fastRun + slowRun) * repeats + coolDown;
        console.log(`Fixed workout totalTime: ${workout.totalTime}`);
      }
    });
    
    // Apply filter
    let filteredWorkouts = completedWorkouts;
    
    if (filter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filteredWorkouts = completedWorkouts.filter(workout => new Date(workout.date) >= oneWeekAgo);
    } else if (filter === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filteredWorkouts = completedWorkouts.filter(workout => new Date(workout.date) >= oneMonthAgo);
    }
    
    // Sort by date (newest first)
    filteredWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Clear history list
    this.elements.workoutHistoryList.innerHTML = '';
    
    // Display filtered workouts
    if (filteredWorkouts.length === 0) {
      this.elements.workoutHistoryList.innerHTML = '<p class="no-workouts">No completed workouts yet.</p>';
    } else {
      filteredWorkouts.forEach(workout => {
        const workoutItem = document.createElement('div');
        workoutItem.className = 'workout-history-item';
        
        // Format date
        const date = new Date(workout.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        });
        
        // Format time
        const formattedTime = date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit'
        });
        
        // Calculate total time for this workout if it's missing
        if (typeof workout.totalTime !== 'number') {
          const warmUp = workout.warmUp || 0;
          const fastRun = workout.fastRun || 0;
          const slowRun = workout.slowRun || 0;
          const repeats = workout.completedRepeats || workout.repeats || 0;
          const coolDown = workout.coolDown || 0;
          
          workout.totalTime = warmUp + (fastRun + slowRun) * repeats + coolDown;
        }
        
        // Format workout duration
        let durationText;
        try {
          durationText = APP.formatTime(workout.totalTime);
        } catch (e) {
          durationText = '0:00';
          console.error('Error formatting time:', e);
        }
        
        // Ensure all workout properties exist with fallbacks
        const distance = typeof workout.distance === 'number' ? workout.distance.toFixed(2) : '0.00';
        const units = workout.units || 'mph';
        const intervals = workout.intervals || '0/0';
        const speeds = workout.speeds || { fastRunSpeed: '0', slowRunSpeed: '0', units: 'mph' };
        
        workoutItem.innerHTML = `
          <div class="workout-date">${formattedDate} at ${formattedTime}</div>
          <div class="workout-details">
            <div class="workout-name">${workout.name || 'Unnamed Workout'}</div>
            <div class="workout-duration">Duration: ${durationText}</div>
            <div class="workout-distance">Distance: ${distance} ${units === 'mph' ? 'mi' : 'km'}</div>
            <div class="workout-intervals">Intervals: ${intervals}</div>
            <div class="workout-speeds">Fast: ${speeds.fastRunSpeed || '0'} ${speeds.units || 'mph'} | Slow: ${speeds.slowRunSpeed || '0'} ${speeds.units || 'mph'}</div>
          </div>
        `;
        
        this.elements.workoutHistoryList.appendChild(workoutItem);
      });
    }
    
    // Update statistics
    this.updateStats(completedWorkouts);
  },
  
  // Filter workout history
  filterHistory: function(filter) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`filter-${filter}`).classList.add('active');
    
    // Load filtered history
    this.loadWorkoutHistory(filter);
  },
  
  // Calculate and update stats
  updateStats: function(workouts) {
    console.log("Updating stats with workouts:", workouts?.length || 0);
    
    // No workouts yet
    if (!workouts || workouts.length === 0) {
      this.elements.totalWorkouts.textContent = '0';
      this.elements.totalTime.textContent = '0:00';
      this.elements.totalDistance.textContent = '0 mi/km';
      return;
    }
    
    // Calculate total workouts
    this.elements.totalWorkouts.textContent = workouts.length;
    
    // Direct calculation approach for total time
    let totalTimeSeconds = 0;
    
    for (let i = 0; i < workouts.length; i++) {
      const workout = workouts[i];
      console.log(`Workout ${i + 1} totalTime:`, workout.totalTime);
      
      // If totalTime exists and is a number
      if (workout.totalTime && typeof workout.totalTime === 'number') {
        totalTimeSeconds += workout.totalTime;
        console.log(`Added ${workout.totalTime} seconds, running total: ${totalTimeSeconds}`);
      } else {
        // Calculate from components
        const warmUp = parseInt(workout.warmUp) || 0;
        const fastRun = parseInt(workout.fastRun) || 0;
        const slowRun = parseInt(workout.slowRun) || 0;
        const repeats = parseInt(workout.completedRepeats || workout.repeats) || 0;
        const coolDown = parseInt(workout.coolDown) || 0;
        
        const calculatedTime = warmUp + (fastRun + slowRun) * repeats + coolDown;
        totalTimeSeconds += calculatedTime;
        
        console.log(`Calculated time for workout ${i + 1}: ${calculatedTime}s`, 
                   `(warmUp:${warmUp}, fastRun:${fastRun}, slowRun:${slowRun}, repeats:${repeats}, coolDown:${coolDown})`);
        
        // Update the workout object
        workout.totalTime = calculatedTime;
      }
    }
    
    console.log("Total time in seconds:", totalTimeSeconds);
    
    // Format the total time with explicit seconds calculation
    const hours = Math.floor(totalTimeSeconds / 3600);
    const minutes = Math.floor((totalTimeSeconds % 3600) / 60);
    const seconds = Math.floor(totalTimeSeconds % 60);
    
    let formattedTotalTime;
    if (hours > 0) {
      formattedTotalTime = `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      formattedTotalTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      formattedTotalTime = `0:${seconds.toString().padStart(2, '0')}`;
    }
    
    console.log(`Formatted total time: ${formattedTotalTime} (${hours}h ${minutes}m ${seconds}s)`);
    
    // Set the text with direct DOM access for maximum reliability
    if (this.elements.totalTime) {
      this.elements.totalTime.textContent = formattedTotalTime;
    } else {
      console.error("Total time element not found");
      // Direct DOM access backup
      const totalTimeElement = document.getElementById('total-time');
      if (totalTimeElement) {
        totalTimeElement.textContent = formattedTotalTime;
      }
    }
    
    // Calculate total distance in miles and kilometers
    let totalMiles = 0;
    let totalKilometers = 0;
    
    workouts.forEach(workout => {
      if (workout.units === 'mph') {
        totalMiles += workout.distance;
        totalKilometers += workout.distance * 1.60934;
      } else {
        totalKilometers += workout.distance;
        totalMiles += workout.distance / 1.60934;
      }
    });
    
    this.elements.totalDistance.textContent = 
      `${totalMiles.toFixed(1)} mi / ${totalKilometers.toFixed(1)} km`;
  },
  
  // Calculate workout distance based on speeds and durations
  calculateWorkoutDistance: function(workout) {
    let distance = 0;
    const units = workout.speeds.units;
    
    // Calculate warm-up distance (assuming average of fast and slow speeds)
    const warmUpHours = (workout.warmUp / 3600);
    const warmUpSpeed = (parseFloat(workout.speeds.fastRunSpeed) + parseFloat(workout.speeds.slowRunSpeed)) / 2;
    const warmUpDistance = warmUpHours * warmUpSpeed;
    
    // Calculate intervals distance
    const fastRunHours = (workout.fastRun / 3600) * workout.completedRepeats;
    const slowRunHours = (workout.slowRun / 3600) * workout.completedRepeats;
    
    const fastRunDistance = fastRunHours * parseFloat(workout.speeds.fastRunSpeed);
    const slowRunDistance = slowRunHours * parseFloat(workout.speeds.slowRunSpeed);
    
    // Calculate cool-down distance (assuming slow speed)
    const coolDownHours = (workout.coolDown / 3600);
    const coolDownDistance = coolDownHours * parseFloat(workout.speeds.slowRunSpeed);
    
    // Sum all distances
    distance = warmUpDistance + fastRunDistance + slowRunDistance + coolDownDistance;
    
    return {
      distance: distance,
      units: units
    };
  }
};