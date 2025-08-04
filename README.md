# Financial Sorting App

A comprehensive financial data sorting and classification application with a React frontend and FastAPI backend.

## Quick Start

You can now run the entire application with a single command using one of the provided launcher scripts:

### Option 1: Python Launcher (Recommended)
```bash
python3 run_app.py
```

### Option 2: Shell Script (Unix/Linux/macOS)
```bash
./run_app.sh
```

## What the Launcher Does

The launcher automatically:

1. ✅ **Checks Dependencies** - Verifies Python, Node.js, and npm are installed
2. 📦 **Installs Dependencies** - Sets up virtual environment and installs required packages
3. 🚀 **Starts Backend** - Launches the FastAPI server on port 8000
4. 🚀 **Starts Frontend** - Launches the React development server on port 5173
5. 🌐 **Opens Browser** - Automatically opens the application in your default browser
6. 🔄 **Monitors Servers** - Automatically restarts servers if they crash
7. 🛑 **Graceful Shutdown** - Properly stops all servers when you press Ctrl+C

## Manual Setup (if needed)

If you prefer to set up manually or the launcher doesn't work:

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install fastapi uvicorn pandas pydantic
cd venv
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd react-app
npm install
npm run dev
```

## Application URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Features

- 📊 **CSV Upload & Processing** - Upload financial data in CSV format
- 🏷️ **Automatic Classification** - Automatically classify expenses and income
- 📁 **File Management** - Organize files into folders
- 📈 **Data Visualization** - View classified data with totals
- 🔄 **Real-time Updates** - Live reload for development

## File Structure

```
FinancialSortingApp/
├── run_app.py          # Python launcher script
├── run_app.sh          # Shell launcher script
├── backend/
│   └── venv/          # Backend virtual environment
│       ├── main.py     # FastAPI server
│       ├── classification_module.py
│       └── data_display_module.py
└── react-app/         # React frontend
    ├── src/
    │   ├── components/
    │   └── App.tsx
    └── package.json
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   - The launcher will show an error if ports 8000 or 5173 are already in use
   - Stop any existing servers or change ports in the launcher scripts

2. **Permission Denied**
   - Make sure the shell script is executable: `chmod +x run_app.sh`

3. **Dependencies Not Found**
   - The launcher will automatically install missing dependencies
   - If it fails, try running the manual setup steps above

4. **Virtual Environment Issues**
   - Delete the `backend/venv` folder and let the launcher recreate it

### Getting Help

If you encounter issues:

1. Check the console output for error messages
2. Verify Python 3.8+ and Node.js 14+ are installed
3. Try the manual setup steps
4. Check the API documentation at http://localhost:8000/docs when the backend is running

## Development

The launcher is designed for easy development:

- **Hot Reload**: Both frontend and backend support hot reloading
- **Auto-restart**: Servers automatically restart if they crash
- **Graceful Shutdown**: Press Ctrl+C to properly stop all servers

## Production

For production deployment, consider:

- Using a production WSGI server like Gunicorn
- Building the React app with `npm run build`
- Setting up proper environment variables
- Using a reverse proxy like Nginx 