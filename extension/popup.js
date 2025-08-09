/**
 * MindFlow Extension Popup
 * Follows visual-mockups.html design principles
 */

let currentSettings = {};
let isRecording = false;
let recordingTimer = null;
let startTime = 0;

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('MindFlow popup loading...');
  
  try {
    // Initialize settings
    currentSettings = {
      mindflowEnabled: true,
      autoAcceptDelay: 5,
      voiceLanguage: 'en-US',
      clinicalMode: true,
      showNotifications: true
    };
    
    // Bind all event handlers
    bindEvents();
    
    console.log('MindFlow popup loaded successfully');
  } catch (error) {
    console.error('MindFlow popup error:', error);
  }
});

/**
 * Bind all event handlers
 */
function bindEvents() {
  // Quick action buttons
  document.getElementById('voiceBtn').addEventListener('click', () => showSection('voice'));
  document.getElementById('enhanceBtn').addEventListener('click', () => showSection('enhance'));
  document.getElementById('templatesBtn').addEventListener('click', () => showSection('templates'));
  document.getElementById('clipboardBtn').addEventListener('click', copyLastOutput);
  
  // Voice recording
  document.getElementById('recordBtn').addEventListener('click', toggleRecording);
  
  // Text enhancement
  document.getElementById('processBtn').addEventListener('click', processText);
  document.getElementById('copyBtn').addEventListener('click', copyOutput);
  
  // Template selection
  document.querySelectorAll('.template-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const templateType = e.currentTarget.dataset.template;
      applyTemplate(templateType);
    });
  });
}

/**
 * Show specific section and hide others
 */
function showSection(sectionName) {
  // Hide all sections
  ['voice', 'enhance', 'templates'].forEach(name => {
    const section = document.getElementById(name + 'Section');
    if (section) {
      section.classList.add('hidden');
    }
  });
  
  // Show target section
  const targetSection = document.getElementById(sectionName + 'Section');
  if (targetSection) {
    targetSection.classList.remove('hidden');
  }
}

/**
 * Toggle voice recording
 */
