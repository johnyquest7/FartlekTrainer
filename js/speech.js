/**
 * Speech synthesis functionality for voice announcements
 */

const SPEECH = {
  // Speech synthesis
  speechSynthesis: window.speechSynthesis,
  availableVoices: [],
  selectedVoice: null,
  
  // Initialize speech synthesis
  init: function() {
    // If speech synthesis is not supported, just return
    if (!this.speechSynthesis) {
      console.log('Speech synthesis not supported');
      return;
    }
    
    // Set up voice settings event listeners
    APP.elements.voiceEnabledCheckbox.addEventListener('change', function() {
      APP.workout.voiceEnabled = this.checked;
      // Save preference
      localStorage.setItem('voiceEnabled', this.checked);
    });
    
    APP.elements.voiceSelector.addEventListener('change', function() {
      const selectedIndex = this.selectedIndex;
      if (selectedIndex >= 0 && SPEECH.availableVoices.length > 0) {
        SPEECH.selectedVoice = SPEECH.availableVoices[selectedIndex];
        // Save preference
        localStorage.setItem('selectedVoiceIndex', selectedIndex);
      }
    });
    
    APP.elements.voiceVolumeSlider.addEventListener('input', function() {
      APP.workout.voiceVolume = parseFloat(this.value);
      // Save preference
      localStorage.setItem('voiceVolume', this.value);
    });
    
    APP.elements.testVoiceButton.addEventListener('click', function() {
      SPEECH.speak("This is a test of your selected voice for workout announcements.");
    });
    
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
    
    // Get available voices
    this.loadVoices();
  },
  
  // Load available voices
  loadVoices: function() {
    function populateVoiceList() {
      SPEECH.availableVoices = SPEECH.speechSynthesis.getVoices();
      
      // Clear existing options
      while (APP.elements.voiceSelector.firstChild) {
        APP.elements.voiceSelector.removeChild(APP.elements.voiceSelector.firstChild);
      }
      
      // Add voices to selector
      SPEECH.availableVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = index;
        APP.elements.voiceSelector.appendChild(option);
      });
      
      // Set previously selected voice if available
      const savedVoiceIndex = localStorage.getItem('selectedVoiceIndex');
      if (savedVoiceIndex !== null && parseInt(savedVoiceIndex) < SPEECH.availableVoices.length) {
        APP.elements.voiceSelector.selectedIndex = parseInt(savedVoiceIndex);
        SPEECH.selectedVoice = SPEECH.availableVoices[APP.elements.voiceSelector.selectedIndex];
      } else {
        // Default to first English voice
        const englishVoice = SPEECH.availableVoices.findIndex(voice => 
          voice.lang.includes('en-') || voice.lang.includes('en_')
        );
        
        if (englishVoice !== -1) {
          APP.elements.voiceSelector.selectedIndex = englishVoice;
          SPEECH.selectedVoice = SPEECH.availableVoices[englishVoice];
        } else if (SPEECH.availableVoices.length > 0) {
          // Just use the first voice if no English voice is available
          APP.elements.voiceSelector.selectedIndex = 0;
          SPEECH.selectedVoice = SPEECH.availableVoices[0];
        }
      }
    }
    
    // Chrome loads voices asynchronously
    if (this.speechSynthesis.onvoiceschanged !== undefined) {
      this.speechSynthesis.onvoiceschanged = populateVoiceList;
    }
    
    // Initial load attempt (works in Safari/Firefox)
    populateVoiceList();
  },
  
  // Speak text using speech synthesis
  speak: function(text) {
    if (!this.speechSynthesis || !APP.workout.voiceEnabled) return;
    
    // Cancel any ongoing speech
    this.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if one is selected
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    
    // Set volume
    utterance.volume = APP.workout.voiceVolume;
    
    // Speak the text
    this.speechSynthesis.speak(utterance);
  },
  
  // Announce workout phase
  announcePhase: function(phase) {
    if (!APP.workout.voiceEnabled) return;
    
    let announcement = '';
    
    switch(phase) {
      case 'warm-up':
        const warmUpMinutes = Math.floor(APP.workout.warmUp / 60);
        announcement = `Starting warm up for ${warmUpMinutes} ${warmUpMinutes === 1 ? 'minute' : 'minutes'}.`;
        break;
        
      case 'fast-run':
        announcement = `Fast run ${APP.workout.currentRepeat} of ${APP.workout.repeats}`;
        if (APP.workout.fastRun >= 60) {
          const minutes = Math.floor(APP.workout.fastRun / 60);
          const seconds = APP.workout.fastRun % 60;
          if (seconds === 0) {
            announcement += `, for ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
          } else {
            announcement += `, for ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} and ${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
          }
        } else {
          announcement += `, for ${APP.workout.fastRun} ${APP.workout.fastRun === 1 ? 'second' : 'seconds'}`;
        }
        break;
        
      case 'slow-run':
        announcement = `Slow run ${APP.workout.currentRepeat} of ${APP.workout.repeats}`;
        if (APP.workout.slowRun >= 60) {
          const minutes = Math.floor(APP.workout.slowRun / 60);
          const seconds = APP.workout.slowRun % 60;
          if (seconds === 0) {
            announcement += `, for ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
          } else {
            announcement += `, for ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} and ${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
          }
        } else {
          announcement += `, for ${APP.workout.slowRun} ${APP.workout.slowRun === 1 ? 'second' : 'seconds'}`;
        }
        break;
        
      case 'cool-down':
        const coolDownMinutes = Math.floor(APP.workout.coolDown / 60);
        announcement = `Starting cool down for ${coolDownMinutes} ${coolDownMinutes === 1 ? 'minute' : 'minutes'}. Great job with the intervals!`;
        break;
        
      case 'complete':
        announcement = "Workout complete! Great job!";
        break;
        
      case 'paused':
        announcement = "Workout paused";
        break;
        
      case 'resumed':
        announcement = "Resuming workout";
        break;
        
      case 'stopped':
        announcement = "Workout stopped";
        break;
        
      case 'start':
        announcement = "Workout starting. Get ready!";
        break;
    }
    
    if (announcement) {
      this.speak(announcement);
    }
  },
  
  // Announce workout phase with target speed
  announcePhaseWithSpeed: function(phase, speed) {
    if (!APP.workout.voiceEnabled) return;
    
    let baseAnnouncement = '';
    
    switch(phase) {
      case 'fast-run':
        baseAnnouncement = `Fast run ${APP.workout.currentRepeat} of ${APP.workout.repeats}`;
        if (APP.workout.fastRun >= 60) {
          const minutes = Math.floor(APP.workout.fastRun / 60);
          const seconds = APP.workout.fastRun % 60;
          if (seconds === 0) {
            baseAnnouncement += `, for ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
          } else {
            baseAnnouncement += `, for ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} and ${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
          }
        } else {
          baseAnnouncement += `, for ${APP.workout.fastRun} ${APP.workout.fastRun === 1 ? 'second' : 'seconds'}`;
        }
        break;
        
      case 'slow-run':
        baseAnnouncement = `Slow run ${APP.workout.currentRepeat} of ${APP.workout.repeats}`;
        if (APP.workout.slowRun >= 60) {
          const minutes = Math.floor(APP.workout.slowRun / 60);
          const seconds = APP.workout.slowRun % 60;
          if (seconds === 0) {
            baseAnnouncement += `, for ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
          } else {
            baseAnnouncement += `, for ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} and ${seconds} ${seconds === 1 ? 'second' : 'seconds'}`;
          }
        } else {
          baseAnnouncement += `, for ${APP.workout.slowRun} ${APP.workout.slowRun === 1 ? 'second' : 'seconds'}`;
        }
        break;
    }
    
    // Add speed info to the announcement
    if (baseAnnouncement) {
      baseAnnouncement += `. Target speed ${speed}.`;
      this.speak(baseAnnouncement);
    }
  },
  
  // Announce countdown
  announceCountdown: function(secondsLeft, nextPhase) {
    if (!APP.workout.voiceEnabled) return;
    
    let nextPhaseAnnouncement = "";
    
    switch(nextPhase) {
      case 'fast-run':
        nextPhaseAnnouncement = `Get ready for fast run at ${APP.workout.fastRunSpeed}!`;
        break;
      case 'slow-run':
        nextPhaseAnnouncement = `Slow run coming up at ${APP.workout.slowRunSpeed}!`;
        break;
      case 'cool-down':
        nextPhaseAnnouncement = "Cool down coming up!";
        break;
      case 'complete':
        nextPhaseAnnouncement = "Almost finished!";
        break;
    }
    
    this.speak(`${secondsLeft} seconds left. ${nextPhaseAnnouncement}`);
  }
};