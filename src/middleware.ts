import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Allow login pages and public APIs through without checks
    if (
      path === '/admin/login' || 
      path === '/tenant/login' || 
      path === '/user/login' ||
      path.startsWith('/api/auth')
    ) {
      return NextResponse.next()
    }

    const tokenRole = (token?.role as string)?.toUpperCase()

    // Super Admin Platform Route Authorization
    if (path.startsWith('/super-admin')) {
      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
      if (tokenRole !== 'SUPER_ADMIN' && tokenRole !== 'INSPECTOR') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
      return NextResponse.next()
    }

    // Admin & PG Owner route authorization
    if (path.startsWith('/admin') || path.startsWith('/owner')) {
      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
      if (tokenRole !== 'OWNER' && tokenRole !== 'PG_OWNER' && tokenRole !== 'SUPER_ADMIN' && tokenRole !== 'INSPECTOR') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
      return NextResponse.next()
    }

    // Tenant / Resident route authorization
    if (path.startsWith('/tenant')) {
      if (!token) {
        return NextResponse.redirect(new URL('/tenant/login', req.url))
      }
      if (tokenRole !== 'TENANT' && tokenRole !== 'USER') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
      return NextResponse.next()
    }

    return NextResponse.next()
  },
  {
    secret: process.env.NEXTAUTH_SECRET || 'trustnest-super-secure-jwt-production-secret-key-32-chars',
    callbacks: {
      authorized: () => true,
    },
  }
)

export const config = {
  matcher: [
    '/super-admin/:path*',
    '/admin/:path*',
    '/owner/:path*',
    '/tenant/:path*',
  ],
}
