import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

// 1. Force Next.js Node File Trace (NFT) to bundle the SQLite database file
try {
  const dbPathForTracing = path.join(process.cwd(), 'prisma', 'dev.db')
  if (fs.existsSync(dbPathForTracing)) {
    fs.closeSync(fs.openSync(dbPathForTracing, 'r'))
  }
} catch (e) {
  // Silent fallback for tracing
}

// 2. Resolve absolute database path for Prisma engine execution on Vercel
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
process.env.DATABASE_URL = `file:${dbPath}`

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma