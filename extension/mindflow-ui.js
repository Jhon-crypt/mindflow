/**
 * MindFlow UI Controller
 * Manages the 6 UI states: dormant → hover → recording → processing → preview → complete
 */

class MindFlowUI {
  constructor(textarea) {
    this.textarea = textarea;
    this.currentState = 'dormant';
    this.originalText = '';
    this.enhancedText = '';
    this.mappingEngine = new MindFlowMappingEngine();
    this.mediaRecorder = null;
    this.recordingTimer = null;
    this.recordingStartTime = 0;
    this.autoAcceptTimer = null;
    
    this.initializeUI();
    this.bindEvents();
  }

  /**
   * Initialize the UI overlay
   */
  initializeUI() {
    // Make textarea position relative if it isn't already
    const computedStyle = window.getComputedStyle(this.textarea);
    if (computedStyle.position === 'static') {
      this.textarea.style.position = 'relative';
    }

    // Create main overlay container
    this.overlay = document.createElement('div');
    this.overlay.className = 'mindflow-overlay';
    
    // Create dormant indicator
    this.indicator = document.createElement('div');
    this.indicator.className = 'mindflow-indicator';
    this.indicator.setAttribute('title', 'MindFlow - Click to enhance text');
    
    // Create toolbar
    this.toolbar = document.createElement('div');
    this.toolbar.className = 'mindflow-toolbar';
    
    const recordBtn = document.createElement('button');
    recordBtn.className = 'mindflow-btn';
    recordBtn.innerHTML = '🎤';
    recordBtn.setAttribute('title', 'Record voice note');
    recordBtn.onclick = () => this.startRecording();
    
    const enhanceBtn = document.createElement('button');
    enhanceBtn.className = 'mindflow-btn';
    enhanceBtn.innerHTML = '✨';
    enhanceBtn.setAttribute('title', 'Enhance existing text');
    enhanceBtn.onclick = () => this.enhanceText();
    
    this.toolbar.appendChild(recordBtn);
    this.toolbar.appendChild(enhanceBtn);
    
    // Create recording toolbar
    this.recordingToolbar = document.createElement('div');
    this.recordingToolbar.className = 'mindflow-recording-toolbar';
    this.recordingToolbar.style.display = 'none';
    
    this.recordingDot = document.createElement('div');
    this.recordingDot.className = 'mindflow-recording-dot';
    
    this.recordingTimer = document.createElement('span');
    this.recordingTimer.className = 'mindflow-recording-timer';
    this.recordingTimer.textContent = '0:00';
    
    const stopBtn = document.createElement('button');
    stopBtn.className = 'mindflow-btn';
    stopBtn.innerHTML = '⏹';
    stopBtn.setAttribute('title', 'Stop recording');
    stopBtn.onclick = () => this.stopRecording();
    
    this.recordingToolbar.appendChild(this.recordingDot);
    this.recordingToolbar.appendChild(this.recordingTimer);
    this.recordingToolbar.appendChild(stopBtn);
    
    // Create progress bar
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'mindflow-progress';
    this.progressBar.style.display = 'none';
    
    // Add all elements to overlay
    this.overlay.appendChild(this.indicator);
    this.overlay.appendChild(this.toolbar);
    this.overlay.appendChild(this.recordingToolbar);
    this.overlay.appendChild(this.progressBar);
    
    // Position overlay relative to textarea
    this.positionOverlay();
    
    // Insert overlay after textarea
    this.textarea.parentNode.insertBefore(this.overlay, this.textarea.nextSibling);
    
    console.log('MindFlow UI initialized for textarea');
  }

  /**
   * Position overlay elements relative to textarea
   */
  positionOverlay() {
    const rect = this.textarea.getBoundingClientRect();
    const parentRect = this.textarea.parentNode.getBoundingClientRect();
    
    this.overlay.style.left = (rect.left - parentRect.left) + 'px';
    this.overlay.style.top = (rect.top - parentRect.top) + 'px';
    this.overlay.style.width = rect.width + 'px';
    this.overlay.style.height = rect.height + 'px';
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Hover events for showing/hiding toolbar
    this.indicator.addEventListener('mouseenter', () => {
      if (this.currentState === 'dormant') {
        this.setState('hover');
      }
    });
    
    this.overlay.addEventListener('mouseleave', () => {
      if (this.currentState === 'hover') {
        this.setState('dormant');
      }
    });
    
    // Textarea events
    this.textarea.addEventListener('input', () => {
      if (this.currentState === 'complete') {
        this.setState('dormant');
      }
    });
    
    // Window resize handler
    window.addEventListener('resize', () => this.positionOverlay());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target === this.textarea) {
        // Ctrl/Cmd + M to enhance
        if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
          e.preventDefault();
          this.enhanceText();
        }
        // Ctrl/Cmd + Shift + M to record
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
          e.preventDefault();
          this.startRecording();
        }
      }
    });
  }

  /**
   * Set UI state
   */
  setState(newState) {
    console.log(`MindFlow: State change ${this.currentState} → ${newState}`);
    this.currentState = newState;
    
    // Hide all elements first
    this.indicator.style.display = 'none';
    this.toolbar.classList.remove('show');
    this.recordingToolbar.style.display = 'none';
    this.progressBar.style.display = 'none';
    this.textarea.classList.remove('mindflow-recording-border', 'mindflow-processing');
    
    // Clear any existing overlays
    this.clearSplitPreview();
    this.clearMessages();
    
    switch (newState) {
      case 'dormant':
        this.indicator.style.display = 'block';
        break;
        
      case 'hover':
        this.indicator.style.display = 'block';
        this.toolbar.classList.add('show');
        break;
        
      case 'recording':
        this.recordingToolbar.style.display = 'flex';
        this.textarea.classList.add('mindflow-recording-border');
        this.startRecordingTimer();
        break;
        
      case 'processing':
        this.progressBar.style.display = 'block';
        this.textarea.classList.add('mindflow-processing');
        this.animateProgress();
        break;
        
      case 'preview':
        this.showSplitPreview();
        break;
        
      case 'complete':
        this.showUndoOption();
        this.showSuccessCheckmark();
        break;
    }
  }

  /**
   * Start voice recording
   */
  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };
      
      this.mediaRecorder.onstop = () => {
        this.processRecording();
      };
      
      this.mediaRecorder.start();
      this.setState('recording');
      
    } catch (error) {
      console.error('Recording error:', error);
      this.showError('Microphone access denied. Please enable microphone permissions.');
    }
  }

  /**
   * Stop voice recording
   */
  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    this.clearRecordingTimer();
  }

  /**
   * Start recording timer
   */
  startRecordingTimer() {
    this.recordingStartTime = Date.now();
    this.recordingTimerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      this.recordingTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
  }

  /**
   * Clear recording timer
   */
  clearRecordingTimer() {
    if (this.recordingTimerInterval) {
      clearInterval(this.recordingTimerInterval);
      this.recordingTimerInterval = null;
    }
  }

  /**
   * Process recorded audio
   */
  async processRecording() {
    this.setState('processing');
    
    try {
      // Create audio blob
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
      
      // For demo purposes, we'll simulate transcription
      // In production, this would call a speech-to-text API
      const transcribedText = await this.simulateTranscription(audioBlob);
      
      // Process the transcribed text
      await this.processTranscribedText(transcribedText);
      
    } catch (error) {
      console.error('Processing error:', error);
      this.showError('Failed to process recording. Please try again.');
      this.setState('dormant');
    }
  }

  /**
   * Simulate transcription (replace with actual API call)
   */
  async simulateTranscription(audioBlob) {
    try {
      // Try to use real Whisper API if available
      if (typeof WhisperService !== 'undefined') {
        const whisperService = new WhisperService();
        
        if (whisperService.isConfigured()) {
          console.log('MindFlow: Using OpenAI Whisper API for transcription');
          const transcription = await whisperService.transcribeClinicalAudio(audioBlob, 'en');
          
          if (transcription && transcription.trim().length > 0) {
            return transcription;
          }
        }
      }
      
      // Fallback to demo samples if API not available or fails
      throw new Error('Whisper API not available or failed');
      
    } catch (error) {
      console.log('MindFlow: Using demo transcription due to:', error.message);
      
      // Simulate API delay for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return sample transcription for demo - matches the test cases
      const samples = [
        "Client seemed anxious today, about 7 out of 10. Been clean for 30 days. We worked on breathing exercises. Gave homework to write down triggers. See him next week.",
        "She seemed really depressed today, mood was like a 4. She's been sober for 30 days which is great. We talked about her job loss and how it's affecting her self-worth. Did some cognitive restructuring around her negative thoughts.",
        "Client doing great, 60 days clean, good mood. Went to all his meetings. We reviewed his coping skills. He's been using them. Continue same plan.",
        "Client relapsed, used yesterday. Very upset about it. We talked about what happened and made a safety plan. Needs to call sponsor daily. See tomorrow.",
        "Had family session with Tom and his wife Mary. She's frustrated about trust issues. Tom has 60 days clean and wants more freedom. We talked about rebuilding trust slowly."
      ];
      
      const sample = samples[Math.floor(Math.random() * samples.length)];
      return `${sample}\n\n(Demo mode - using sample data)`;
    }
  }

  /**
   * Process transcribed text or existing textarea content
   */
  async processTranscribedText(text) {
    try {
      this.setState('processing');
      
      let enhancedText;
      
      // Try OpenAI completion service first for best results
      try {
        if (typeof OpenAICompletionService !== 'undefined') {
          const completionService = new OpenAICompletionService();
          
          if (completionService.isConfigured()) {
            console.log('MindFlow: Using OpenAI completion for professional enhancement');
            enhancedText = await completionService.processWithValidation(text);
          } else {
            throw new Error('OpenAI service not configured');
          }
        } else {
          throw new Error('OpenAI service not available');
        }
      } catch (completionError) {
        console.log('MindFlow: OpenAI completion failed, falling back to mapping engine:', completionError.message);
        
        // Fallback to mapping engine
        const result = await this.mappingEngine.processInput(text);
        enhancedText = result.formattedNote || result;
      }
      
      // Store results
      this.originalText = text;
      this.enhancedText = enhancedText;
      
      this.setState('preview');
      
    } catch (error) {
      console.error('MindFlow: Text processing error:', error);
      this.showError('Failed to enhance text. Please try manual input.');
      this.setState('dormant');
    }
  }

  /**
   * Enhance existing text in textarea
   */
  async enhanceText() {
    const currentText = this.textarea.value.trim();
    
    if (!currentText) {
      this.showError('Please enter some text first.');
      return;
    }
    
    this.setState('processing');
    await this.processTranscribedText(currentText);
  }

  /**
   * Animate progress bar
   */
  animateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      this.progressBar.style.width = progress + '%';
    }, 200);
  }

  /**
   * Show split preview with original and enhanced text
   */
  showSplitPreview() {
    // Create split preview container
    const splitPreview = document.createElement('div');
    splitPreview.className = 'mindflow-split-preview';
    
    const originalDiv = document.createElement('div');
    originalDiv.className = 'mindflow-split-original';
    originalDiv.textContent = this.originalText;
    
    const divider = document.createElement('div');
    divider.className = 'mindflow-split-divider';
    
    const enhancedDiv = document.createElement('div');
    enhancedDiv.className = 'mindflow-split-enhanced';
    enhancedDiv.innerHTML = this.highlightDifferences(this.originalText, this.enhancedText);
    
    const acceptBtn = document.createElement('button');
    acceptBtn.className = 'mindflow-accept-btn';
    acceptBtn.textContent = 'Accept';
    acceptBtn.onclick = () => this.acceptChanges();
    
    const rejectBtn = document.createElement('button');
    rejectBtn.className = 'mindflow-reject-btn';
    rejectBtn.textContent = 'Reject';
    rejectBtn.onclick = () => this.rejectChanges();
    
    const countdown = document.createElement('div');
    countdown.className = 'mindflow-countdown';
    
    splitPreview.appendChild(originalDiv);
    splitPreview.appendChild(divider);
    splitPreview.appendChild(enhancedDiv);
    splitPreview.appendChild(acceptBtn);
    splitPreview.appendChild(rejectBtn);
    splitPreview.appendChild(countdown);
    
    this.overlay.appendChild(splitPreview);
    this.splitPreview = splitPreview;
    
    // Start auto-accept countdown
    this.startAutoAcceptCountdown();
  }

  /**
   * Highlight differences between original and enhanced text
   */
  highlightDifferences(original, enhanced) {
    // Simple highlighting - in production, use a proper diff algorithm
    const words = enhanced.split(' ');
    return words.map(word => {
      if (!original.toLowerCase().includes(word.toLowerCase()) && word.length > 3) {
        return `<span class="mindflow-highlight-diff">${word}</span>`;
      }
      return word;
    }).join(' ');
  }

  /**
   * Start auto-accept countdown
   */
  startAutoAcceptCountdown() {
    let countdown = 5;
    const countdownElement = this.splitPreview.querySelector('.mindflow-countdown');
    
    const updateCountdown = () => {
      countdownElement.textContent = `Auto-accepting in ${countdown}...`;
      countdown--;
      
      if (countdown < 0) {
        this.acceptChanges();
      }
    };
    
    updateCountdown();
    this.autoAcceptTimer = setInterval(updateCountdown, 1000);
  }

  /**
   * Accept enhanced text changes
   */
  acceptChanges() {
    if (this.autoAcceptTimer) {
      clearInterval(this.autoAcceptTimer);
      this.autoAcceptTimer = null;
    }
    
    this.textarea.value = this.enhancedText;
    this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    this.setState('complete');
  }

  /**
   * Reject enhanced text changes
   */
  rejectChanges() {
    if (this.autoAcceptTimer) {
      clearInterval(this.autoAcceptTimer);
      this.autoAcceptTimer = null;
    }
    
    this.setState('dormant');
  }

  /**
   * Show undo option after completion
   */
  showUndoOption() {
    const undoBtn = document.createElement('div');
    undoBtn.className = 'mindflow-undo';
    undoBtn.innerHTML = '↩ undo';
    undoBtn.onclick = () => this.undoChanges();
    
    this.overlay.appendChild(undoBtn);
    this.undoBtn = undoBtn;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (this.undoBtn) {
        this.undoBtn.classList.add('fade-out');
        setTimeout(() => {
          if (this.undoBtn && this.undoBtn.parentNode) {
            this.undoBtn.parentNode.removeChild(this.undoBtn);
            this.undoBtn = null;
          }
        }, 300);
      }
    }, 5000);
  }

  /**
   * Show success checkmark
   */
  showSuccessCheckmark() {
    const checkmark = document.createElement('div');
    checkmark.className = 'mindflow-success-checkmark';
    checkmark.innerHTML = '✓';
    
    this.overlay.appendChild(checkmark);
    
    // Remove after animation
    setTimeout(() => {
      if (checkmark.parentNode) {
        checkmark.parentNode.removeChild(checkmark);
      }
    }, 1000);
  }

  /**
   * Undo changes
   */
  undoChanges() {
    this.textarea.value = this.originalText;
    this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    if (this.undoBtn && this.undoBtn.parentNode) {
      this.undoBtn.parentNode.removeChild(this.undoBtn);
      this.undoBtn = null;
    }
    
    this.setState('dormant');
  }

  /**
   * Clear split preview
   */
  clearSplitPreview() {
    if (this.splitPreview && this.splitPreview.parentNode) {
      this.splitPreview.parentNode.removeChild(this.splitPreview);
      this.splitPreview = null;
    }
    
    if (this.autoAcceptTimer) {
      clearInterval(this.autoAcceptTimer);
      this.autoAcceptTimer = null;
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    this.clearMessages();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'mindflow-error';
    errorDiv.textContent = message;
    
    this.overlay.appendChild(errorDiv);
    
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 3000);
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    this.clearMessages();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'mindflow-success';
    successDiv.textContent = message;
    
    this.overlay.appendChild(successDiv);
    
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 3000);
  }

  /**
   * Clear all messages
   */
  clearMessages() {
    const messages = this.overlay.querySelectorAll('.mindflow-error, .mindflow-success');
    messages.forEach(msg => {
      if (msg.parentNode) {
        msg.parentNode.removeChild(msg);
      }
    });
  }

  /**
   * Cleanup and remove UI
   */
  destroy() {
    this.clearRecordingTimer();
    if (this.autoAcceptTimer) {
      clearInterval(this.autoAcceptTimer);
    }
    
    if (this.mediaRecorder) {
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
  }
}

// Export for use in content script
if (typeof window !== 'undefined') {
  window.MindFlowUI = MindFlowUI;
}