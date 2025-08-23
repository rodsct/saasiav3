# SaaS v3 - Docker Deployment Guide 🐳

## Quick Start

### 1. Setup with Database (Recommended)
```bash
# Windows
scripts\setup-docker.bat

# Linux/Mac
chmod +x scripts/setup-docker.sh && ./scripts/setup-docker.sh

# Start development
npm run dev
```

### 2. Full Docker Deployment
```bash
# Start all services
docker-compose up --build

# Or in background
docker-compose up -d --build
```

## What's Included

- **PostgreSQL 15**: Database with automatic initialization
- **Next.js App**: SaaS application with AI chatbot and downloads
- **Redis**: Session storage (optional)
- **Volume Persistence**: Data and uploads persist between restarts

## Environment Configuration

- **Development**: Uses `.env` with localhost database connection
- **Docker**: Uses `.env.docker` with container networking
- **Production**: Override environment variables as needed

## Default Configuration

- **Database**: `saasiav3:saasiav3_password@localhost:5432/saasiav3`
- **n8n Webhook**: `https://infra-v2-n8n-v2.uclxiv.easypanel.host/webhook/saasiav3`
- **App URL**: `http://localhost:3000`

## Available Services

After setup, access:
- **Main App**: http://localhost:3000
- **Chatbot Dashboard**: http://localhost:3000/chatbot
- **Downloads Area**: http://localhost:3000/downloads
- **Database**: localhost:5432 (from host)

## Docker Commands

```bash
# Start only database for development
docker-compose -f docker-compose.dev.yml up -d postgres

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Reset everything (⚠️ deletes data)
docker-compose down -v

# Rebuild containers
docker-compose build --no-cache
```

## Troubleshooting

**Database Connection Issues:**
- Ensure Docker is running
- Wait 10-15 seconds after starting PostgreSQL
- Check logs: `docker-compose logs postgres`

**Build Issues:**
- Clear Docker cache: `docker system prune -a`
- Rebuild: `docker-compose build --no-cache`

**Permission Issues:**
- Ensure uploads directory exists: `mkdir -p public/uploads`
- Check container logs: `docker-compose logs app`