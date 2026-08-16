import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import StaySummaryCard from '@/components/tenant/StaySummaryCard'
import QuickActionsGrid from '@/components/tenant/QuickActionsGrid'
import ActiveIssuesWidget from '@/components/tenant/ActiveIssuesWidget'
import { CreditCard, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TenantDashboardPage() {
  const session = await getServerSession(authOptions)

  // Guard (redundant due to layout but keeps TS happy)
  if (!session) {
    redirect('/tenant/login')
  }

  // Fetch tenant stay details
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

  // Fetch recent rent payment details
  const lastPayment = stay
    ? await prisma.rentPayment.findFirst({
        where: { stayId: stay.id },
        orderBy: { dueDate: 'desc' },
      })
    : null

  // Fetch active maintenance tickets
  const complaints = await prisma.complaint.findMany({
    where: {
      tenantId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Flatten stay data structure for presentation component
  const formattedStay = stay
    ? {
        id: stay.id,
        startDate: stay.startDate,
        endDate: stay.endDate,
        status: stay.status,
        rentAmount: stay.rentAmount,
        property: {
          name: stay.bed.room.floor.property.name,
          address: stay.bed.room.floor.property.address,
        },
        room: {
          roomNumber: stay.bed.room.roomNumber,
        },
        bed: {
          identifier: stay.bed.identifier,
        },
      }
    : null

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Dashboard Top bar header */}
      <div className="flex flex-col gap-1.5 pb-4 border-b border-slate-200">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
          RESIDENT PORTAL
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, {session.user.name}
        </h1>
        <p className="text-xs text-slate-500">
          TrustNest Stay Portal. Real-time updates for your active co-living stay.
        </p>
      </div>

      {/* Grid of Main Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Summary and Actions (8 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Stay Summary */}
          <StaySummaryCard stay={formattedStay} />

          {/* Quick Actions Grid */}
          <QuickActionsGrid
            onPayRent={() => alert('Redirecting to Payment screen...')}
            onRaiseComplaint={() => alert('Opening Raise Complaint overlay...')}
            onRateFood={() => alert('Redirecting to Daily Meal rating feed...')}
          />
        </div>

        {/* Right Side: Billing and Active tickets (4 columns) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Rent Due Card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium-sm flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Rent & Dues
              </span>
              {lastPayment?.status === 'PAID' ? (
                <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  PAID
                </span>
              ) : lastPayment?.status === 'OVERDUE' ? (
                <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-100 text-red-700 animate-pulse">
                  OVERDUE
                </span>
              ) : (
                <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  PENDING
                </span>
              )}
            </div>

            {lastPayment ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">
                    Billing Month: {lastPayment.billingMonth}
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900 mt-1">
                    ₹{lastPayment.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Due Date: {new Date(lastPayment.dueDate).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-405">No billing records found for this stay contract.</p>
            )}
          </div>

          {/* Active Tickets Widget */}
          <ActiveIssuesWidget complaints={complaints} />

        </div>

      </div>
    </div>
  )
}
