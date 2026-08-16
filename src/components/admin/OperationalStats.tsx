'use client'

import { Users, Bed, CreditCard, AlertCircle, ShieldAlert } from 'lucide-react'

interface OperationalStatsProps {
  totalResidents: number
  availableBeds: number
  monthlyCollection: number
  openComplaints: number
  activeViolations: number
}

export default function OperationalStats({
  totalResidents,
  availableBeds,
  monthlyCollection,
  openComplaints,
  activeViolations,
}: OperationalStatsProps) {
  const stats = [
    {
      label: 'Total Residents',
      value: totalResidents,
      change: 'Active stays',
      icon: <Users className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Available Beds',
      value: availableBeds,
      change: 'Immediate vacant slots',
      icon: <Bed className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-100',
    },
    {
      label: 'Monthly Collection',
      value: `₹${monthlyCollection.toLocaleString('en-IN')}`,
      change: 'Paid rent invoices',
      icon: <CreditCard className="w-5 h-5 text-indigo-650" />,
      bg: 'bg-indigo-50 border-indigo-100',
    },
    {
      label: 'Open Complaints',
      value: openComplaints,
      change: 'Requires technician',
      icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-100',
    },
  ]

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* SLA Alert warning strip if active violations exist */}
      {activeViolations > 0 && (
        <div className="bg-brand-danger-light border border-brand-danger/20 rounded-2xl p-4 flex items-center gap-3.5 animate-pulse">
          <ShieldAlert className="w-6 h-6 text-brand-danger shrink-0" />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 leading-tight">Critical SLA Violations</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                You have {activeViolations} ticket{activeViolations > 1 ? 's' : ''} unresolved past the contract 24-hour deadline. Mark as resolved or update status immediately.
              </p>
            </div>
            <span className="bg-brand-danger text-white text-[9px] font-extrabold px-2.5 py-1 rounded-lg">
              SLA BREACH
            </span>
          </div>
        </div>
      )}

      {/* Grid of Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-premium-sm flex flex-col gap-4"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                {stat.label}
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${stat.bg}`}>
                {stat.icon}
              </div>
            </div>
            
            <div className="flex flex-col gap-0.5 mt-2">
              <span className="text-2xl font-extrabold text-slate-900 leading-none">{stat.value}</span>
              <span className="text-[10px] text-slate-450 font-medium mt-1 leading-none">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
