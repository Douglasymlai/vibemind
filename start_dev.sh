#!/bin/bash

# Vibe Mind Development Startup Script

echo "🧠 Starting Vibe Mind Development Environment..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3 first.${NC}"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd backend
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

# Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd ../frontend
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

# Go back to root directory
cd ..

echo ""
echo -e "${GREEN}🚀 Starting Services...${NC}"
echo "================================"

# Start backend server
echo -e "${BLUE}Starting FastAPI backend server on port 8000...${NC}"
if check_port 8000; then
    echo -e "${YELLOW}⚠️  Port 8000 is already in use. Skipping backend startup.${NC}"
else
    cd backend
    source venv/bin/activate
    python api_server.py &
    BACKEND_PID=$!
    cd ..
    echo -e "${GREEN}✅ Backend server started (PID: $BACKEND_PID)${NC}"
fi

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo -e "${BLUE}Starting React frontend server on port 3000...${NC}"
if check_port 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use. Skipping frontend startup.${NC}"
else
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    echo -e "${GREEN}✅ Frontend server started (PID: $FRONTEND_PID)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Vibe Mind Development Environment Ready!${NC}"
echo "=============================================="
echo ""
echo -e "${BLUE}📱 Frontend:${NC} http://localhost:3000"
echo -e "${BLUE}🔧 Backend API:${NC} http://localhost:8000"
echo -e "${BLUE}📚 API Docs:${NC} http://localhost:8000/docs"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked' and select the 'extension' folder"
echo "4. Set your OpenAI API key in the extension popup"
echo "5. Visit v0.dev, Claude.ai, or ChatGPT to test the extension"
echo ""
echo -e "${BLUE}🛑 To stop servers:${NC}"
echo "Press Ctrl+C to stop this script, or run:"
echo "pkill -f 'api_server.py'"
echo "pkill -f 'react-scripts start'"
echo ""

# Keep script running and handle cleanup
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping servers...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Backend server stopped${NC}"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Frontend server stopped${NC}"
    fi
    echo -e "${GREEN}👋 Goodbye!${NC}"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for user input
echo -e "${GREEN}Press Ctrl+C to stop all servers...${NC}"
while true; do
    sleep 1
done
