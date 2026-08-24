import { Metadata } from 'next'
import PerformanceClient from '@/components/admin/PerformanceClient'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateTrustScore } from '@/lib/trust-score'

export const metadata: Metadata = {
  title: 'Performance Analytics | TrustNest',
  description: 'Track operational health and TrustNest algorithmic scores.',
}

export default async function PerformancePage() {
  const session = await getServerSession(authOptions)
  let score = 4.0

  if (session && session.user.role === 'OWNER') {
    const property = await prisma.property.findFirst({
      where: { ownerId: session.user.id }
    })
    if (property) {
      const breakdown = await calculateTrustScore(property.id)
      score = breakdown.score
    }
  }

  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Performance Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Monitor operational health, SLA resolution, and your algorithmic TrustNest Score.</p>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col">
        <PerformanceClient initialScore={score} />
      </div>
    </div>
  )
}
