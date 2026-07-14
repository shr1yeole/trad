import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
const protectedRoutes = ['/dashboard', '/journal', '/analytics', '/psychology', '/ai-coach', '/goals', '/calendar', '/settings']
const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.includes(path)

  const session = request.cookies.get('session')?.value

  // In Next.js middleware (Edge runtime), we cannot easily use firebase-admin.
  // We perform a basic check here for routing, and proper verification happens in API routes/Server components.
  const isAuthenticated = !!session

  // Redirect to /login if unauthenticated and trying to access a protected route
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }

  // Redirect to /dashboard if authenticated and trying to access a public route
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
  }

  // Session refresh is handled by the server actions or explicitly where needed
  // Doing it in middleware for every request can cause issues with Next.js edge runtime
  // if not careful, but Jose is edge-compatible. However, for performance we'll stick 
  // to the basic auth check here.

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
