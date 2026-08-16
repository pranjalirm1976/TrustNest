import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ComplaintsClient from '@/components/complaints/ComplaintsClient'
import { ShieldAlert, Building2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TenantComplaintsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/tenant/login')
  }

  // Get active stay details to verify property assignment
  const stay = await prisma.residentStay.findFirst({
    where: {
      tenantId: session.user.id,
      status: 'ACTIVE',
    },
    include: {
      bed: {
        include: {
          room: {
            include: {
              floor: {
                include: {
                  property: true,
                },
              },
            },
          },
        },
      },
    },
  })

  // Guard: If resident has no active stay contract, block ticket submissions
  if (!stay) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-premium-sm text-center py-16 flex flex-col items-center justify-center gap-4 max-w-xl mx-auto mt-10">
        <div className="w-14 h-14 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center">
          <ShieldAlert className="w-7 h-7 text-brand-accent animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Active stay required</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-normal">
            You must have a verified active PG stay registration to submit SLA maintenance tickets. Please contact your property manager.
          </p>
        </div>
      </div>
    )
  }

  // Fetch tenant complaints with comment chains
  const complaints = await prisma.complaint.findMany({
    where: {
      tenantId: session.user.id,
    },
    include: {
      comments: {
        include: {
          author: true,
        },
        orderBy: {
          createdAt: 'asc', // ascending order to show discussion timeline correctly
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const propertyId = stay.bed.room.floor.property.id

  return (
    <ComplaintsClient
      complaints={complaints}
      propertyId={propertyId}
    />
  )
}
