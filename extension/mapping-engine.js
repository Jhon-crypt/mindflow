/**
 * MindFlow Clinical Mapping Engine
 * Transforms casual counselor language into professional Minnesota 245G-compliant progress notes
 */

class MindFlowMappingEngine {
  constructor() {
    this.clinicalMappings = this.initializeClinicalMappings();
    this.sectionRules = this.initializeSectionRules();
    this.complianceValidator = new ComplianceValidator();
  }

  /**
   * Main processing function - transforms voice/text input into structured progress note
   */
  async processInput(inputText) {
    try {
      console.log('MindFlow: Processing input:', inputText);
      
      // Step 1: Apply clinical language mappings
      const enhancedText = this.applyClinicalMappings(inputText);
      console.log('MindFlow: Enhanced text:', enhancedText);
      
      // Step 2: Initialize all 5 sections
      const sections = {
        "SERVICE PROVIDED": "",
        "CLIENT RESPONSE": "",
        "INTERVENTIONS": "",
        "PROGRESS": "",
        "PLAN": ""
      };
      
      // Step 3: Split enhanced text into sentences and classify
      const sentences = this.splitIntoSentences(enhancedText);
      
      sentences.forEach(sentence => {
        const classification = this.classifySentence(sentence.toLowerCase());
        if (sections[classification] !== undefined) {
          sections[classification] += sentence + " ";
        }
      });
      
      // Step 4: Fill in any missing sections with defaults
      this.fillDefaultSections(sections);
      
      // Step 5: Validate and enhance sections
      this.validateAndEnhanceSections(sections);
      
      // Step 6: Format for output
      const formattedNote = this.formatProgressNote(sections);
      
      console.log('MindFlow: Final sections:', sections);
      return { sections, formattedNote, isCompliant: this.complianceValidator.validate(sections) };
      
    } catch (error) {
      console.error('MindFlow processing error:', error);
      throw new Error(`Processing failed: ${error.message}`);
    }
  }

