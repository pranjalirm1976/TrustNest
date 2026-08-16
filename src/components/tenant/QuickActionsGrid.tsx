'use client'

import { CreditCard, AlertCircle, UtensilsCrossed, ExternalLink } from 'lucide-react'

interface QuickActionsGridProps {
  onPayRent: () => void
  onRaiseComplaint: () => void
  onRateFood: () => void
}

export default function QuickActionsGrid({
  onPayRent,
  onRaiseComplaint,
  onRateFood,
}: QuickActionsGridProps) {
  const actions = [
    {
      label: 'Pay Monthly Rent',
      desc: 'Check dues and pay online securely',
      icon: <CreditCard className="w-5 h-5 text-brand-primary" />,
      onClick: onPayRent,
    },
    {
      label: 'Raise Complaint Ticket',
      desc: 'SLA backed plumbing, wifi, or cleaning support',
      icon: <AlertCircle className="w-5 h-5 text-indigo-500" />,
      onClick: onRaiseComplaint,
    },
    {
      label: 'Rate Today’s Menu',
      desc: 'Log meal audits and give live feedback',
      icon: <UtensilsCrossed className="w-5 h-5 text-brand-success" />,
      onClick: onRateFood,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Quick Utilities</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map((act) => (
          <button
            key={act.label}
            onClick={act.onClick}
            className="bg-white border border-slate-200/80 rounded-2xl p-6 text-left shadow-premium-sm hover:shadow-premium transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer group hover:-translate-y-[1px]"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
                {act.icon}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-slate-900 leading-tight">{act.label}</span>
                <span className="text-[10px] text-slate-400 font-medium leading-tight">{act.desc}</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-305 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}
