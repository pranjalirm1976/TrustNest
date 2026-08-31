import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { calculateTrustScore } from '@/lib/trust-score'
import DashboardClient from '@/components/admin/DashboardClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Owner Dashboard | TrustNest',
  description: 'TrustNest PG Management Dashboard',
}

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  let session: any = null
  try {
    session = await getServerSession(authOptions)
  } catch (_) {}

  if (!session) {
    redirect('/admin/login')
  }

  const isSuperAdmin = session.user?.role === 'SUPER_ADMIN' || session.user?.role === 'INSPECTOR'
  const isOwner = session.user?.role === 'OWNER' || session.user?.role === 'PG_OWNER'

  if (!isSuperAdmin && !isOwner) {
    redirect('/unauthorized')
  }

  try {
    const properties = await prisma.property.findMany({
      where: isSuperAdmin ? {} : {
        ownerId: session.user.id,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { createdAt: 'desc' }
    }).catch(() => [])

    const propertyIds = properties.map((p) => p.id)

    const totalResidents = propertyIds.length > 0 ? await prisma.residentStay.count({
      where: {
        status: 'ACTIVE',
        bed: { room: { floor: { propertyId: { in: propertyIds } } } },
      },
    }).catch(() => 0) : 0

    const totalBedsCount = propertyIds.length > 0 ? await prisma.bed.count({
      where: {
        room: { floor: { propertyId: { in: propertyIds } } },
      },
    }).catch(() => 0) : 0

    const totalRoomsCount = propertyIds.length > 0 ? await prisma.room.count({
      where: {
        floor: { propertyId: { in: propertyIds } },
      },
    }).catch(() => 0) : 0

    const trustNestBedsCount = propertyIds.length > 0 ? await prisma.bed.count({
      where: {
        room: { floor: { propertyId: { in: propertyIds } } },
        isTrustNestInventory: true,
      },
    }).catch(() => 0) : 0

    const ownerManagedBedsCount = Math.max(0, totalBedsCount - trustNestBedsCount)

    const trustNestOccupiedCount = propertyIds.length > 0 ? await prisma.residentStay.count({
      where: {
        status: 'ACTIVE',
        bed: {
          isTrustNestInventory: true,
          room: { floor: { propertyId: { in: propertyIds } } },
        },
      },
    }).catch(() => 0) : 0

    const trustNestAvailableCount = Math.max(0, trustNestBedsCount - trustNestOccupiedCount)
    const allocationPercent = totalBedsCount > 0 ? Math.round((trustNestBedsCount / totalBedsCount) * 100) : 0

    const availableBeds = Math.max(0, totalBedsCount - totalResidents)

    const paidPayments = propertyIds.length > 0 ? await prisma.rentPayment.findMany({
      where: {
        status: 'PAID',
        stay: { bed: { room: { floor: { propertyId: { in: propertyIds } } } } },
      },
      select: { amount: true },
    }).catch(() => []) : []
    const monthlyCollection = paidPayments.reduce((sum, p) => sum + p.amount, 0)

    const pendingPayments = propertyIds.length > 0 ? await prisma.rentPayment.findMany({
      where: {
        status: 'PENDING',
        stay: { bed: { room: { floor: { propertyId: { in: propertyIds } } } } },
      },
      select: { amount: true },
    }).catch(() => []) : []
    const pendingRent = pendingPayments.reduce((sum, p) => sum + p.amount, 0)

    const complaints = propertyIds.length > 0 ? await prisma.complaint.findMany({
      where: {
        propertyId: { in: propertyIds },
      },
      include: {
        tenant: { select: { name: true } },
        property: { select: { name: true } },
        comments: {
          include: {
            author: { select: { name: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []) : []

    const openComplaints = complaints.filter(
      (c) => c.status !== 'RESOLVED' && c.status !== 'REJECTED'
    ).length

    const activeViolations = complaints.filter(
      (c) =>
        c.status !== 'RESOLVED' &&
        c.status !== 'REJECTED' &&
        new Date() > new Date(c.slaDeadline)
    ).length

    // Calculate detailed Trust Scores safely
    const propertyDetails = await Promise.all(
      properties.map(async (p) => {
        let breakdown: any = {
          score: 4.8,
          reviewsAvg: 4.8,
          foodAvg: 4.5,
          totalReviews: 0,
          totalFoodRatings: 0,
          slaBreaches: 0,
          activeFlags: 0,
          reviewImpact: 2.88,
          foodImpact: 0.9,
          slaPenalty: 0,
          flagPenalty: 0
        }
        try {
          breakdown = await calculateTrustScore(p.id)
        } catch (_) {}

        const flags = await prisma.propertyFlag.findMany({
          where: { propertyId: p.id },
        }).catch(() => [])
        
        return {
          propertyId: p.id,
          propertyName: p.name,
          breakdown,
          flags: flags.map((f) => ({
            id: f.id,
            type: f.type,
            reason: f.reason,
            isActive: f.isActive,
          })),
        }
      })
    )

    return (
      <DashboardClient
        properties={properties}
        complaints={complaints}
        stats={{
          totalPGs: properties.length,
          totalRooms: totalRoomsCount,
          totalResidents,
          occupiedBeds: totalResidents,
          availableBeds,
          totalBedsCount,
          trustNestBedsCount,
          ownerManagedBedsCount,
          trustNestOccupiedCount,
          trustNestAvailableCount,
          allocationPercent,
          monthlyCollection,
          pendingRent,
          openComplaints,
          activeViolations,
        }}
        propertyDetails={propertyDetails}
      />
    )
  } catch (error) {
    console.error('AdminDashboard rendering error:', error)
    return (
      <DashboardClient
        properties={[]}
        complaints={[]}
        stats={{
          totalPGs: 0,
          totalRooms: 0,
          totalResidents: 0,
          occupiedBeds: 0,
          availableBeds: 0,
          totalBedsCount: 0,
          trustNestBedsCount: 0,
          ownerManagedBedsCount: 0,
          trustNestOccupiedCount: 0,
          trustNestAvailableCount: 0,
          allocationPercent: 0,
          monthlyCollection: 0,
          pendingRent: 0,
          openComplaints: 0,
          activeViolations: 0,
        }}
        propertyDetails={[]}
      />
    )
  }
}