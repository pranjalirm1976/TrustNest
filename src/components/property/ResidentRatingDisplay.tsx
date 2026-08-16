'use client'

import { Star, ShieldAlert } from 'lucide-react'

type FoodRating = {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  tenant: {
    name: string
  }
}

interface ResidentRatingDisplayProps {
  ratings: FoodRating[]
}

export default function ResidentRatingDisplay({ ratings }: ResidentRatingDisplayProps) {
  if (ratings.length === 0) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Resident Feedback</span>
        <p className="text-[10px] text-slate-400 italic">No feedback submitted yet by active tenants.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest font-mono">Resident Feedback</span>
        <span className="bg-emerald-50 border border-emerald-100/60 text-emerald-700 text-[8px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
          Verified Resident Rating
        </span>
      </div>

      <div className="flex flex-col gap-2.5 max-h-[120px] overflow-y-auto pr-1 scrollbar-thin">
        {ratings.map((rate) => (
          <div key={rate.id} className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl flex flex-col gap-1 text-left">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-800 truncate">{rate.tenant.name}</span>
              <div className="flex items-center gap-0.5 text-brand-primary text-[10px]">
                {Array.from({ length: rate.rating }).map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 fill-brand-primary text-brand-primary" />
                ))}
              </div>
            </div>
            {rate.comment && (
              <p className="text-xs text-slate-550 italic leading-relaxed">
                "{rate.comment}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
