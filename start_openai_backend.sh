#!/bin/bash

# Start OpenAI Backend Server for Vibe Mind Extension
# This script starts the new OpenAI-based backend that supports the Chrome extension

echo "🚀 Starting Vibe Mind OpenAI Backend Server..."

# Check if we're in the right directory
if [ ! -f "openai/api_server.py" ]; then
    echo "❌ Error: openai/api_server.py not found"
    echo "   Please run this script from the vibemind root directory"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed or not in PATH"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "openai/venv" ]; then
    echo "📦 Creating virtual environment..."
    cd openai
    python3 -m venv venv
    cd ..
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source openai/venv/bin/activate

# Install/update dependencies
echo "📦 Installing dependencies..."
cd openai
pip install -r requirements.txt
cd ..

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  Warning: OPENAI_API_KEY environment variable not set"
    echo "   The extension will prompt users to enter their API key"
    echo "   You can set it with: export OPENAI_API_KEY='your-key-here'"
    echo ""
fi

# Start the server
echo "🌐 Starting server on http://localhost:8000"
echo "   Press Ctrl+C to stop the server"
echo ""

cd openai
python api_server.py
