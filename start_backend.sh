#!/bin/bash

# Start Vibe Mind Backend Server

echo "🚀 Starting Vibe Mind Backend Server..."

cd "$(dirname "$0")/backend"

# Check if requirements are installed
if ! python3 -c "import fastapi, uvicorn" 2>/dev/null; then
    echo "📦 Installing requirements..."
    pip3 install -r requirements.txt
fi

echo "🌐 Starting server on http://localhost:8000"
echo "📚 API documentation available at http://localhost:8000/docs"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start the server
uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload
