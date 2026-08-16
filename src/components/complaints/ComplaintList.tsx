'use client'

import { useState } from 'react'
import StatusBadge from './StatusBadge'
import SlaTimer from './SlaTimer'
import ComplaintChat from './ComplaintChat'
import { Calendar, Inbox, MessageSquare } from 'lucide-react'

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

interface ComplaintListProps {
  complaints: Complaint[]
  onCommentAdded: () => void
}

export default function ComplaintList({
  complaints,
  onCommentAdded,
}: ComplaintListProps) {
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(
    complaints[0]?.id || null
  )

  const selectedComplaint = complaints.find(c => c.id === selectedComplaintId)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
      
      {/* Left Column: Tickets list (7 columns) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Ticket History</h3>
        
        {complaints.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col items-center justify-center gap-2">
            <Inbox className="w-10 h-10 text-slate-350" />
            <h4 className="text-sm font-bold text-slate-800">No Tickets Filed</h4>
            <p className="text-xs text-slate-400 max-w-xs leading-normal">
              You haven't filed any service requests or complaints yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {complaints.map((comp) => {
              const isSelected = comp.id === selectedComplaintId
              
              return (
                <div
                  key={comp.id}
                  onClick={() => setSelectedComplaintId(comp.id)}
                  className={`bg-white border rounded-2xl p-5 text-left shadow-premium-sm hover:shadow-premium transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer ${
                    isSelected ? 'border-brand-primary ring-2 ring-indigo-50' : 'border-slate-200/60'
                  }`}
                >
                  <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        {comp.category}
                      </span>
                      <StatusBadge status={comp.status} />
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 truncate pr-2">{comp.title}</h4>
                    
                    <span className="text-[10px] text-slate-450 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-350" />
                      {new Date(comp.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  {/* Right side: SLA Countdown */}
                  <SlaTimer
                    createdAt={comp.createdAt}
                    slaDeadline={comp.slaDeadline}
                    resolvedAt={comp.resolvedAt}
                    status={comp.status}
                  />

                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Right Column: Chat/Activity thread (5 columns) */}
      <div className="lg:col-span-5 lg:sticky lg:top-48 z-10 w-full">
        {selectedComplaint ? (
          <ComplaintChat
            complaint={selectedComplaint}
            onCommentAdded={onCommentAdded}
          />
        ) : (
          <div className="bg-slate-50 border border-slate-200/60 border-dashed rounded-2xl p-8 text-center text-slate-400 text-xs py-20 flex flex-col items-center justify-center gap-2">
            <MessageSquare className="w-10 h-10 text-slate-300" />
            <span>Select a ticket from history to view activity logs and comments.</span>
          </div>
        )}
      </div>

    </div>
  )
}
