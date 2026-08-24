import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import TenantSidebar from '@/components/tenant/TenantSidebar'
import { NotificationBell } from '@/components/notifications/NotificationBell'

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // If unauthenticated (e.g. on /tenant/login), render children without sidebar
  if (!session || session.user.role !== 'TENANT') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* Dark styled Sidebar */}
      <TenantSidebar user={session.user} />

      {/* Workspace panel */}
      <div className="flex-1 lg:pl-64 pl-0 flex flex-col min-h-screen">
        {/* Top bar with Notification Bell */}
        <div className="h-16 px-6 sm:px-10 flex items-center justify-end border-b border-slate-200 bg-white sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">Resident Portal</span>
            <NotificationBell />
          </div>
        </div>
        <div className="p-8 sm:p-10 flex flex-col gap-8 w-full max-w-5xl">
          {children}
        </div>
      </div>
    </div>
  )
}
