@echo off
echo 🚀 Starting SaaS v3 Complete Stack...

REM Kill any existing processes
echo 🧹 Cleaning up...
taskkill /f /im node.exe 2>nul || echo No Node.js processes running
docker-compose down 2>nul || echo No containers to stop

REM Check Docker
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker not running. Start Docker first.
    exit /b 1
)

REM Start PostgreSQL
echo 🗄️  Starting database...
docker-compose -f docker-compose.dev.yml up -d postgres

REM Wait for database
echo ⏳ Waiting for database (30 seconds)...
timeout /t 30 /nobreak >nul

REM Setup database
echo 🏗️  Setting up database...
npx prisma db push --force-reset

REM Start Next.js on port 3000
echo 🌐 Starting Next.js on port 3000...
npm run dev

pause