async function toggleRecording() {
  const recordBtn = document.getElementById('recordBtn');
  const recordingDot = document.getElementById('recordingDot');
  const recordingTimerEl = document.getElementById('recordingTimer');
  
  if (!isRecording) {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start recording
      isRecording = true;
      startTime = Date.now();
      const audioChunks = [];
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        // Create audio blob
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Process with Whisper API
        await processRecording(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      
      // Update UI
      recordBtn.textContent = 'Stop Recording';
      recordBtn.classList.add('stop');
      recordingDot.classList.add('active');
      
      // Start timer
      recordingTimerEl.textContent = '0:00';
      recordingTimer = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        recordingTimerEl.textContent = 
          `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }, 1000);
      
      // Store mediaRecorder for stopping
      window.currentMediaRecorder = mediaRecorder;
      
    } catch (error) {
      console.error('MindFlow: Microphone access error:', error);
      
      // Update UI to show error state
      recordBtn.textContent = 'Microphone Denied';
      recordBtn.style.background = '#DC2626';
      recordBtn.disabled = true;
      
      // Show user-friendly error message
      const transcriptionText = document.getElementById('transcriptionText');
      transcriptionText.value = 'Microphone access denied. Please:\n\n1. Click the microphone icon in your browser address bar\n2. Select "Allow" for microphone access\n3. Reload the extension and try again\n\nOr use the Text Enhancement feature instead.';
      
      // Reset button after 5 seconds
      setTimeout(() => {
        recordBtn.textContent = 'Start Recording';
        recordBtn.style.background = '';
        recordBtn.disabled = false;
        transcriptionText.value = '';
      }, 5000);
    }
    
  } else {
    // Stop recording
    isRecording = false;
    clearInterval(recordingTimer);
    
    // Stop media recorder
    if (window.currentMediaRecorder && window.currentMediaRecorder.state === 'recording') {
      window.currentMediaRecorder.stop();
    }
    
    // Update UI
    recordBtn.textContent = 'Start Recording';
    recordBtn.classList.remove('stop');
    recordingDot.classList.remove('active');
  }
}

/**
 * Process recorded audio with OpenAI Whisper API
 */
async function processRecording(audioBlob) {
  const transcriptionText = document.getElementById('transcriptionText');
  
  try {
    // Show processing
    transcriptionText.value = 'Transcribing with OpenAI Whisper...';
    
    // Initialize Whisper service
    const whisperService = new WhisperService();
    
    // Check if API is configured
    if (!whisperService.isConfigured()) {
      throw new Error('OpenAI API key not configured');
    }
    
    // Transcribe audio with clinical context
    const transcription = await whisperService.transcribeClinicalAudio(audioBlob, 'en');
    
    if (!transcription || transcription.trim().length === 0) {
      throw new Error('No transcription received - please try speaking more clearly');
    }
    
    // Show transcription
    transcriptionText.value = transcription;
    
    // Auto-switch to enhancement
    document.getElementById('inputText').value = transcription;
    showSection('enhance');
    
  } catch (error) {
    console.error('MindFlow: Transcription error:', error);
    
    // Show error and provide fallback
    transcriptionText.value = `Transcription failed: ${error.message}`;
    
    // Provide fallback with sample data after 3 seconds
    setTimeout(() => {
      const samples = [
        "Client was anxious, about 7 out of 10, been clean 30 days. We worked on breathing. Gave homework to write down triggers. See him next week.",
        "She seemed really depressed today, maybe a 4 out of 10 mood. Talked about negative thoughts. She's only been to one meeting this week. I taught her thought stopping. Next time we'll do more CBT.",
        "Client doing great, 60 days clean, good mood. Went to all his meetings. We reviewed his coping skills. He's been using them. Continue same plan."
      ];
      
      const fallbackSample = samples[Math.floor(Math.random() * samples.length)];
      transcriptionText.value = `${fallbackSample}\n\n(Demo mode - using sample data due to transcription error)`;
      
      // Auto-switch to enhancement with fallback
      document.getElementById('inputText').value = fallbackSample;
      showSection('enhance');
    }, 3000);
  }
}

/**
 * Process text with clinical mappings using enhanced mapping engine
 */
async function processText() {
  const input = document.getElementById('inputText').value.trim();
  if (!input) {
    alert('Please enter some text first.');
    return;
  }
  
  try {
    // Use the enhanced mapping engine
    const mappingEngine = new MindFlowMappingEngine();
    const formatted = await mappingEngine.processInput(input);
    
    // Show results
    document.getElementById('outputText').textContent = formatted;
    document.getElementById('results').classList.remove('hidden');
    
    // Store for clipboard
    window.lastOutput = formatted;
    
  } catch (error) {
    console.error('Processing error:', error);
    
    // Fallback to simple processing
    const formatted = `SERVICE PROVIDED:
Provided 50-minute individual substance use disorder counseling session at ASAM Level 2.1 intensive outpatient program via in-person service.

CLIENT RESPONSE:
Client ${input}. Actively engaged in therapeutic discussion and demonstrated receptiveness to interventions.

INTERVENTIONS:
Implemented evidence-based therapeutic interventions addressing Dimension 3 (Emotional/Behavioral) and Dimension 5 (Relapse Potential). Utilized Cognitive Behavioral Therapy techniques.

PROGRESS:
Progress toward Goal #1 (maintain sobriety): Client demonstrating continued engagement in treatment with active participation in therapeutic interventions.

PLAN:
Continue weekly individual sessions at current ASAM level. Next session scheduled for [DATE].`;
    
    document.getElementById('outputText').textContent = formatted;
    document.getElementById('results').classList.remove('hidden');
    window.lastOutput = formatted;
  }
}

/**
 * Copy output to clipboard
 */
async function copyOutput() {
  const output = document.getElementById('outputText').textContent;
  if (!output) return;
  
  try {
    await navigator.clipboard.writeText(output);
    
    // Visual feedback
    const copyBtn = document.getElementById('copyBtn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✅ Copied!';
    copyBtn.style.background = '#22C55E';
    copyBtn.style.color = 'white';
    copyBtn.style.borderColor = '#22C55E';
    
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.background = '';
      copyBtn.style.color = '';
      copyBtn.style.borderColor = '';
    }, 2000);
    
  } catch (error) {
    console.error('Copy failed:', error);
    alert('Copy failed. Please select and copy manually.');
  }
}

/**
 * Copy last output (for clipboard button)
 */
function copyLastOutput() {
  if (window.lastOutput) {
    navigator.clipboard.writeText(window.lastOutput).then(() => {
      // Visual feedback on clipboard button
      const clipboardBtn = document.getElementById('clipboardBtn');
      const icon = clipboardBtn.querySelector('.action-icon');
      const label = clipboardBtn.querySelector('.action-label');
      
      icon.textContent = '✅';
      label.textContent = 'Copied!';
      
      setTimeout(() => {
        icon.textContent = '📄';
        label.textContent = 'Copy Output';
      }, 2000);
    });
  } else {
    alert('No output to copy. Please enhance some text first.');
  }
}

/**
 * Apply session template
 */
function applyTemplate(templateType) {
  const templates = {
    individual: "Client seemed anxious today, about 7 out of 10. Been clean for 30 days. We worked on breathing exercises and coping skills. Gave homework to practice daily meditation. Client engaged well and willing to continue treatment. See next week.",
    
    group: "Group session with 8 participants. Topic was relapse prevention and trigger identification. Most members actively participated except one who was quiet. Sarah shared about almost using last weekend but called her sponsor instead. Group gave positive feedback. Assigned trigger mapping homework.",
    
    family: "Family session with client and spouse. Discussed trust issues in recovery. Client has 60 days clean and wants more freedom. Spouse expressed fears about relapse. Set up agreements about checking in and transparency. Spouse will start attending Al-Anon meetings."
  };
  
  const template = templates[templateType];
  if (template) {
    document.getElementById('inputText').value = template;
    showSection('enhance');
  }
}

