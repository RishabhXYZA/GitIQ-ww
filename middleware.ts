import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')
  const pathname = request.nextUrl.pathname

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/analyze')) {
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Redirect to dashboard if user is logged in and trying to access home
  if (pathname === '/' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/analyze/:path*'],
}
