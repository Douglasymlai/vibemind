# 🛠️ Vibe Mind Setup Guide

Complete setup instructions for the Vibe Mind multimodal prompt enrichment tool with Chrome extension support.

## 📋 Prerequisites

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **Chrome Browser** (for extension)
- **OpenAI API Key** ([Get one here](https://platform.openai.com))

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone and navigate to the project
cd /path/to/vibemind

# Run the automated setup script
./start_dev.sh
```

This script will:
- Install all dependencies
- Start the backend server (port 8000)
- Start the frontend server (port 3000)
- Provide extension installation instructions

### Option 2: Manual Setup

#### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
python api_server.py
```

The backend will be available at `http://localhost:8000`

#### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The frontend will be available at `http://localhost:3000`

#### 3. Chrome Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder from this project
5. The extension icon should appear in your toolbar

## 🔑 API Key Configuration

### Method 1: Through Extension Popup
1. Click the Vibe Mind extension icon
2. Enter your OpenAI API key in the popup
3. Click "Save & Validate"

### Method 2: Through Web Interface
1. Open `http://localhost:3000`
2. Click the settings icon in the top right
3. Enter your API key in the dialog

### Method 3: Environment Variable (Backend only)
```bash
export OPENAI_API_KEY=your_api_key_here
```

## 🧪 Testing the Setup

### 1. Test Backend API
```bash
curl http://localhost:8000/api/health
```

Should return: `{"status":"healthy","timestamp":"..."}`

### 2. Test Frontend
- Open `http://localhost:3000`
- You should see the Vibe Mind interface
- Try typing in the textarea to see the enhancement button appear

### 3. Test Chrome Extension
- Visit `https://v0.dev`, `https://claude.ai`, or `https://chatgpt.com`
- Look for "✨ Enhance" buttons on text inputs
- Or click the extension icon for the popup interface

## 📁 Project Structure

```
vibemind/
├── backend/
│   ├── api_server.py          # FastAPI server
│   ├── vibe_mind.py           # Core analysis logic
│   ├── chat_agent_with_image_analysis.py
│   ├── profiles/              # Design personas
│   ├── reports/               # Generated reports
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API service
│   │   └── ...
│   ├── public/
│   └── package.json
├── extension/
│   ├── manifest.json          # Extension configuration
│   ├── popup.html/js/css      # Extension popup
│   ├── content.js/css         # Website integration
│   ├── background.js          # Service worker
│   └── icons/
└── start_dev.sh              # Development startup script
```

## 🌐 Supported Websites

The Chrome extension automatically integrates with:
- **V0.dev** - Vercel's AI design tool
- **Claude.ai** - Anthropic's AI assistant
- **ChatGPT** - OpenAI's chat interface
- **Magic Pattern** - Design pattern generator
- **Lovable.dev** - AI app builder

## 🔧 Configuration

### Backend Configuration
- **Port**: 8000 (configurable in `api_server.py`)
- **CORS**: Configured for localhost:3000 and Chrome extensions
- **Profiles**: Stored in `backend/profiles/` as JSON files

### Frontend Configuration
- **Port**: 3000 (configurable in `package.json`)
- **API Base URL**: `http://localhost:8000/api`

### Extension Configuration
- **Manifest Version**: 3 (latest Chrome extension format)
- **Permissions**: activeTab, storage, clipboardWrite
- **Content Scripts**: Auto-inject on supported sites

## 🚨 Troubleshooting

### Common Issues

#### "Backend offline" in extension
- Ensure the backend server is running on port 8000
- Check that CORS is properly configured
- Verify no firewall is blocking the connection

#### "No API Key" error
- Make sure you've set your OpenAI API key
- Verify the key starts with "sk-"
- Check that the key has sufficient credits

#### Extension not loading
- Ensure you're using Chrome (not other browsers)
- Check that "Developer mode" is enabled
- Try reloading the extension from chrome://extensions/

#### Frontend build issues
- Delete `node_modules` and run `npm install` again
- Make sure you're using Node.js 16+
- Check for any missing dependencies

### Debug Mode

#### Backend Debug
```bash
cd backend
source venv/bin/activate
uvicorn api_server:app --reload --log-level debug
```

#### Frontend Debug
```bash
cd frontend
npm start
# Open browser dev tools for console logs
```

#### Extension Debug
- Open Chrome DevTools on any page
- Go to Sources → Content Scripts to debug content.js
- Right-click extension icon → "Inspect popup" to debug popup

## 📊 API Documentation

Once the backend is running, visit:
- **Interactive Docs**: `http://localhost:8000/docs`
- **OpenAPI Schema**: `http://localhost:8000/openapi.json`

## 🔄 Development Workflow

1. **Make changes** to backend/frontend/extension code
2. **Backend**: Server auto-reloads with uvicorn --reload
3. **Frontend**: React dev server auto-reloads
4. **Extension**: Click "Reload" in chrome://extensions/

## 📦 Production Deployment

### Backend Production
```bash
# Use a production WSGI server
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker api_server:app
```

### Frontend Production
```bash
cd frontend
npm run build
# Serve the build folder with a static server
```

### Extension Production
1. Update `manifest.json` with production URLs
2. Create a zip file of the extension folder
3. Submit to Chrome Web Store (if desired)

## 🆘 Support

If you encounter issues:
1. Check this setup guide
2. Review the troubleshooting section
3. Check the console logs in browser dev tools
4. Ensure all services are running on correct ports

## 🎯 Next Steps

After setup is complete:
1. **Customize profiles** in `backend/profiles/`
2. **Test on different websites** to see the extension in action
3. **Explore the API** at `http://localhost:8000/docs`
4. **Modify the UI** in the React frontend as needed
