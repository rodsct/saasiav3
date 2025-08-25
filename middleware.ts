import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  
  // Force production URL for all auth routes
  if (url.pathname.startsWith('/api/auth')) {
    console.log('🔧 Middleware - intercepting auth route:', url.pathname)
    
    // Override environment variables
    process.env.NEXTAUTH_URL = 'https://proyectonuevo-saasiav3.uclxiv.easypanel.host'
    process.env.NEXTAUTH_URL_INTERNAL = 'https://proyectonuevo-saasiav3.uclxiv.easypanel.host'
    process.env.VERCEL_URL = 'proyectonuevo-saasiav3.uclxiv.easypanel.host'
    
    // Create new request with modified headers
    const newHeaders = new Headers(request.headers)
    newHeaders.set('host', 'proyectonuevo-saasiav3.uclxiv.easypanel.host')
    newHeaders.set('x-forwarded-host', 'proyectonuevo-saasiav3.uclxiv.easypanel.host')
    newHeaders.set('x-forwarded-proto', 'https')
    newHeaders.set('x-forwarded-port', '443')
    newHeaders.set('x-url', 'https://proyectonuevo-saasiav3.uclxiv.easypanel.host')
    
    // Force the URL to production
    url.protocol = 'https:'
    url.host = 'proyectonuevo-saasiav3.uclxiv.easypanel.host'
    url.port = '443'
    
    const response = NextResponse.next({
      request: {
        headers: newHeaders,
      },
    })
    
    // Set response headers as well
    response.headers.set('x-forwarded-host', 'proyectonuevo-saasiav3.uclxiv.easypanel.host')
    response.headers.set('x-forwarded-proto', 'https')
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/auth/:path*'
}