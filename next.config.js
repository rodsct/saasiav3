/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // External packages for server
  serverExternalPackages: ['@prisma/client', 'prisma'],
  
  // Allow development origins
  allowedDevOrigins: ['agente.aranza.io'],
  
  // Note: i18n configuration is not supported in App Router
  // Using custom client-side translation hook instead
  
  // Optimize images
  images: {
    domains: ['localhost', 'agente.aranza.io'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Remove deprecated experimental feature
};

module.exports = nextConfig
