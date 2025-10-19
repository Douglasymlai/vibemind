// Sidepanel script for Vibe Mind Chrome Extension

// Load config
let API_BASE_URL = 'https://vibemind-production.up.railway.app/api';
let FRONTEND_URL = 'http://localhost:3000';

// Try to load from config.js if available
try {
    if (typeof CONFIG !== 'undefined') {
        API_BASE_URL = CONFIG.API_BASE_URL;
        FRONTEND_URL = CONFIG.FRONTEND_URL;
    }
} catch (e) {
    console.log('Using default config');
}

class SidePanelManager {
    constructor() {
        this.recentResults = [];
        this.currentWidth = 400;
        this.minWidth = 320;
        this.maxWidth = 600;
        this.init();
    }

    async init() {
        this.detectAndApplyTheme();
        this.setupEventListeners();
        this.loadSettings();
        await this.checkApiKeyStatus();
        await this.checkBackendConnection();
        this.loadRecentResults();
    }

    detectAndApplyTheme() {
        // Check for dark mode preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }

        // Listen for changes to dark mode preference
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', (e) => {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            });
        }
    }

    setupEventListeners() {
        // Section toggles
        document.querySelectorAll('.section-toggle').forEach(toggle => {
            toggle.addEventListener('click', this.toggleSection.bind(this));
        });

        // Section headers (for collapsible sections)
        document.querySelectorAll('.section-header').forEach(header => {
            if (header.querySelector('.section-toggle')) {
                header.addEventListener('click', (e) => {
                    if (e.target.classList.contains('section-toggle')) return;
                    const toggle = header.querySelector('.section-toggle');
                    if (toggle) toggle.click();
                });
            }
        });

        // API Key management
        document.getElementById('toggleApiKey').addEventListener('click', this.toggleApiKeyVisibility);
        document.getElementById('saveApiKey').addEventListener('click', this.saveApiKey.bind(this));
        document.getElementById('apiKeyInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveApiKey();
            }
        });

        // Feature buttons
        document.getElementById('enhancePrompt').addEventListener('click', this.enhancePrompt.bind(this));

        // Quick actions
        document.getElementById('openSettings').addEventListener('click', this.openSettings.bind(this));
        document.getElementById('clearCache').addEventListener('click', this.clearCache.bind(this));

        // Legal links
        document.getElementById('privacyPolicyBtn').addEventListener('click', this.openPrivacyPolicy.bind(this));
        document.getElementById('termsOfServiceBtn').addEventListener('click', this.openTermsOfService.bind(this));

        // Error handling
        document.getElementById('retryBtn').addEventListener('click', this.retry.bind(this));

        // Resize functionality
        this.setupResizeHandle();

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));

        // Auto-save settings
        window.addEventListener('beforeunload', this.saveSettings.bind(this));
    }

    setupResizeHandle() {
        const resizeHandle = document.getElementById('resizeHandle');
        let isResizing = false;
        let startX = 0;
        let startWidth = 0;

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = this.currentWidth;
            document.body.style.cursor = 'col-resize';
            document.addEventListener('mousemove', handleResize);
            document.addEventListener('mouseup', stopResize);
        });

        const handleResize = (e) => {
            if (!isResizing) return;

            const deltaX = startX - e.clientX; // Reverse direction for right-side panel
            const newWidth = Math.max(this.minWidth, Math.min(this.maxWidth, startWidth + deltaX));

            this.currentWidth = newWidth;
            document.body.style.width = `${newWidth}px`;
        };

        const stopResize = () => {
            isResizing = false;
            document.body.style.cursor = '';
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', stopResize);
            this.saveSettings();
        };
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + E: Enhance prompt
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            this.enhancePrompt();
        }

        // Ctrl/Cmd + I: Analyze image
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            this.analyzeImage();
        }

    }


    toggleSection(e) {
        e.stopPropagation();
        const toggle = e.target;
        const targetId = toggle.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
            const isCollapsed = targetSection.classList.contains('collapsed');
            targetSection.classList.toggle('collapsed', !isCollapsed);
            toggle.textContent = isCollapsed ? '−' : '+';
        }
    }

    toggleApiKeyVisibility() {
        const input = document.getElementById('apiKeyInput');
        const toggleBtn = document.getElementById('toggleApiKey');

        if (input.type === 'password') {
            input.type = 'text';
            toggleBtn.textContent = '🙈';
        } else {
            input.type = 'password';
            toggleBtn.textContent = '👁️';
        }
    }

    async saveApiKey() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        const saveBtn = document.getElementById('saveApiKey');
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            this.showError('Please enter an API key');
            return;
        }

        if (!apiKey.startsWith('sk-')) {
            this.showError('OpenAI API keys should start with "sk-"');
            return;
        }

        saveBtn.textContent = 'Validating...';
        saveBtn.disabled = true;
        this.showProgress(0.3);

        try {
            const response = await fetch(`${API_BASE_URL}/set-api-key`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ api_key: apiKey }),
            });

            this.showProgress(0.7);

            if (response.ok) {
                // Store API key
                await chrome.storage.local.set({ openai_api_key: apiKey });

                // Update UI
                this.updateApiKeyStatus(true);
                this.showMainSection();

                // Show success message briefly
                saveBtn.textContent = '✅ Saved';
                this.showProgress(1.0);

                setTimeout(() => {
                    saveBtn.textContent = 'Save & Validate';
                    this.hideProgress();
                }, 2000);
            } else {
                const error = await response.json();
                throw new Error(error.detail || 'Invalid API key');
            }
        } catch (error) {
            this.showError(error.message || 'Failed to validate API key');
            this.hideProgress();
        } finally {
            saveBtn.disabled = false;
            if (saveBtn.textContent === 'Validating...') {
                saveBtn.textContent = 'Save & Validate';
                this.hideProgress();
            }
        }
    }

    async checkApiKeyStatus() {
        const result = await chrome.storage.local.get(['openai_api_key']);
        const hasApiKey = !!result.openai_api_key;

        this.updateApiKeyStatus(hasApiKey);

        if (hasApiKey) {
            document.getElementById('apiKeyInput').value = result.openai_api_key;
            this.showMainSection();
        } else {
            this.showApiKeySection();
        }
    }

    updateApiKeyStatus(connected) {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');

        if (connected) {
            statusIndicator.classList.add('connected');
            statusText.textContent = 'API Key Set';
        } else {
            statusIndicator.classList.remove('connected');
            statusText.textContent = 'No API Key';
        }
    }

    async checkBackendConnection() {
        const connectionStatus = document.getElementById('connectionStatus');

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${API_BASE_URL}/health`, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                connectionStatus.textContent = 'Service connected';
                connectionStatus.style.color = '#10b981';
            } else {
                throw new Error('Backend not responding');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                connectionStatus.textContent = 'Backend timeout - check server';
            } else {
                connectionStatus.textContent = 'Backend offline - start server';
            }
            connectionStatus.style.color = '#ef4444';
        }
    }

    showApiKeySection() {
        document.getElementById('apiKeySection').style.display = 'block';
        document.getElementById('mainSection').style.display = 'none';
        document.getElementById('quickActionsSection').style.display = 'none';
        document.getElementById('recentResultsSection').style.display = 'none';
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('errorSection').style.display = 'none';
    }

    showMainSection() {
        document.getElementById('apiKeySection').style.display = 'none';
        document.getElementById('mainSection').style.display = 'block';
        document.getElementById('quickActionsSection').style.display = 'block';
        document.getElementById('recentResultsSection').style.display = 'block';
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('errorSection').style.display = 'none';
    }

    showLoadingSection() {
        document.getElementById('apiKeySection').style.display = 'none';
        document.getElementById('mainSection').style.display = 'none';
        document.getElementById('quickActionsSection').style.display = 'none';
        document.getElementById('recentResultsSection').style.display = 'none';
        document.getElementById('loadingSection').style.display = 'block';
        document.getElementById('errorSection').style.display = 'none';
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('apiKeySection').style.display = 'none';
        document.getElementById('mainSection').style.display = 'none';
        document.getElementById('quickActionsSection').style.display = 'none';
        document.getElementById('recentResultsSection').style.display = 'none';
        document.getElementById('loadingSection').style.display = 'none';
        document.getElementById('errorSection').style.display = 'block';
    }

    showProgress(percentage) {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = `${percentage * 100}%`;
        }
    }

    hideProgress() {
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.style.width = '0%';
        }
    }

    async enhancePrompt() {
        try {
            // Get selected text from current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    const selection = window.getSelection().toString();
                    return selection || document.activeElement?.value || '';
                }
            });

            const selectedText = results[0]?.result || '';

            if (!selectedText.trim()) {
                this.showError('Please select some text or focus on a text input first');
                return;
            }

            this.showLoadingSection();
            this.showProgress(0.2);

            // Get API key
            const result = await chrome.storage.local.get(['openai_api_key']);
            const apiKey = result.openai_api_key;

            this.showProgress(0.4);

            // Call API
            const response = await fetch(`${API_BASE_URL}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: selectedText,
                    profile_key: 'product_designer',
                    api_key: apiKey
                }),
            });

            this.showProgress(0.8);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Enhancement failed');
            }

            const data = await response.json();
            const enhancedPrompt = data.summarized_report || data.structured_result?.analysis_result || 'Enhancement completed';

            // Store result for copying and recent results
            await this.storeResult(enhancedPrompt, 'Enhanced Prompt');

            // Copy to clipboard
            await navigator.clipboard.writeText(enhancedPrompt);

            this.showProgress(1.0);

            // Show success and return to main
            this.showMainSection();
            document.getElementById('copyToClipboard').disabled = false;

            // Show temporary success message
            this.showTemporarySuccess('enhancePrompt', 'Enhanced & Copied!', 'Prompt ready to use');

            this.hideProgress();

        } catch (error) {
            this.showError(error.message || 'Failed to enhance prompt');
            this.hideProgress();
        }
    }

    async analyzeImage() {
        try {
            // Create file input
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';

            input.onchange = async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                this.showLoadingSection();
                this.showProgress(0.2);

                try {
                    // Get API key
                    const result = await chrome.storage.local.get(['openai_api_key']);
                    const apiKey = result.openai_api_key;

                    this.showProgress(0.4);

                    // Create form data
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('message', 'Analyze this image and create a detailed design prompt');
                    formData.append('profile_key', 'product_designer');
                    formData.append('api_key', apiKey);

                    // Call API
                    const response = await fetch(`${API_BASE_URL}/analyze-upload`, {
                        method: 'POST',
                        body: formData,
                    });

                    this.showProgress(0.8);

                    if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.detail || 'Analysis failed');
                    }

                    const data = await response.json();
                    const analysisResult = data.summarized_report || data.structured_result?.analysis_result || 'Analysis completed';

                    // Store result and copy to clipboard
                    await this.storeResult(analysisResult, `Image Analysis: ${file.name}`);
                    await navigator.clipboard.writeText(analysisResult);

                    this.showProgress(1.0);

                    // Show success
                    this.showMainSection();
                    document.getElementById('copyToClipboard').disabled = false;

                    // Show temporary success message
                    this.showTemporarySuccess('analyzeImage', 'Analysis Complete!', 'Results copied to clipboard');

                    this.hideProgress();

                } catch (error) {
                    this.showError(error.message || 'Failed to analyze image');
                    this.hideProgress();
                }
            };

            input.click();

        } catch (error) {
            this.showError(error.message || 'Failed to analyze image');
        }
    }

    async openFullApp() {
        chrome.tabs.create({ url: FRONTEND_URL });
    }

    openPrivacyPolicy() {
        chrome.tabs.create({ url: 'http://vibemind.fun/privacy-policy' });
    }

    openTermsOfService() {
        chrome.tabs.create({ url: 'http://vibemind.fun/terms-of-service' });
    }

    async copyToClipboard() {
        try {
            const result = await chrome.storage.local.get(['last_result']);
            if (result.last_result) {
                await navigator.clipboard.writeText(result.last_result);

                // Show success feedback
                const copyBtn = document.getElementById('copyToClipboard');
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '✅ Copied!';

                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    }

    openSettings() {
        this.showApiKeySection();
    }

    async clearCache() {
        try {
            await chrome.storage.local.clear();
            this.recentResults = [];
            this.updateRecentResults();

            // Show success feedback
            const clearBtn = document.getElementById('clearCache');
            const originalText = clearBtn.textContent;
            clearBtn.textContent = '✅ Cleared!';

            setTimeout(() => {
                clearBtn.textContent = originalText;
            }, 2000);

            // Reset to API key section
            this.showApiKeySection();
        } catch (error) {
            console.error('Failed to clear cache:', error);
        }
    }

    retry() {
        this.init();
    }

    showTemporarySuccess(elementId, title, desc) {
        const element = document.getElementById(elementId);
        const originalHTML = element.innerHTML;

        element.innerHTML = `
            <div class="feature-icon">✅</div>
            <div class="feature-text">
                <div class="feature-title">${title}</div>
                <div class="feature-desc">${desc}</div>
            </div>
        `;

        setTimeout(() => {
            element.innerHTML = originalHTML;
        }, 3000);
    }

    async storeResult(result, title) {
        const resultItem = {
            id: Date.now(),
            title: title,
            content: result,
            timestamp: new Date().toISOString(),
            preview: result.substring(0, 100) + (result.length > 100 ? '...' : '')
        };

        this.recentResults.unshift(resultItem);
        if (this.recentResults.length > 10) {
            this.recentResults = this.recentResults.slice(0, 10);
        }

        // Store in Chrome storage
        await chrome.storage.local.set({
            last_result: result,
            recent_results: this.recentResults
        });

        this.updateRecentResults();
    }

    async loadRecentResults() {
        try {
            const result = await chrome.storage.local.get(['recent_results']);
            if (result.recent_results) {
                this.recentResults = result.recent_results;
                this.updateRecentResults();
            }
        } catch (error) {
            console.error('Failed to load recent results:', error);
        }
    }

    updateRecentResults() {
        const resultsList = document.getElementById('recentResultsList');

        if (this.recentResults.length === 0) {
            resultsList.innerHTML = '<p class="no-results">No recent results</p>';
            return;
        }

        resultsList.innerHTML = this.recentResults.map(result => `
            <div class="result-item" data-result-id="${result.id}">
                <div class="result-time">${new Date(result.timestamp).toLocaleString()}</div>
                <div class="result-text">${result.preview}</div>
            </div>
        `).join('');

        // Add click handlers for result items
        resultsList.querySelectorAll('.result-item').forEach(item => {
            item.addEventListener('click', async () => {
                const resultId = parseInt(item.getAttribute('data-result-id'));
                const result = this.recentResults.find(r => r.id === resultId);
                if (result) {
                    await navigator.clipboard.writeText(result.content);

                    // Visual feedback
                    item.style.background = 'rgba(102, 126, 234, 0.2)';
                    setTimeout(() => {
                        item.style.background = '';
                    }, 500);
                }
            });
        });
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['sidepanel_settings']);
            if (result.sidepanel_settings) {
                const settings = result.sidepanel_settings;
                this.currentWidth = settings.width || 400;

                document.body.style.width = `${this.currentWidth}px`;
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    async saveSettings() {
        try {
            await chrome.storage.local.set({
                sidepanel_settings: {
                    width: this.currentWidth
                }
            });
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }
}

// Initialize sidepanel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SidePanelManager();
});
