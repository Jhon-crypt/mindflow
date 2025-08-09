/**
 * MindFlow Content Script
 * Injects MindFlow UI into appropriate textarea elements on web pages
 */

// Track MindFlow instances
const mindFlowInstances = new Map();
let isEnabled = true;

/**
 * Initialize MindFlow on page load
 */
function initializeMindFlow() {
  console.log('MindFlow: Initializing content script');
  
  // Load settings from storage
  chrome.storage.sync.get(['mindflowEnabled'], (result) => {
    isEnabled = result.mindflowEnabled !== false; // Default to enabled
    
    if (isEnabled) {
      scanForTextareas();
      setupObserver();
    }
  });
}

/**
 * Scan existing textareas and add MindFlow
 */
function scanForTextareas() {
  const textareas = document.querySelectorAll('textarea');
  console.log(`MindFlow: Found ${textareas.length} textareas`);
  
  textareas.forEach(textarea => {
    if (shouldEnhanceTextarea(textarea)) {
      addMindFlowToTextarea(textarea);
    }
  });
}

/**
 * Determine if textarea should be enhanced with MindFlow
 */
function shouldEnhanceTextarea(textarea) {
  // Skip if already enhanced
  if (mindFlowInstances.has(textarea)) {
    return false;
  }
  
  // Skip if textarea is too small
  const rect = textarea.getBoundingClientRect();
  if (rect.width < 200 || rect.height < 60) {
    return false;
  }
  
  // Skip if textarea is hidden
  const style = window.getComputedStyle(textarea);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }
  
  // Skip password fields or sensitive inputs
  if (textarea.type === 'password' || 
      textarea.name?.toLowerCase().includes('password') ||
      textarea.id?.toLowerCase().includes('password')) {
    return false;
  }
  
  // Skip code editors and other technical textareas
  const skipClasses = ['code', 'editor', 'terminal', 'console', 'json', 'xml', 'sql'];
  const className = textarea.className.toLowerCase();
  const id = textarea.id.toLowerCase();
  
  if (skipClasses.some(cls => className.includes(cls) || id.includes(cls))) {
    return false;
  }
  
  // Look for clinical/medical context indicators
  const clinicalIndicators = [
    'note', 'progress', 'clinical', 'medical', 'therapy', 'counseling', 
    'assessment', 'treatment', 'patient', 'client', 'session', 'diagnosis',
    'intervention', 'plan', 'goal', 'objective', 'documentation'
  ];
  
  const textareaContext = (
    textarea.placeholder + ' ' +
    textarea.name + ' ' +
    textarea.id + ' ' +
    textarea.className + ' ' +
    (textarea.labels?.[0]?.textContent || '') + ' ' +
    (textarea.parentElement?.textContent?.substring(0, 200) || '')
  ).toLowerCase();
  
  const hasClinicalContext = clinicalIndicators.some(indicator => 
    textareaContext.includes(indicator)
  );
  
  // For demo purposes, enhance all reasonably-sized textareas
  // In production, you might want to be more selective
  return true;
}

/**
 * Add MindFlow UI to a textarea
 */
function addMindFlowToTextarea(textarea) {
  try {
    console.log('MindFlow: Adding UI to textarea', textarea);
    
    const mindflowUI = new MindFlowUI(textarea);
    mindFlowInstances.set(textarea, mindflowUI);
    
    // Listen for textarea removal
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node === textarea || (node.contains && node.contains(textarea))) {
            removeMindFlowFromTextarea(textarea);
            observer.disconnect();
          }
        });
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
  } catch (error) {
    console.error('MindFlow: Error adding UI to textarea:', error);
  }
}

/**
 * Remove MindFlow UI from a textarea
 */
function removeMindFlowFromTextarea(textarea) {
  const mindflowUI = mindFlowInstances.get(textarea);
  if (mindflowUI) {
    mindflowUI.destroy();
    mindFlowInstances.delete(textarea);
    console.log('MindFlow: Removed UI from textarea');
  }
}

/**
 * Setup mutation observer for dynamically added textareas
 */
function setupObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if the added node is a textarea
          if (node.tagName === 'TEXTAREA' && shouldEnhanceTextarea(node)) {
            addMindFlowToTextarea(node);
          }
          
          // Check for textareas within the added node
          if (node.querySelectorAll) {
            const textareas = node.querySelectorAll('textarea');
            textareas.forEach(textarea => {
              if (shouldEnhanceTextarea(textarea)) {
                addMindFlowToTextarea(textarea);
              }
            });
          }
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('MindFlow: Mutation observer setup complete');
}

/**
 * Handle messages from popup/background
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'toggle':
      isEnabled = request.enabled;
      if (isEnabled) {
        scanForTextareas();
      } else {
        // Remove all MindFlow instances
        mindFlowInstances.forEach((ui, textarea) => {
          removeMindFlowFromTextarea(textarea);
        });
      }
      sendResponse({ success: true });
      break;
      
    case 'getStatus':
      sendResponse({ 
        enabled: isEnabled, 
        instanceCount: mindFlowInstances.size 
      });
      break;
      
    case 'enhanceText':
      // Find focused textarea and enhance it
      const focusedElement = document.activeElement;
      if (focusedElement && focusedElement.tagName === 'TEXTAREA') {
        const mindflowUI = mindFlowInstances.get(focusedElement);
        if (mindflowUI) {
          mindflowUI.enhanceText();
        }
      }
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

/**
 * Handle page visibility changes
 */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden, pause any ongoing recordings
    mindFlowInstances.forEach((ui) => {
      if (ui.currentState === 'recording') {
        ui.stopRecording();
      }
    });
  }
});

/**
 * Handle page unload
 */
window.addEventListener('beforeunload', () => {
  mindFlowInstances.forEach((ui, textarea) => {
    removeMindFlowFromTextarea(textarea);
  });
});

/**
 * Initialize when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMindFlow);
} else {
  initializeMindFlow();
}

/**
 * Re-scan on navigation for single-page applications
 */
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('MindFlow: URL changed, re-scanning for textareas');
    setTimeout(scanForTextareas, 1000); // Wait for page to settle
  }
}).observe(document, { subtree: true, childList: true });

console.log('MindFlow: Content script loaded');