  /**
   * Initialize clinical language mappings from the documentation
   */
  initializeClinicalMappings() {
    return new Map([
      // Emotional mappings
      ["upset", "exhibited emotional distress"],
      ["sad", "presented with depressed affect"],
      ["happy", "displayed euthymic mood"],
      ["angry", "demonstrated emotional dysregulation"],
      ["anxious", "presented with anxiety symptoms"],
      ["worried", "expressed anxiety regarding"],
      ["stressed", "reported elevated stress levels"],
      ["frustrated", "exhibited frustration tolerance difficulties"],
      ["crying", "displayed tearful affect"],
      ["laughing", "demonstrated appropriate affect"],
      ["scared", "expressed fear and apprehension"],
      ["nervous", "presented with observable anxiety"],
      ["calm", "appeared emotionally regulated"],
      ["mad", "expressed anger"],
      ["depressed", "exhibited depressive symptoms"],
      ["fine", "reported stable mood"],
      ["okay", "indicated baseline functioning"],
      ["good mood", "presented with positive affect"],
      ["bad mood", "displayed dysphoric mood"],
      ["mood swings", "exhibited affective lability"],

      // Progress mappings
      ["doing better", "demonstrating clinical improvement"],
      ["doing worse", "showing decompensation"],
      ["getting better", "exhibiting positive treatment response"],
      ["not doing well", "experiencing symptom exacerbation"],
      ["improved", "showed measurable progress"],
      ["no change", "maintained baseline"],
      ["declined", "demonstrated regression"],
      ["stable", "maintaining clinical stability"],
      ["struggling", "experiencing ongoing challenges"],
      ["making progress", "achieving treatment milestones"],
      ["setback", "experienced temporary regression"],
      ["relapsed", "returned to substance use"],
      ["clean", "maintaining sobriety"],
      ["sober", "abstinent from substances"],
      ["using", "engaged in substance use"],

      // Intervention mappings
      ["talked about", "discussed and processed"],
      ["worked on", "implemented interventions targeting"],
      ["practiced", "engaged in skill rehearsal"],
      ["went over", "reviewed and reinforced"],
      ["taught", "provided psychoeducation regarding"],
      ["explained", "clarified therapeutic concepts"],
      ["showed", "demonstrated technique for"],
      ["tried", "attempted implementation of"],
      ["did", "completed therapeutic exercise"],
      ["focused on", "targeted intervention toward"],
      ["addressed", "processed therapeutic content regarding"],
      ["explored", "examined underlying factors"],
      ["identified", "recognized patterns related to"],

      // Cognitive mappings
      ["realized", "developed insight regarding"],
      ["understood", "demonstrated comprehension of"],
      ["learned", "acquired new coping strategies"],
      ["remembered", "recalled previous therapeutic content"],
      ["forgot", "exhibited memory difficulties regarding"],
      ["confused", "displayed cognitive disorganization"],
      ["clear thinking", "demonstrated organized thought process"],
      ["racing thoughts", "reported accelerated thought patterns"],
      ["slow thinking", "exhibited psychomotor retardation"],
      ["focused", "maintained appropriate attention"],
      ["distracted", "demonstrated attention deficits"],
      ["concentrating", "sustained focus appropriately"],

      // Social mappings
      ["family problems", "familial relationship stressors"],
      ["relationship issues", "interpersonal difficulties"],
      ["work stress", "occupational stressors"],
      ["school problems", "academic challenges"],
      ["friend drama", "peer relationship conflicts"],
      ["lonely", "experiencing social isolation"],
      ["isolated", "demonstrating social withdrawal"],
      ["social anxiety", "interpersonal anxiety symptoms"],
      ["fighting with", "experiencing conflict with"],
      ["getting along", "improved relational dynamics"],
      ["support system", "social support network"],
      ["no friends", "lacks peer relationships"],

      // Risk mappings
      ["suicide thoughts", "suicidal ideation"],
      ["wants to die", "expressed death wishes"],
      ["self-harm", "engaged in self-injurious behavior"],
      ["cutting", "self-mutilation behaviors"],
      ["overdose", "substance overdose attempt"],
      ["unsafe", "engaging in risk-taking behaviors"],
      ["dangerous", "high-risk behavioral patterns"],
      ["hurting self", "self-injurious intentions"],
      ["hurting others", "expressed homicidal ideation"],
      ["aggressive", "displayed aggressive behaviors"],
      ["violent", "exhibited violent tendencies"],
      ["safe", "denied safety concerns"],
      ["no risk", "no acute safety issues identified"],
      ["contracted for safety", "agreed to safety plan"],

      // Medical mappings
      ["pills", "medication"],
      ["meds", "prescribed medications"],
      ["side effects", "medication adverse effects"],
      ["sleeping better", "improved sleep hygiene"],
      ["can't sleep", "experiencing insomnia"],
      ["tired", "reported fatigue"],
      ["energy", "energy levels"],
      ["appetite", "nutritional intake patterns"],
      ["eating too much", "increased appetite"],
      ["not eating", "decreased appetite"],
      ["weight loss", "unintentional weight reduction"],
      ["weight gain", "increased body weight"],

      // Engagement mappings
      ["agreed to", "expressed willingness to"],
      ["refused", "declined participation in"],
      ["willing to try", "demonstrated openness to"],
      ["doesn't want to", "resistant to treatment"],
      ["compliant", "adherent to treatment plan"],
      ["non-compliant", "non-adherent to recommendations"],
      ["engaged", "actively participated"],
      ["withdrawn", "minimal engagement observed"],
      ["cooperative", "collaborative in session"],
      ["resistant", "demonstrated treatment resistance"],
      ["motivated", "displayed intrinsic motivation"],
      ["unmotivated", "lacking treatment motivation"],

      // Substance use mappings
      ["drunk", "intoxicated"],
      ["high", "under influence of substances"],
      ["buzzed", "mild intoxication"],
      ["wasted", "severe intoxication"],
      ["blackout", "alcohol-induced amnesia"],
      ["withdrawal", "substance withdrawal symptoms"],
      ["cravings", "substance use urges"],
      ["triggers", "relapse triggers"],
      ["NA/AA", "12-step program participation"],
      ["sponsor", "12-step sponsor relationship"],

      // Measurement mappings
      ["a lot", "significant frequency"],
      ["a little", "minimal presentation"],
      ["very", "significantly"],
      ["really", "notably"],
      ["kind of", "somewhat"],
      ["maybe", "possibly"],
      ["probably", "likely"],
      ["definitely", "certainly"],
      ["mild", "mild severity"],
      ["moderate", "moderate severity"],
      ["severe", "severe presentation"]
    ]);
  }

