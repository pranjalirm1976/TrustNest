'use client'

import { useState } from 'react'
import { updateComplaintStatus, addComplaintComment } from '@/actions/complaint.actions'
import StatusBadge from '@/components/complaints/StatusBadge'
import SlaTimer from '@/components/complaints/SlaTimer'
import { Calendar, CheckCircle2, MessageSquare, Send, Loader2 } from 'lucide-react'

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
  tenant: {
    name: string
  }
  property: {
    name: string
  }
  comments: Comment[]
}

interface ComplaintManagerListProps {
  complaints: Complaint[]
  onUpdate: () => void
}

export default function ComplaintManagerList({
  complaints,
  onUpdate,
}: ComplaintManagerListProps) {
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(
    complaints[0]?.id || null
  )
  const [commentText, setCommentText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const selectedComplaint = complaints.find(c => c.id === selectedComplaintId)

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedComplaint) return
    setIsUpdatingStatus(true)
    try {
      await updateComplaintStatus(selectedComplaint.id, newStatus)
      onUpdate()
    } catch (err) {
      console.error(err)
      alert('Failed to update status. Please try again.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedComplaint || !commentText.trim()) return

    setIsSending(true)
    try {
      await addComplaintComment(selectedComplaint.id, commentText.trim())
      setCommentText('')
      onUpdate()
    } catch (err) {
      console.error(err)
      alert('Failed to add comment. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
      
      {/* Left Column: List of complaints (7 columns) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
          Incoming Tenant Complaints
        </h3>

        {complaints.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center text-slate-400 py-16 flex flex-col items-center justify-center gap-2">
            <CheckCircle2 className="w-10 h-10 text-slate-350" />
            <h4 className="text-sm font-bold text-slate-800">No Complaints Logged</h4>
            <p className="text-xs text-slate-400">All managed properties are operating cleanly within SLAs.</p>
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
                    isSelected ? 'border-brand-primary ring-2 ring-indigo-50' : 'border-slate-200/65'
                  }`}
                >
                  <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-slate-100 text-slate-700 text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md">
                        {comp.property.name}
                      </span>
                      <StatusBadge status={comp.status} />
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 truncate pr-2">{comp.title}</h4>

                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono">
                      <span>BY: {comp.tenant.name.toUpperCase()}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-350" />
                        {new Date(comp.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* SLA timer indicator */}
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

      {/* Right Column: Complaint Operator Chat Overlay (5 columns) */}
      <div className="lg:col-span-5 lg:sticky lg:top-48 z-10 w-full">
        {selectedComplaint ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium-sm flex flex-col gap-6 h-full max-h-[550px]">
            {/* Header info */}
            <div className="flex flex-col gap-1.5 pb-3 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Ticket details
                </span>
                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded text-white ${
                  selectedComplaint.severity === 'HIGH' ? 'bg-red-600' :
                  selectedComplaint.severity === 'MEDIUM' ? 'bg-amber-600' : 'bg-slate-500'
                }`}>
                  {selectedComplaint.severity} SEVERITY
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-950 leading-tight">
                {selectedComplaint.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                From: <span className="font-bold text-slate-700">{selectedComplaint.tenant.name}</span> (Room occupant)
              </p>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1">
                Details: <span className="font-normal text-slate-650 italic">"{selectedComplaint.description}"</span>
              </p>
            </div>

            {/* Operator Status Actions */}
            {selectedComplaint.status !== 'RESOLVED' && selectedComplaint.status !== 'REJECTED' && (
              <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200/40 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Update Ticket status</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    disabled={isUpdatingStatus || selectedComplaint.status === 'IN_PROGRESS'}
                    className="flex-1 bg-white border border-slate-200 hover:border-slate-350 text-slate-700 font-bold text-[10px] uppercase tracking-wider py-2 rounded-lg shadow-premium-sm transition-all cursor-pointer disabled:opacity-50 text-center"
                  >
                    Set In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange('RESOLVED')}
                    disabled={isUpdatingStatus}
                    className="flex-1 bg-brand-success hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider py-2 rounded-lg shadow-premium-sm transition-all cursor-pointer disabled:opacity-50 text-center"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            )}

            {/* Discussion comments timeline */}
            <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 flex flex-col gap-4 min-h-[140px]">
              {selectedComplaint.comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center my-auto">
                  No discussion comments logged. Use box below to message the resident.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {selectedComplaint.comments.map((comment) => (
                    <div 
                      key={comment.id}
                      className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl flex items-start gap-3"
                    >
                      <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-white shrink-0 text-[10px] font-bold">
                        {comment.author.role === 'OWNER' ? 'OP' : 'RE'}
                      </div>
                      
                      <div className="flex-1 flex flex-col gap-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-900 truncate">
                            {comment.author.name}
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono ml-1">
                              ({comment.author.role})
                            </span>
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {new Date(comment.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-650 font-medium leading-relaxed">
                          {comment.comment}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message input */}
            {selectedComplaint.status !== 'RESOLVED' && selectedComplaint.status !== 'REJECTED' && (
              <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-3 border-t border-slate-100 mt-auto">
                <input
                  type="text"
                  placeholder="Send instructions/replies to resident..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={isSending}
                  required
                  className="flex-1 bg-[#fbfbfb] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-indigo-50 transition-all font-semibold"
                />
                <button
                  type="submit"
                  disabled={isSending || !commentText.trim()}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white p-2.5 rounded-xl shadow-premium-sm transition-all cursor-pointer flex items-center justify-center shrink-0"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            )}

          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200/60 border-dashed rounded-2xl p-8 text-center text-slate-400 text-xs py-20 flex flex-col items-center justify-center gap-2">
            <MessageSquare className="w-10 h-10 text-slate-300" />
            <span>Select an active ticket from the history list to view timeline comments.</span>
          </div>
        )}
      </div>

    </div>
  )
}
