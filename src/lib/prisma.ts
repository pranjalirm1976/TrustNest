import { PrismaClient } from '@prisma/client'

function getSanitizedDatabaseUrl(): string {
  let url = process.env.DATABASE_URL || ''

  // If it's a SQLite file (local dev), leave it
  if (!url || url.startsWith('file:')) {
    // Return Supabase connection directly for production
    return `postgresql://postgres.ouynlrtuwmbrzxlrmone:TrustNest2026%40DB@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1`
  }

  // If it's the old direct db.xxx.supabase.co:5432 format, rewrite to pooler
  if (url.includes('db.') && url.includes('.supabase.co')) {
    const match = url.match(/postgresql:\/\/postgres(?::([^@]+))?@db\.([^.]+)\.supabase\.co/i)
    if (match) {
      const rawPassword = match[1] || 'TrustNest2026%40DB'
      const password = rawPassword.includes('@') ? rawPassword.replace('@', '%40') : rawPassword
      const projectRef = match[2]
      url = `postgresql://postgres.${projectRef}:${password}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1`
    }
  }

  // If already using pooler but missing pgbouncer param, add it
  if (url.includes('pooler.supabase.com') && !url.includes('pgbouncer=true')) {
    url = url + (url.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=1'
  }

  return url
}

const resolvedUrl = getSanitizedDatabaseUrl()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: resolvedUrl }
    },
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma