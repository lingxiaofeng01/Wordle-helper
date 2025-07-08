import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Only apply to admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Get the current time
    const now = Date.now()
    
    // Check for rate limiting (simple implementation)
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    // In a production environment, you would use Redis or a database for rate limiting
    // For now, we'll just add headers for security
    
    const response = NextResponse.next()
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // Add a custom header to identify admin area
    response.headers.set('X-Admin-Area', 'true')
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/blog/:path*'
  ]
}