import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { Role } from './types'

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: Role
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: Role
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'admin@trustnest.in'
        },
        password: {
          label: 'Password',
          type: 'password'
        }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email) {
            throw new Error('Email is required')
          }

          const rawEmail = credentials.email.toLowerCase().trim()
          const rawPassword = (credentials.password || '').trim()

          // Determine target role by email pattern
          const isSuperAdmin = 
            rawEmail.includes('admin') || 
            rawEmail.includes('pranjali') || 
            rawEmail === 'admin@trustnest.in' || 
            rawEmail === 'admin@trustnest.com'

          const isOwner = 
            rawEmail.includes('owner') || 
            rawEmail.includes('rajesh') || 
            rawEmail.includes('emerald') || 
            rawEmail === 'rajesh@emeraldelite.com'

          const role: Role = isSuperAdmin ? 'SUPER_ADMIN' : isOwner ? 'OWNER' : 'TENANT'
          const defaultName = isSuperAdmin 
            ? 'Pranjali (Super Admin)' 
            : isOwner 
              ? 'Rajesh Kumar (PG Owner)' 
              : 'Priya Sharma'

          // 1. Try finding user in database
          let user = await prisma.user.findUnique({
            where: { email: rawEmail }
          }).catch(() => null)

          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name || defaultName,
              role: (user.role || role) as Role
            }
          }

          // 2. If user is not yet in the DB, create them
          try {
            const hashedPassword = await bcrypt.hash('superadminpranjali', 10)
            user = await prisma.user.upsert({
              where: { email: rawEmail },
              update: { role, name: defaultName },
              create: {
                email: rawEmail,
                name: defaultName,
                passwordHash: hashedPassword,
                role
              }
            })
          } catch (_) {}

          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role as Role
            }
          }

          throw new Error('Could not initialize user profile in database.')
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      }
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true
          })
        ]
      : [])
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // Auto-create or update user on first Google login
          const email = user.email?.toLowerCase().trim() || ''
          
          // Determine role by email pattern
          const isSuperAdmin = 
            email.includes('admin') || 
            email.includes('pranjali') || 
            email === 'admin@trustnest.in' || 
            email === 'admin@trustnest.com'

          const isOwner = 
            email.includes('owner') || 
            email.includes('rajesh') || 
            email.includes('emerald') || 
            email === 'rajesh@emeraldelite.com'

          const role: Role = isSuperAdmin ? 'SUPER_ADMIN' : isOwner ? 'OWNER' : 'TENANT'

          // Upsert user (create if doesn't exist, update if exists)
          const dbUser = await prisma.user.upsert({
            where: { email },
            update: {
              name: user.name || undefined
            },
            create: {
              email,
              name: user.name || 'Google User',
              role,
              passwordHash: '' // No password for OAuth users
            }
          }).catch(() => null)

          return !!dbUser
        } catch (error) {
          console.error('Google sign-in error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email as string,
          name: token.name as string,
          role: token.role
        }
      }
      return session
    }
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login'
  },
  secret: process.env.NEXTAUTH_SECRET || 'trustnest-super-secure-jwt-production-secret-key-32-chars',
  debug: process.env.NODE_ENV === 'development'
}

export default authOptions