/**
 * Audio functionality for the Fartlek Trainer app
 * Handles audio feedback like beeps and tones
 */

const AUDIO = {
    // Play a beep sound and vibrate if supported
    playBeep: function(frequency, duration) {
      try {
        // Make the duration longer
        const actualDuration = duration * 2; // Double the duration
        
        const oscillator = WAKELOCK.audioContext.createOscillator();
        const gainNode = WAKELOCK.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(WAKELOCK.audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        gainNode.gain.value = 1;
        
        oscillator.start();
        
        // Fade out to avoid clicks
        gainNode.gain.exponentialRampToValueAtTime(0.001, WAKELOCK.audioContext.currentTime + actualDuration);
        
        // Stop the oscillator after duration
        setTimeout(() => {
          oscillator.stop();
        }, actualDuration * 1000);
        
        // Vibrate if supported
        if ('vibrate' in navigator) {
          navigator.vibrate(actualDuration * 1000);
        }
      } catch (error) {
        console.error('Audio error:', error);
      }
    },
    
    // Play audio cues for different workout phases
    playPhaseStartSound: function(phase) {
      switch(phase) {
        case 'warm-up':
          // Play one medium beep for warm-up
          this.playBeep(440, 0.2);
          break;
        case 'fast-run':
          // Play three high beeps for fast run
          this.playBeep(880, 0.1);
          setTimeout(() => this.playBeep(880, 0.1), 200);
          setTimeout(() => this.playBeep(880, 0.1), 400);
          break;
        case 'slow-run':
          // Play two low beeps for slow run
          this.playBeep(440, 0.1);
          setTimeout(() => this.playBeep(440, 0.1), 200);
          break;
        case 'cool-down':
          // Play one low beep for cool-down
          this.playBeep(440, 0.2);
          break;
        case 'complete':
          // Play completion sound (ascending melody)
          this.playBeep(660, 0.1);
          setTimeout(() => this.playBeep(770, 0.1), 200);
          setTimeout(() => this.playBeep(880, 0.2), 400);
          break;
      }
    },
    
    // Play countdown beep
    playCountdownBeep: function() {
      this.playBeep(660, 0.1);
    }
  };