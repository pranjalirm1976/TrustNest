import { Metadata } from 'next'
import ComplaintsClient from '@/components/admin/ComplaintsClient'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Complaints | TrustNest',
  description: 'Manage resident complaints and SLA tracking.',
}

export default async function ComplaintsPage() {
  const session = await getServerSession(authOptions)
  
  let complaints: any[] = []
  
  if (session && (session.user.role === 'OWNER' || session.user.role === 'PG_OWNER' || session.user.role === 'SUPER_ADMIN' || session.user.role === 'INSPECTOR')) {
    const isSuperAdmin = session.user.role === 'SUPER_ADMIN' || session.user.role === 'INSPECTOR'
    // Get owner's properties
    const properties = await prisma.property.findMany({
      where: isSuperAdmin ? {} : { ownerId: session.user.id },
      select: { id: true }
    })
    const propertyIds = properties.map(p => p.id)

    // Fetch complaints with tenant and comments
    complaints = await prisma.complaint.findMany({
      where: { propertyId: { in: propertyIds } },
      include: {
        tenant: true,
        comments: {
          orderBy: { createdAt: 'asc' },
          include: { author: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Complaint Management</h1>
        <p className="text-sm text-slate-500 mt-1">Track issues and ensure strict 24-hour SLA resolution for all residents.</p>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col">
        <ComplaintsClient initialComplaints={complaints} />
      </div>
    </div>
  )
}
