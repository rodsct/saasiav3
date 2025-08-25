#!/bin/bash

# SaaS v3 Production Deployment Script

set -e

echo "🚀 Starting SaaS v3 deployment..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please copy .env.production.example and configure your environment variables."
    exit 1
fi

# Load environment variables
source .env.production

# Check required environment variables
required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable $var is not set"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# Remove old images (optional - uncomment if you want to rebuild from scratch)
# echo "🗑️ Removing old images..."
# docker-compose -f docker-compose.prod.yml down --rmi all || true

# Build and start services
echo "🏗️ Building and starting services..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U saasiav3 -d saasiav3; do
    echo "Database is not ready yet. Waiting..."
    sleep 2
done

echo "✅ Database is ready"

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy || {
    echo "⚠️ Migrations failed, trying to push schema..."
    docker-compose -f docker-compose.prod.yml exec app npx prisma db push
}

# Create admin user
echo "👤 Creating admin user..."
docker-compose -f docker-compose.prod.yml exec app node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

async function createAdmin() {
    const prisma = new PrismaClient();
    try {
        const hashedPassword = await bcrypt.hash('admin123', 12);
        const subscriptionEndsAt = new Date();
        subscriptionEndsAt.setFullYear(subscriptionEndsAt.getFullYear() + 1);

        const admin = await prisma.user.upsert({
            where: { email: 'admin@aranza.io' },
            update: {
                subscription: 'PRO',
                subscriptionEndsAt: subscriptionEndsAt,
                role: 'ADMIN',
            },
            create: {
                email: 'admin@aranza.io',
                name: 'Administrator',
                password: hashedPassword,
                subscription: 'PRO',
                subscriptionEndsAt: subscriptionEndsAt,
                role: 'ADMIN',
            },
        });
        console.log('✅ Admin user created/updated:', admin.email);
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await prisma.\$disconnect();
    }
}

createAdmin();
" || echo "⚠️ Admin user creation skipped (may already exist)"

# Check application health
echo "🔍 Checking application health..."
sleep 10

if curl -f http://localhost:${APP_PORT:-3000}/api/health > /dev/null 2>&1; then
    echo "✅ Application is healthy and running!"
else
    echo "⚠️ Application health check failed - checking logs..."
    docker-compose -f docker-compose.prod.yml logs app --tail=20
fi

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Application: http://localhost:${APP_PORT:-3000}"
echo "2. Admin login: admin@aranza.io / admin123"
echo "3. Configure your domain in .env.production"
echo "4. Set up SSL certificates in docker/nginx/ssl/"
echo "5. Configure Stripe keys for payments"
echo ""
echo "📊 Check status:"
echo "  docker-compose -f docker-compose.prod.yml ps"
echo "  docker-compose -f docker-compose.prod.yml logs -f app"
echo ""