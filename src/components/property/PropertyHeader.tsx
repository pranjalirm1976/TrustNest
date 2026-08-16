'use client'

import { MapPin, Phone, Building2, Calendar, CreditCard } from 'lucide-react'

interface PropertyHeaderProps {
  name: string
  address: string
  priceFrom: number
  gender: string
  trustScore: number
  ownerName: string
}

export default function PropertyHeader({
  name,
  address,
  priceFrom,
  gender,
  trustScore,
  ownerName,
}: PropertyHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start gap-8 py-8 border-b border-slate-100">
      
      {/* Left Area: Name, details, location */}
      <div className="flex flex-col gap-4 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Gender tag */}
          <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-premium-sm ${
            gender === 'FEMALE' ? 'bg-pink-100 text-pink-700' :
            gender === 'MALE' ? 'bg-blue-100 text-blue-700' :
            'bg-slate-100 text-slate-700'
          }`}>
            {gender === 'UNISEX' ? 'Unisex Co-Living' : `${gender} Only stay`}
          </span>

          {/* Verified Badge */}
          <span className="bg-brand-success-light text-brand-success text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-premium-sm border border-brand-success/15 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-brand-success rounded-full animate-pulse" />
            Verified Nest
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{name}</h1>
          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{address}</span>
          </p>
        </div>

        {/* Small metadata row */}
        <div className="flex flex-wrap gap-6 text-xs text-slate-400 mt-2 font-mono">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>MANAGED BY {ownerName.toUpperCase()}</span>
          </div>
          <div>•</div>
          <div>DEPOSIT: 2 MONTHS RENT</div>
        </div>
      </div>

      {/* Right Area: Sticky desktop card showing booking CTA */}
      <div className="w-full lg:w-96 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium shrink-0">
        <div className="flex justify-between items-end mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rent Starts At</span>
            <p className="text-2xl font-extrabold text-slate-900">
              ₹{priceFrom.toLocaleString('en-IN')}
              <span className="text-sm font-semibold text-slate-500 font-mono">/mo</span>
            </p>
          </div>

          <div className="flex flex-col items-end">
            <div className="bg-indigo-50 border border-indigo-100 text-brand-primary text-sm font-extrabold px-3 py-1 rounded-xl flex items-center gap-1 shadow-premium-sm">
              <span>★</span>
              <span>{trustScore.toFixed(1)}</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Trust Score</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => alert('Booking interface simulated! Moving to check-out flow.')}
            className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-sm py-4 rounded-xl shadow-premium hover:shadow-premium-lg transition-all duration-200 hover:-translate-y-[1px] flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Site Visit</span>
          </button>
          
          <button 
            onClick={() => alert('Rent payment simulated!')}
            className="w-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-sm py-3.5 rounded-xl shadow-premium-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Booking Deposit</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400 text-center mt-4 leading-normal">
          No credit card required. Free site visits are fully covered under the TrustNest SafeStay agreement.
        </p>
      </div>

    </div>
  )
}
