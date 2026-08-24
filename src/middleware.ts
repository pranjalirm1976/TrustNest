import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Allow login pages through without checks
    if (path === '/admin/login' || path === '/tenant/login') {
      return NextResponse.next()
    }

    // Super Admin Platform Route Authorization
    if (path.startsWith('/super-admin')) {
      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
      if (token.role !== 'SUPER_ADMIN' && token.role !== 'INSPECTOR') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    // Admin & PG Owner route authorization
    if (path.startsWith('/admin') || path.startsWith('/owner')) {
      if (!token) {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
      if (token.role !== 'OWNER' && token.role !== 'PG_OWNER' && token.role !== 'SUPER_ADMIN' && token.role !== 'INSPECTOR') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    // Tenant / Resident route authorization
    if (path.startsWith('/tenant')) {
      if (!token) {
        return NextResponse.redirect(new URL('/tenant/login', req.url))
      }
      if (token.role !== 'TENANT' && token.role !== 'USER') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
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
