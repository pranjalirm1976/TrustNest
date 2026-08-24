import { Metadata } from 'next'
import PGRegistrationClient from '@/components/admin/PGRegistrationClient'

export const metadata: Metadata = {
  title: 'PG Registration | TrustNest',
  description: 'Register a new PG property on TrustNest',
}

export default function PGRegistrationPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Register New PG</h1>
        <p className="text-sm text-slate-500 mt-1">Onboard your property to the TrustNest network.</p>
      </div>
      
      <PGRegistrationClient />
    </div>
  )
}
