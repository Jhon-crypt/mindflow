/**
 * OpenAI Whisper Service for MindFlow Extension
 * Handles real speech-to-text transcription using OpenAI's Whisper API
 */

class WhisperService {
  constructor() {
    this.apiKey = null;
    this.baseUrl = 'https://api.openai.com/v1/audio/transcriptions';
    this.model = 'whisper-1';
    this.initializeApiKey();
  }

  /**
   * Initialize API key - hardcoded for seamless operation
   */
  async initializeApiKey() {
    // Use hardcoded API key for seamless operation
    this.apiKey = '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';
    console.log('MindFlow: OpenAI API key configured');
  }

  /**
   * Set API key (not needed since hardcoded, but kept for compatibility)
   */
  async setApiKey(apiKey) {
    console.log('MindFlow: API key is hardcoded, ignoring setApiKey call');
  }

  /**
   * Transcribe audio blob using OpenAI Whisper API
   */
  async transcribeAudio(audioBlob, options = {}) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      console.log('MindFlow: Starting Whisper transcription...');
      
      // Prepare form data
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', this.model);
      
      // Add optional parameters
      if (options.language) {
        formData.append('language', options.language);
      }
      if (options.prompt) {
        formData.append('prompt', options.prompt);
      }
      if (options.response_format) {
        formData.append('response_format', options.response_format);
      } else {
        formData.append('response_format', 'text');
      }
      if (options.temperature) {
        formData.append('temperature', options.temperature.toString());
      }

      // Make API request
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const transcription = await response.text();
      console.log('MindFlow: Whisper transcription completed:', transcription);
      
      return transcription.trim();

    } catch (error) {
      console.error('MindFlow: Whisper transcription error:', error);
      throw error;
    }
  }

  /**
   * Check if API key is configured
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Get current API key (masked for security)
   */
  getMaskedApiKey() {
    if (!this.apiKey) return null;
    return this.apiKey.substring(0, 7) + '...' + this.apiKey.substring(this.apiKey.length - 4);
  }

  /**
   * Test API connection
   */
  async testConnection() {
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    try {
      // Create a small test audio blob (silent audio)
      const testAudio = await this.createTestAudioBlob();
      
      // Try to transcribe it
      await this.transcribeAudio(testAudio, { 
        language: 'en',
        prompt: 'This is a test of the OpenAI Whisper API connection.'
      });
      
      return true;
    } catch (error) {
      console.error('MindFlow: API connection test failed:', error);
      throw error;
    }
  }

  /**
   * Create a small test audio blob for connection testing
   */
  async createTestAudioBlob() {
    // Create a minimal audio context and generate a short silent audio
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate); // 0.1 second
    
    // Convert to blob
    const mediaRecorder = new MediaRecorder(new MediaStream());
    const chunks = [];
    
    return new Promise((resolve) => {
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        resolve(blob);
      };
      
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 100);
    });
  }

  /**
   * Get supported languages for Whisper
   */
  getSupportedLanguages() {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' },
      { code: 'nl', name: 'Dutch' },
      { code: 'pl', name: 'Polish' },
      { code: 'sv', name: 'Swedish' },
      { code: 'da', name: 'Danish' },
      { code: 'no', name: 'Norwegian' },
      { code: 'fi', name: 'Finnish' }
    ];
  }

  /**
   * Get clinical transcription prompt for better medical terminology recognition
   */
  getClinicalPrompt() {
    return "This is a clinical session note by a substance use disorder counselor. The recording contains medical and therapeutic terminology including ASAM levels, treatment goals, clinical interventions, progress notes, and professional language for Minnesota 245G compliance. Please transcribe accurately with proper punctuation and capitalization.";
  }

  /**
   * Transcribe with clinical context
   */
  async transcribeClinicalAudio(audioBlob, language = 'en') {
    return await this.transcribeAudio(audioBlob, {
      language: language,
      prompt: this.getClinicalPrompt(),
      temperature: 0.1 // Lower temperature for more consistent clinical transcription
    });
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.WhisperService = WhisperService;
}