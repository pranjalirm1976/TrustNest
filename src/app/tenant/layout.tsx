import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import TenantSidebar from '@/components/tenant/TenantSidebar'

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Route protection gate
  if (!session) {
    redirect('/tenant/login')
  }

  // Enforce TENANT role constraint
  if (session.user.role !== 'TENANT') {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Dark styled Sidebar */}
      <TenantSidebar user={session.user} />

      {/* Workspace panel */}
      <div className="flex-1 lg:pl-64 pl-0 flex flex-col min-h-screen">
        <div className="p-8 sm:p-10 pt-20 lg:pt-10 flex flex-col gap-8 w-full max-w-5xl">
          {children}
        </div>
      </div>
    </div>
  )
}
