'use client'

import { MapPin, Building2, Bed as BedIcon, Calendar, CheckCircle } from 'lucide-react'

interface StaySummaryCardProps {
  stay: {
    id: string
    startDate: Date
    endDate: Date | null
    status: string
    rentAmount: number
    property: {
      name: string
      address: string
    }
    room: {
      roomNumber: string
    }
    bed: {
      identifier: string
    }
  } | null
}

export default function StaySummaryCard({ stay }: StaySummaryCardProps) {
  if (!stay) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium-sm text-center py-10 flex flex-col items-center justify-center gap-2">
        <Building2 className="w-10 h-10 text-slate-400" />
        <h3 className="text-base font-bold text-slate-800">No Active Stay Record</h3>
        <p className="text-xs text-slate-400 max-w-xs leading-normal">
          You are not currently checked into any PG room. Please reach out to your property owner to set up your digital contract.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium-sm flex flex-col gap-5">
      
      {/* Header status bar */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-brand-primary" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Stay Contract</span>
        </div>

        <span className="bg-brand-success-light text-brand-success text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-brand-success/15 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          {stay.status}
        </span>
      </div>

      {/* Property and room details */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{stay.property.name}</h2>
        <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{stay.property.address}</span>
        </p>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-2 gap-4 py-4 bg-slate-50 border border-slate-200/40 rounded-xl px-4">
        
        {/* Room */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200/60 shadow-premium-sm shrink-0">
            <span className="text-[10px] font-extrabold font-mono text-brand-primary">RM</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Room No</span>
            <span className="text-sm font-extrabold text-slate-800 truncate mt-0.5">{stay.room.roomNumber}</span>
          </div>
        </div>

        {/* Bed */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200/60 shadow-premium-sm shrink-0">
            <BedIcon className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Bed Slot</span>
            <span className="text-sm font-extrabold text-slate-800 truncate mt-0.5">Slot {stay.bed.identifier}</span>
          </div>
        </div>

      </div>

      {/* Bottom contract date metadata */}
      <div className="flex justify-between items-center text-xs text-slate-450 mt-1 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>Move-In: {new Date(stay.startDate).toLocaleDateString('en-IN')}</span>
        </div>
        <span className="font-extrabold text-slate-800">₹{stay.rentAmount.toLocaleString('en-IN')}/mo</span>
      </div>

    </div>
  )
}
