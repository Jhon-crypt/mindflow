# 🚀 MindFlow Installation & Testing Guide

## 📦 Quick Installation

### Step 1: Load the Extension
1. Open Chrome browser
2. Navigate to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top-right corner)
4. Click **"Load unpacked"**
5. Select the `/Users/john/projects/mindflow/extension/` folder
6. The MindFlow icon should appear in your extensions toolbar

### Step 2: Test the Extension
1. Open the test page: `/Users/john/projects/mindflow/extension/test-page.html`
2. Look for the small purple dot (●) in textarea corners
3. Hover over the dot to see the MindFlow toolbar
4. Try the interactive test cases provided

## 🎯 Testing Scenarios

### Basic Text Enhancement
1. **Open test page** in browser
2. **Click a test case** (e.g., "Basic Anxiety Session")  
3. **Click the sparkle button (✨)** in the textarea
4. **Watch the enhancement process**:
   - Processing state with progress bar
   - Split preview showing original vs enhanced
   - Auto-accept countdown (or click Accept/Reject)
5. **Review the 245G-compliant output**

### Voice Recording (Simulated)
1. **Click the microphone button (🎤)**
2. **Recording interface appears** with timer and red dot
3. **Click stop button (⏹)** after a few seconds
4. **System processes** with simulated transcription
5. **Enhanced text appears** in split preview

### Test Cases to Try

#### Test Case 1: Basic Session
**Input**: "Client was anxious, about 7 out of 10, been clean 30 days. We worked on breathing. Gave homework to write down triggers. See him next week."

**Expected Output**:
```
SERVICE PROVIDED:
Provided 50-minute individual substance use disorder counseling session at ASAM Level 2.1.

CLIENT RESPONSE:
Client presented with anxiety symptoms, self-reporting 7/10 severity. Reported 30 days abstinent from substances.

INTERVENTIONS:
Implemented interventions targeting breathing exercises. Assigned trigger tracking homework.

PROGRESS:
Client demonstrating progress toward Goal #1 with 30 days abstinent.

PLAN:
Continue weekly sessions. Client to complete trigger worksheet. Next session next week.
```

#### Test Case 2: Depression Session
**Input**: "She seemed really depressed today, mood was like a 4. She's been sober for 30 days which is great. We talked about her job loss and how it's affecting her self-worth. Did some cognitive restructuring around her negative thoughts."

**Expected Output**: Should structure into 5 sections with clinical language enhancement.

## 🔧 Troubleshooting

### Extension Not Loading
- **Check Developer Mode**: Must be enabled in chrome://extensions/
- **Check File Paths**: Ensure all files are in the extension folder
- **Check Console**: Open DevTools → Console for error messages
- **Reload Extension**: Click refresh icon in extensions page

### Purple Dot Not Appearing
- **Check Textarea Size**: Must be at least 200x60 pixels
- **Check Page Load**: Wait for page to fully load
- **Check Console**: Look for "MindFlow: Found X textareas" message
- **Try Different Page**: Test with the included test-page.html

### Enhancement Not Working
- **Check Input Text**: Must have some content in textarea
- **Check Console**: Look for processing error messages
- **Try Test Cases**: Use the provided examples first
- **Check Network**: No external APIs required (works offline)

### Voice Recording Issues
- **Grant Microphone Permission**: Browser will prompt for access
- **Check HTTPS**: Some browsers require secure context
- **Simulated Transcription**: Currently uses demo data, not real speech-to-text

## 🧪 Validation Checklist

### UI States Testing
- [ ] **Dormant**: Purple dot visible and hoverable
- [ ] **Hover**: Toolbar appears with microphone and sparkle buttons
- [ ] **Recording**: Red dot pulses, timer counts, stop button works
- [ ] **Processing**: Progress bar animates during enhancement
- [ ] **Preview**: Split view shows original vs enhanced with countdown
- [ ] **Complete**: Success checkmark, undo option appears

### Clinical Enhancement Testing
- [ ] **Casual → Clinical**: "upset" becomes "exhibited emotional distress"
- [ ] **Section Structure**: All 5 sections (Service, Response, Interventions, Progress, Plan)
- [ ] **ASAM Compliance**: References dimensions and levels
- [ ] **Goal References**: Progress section mentions treatment goals
- [ ] **Professional Language**: No casual words in output

### Browser Compatibility
- [ ] **Chrome 88+**: Primary target, full functionality
- [ ] **Edge 88+**: Should work identically to Chrome
- [ ] **Firefox**: Manifest V2 version needed (not included)

## 📊 Performance Expectations

### Processing Times
- **Text Enhancement**: < 1 second for typical notes
- **Voice Transcription**: 2-3 seconds (simulated)
- **UI Transitions**: < 200ms between states
- **Memory Usage**: < 10MB per tab

### Accuracy Targets
- **Clinical Mapping**: 85%+ accuracy on test cases
- **245G Compliance**: 95%+ validation score
- **Section Classification**: 90%+ correct categorization

## 🔍 Advanced Testing

### Custom Test Cases
Create your own test cases by modifying the test-page.html:

```javascript
const customTestCases = {
    6: "Your custom counselor note here...",
    7: "Another test case...",
};
```

### Integration Testing
Test with real EHR systems or clinical documentation platforms:
1. Navigate to your EHR system
2. Find textarea fields for progress notes
3. Look for MindFlow purple dot
4. Test enhancement functionality

### Performance Testing
Monitor extension performance:
1. Open Chrome DevTools → Performance tab
2. Record while using MindFlow
3. Check for memory leaks or slow operations
4. Verify UI remains responsive

## 🚨 Known Limitations

### Current Version (1.0.0)
- **Voice transcription is simulated** (demo purposes only)
- **No cloud storage** - all processing is local
- **English language only** - no multi-language support yet
- **Chrome/Edge only** - Firefox version not included
- **No EHR integrations** - works with any textarea but no direct API connections

### Future Enhancements
- Real speech-to-text API integration
- Multi-language clinical terminology
- Direct EHR system connections
- Advanced compliance checking
- Team collaboration features

## 📞 Support

### Getting Help
1. **Check Console**: Look for error messages in browser DevTools
2. **Review Documentation**: Read the README.md for detailed information
3. **Test Isolation**: Try with the included test-page.html first
4. **Browser Reset**: Try in incognito mode to rule out conflicts

### Reporting Issues
When reporting problems, include:
- Browser version and OS
- Extension version (1.0.0)
- Steps to reproduce
- Console error messages
- Screenshot if applicable

---

**🎯 Ready to enhance your clinical documentation workflow!**

The MindFlow extension is now installed and ready to transform your casual counseling notes into professional, Minnesota 245G-compliant progress notes. Start with the test cases and gradually incorporate it into your daily documentation routine.