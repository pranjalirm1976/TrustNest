import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ReactNode } from 'react'

interface AdminLayoutProps {
  children: ReactNode
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession(authOptions)

  // Fallback check (middleware should handle this, but extra safety)
  if (!session) {
    redirect('/admin/login')
  }

  // Ensure user has admin privileges
  if (session.user.role !== 'OWNER' && session.user.role !== 'INSPECTOR') {
    redirect('/unauthorized')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content Area */}
      <div className="pl-64 min-h-screen">
        {/* Header */}
        <AdminHeader user={session.user} />
        
        {/* Page Content */}
        <main className="py-6 px-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}