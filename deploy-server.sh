#!/bin/bash

# =============================================================================
# SERVER DEPLOYMENT SCRIPT
# Run this script on your production server to deploy the application
# =============================================================================

set -e  # Exit on any error

echo "🚀 Starting SaaS v3 Production Deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.production.template" ]; then
        echo "📋 Creating .env file from template..."
        cp .env.production.template .env
        echo "⚠️  IMPORTANT: Edit .env file with your production values before continuing!"
        echo "   - Replace 'tu-dominio.com' with your actual domain"
        echo "   - Generate secure NEXTAUTH_SECRET and SECRET values"
        echo "   - Configure OAuth credentials if needed"
        echo ""
        read -p "Press Enter after editing .env file to continue..."
    else
        echo "❌ .env.production.template not found. Cannot create .env file."
        exit 1
    fi
fi

# Validate critical environment variables
if grep -q "tu-dominio.com" .env; then
    echo "❌ Please update .env file with your actual domain name!"
    exit 1
fi

if grep -q "genera-un-secreto" .env; then
    echo "❌ Please update .env file with secure secret values!"
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Remove old images (optional - uncomment to clean up)
# echo "🗑️  Removing old images..."
# docker system prune -f

# Build and start containers
echo "🏗️  Building and starting containers..."
docker-compose up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
timeout=60
counter=0
while ! docker-compose exec -T postgres pg_isready -U saasiav3 -d saasiav3 > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ Database failed to start within $timeout seconds"
        docker-compose logs postgres
        exit 1
    fi
    echo "Still waiting for database..."
    sleep 2
    counter=$((counter + 2))
done
echo "✅ Database is ready!"

# Run database setup
echo "🏗️  Setting up database schema..."
docker-compose exec -T app npx prisma db push --force-reset

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your application should be running at:"
echo "   http://localhost:3000 (if testing locally)"
echo "   https://your-domain.com (in production)"
echo ""
echo "📝 Next steps:"
echo "1. Configure your reverse proxy (nginx/apache) to point to port 3000"
echo "2. Set up SSL certificates (Let's Encrypt recommended)"
echo "3. Configure your domain's DNS to point to this server"
echo "4. Test the application and create your first admin account"
echo ""
echo "🔍 To check logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"