import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getMyChatThreads } from '@/actions/chat.actions'
import AdminChatClient from './AdminChatClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Resident Inquiries & Chats | TrustNest Admin',
  description: 'Manage in-app resident inquiries and prospective tenant messages.',
}

export default async function AdminChatPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'PG_OWNER' && session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'INSPECTOR')) {
    redirect('/admin/login')
  }

  const res = await getMyChatThreads()

  return (
    <div className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resident Inquiries &amp; In-App Chat</h1>
        <p className="text-sm text-slate-500 mt-1">
          Chat directly with prospective and active residents securely inside TrustNest.
        </p>
      </div>

      <AdminChatClient
        currentUser={session.user}
        initialThreads={res.success ? res.threads || [] : []}
      />
    </div>
  )
}
