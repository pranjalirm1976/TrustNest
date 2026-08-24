import { Metadata } from 'next'
import SettingsClient from '@/components/admin/SettingsClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateTrustScore } from '@/lib/trust-score'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Settings & Trust Score | TrustNest Owner',
  description: 'Manage your owner account, property preferences, and TrustScore status.',
}

export default async function OwnerSettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'INSPECTOR')) {
    redirect('/admin/login')
  }

  const isInspector = session.user.role === 'INSPECTOR'

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  const property = await prisma.property.findFirst({
    where: isInspector ? {} : { ownerId: session.user.id },
    select: {
      id: true,
      name: true,
      address: true,
      gender: true,
      priceFrom: true,
      trustScore: true
    }
  })

  let trustBreakdown = null
  let trustLogs: any[] = []

  if (property) {
    trustBreakdown = await calculateTrustScore(property.id)
    trustLogs = await prisma.trustScoreLog.findMany({
      where: { propertyId: property.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  }

  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] min-h-[600px] pb-8">
      <div className="mb-6 shrink-0 mt-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings & TrustScore™</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account details, property profile, and real-time TrustScore™ metrics.</p>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col">
        <SettingsClient 
          initialTab="trust"
          user={user ? { name: user.name, email: user.email } : undefined}
          property={property}
          initialTrustBreakdown={trustBreakdown}
          initialTrustLogs={trustLogs}
        />
      </div>
    </div>
  )
}
