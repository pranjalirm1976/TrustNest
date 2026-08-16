'use client'

import { Star, ShieldCheck, Heart } from 'lucide-react'

type FoodRating = {
  id: string
  rating: number
  comment: string | null
  tenant: {
    name: string
  }
}

interface ResidentRatingDisplayProps {
  ratings: FoodRating[]
}

export default function ResidentRatingDisplay({ ratings }: ResidentRatingDisplayProps) {
  const totalRatings = ratings.length

  const avgRating = totalRatings > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
    : 'N/A'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
        <span>Resident Audits</span>
        {avgRating !== 'N/A' && (
          <span className="text-brand-primary bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md flex items-center gap-0.5 text-[10px]">
            ★ {avgRating}
          </span>
        )}
      </div>

      {ratings.length === 0 ? (
        <p className="text-[10px] text-slate-400 italic">No ratings logged yet by verified residents.</p>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-[140px] overflow-y-auto scrollbar-thin pr-1">
          {ratings.map((rating) => (
            <div 
              key={rating.id}
              className="bg-[#fbfbfb] border border-slate-150 p-3 rounded-xl flex flex-col gap-1.5 shadow-premium-sm"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-slate-800">{rating.tenant.name}</span>
                <span className="bg-brand-success-light text-brand-success text-[7px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded border border-brand-success/15 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  Verified
                </span>
              </div>
              <div className="flex items-center gap-0.5 text-[9px] text-brand-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3 h-3 ${i < rating.rating ? 'fill-brand-accent' : 'text-slate-200'}`} 
                  />
                ))}
              </div>
              {rating.comment && (
                <p className="text-[11px] text-slate-650 leading-relaxed font-medium">
                  "{rating.comment}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
