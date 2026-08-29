import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getMyChatThreads } from '@/actions/chat.actions'
import TenantChatClient from './TenantChatClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'In-App Messages | TrustNest Resident',
  description: 'Private in-app chat with your PG Owner and property managers.',
}

export default async function TenantChatPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/login')
  }

  const res = await getMyChatThreads()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">In-App Chat with PG Owner</h1>
        <p className="text-xs text-slate-500 mt-1">
          Private, direct communication with property management without exposing personal phone or WhatsApp numbers.
        </p>
      </div>

      <TenantChatClient
        currentUser={session.user}
        initialThreads={res.success ? res.threads || [] : []}
      />
    </div>
  )
}
