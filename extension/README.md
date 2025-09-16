# Vibe Mind Chrome Extension

A multimodal prompt enrichment tool with a collapsible sidebar panel interface for enhancing prompts across any website.

## Features

### 🎯 Smart Input Detection
- **Automatic Detection**: Detects when you focus on any text input field
- **Floating Button**: Shows an elegant floating button near active inputs
- **Selection Enhancement**: Enhance selected text within input fields
- **Universal Support**: Works on any website with text inputs

### ✨ Collapsible Sidebar Panel
- **Right-Side Panel**: Beautiful sidebar panel that opens on the right side of Chrome
- **Collapsible Interface**: Minimize/expand the panel to save screen space
- **Image Upload**: Drag & drop or click to upload images for analysis
- **AI Role Selection**: Choose from multiple designer perspectives
- **Recent Results**: Access your last 10 enhancement results
- **Resizable Panel**: Drag to adjust panel width (320px - 600px)

### 🤖 AI Enhancement Profiles
- **Product Designer**: General product design prompts
- **Fintech Designer**: Financial technology focused prompts
- **Gaming Designer**: Game design and UX prompts
- **Age Inclusive Designer**: Accessibility-focused design prompts

### 🖼️ Multimodal Analysis
- **Image Analysis**: Upload screenshots, mockups, or designs
- **Text Enhancement**: Improve existing prompts with AI
- **Combined Mode**: Analyze images with custom instructions
- **Multiple Formats**: Support for PNG, JPG, GIF up to 10MB

## Supported Platforms

Works on **any website** with text inputs, including:
- V0.dev
- Magic Pattern
- Lovable.dev
- Claude.ai
- ChatGPT
- Figma
- Linear
- Notion
- And many more!

## How It Works

### 1. Open the Sidebar Panel
- Click the Vibe Mind extension icon in Chrome's toolbar
- The sidebar panel opens on the right side of your browser
- The panel can be collapsed/expanded using the arrow button

### 2. Set Up Your API Key
- Enter your OpenAI API key in the setup section
- Click "Save & Validate" to test the connection
- The main features become available once validated

### 3. Choose Enhancement Method
- **Enhance Prompt**: Select text on any webpage and enhance it
- **Analyze Image**: Upload images for multimodal analysis
- **Open Full App**: Access the complete web application

### 4. Use Quick Actions
- **Copy Last Result**: Quickly copy your most recent enhancement
- **Settings**: Manage your API key and preferences
- **Clear Cache**: Remove stored data and recent results

### 5. Access Recent Results
- View your last 10 enhancement results
- Click any result to copy it to clipboard
- Results are automatically saved across sessions

## Installation

1. **Start the Backend**:
   ```bash
   cd backend
   python api_server.py
   ```

2. **Load Extension**: 
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `extension` folder

3. **Set API Key**: Click the extension icon to open the sidebar panel and enter your OpenAI API key

4. **Start Using**: The sidebar panel is now ready to enhance prompts and analyze images

## API Key Setup

You need an OpenAI API key:

1. Go to https://platform.openai.com/api-keys
2. Create a new API key (starts with "sk-")
3. Click the Vibe Mind extension icon
4. Enter your API key and click "Save & Validate"
5. The extension will test the key and confirm it works

## Usage Examples

### For Text Enhancement
1. Select text on any webpage
2. Open the Vibe Mind sidebar panel
3. Click "Enhance Prompt" 
4. The selected text is automatically processed and enhanced
5. Copy the result to clipboard or use it directly

### For Image Analysis
1. Open the Vibe Mind sidebar panel
2. Click "Analyze Image"
3. Upload a screenshot or mockup
4. Get a detailed design prompt automatically
5. Access the result from Recent Results section

### For Quick Access
1. Use keyboard shortcuts: Ctrl+E (enhance), Ctrl+I (image), Ctrl+[ (toggle panel)
2. Right-click context menu for quick actions
3. Access recent results for repeated use
4. Resize panel to fit your workflow

## Privacy & Security

- **Local Storage**: API key stored locally in your browser only
- **No Data Collection**: No user data is collected or stored
- **Direct API Calls**: Communications go directly to OpenAI via your local backend
- **Secure Processing**: All enhancement happens through OpenAI's secure API

## Requirements

- Chrome browser
- OpenAI API key with credits
- Local backend server running on `http://localhost:8000`

## Troubleshooting

### Extension Not Working
- Make sure you've set a valid OpenAI API key
- Check that the backend server is running (`python backend/api_server.py`)
- Try refreshing the page

### Sidebar Panel Not Opening
- Make sure you've clicked the extension icon in Chrome's toolbar
- Check if the extension is loaded and enabled in chrome://extensions/
- Try refreshing the page and clicking the icon again

### API Errors
- Verify your OpenAI API key is correct and has credits
- Check your internet connection
- Make sure backend server is running on port 8000

### Panel Not Responding
- Check browser console for JavaScript errors
- Ensure the extension is loaded and enabled
- Try disabling other extensions that might conflict
- Refresh the page and reopen the panel

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed troubleshooting steps.

## Development

To modify the extension:

1. Clone the repository
2. Edit files in the `extension/` directory:
   - `sidepanel.js`: Main sidebar panel functionality and logic
   - `sidepanel.css`: Styling for the sidebar panel interface
   - `sidepanel.html`: Sidebar panel HTML structure
   - `content.js`: Content script for webpage interaction
   - `content.css`: Styling for content script elements
   - `manifest.json`: Extension configuration
   - `background.js`: Background service worker
3. Load the extension in Chrome Developer Mode
4. Test the sidebar panel functionality

## Architecture

- **Sidebar Panel**: Collapsible right-side panel with full functionality
- **Content Script**: Detects text selection and webpage interactions
- **Background Worker**: Handles API calls, context menus, and panel opening
- **Backend Integration**: Communicates with local FastAPI server
- **Frontend Integration**: Shares components with React frontend

## Support

For issues or feature requests:
1. Check the troubleshooting guide
2. Review the console for error messages
3. Ensure your OpenAI API key is valid and has credits
4. Verify the backend server is running properly