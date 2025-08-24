@echo off
echo 🚀 Starting SaaS v3 Complete Stack with Docker...

REM Clean everything first
echo 🧹 Cleaning up...
taskkill /f /im node.exe 2>nul || echo No Node.js processes
docker-compose down 2>nul || echo No containers to stop
docker-compose -f docker-compose.dev.yml down 2>nul || echo No dev containers to stop
docker-compose -f docker-compose.complete.yml down 2>nul || echo No complete containers to stop

REM Check Docker
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker not running. Start Docker first.
    pause
    exit /b 1
)

REM Clean Docker system
echo 🧽 Cleaning Docker system...
docker system prune -f

REM Build and start everything
echo 🐳 Building and starting complete stack...
docker-compose -f docker-compose.complete.yml up --build

pause