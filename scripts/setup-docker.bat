@echo off
echo 🚀 Setting up SaaS v3 with Docker...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Clean up any existing processes and containers
echo 🧹 Cleaning up existing processes...
taskkill /f /im node.exe 2>nul || echo No Node.js processes to kill
docker-compose down 2>nul || echo No containers to stop

REM Copy environment file
if not exist .env (
    echo 📋 Creating .env file from Docker template...
    copy .env.docker .env
    echo ✅ .env file created. You can modify it if needed.
) else (
    echo ⚠️  .env file already exists. Keeping current configuration.
)

REM Clear Next.js cache
echo 🗑️  Clearing Next.js cache...
rmdir /s /q .next 2>nul || echo No cache to clear

REM Start database only for development
echo 🗄️  Starting PostgreSQL database...
docker-compose -f docker-compose.dev.yml up -d postgres

REM Wait for database to be healthy
echo ⏳ Waiting for database to be ready...
:WAIT_FOR_DB
docker-compose -f docker-compose.dev.yml ps postgres | find "healthy" >nul
if %errorlevel% neq 0 (
    echo Still waiting for database...
    timeout /t 3 /nobreak >nul
    goto WAIT_FOR_DB
)
echo ✅ Database is ready!

REM Install dependencies
echo 📦 Installing dependencies...
npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    exit /b 1
)

REM Reset and push database schema
echo 🏗️  Setting up database schema...
npx prisma db push --force-reset
if %errorlevel% neq 0 (
    echo ❌ Failed to setup database
    exit /b 1
)

echo ✅ Setup complete!
echo.
echo 🎯 To start the application:
echo    npm run dev
echo.
echo 📱 Application will be available at:
echo    http://localhost:3000
echo.
echo 🛑 To stop everything:
echo    docker-compose -f docker-compose.dev.yml down