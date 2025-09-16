#!/bin/bash

# Stop Vibe Mind Backend Server

echo "🛑 Stopping Vibe Mind Backend Server..."

# Try graceful shutdown via API first
if curl -s -X POST http://localhost:8000/api/shutdown > /dev/null 2>&1; then
    echo "✅ Backend server stopped gracefully"
    sleep 2
else
    echo "⚠️ API shutdown failed, trying process kill..."
fi

# Kill any remaining uvicorn processes for this project
pkill -f "uvicorn.*api_server" && echo "✅ Backend process terminated" || echo "ℹ️ No backend process found"

echo "🏁 Backend shutdown complete"
