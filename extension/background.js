/**
 * MindFlow Background Service Worker
 * Handles extension lifecycle, settings, and communication
 */

// Extension installation and updates
chrome.runtime.onInstalled.addListener((details) => {
  console.log('MindFlow: Extension installed/updated', details);
  
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      mindflowEnabled: true,
      autoAcceptDelay: 5,
      voiceLanguage: 'en-US',
      clinicalMode: true,
      showNotifications: true
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });
  }
});

// Handle toolbar icon clicks
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Toggle MindFlow on current tab
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getStatus' });
    const newEnabled = !response.enabled;
    
    await chrome.tabs.sendMessage(tab.id, { 
      action: 'toggle', 
      enabled: newEnabled 
    });
    
    // Update storage
    chrome.storage.sync.set({ mindflowEnabled: newEnabled });
    
    // Update icon
    updateIcon(newEnabled);
    
    // Show notification
    if (response.showNotifications !== false) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/mindflow-48.png',
        title: 'MindFlow',
        message: `MindFlow ${newEnabled ? 'enabled' : 'disabled'} on this page`
      });
    }
    
  } catch (error) {
    console.error('MindFlow: Error toggling extension:', error);
  }
});

// Update extension icon based on state
function updateIcon(enabled) {
  const iconPath = enabled ? {
    "16": "icons/mindflow-16.png",
    "32": "icons/mindflow-32.png",
    "48": "icons/mindflow-48.png",
    "128": "icons/mindflow-128.png"
  } : {
    "16": "icons/mindflow-16-disabled.png",
    "32": "icons/mindflow-32-disabled.png",
    "48": "icons/mindflow-48-disabled.png",
    "128": "icons/mindflow-128-disabled.png"
  };
  
  chrome.action.setIcon({ path: iconPath });
  chrome.action.setTitle({ 
    title: `MindFlow - ${enabled ? 'Enabled' : 'Disabled'}` 
  });
}

// Handle context menu
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'enhance-text') {
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'enhanceText' });
    } catch (error) {
      console.error('MindFlow: Error enhancing text:', error);
    }
  }
});

// Create context menu on startup
chrome.runtime.onStartup.addListener(() => {
  createContextMenu();
});

chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
});

function createContextMenu() {
  chrome.contextMenus.create({
    id: 'enhance-text',
    title: 'Enhance with MindFlow',
    contexts: ['editable'],
    documentUrlPatterns: ['http://*/*', 'https://*/*']
  });
}

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  
  if (!tab) return;
  
  try {
    switch (command) {
      case 'enhance-text':
        await chrome.tabs.sendMessage(tab.id, { action: 'enhanceText' });
        break;
        
      case 'toggle-mindflow':
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getStatus' });
        const newEnabled = !response.enabled;
        await chrome.tabs.sendMessage(tab.id, { 
          action: 'toggle', 
          enabled: newEnabled 
        });
        updateIcon(newEnabled);
        break;
    }
  } catch (error) {
    console.error('MindFlow: Error handling command:', error);
  }
});

// Handle storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.mindflowEnabled) {
    updateIcon(changes.mindflowEnabled.newValue);
  }
});

// Tab update listener to refresh icon state
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const settings = await chrome.storage.sync.get(['mindflowEnabled']);
    updateIcon(settings.mindflowEnabled !== false);
  } catch (error) {
    // Tab might not have content script loaded yet
    updateIcon(true); // Default to enabled
  }
});

// Handle extension messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getSettings':
      chrome.storage.sync.get(null, (settings) => {
        sendResponse(settings);
      });
      return true; // Async response
      
    case 'saveSettings':
      chrome.storage.sync.set(request.settings, () => {
        sendResponse({ success: true });
        
        // Update icon if enabled state changed
        if (request.settings.mindflowEnabled !== undefined) {
          updateIcon(request.settings.mindflowEnabled);
        }
      });
      return true; // Async response
      
    case 'logUsage':
      // Log usage statistics (privacy-friendly)
      logUsageEvent(request.event, request.data);
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Privacy-friendly usage logging
function logUsageEvent(event, data) {
  // In a production version, you might want to collect anonymous usage statistics
  // to improve the extension. For now, we'll just log to console.
  console.log('MindFlow Usage:', event, data);
  
  // Example events:
  // - text_enhanced: { wordCount, processingTime, complianceScore }
  // - voice_recorded: { duration, transcriptionAccuracy }
  // - error_occurred: { errorType, context }
}

// Initialize icon state on startup
chrome.storage.sync.get(['mindflowEnabled'], (result) => {
  updateIcon(result.mindflowEnabled !== false);
});

console.log('MindFlow: Background script loaded');