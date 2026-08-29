import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import RoomsClient from '@/components/admin/RoomsClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Rooms & Beds | TrustNest',
  description: 'Manage individual rooms, bed assignments, and room templates',
}

export default async function RoomsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'PG_OWNER' && session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'INSPECTOR')) {
    redirect('/admin/login')
  }

  const isSuperAdmin = session.user.role === 'SUPER_ADMIN' || session.user.role === 'INSPECTOR'

  // Fetch properties and rooms for this owner
  const property = await prisma.property.findFirst({
    where: isSuperAdmin ? {} : { ownerId: session.user.id },
    include: {
      floors: {
        include: {
          rooms: {
            include: {
              beds: {
                include: {
                  stays: {
                    where: { status: 'ACTIVE' },
                    include: { tenant: { select: { name: true } } }
                  }
                }
              },
              threeDCaptures: {
                orderBy: { createdAt: 'desc' },
                take: 1
              }
            },
            orderBy: { roomNumber: 'asc' }
          }
        },
        orderBy: { level: 'asc' }
      }
    }
  })

  // Format rooms for RoomsClient
  const initialRooms = property?.floors?.flatMap(f => f.rooms.map(r => ({
    id: r.id,
    number: r.roomNumber,
    floorName: f.name,
    capacity: r.capacity,
    sharingType: r.sharingType || `${r.capacity} Sharing`,
    pricePerBed: r.pricePerBed || property.priceFrom,
    beds: r.beds.map(b => ({
      id: b.id,
      identifier: b.identifier,
      status: b.status as any,
      residentName: b.stays[0]?.tenant?.name || undefined,
      paymentStatus: 'PAID' as any
    })),
    has3DModel: r.threeDCaptures.length > 0,
    threeDStatus: r.threeDCaptures[0]?.status || null
  }))) || []

  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      <div className="mb-6 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Rooms &amp; Beds</h1>
          <p className="text-sm text-slate-500 mt-1">
            {property ? `${property.name} — Manage rooms, bed occupancy, and 3D View capture.` : 'Manage individual rooms, bed assignments, and room templates.'}
          </p>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col">
        <RoomsClient initialRoomsData={initialRooms} propertyId={property?.id} />
      </div>
    </div>
  )
}
