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
  let session: any = null
  try {
    session = await getServerSession(authOptions)
  } catch (_) {}

  if (!session || (session.user?.role !== 'SUPER_ADMIN' && session.user?.role !== 'INSPECTOR')) {
    redirect('/admin/login')
  }

  // Fetch platform stats safely
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
  }).catch(() => [])

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
  }).catch(() => [])

  // Fetch recent platform complaints
  const complaints = await prisma.complaint.findMany({
    include: {
      property: { select: { id: true, name: true } },
      tenant: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  }).catch(() => [])

  // Fetch recent reviews
  const reviews = await prisma.propertyReview.findMany({
    include: {
      property: { select: { id: true, name: true } },
      tenant: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  }).catch(() => [])

  // Fetch 3D room captures
  const threeDCaptures = await prisma.room3DCapture.findMany({
    include: {
      property: { select: { id: true, name: true, address: true, owner: { select: { name: true, email: true } } } },
      floor: { select: { id: true, name: true, level: true } },
      room: { select: { id: true, roomNumber: true, sharingType: true, capacity: true } }
    },
    orderBy: { createdAt: 'desc' }
  }).catch(() => [])

  // Fetch all platform payments (Demo bookings and subscriptions)
  const payments = await prisma.payment.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      owner: { select: { id: true, name: true, email: true } },
      property: { select: { id: true, name: true, address: true } },
      booking: true,
      split: true
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  }).catch(() => [])

  // Fetch all in-app chat threads for moderation
  const chatThreads = await prisma.chatThread.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      owner: { select: { id: true, name: true, email: true } },
      property: { select: { id: true, name: true, address: true } },
      messages: {
        include: {
          sender: { select: { id: true, name: true, role: true } }
        },
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { updatedAt: 'desc' },
    take: 50
  }).catch(() => [])

  const totalOwnersCount = await prisma.user.count({ where: { role: 'OWNER' } }).catch(() => 0)

  return (
    <SuperAdminDashboardClient
      user={session.user}
      stats={stats}
      totalOwnersCount={totalOwnersCount}
      properties={properties as any}
      subscriptions={subscriptions as any}
      payments={payments as any}
      chatThreads={chatThreads as any}
      complaints={complaints as any}
      reviews={reviews as any}
      threeDCaptures={threeDCaptures as any}
    />
  )
}
