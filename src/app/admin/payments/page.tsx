import { Metadata } from 'next'
import PaymentsClient, { FloorData, Transaction, OccupiedBedOption } from '@/components/admin/PaymentsClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Payments & Financials | TrustNest',
  description: 'Track expected vs. collected rent and manage financial transactions.',
}

export default async function PaymentsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'INSPECTOR')) {
    redirect('/admin/login')
  }

  const isInspector = session.user.role === 'INSPECTOR'

  // Fetch properties and their full hierarchy
  const properties = await prisma.property.findMany({
    where: isInspector ? {} : { ownerId: session.user.id },
    include: {
      floors: {
        include: {
          rooms: {
            include: {
              beds: {
                include: {
                  stays: {
                    where: { status: 'ACTIVE' },
                    include: {
                      tenant: true,
                      payments: {
                        orderBy: { createdAt: 'desc' },
                      }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { level: 'asc' }
      }
    }
  })

  // Fetch Booking Payments
  const bookingPayments = await prisma.payment.findMany({
    where: isInspector ? {} : {
      booking: {
        property: {
          ownerId: session.user.id
        }
      }
    },
    include: {
      booking: {
        include: {
          user: true,
          property: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Fetch Rent Payments
  const rentPayments = await prisma.rentPayment.findMany({
    where: isInspector ? {} : {
      stay: {
        bed: {
          room: {
            floor: {
              property: {
                ownerId: session.user.id
              }
            }
          }
        }
      }
    },
    include: {
      stay: {
        include: {
          tenant: true,
          bed: {
            include: {
              room: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Format Transactions
  const transactions: Transaction[] = [
    ...bookingPayments.map(p => ({
      id: p.id,
      date: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(p.createdAt)),
      resident: p.booking?.user?.name || 'Resident',
      room: `${p.booking?.property?.name || 'PG Stay'}`,
      amount: p.amount,
      method: p.paymentMethod || 'DEMO',
      status: (p.status as any) || 'PENDING',
      isBookingPayment: true
    })),
    ...rentPayments.map(rp => ({
      id: rp.id,
      date: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(rp.paidDate || rp.createdAt)),
      resident: rp.stay.tenant.name,
      room: `Room ${rp.stay.bed.room.roomNumber}`,
      amount: rp.amount,
      method: rp.transactionId?.startsWith('CASH') ? 'Cash' : (rp.transactionId ? 'UPI' : '-'),
      status: (rp.status as any) || 'PENDING',
      isBookingPayment: false
    }))
  ]

  // Format Floors
  let totalExpected = 0
  let totalCollected = 0
  const occupiedBeds: OccupiedBedOption[] = []

  const floors: FloorData[] = properties.flatMap(prop =>
    prop.floors.map(floor => {
      let floorExpected = 0
      let floorCollected = 0
      
      const rooms = floor.rooms.map(room => ({
        number: room.roomNumber,
        beds: room.beds.map(bed => {
          const activeStay = bed.stays[0]
          const latestPayment = activeStay?.payments?.[0]
          const status = latestPayment ? (latestPayment.status as any) : (activeStay ? 'PENDING' : 'PAID')
          const amount = activeStay ? activeStay.rentAmount : 0
          
          if (activeStay) {
            floorExpected += amount
            if (status === 'PAID') floorCollected += amount
            occupiedBeds.push({
              id: bed.id,
              label: `Room ${room.roomNumber} - Bed ${bed.identifier} (${activeStay.tenant.name})`,
              rentAmount: activeStay.rentAmount
            })
          }

          return {
            id: bed.id,
            identifier: bed.identifier,
            resident: activeStay?.tenant?.name || null,
            status,
            amount
          }
        })
      }))

      totalExpected += floorExpected
      totalCollected += floorCollected

      return {
        id: floor.id,
        name: `${floor.name} (${prop.name})`,
        expected: floorExpected,
        collected: floorCollected,
        rooms
      }
    })
  )

  const totalPending = totalExpected - totalCollected
  const collectionRate = totalExpected === 0 ? 0 : Math.round((totalCollected / totalExpected) * 100)

  // Fetch owner's TrustNest platform subscription
  const ownerSubscription = await prisma.ownerSubscription.findFirst({
    where: { ownerId: session.user.id },
    include: {
      invoices: {
        orderBy: { createdAt: 'desc' },
        take: 3
      }
    }
  })

  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payment &amp; Financial Management</h1>
        <p className="text-sm text-slate-500 mt-1">Financial control center to track expected vs. collected rent across your properties.</p>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col">
        <PaymentsClient 
          initialTransactions={transactions}
          initialFloors={floors}
          initialMetrics={{
            totalExpected,
            totalCollected,
            totalPending,
            collectionRate
          }}
          occupiedBeds={occupiedBeds}
          ownerSubscription={ownerSubscription as any}
        />
      </div>
    </div>
  )
}
