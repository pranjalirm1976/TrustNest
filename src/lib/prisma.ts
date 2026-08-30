import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

// Ensure SQLite database has full READ-WRITE permissions on serverless platforms (Vercel / AWS Lambda)
let resolvedDatabaseUrl = process.env.DATABASE_URL || 'file:./dev.db'

if (resolvedDatabaseUrl.startsWith('file:')) {
  try {
    const isServerless = Boolean(
      process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT ||
      process.env.NODE_ENV === 'production'
    )

    if (isServerless) {
      const tempDbPath = path.join('/tmp', 'dev.db')

      // Candidate locations for the bundled SQLite DB
      const candidates = [
        path.join(process.cwd(), 'prisma', 'dev.db'),
        path.join(process.cwd(), 'dev.db'),
        path.join(__dirname, 'dev.db'),
        path.join(__dirname, '..', 'dev.db'),
        path.join(__dirname, '..', 'prisma', 'dev.db'),
        path.resolve('./prisma/dev.db'),
        path.resolve('./dev.db')
      ]

      let sourceFound = ''
      for (const p of candidates) {
        if (fs.existsSync(p)) {
          sourceFound = p
          break
        }
      }

      try {
        if (sourceFound && (!fs.existsSync(tempDbPath) || fs.statSync(tempDbPath).size === 0)) {
          fs.copyFileSync(sourceFound, tempDbPath)
        }

        // CRITICAL: On Linux/Vercel Lambda, copyFileSync preserves source read-only mode (0444).
        // Explicitly set 0o666 (Read + Write) permissions so SQLite can write.
        if (fs.existsSync(tempDbPath)) {
          fs.chmodSync(tempDbPath, 0o666)
        }
      } catch (copyErr) {
        console.warn('[Prisma Serverless] Notice during /tmp DB sync:', copyErr)
      }

      resolvedDatabaseUrl = `file:${tempDbPath}`
      process.env.DATABASE_URL = resolvedDatabaseUrl
    } else {
      const localDbPath = path.join(process.cwd(), 'prisma', 'dev.db')
      if (fs.existsSync(localDbPath)) {
        try {
          fs.chmodSync(localDbPath, 0o666)
        } catch (_) {}
      }
    }
  } catch (e) {
    console.warn('[Prisma] Database resolution notice:', e)
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