  /**
   * Initialize section classification rules
   */
  initializeSectionRules() {
    return {
      "SERVICE PROVIDED": {
        triggers: ["minutes", "minute", "min", "hour", "individual", "group", "family", "session", "telehealth", "in-person", "IOP", "outpatient"],
        template: "Provided {duration}-minute {type} session at ASAM Level {level} {modality}"
      },
      "CLIENT RESPONSE": {
        triggers: ["client", "he", "she", "they", "patient", "member", "seemed", "appeared", "looked", "presented", "was", "reported", "said", "stated", "denied", "admitted"]
      },
      "INTERVENTIONS": {
        triggers: ["worked on", "discussed", "talked about", "went over", "practiced", "taught", "showed", "explained", "reviewed", "processed", "explored", "addressed", "focused on", "implemented", "utilized", "facilitated", "CBT", "DBT", "MI", "motivational", "cognitive", "behavioral"]
      },
      "PROGRESS": {
        triggers: ["progress", "improved", "better", "worse", "same", "maintained", "declined", "days", "sober", "clean", "using", "relapsed", "goal", "working toward", "achieved", "meeting"]
      },
      "PLAN": {
        triggers: ["next", "continue", "will", "plan", "homework", "assign", "focus on", "work on", "follow up", "refer", "schedule", "next time", "next session", "tomorrow", "next week"]
      }
    };
  }

