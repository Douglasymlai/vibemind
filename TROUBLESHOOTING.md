# Chrome Extension Troubleshooting Guide

## Common Issues and Solutions

### 1. Service Worker Registration Failed (Status Code: 15)

**Symptoms:**
- Extension fails to load
- Error message: "Service worker registration failed. Status code: 15"

**Solutions:**
1. **Check Permissions**: Ensure all required permissions are in manifest.json
2. **Reload Extension**: Go to `chrome://extensions/` and click the reload button
3. **Clear Extension Data**: Remove and re-add the extension
4. **Check Chrome Version**: Ensure you're using Chrome 88+ for Manifest V3 support

### 2. Context Menu Errors

**Symptoms:**
- Error: "Cannot read properties of undefined (reading 'onClicked')"
- Right-click menus don't appear

**Solutions:**
1. **Enable Context Menu Permission**: Check that `contextMenus` is in manifest permissions
2. **Restart Chrome**: Sometimes Chrome needs a restart to recognize new permissions
3. **Check Extension Settings**: Ensure the extension has permission to run on the current site

### 3. Backend Connection Issues

**Symptoms:**
- "Backend offline" message in popup
- Features don't work

**Solutions:**
1. **Start Backend Server**:
   ```bash
   cd backend
   python api_server.py
   ```
2. **Check Port**: Ensure backend is running on port 8000
3. **CORS Issues**: Backend should allow `chrome-extension://*` origins
4. **Firewall**: Check if firewall is blocking localhost connections

### 4. API Key Issues

**Symptoms:**
- "Please set your OpenAI API key" errors
- Analysis fails

**Solutions:**
1. **Valid API Key**: Ensure key starts with "sk-" and is active
2. **Storage Permission**: Check that `storage` permission is enabled
3. **Clear Storage**: Try removing and re-entering the API key

### 5. Content Script Not Injecting

**Symptoms:**
- No "✨ Enhance" buttons appear on websites
- Extension seems inactive on supported sites

**Solutions:**
1. **Check Site Permissions**: Ensure extension can run on the current site
2. **Reload Page**: Refresh the webpage after installing extension
3. **Check Supported Sites**: Extension only works on specific sites (V0, Claude, ChatGPT, etc.)
4. **Manual Injection**: Try using the extension popup instead

## Installation Steps

1. **Download/Clone the Project**
2. **Start Backend Server**:
   ```bash
   cd backend
   python api_server.py
   ```
3. **Load Extension in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension` folder
4. **Set API Key**: Click extension icon and enter your OpenAI API key

## Debugging Steps

### 1. Check Extension Console
- Right-click extension icon → "Inspect popup"
- Check for JavaScript errors in console

### 2. Check Background Script
- Go to `chrome://extensions/`
- Click "Inspect views: background page" (or "service worker")
- Check console for errors

### 3. Check Content Script
- Open developer tools on any webpage (F12)
- Go to Sources → Content Scripts
- Look for `content.js` and check for errors

### 4. Check Network Requests
- Open developer tools
- Go to Network tab
- Try using extension features and check for failed requests

## File Structure Check

Ensure your extension folder has these files:
```
extension/
├── manifest.json
├── popup.html
├── popup.js
├── popup.css
├── content.js
├── content.css
├── background.js
├── offscreen.html
├── icons/
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   └── icon-128.png
└── README.md
```

## Required Permissions

Your `manifest.json` should include:
```json
{
  "permissions": [
    "activeTab",
    "storage",
    "clipboardWrite",
    "contextMenus",
    "notifications",
    "scripting"
  ],
  "host_permissions": [
    "http://localhost:8000/*",
    "https://api.openai.com/*"
  ]
}
```

## Chrome Version Compatibility

- **Minimum Chrome Version**: 88 (for Manifest V3)
- **Recommended**: Chrome 100+ for full API support
- **Service Workers**: Requires Chrome 88+
- **Offscreen API**: Requires Chrome 109+

## Getting Help

If you're still having issues:

1. **Check Browser Console**: Look for specific error messages
2. **Verify Backend**: Test API endpoints directly in browser
3. **Test Permissions**: Try enabling all permissions temporarily
4. **Clean Install**: Remove extension completely and reinstall
5. **Chrome Update**: Ensure you're running the latest Chrome version

## Common Error Messages

| Error | Cause | Solution |
|-------|--------|----------|
| "Service worker registration failed" | Missing permissions or Chrome version | Update Chrome, check permissions |
| "Cannot read properties of undefined" | API not available | Check permissions, restart Chrome |
| "Backend offline" | Server not running | Start backend server |
| "Invalid API key" | Wrong or expired key | Check OpenAI API key |
| "Extension context invalidated" | Extension reloaded | Refresh page, try again |

## Development Mode

When developing:
1. Enable "Developer mode" in `chrome://extensions/`
2. Use "Reload" button after making changes
3. Check both popup and background script consoles
4. Test on multiple websites
5. Verify all permissions are working
