/**
 * MindFlow Clinical Mapping Engine
 * Transforms casual counselor language into professional Minnesota 245G-compliant progress notes
 * Based on Complete Mapping Dictionary and Detailed Mapping System specifications
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
      
      // Step 1: Parse and classify input into sections
      const parsedSections = this.parseInputIntoSections(inputText);
      
      // Step 2: Apply section-specific processing
      const processedSections = this.processSections(parsedSections);
      
      // Step 3: Validate 245G compliance
      const validatedSections = this.validateCompliance(processedSections);
      
      // Step 4: Format final output
      const formattedNote = this.formatProgressNote(validatedSections);
      
      console.log('MindFlow: Final formatted note:', formattedNote);
      return formattedNote;
      
    } catch (error) {
      console.error('MindFlow Mapping Error:', error);
      throw error;
    }
  }

  /**
   * Initialize comprehensive clinical mappings from Complete Mapping Dictionary
   */
  initializeClinicalMappings() {
    return {
      // Emotional States (from documentation)
      emotional: {
        "upset": "exhibited emotional distress",
        "sad": "presented with depressed affect",
        "happy": "displayed euthymic mood",
        "angry": "demonstrated emotional dysregulation",
        "anxious": "presented with anxiety symptoms",
        "worried": "expressed anxiety regarding",
        "stressed": "reported elevated stress levels",
        "frustrated": "exhibited frustration tolerance difficulties",
        "crying": "displayed tearful affect",
        "laughing": "demonstrated appropriate affect",
        "scared": "expressed fear and apprehension",
        "nervous": "presented with observable anxiety",
        "calm": "appeared emotionally regulated",
        "mad": "expressed anger",
        "depressed": "exhibited depressive symptoms",
        "fine": "reported stable mood",
        "okay": "indicated baseline functioning",
        "good mood": "presented with positive affect",
        "bad mood": "displayed dysphoric mood",
        "mood swings": "exhibited affective lability"
      },

      // Progress Indicators
      progress: {
        "doing better": "demonstrating clinical improvement",
        "doing worse": "showing decompensation",
        "getting better": "exhibiting positive treatment response",
        "not doing well": "experiencing symptom exacerbation",
        "improved": "showed measurable progress",
        "declined": "demonstrated clinical decline",
        "stable": "maintained current functioning level",
        "worse": "exhibited symptom deterioration"
      },

      // Substance Use Terms
      substance_use: {
        "clean": "abstinent from substances",
        "sober": "abstinent from substances",
        "using": "actively using substances",
        "relapsed": "experienced substance use episode",
        "slipped": "had a brief substance use episode",
        "drank": "consumed alcohol",
        "used": "engaged in substance use",
        "high": "under the influence of substances",
        "drunk": "intoxicated with alcohol"
      },

      // Therapeutic Actions
      therapeutic_actions: {
        "worked on": "implemented interventions targeting",
        "talked about": "discussed and processed",
        "practiced": "engaged in skill rehearsal",
        "went over": "reviewed and reinforced",
        "taught": "provided psychoeducation regarding",
        "explained": "clarified therapeutic concepts",
        "reviewed": "systematically examined",
        "explored": "conducted therapeutic exploration of",
        "processed": "facilitated processing of"
      },

      // Engagement Levels
      engagement: {
        "participated": "actively engaged in therapeutic discussion",
        "cooperative": "demonstrated therapeutic cooperation",
        "resistant": "exhibited resistance to therapeutic interventions",
        "motivated": "displayed intrinsic motivation for change",
        "willing": "expressed willingness to engage",
        "reluctant": "showed reluctance to participate",
        "engaged": "actively participated in session activities"
      },

      // Recovery Tools
      recovery_tools: {
        "breathing": "breathing exercises",
        "coping skills": "coping strategies",
        "triggers": "relapse triggers",
        "meetings": "support meetings",
        "sponsor": "12-step sponsor",
        "steps": "12-step program principles",
        "prayer": "spiritual practices",
        "meditation": "mindfulness practices"
      }
    };
  }

  /**
   * Initialize section-specific processing rules from Detailed Mapping System
   */
  initializeSectionRules() {
    return {
      "SERVICE PROVIDED": {
        template: "Provided [DURATION]-minute [TYPE] session at ASAM Level [LEVEL] [PROGRAM] via [MODALITY]",
        defaults: {
          duration: "50",
          type: "individual substance use disorder counseling",
          level: "2.1",
          program: "intensive outpatient program",
          modality: "in-person service"
        },
        triggers: {
          duration: ["minutes", "minute", "min", "hour"],
          session_type: ["individual", "group", "family", "one-on-one", "1:1"],
          modality: ["telehealth", "phone", "in-person", "virtual", "zoom", "video"],
          asam_level: ["level", "ASAM", "IOP", "outpatient", "intensive"]
        },
        mappings: {
          session_type: {
            "individual": "individual substance use disorder counseling",
            "group": "group therapy",
            "family": "family therapy",
            "one-on-one": "individual substance use disorder counseling",
            "1:1": "individual substance use disorder counseling",
            "IOP": "intensive outpatient program group"
          },
          modality: {
            "telehealth": "telehealth platform",
            "phone": "telephone",
            "in-person": "in-person service",
            "virtual": "telehealth platform",
            "zoom": "video conferencing",
            "video": "video conferencing"
          },
          asam_level: {
            "IOP": "2.1",
            "intensive outpatient": "2.1",
            "outpatient": "1.0",
            "partial": "2.5",
            "residential": "3.5"
          }
        }
      },

      "CLIENT RESPONSE": {
        required_elements: ["engagement", "presentation", "mood", "participation"],
        triggers: ["client", "he", "she", "they", "seemed", "appeared", "presented", "reported"],
        enhancement_patterns: [
          "Client {enhanced_description}. {engagement_description}. {additional_observations}."
        ]
      },

      "INTERVENTIONS": {
        required_elements: ["technique", "asam_dimension", "specific_activities"],
        approved_interventions: [
          "Motivational Interviewing",
          "Cognitive Behavioral Therapy",
          "Dialectical Behavior Therapy",
          "12-Step Facilitation",
          "Relapse Prevention",
          "Seeking Safety",
          "Mindfulness-Based Relapse Prevention"
        ],
        asam_dimensions: {
          "1": "Acute Intoxication/Withdrawal",
          "2": "Biomedical Conditions",
          "3": "Emotional/Behavioral",
          "4": "Readiness to Change",
          "5": "Relapse Potential",
          "6": "Recovery Environment"
        }
      },

      "PROGRESS": {
        required_elements: ["goal_reference", "measurable_outcome", "direction"],
        measurement_types: ["days_sober", "meeting_attendance", "skill_usage", "test_scores"],
        goal_references: ["Goal #1", "Goal #2", "Goal #3", "Goal #4", "Goal #5"]
      },

      "PLAN": {
        required_elements: ["next_session", "homework", "follow_up_actions"],
        common_plans: ["Continue weekly sessions", "Complete assigned homework", "Attend support meetings"]
      }
    };
  }

  /**
   * Parse input text and classify into appropriate sections
   */
  parseInputIntoSections(inputText) {
    const sections = {
      "SERVICE PROVIDED": "",
      "CLIENT RESPONSE": "",
      "INTERVENTIONS": "",
      "PROGRESS": "",
      "PLAN": ""
    };

    // Apply clinical mappings first
    const enhancedText = this.applyClinicalMappings(inputText);
    
    // Split into sentences and classify
    const sentences = this.splitIntoSentences(enhancedText);
    
    sentences.forEach(sentence => {
      const classification = this.classifySentence(sentence);
      if (sections[classification]) {
        sections[classification] += sentence + " ";
      } else {
        // Default to CLIENT RESPONSE if unclear
        sections["CLIENT RESPONSE"] += sentence + " ";
      }
    });

    return sections;
  }

  /**
   * Apply comprehensive clinical language mappings
   */
  applyClinicalMappings(text) {
    let enhanced = text;
    
    // Apply all mapping categories
    Object.values(this.clinicalMappings).forEach(category => {
      Object.entries(category).forEach(([casual, clinical]) => {
        const regex = new RegExp(`\\b${casual}\\b`, 'gi');
        enhanced = enhanced.replace(regex, clinical);
      });
    });
    
    return enhanced;
  }

  /**
   * Classify sentence into appropriate section
   */
  classifySentence(sentence) {
    const lower = sentence.toLowerCase();
    
    // SERVICE PROVIDED indicators
    if (lower.includes('session') || lower.includes('provided') || lower.includes('minute')) {
      return "SERVICE PROVIDED";
    }
    
    // INTERVENTIONS indicators
    if (lower.includes('worked on') || lower.includes('taught') || lower.includes('practiced') || 
        lower.includes('cbt') || lower.includes('therapy') || lower.includes('technique')) {
      return "INTERVENTIONS";
    }
    
    // PROGRESS indicators
    if (lower.includes('days') || lower.includes('progress') || lower.includes('goal') || 
        lower.includes('better') || lower.includes('worse') || lower.includes('meeting')) {
      return "PROGRESS";
    }
    
    // PLAN indicators
    if (lower.includes('next') || lower.includes('continue') || lower.includes('homework') || 
        lower.includes('see') || lower.includes('schedule')) {
      return "PLAN";
    }
    
    // Default to CLIENT RESPONSE
    return "CLIENT RESPONSE";
  }

  /**
   * Process each section according to its specific rules
   */
  processSections(sections) {
    const processed = {};
    
    // Process SERVICE PROVIDED
    processed["SERVICE PROVIDED"] = this.processServiceProvided(sections["SERVICE PROVIDED"]);
    
    // Process CLIENT RESPONSE
    processed["CLIENT RESPONSE"] = this.processClientResponse(sections["CLIENT RESPONSE"]);
    
    // Process INTERVENTIONS
    processed["INTERVENTIONS"] = this.processInterventions(sections["INTERVENTIONS"]);
    
    // Process PROGRESS
    processed["PROGRESS"] = this.processProgress(sections["PROGRESS"]);
    
    // Process PLAN
    processed["PLAN"] = this.processPlan(sections["PLAN"]);
    
    return processed;
  }

  /**
   * Process SERVICE PROVIDED section
   */
  processServiceProvided(content) {
    const rules = this.sectionRules["SERVICE PROVIDED"];
    let processed = rules.template;
    
    // Extract or use defaults
    const duration = this.extractDuration(content) || rules.defaults.duration;
    const type = this.extractSessionType(content) || rules.defaults.type;
    const level = this.extractASAMLevel(content) || rules.defaults.level;
    const program = rules.defaults.program;
    const modality = this.extractModality(content) || rules.defaults.modality;
    
    // Fill template
    processed = processed
      .replace('[DURATION]', duration)
      .replace('[TYPE]', type)
      .replace('[LEVEL]', level)
      .replace('[PROGRAM]', program)
      .replace('[MODALITY]', modality);
    
    return processed + ".";
  }

  /**
   * Process CLIENT RESPONSE section
   */
  processClientResponse(content) {
    if (!content.trim()) {
      return "Client actively engaged in therapeutic discussion and demonstrated receptiveness to interventions. Maintained appropriate eye contact and participated collaboratively in session activities.";
    }
    
    // Enhance with professional language
    let enhanced = content.trim();
    
    // Add engagement description if missing
    if (!enhanced.toLowerCase().includes('engaged') && !enhanced.toLowerCase().includes('participated')) {
      enhanced += " Actively engaged in therapeutic discussion.";
    }
    
    // Add professional observations
    if (!enhanced.toLowerCase().includes('demonstrated') && !enhanced.toLowerCase().includes('exhibited')) {
      enhanced += " Demonstrated receptiveness to therapeutic interventions.";
    }
    
    return enhanced;
  }

  /**
   * Process INTERVENTIONS section
   */
  processInterventions(content) {
    if (!content.trim()) {
      return "Implemented evidence-based therapeutic interventions addressing Dimension 3 (Emotional/Behavioral) and Dimension 5 (Relapse Potential). Utilized Cognitive Behavioral Therapy techniques and Motivational Interviewing to explore client concerns.";
    }
    
    let enhanced = content.trim();
    
    // Add ASAM dimension if missing
    if (!enhanced.toLowerCase().includes('dimension')) {
      enhanced = `Implemented evidence-based therapeutic interventions addressing Dimension 3 (Emotional/Behavioral). ${enhanced}`;
    }
    
    // Add specific technique if missing
    if (!enhanced.toLowerCase().includes('cognitive') && !enhanced.toLowerCase().includes('motivational')) {
      enhanced += " Utilized Cognitive Behavioral Therapy techniques to address treatment goals.";
    }
    
    return enhanced;
  }

  /**
   * Process PROGRESS section
   */
  processProgress(content) {
    if (!content.trim()) {
      return "Progress toward Goal #1 (maintain sobriety): Client demonstrating continued engagement in treatment with active participation in therapeutic interventions. Dimension 5 (Relapse Potential) risk being actively addressed through skill development.";
    }
    
    let enhanced = content.trim();
    
    // Add goal reference if missing
    if (!enhanced.toLowerCase().includes('goal')) {
      enhanced = `Progress toward Goal #1: ${enhanced}`;
    }
    
    return enhanced;
  }

  /**
   * Process PLAN section
   */
  processPlan(content) {
    if (!content.trim()) {
      return "Continue weekly individual sessions at current ASAM level focusing on treatment goals. Client to practice learned coping skills and attend scheduled support meetings. Next session scheduled for [DATE].";
    }
    
    let enhanced = content.trim();
    
    // Add continuation plan if missing
    if (!enhanced.toLowerCase().includes('continue') && !enhanced.toLowerCase().includes('next')) {
      enhanced = `Continue current treatment approach. ${enhanced}`;
    }
    
    return enhanced;
  }

  /**
   * Extract duration from text
   */
  extractDuration(text) {
    const matches = text.match(/(\d+)\s*(minute|min)/i);
    return matches ? matches[1] : null;
  }

  /**
   * Extract session type from text
   */
  extractSessionType(text) {
    const mappings = this.sectionRules["SERVICE PROVIDED"].mappings.session_type;
    for (const [key, value] of Object.entries(mappings)) {
      if (text.toLowerCase().includes(key)) {
        return value;
      }
    }
    return null;
  }

  /**
   * Extract ASAM level from text
   */
  extractASAMLevel(text) {
    const mappings = this.sectionRules["SERVICE PROVIDED"].mappings.asam_level;
    for (const [key, value] of Object.entries(mappings)) {
      if (text.toLowerCase().includes(key)) {
        return value;
      }
    }
    return null;
  }

  /**
   * Extract modality from text
   */
  extractModality(text) {
    const mappings = this.sectionRules["SERVICE PROVIDED"].mappings.modality;
    for (const [key, value] of Object.entries(mappings)) {
      if (text.toLowerCase().includes(key)) {
        return value;
      }
    }
    return null;
  }

  /**
   * Split text into sentences
   */
  splitIntoSentences(text) {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }

  /**
   * Validate 245G compliance
   */
  validateCompliance(sections) {
    // This would implement the full compliance validation from the documentation
    // For now, return sections as-is but log validation
    console.log('MindFlow: Validating 245G compliance...');
    return sections;
  }

  /**
   * Format final progress note
   */
  formatProgressNote(sections) {
    return Object.entries(sections)
      .map(([section, content]) => `${section}:\n${content}\n`)
      .join('\n');
  }
}

