# Vibe Mind Sidebar Extension - Installation Guide

## Quick Installation Steps

### 1. Start the Backend Server
```bash
cd backend
python api_server.py
```
The server should start on `http://localhost:8000`

### 2. Load the Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `extension` folder from this project
5. The Vibe Mind extension should now appear in your extensions list

### 3. Test the Sidebar Panel
1. Click the **Vibe Mind icon** in Chrome's toolbar (top-right area)
2. A sidebar panel should open on the right side of your browser
3. The panel will initially show the API Key setup section

### 4. Configure Your API Key
1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Enter your API key (starts with `sk-`) in the input field
3. Click **Save & Validate**
4. If successful, the main features will become available

### 5. Test the Features

#### Collapsible Panel
- Click the **◀** arrow button in the header to collapse/expand the panel
- The panel remembers its state across sessions

#### Text Enhancement
1. Go to any website and select some text
2. In the sidebar panel, click **Enhance Prompt**
3. The selected text should be enhanced and copied to clipboard

#### Image Analysis
1. In the sidebar panel, click **Analyze Image**
2. Select an image file from your computer
3. The image will be analyzed and a design prompt generated

#### Recent Results
- View your last 10 enhancement results in the Recent Results section
- Click any result to copy it to clipboard

#### Panel Resizing
- Hover over the right edge of the panel footer
- Drag to resize the panel width (320px - 600px)

## Troubleshooting

### Panel Not Opening
- Make sure the extension is enabled in `chrome://extensions/`
- Try refreshing the page and clicking the extension icon again
- Check the browser console for any error messages

### API Errors
- Verify your OpenAI API key is correct and has available credits
- Ensure the backend server is running on port 8000
- Check your internet connection

### Features Not Working
- Make sure you've entered a valid API key
- Check that the backend server is responding at `http://localhost:8000/api/health`
- Try refreshing the extension by clicking the refresh button in `chrome://extensions/`

## Development Testing

### Reload Extension After Changes
1. Go to `chrome://extensions/`
2. Find the Vibe Mind extension
3. Click the **refresh/reload** button
4. Test your changes

### Debug the Sidebar Panel
1. Right-click in the sidebar panel
2. Select **Inspect** to open developer tools
3. Check the Console tab for any JavaScript errors

### Debug Background Script
1. Go to `chrome://extensions/`
2. Find the Vibe Mind extension
3. Click **service worker** link
4. Check the Console for background script logs

## Features Overview

### Sidebar Panel Features
- ✅ Collapsible interface
- ✅ API key management
- ✅ Text enhancement
- ✅ Image analysis
- ✅ Recent results history
- ✅ Resizable panel width
- ✅ Keyboard shortcuts (Ctrl+E, Ctrl+I, Ctrl+[)
- ✅ Context menu integration
- ✅ Settings management
- ✅ Progress indicators
- ✅ Dark mode support

### Integration Features
- ✅ Works on any website
- ✅ Text selection detection
- ✅ Automatic clipboard copying
- ✅ Backend API integration
- ✅ Persistent settings storage
- ✅ Error handling and recovery

## Next Steps

After successful installation and testing:
1. Use the extension on various websites
2. Test different text selections and image uploads
3. Verify the collapsible functionality works smoothly
4. Check that results are saved and accessible
5. Test the resizing and keyboard shortcuts

The extension is now ready for use as a collapsible sidebar panel!
