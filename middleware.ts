import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  
  // Get production URL from environment variable with fallback
  const PRODUCTION_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://agente.aranza.io'
  const DOMAIN_ONLY = PRODUCTION_URL.replace('https://', '')
  
  // Force production URL for all auth routes
  if (url.pathname.startsWith('/api/auth')) {
    console.log('🔧 Middleware - intercepting auth route:', url.pathname)
    
    // Override environment variables
    process.env.NEXTAUTH_URL = PRODUCTION_URL
    process.env.NEXTAUTH_URL_INTERNAL = PRODUCTION_URL
    process.env.VERCEL_URL = DOMAIN_ONLY
    
    // Create new request with modified headers
    const newHeaders = new Headers(request.headers)
    newHeaders.set('host', DOMAIN_ONLY)
    newHeaders.set('x-forwarded-host', DOMAIN_ONLY)
    newHeaders.set('x-forwarded-proto', 'https')
    newHeaders.set('x-forwarded-port', '443')
    newHeaders.set('x-url', PRODUCTION_URL)
    
    // Force the URL to production
    url.protocol = 'https:'
    url.host = DOMAIN_ONLY
    url.port = '443'
    
    const response = NextResponse.next({
      request: {
        headers: newHeaders,
      },
    })
    
    // Set response headers as well
    response.headers.set('x-forwarded-host', DOMAIN_ONLY)
    response.headers.set('x-forwarded-proto', 'https')
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/auth/:path*']
}