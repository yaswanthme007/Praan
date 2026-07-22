@echo off
echo Starting PRAAN Industrial Safety Intelligence Platform...

:: Seed database
echo [1/3] Seeding SQLite database...
cd praan-backend
python -m seeds.seed
if %errorlevel% neq 0 (
    echo [WARNING] Failed to seed database.
)

:: Start FastAPI Backend in new window
echo [2/3] Launching FastAPI Backend on http://localhost:8000...
start "PRAAN Backend" cmd /k "python -m uvicorn app.main:app --reload --port 8000"

:: Start Next.js Frontend in new window
echo [3/3] Launching Next.js Frontend on http://localhost:3000...
cd ..\Praan
start "PRAAN Frontend" cmd /k "yarn dev"

echo.
echo All services launched!
echo - Frontend: http://localhost:3000
echo - Backend REST API: http://localhost:8000/
echo - Backend Docs: http://localhost:8000/docs
echo.
pause
