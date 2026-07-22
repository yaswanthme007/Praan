#!/bin/bash
echo "Starting PRAAN Industrial Safety Intelligence Platform..."

# Seed database
echo "[1/3] Seeding SQLite database..."
cd praan-backend
python -m seeds.seed
if [ $? -ne 0 ]; then
    echo "[WARNING] Failed to seed database."
fi

# Start FastAPI Backend in background
echo "[2/3] Launching FastAPI Backend on http://localhost:8000..."
python -m uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

# Start Next.js Frontend in background
echo "[3/3] Launching Next.js Frontend on http://localhost:3000..."
cd ../Praan
yarn dev &
FRONTEND_PID=$!

echo ""
echo "All services launched!"
echo "- Frontend: http://localhost:3000"
echo "- Backend REST API: http://localhost:8000/"
echo "- Backend Docs: http://localhost:8000/docs"
echo ""

# Trap exit signals to terminate child processes
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT TERM EXIT

# Keep script running to show logs
wait
