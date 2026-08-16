'use client'

import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react'

type Flag = {
  id: string
  type: string // "SLA_BREACH" | "FOOD_WARNING" | "TENANT_REPORT"
  reason: string
  isActive: boolean
}

interface ActiveFlagsDisplayProps {
  flags: Flag[]
}

export default function ActiveFlagsDisplay({ flags }: ActiveFlagsDisplayProps) {
  const activeFlags = flags.filter(f => f.isActive)

  if (activeFlags.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-4 flex items-center gap-3 w-full">
        <CheckCircle2 className="w-5 h-5 text-brand-success shrink-0" />
        <span className="text-xs text-emerald-900 font-semibold">
          No compliance flags active. Property is operating cleanly within all contract-backed guidelines.
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {activeFlags.map((flag) => (
        <div 
          key={flag.id}
          className="bg-brand-danger-light border border-brand-danger/25 p-4 rounded-2xl flex gap-3.5 items-start animate-in"
        >
          <ShieldAlert className="w-5 h-5 text-brand-danger shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[9px] font-extrabold text-brand-danger uppercase tracking-widest font-mono">
              Active {flag.type.replace('_', ' ')} Warning Flag
            </span>
            <h4 className="text-sm font-extrabold text-slate-900 leading-tight">Property Flagged</h4>
            <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
              Reason: <span className="font-semibold text-slate-700 italic">"{flag.reason}"</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
