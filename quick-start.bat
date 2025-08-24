@echo off
echo 🚀 Quick Start SaaS v3...

REM Kill everything
taskkill /f /im node.exe 2>nul
docker-compose down 2>nul
docker-compose -f docker-compose.dev.yml down 2>nul

REM Clean cache
cmd /c "rmdir /s /q .next 2>nul"

REM Start database
echo 🗄️  Starting database...
docker-compose -f docker-compose.dev.yml up -d postgres

REM Wait for database
echo ⏳ Waiting for database...
ping -n 20 127.0.0.1 > nul

REM Setup database
echo 🏗️  Database setup...
npx prisma db push --force-reset

REM Start with minimal logging
echo 🌐 Starting Next.js...
set NEXT_TELEMETRY_DISABLED=1
npm run dev