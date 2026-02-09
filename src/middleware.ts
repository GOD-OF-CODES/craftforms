import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { securityHeaders } from '@/lib/securityHeaders'

export function middleware(_request: NextRequest) {
  const response = NextResponse.next()

  // Apply security headers to all matched routes
  Object.entries(securityHeaders).forEach(([key, value]) => {
    // In development, Next.js React Refresh requires 'unsafe-eval'
    if (key === 'Content-Security-Policy' && process.env.NODE_ENV === 'development') {
      value = value.replace(
        "script-src 'self' 'unsafe-inline'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      )
    }
    response.headers.set(key, value)
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
