import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ReactNode } from 'react'

interface OwnerLayoutProps {
  children: ReactNode
}

export default async function OwnerLayout({ children }: OwnerLayoutProps) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'INSPECTOR')) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content Area */}
      <div className="lg:pl-[260px] min-h-screen flex flex-col">
        {/* Header */}
        <AdminHeader user={session.user} />
        
        {/* Page Content */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
