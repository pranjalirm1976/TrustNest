import { Metadata } from 'next'
import FloorsClient from '@/components/admin/FloorsClient'

export const metadata: Metadata = {
  title: 'Floors & Architectural Layout | TrustNest',
  description: 'Manage architectural floor layouts for properties',
}

export default function FloorsPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Architectural Layouts</h1>
        <p className="text-sm text-slate-500 mt-1">Manage floor plans, spatial organization, and structural dimensions.</p>
      </div>
      
      <FloorsClient />
    </div>
  )
}
