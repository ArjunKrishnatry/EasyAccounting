#!/bin/bash

# Financial Sorting App Launcher (Shell Version)
# This script starts both the React frontend and FastAPI backend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}🎯${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend/venv"
FRONTEND_DIR="$SCRIPT_DIR/react-app"

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        print_success "Backend server stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        print_success "Frontend server stopped"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_error "Python 3 is not installed. Please install Python 3 and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

print_status "Financial Sorting App Launcher"
echo "========================================"

# Check and create backend virtual environment
if [ ! -d "$BACKEND_DIR" ]; then
    print_warning "Backend virtual environment not found. Creating..."
    cd "$SCRIPT_DIR/backend"
    python3 -m venv venv
    print_success "Backend virtual environment created"
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd "$BACKEND_DIR"
source bin/activate
pip install fastapi uvicorn pandas pydantic --quiet
print_success "Backend dependencies installed"

# Check and install frontend dependencies
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    print_warning "Frontend dependencies not found. Installing..."
    cd "$FRONTEND_DIR"
    npm install --silent
    print_success "Frontend dependencies installed"
fi

# Start backend server
print_status "Starting backend server..."
cd "$BACKEND_DIR"
source bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    print_error "Failed to start backend server"
    exit 1
fi
print_success "Backend server started on http://localhost:8000"

# Start frontend server
print_status "Starting frontend server..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    print_error "Failed to start frontend server"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi
print_success "Frontend server started on http://localhost:5173"

# Open browser
print_status "Opening application in browser..."
sleep 2
if command -v open &> /dev/null; then
    open "http://localhost:5173"
elif command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:5173"
elif command -v start &> /dev/null; then
    start "http://localhost:5173"
fi

echo ""
print_success "Application is running!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "💡 Press Ctrl+C to stop the servers"

# Wait for user to stop the servers
wait 