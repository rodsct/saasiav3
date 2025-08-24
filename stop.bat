@echo off
echo 🛑 Stopping SaaS v3 Complete Stack...

REM Kill Node.js processes
echo 🧹 Stopping Next.js server...
taskkill /f /im node.exe 2>nul || echo No Node.js processes to kill

REM Stop Docker containers
echo 🐳 Stopping Docker containers...
docker-compose down
docker-compose -f docker-compose.dev.yml down

REM Clean up ports
echo 🧽 Cleaning up ports...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /pid %%a /f 2>nul || echo Port 3000 already free
)

echo ✅ All services stopped!
pause