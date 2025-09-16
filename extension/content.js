// Content script for Vibe Mind Chrome Extension
// Injects enhancement functionality into supported websites

class VibeMindContentScript {
    constructor() {
        this.isInjected = false;
        this.enhanceButton = null;
        this.activeInput = null;
        this.dialog = null;
        this.overlay = null;
        this.animationData = null;
        this.lottieAnimation = null;
        this.init();
    }

    init() {
        // Load Lottie library
        this.loadLottieLibrary();
        
        // Wait for page to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.injectEnhancementUI());
        } else {
            this.injectEnhancementUI();
        }

        // Listen for dynamic content changes
        this.observePageChanges();
        
        // Listen for input field focus/selection events
        this.setupInputDetection();
    }

    loadLottieLibrary() {
        // Check if Lottie is already loaded
        if (window.lottie) return;
        
        // Load Lottie from local extension file
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('lottie.min.js');
        script.onload = () => {
            console.log('Lottie library loaded successfully');
        };
        script.onerror = () => {
            console.warn('Failed to load Lottie library, using fallback animation');
        };
        document.head.appendChild(script);
    }

    injectEnhancementUI() {
        if (this.isInjected) return;

        const textAreas = this.findTextInputs();
        textAreas.forEach(textarea => this.addEnhancementButton(textarea));

        this.isInjected = true;
    }

    setupInputDetection() {
        // Listen for focus events on input fields
        document.addEventListener('focusin', (e) => {
            const target = e.target;
            if (this.isTextInput(target)) {
                this.showFloatingButton(target);
            }
        });

        // Listen for focus out events
        document.addEventListener('focusout', (e) => {
            // Delay hiding to allow clicking on the floating button
            setTimeout(() => {
                if (!this.isDialogOpen()) {
                    this.hideFloatingButton();
                }
            }, 100);
        });

        // Listen for selection changes
        document.addEventListener('selectionchange', () => {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const container = range.commonAncestorContainer;
                const element = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;
                
                if (this.isTextInput(element) && !selection.isCollapsed) {
                    this.showFloatingButton(element, true);
                }
            }
        });
    }

    isTextInput(element) {
        if (!element) return false;
        
        const tagName = element.tagName.toLowerCase();
        const type = element.type ? element.type.toLowerCase() : '';
        
        return (
            tagName === 'textarea' ||
            (tagName === 'input' && ['text', 'email', 'search', 'url'].includes(type)) ||
            element.contentEditable === 'true' ||
            element.hasAttribute('contenteditable')
        );
    }

    showFloatingButton(inputElement, hasSelection = false) {
        this.activeInput = inputElement;
        
        // Remove existing floating button
        this.hideFloatingButton();
        
        // Create floating button
        const button = document.createElement('button');
        button.className = 'vibe-mind-floating-btn';
        button.innerHTML = hasSelection ? '✨ Enhance Selection' : '✨ Enhance Prompt';
        button.title = 'Enhance with Vibe Mind AI';
        
        // Style the floating button
        Object.assign(button.style, {
            position: 'absolute',
            zIndex: '999999',
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
            transition: 'all 0.2s ease',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
        });

        // Add hover effects
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-2px) scale(1.02)';
            button.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.5)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0) scale(1)';
            button.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
        });

        // Add click handler
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showEnhancementDialog();
        });

        // Position the button
        this.positionFloatingButton(inputElement, button);
        
        // Store reference
        this.enhanceButton = button;
        
        // Auto-hide after delay if no interaction
        setTimeout(() => {
            if (this.enhanceButton === button && !this.isDialogOpen()) {
                this.hideFloatingButton();
            }
        }, 5000);
    }

    positionFloatingButton(inputElement, button) {
        const rect = inputElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        // Position above the input field
        const top = rect.top + scrollTop - 45;
        const left = rect.right + scrollLeft - 150;
        
        button.style.top = `${Math.max(10, top)}px`;
        button.style.left = `${Math.min(window.innerWidth - 170, Math.max(10, left))}px`;
        
        document.body.appendChild(button);
    }

    hideFloatingButton() {
        if (this.enhanceButton) {
            this.enhanceButton.remove();
            this.enhanceButton = null;
        }
    }

    isDialogOpen() {
        return this.dialog && this.dialog.style.display !== 'none';
    }

    showEnhancementDialog() {
        this.hideFloatingButton();
        this.createDialog();
        this.showDialog();
    }

    createDialog() {
        if (this.dialog) {
            this.dialog.remove();
        }

        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'vibe-mind-overlay';
        Object.assign(this.overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: '999998',
            backdropFilter: 'blur(4px)',
            opacity: '0',
            transition: 'opacity 0.3s ease'
        });

        // Create dialog
        this.dialog = document.createElement('div');
        this.dialog.className = 'vibe-mind-dialog';
        this.dialog.innerHTML = this.getDialogHTML();
        
        Object.assign(this.dialog.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) scale(0.9)',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            zIndex: '999999',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            opacity: '0',
            transition: 'all 0.3s ease',
            overflow: 'hidden'
        });

        // Add event listeners
        this.setupDialogEventListeners();
        
        // Append to body
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.dialog);
        
        // Close on overlay click
        this.overlay.addEventListener('click', () => this.hideDialog());
    }

    getDialogHTML() {
        const inputText = this.getInputText(this.activeInput);
        const hasSelection = window.getSelection().toString().trim().length > 0;
        const selectedText = hasSelection ? window.getSelection().toString().trim() : '';
        
        return `
            <div class="vibe-mind-dialog-header">
                <h3>Prompt Enhancement</h3>
                <button class="vibe-mind-close-btn">×</button>
            </div>
            
            <div class="vibe-mind-dialog-content">
                ${this.activeInput && this.getInputPreview() ? `
                    <div class="vibe-mind-input-preview">
                        <label>Current Input:</label>
                        <div class="preview-text">${this.getInputPreview()}</div>
                    </div>
                ` : ''}
                
                <div class="vibe-mind-image-upload">
                    <label class="vibe-mind-section-label">Image Upload (Optional):</label>
                    <div class="vibe-mind-upload-area" id="uploadArea">
                        <div class="upload-icon">📁</div>
                        <div class="upload-text">
                            <div>Drop an image here or click to browse</div>
                            <div class="upload-subtext">PNG, JPG, GIF up to 10MB</div>
                        </div>
                        <input type="file" id="imageInput" accept="image/*" style="display: none;">
                    </div>
                    <div class="vibe-mind-image-preview" id="imagePreview" style="display: none;">
                        <img id="previewImage" alt="Preview">
                        <div class="image-info">
                            <span id="imageName"></span>
                            <button class="remove-image" id="removeImage">×</button>
                        </div>
                    </div>
                </div>
                
                <div class="vibe-mind-roles-section">
                    <label class="vibe-mind-section-label">AI Role Selection:</label>
                    <div class="vibe-mind-roles">
                        <label class="vibe-mind-role-option">
                            <input type="radio" name="role" value="product_designer" checked>
                            <span>Product Designer</span>
                        </label>
                        <label class="vibe-mind-role-option">
                            <input type="radio" name="role" value="fintech_designer">
                            <span>Fintech Designer</span>
                        </label>
                        <label class="vibe-mind-role-option">
                            <input type="radio" name="role" value="gaming_designer">
                            <span>Gaming Designer</span>
                        </label>
                        <label class="vibe-mind-role-option">
                            <input type="radio" name="role" value="age_inclusive_designer">
                            <span>Age Inclusive Designer</span>
                        </label>
                    </div>
                </div>
            </div>
            
            <div class="vibe-mind-dialog-footer">
                <button class="vibe-mind-btn-secondary" id="cancelBtn">Cancel</button>
                <button class="vibe-mind-btn-primary" id="enhanceBtn">
                    <span class="btn-icon">✨</span>
                    <span class="btn-text">Enhance Prompt</span>
                </button>
            </div>
            
            <div class="vibe-mind-loading" id="loadingState" style="display: none;">
                <div class="loading-lottie" id="loadingLottie"></div>
            </div>
            
            <div class="vibe-mind-result" id="resultState" style="display: none;">
                <div class="result-header">
                    <h4>Enhanced Prompt</h4>
                    <button class="copy-btn" id="copyResult">Copy</button>
                </div>
                <div class="result-content">
                    <textarea id="resultText" readonly></textarea>
                </div>
                <div class="result-actions">
                    <button class="vibe-mind-btn-secondary" id="backBtn">Back</button>
                    <button class="vibe-mind-btn-primary" id="applyBtn">Apply to Input</button>
                </div>
            </div>
        `;
    }

    getInputText(element) {
        if (!element) return '';
        
        if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
            return element.value;
        } else if (element.contentEditable === 'true') {
            return element.textContent || element.innerText;
        }
        return '';
    }

    getInputPreview() {
        const text = this.getInputText(this.activeInput);
        if (!text) return '';
        
        const maxLength = 100;
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    setupDialogEventListeners() {
        // Close button
        this.dialog.querySelector('.vibe-mind-close-btn').addEventListener('click', () => this.hideDialog());
        
        
        // Image upload
        const uploadArea = this.dialog.querySelector('#uploadArea');
        const imageInput = this.dialog.querySelector('#imageInput');
        
        uploadArea.addEventListener('click', () => imageInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = '#f0f9ff';
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.backgroundColor = '';
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.backgroundColor = '';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleImageUpload(files[0]);
            }
        });
        
        imageInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleImageUpload(e.target.files[0]);
            }
        });
        
        // Remove image
        this.dialog.querySelector('#removeImage').addEventListener('click', () => this.removeImage());
        
        // Action buttons
        this.dialog.querySelector('#cancelBtn').addEventListener('click', () => this.hideDialog());
        this.dialog.querySelector('#enhanceBtn').addEventListener('click', () => this.enhancePrompt());
        this.dialog.querySelector('#copyResult').addEventListener('click', () => this.copyResult());
        this.dialog.querySelector('#backBtn').addEventListener('click', () => this.showMainContent());
        this.dialog.querySelector('#applyBtn').addEventListener('click', () => this.applyToInput());
    }


    handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select an image file', 'error');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            this.showNotification('Image size should be less than 10MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = this.dialog.querySelector('#imagePreview');
            const previewImage = this.dialog.querySelector('#previewImage');
            const imageName = this.dialog.querySelector('#imageName');
            const uploadArea = this.dialog.querySelector('#uploadArea');
            
            previewImage.src = e.target.result;
            imageName.textContent = file.name;
            
            uploadArea.style.display = 'none';
            preview.style.display = 'block';
            
            // Store file reference
            this.uploadedFile = file;
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        const preview = this.dialog.querySelector('#imagePreview');
        const uploadArea = this.dialog.querySelector('#uploadArea');
        
        preview.style.display = 'none';
        uploadArea.style.display = 'flex';
        
        this.uploadedFile = null;
    }

    async enhancePrompt() {
        const selectedRole = this.dialog.querySelector('input[name="role"]:checked').value;
        const inputText = this.getInputText(this.activeInput);
        
        // Get API key
        const result = await chrome.storage.local.get(['openai_api_key']);
        if (!result.openai_api_key) {
            this.showNotification('Please set your OpenAI API key in the extension popup first', 'error');
            return;
        }
        
        // Show loading state
        this.showLoadingState();
        
        try {
            let response;
            
            if (this.uploadedFile) {
                // Image analysis
                const formData = new FormData();
                formData.append('file', this.uploadedFile);
                formData.append('message', inputText || 'Analyze this image and create a detailed design prompt');
                formData.append('profile_key', selectedRole);
                formData.append('api_key', result.openai_api_key);
                
                response = await fetch('http://localhost:8000/api/analyze-upload', {
                    method: 'POST',
                    body: formData,
                });
            } else {
                // Text-only enhancement
                response = await fetch('http://localhost:8000/api/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: inputText || 'Create a detailed design prompt',
                        profile_key: selectedRole,
                        api_key: result.openai_api_key
                    }),
                });
            }
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Enhancement failed');
            }
            
            const data = await response.json();
            const enhancedPrompt = data.summarized_report || data.structured_result?.analysis_result || 'Enhancement completed';
            
            // Show result
            this.showResult(enhancedPrompt);
            
        } catch (error) {
            console.error('Enhancement failed:', error);
            this.showNotification(error.message || 'Enhancement failed. Please try again.', 'error');
            this.showMainContent();
        }
    }

    async loadAnimationData() {
        if (this.animationData) return;
        
        try {
            // Load from extension's local copy
            const response = await fetch(chrome.runtime.getURL('loading.json'));
            if (response.ok) {
                this.animationData = await response.json();
                console.log('Loaded loading.json animation data successfully');
                return;
            }
        } catch (error) {
            console.log('Could not load local loading.json, trying fallback');
        }
        
        try {
            // Fallback: try to load from localhost (if frontend is running)
            const response = await fetch('http://localhost:3000/loading.json');
            if (response.ok) {
                this.animationData = await response.json();
                console.log('Loaded loading.json from localhost fallback');
                return;
            }
        } catch (error) {
            console.log('Could not load loading.json, using fallback');
            // Use a simple fallback animation data if the file is not available
            this.animationData = null;
        }
    }

    async showLoadingState() {
        this.dialog.querySelector('.vibe-mind-dialog-content').style.display = 'none';
        this.dialog.querySelector('.vibe-mind-dialog-footer').style.display = 'none';
        this.dialog.querySelector('#loadingState').style.display = 'flex';
        this.dialog.querySelector('#resultState').style.display = 'none';
        
        // Load and start Lottie animation
        await this.loadAnimationData();
        this.startLottieAnimation();
    }

    startLottieAnimation() {
        const lottieContainer = this.dialog.querySelector('#loadingLottie');
        if (!lottieContainer) return;
        
        // Clear any existing animation
        if (this.lottieAnimation) {
            this.lottieAnimation.destroy();
            this.lottieAnimation = null;
        }
        
        if (this.animationData && window.lottie) {
            // Use Lottie animation from loading.json
            console.log('Starting Lottie animation with loading.json data');
            this.lottieAnimation = window.lottie.loadAnimation({
                container: lottieContainer,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                animationData: this.animationData
            });
        } else {
            // Fallback to CSS animation if loading.json or lottie library not available
            console.log('Using fallback CSS animation - loading.json or lottie library not available');
            lottieContainer.innerHTML = '<div class="loading-fallback">Generating...</div>';
        }
    }

    stopLottieAnimation() {
        if (this.lottieAnimation) {
            this.lottieAnimation.destroy();
            this.lottieAnimation = null;
        }
    }

    showResult(enhancedPrompt) {
        this.stopLottieAnimation();
        this.dialog.querySelector('.vibe-mind-dialog-content').style.display = 'none';
        this.dialog.querySelector('.vibe-mind-dialog-footer').style.display = 'none';
        this.dialog.querySelector('#loadingState').style.display = 'none';
        this.dialog.querySelector('#resultState').style.display = 'block';
        
        this.dialog.querySelector('#resultText').value = enhancedPrompt;
        this.enhancedResult = enhancedPrompt;
    }

    showMainContent() {
        this.stopLottieAnimation();
        this.dialog.querySelector('.vibe-mind-dialog-content').style.display = 'block';
        this.dialog.querySelector('.vibe-mind-dialog-footer').style.display = 'flex';
        this.dialog.querySelector('#loadingState').style.display = 'none';
        this.dialog.querySelector('#resultState').style.display = 'none';
    }

    async copyResult() {
        try {
            await navigator.clipboard.writeText(this.enhancedResult);
            
            const copyBtn = this.dialog.querySelector('#copyResult');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.style.backgroundColor = '#10b981';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = '';
            }, 2000);
        } catch (error) {
            this.showNotification('Failed to copy to clipboard', 'error');
        }
    }

    applyToInput() {
        if (this.activeInput && this.enhancedResult) {
            this.setInputText(this.activeInput, this.enhancedResult);
            this.hideDialog();
            this.showNotification('Enhanced prompt applied successfully!', 'success');
        }
    }

    setInputText(element, text) {
        if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
            element.value = text;
            // Trigger input event to notify frameworks
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (element.contentEditable === 'true') {
            element.textContent = text;
            // Trigger input event
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    showDialog() {
        // Animate in
        requestAnimationFrame(() => {
            this.overlay.style.opacity = '1';
            this.dialog.style.opacity = '1';
            this.dialog.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    }

    hideDialog() {
        if (this.overlay && this.dialog) {
            this.stopLottieAnimation();
            this.overlay.style.opacity = '0';
            this.dialog.style.opacity = '0';
            this.dialog.style.transform = 'translate(-50%, -50%) scale(0.9)';
            
            setTimeout(() => {
                if (this.overlay) this.overlay.remove();
                if (this.dialog) this.dialog.remove();
                this.overlay = null;
                this.dialog = null;
                this.activeInput = null;
                this.uploadedFile = null;
                this.enhancedResult = null;
            }, 300);
        }
    }

    // Legacy methods for backward compatibility
    findTextInputs() {
        const selectors = [
            'textarea',
            'input[type="text"]',
            '[contenteditable="true"]',
            // Specific selectors for popular platforms
            '.prompt-textarea', // V0.dev
            '.input-field', // Magic Pattern
            '.chat-input', // ChatGPT
            '.ProseMirror' // Claude
        ];

        const elements = [];
        selectors.forEach(selector => {
            const found = document.querySelectorAll(selector);
            found.forEach(el => {
                // Filter out very small inputs (likely not for prompts)
                if (el.offsetWidth > 200 && el.offsetHeight > 30) {
                    elements.push(el);
                }
            });
        });

        return elements;
    }

    addEnhancementButton(inputElement) {
        // Skip if button already exists or if we're using the new floating system
        if (inputElement.dataset.vibeMindEnhanced) return;

        // Mark as enhanced to avoid duplicate processing
        inputElement.dataset.vibeMindEnhanced = 'true';
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `vibe-mind-notification vibe-mind-${type}`;
        notification.textContent = message;

        // Style notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '1000001',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        });

        // Set background color based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        notification.style.background = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    observePageChanges() {
        // Watch for new text inputs added dynamically
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const textInputs = this.findTextInputs();
                        textInputs.forEach(input => {
                            if (!input.dataset.vibeMindEnhanced) {
                                this.addEnhancementButton(input);
                            }
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Initialize content script
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new VibeMindContentScript();
    });
} else {
    new VibeMindContentScript();
}