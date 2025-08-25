import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Force production URL for auth routes in development
  const url = request.nextUrl.clone()
  
  // Set headers to force correct host
  const response = NextResponse.next()
  
  // Force the correct host for auth callbacks
  if (url.pathname.startsWith('/api/auth')) {
    response.headers.set('x-forwarded-host', 'proyectonuevo-saasiav3.uclxiv.easypanel.host')
    response.headers.set('x-forwarded-proto', 'https')
  }
  
  return response
}

export const config = {
  matcher: '/api/auth/:path*'
}