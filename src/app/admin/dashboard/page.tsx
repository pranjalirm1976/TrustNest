import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { calculateTrustScore } from '@/lib/trust-score'
import DashboardClient from '@/components/admin/DashboardClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard | TrustNest',
  description: 'TrustNest PG Management Dashboard',
}

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/admin/login')
  }

  // Double check admin roles
  if (session.user.role !== 'OWNER' && session.user.role !== 'INSPECTOR') {
    redirect('/unauthorized')
  }

  // 1. Query properties owned by this admin
  const properties = await prisma.property.findMany({
    where: {
      ownerId: session.user.id,
    },
    select: {
      id: true,
      name: true,
    },
  })

  const propertyIds = properties.map((p) => p.id)

  // 2. Query total residents (active stays) in owner's properties
  const totalResidents = await prisma.residentStay.count({
    where: {
      status: 'ACTIVE',
      bed: {
        room: {
          floor: {
            propertyId: {
              in: propertyIds,
            },
          },
        },
      },
    },
  })

  // 3. Query total beds to compute available beds
  const totalBedsCount = await prisma.bed.count({
    where: {
      room: {
        floor: {
          propertyId: {
            in: propertyIds,
          },
        },
      },
    },
  })

  const availableBeds = Math.max(0, totalBedsCount - totalResidents)

  // 4. Query total paid revenue from stay billing logs
  const payments = await prisma.rentPayment.findMany({
    where: {
      status: 'PAID',
      stay: {
        bed: {
          room: {
            floor: {
              propertyId: {
                in: propertyIds,
              },
            },
          },
        },
      },
    },
    select: {
      amount: true,
    },
  })

  const monthlyCollection = payments.reduce((sum, p) => sum + p.amount, 0)

  // 5. Query incoming tenant complaints for these properties
  const complaints = await prisma.complaint.findMany({
    where: {
      propertyId: {
        in: propertyIds,
      },
    },
    include: {
      tenant: {
        select: {
          name: true,
        },
      },
      property: {
        select: {
          name: true,
        },
      },
      comments: {
        include: {
          author: {
            select: {
              name: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
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

  // Calculate detailed Trust Scores and active flags for each property managed by owner
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
        totalResidents,
        availableBeds,
        monthlyCollection,
        openComplaints,
        activeViolations,
      }}
      propertyDetails={propertyDetails}
    />
  )
}