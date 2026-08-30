import { PrismaClient } from '@prisma/client'

// Supabase SESSION pooler (port 5432) — supports prepared statements unlike transaction pooler (6543)
// Session pooler is safe for serverless and supports all Prisma query types
const SUPABASE_SESSION_POOLER_URL =
  'postgresql://postgres.ouynlrtuwmbrzxlrmone:TrustNest2026%40DB@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require'

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL || ''

  // Always use Supabase session pooler — handles SQLite dev env and any misconfigured URL
  if (!envUrl || envUrl.startsWith('file:') || !envUrl.includes('supabase')) {
    return SUPABASE_SESSION_POOLER_URL
  }

  // Already has a supabase pooler URL — strip pgbouncer param if present (not needed for session mode)
  const cleaned = envUrl
    .replace('&pgbouncer=true', '')
    .replace('?pgbouncer=true&', '?')
    .replace('?pgbouncer=true', '')
    .replace('&connection_limit=1', '')
    .replace('?connection_limit=1', '')

  // Ensure we're on session pooler port 5432, not transaction pooler 6543
  return cleaned.replace(':6543/', ':5432/')
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