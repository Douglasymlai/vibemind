// Background service worker for Vibe Mind Chrome Extension

class VibeMindBackground {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Handle extension installation
        chrome.runtime.onInstalled.addListener(this.onInstalled.bind(this));

        // Handle action clicks to open sidepanel
        chrome.action.onClicked.addListener(this.onActionClicked.bind(this));

        // Handle context menu clicks (with safety check)
        if (chrome.contextMenus && chrome.contextMenus.onClicked) {
            chrome.contextMenus.onClicked.addListener(this.onContextMenuClicked.bind(this));
        }

        // Handle messages from content scripts and sidepanel
        chrome.runtime.onMessage.addListener(this.onMessage.bind(this));

        // Handle tab updates to inject content script
        chrome.tabs.onUpdated.addListener(this.onTabUpdated.bind(this));

        // Handle extension startup/shutdown
        chrome.runtime.onStartup.addListener(this.onStartup.bind(this));
        chrome.runtime.onSuspend.addListener(this.onSuspend.bind(this));
        
        // Handle when extension is disabled/removed
        if (chrome.management && chrome.management.onDisabled) {
            chrome.management.onDisabled.addListener(this.onExtensionDisabled.bind(this));
        }
    }

    onInstalled(details) {
        console.log('Vibe Mind extension installed:', details.reason);

        // Create context menu items
        this.createContextMenus();

        // Set default storage values
        chrome.storage.local.set({
            vibe_mind_settings: {
                auto_inject: true,
                default_profile: 'product_designer',
                show_notifications: true
            }
        });
    }

    createContextMenus() {
        // Check if contextMenus API is available
        if (!chrome.contextMenus) {
            console.warn('Context menus not available');
            return;
        }

        try {
            // Remove existing menus first
            chrome.contextMenus.removeAll(() => {
                // Main menu
                chrome.contextMenus.create({
                    id: 'vibe-mind-main',
                    title: 'Vibe Mind',
                    contexts: ['selection', 'editable']
                });

                // Enhance selected text
                chrome.contextMenus.create({
                    id: 'vibe-mind-enhance',
                    parentId: 'vibe-mind-main',
                    title: 'Enhance Selected Text',
                    contexts: ['selection']
                });

                // Analyze image
                chrome.contextMenus.create({
                    id: 'vibe-mind-analyze-image',
                    parentId: 'vibe-mind-main',
                    title: 'Analyze Image',
                    contexts: ['image']
                });

                // Open full app
                chrome.contextMenus.create({
                    id: 'vibe-mind-open-app',
                    parentId: 'vibe-mind-main',
                    title: 'Open Full App',
                    contexts: ['all']
                });
            });
        } catch (error) {
            console.error('Failed to create context menus:', error);
        }
    }

    async onActionClicked(tab) {
        // Open sidepanel when extension icon is clicked
        try {
            await chrome.sidePanel.open({ tabId: tab.id });
        } catch (error) {
            console.error('Failed to open sidepanel:', error);
            // Fallback: try to open sidepanel globally
            try {
                await chrome.sidePanel.open({ windowId: tab.windowId });
            } catch (fallbackError) {
                console.error('Failed to open sidepanel globally:', fallbackError);
                this.showNotification('Failed to open sidepanel', 'error');
            }
        }
    }

    async onContextMenuClicked(info, tab) {
        try {
            switch (info.menuItemId) {
                case 'vibe-mind-enhance':
                    await this.enhanceSelectedText(info, tab);
                    break;
                case 'vibe-mind-analyze-image':
                    await this.analyzeImage(info, tab);
                    break;
                case 'vibe-mind-open-app':
                    await this.openFullApp();
                    break;
            }
        } catch (error) {
            console.error('Context menu action failed:', error);
            this.showNotification('Action failed: ' + error.message, 'error');
        }
    }

    async enhanceSelectedText(info, tab) {
        const selectedText = info.selectionText;
        
        if (!selectedText || !selectedText.trim()) {
            this.showNotification('No text selected', 'warning');
            return;
        }

        // Check if API key is set
        const result = await chrome.storage.local.get(['openai_api_key']);
        if (!result.openai_api_key) {
            this.showNotification('Please set your OpenAI API key first', 'warning');
            await this.openSidePanel(tab);
            return;
        }

        try {
            // Show loading notification
            this.showNotification('Enhancing text...', 'info');

            // Call API
            const response = await fetch('http://localhost:8000/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: selectedText,
                    profile_key: 'product_designer',
                    api_key: result.openai_api_key
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Enhancement failed');
            }

            const data = await response.json();
            const enhancedText = data.summarized_report || data.structured_result?.analysis_result || selectedText;

            // Copy to clipboard
            await this.copyToClipboard(enhancedText);

            // Store result
            await chrome.storage.local.set({ last_result: enhancedText });

            this.showNotification('Text enhanced and copied to clipboard!', 'success');

        } catch (error) {
            console.error('Enhancement failed:', error);
            this.showNotification('Enhancement failed: ' + error.message, 'error');
        }
    }

    async analyzeImage(info, tab) {
        const imageUrl = info.srcUrl;
        
        if (!imageUrl) {
            this.showNotification('No image URL found', 'warning');
            return;
        }

        // Check if API key is set
        const result = await chrome.storage.local.get(['openai_api_key']);
        if (!result.openai_api_key) {
            this.showNotification('Please set your OpenAI API key first', 'warning');
            await this.openSidePanel(tab);
            return;
        }

        try {
            // Show loading notification
            this.showNotification('Analyzing image...', 'info');

            // Call API
            const response = await fetch('http://localhost:8000/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image_url: imageUrl,
                    message: 'Analyze this image and create a detailed design prompt',
                    profile_key: 'product_designer',
                    api_key: result.openai_api_key
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Analysis failed');
            }

            const data = await response.json();
            const analysisResult = data.summarized_report || data.structured_result?.analysis_result || 'Analysis completed';

            // Copy to clipboard
            await this.copyToClipboard(analysisResult);

            // Store result
            await chrome.storage.local.set({ last_result: analysisResult });

            this.showNotification('Image analyzed and results copied to clipboard!', 'success');

        } catch (error) {
            console.error('Analysis failed:', error);
            this.showNotification('Analysis failed: ' + error.message, 'error');
        }
    }

    async openFullApp() {
        chrome.tabs.create({ url: 'http://localhost:3000' });
    }

    async copyToClipboard(text) {
        try {
            // Try using the clipboard API directly (works in newer Chrome versions)
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return;
            }
        } catch (error) {
            console.log('Direct clipboard access failed, trying offscreen method');
        }

        // Fallback: Use offscreen document for clipboard access
        try {
            // Check if offscreen API is available
            if (chrome.offscreen) {
                try {
                    await chrome.offscreen.createDocument({
                        url: 'offscreen.html',
                        reasons: ['CLIPBOARD'],
                        justification: 'Copy enhanced text to clipboard'
                    });
                } catch (error) {
                    // Document may already exist, that's okay
                }

                // Send message to offscreen document
                chrome.runtime.sendMessage({
                    type: 'copy-to-clipboard',
                    text: text
                });
            } else {
                // Offscreen API not available, show notification instead
                this.showNotification('Text ready! Please copy manually from the extension popup.', 'info');
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            this.showNotification('Copy failed. Please try again from the extension popup.', 'error');
        }
    }

    onMessage(message, sender, sendResponse) {
        switch (message.type) {
            case 'get-api-key':
                chrome.storage.local.get(['openai_api_key']).then(result => {
                    sendResponse({ apiKey: result.openai_api_key });
                });
                return true; // Will respond asynchronously

            case 'set-api-key':
                chrome.storage.local.set({ openai_api_key: message.apiKey }).then(() => {
                    sendResponse({ success: true });
                });
                return true;

            case 'show-notification':
                this.showNotification(message.text, message.type);
                break;

            default:
                console.log('Unknown message type:', message.type);
        }
    }

    onTabUpdated(tabId, changeInfo, tab) {
        // Inject content script when tab is loaded
        if (changeInfo.status === 'complete' && tab.url) {
            const supportedSites = [
                'v0.dev',
                'magicpattern.design',
                'lovable.dev',
                'claude.ai',
                'chatgpt.com',
                'chat.openai.com',
                'gemini.google.com',
                'figma.com',
                'linear.app',
                'notion.so'
            ];

            const isSupportedSite = supportedSites.some(site => tab.url.includes(site));
            
            if (isSupportedSite) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                }).catch(error => {
                    // Ignore errors (script may already be injected)
                    console.log('Content script injection skipped:', error.message);
                });

                chrome.scripting.insertCSS({
                    target: { tabId: tabId },
                    files: ['content.css']
                }).catch(error => {
                    console.log('CSS injection skipped:', error.message);
                });
            }
        }
    }

    async openSidePanel(tab) {
        try {
            await chrome.sidePanel.open({ tabId: tab.id });
        } catch (error) {
            console.error('Failed to open sidepanel:', error);
            // Fallback: try to open sidepanel globally
            try {
                await chrome.sidePanel.open({ windowId: tab.windowId });
            } catch (fallbackError) {
                console.error('Failed to open sidepanel globally:', fallbackError);
                this.showNotification('Failed to open sidepanel', 'error');
            }
        }
    }

    showNotification(message, type = 'info') {
        try {
            if (chrome.notifications && chrome.notifications.create) {
                const iconMap = {
                    success: 'icons/icon-32.png',
                    error: 'icons/icon-32.png',
                    warning: 'icons/icon-32.png',
                    info: 'icons/icon-32.png'
                };

                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: iconMap[type],
                    title: 'Vibe Mind',
                    message: message
                });
            } else {
                console.log(`Vibe Mind ${type}:`, message);
            }
        } catch (error) {
            console.error('Failed to show notification:', error);
            console.log(`Vibe Mind ${type}:`, message);
        }
    }

    // Handle extension startup
    onStartup() {
        console.log('Vibe Mind extension starting up');
        // Backend will be started manually by user when needed
    }

    // Handle extension suspend (when browser closes or extension is disabled)
    onSuspend() {
        console.log('Vibe Mind extension suspending - stopping backend');
        this.stopBackendServer();
    }

    // Handle extension being disabled
    onExtensionDisabled(info) {
        if (info.id === chrome.runtime.id) {
            console.log('Vibe Mind extension disabled - stopping backend');
            this.stopBackendServer();
        }
    }

    // Stop the backend server
    async stopBackendServer() {
        try {
            // First try to gracefully shutdown via API
            const response = await fetch('http://localhost:8000/api/shutdown', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'}
            }).catch(() => null);

            if (response && response.ok) {
                console.log('Backend server stopped gracefully');
                return;
            }

            // If API shutdown fails, try to kill the process
            // Note: This requires native messaging host for full functionality
            console.log('Attempting to stop backend server process');
            
            // Send message to any active tabs to notify backend shutdown
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach(tab => {
                    chrome.tabs.sendMessage(tab.id, {
                        type: 'BACKEND_SHUTDOWN'
                    }).catch(() => {
                        // Ignore errors for tabs that don't have content script
                    });
                });
            });

        } catch (error) {
            console.error('Error stopping backend server:', error);
        }
    }

    // Check if backend is running
    async isBackendRunning() {
        try {
            const response = await fetch('http://localhost:8000/api/health');
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Initialize background script
new VibeMindBackground();
