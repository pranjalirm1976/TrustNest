import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import TenantLoginForm from './TenantLoginForm'

export const metadata = {
  title: 'Resident Login - TrustNest',
  description: 'Log in to your TrustNest verified resident portal to pay rent, view menu logs and raise maintenance tickets.',
}

export default async function TenantLoginPage() {
  const session = await getServerSession(authOptions)

  // If already logged in, redirect to dashboard
  if (session?.user) {
    if (session.user.role === 'TENANT') {
      redirect('/tenant/dashboard')
    } else {
      redirect('/unauthorized')
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfbfb] flex items-center justify-center p-4">
      <TenantLoginForm />
    </div>
  )
}
