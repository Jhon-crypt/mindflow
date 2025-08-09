# 🎯 MindFlow - Clinical Note Enhancement Extension

Transform casual counselor notes into Minnesota 245G-compliant progress notes with AI-powered voice input and clinical language enhancement.

## 🚀 Features

### Core Functionality
- **Voice-to-Text Recording**: Record session notes hands-free with automatic transcription
- **Clinical Language Enhancement**: Converts casual language to professional clinical terminology
- **245G Compliance**: Automatically structures notes into required 5 sections
- **Real-time Processing**: Grammarly-like interface with instant feedback
- **Split Preview**: Side-by-side comparison before accepting changes

### UI States
1. **Dormant**: Subtle 8px purple indicator
2. **Hover**: Toolbar with record and enhance buttons
3. **Recording**: Live recording with timer and stop button
4. **Processing**: Progress bar during AI enhancement
5. **Preview**: Split view with auto-accept countdown
6. **Complete**: Enhanced note with undo option

### Minnesota 245G Compliance
Automatically generates all required sections:
- **SERVICE PROVIDED**: Session type, duration, ASAM level, modality
- **CLIENT RESPONSE**: Engagement, quotes, observations, substance use
- **INTERVENTIONS**: Specific techniques, ASAM dimensions, homework
- **PROGRESS**: Goal references, measurable outcomes, dimension changes
- **PLAN**: Next steps, assignments, referrals, schedule

## 📦 Installation

### For Development
1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `extension` folder
5. The MindFlow icon should appear in your extensions toolbar

### For Testing
1. Open the included `test-page.html` in your browser
2. Look for the purple dot (●) in the top-right corner of text areas
3. Hover to see the toolbar, click 🎤 to record or ✨ to enhance text

## 🎯 How to Use

### Voice Recording
1. Click the microphone button (🎤) in any textarea
2. Speak your session notes naturally
3. Click stop when finished
4. Review the enhanced text in split preview
5. Accept or reject the changes

### Text Enhancement
1. Type or paste casual notes in any textarea
2. Click the sparkle button (✨) or use Ctrl+M
3. Review the professional enhancement
4. Accept or reject the changes

### Example Input
```
Client was anxious, about 7 out of 10, been clean 30 days. 
We worked on breathing. Gave homework to write down triggers. 
See him next week.
```

### Example Output
```
SERVICE PROVIDED:
Provided 50-minute individual substance use disorder counseling session at ASAM Level 2.1.

CLIENT RESPONSE:
Client presented with anxiety symptoms, self-reporting 7/10 severity. Reported 30 days sober.

INTERVENTIONS:
Implemented breathing exercises. Assigned trigger tracking homework.

PROGRESS:
Client demonstrating progress toward Goal #1 with 30 days abstinent.

PLAN:
Continue weekly sessions. Client to complete trigger worksheet. Next session next week.
```

## 🔧 Configuration

### Settings (via popup)
- **Voice Language**: English (US/UK), Spanish, French
- **Auto-accept Delay**: 3, 5, 10 seconds, or never
- **Clinical Mode**: Only enhance clinical textareas
- **Notifications**: Show success/error messages

### Keyboard Shortcuts
- `Ctrl+M` (Cmd+M): Enhance current textarea
- `Ctrl+Shift+M` (Cmd+Shift+M): Start voice recording
- Right-click context menu: "Enhance with MindFlow"

## 🧠 Clinical Mapping Engine

### Language Mappings
- **Emotional**: "upset" → "exhibited emotional distress"
- **Progress**: "doing better" → "demonstrating clinical improvement"  
- **Interventions**: "worked on" → "implemented interventions targeting"
- **Cognitive**: "realized" → "developed insight regarding"
- **Social**: "family problems" → "familial relationship stressors"
- **Risk**: "suicide thoughts" → "suicidal ideation"
- **Medical**: "can't sleep" → "experiencing insomnia"
- **Engagement**: "agreed to" → "expressed willingness to"
- **Substance**: "clean" → "maintaining sobriety"

### Section Classification
Automatically categorizes sentences into appropriate sections based on trigger words and context.

### ASAM Dimension Integration
- Dimension 1: Acute Intoxication/Withdrawal
- Dimension 2: Biomedical Conditions  
- Dimension 3: Emotional/Behavioral
- Dimension 4: Readiness to Change
- Dimension 5: Relapse Potential
- Dimension 6: Recovery Environment

## 🔒 Privacy & Security

- **No Data Storage**: Notes are processed locally, never stored
- **No External APIs**: All processing happens in your browser
- **Secure by Design**: No data leaves your device
- **HIPAA Considerations**: Suitable for clinical environments

## 🛠️ Technical Architecture

### Files Structure
```
extension/
├── manifest.json           # Extension configuration
├── content-script.js       # Injects MindFlow into web pages
├── background.js          # Extension lifecycle management
├── mindflow-ui.js         # Main UI controller (6 states)
├── mapping-engine.js      # Clinical language processing
├── mindflow-ui.css        # Grammarly-like styling
├── popup.html/js          # Settings interface
└── test-page.html         # Demo/testing page
```

### Core Classes
- `MindFlowUI`: Manages the 6 UI states and user interactions
- `MindFlowMappingEngine`: Processes and enhances clinical text
- `ComplianceValidator`: Ensures 245G compliance requirements

### Browser Compatibility
- Chrome 88+
- Edge 88+
- Firefox 85+ (with minor modifications)

## 🧪 Testing

### Test Cases Included
1. **Basic Anxiety Session**: Standard individual counseling
2. **Depression Session**: Mood disorder with cognitive work
3. **Good Progress**: Positive milestone celebration  
4. **Relapse Session**: Crisis intervention and safety planning
5. **Family Session**: Multi-person therapy dynamics

### Quality Assurance
- Input validation and error handling
- Cross-browser compatibility testing
- Clinical accuracy verification
- Performance optimization
- Accessibility compliance

## 📈 Future Enhancements

### Planned Features
- **Multi-language Support**: Spanish, French clinical terminology
- **Custom Templates**: Organization-specific note formats
- **Integration APIs**: Direct EHR system connections
- **Advanced Analytics**: Usage statistics and improvement suggestions
- **Team Collaboration**: Shared templates and best practices

### Research Integration
- **Evidence-based Interventions**: Expanded therapy technique library
- **Outcome Tracking**: Long-term client progress analytics
- **Compliance Monitoring**: Real-time regulation updates
- **Quality Metrics**: Note quality scoring and feedback

## 🤝 Contributing

This extension was built based on comprehensive clinical documentation and real counselor workflow requirements. For improvements or issues:

1. Review the clinical mapping dictionaries
2. Test with the provided test cases
3. Ensure 245G compliance is maintained
4. Follow the existing code patterns

## 📋 License

Built for clinical counselors to improve documentation efficiency while maintaining compliance with Minnesota 245G requirements.

---

**Made with ❤️ for clinical counselors who deserve better tools**