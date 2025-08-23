#!/bin/bash

echo "🚀 Setting up SaaS v3 with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Copy environment file
if [ ! -f .env ]; then
    echo "📋 Creating .env file from Docker template..."
    cp .env.docker .env
    echo "✅ .env file created. You can modify it if needed."
else
    echo "⚠️  .env file already exists. Keeping current configuration."
fi

# Start database only for development
echo "🗄️  Starting PostgreSQL database..."
docker-compose -f docker-compose.dev.yml up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🏗️  Running database migrations..."
npx prisma migrate dev --name initial-setup

# Create a sample chatbot with the n8n webhook
echo "🤖 Creating sample chatbot configuration..."
echo "
Sample chatbot will be available after you sign up and create one with:
- Name: SaaS v3 Assistant
- Webhook: https://infra-v2-n8n-v2.uclxiv.easypanel.host/webhook/saasiav3
"

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Run: npm run dev"
echo "2. Open: http://localhost:3000"
echo "3. Sign up for an account"
echo "4. Create your first chatbot with the n8n webhook"
echo "5. Start uploading files to the downloads area"
echo ""
echo "🐳 To run everything with Docker:"
echo "   docker-compose up --build"
echo ""
echo "🛑 To stop the database:"
echo "   docker-compose -f docker-compose.dev.yml down"