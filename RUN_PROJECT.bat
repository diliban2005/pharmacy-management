@echo off
title Pharmacy Management System - Launcher
color 0A
echo ===================================================
echo   PHARMACY MANAGEMENT SYSTEM - 1-CLICK LAUNCHER
echo ===================================================
echo.

echo [1/3] Checking and freeing ports 5000 and 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1

echo [2/3] Starting Backend Server on port 5000...
start "Pharmacy - Backend API (Port 5000)" cmd /k "cd /d %~dp0backend && npm start"

echo [3/3] Starting Frontend App on port 3000...
start "Pharmacy - Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo Waiting 5 seconds for servers to initialize...
timeout /t 5 /nobreak >nul

echo Opening browser at http://localhost:3000...
start http://localhost:3000

echo.
echo ===================================================
echo   System running! Press any key to close launcher.
echo ===================================================
pause >nul
