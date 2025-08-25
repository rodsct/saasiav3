import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const response = NextResponse.next()
  
  // Force production URL for all auth routes
  if (url.pathname.startsWith('/api/auth')) {
    response.headers.set('host', 'proyectonuevo-saasiav3.uclxiv.easypanel.host')
    response.headers.set('x-forwarded-host', 'proyectonuevo-saasiav3.uclxiv.easypanel.host')
    response.headers.set('x-forwarded-proto', 'https')
    response.headers.set('x-forwarded-port', '443')
    
    // Override NextAuth URLs
    process.env.NEXTAUTH_URL = 'https://proyectonuevo-saasiav3.uclxiv.easypanel.host'
    process.env.NEXTAUTH_URL_INTERNAL = 'https://proyectonuevo-saasiav3.uclxiv.easypanel.host'
  }
  
  return response
}

export const config = {
  matcher: '/api/auth/:path*'
}