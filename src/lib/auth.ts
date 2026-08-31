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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true
    })
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
          const email = user.email?.toLowerCase().trim()
          if (!email) return false

          // 1. Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email }
          }).catch(() => null)

          if (existingUser) {
            // Existing user: sign in with their existing role without altering permissions
            user.id = existingUser.id
            user.role = existingUser.role as Role
            user.name = existingUser.name || user.name || 'Resident User'
            return true
          }

          // 2. New user from Google Sign-In: strictly create as USER / TENANT role
          const newUser = await prisma.user.create({
            data: {
              email,
              name: user.name || 'Google User',
              role: 'TENANT', // Strict Resident / User role
              passwordHash: '', // No password for OAuth users
            }
          })

          user.id = newUser.id
          user.role = newUser.role as Role
          user.name = newUser.name
          return true
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
      // Ensure token always has valid id and role resolved from database
      if ((!token.id || !token.role) && token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } }).catch(() => null)
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role as Role
        }
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
    signIn: '/tenant/login',
    error: '/tenant/login'
  },
  secret: process.env.NEXTAUTH_SECRET || 'trustnest-super-secure-jwt-production-secret-key-32-chars',
  debug: process.env.NODE_ENV === 'development'
}

export default authOptions