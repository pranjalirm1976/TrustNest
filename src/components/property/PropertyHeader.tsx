'use client'

import { MapPin, Wifi, Wind, Utensils, Shield, Heart, Share2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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
    <div className="flex flex-col gap-6 py-6 border-b border-slate-100">
      
      {/* Top row: Breadcrumbs and Share/Save actions */}
      <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
        <div className="flex items-center gap-1.5">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <span>&gt;</span>
          <Link href="/search" className="hover:text-slate-900">Pune</Link>
          <span>&gt;</span>
          <Link href="/search?location=Hinjawadi" className="hover:text-slate-900">Hinjawadi</Link>
          <span>&gt;</span>
          <span className="text-slate-900 font-bold truncate max-w-[150px]">{name}</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/search" className="flex items-center gap-1 text-brand-primary hover:text-indigo-800 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to results</span>
          </Link>
          <button 
            onClick={() => alert('Link copied to clipboard!')}
            className="hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            title="Share"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => alert('Property saved to favorites!')}
            className="hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            title="Save"
          >
            <Heart className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Main Header split column */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
        
        {/* Left Side: Title, Rating, Address, Facilities, Badges */}
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{name}</h1>
            <span className="bg-emerald-100/70 text-emerald-700 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-200">
              Verified
            </span>
          </div>

          {/* Ratings & reviews summary */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-amber-600 font-bold">{trustScore.toFixed(1)} ★</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">(128 Verified Reviews)</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 capitalize">{gender.toLowerCase()} Co-Living</span>
          </div>

          {/* Location */}
          <p className="text-sm text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{address}</span>
          </p>

          {/* Facilities Icons row */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-450 uppercase tracking-wide border-t border-slate-100 pt-3">
            <span className="flex items-center gap-1"><Wifi className="w-4 h-4 text-slate-400" /> Wi-Fi</span>
            <span className="flex items-center gap-1"><Wind className="w-4 h-4 text-slate-400" /> AC</span>
            <span className="flex items-center gap-1"><Utensils className="w-4 h-4 text-slate-400" /> Food</span>
            <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-slate-400" /> CCTV</span>
            <span className="text-slate-400 font-bold">+5 more</span>
          </div>

          {/* Dynamic occupancy & SLA badges */}
          <div className="flex flex-wrap gap-2.5 mt-1">
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-indigo-950 font-bold">
              <span className="w-2 h-2 rounded-full bg-brand-primary" />
              <span>6 Rooms Available</span>
              <span className="text-[10px] text-slate-400 font-normal ml-1">(2 Single, 4 Sharing)</span>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-emerald-950 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>87% Resolved (24h)</span>
              <span className="text-[10px] text-slate-400 font-normal ml-1">Fast Complaint Resolution</span>
            </div>
          </div>
        </div>

        {/* Right Side: Simple Price Card & Quick CTA buttons */}
        <div className="w-full lg:w-96 bg-white border border-slate-205 rounded-2xl p-6 shadow-premium shrink-0">
          <div className="flex justify-between items-baseline mb-6">
            <div>
              <p className="text-2xl font-extrabold text-slate-900">
                ₹{priceFrom.toLocaleString('en-IN')}
                <span className="text-xs font-normal text-slate-500 font-mono">/month onwards</span>
              </p>
            </div>
            <button 
              onClick={() => alert('Price breakdown details!')}
              className="text-[11px] font-bold text-brand-primary hover:underline cursor-pointer"
            >
              Price Details
            </button>
          </div>

          {/* Indigo primary buttons and side CTA */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => {
                const element = document.getElementById('rooms')
                if (element) element.scrollIntoView({ behavior: 'smooth' })
              }}
              className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-sm py-3.5 rounded-xl shadow-premium hover:shadow-premium-lg transition-all duration-200 cursor-pointer text-center"
            >
              Book Now
            </button>
            
            <div className="flex gap-2">
              <button 
                onClick={() => alert(`Contacting PG Manager/Owner ${ownerName}`)}
                className="flex-1 bg-white border border-brand-primary hover:bg-indigo-50/30 text-brand-primary font-bold text-sm py-3 rounded-xl transition-all cursor-pointer text-center"
              >
                Contact Owner
              </button>
              <button 
                onClick={() => alert('Saved!')}
                className="bg-white border border-slate-200 hover:border-slate-300 p-3 rounded-xl shadow-premium-sm text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                title="Save PG"
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
