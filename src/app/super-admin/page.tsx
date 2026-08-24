import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SuperAdminDashboardClient from '@/components/super-admin/SuperAdminDashboardClient'
import { getSuperAdminPlatformStats } from '@/actions/super-admin.actions'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Super Admin Control Center | TrustNest',
  description: 'Platform management dashboard for TrustNest Super Admin.',
}

export default async function SuperAdminPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'INSPECTOR')) {
    redirect('/admin/login')
  }

  // Fetch platform stats
  const stats = await getSuperAdminPlatformStats()

  // Fetch all properties with owners and images
  const properties = await prisma.property.findMany({
    include: {
      owner: { select: { id: true, name: true, email: true } },
      images: { take: 1 },
      floors: {
        include: {
          rooms: {
            include: { beds: true }
          }
        }
      },
      complaints: {
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Fetch all subscriptions with owner details and latest invoices
  const subscriptions = await prisma.ownerSubscription.findMany({
    include: {
      owner: { select: { id: true, name: true, email: true } },
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 3
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  })

  // Fetch recent platform complaints
  const complaints = await prisma.complaint.findMany({
    include: {
      property: { select: { id: true, name: true } },
      tenant: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  })

  // Fetch recent reviews
  const reviews = await prisma.propertyReview.findMany({
    include: {
      property: { select: { id: true, name: true } },
      tenant: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  })

  return (
    <SuperAdminDashboardClient
      user={session.user}
      stats={stats}
      properties={properties as any}
      subscriptions={subscriptions as any}
      complaints={complaints as any}
      reviews={reviews as any}
    />
  )
}
