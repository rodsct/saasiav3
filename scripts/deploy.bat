@echo off
REM SaaS v3 Production Deployment Script for Windows

echo 🚀 Starting SaaS v3 deployment...

REM Check if .env.production exists
if not exist ".env.production" (
    echo ❌ Error: .env.production file not found!
    echo Please copy .env.production.example and configure your environment variables.
    exit /b 1
)

echo ✅ Environment file found

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose -f docker-compose.prod.yml down --remove-orphans

REM Build and start services
echo 🏗️ Building and starting services...
docker-compose -f docker-compose.prod.yml up -d --build

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
:waitloop
timeout /t 2 /nobreak >nul
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U saasiav3 -d saasiav3 >nul 2>&1
if errorlevel 1 (
    echo Database is not ready yet. Waiting...
    goto waitloop
)

echo ✅ Database is ready

REM Run database migrations
echo 🗄️ Running database migrations...
docker-compose -f docker-compose.prod.yml exec app npx prisma db push

REM Create admin user
echo 👤 Creating admin user...
docker-compose -f docker-compose.prod.yml exec app curl -X POST http://localhost:3000/api/debug/create-test-user

REM Check application health
echo 🔍 Checking application health...
timeout /t 10 /nobreak >nul

curl -f http://localhost:3000/ >nul 2>&1
if errorlevel 1 (
    echo ⚠️ Application health check failed - checking logs...
    docker-compose -f docker-compose.prod.yml logs app --tail=20
) else (
    echo ✅ Application is healthy and running!
)

echo.
echo 🎉 Deployment completed!
echo.
echo 📋 Next steps:
echo 1. Application: http://localhost:3000
echo 2. Admin login: admin@aranza.io / test123
echo 3. Configure your domain in .env.production
echo 4. Set up SSL certificates in docker/nginx/ssl/
echo 5. Configure Stripe keys for payments
echo.
echo 📊 Check status:
echo   docker-compose -f docker-compose.prod.yml ps
echo   docker-compose -f docker-compose.prod.yml logs -f app
echo.