import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  // Public routes — always allowed
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/book/') ||
    pathname.startsWith('/api/slots') ||
    pathname.startsWith('/api/appointments') ||
    pathname.startsWith('/api/shops') ||
    pathname.startsWith('/api/webhooks/') ||
    pathname.startsWith('/api/auth/')

  // Auth routes — redirect to dashboard if already logged in
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Dashboard routes — require auth
  const isDashboardRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/appointments') ||
    pathname.startsWith('/clients') ||
    pathname.startsWith('/services') ||
    pathname.startsWith('/barbers') ||
    pathname.startsWith('/settings')

  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
