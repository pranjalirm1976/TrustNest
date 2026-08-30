import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

// Ensure SQLite database is writable on serverless platforms (Vercel / AWS Lambda)
let resolvedDatabaseUrl = process.env.DATABASE_URL

if (!resolvedDatabaseUrl || resolvedDatabaseUrl.startsWith('file:')) {
  try {
    const bundledDbPath = path.join(process.cwd(), 'prisma', 'dev.db')

    // On Vercel / AWS Lambda, the root filesystem is read-only (EROFS).
    // Copy the pre-seeded SQLite database to the writable /tmp partition.
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT) {
      const tempDbPath = path.join('/tmp', 'dev.db')
      try {
        if (!fs.existsSync(tempDbPath) && fs.existsSync(bundledDbPath)) {
          fs.copyFileSync(bundledDbPath, tempDbPath)
        }
      } catch (copyErr) {
        console.warn('[Prisma] Could not copy DB to /tmp, using fallback:', copyErr)
      }
      resolvedDatabaseUrl = `file:${tempDbPath}`
      process.env.DATABASE_URL = resolvedDatabaseUrl
    } else {
      if (fs.existsSync(bundledDbPath)) {
        fs.closeSync(fs.openSync(bundledDbPath, 'r'))
      }
      if (!resolvedDatabaseUrl) {
        resolvedDatabaseUrl = `file:${bundledDbPath}`
        process.env.DATABASE_URL = resolvedDatabaseUrl
      }
    }
  } catch (e) {
    console.warn('[Prisma] SQLite setup notice:', e)
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: resolvedDatabaseUrl ? {
      db: {
        url: resolvedDatabaseUrl
      }
    } : undefined,
    log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma