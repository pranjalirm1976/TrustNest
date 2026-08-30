import { Metadata } from 'next'
import ReviewsClient from '@/components/admin/ReviewsClient'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Reviews & Performance | TrustNest',
  description: 'Monitor verified resident feedback and performance metrics.',
}

export default async function ReviewsPage() {
  const session = await getServerSession(authOptions)
  let initialReviews: any[] = []

  if (session && (session.user.role === 'OWNER' || session.user.role === 'PG_OWNER' || session.user.role === 'SUPER_ADMIN' || session.user.role === 'INSPECTOR')) {
    const isSuperAdmin = session.user.role === 'SUPER_ADMIN' || session.user.role === 'INSPECTOR'
    const properties = await prisma.property.findMany({
      where: isSuperAdmin ? {} : { ownerId: session.user.id },
      select: { id: true }
    })
    const propertyIds = properties.map(p => p.id)

    initialReviews = await prisma.propertyReview.findMany({
      where: { propertyId: { in: propertyIds } },
      include: { tenant: true },
      orderBy: { createdAt: 'desc' }
    })
  }

  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reviews & Feedback</h1>
        <p className="text-sm text-slate-500 mt-1">Monitor verified resident feedback and understand your performance metrics.</p>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col">
        <ReviewsClient initialReviews={initialReviews} />
      </div>
    </div>
  )
}
