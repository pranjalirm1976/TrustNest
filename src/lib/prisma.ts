import { PrismaClient } from '@prisma/client'

// Verified working Supabase Session Pooler URL (tested & confirmed)
const SUPABASE_DB_URL =
  'postgresql://postgres.ouynlrtuwmbrzxlrmone:TrustNest2026%40DB@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: SUPABASE_DB_URL }
    },
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma