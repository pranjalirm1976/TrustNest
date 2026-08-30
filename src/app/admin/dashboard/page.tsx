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
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/admin/login')
  }

  const isSuperAdmin = session.user.role === 'SUPER_ADMIN' || session.user.role === 'INSPECTOR'
  const isOwner = session.user.role === 'OWNER' || session.user.role === 'PG_OWNER'

  if (!isSuperAdmin && !isOwner) {
    redirect('/unauthorized')
  }

  const properties = await prisma.property.findMany({
    where: isSuperAdmin ? {} : {
      ownerId: session.user.id,
    },
    select: {
      id: true,
      name: true,
    },
  })

  const propertyIds = properties.map((p) => p.id)

  const totalResidents = await prisma.residentStay.count({
    where: {
      status: 'ACTIVE',
      bed: { room: { floor: { propertyId: { in: propertyIds } } } },
    },
  })

  const totalBedsCount = await prisma.bed.count({
    where: {
      room: { floor: { propertyId: { in: propertyIds } } },
    },
  })

  const totalRoomsCount = await prisma.room.count({
    where: {
      floor: { propertyId: { in: propertyIds } },
    },
  })

  const availableBeds = Math.max(0, totalBedsCount - totalResidents)

  const paidPayments = await prisma.rentPayment.findMany({
    where: {
      status: 'PAID',
      stay: { bed: { room: { floor: { propertyId: { in: propertyIds } } } } },
    },
    select: { amount: true },
  })
  const monthlyCollection = paidPayments.reduce((sum, p) => sum + p.amount, 0)

  const pendingPayments = await prisma.rentPayment.findMany({
    where: {
      status: 'PENDING',
      stay: { bed: { room: { floor: { propertyId: { in: propertyIds } } } } },
    },
    select: { amount: true },
  })
  const pendingRent = pendingPayments.reduce((sum, p) => sum + p.amount, 0)

  const complaints = await prisma.complaint.findMany({
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
  })

  const openComplaints = complaints.filter(
    (c) => c.status !== 'RESOLVED' && c.status !== 'REJECTED'
  ).length

  const activeViolations = complaints.filter(
    (c) =>
      c.status !== 'RESOLVED' &&
      c.status !== 'REJECTED' &&
      new Date() > new Date(c.slaDeadline)
  ).length

  // Calculate detailed Trust Scores
  const propertyDetails = await Promise.all(
    properties.map(async (p) => {
      const breakdown = await calculateTrustScore(p.id)
      const flags = await prisma.propertyFlag.findMany({
        where: { propertyId: p.id },
      })
      
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
        monthlyCollection,
        pendingRent,
        openComplaints,
        activeViolations,
      }}
      propertyDetails={propertyDetails}
    />
  )
}