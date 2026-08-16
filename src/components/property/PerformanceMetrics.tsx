'use client'

import { ShieldCheck, Clock, ThumbsUp, AlertTriangle, AlertCircle } from 'lucide-react'

type Complaint = {
  id: string
  status: string // "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "REJECTED"
  severity: string // "LOW" | "MEDIUM" | "HIGH"
  createdAt: Date
  slaDeadline: Date
  resolvedAt: Date | null
  isEscalated: boolean
}

interface PerformanceMetricsProps {
  complaints: Complaint[]
  trustScore: number
}

export default function PerformanceMetrics({ complaints, trustScore }: PerformanceMetricsProps) {
  // Compute SLA stats
  const totalComplaints = complaints.length
  
  // A resolved complaint complied with SLA if it was resolved before the deadline
  const resolvedWithinSLA = complaints.filter(
    c => c.status === 'RESOLVED' && c.resolvedAt && new Date(c.resolvedAt) <= new Date(c.slaDeadline)
  ).length

  // An open/assigned/in-progress complaint has breached if current time is past deadline
  const openBreaches = complaints.filter(
    c => c.status !== 'RESOLVED' && c.status !== 'REJECTED' && new Date() > new Date(c.slaDeadline)
  ).length

  // Total SLA breaches (either resolved late or currently open past deadline)
  const resolvedLate = complaints.filter(
    c => c.status === 'RESOLVED' && c.resolvedAt && new Date(c.resolvedAt) > new Date(c.slaDeadline)
  ).length

  const totalBreaches = openBreaches + resolvedLate
  
  // SLA Compliance Rate
  // If there are no complaints, compliance is 100%
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length
  const complianceRate = totalComplaints > 0
    ? Math.round(((totalComplaints - totalBreaches) / totalComplaints) * 100)
    : 100

  return (
    <div id="performance" className="py-12 border-b border-slate-100 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">TrustNest Performance Metrics</h2>
        <p className="text-sm text-slate-500">Live operational auditing and maintenance SLA compliance logs.</p>
      </div>

      {/* Main SLA stats panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1: Trust Score */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-premium flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Score</span>
            <span className="text-brand-primary bg-indigo-50 border border-indigo-100 text-xs font-bold px-2 py-0.5 rounded-lg shadow-premium-sm">
              Level A
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold text-slate-900">{trustScore.toFixed(1)}</span>
            <span className="text-xs text-slate-500 font-bold">/ 5.0</span>
          </div>
          <div className="flex gap-1 text-brand-accent text-xs">★★★★★</div>
          <p className="text-xs text-slate-400 leading-normal mt-2 border-t border-slate-100 pt-3">
            Computed daily based on tenant reviews, food quality rating, and SLA compliance.
          </p>
        </div>

        {/* Metric 2: SLA compliance rate */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-premium flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">24h SLA Compliance</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg shadow-premium-sm border ${
              complianceRate >= 95 
                ? 'text-brand-success bg-brand-success-light border-brand-success/15'
                : 'text-brand-accent bg-brand-accent-light border-brand-accent/15'
            }`}>
              {complianceRate}%
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-4xl font-extrabold ${complianceRate >= 95 ? 'text-brand-success' : 'text-brand-accent'}`}>
              {complianceRate}%
            </span>
            <span className="text-xs text-slate-500 font-bold">compliance</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
            <div 
              className={`h-full rounded-full ${complianceRate >= 95 ? 'bg-brand-success' : 'bg-brand-accent'}`} 
              style={{ width: `${complianceRate}%` }} 
            />
          </div>
          <p className="text-xs text-slate-400 leading-normal mt-2 border-t border-slate-100 pt-3">
            Landlords are bound to resolve complaints within 24 hours of creation.
          </p>
        </div>

        {/* Metric 3: Active warnings / Breaches */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-premium flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SLA Breaches</span>
            {openBreaches > 0 ? (
              <span className="text-brand-danger bg-brand-danger-light border border-brand-danger/15 text-xs font-bold px-2 py-0.5 rounded-lg shadow-premium-sm flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Active Flag
              </span>
            ) : (
              <span className="text-brand-success bg-brand-success-light border border-brand-success/15 text-xs font-bold px-2 py-0.5 rounded-lg shadow-premium-sm">
                Clean Record
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-4xl font-extrabold ${openBreaches > 0 ? 'text-brand-danger' : 'text-slate-900'}`}>
              {openBreaches}
            </span>
            <span className="text-xs text-slate-500 font-bold">active warning flags</span>
          </div>
          <div className="flex gap-4 text-[10px] font-bold text-slate-400 mt-2.5">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>{totalComplaints} TOTAL FILED</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-brand-success" />
              <span>{resolvedWithinSLA} MET SLA</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-normal mt-2 border-t border-slate-100 pt-3">
            Active flags temporarily degrade the Trust Score and prioritize inspections.
          </p>
        </div>

      </div>

      {/* SLA breach alert callout box if there is a breach */}
      {openBreaches > 0 && (
        <div className="bg-brand-danger-light/50 border border-brand-danger/20 rounded-2xl p-5 flex gap-4 animate-in">
          <AlertTriangle className="w-6 h-6 text-brand-danger shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <h4 className="text-sm font-bold text-slate-900">Active Operational Flag Active</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              This property currently has {openBreaches} unresolved maintenance issue past the contract-backed 24-hour deadline. The owner has been notified and penalties will continue to apply until the issue is marked as resolved by the resident.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}
