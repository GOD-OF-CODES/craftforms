import { NextResponse } from 'next/server'

// Temporarily disabled for demo
export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
