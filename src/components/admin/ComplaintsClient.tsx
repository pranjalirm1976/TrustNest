'use client'

import { useState } from 'react'
import type { ReactNode, MouseEvent } from 'react'
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  MessageSquare,
  MoreVertical,
  X,
  List,
  KanbanSquare,
  Send,
  Droplets,
  Zap,
  Sparkles,
  Utensils,
  Wifi,
  ShieldCheck,
  Wrench,
  Search
} from 'lucide-react'

import { addComplaintReply, resolveComplaint } from '@/actions/complaint.actions'

import { calculateSLAStatus, SLAType } from '@/lib/sla-utils'

const formatDate = (d: Date) => {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d)
}

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
type TicketCategory = string

export interface Ticket {
  id: string
  residentName: string
  room: string
  category: TicketCategory
  createdTime: string
  status: TicketStatus
  slaState: SLAType
  slaText: string
  description: string
  comments: any[]
}

export default function ComplaintsClient({ initialComplaints }: { initialComplaints?: any[] }) {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [resolveModalOpen, setResolveModalOpen] = useState(false)
  const [ticketToResolve, setTicketToResolve] = useState<Ticket | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isResolving, setIsResolving] = useState(false)

  // Map DB to Component Interface
  const tickets: Ticket[] = (initialComplaints || []).map(c => {
    const sla = calculateSLAStatus(new Date(c.slaDeadline), c.resolvedAt ? new Date(c.resolvedAt) : null)
    return {
      id: c.id,
      residentName: c.tenant?.name || 'Unknown',
      room: 'TBD', // Schema does not easily link tenant to room without a deep query in this page.
      category: c.category,
      createdTime: formatDate(new Date(c.createdAt)),
      status: c.status as TicketStatus,
      slaState: sla.status,
      slaText: sla.timeRemaining,
      description: c.description,
      comments: c.comments || []
    }
  })

  // Metrics
  const openCount = tickets.filter(t => t.status === 'OPEN').length
  const dueSoonCount = tickets.filter(t => t.slaState === 'DUE_SOON').length
  const overdueCount = tickets.filter(t => t.slaState === 'OVERDUE').length
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length

  // Handlers
  const openResolveModal = (t: Ticket, e?: MouseEvent) => {
    if (e) e.stopPropagation()
    setTicketToResolve(t)
    setResolveModalOpen(true)
  }

  const confirmResolve = async () => {
    if (!ticketToResolve) return
    setIsResolving(true)
    try {
      const res = await resolveComplaint(ticketToResolve.id)
      if (res.success) {
        setResolveModalOpen(false)
        setSelectedTicket(null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsResolving(false)
      setTicketToResolve(null)
    }
  }

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return
    setIsSending(true)
    try {
      // Optimistic update in UI would be here, but we will rely on revalidatePath refreshing the props
      const res = await addComplaintReply(selectedTicket.id, replyText)
      if (res.success) {
        setReplyText('')
        // Optionally update the local selectedTicket comment array if we don't want to wait for refresh
        const newComment = {
           id: Date.now().toString(),
           comment: replyText,
           createdAt: new Date().toISOString(),
           author: { name: 'You (Owner)' }
        }
        setSelectedTicket(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : prev)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSending(false)
    }
  }

  // Visual Mappings
  const categoryIcons: Record<string, ReactNode> = {
    Water: <Droplets className="w-3.5 h-3.5" />,
    Electricity: <Zap className="w-3.5 h-3.5" />,
    Cleaning: <Sparkles className="w-3.5 h-3.5" />,
    Food: <Utensils className="w-3.5 h-3.5" />,
    'Wi-Fi': <Wifi className="w-3.5 h-3.5" />,
    Security: <ShieldCheck className="w-3.5 h-3.5" />,
    Maintenance: <Wrench className="w-3.5 h-3.5" />
  }

  const getCategoryIcon = (cat: string) => {
    return categoryIcons[cat] || <AlertTriangle className="w-3.5 h-3.5" />
  }

  const statusColors: Record<TicketStatus, string> = {
    OPEN: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }

  const getSlaStyles = (state: SLAType) => {
    if (state === 'OVERDUE') return 'text-red-600 font-extrabold bg-red-50 border border-red-200 px-2 py-1 rounded'
    if (state === 'DUE_SOON') return 'text-amber-600 font-bold bg-amber-50 border border-amber-200 px-2 py-1 rounded'
    if (state === 'RESOLVED') return 'text-slate-400 font-medium'
    return 'text-slate-600 font-semibold bg-slate-100 border border-slate-200 px-2 py-1 rounded' // SAFE
  }

  return (
    <div className="flex flex-col h-full gap-6 relative">
      
      {/* Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Open Tickets</span>
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 tabular-nums">{openCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Due Soon (&lt;4h)</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 tabular-nums">{dueSoonCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Overdue</span>
          </div>
          <div className="text-3xl font-extrabold text-red-600 tabular-nums">{overdueCount}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Resolved</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 tabular-nums">{resolvedCount}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col min-h-0 relative z-0">
        
        {/* Toolbar */}
        <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search ID or resident..." 
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <KanbanSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-white">
          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-3 border border-emerald-100">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No Active Complaints</h3>
              <p className="text-sm text-slate-500 max-w-sm">All resident requests and maintenance issues have been resolved within the 24-hour SLA.</p>
            </div>
          ) : viewMode === 'list' ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block w-full">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">SLA Timer</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(t => (
                      <tr 
                        key={t.id} 
                        onClick={() => setSelectedTicket(t)}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-900">{t.id}</div>
                          <div className="text-xs font-medium text-slate-500">{t.residentName} • Room {t.room}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded w-max">
                            {getCategoryIcon(t.category)} {t.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColors[t.status]}`}>
                            {t.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                          {t.createdTime}
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-xs ${getSlaStyles(t.slaState)} w-max`}>
                            {t.slaText}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {t.status !== 'RESOLVED' && (
                              <button 
                                onClick={(e) => openResolveModal(t, e)}
                                className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded transition-colors shadow-sm"
                              >
                                Resolve
                              </button>
                            )}
                            <button className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded transition-colors shadow-sm">
                              Respond
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Stacked Cards */}
              <div className="md:hidden flex flex-col p-4 gap-4 bg-slate-50">
                {tickets.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => setSelectedTicket(t)}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColors[t.status]}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                      <div className={`text-[10px] uppercase ${getSlaStyles(t.slaState)}`}>
                        {t.slaText}
                      </div>
                    </div>
                    
                    <h3 className="text-sm font-bold text-slate-900 mb-1">{t.id} - {t.category}</h3>
                    <p className="text-xs font-medium text-slate-500 mb-3">{t.residentName} • Room {t.room}</p>
                    
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                      {t.status !== 'RESOLVED' && (
                        <button 
                          onClick={(e) => openResolveModal(t, e)}
                          className="flex-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 py-2 rounded transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                      <button className="flex-1 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 py-2 rounded transition-colors">
                        Respond
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Kanban View (Simplified placeholder) */
            <div className="p-6 bg-slate-50 h-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                {['OPEN', 'IN_PROGRESS', 'RESOLVED'].map(status => (
                  <div key={status} className="flex flex-col bg-slate-100/50 border border-slate-200 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{status.replace('_', ' ')}</h3>
                    <div className="space-y-3">
                      {tickets.filter(t => t.status === status).map(t => (
                        <div key={t.id} onClick={() => setSelectedTicket(t)} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm cursor-pointer hover:border-indigo-300">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-slate-900">{t.id}</span>
                            <div className={`text-[10px] ${getSlaStyles(t.slaState)}`}>{t.slaText}</div>
                          </div>
                          <p className="text-xs font-medium text-slate-500">{t.residentName}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer (Activity Log) */}
      {selectedTicket && (
        <>
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" onClick={() => setSelectedTicket(null)}></div>
          <div className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-white shadow-2xl z-50 border-l border-slate-200 flex flex-col transform transition-transform">
            
            <div className="border-b border-slate-100 p-5 bg-slate-50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedTicket.id}</h2>
                  <p className="text-sm font-medium text-slate-500">{selectedTicket.residentName} • Room {selectedTicket.room}</p>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[selectedTicket.status]}`}>
                  {selectedTicket.status.replace('_', ' ')}
                </span>
                <span className={`text-[10px] uppercase ${getSlaStyles(selectedTicket.slaState)}`}>
                  {selectedTicket.slaText}
                </span>
              </div>
            </div>

            {/* Chat/Activity Log */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-50/50 space-y-6">
              {/* Resident Original Ticket */}
              <div className="flex flex-col gap-1 max-w-[85%]">
                <span className="text-[10px] font-bold text-slate-500 ml-1">{selectedTicket.residentName} • {selectedTicket.createdTime}</span>
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm shadow-sm">
                  <p className="text-sm text-slate-700">{selectedTicket.description}</p>
                </div>
              </div>

              {selectedTicket.comments.map(c => {
                const isOwner = c.author?.name?.includes('You') || c.author?.role === 'OWNER' // heuristic for demo
                return (
                  <div key={c.id} className={`flex flex-col gap-1 max-w-[85%] ${isOwner ? 'self-end items-end ml-auto' : ''}`}>
                    <span className={`text-[10px] font-bold text-slate-500 ${isOwner ? 'mr-1' : 'ml-1'}`}>
                      {c.author?.name || 'Unknown'} • {formatDate(new Date(c.createdAt))}
                    </span>
                    <div className={`${isOwner ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 rounded-tl-sm'} p-3 rounded-2xl shadow-sm`}>
                      <p className="text-sm">{c.comment}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input Box */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  disabled={isSending || selectedTicket.status === 'RESOLVED'}
                  placeholder={selectedTicket.status === 'RESOLVED' ? "Ticket resolved. Cannot reply." : "Type a response to the resident..."} 
                  className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-full text-sm focus:outline-none focus:border-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                <button 
                  onClick={handleSendReply}
                  disabled={isSending || selectedTicket.status === 'RESOLVED' || !replyText.trim()}
                  className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-colors shadow-sm shrink-0"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Resolve Confirmation Modal */}
      {resolveModalOpen && ticketToResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setResolveModalOpen(false)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Resolve Ticket?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure this is resolved? The resident will be notified that {ticketToResolve.id} has been closed.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setResolveModalOpen(false)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 text-sm font-semibold py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmResolve}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors shadow-sm"
              >
                Yes, Resolve
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
