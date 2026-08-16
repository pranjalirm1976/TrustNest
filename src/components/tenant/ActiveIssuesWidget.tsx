'use client'

import { AlertTriangle, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

type Complaint = {
  id: string
  title: string
  category: string
  status: string // "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "REJECTED"
  severity: string
  createdAt: Date
  slaDeadline: Date
  isEscalated: boolean
}

interface ActiveIssuesWidgetProps {
  complaints: Complaint[]
}

export default function ActiveIssuesWidget({ complaints }: ActiveIssuesWidgetProps) {
  const activeComplaints = complaints.filter(
    c => c.status !== 'RESOLVED' && c.status !== 'REJECTED'
  )

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium-sm flex flex-col gap-4">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-brand-primary" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Tickets</span>
        </div>
        
        <span className="text-[10px] font-bold text-slate-400 font-mono">
          {activeComplaints.length} tickets open
        </span>
      </div>

      {activeComplaints.length === 0 ? (
        <div className="text-center py-6 flex flex-col items-center justify-center gap-1">
          <CheckCircle2 className="w-9 h-9 text-brand-success" />
          <p className="text-slate-800 font-bold text-sm">No Active Maintenance Issues</p>
          <p className="text-slate-400 text-xs mt-0.5">Everything is operating normally.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {activeComplaints.map((comp) => {
            const hasBreached = new Date() > new Date(comp.slaDeadline)
            const remainingHours = Math.max(
              0,
              Math.round((new Date(comp.slaDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60))
            )

            return (
              <div 
                key={comp.id}
                className={`border p-4 rounded-xl flex items-center justify-between gap-4 transition-all ${
                  hasBreached 
                    ? 'border-brand-danger/35 bg-brand-danger-light/20 text-brand-danger'
                    : 'border-slate-200 bg-[#fbfbfb]'
                }`}
              >
                {/* Details */}
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      {comp.category}
                    </span>
                    <span className={`text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                      comp.severity === 'HIGH' ? 'bg-red-100 text-red-700' :
                      comp.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {comp.severity}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate pr-1">{comp.title}</h4>
                </div>

                {/* SLA Timer */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <div className="flex flex-col items-end">
                    {hasBreached ? (
                      <span className="text-brand-danger font-extrabold text-[10px] uppercase tracking-widest flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Breached
                      </span>
                    ) : (
                      <>
                        <span className="text-slate-800 font-extrabold text-xs">{remainingHours}h</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">SLA Left</span>
                      </>
                    )}
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
