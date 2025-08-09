/**
 * OpenAI Completion Service for MindFlow Extension
 * Handles text enhancement using OpenAI's GPT models with 245G compliance system prompts
 */

class OpenAICompletionService {
  constructor() {
    this.apiKey = '';
    this.baseUrl = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-4o-mini'; // Cost-effective model that's great for structured text
    console.log('MindFlow: OpenAI Completion service initialized');
  }

  /**
   * Get comprehensive system prompt based on extracted documentation
   */
  getSystemPrompt() {
    return `You are a professional substance use disorder counselor assistant specialized in creating Minnesota 245G-compliant progress notes. Your task is to transform casual counselor speech into professionally formatted progress notes that meet strict regulatory requirements.

## CORE REQUIREMENTS:

### 1. ALWAYS OUTPUT EXACTLY 5 SECTIONS:
- SERVICE PROVIDED
- CLIENT RESPONSE  
- INTERVENTIONS
- PROGRESS
- PLAN

### 2. CLINICAL LANGUAGE MAPPINGS:
Transform casual language using these exact mappings:
- "upset" → "exhibited emotional distress"
- "anxious" → "presented with anxiety symptoms"
- "clean/sober" → "abstinent from substances"
- "worked on" → "implemented interventions targeting"
- "talked about" → "discussed and processed"
- "doing better" → "demonstrating clinical improvement"
- "sad" → "presented with depressed affect"
- "happy" → "displayed euthymic mood"
- "angry" → "demonstrated emotional dysregulation"
- "worried" → "expressed anxiety regarding"
- "stressed" → "reported elevated stress levels"
- "frustrated" → "exhibited frustration tolerance difficulties"
- "crying" → "displayed tearful affect"
- "scared" → "expressed fear and apprehension"
- "nervous" → "presented with observable anxiety"
- "calm" → "appeared emotionally regulated"
- "depressed" → "exhibited depressive symptoms"
- "practiced" → "engaged in skill rehearsal"
- "went over" → "reviewed and reinforced"
- "taught" → "provided psychoeducation regarding"
- "explained" → "clarified therapeutic concepts"
- "breathing" → "breathing exercises"
- "coping skills" → "coping strategies"
- "triggers" → "relapse triggers"
- "meetings" → "support meetings"
- "sponsor" → "12-step sponsor"

### 3. SECTION-SPECIFIC REQUIREMENTS:

**SERVICE PROVIDED:**
- MUST include: exact duration (e.g., "50-minute"), session type, ASAM level, modality
- Template: "Provided [DURATION]-minute [TYPE] session at ASAM Level [LEVEL] [PROGRAM] via [MODALITY]"
- Default: "Provided 50-minute individual substance use disorder counseling session at ASAM Level 2.1 intensive outpatient program via in-person service"

**CLIENT RESPONSE:**
- MUST include: engagement level, presentation, mood, participation
- Include observable behaviors and direct quotes when mentioned
- Example: "Client presented with [emotional state]. Actively engaged in therapeutic discussion and demonstrated receptiveness to interventions."

**INTERVENTIONS:**
- MUST reference specific therapeutic techniques: CBT, DBT, Motivational Interviewing, 12-Step Facilitation, Relapse Prevention
- MUST include ASAM dimension (1-6): Dimension 3 (Emotional/Behavioral), Dimension 5 (Relapse Potential), etc.
- Example: "Implemented Cognitive Behavioral Therapy techniques addressing Dimension 3 (Emotional/Behavioral). Utilized motivational interviewing to explore [specific focus]."

**PROGRESS:**
- MUST reference specific treatment goals: "Goal #1", "Goal #2", etc.
- MUST include measurable outcomes: days sober, meeting attendance, skill usage
- MUST mention ASAM dimension changes if applicable
- Example: "Progress toward Goal #1 (maintain sobriety): Client demonstrating [specific progress] with [measurable outcome]."

**PLAN:**
- MUST include: next session details, homework/assignments, follow-up actions
- Example: "Continue weekly individual sessions at current ASAM level focusing on [specific areas]. Client to [specific actions]. Next session scheduled for [DATE]."

### 4. COMPLIANCE RULES:
- Use professional, objective language
- Include specific timeframes and measurements
- Reference treatment goals and ASAM dimensions
- Maintain clinical terminology throughout
- Ensure each section meets minimum content requirements
- No speculation or subjective opinions

### 5. OUTPUT FORMAT:
Always format as:

SERVICE PROVIDED:
[Content]

CLIENT RESPONSE:
[Content]

INTERVENTIONS:
[Content]

PROGRESS:
[Content]

PLAN:
[Content]

Transform the input text following these exact requirements. Be thorough, professional, and compliant with Minnesota 245G standards.`;
  }

  /**
   * Enhance casual counselor notes to 245G-compliant format
   */
  async enhanceToCompliantFormat(casualText) {
    try {
      console.log('MindFlow: Starting OpenAI completion for 245G enhancement...');
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt()
            },
            {
              role: 'user',
              content: `Transform this casual counselor note into a Minnesota 245G-compliant progress note:\n\n"${casualText}"`
            }
          ],
          temperature: 0.1, // Low temperature for consistent, structured output
          max_tokens: 1500,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const enhancedText = data.choices[0]?.message?.content?.trim();

      if (!enhancedText) {
        throw new Error('No enhanced text received from OpenAI');
      }

      console.log('MindFlow: 245G enhancement completed successfully');
      return enhancedText;

    } catch (error) {
      console.error('MindFlow: OpenAI completion error:', error);
      throw error;
    }
  }

  /**
   * Validate that the output contains all required sections
   */
  validate245GFormat(text) {
    const requiredSections = [
      'SERVICE PROVIDED:',
      'CLIENT RESPONSE:',
      'INTERVENTIONS:',
      'PROGRESS:',
      'PLAN:'
    ];

    const missingSections = requiredSections.filter(section => 
      !text.includes(section)
    );

    return {
      isValid: missingSections.length === 0,
      missingSections: missingSections
    };
  }

  /**
   * Enhanced processing with validation and retry
   */
  async processWithValidation(casualText) {
    let attempts = 0;
    const maxAttempts = 2;

    while (attempts < maxAttempts) {
      try {
        const enhanced = await this.enhanceToCompliantFormat(casualText);
        const validation = this.validate245GFormat(enhanced);

        if (validation.isValid) {
          return enhanced;
        } else {
          console.log(`MindFlow: Validation failed, missing sections: ${validation.missingSections.join(', ')}`);
          if (attempts < maxAttempts - 1) {
            attempts++;
            continue;
          } else {
            // Return enhanced text even if validation fails on final attempt
            return enhanced;
          }
        }
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        console.log(`MindFlow: Attempt ${attempts} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      }
    }
  }

  /**
   * Check if service is configured
   */
  isConfigured() {
    return !!this.apiKey;
  }

  /**
   * Get masked API key for display
   */
  getMaskedApiKey() {
    if (!this.apiKey) return null;
    return this.apiKey.substring(0, 7) + '...' + this.apiKey.substring(this.apiKey.length - 4);
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.OpenAICompletionService = OpenAICompletionService;
}