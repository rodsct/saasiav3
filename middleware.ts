import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  
  // Force production URL for all auth routes
  if (url.pathname.startsWith('/api/auth')) {
    console.log('🔧 Middleware - intercepting auth route:', url.pathname)
    
    // Override environment variables
    process.env.NEXTAUTH_URL = 'https://agente.aranza.io'
    process.env.NEXTAUTH_URL_INTERNAL = 'https://agente.aranza.io'
    process.env.VERCEL_URL = 'agente.aranza.io'
    
    // Create new request with modified headers
    const newHeaders = new Headers(request.headers)
    newHeaders.set('host', 'agente.aranza.io')
    newHeaders.set('x-forwarded-host', 'agente.aranza.io')
    newHeaders.set('x-forwarded-proto', 'https')
    newHeaders.set('x-forwarded-port', '443')
    newHeaders.set('x-url', 'https://agente.aranza.io')
    
    // Force the URL to production
    url.protocol = 'https:'
    url.host = 'agente.aranza.io'
    url.port = '443'
    
    const response = NextResponse.next({
      request: {
        headers: newHeaders,
      },
    })
    
    // Set response headers as well
    response.headers.set('x-forwarded-host', 'agente.aranza.io')
    response.headers.set('x-forwarded-proto', 'https')
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/auth/:path*']
}