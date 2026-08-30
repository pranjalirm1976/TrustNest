import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getOwnerSubscriptionDetails } from '@/actions/subscription.actions'
import SubscriptionClient from './SubscriptionClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'PG Owner Subscription | TrustNest Admin',
  description: 'Manage your TrustNest PG Owner Plan and demo platform billing.',
}

export default async function AdminSubscriptionPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'PG_OWNER' && session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'INSPECTOR')) {
    redirect('/admin/login')
  }

  const data = await getOwnerSubscriptionDetails()

  return (
    <div className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">PG Owner Platform Subscription</h1>
        <p className="text-sm text-slate-500 mt-1">
          Activate and manage your TrustNest verified partner listing subscription.
        </p>
      </div>

      <SubscriptionClient
        owner={data.owner || { id: session.user.id, name: session.user.name, email: session.user.email }}
        initialSubscription={data.subscription}
        properties={data.properties || []}
      />
    </div>
  )
}
