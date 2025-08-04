#!/usr/bin/env python3
"""
Financial Sorting App Launcher
This script starts both the React frontend and FastAPI backend automatically.
"""

import os
import sys
import subprocess
import time
import signal
import threading
import webbrowser
from pathlib import Path

class AppLauncher:
    def __init__(self):
        self.root_dir = Path(__file__).parent
        self.backend_dir = self.root_dir / "backend" / "venv"
        self.frontend_dir = self.root_dir / "react-app"
        self.backend_process = None
        self.frontend_process = None
        self.running = False

    def check_dependencies(self):
        """Check if all required dependencies are installed"""
        print("🔍 Checking dependencies...")
        
        # Check if backend virtual environment exists
        if not (self.backend_dir / "bin" / "activate").exists():
            print("❌ Backend virtual environment not found!")
            print("   Please run: cd backend && python -m venv venv")
            return False
        
        # Check if frontend node_modules exists
        if not (self.frontend_dir / "node_modules").exists():
            print("❌ Frontend dependencies not found!")
            print("   Please run: cd react-app && npm install")
            return False
        
        print("✅ Dependencies check passed!")
        return True

    def install_dependencies(self):
        """Install missing dependencies"""
        print("📦 Installing dependencies...")
        
        # Install backend dependencies
        if not (self.backend_dir / "bin" / "activate").exists():
            print("Creating backend virtual environment...")
            subprocess.run(["python", "-m", "venv", str(self.backend_dir)], cwd=self.root_dir / "backend")
        
        # Install frontend dependencies
        if not (self.frontend_dir / "node_modules").exists():
            print("Installing frontend dependencies...")
            subprocess.run(["npm", "install"], cwd=self.frontend_dir)
        
        print("✅ Dependencies installed!")

    def start_backend(self):
        """Start the FastAPI backend server"""
        print("🚀 Starting backend server...")
        
        # Activate virtual environment and start uvicorn
        if os.name == 'nt':  # Windows
            activate_script = self.backend_dir / "Scripts" / "activate.bat"
            python_exe = self.backend_dir / "Scripts" / "python.exe"
        else:  # Unix/Linux/macOS
            activate_script = self.backend_dir / "bin" / "activate"
            python_exe = self.backend_dir / "bin" / "python"
        
        # Install required Python packages if not already installed
        required_packages = ["fastapi", "uvicorn", "pandas", "pydantic"]
        for package in required_packages:
            try:
                subprocess.run([str(python_exe), "-m", "pip", "install", package], 
                             cwd=self.backend_dir, check=True, capture_output=True)
            except subprocess.CalledProcessError:
                print(f"⚠️  Warning: Could not install {package}")
        
        # Start the backend server
        self.backend_process = subprocess.Popen(
            [str(python_exe), "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"],
            cwd=self.backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait a moment for server to start
        time.sleep(3)
        
        if self.backend_process.poll() is None:
            print("✅ Backend server started on http://localhost:8000")
            return True
        else:
            print("❌ Failed to start backend server")
            return False

    def start_frontend(self):
        """Start the React frontend development server"""
        print("🚀 Starting frontend server...")
        
        self.frontend_process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=self.frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait a moment for server to start
        time.sleep(5)
        
        if self.frontend_process.poll() is None:
            print("✅ Frontend server started on http://localhost:5173")
            return True
        else:
            print("❌ Failed to start frontend server")
            return False

    def open_browser(self):
        """Open the application in the default browser"""
        print("🌐 Opening application in browser...")
        time.sleep(2)  # Give servers time to fully start
        webbrowser.open("http://localhost:5173")

    def signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        print("\n🛑 Shutting down servers...")
        self.stop_servers()
        sys.exit(0)

    def stop_servers(self):
        """Stop both frontend and backend servers"""
        if self.backend_process:
            self.backend_process.terminate()
            self.backend_process.wait()
            print("✅ Backend server stopped")
        
        if self.frontend_process:
            self.frontend_process.terminate()
            self.frontend_process.wait()
            print("✅ Frontend server stopped")

    def monitor_servers(self):
        """Monitor server processes and restart if needed"""
        while self.running:
            time.sleep(5)
            
            # Check backend
            if self.backend_process and self.backend_process.poll() is not None:
                print("⚠️  Backend server crashed, restarting...")
                self.start_backend()
            
            # Check frontend
            if self.frontend_process and self.frontend_process.poll() is not None:
                print("⚠️  Frontend server crashed, restarting...")
                self.start_frontend()

    def run(self):
        """Main launcher function"""
        print("🎯 Financial Sorting App Launcher")
        print("=" * 40)
        
        # Set up signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        # Check and install dependencies
        if not self.check_dependencies():
            print("\n📦 Installing missing dependencies...")
            self.install_dependencies()
        
        # Start servers
        backend_ok = self.start_backend()
        frontend_ok = self.start_frontend()
        
        if not backend_ok or not frontend_ok:
            print("❌ Failed to start servers. Please check the error messages above.")
            return
        
        # Open browser
        self.open_browser()
        
        # Start monitoring
        self.running = True
        monitor_thread = threading.Thread(target=self.monitor_servers, daemon=True)
        monitor_thread.start()
        
        print("\n🎉 Application is running!")
        print("📱 Frontend: http://localhost:5173")
        print("🔧 Backend API: http://localhost:8000")
        print("📚 API Documentation: http://localhost:8000/docs")
        print("\n💡 Press Ctrl+C to stop the servers")
        
        try:
            # Keep the main thread alive
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            pass
        finally:
            self.stop_servers()

def main():
    """Entry point"""
    launcher = AppLauncher()
    launcher.run()

if __name__ == "__main__":
    main() 