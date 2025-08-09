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
  const recordingTimer = document.getElementById('recordingTimer');
  
  if (!isRecording) {
    // Start recording
    isRecording = true;
    startTime = Date.now();
    
    recordBtn.textContent = 'Stop Recording';
    recordBtn.classList.add('stop');
    recordingDot.classList.add('active');
    
    // Start timer
    recordingTimer.textContent = '0:00';
    recordingTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      document.getElementById('recordingTimer').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
    
    // Simulate recording for 3 seconds
    setTimeout(() => {
      if (isRecording) {
        toggleRecording();
      }
    }, 3000);
    
  } else {
    // Stop recording
    isRecording = false;
    clearInterval(recordingTimer);
    
    recordBtn.textContent = 'Start Recording';
    recordBtn.classList.remove('stop');
    recordingDot.classList.remove('active');
    
    // Simulate transcription
    await simulateTranscription();
  }
}

/**
 * Simulate speech-to-text transcription
 */
async function simulateTranscription() {
  const transcriptionText = document.getElementById('transcriptionText');
  
  // Show processing
  transcriptionText.value = 'Processing audio...';
  
  // Wait 2 seconds to simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Sample transcriptions from test cases
  const samples = [
    "Client seemed anxious today, about 7 out of 10. Been clean for 30 days. We worked on breathing exercises. Gave homework to write down triggers. See him next week.",
    "She seemed really depressed today, mood was like a 4. She's been sober for 30 days which is great. We talked about her job loss and how it's affecting her self-worth. Did some cognitive restructuring around her negative thoughts.",
    "Client doing great, 60 days clean, good mood. Went to all his meetings. We reviewed his coping skills. He's been using them. Continue same plan.",
    "Client relapsed, used yesterday. Very upset about it. We talked about what happened and made a safety plan. Needs to call sponsor daily. See tomorrow.",
    "Had family session with Tom and his wife Mary. She's frustrated about trust issues. Tom has 60 days clean and wants more freedom. We talked about rebuilding trust slowly."
  ];
  
  const randomSample = samples[Math.floor(Math.random() * samples.length)];
  transcriptionText.value = randomSample;
  
  // Auto-switch to enhancement
  document.getElementById('inputText').value = randomSample;
  showSection('enhance');
}

/**
 * Process text with clinical mappings
 */
function processText() {
  const input = document.getElementById('inputText').value.trim();
  if (!input) {
    alert('Please enter some text first.');
    return;
  }
  
  // Clinical mappings from documentation
  let enhanced = input
    .replace(/upset/gi, 'exhibited emotional distress')
    .replace(/anxious/gi, 'presented with anxiety symptoms')
    .replace(/clean/gi, 'abstinent from substances')
    .replace(/sober/gi, 'abstinent from substances')
    .replace(/worked on/gi, 'implemented interventions targeting')
    .replace(/doing better/gi, 'demonstrating clinical improvement')
    .replace(/sad/gi, 'presented with depressed affect')
    .replace(/happy/gi, 'displayed euthymic mood')
    .replace(/angry/gi, 'demonstrated emotional dysregulation')
    .replace(/worried/gi, 'expressed anxiety regarding')
    .replace(/stressed/gi, 'reported elevated stress levels')
    .replace(/frustrated/gi, 'exhibited frustration tolerance difficulties')
    .replace(/crying/gi, 'displayed tearful affect')
    .replace(/scared/gi, 'expressed fear and apprehension')
    .replace(/nervous/gi, 'presented with observable anxiety')
    .replace(/calm/gi, 'appeared emotionally regulated')
    .replace(/depressed/gi, 'exhibited depressive symptoms')
    .replace(/talked about/gi, 'discussed and processed')
    .replace(/practiced/gi, 'engaged in skill rehearsal')
    .replace(/went over/gi, 'reviewed and reinforced')
    .replace(/taught/gi, 'provided psychoeducation regarding')
    .replace(/explained/gi, 'clarified therapeutic concepts')
    .replace(/breathing/gi, 'breathing exercises')
    .replace(/coping skills/gi, 'coping strategies')
    .replace(/triggers/gi, 'relapse triggers')
    .replace(/meetings/gi, 'support meetings')
    .replace(/sponsor/gi, '12-step sponsor');
  
  // Create 245G-compliant structure
  const formatted = `SERVICE PROVIDED:
Provided 50-minute individual substance use disorder counseling session at ASAM Level 2.1 intensive outpatient program via in-person service.

CLIENT RESPONSE:
Client ${enhanced}. Actively engaged in therapeutic discussion and demonstrated receptiveness to interventions. Maintained appropriate eye contact and participated collaboratively in session activities.

INTERVENTIONS:
Implemented evidence-based therapeutic interventions addressing Dimension 3 (Emotional/Behavioral) and Dimension 5 (Relapse Potential). Utilized Cognitive Behavioral Therapy techniques and Motivational Interviewing to explore client concerns. Provided psychoeducation regarding anxiety management and relapse prevention strategies.

PROGRESS:
Progress toward Goal #1 (maintain sobriety): Client demonstrating continued engagement in treatment with active participation in therapeutic interventions. Dimension 5 (Relapse Potential) risk being actively addressed through skill development and support system utilization.

PLAN:
Continue weekly individual sessions at current ASAM 2.1 level focusing on anxiety management and relapse prevention. Client to practice learned coping skills and attend scheduled support meetings. Next session scheduled for [DATE] to review progress and adjust treatment plan as needed.`;
  
  // Show results
  document.getElementById('outputText').textContent = formatted;
  document.getElementById('results').classList.remove('hidden');
  
  // Store for clipboard
  window.lastOutput = formatted;
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