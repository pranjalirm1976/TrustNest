'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CreateComplaintForm from './CreateComplaintForm'
import ComplaintList from './ComplaintList'
import { ShieldCheck, MessageSquarePlus } from 'lucide-react'

type CommentUser = {
  name: string
  role: string
}

type Comment = {
  id: string
  comment: string
  createdAt: Date
  author: CommentUser
}

type Complaint = {
  id: string
  title: string
  description: string
  category: string
  status: string
  severity: string
  createdAt: Date
  slaDeadline: Date
  resolvedAt: Date | null
  comments: Comment[]
}

interface ComplaintsClientProps {
  complaints: Complaint[]
  propertyId: string
}

export default function ComplaintsClient({
  complaints,
  propertyId,
}: ComplaintsClientProps) {
  const router = useRouter()
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleUpdate = () => {
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header with quick file trigger */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Maintenance SLA tickets</h1>
          <p className="text-xs text-slate-500">
            Submit service requests backed by our contractually verified 24-hour SLA promise.
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl shadow-premium transition-all cursor-pointer ${
            showCreateForm
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              : 'bg-brand-primary hover:bg-brand-primary-dark text-white'
          }`}
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>{showCreateForm ? 'View Ticket List' : 'Raise SLA Ticket'}</span>
        </button>
      </div>

      {/* Conditional Create Form display */}
      {showCreateForm ? (
        <div className="max-w-2xl mx-auto w-full">
          <CreateComplaintForm
            propertyId={propertyId}
            onSuccess={() => {
              setShowCreateForm(false)
              handleUpdate()
            }}
          />
        </div>
      ) : (
        /* Complaints layout */
        <ComplaintList
          complaints={complaints}
          onCommentAdded={handleUpdate}
        />
      )}

    </div>
  )
}
