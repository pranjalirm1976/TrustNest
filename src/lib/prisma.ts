import { PrismaClient } from '@prisma/client'

// The Supabase connection pooler URL with pgbouncer=true to prevent
// "prepared statement already exists" errors in serverless environments
const SUPABASE_POOLER_URL = 
  'postgresql://postgres.ouynlrtuwmbrzxlrmone:TrustNest2026%40DB@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&connection_limit=1'

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL || ''

  // If local dev using SQLite, always use Supabase pooler for real functionality
  if (!envUrl || envUrl.startsWith('file:') || envUrl === '') {
    return SUPABASE_POOLER_URL
  }

  // If it's any Supabase URL, ensure pgbouncer=true is present
  if (envUrl.includes('supabase')) {
    // Already has pgbouncer - check if it's a direct connection (port 5432 without pooler)
    if (envUrl.includes('db.') && envUrl.includes('.supabase.co')) {
      // Direct connection - rewrite to pooler
      return SUPABASE_POOLER_URL
    }
    // Already using pooler - ensure pgbouncer=true param is there
    if (!envUrl.includes('pgbouncer=true')) {
      const separator = envUrl.includes('?') ? '&' : '?'
      return envUrl + separator + 'pgbouncer=true&connection_limit=1'
    }
    return envUrl
  }

  return envUrl
}

const dbUrl = getDatabaseUrl()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: dbUrl }
    },
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma