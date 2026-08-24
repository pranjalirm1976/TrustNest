import { Metadata } from 'next'
import ResidentsClient from '@/components/admin/ResidentsClient'

export const metadata: Metadata = {
  title: 'Residents | TrustNest',
  description: 'Manage PG residents securely',
}

export default function ResidentsPage() {
  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resident Database</h1>
        <p className="text-sm text-slate-500 mt-1">A secure, encrypted view of all property residents.</p>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col">
        <ResidentsClient />
      </div>
    </div>
  )
}
