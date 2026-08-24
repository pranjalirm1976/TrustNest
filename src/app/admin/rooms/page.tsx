import { Metadata } from 'next'
import RoomsClient from '@/components/admin/RoomsClient'

export const metadata: Metadata = {
  title: 'Rooms & Beds | TrustNest',
  description: 'Manage individual rooms, bed assignments, and room templates',
}

export default function RoomsPage() {
  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Rooms & Beds</h1>
        <p className="text-sm text-slate-500 mt-1">Manage individual rooms, bed assignments, and room templates.</p>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col">
        <RoomsClient />
      </div>
    </div>
  )
}
