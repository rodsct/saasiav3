@echo off
echo 🚀 Starting SaaS v3 Project...

REM Clean up first
echo 🧹 Cleaning up...
taskkill /f /im node.exe 2>nul
docker-compose down 2>nul
docker-compose -f docker-compose.dev.yml down 2>nul

REM Start PostgreSQL
echo 🗄️  Starting PostgreSQL...
docker-compose -f docker-compose.dev.yml up -d postgres

REM Wait 15 seconds for PostgreSQL
echo ⏳ Waiting 15 seconds for database...
timeout /t 15 /nobreak

REM Setup database schema
echo 🏗️  Setting up database...
npx prisma db push --force-reset

REM Install dependencies if needed
echo 📦 Checking dependencies...
npm install --legacy-peer-deps

REM Clear Next.js cache
echo 🗑️  Clearing cache...
rmdir /s /q .next 2>nul

REM Start Next.js
echo 🌐 Starting Next.js on port 3000...
echo ✅ Application will be available at: http://localhost:3000
echo.
npm run dev