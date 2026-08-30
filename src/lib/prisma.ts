import { PrismaClient } from '@prisma/client'

function getRuntimeDatabaseUrl(): string {
  let url = process.env.DATABASE_URL || ''

  // Fallback to Supabase connection pooler if not set or local SQLite placeholder
  if (!url || url.startsWith('file:')) {
    return 'postgresql://postgres.ouynlrtuwmbrzxlrmone:TrustNest2026%40DB@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&statement_cache_size=0&connection_limit=1'
  }

  // If connecting to Supabase, ensure pgbouncer=true and statement_cache_size=0 are present
  if (url.includes('supabase.co') || url.includes('pooler.supabase.com')) {
    if (url.includes('db.') && url.includes('.supabase.co')) {
      // Direct connection on Lambda fails — rewrite to pooler
      return 'postgresql://postgres.ouynlrtuwmbrzxlrmone:TrustNest2026%40DB@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true&statement_cache_size=0&connection_limit=1'
    }

    // Add pgbouncer and disable prepared statements for transaction pooling
    if (!url.includes('pgbouncer=true')) {
      const sep = url.includes('?') ? '&' : '?'
      url = `${url}${sep}pgbouncer=true`
    }
    if (!url.includes('statement_cache_size')) {
      const sep = url.includes('?') ? '&' : '?'
      url = `${url}${sep}statement_cache_size=0`
    }
    return url
  }

  return url
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: getRuntimeDatabaseUrl() }
    },
    log: process.env.NODE_ENV === 'development'
      ? ['warn', 'error']
      : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}