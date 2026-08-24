import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import VerificationClient from '@/components/admin/VerificationClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Verification Status | TrustNest',
  description: 'Monitor your PG onboarding and TrustNest verification status.',
}

export default async function VerificationPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'PG_OWNER' && session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'INSPECTOR')) {
    redirect('/admin/login')
  }

  const isSuperAdmin = session.user.role === 'SUPER_ADMIN' || session.user.role === 'INSPECTOR'

  // Fetch properties for this owner
  const properties = await prisma.property.findMany({
    where: isSuperAdmin ? {} : { ownerId: session.user.id },
    select: {
      id: true,
      name: true,
      address: true,
      status: true,
      trustScore: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-140px)] items-center pb-12">
      <div className="w-full max-w-3xl mb-6 shrink-0 mt-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">TrustNest Verification</h1>
        <p className="text-sm text-slate-500 mt-1">Track the real-time status of your property onboarding and Super Admin verification.</p>
      </div>
      
      <div className="w-full max-w-3xl flex-1 flex flex-col">
        <VerificationClient properties={properties} />
      </div>
    </div>
  )
}