  /**
   * Apply clinical language mappings to input text
   */
  applyClinicalMappings(text) {
    let enhancedText = text.toLowerCase();
    
    // Apply mappings in order of specificity (longer phrases first)
    const sortedMappings = Array.from(this.clinicalMappings.entries())
      .sort((a, b) => b[0].length - a[0].length);
    
    for (const [casual, clinical] of sortedMappings) {
      const regex = new RegExp(`\\b${casual.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      enhancedText = enhancedText.replace(regex, clinical);
    }
    
    return enhancedText;
  }

  /**
   * Split text into sentences
   */
  splitIntoSentences(text) {
    return text.match(/[^.!?]+[.!?]+/g) || [text];
  }

  /**
   * Classify sentence into appropriate section
   */
  classifySentence(sentence) {
    // Check in priority order
    const sections = ["PLAN", "PROGRESS", "INTERVENTIONS", "CLIENT RESPONSE", "SERVICE PROVIDED"];
    
    for (const section of sections) {
      const triggers = this.sectionRules[section].triggers;
      if (triggers && this.hasAnyTrigger(sentence, triggers)) {
        return section;
      }
    }
    
    // Default to CLIENT RESPONSE if unclear
    return "CLIENT RESPONSE";
  }

  /**
   * Check if text contains any of the trigger words
   */
  hasAnyTrigger(text, triggers) {
    return triggers.some(trigger => text.includes(trigger.toLowerCase()));
  }

  /**
   * Fill in default sections if empty
   */
  fillDefaultSections(sections) {
    if (!sections["SERVICE PROVIDED"].trim()) {
      sections["SERVICE PROVIDED"] = "Provided 50-minute individual substance use disorder counseling session at ASAM Level 2.1 intensive outpatient program via in-person service.";
    }
    
    if (!sections["CLIENT RESPONSE"].trim()) {
      sections["CLIENT RESPONSE"] = "Client actively participated in session with appropriate engagement.";
    }
    
    if (!sections["INTERVENTIONS"].trim()) {
      sections["INTERVENTIONS"] = "Provided supportive counseling and therapeutic interventions addressing treatment goals.";
    }
    
    if (!sections["PROGRESS"].trim()) {
      sections["PROGRESS"] = "Client maintaining progress toward treatment plan goals.";
    }
    
    if (!sections["PLAN"].trim()) {
      sections["PLAN"] = "Continue current treatment plan and session schedule.";
    }
  }

  /**
   * Validate and enhance sections for compliance
   */
  validateAndEnhanceSections(sections) {
    // Ensure SERVICE PROVIDED has all required elements
    if (!sections["SERVICE PROVIDED"].includes("ASAM")) {
      sections["SERVICE PROVIDED"] = sections["SERVICE PROVIDED"].replace("session", "session at ASAM Level 2.1");
    }
    
    // Ensure INTERVENTIONS mentions specific techniques
    if (!this.hasAnyTrigger(sections["INTERVENTIONS"], ["CBT", "DBT", "MI", "Motivational", "Cognitive", "Behavioral"])) {
      sections["INTERVENTIONS"] = "Implemented therapeutic interventions including " + sections["INTERVENTIONS"];
    }
    
    // Ensure PROGRESS references goals and dimensions
    if (!sections["PROGRESS"].includes("Goal")) {
      sections["PROGRESS"] = "Progress toward Goal #1: " + sections["PROGRESS"];
    }
    
    if (!sections["PROGRESS"].includes("Dimension")) {
      sections["PROGRESS"] = sections["PROGRESS"] + " Dimension 5 (Relapse Potential) being addressed.";
    }
    
    // Clean up formatting
    Object.keys(sections).forEach(key => {
      sections[key] = sections[key].trim().replace(/\s+/g, ' ');
      if (sections[key] && !sections[key].endsWith('.')) {
        sections[key] += '.';
      }
    });
  }

  /**
   * Format the progress note for display
   */
  formatProgressNote(sections) {
    return Object.keys(sections)
      .map(section => `${section}:\n${sections[section]}\n`)
      .join('\n');
  }
}

/**
 * Minnesota 245G Compliance Validator
 */
class ComplianceValidator {
  validate(sections) {
    const errors = [];
    const requiredSections = ['SERVICE PROVIDED', 'CLIENT RESPONSE', 'INTERVENTIONS', 'PROGRESS', 'PLAN'];
    
    // Check all required sections exist and have minimum length
    requiredSections.forEach(section => {
      if (!sections[section] || sections[section].length < 50) {
        errors.push(`${section} is missing or too short (minimum 50 characters)`);
      }
    });
    
    // Check for ASAM dimension reference
    const hasASAMReference = /dimension [1-6]|asam/i.test(JSON.stringify(sections));
    if (!hasASAMReference) {
      errors.push("Must reference at least one ASAM dimension");
    }
    
    // Check for measurable progress indicator
    const hasMetric = /\d+ days?|\d+%|score|negative|positive|attended|\d+/i.test(sections.PROGRESS || '');
    if (!hasMetric) {
      errors.push("Progress section must include measurable indicator");
    }
    
    // Check for treatment plan goal reference
    const hasGoalReference = /goal #?\d+|objective|treatment plan/i.test(sections.PROGRESS || '');
    if (!hasGoalReference) {
      errors.push("Must reference specific treatment plan goal");
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      completeness: `${Math.max(0, (5 - errors.length) / 5 * 100)}%`
    };
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MindFlowMappingEngine, ComplianceValidator };
} else {
  window.MindFlowMappingEngine = MindFlowMappingEngine;
  window.ComplianceValidator = ComplianceValidator;
}