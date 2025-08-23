@echo off
echo 🚀 Setting up SaaS v3 with Docker...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Copy environment file
if not exist .env (
    echo 📋 Creating .env file from Docker template...
    copy .env.docker .env
    echo ✅ .env file created. You can modify it if needed.
) else (
    echo ⚠️  .env file already exists. Keeping current configuration.
)

REM Start database only for development
echo 🗄️  Starting PostgreSQL database...
docker-compose -f docker-compose.dev.yml up -d postgres

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Install dependencies
echo 📦 Installing dependencies...
npm install --legacy-peer-deps

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npx prisma generate

REM Run database migrations
echo 🏗️  Running database migrations...
npx prisma migrate dev --name initial-setup

echo ✅ Setup complete!
echo.
echo 🎯 Next steps:
echo 1. Run: npm run dev
echo 2. Open: http://localhost:3000
echo 3. Sign up for an account
echo 4. Create your first chatbot with the n8n webhook
echo 5. Start uploading files to the downloads area
echo.
echo 🐳 To run everything with Docker:
echo    docker-compose up --build
echo.
echo 🛑 To stop the database:
echo    docker-compose -f docker-compose.dev.yml down