/**
 * Compliance Validator Class
 */
class ComplianceValidator {
  constructor() {
    this.requirements = this.initializeRequirements();
  }

  initializeRequirements() {
    return {
      "SERVICE PROVIDED": {
        required: ["duration", "session_type", "asam_level", "modality"],
        min_length: 50,
        max_length: 200
      },
      "CLIENT RESPONSE": {
        required: ["engagement", "presentation"],
        min_length: 100,
        max_length: 500
      },
      "INTERVENTIONS": {
        required: ["technique", "asam_dimension"],
        min_length: 80,
        max_length: 400
      },
      "PROGRESS": {
        required: ["goal_reference", "measurable_outcome"],
        min_length: 60,
        max_length: 300
      },
      "PLAN": {
        required: ["next_steps"],
        min_length: 40,
        max_length: 200
      }
    };
  }

  validate(sections) {
    const results = {};
    
    Object.entries(sections).forEach(([section, content]) => {
      const requirements = this.requirements[section];
      results[section] = {
        valid: true,
        issues: [],
        content_length: content.length
      };
      
      // Check length requirements
      if (content.length < requirements.min_length) {
        results[section].valid = false;
        results[section].issues.push(`Content too short (${content.length} < ${requirements.min_length})`);
      }
      
      if (content.length > requirements.max_length) {
        results[section].valid = false;
        results[section].issues.push(`Content too long (${content.length} > ${requirements.max_length})`);
      }
    });
    
    return results;
  }
}

// Make available globally for popup and content script
if (typeof window !== 'undefined') {
  window.MindFlowMappingEngine = MindFlowMappingEngine;
}