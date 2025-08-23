# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SaaS v3 is an AI-powered platform built with Next.js 15, featuring chatbot integration with n8n webhooks, downloads management, authentication, payment processing, and blog functionality. The project uses Docker for easy deployment and PostgreSQL for data persistence.

## Development Commands

```bash
# Quick setup with Docker database
scripts\setup-docker.bat  # Windows
./scripts/setup-docker.sh # Linux/Mac

# Install dependencies (React 19 requires legacy peer deps flag)
npm install --legacy-peer-deps

# Database operations
npx prisma migrate dev        # Run migrations
npx prisma generate          # Generate client
npx prisma studio           # Database GUI

# Development server
npm run dev

# Build application (includes Prisma client generation)
npm run build

# Production server
npm start

# Linting
npm run lint

# Docker commands
docker-compose up --build                    # Full Docker deployment
docker-compose -f docker-compose.dev.yml up -d postgres  # Database only
```

## Architecture Overview

### Core Tech Stack
- **Next.js 15** with App Router (`src/app/`)
- **TypeScript** with path mapping (`@/*` → `./src/*`)
- **Docker** with PostgreSQL, Redis, and application containers
- **Prisma** with PostgreSQL for database operations
- **NextAuth** for authentication (credentials, GitHub, Google, email magic links)
- **n8n Integration** via webhooks for AI chatbot responses
- **File Management** with secure upload/download system
- **Stripe** for payment processing
- **Tailwind CSS** with TailGrids components for styling
- **MDX** for blog content rendering

### Key Directory Structure
- `src/app/` - App Router pages and API routes
  - `api/chatbot/` - Chatbot and n8n webhook endpoints
  - `api/downloads/` - File upload/download endpoints
- `src/components/` - Reusable UI components organized by feature
  - `Chatbot/` - Chat interface and dashboard components
  - `Downloads/` - File management components
- `src/utils/` - Utility functions (auth, email, markdown, database)
- `src/types/` - TypeScript type definitions (including chatbot, download)
- `src/stripe/` - Stripe configuration and pricing data
- `prisma/` - Database schema and migrations
- `docker/` - Docker configuration files
- `public/uploads/` - File storage directory
- `markdown/blogs/` - MDX blog content

### Authentication Flow
- NextAuth configuration in `src/utils/auth.ts`
- Multiple providers: credentials, GitHub, Google, email
- Session management with JWT strategy
- Prisma adapter for user persistence
- Password reset functionality via email tokens

### Database Architecture
- PostgreSQL with Prisma ORM (Docker container or external)
- NextAuth tables: User, Account, Session, VerificationToken
- **New Chatbot tables**: Chatbot, Conversation, Message
- **New Downloads table**: Download with file metadata and access control
- User relationships to chatbots, conversations, and downloads
- Database URL configured for Docker networking or localhost

### Component Organization
- Feature-based component structure (Auth/, Blog/, Pricing/, etc.)
- Shared components in Common/
- Each major feature has its own directory with index files
- TypeScript interfaces defined in `src/types/`

### Styling Conventions
- Tailwind CSS with dark mode support (`class` strategy)
- TailGrids plugin integration
- Prettier with Tailwind CSS plugin for class sorting
- Custom CSS in `src/styles/index.css`

### Blog System
- MDX files in `markdown/blogs/`
- Gray-matter for frontmatter parsing
- Remark for HTML conversion
- Prism.js for syntax highlighting

### Payment Integration
- Stripe payment processing
- Pricing tiers defined in `src/stripe/pricingData.ts`
- Payment API route at `api/payment/route.ts`

### Chatbot System
- n8n webhook integration at `https://infra-v2-n8n-v2.uclxiv.easypanel.host/webhook/saasiav3`
- Real-time chat interface with conversation persistence
- User-specific chatbot management and configuration
- Message history stored in PostgreSQL

### Downloads System
- Secure file upload with metadata (title, description, public/private)
- File storage in `public/uploads/` with user-specific subdirectories
- Access control based on user ownership and public flags
- File download with proper MIME type handling

### Docker Deployment
- Complete containerization with PostgreSQL, Redis, and app
- Development: `docker-compose.dev.yml` (database only)
- Production: `docker-compose.yml` (full stack)
- Automatic database initialization and migrations

## Important Notes

- React 19 compatibility requires `--legacy-peer-deps` flag
- Use Docker setup scripts for quick start: `scripts/setup-docker.bat`
- Database migrations: `npx prisma migrate dev`
- Generate Prisma client: `npx prisma generate`
- Default n8n webhook configured in environment variables
- File uploads stored in `public/uploads/` with user access control
- Build process automatically generates Prisma client before Next.js build