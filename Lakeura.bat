@echo off
setlocal

echo [lakeura] Setting up environment...

:: Create venv if it doesn't exist
if not exist .venv (
    echo [lakeura] Creating virtual environment...
    python -m venv .venv
)

:: Activate venv
call .venv\Scripts\activate.bat

:: Install requirements
echo [lakeura] Installing Python dependencies...
pip install -r requirements.txt --quiet

:: Create logs directory
if not exist logs mkdir logs

:: Start MCP server and capture PID
echo [lakeura] Starting MCP server on port 8000...
powershell -Command "$p = Start-Process -FilePath '.venv\Scripts\python.exe' -ArgumentList 'mcp/server.py' -WindowStyle Hidden -PassThru -RedirectStandardOutput 'logs\mcp.log' -RedirectStandardError 'logs\mcp.err'; $p.Id | Out-File -Encoding ascii 'logs\mcp.pid'"

:: Give MCP server a moment to bind
timeout /t 2 /nobreak >nul

:: Start FastAPI backend and capture PID
echo [lakeura] Starting backend on port 8080...
powershell -Command "$p = Start-Process -FilePath '.venv\Scripts\python.exe' -ArgumentList 'main.py' -WindowStyle Hidden -PassThru -RedirectStandardOutput 'logs\backend.log' -RedirectStandardError 'logs\backend.err'; $p.Id | Out-File -Encoding ascii 'logs\backend.pid'"

:: Give backend a moment to bind
timeout /t 2 /nobreak >nul

:: Start Electron frontend (Electron kills servers on close via PID files)
echo [lakeura] Starting frontend...
cd frontend
npm run dev

endlocal
