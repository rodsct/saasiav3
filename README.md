SaaS v3 is a complete **AI-powered SaaS platform with chatbot integration and downloads management**, built on Next.js. Features include n8n webhook chatbots, secure file downloads, user authentication, and payment processing - everything you need to launch your AI-powered business.

[![Play Next.js](https://github.com/NextJSTemplates/play-nextjs/blob/main/nextjs-play.png)](https://play.nextjstemplates.com)

## AI-Powered SaaS Platform with Chatbot & Downloads 🤖

SaaS v3 is a complete platform featuring AI chatbots with n8n integration, secure file downloads, user authentication, and payment processing. Built with Next.js 15, TypeScript, Prisma, and Docker for easy deployment.

### [🚀 View Live Demo](https://play.nextjstemplates.com/)

### [🔌 Documentation](https://nextjstemplates.com/docs)

### Key Features ⚡

SaaS v3 includes all essential integrations for a modern AI-powered platform:

- **🤖 AI Chatbots with n8n Integration**: Create unlimited chatbots that connect to your n8n workflows via webhooks for intelligent responses.

- **📁 Downloads Management**: Secure file upload, organization, and sharing with public/private access controls.

- **🗄️ PostgreSQL Database**: Complete database setup with Prisma ORM, including Docker deployment.

- **🔐 NextAuth Authentication**: Multi-provider authentication (credentials, GitHub, Google, email magic links).

- **📝 MDX Blog System**: Full-featured blog with markdown and JSX support.

- **💳 Stripe Payments**: Integrated subscription billing with multiple pricing tiers.

- **🐳 Docker Ready**: Complete Docker setup for easy deployment and development.

### Essential SaaS Pages & Components and Styled Using Tailwind CSS 🎨

This Next.js SaaS Boilerplate and Starter Kit is **styled using Tailwind CSS**, a highly flexible and customizable utility-first CSS framework. Leveraging the power of Tailwind, each component and page of this kit, including **login, signup, blog, about, and others, has been handcrafted to offer top-notch aesthetics** while maintaining peak usability.

### Crafted Using [🎨 TailGrids Components](https://tailgrids.com)

Play Next.js SaaS boilerplate, you can enjoy a professional-looking website that offers seamless operation, all while significantly reducing your web development time and effort.

---

### 🚀 Deploy Now

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FNextJSTemplates%2Fplay-nextjs)

[![Deploy with Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/NextJSTemplates/play-nextjs)

### 🚀 Quick Start with Docker (Recommended)

The fastest way to get SaaS v3 running with database included:

```bash
# Clone and navigate to the project
git clone <repository-url>
cd play-nextjs

# Run setup script (Windows)
scripts\setup-docker.bat

# Or run setup script (Linux/Mac)
chmod +x scripts/setup-docker.sh
./scripts/setup-docker.sh

# Start development
npm run dev
```

### 🐳 Full Docker Deployment

To run everything in containers:

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 🛠 Manual Setup (Alternative)

If you prefer manual setup:

1. **Install Dependencies:**
```bash
npm install --legacy-peer-deps
```

2. **Setup Database:**
```bash
# Start PostgreSQL with Docker
docker-compose -f docker-compose.dev.yml up -d postgres

# Run migrations
npx prisma migrate dev
```

3. **Start Development:**
```bash
npm run dev
```

Our comprehensive documentation includes all the guides you'll need for integrating various features.

### Deployment on PaaS

If your project is hosted on a GitHub repository, you can deploy it using free and user-friendly platforms like [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/). Both provide generous free tiers for hosting Next.js projects.

### License Information

Play is Free is completely free and open-source. Feel free to use it for both personal and commercial projects.

### Show Your Support

If you appreciate this project, please consider starring this repository. Your support encourages our team to continue creating more content like this and helps us to reach more users like you!

## Explore More Templates

For a wider range of options, feel free to browse our collection of [Next.js Templates, Boilerplates and Starter Kits](https://nextjstemplates.com/templates).

### Update Log

**06 August 2025** - v2.2.1

- fix: [#21](https://github.com/NextJSTemplates/play-nextjs/issues/21) - Moved context providers to `/src/app/providers.tsx`
- Removed initial loader

**10 April 2025**

- Fix peer deps issue
- Update Next.js for security patch

**29 Jan 2025**

- Upgraded to Next.js 15
- Using `Link` instead of `a` tag
- Fixed all minor bugs

**21 March 2024**

- Upgraded to Next.js 14
- Updated stripe integration
- Fixed auth issues
- Updated all the packages
- Update ts config & fix all the issues
- Update signin & signup page Design
- Integrated Magic link signin
- & Forgot password
