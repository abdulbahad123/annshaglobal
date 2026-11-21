@echo off
title ANNSHA GLOBAL - Local Server Runner
echo ====================================================
echo Starting Annsha Global Backend and Frontend...
echo ====================================================

start "Annsha Global - Backend (Port 5000)" cmd /k "cd /d %~dp0server && node server.js"
timeout /t 2 /nobreak > nul
start "Annsha Global - Frontend (Port 5173)" cmd /k "cd /d %~dp0client && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo Both servers started!
echo Frontend: http://127.0.0.1:5173
echo Backend:  http://127.0.0.1:5000
echo.
pause

