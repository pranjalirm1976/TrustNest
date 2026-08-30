import { PrismaClient } from '@prisma/client'

// Automatically convert direct IPv6 Supabase URLs to IPv4 Pooler URLs for serverless reliability
function getSanitizedDatabaseUrl(): string | undefined {
  let url = process.env.DATABASE_URL
  if (!url) return undefined

  // If URL uses the direct connection host: db.<ref>.supabase.co:5432
  if (url.includes('db.') && url.includes('.supabase.co')) {
    const match = url.match(/postgresql:\/\/postgres(?::([^@]+))?@db\.([^.]+)\.supabase\.co:5432\/postgres/i)
    if (match) {
      const rawPassword = match[1] || 'TrustNest2026%40DB'
      // Ensure @ in password is URI encoded as %40
      const password = rawPassword.includes('@') ? rawPassword.replace('@', '%40') : rawPassword
      const projectRef = match[2]
      url = `postgresql://postgres.${projectRef}:${password}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require`
      process.env.DATABASE_URL = url
    }
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
    datasources: resolvedUrl ? {
      db: { url: resolvedUrl }
    } : undefined,
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma