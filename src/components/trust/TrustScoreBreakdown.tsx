'use client'

import { Star, ShieldCheck, Heart, AlertCircle, HelpCircle } from 'lucide-react'

interface TrustScoreBreakdownProps {
  stats: {
    score: number
    reviewsAvg: number
    foodAvg: number
    totalReviews: number
    totalFoodRatings: number
    slaBreaches: number
    activeFlags: number
    reviewImpact: number
    foodImpact: number
    slaPenalty: number
    flagPenalty: number
  }
}

export default function TrustScoreBreakdown({ stats }: TrustScoreBreakdownProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-premium-sm flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-primary" />
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Algorithmic Trust Score</h3>
        </div>
        
        <div className="bg-indigo-50 border border-indigo-100 text-brand-primary text-sm font-extrabold px-3 py-1 rounded-xl shadow-premium-sm flex items-center gap-1">
          <span>★</span>
          <span>{stats.score.toFixed(1)}</span>
        </div>
      </div>

      {/* Math formula presentation */}
      <div className="flex flex-col gap-2 bg-[#fbfbfb] border border-slate-150 p-4 rounded-xl text-center">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Real-time Calculation</span>
        <p className="text-xs font-mono font-bold text-slate-800 tracking-tight leading-relaxed">
          Score = (Reviews × 0.5) + (Food × 0.5) - (SLA Breaches × 0.2) - (Flags × 0.4)
        </p>
      </div>

      {/* Detailed parameters breakdown */}
      <div className="flex flex-col gap-4">
        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest border-b border-slate-100 pb-2">
          Calculation Breakdown
        </span>

        <div className="flex flex-col gap-3 text-xs font-semibold text-slate-700">
          
          {/* Review Impact */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span>Resident Reviews ({stats.totalReviews} total)</span>
              <span className="text-[10px] text-slate-400 font-normal">Average: {stats.reviewsAvg} out of 5.0</span>
            </div>
            <span className="text-brand-success font-extrabold font-mono">+{stats.reviewImpact.toFixed(2)}</span>
          </div>

          {/* Food Impact */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span>Daily Food Menus ({stats.totalFoodRatings} ratings)</span>
              <span className="text-[10px] text-slate-400 font-normal">Average: {stats.foodAvg} out of 5.0</span>
            </div>
            <span className="text-brand-success font-extrabold font-mono">+{stats.foodImpact.toFixed(2)}</span>
          </div>

          {/* SLA Penalty */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span>24h Maintenance SLA Breaches</span>
              <span className="text-[10px] text-slate-400 font-normal">{stats.slaBreaches} late / overdue tickets</span>
            </div>
            <span className={`font-extrabold font-mono ${stats.slaPenalty > 0 ? 'text-brand-danger' : 'text-slate-400'}`}>
              -{stats.slaPenalty.toFixed(2)}
            </span>
          </div>

          {/* Active Flag Penalty */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span>Active Compliance Warning Flags</span>
              <span className="text-[10px] text-slate-400 font-normal">{stats.activeFlags} warning flags currently active</span>
            </div>
            <span className={`font-extrabold font-mono ${stats.flagPenalty > 0 ? 'text-brand-danger' : 'text-slate-400'}`}>
              -{stats.flagPenalty.toFixed(2)}
            </span>
          </div>

        </div>
      </div>

      {/* Explanation Footer */}
      <div className="text-[10px] text-slate-450 leading-relaxed pt-3 border-t border-slate-100 flex gap-2">
        <HelpCircle className="w-4 h-4 text-slate-350 shrink-0" />
        <span>
          TrustNest's score algorithm enforces complete property transparency. Landlords cannot delete reviews, erase meal records or manipulate SLA countdown logs.
        </span>
      </div>

    </div>
  )
}
