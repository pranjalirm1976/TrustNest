import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
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
          placeholder: 'admin@trustnest.com'
        },
        password: {
          label: 'Password',
          type: 'password'
        }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email and password are required')
          }

          // Find user by email
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email.toLowerCase()
            }
          })

          if (!user) {
            throw new Error('Invalid email or password')
          }

          // Validate password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          )

          if (!isPasswordValid) {
            throw new Error('Invalid email or password')
          }

          // Allow all authenticated roles to authorize (routing guards block unauthorized pages)

          // Return user object (passwordHash is excluded for security)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as Role
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      }
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
    async jwt({ token, user }) {
      // Persist user data in JWT token
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
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
  secret: process.env.NEXTAUTH_SECRET || 'trustnest-super-secret-fallback-key-12345',
  debug: process.env.NODE_ENV === 'development'
}

export default authOptions