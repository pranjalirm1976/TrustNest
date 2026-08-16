'use client'

import { Star, ShieldCheck, ShieldAlert } from 'lucide-react'

type Review = {
  id: string
  rating: number
  foodRating: number
  amenitiesRating: number
  cleanlinessRating: number
  staffRating: number
  comment: string
  isVerifiedResident: boolean
  createdAt: Date
  tenant: {
    name: string
  }
}

interface ReviewSectionProps {
  reviews: Review[]
}

export default function ReviewSection({ reviews }: ReviewSectionProps) {
  // Compute sub-rating averages
  const totalReviews = reviews.length
  
  const getAverage = (key: keyof Pick<Review, 'foodRating' | 'amenitiesRating' | 'cleanlinessRating' | 'staffRating'>) => {
    if (totalReviews === 0) return 0
    const sum = reviews.reduce((s, r) => s + r[key], 0)
    return parseFloat((sum / totalReviews).toFixed(1))
  }

  const subRatings = [
    { name: 'Cleanliness', score: getAverage('cleanlinessRating') },
    { name: 'Food Quality', score: getAverage('foodRating') },
    { name: 'Amenities', score: getAverage('amenitiesRating') },
    { name: 'Staff Support', score: getAverage('staffRating') },
  ]

  return (
    <div id="reviews" className="py-12 border-b border-slate-100 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verified Resident Reviews</h2>
        <p className="text-sm text-slate-500">Every review below belongs to a verified resident with an active contract.</p>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-8">
          <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600 font-semibold text-sm">No resident reviews filed yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left: Overall Sub-ratings breakdown (4 columns) */}
          <div className="lg:col-span-4 bg-slate-50 border border-slate-200/50 p-6 rounded-2xl flex flex-col gap-5 shrink-0 self-start">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Parameter Breakdown</h3>
            <div className="flex flex-col gap-4">
              {subRatings.map((sub) => (
                <div key={sub.name} className="flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center font-bold text-slate-700">
                    <span>{sub.name}</span>
                    <span>{sub.score.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-primary h-full rounded-full" 
                      style={{ width: `${(sub.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Reviews List (8 columns) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {reviews.map((review) => (
              <div 
                key={review.id}
                className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-premium flex flex-col gap-4"
              >
                {/* Header row */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{review.tenant.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      REVIEWED ON {new Date(review.createdAt).toLocaleDateString('en-IN').toUpperCase()}
                    </p>
                  </div>

                  {/* Verification Badge */}
                  {review.isVerifiedResident && (
                    <span className="bg-brand-success-light text-brand-success text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md border border-brand-success/15 flex items-center gap-1.5 shrink-0 shadow-premium-sm">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified stay
                    </span>
                  )}
                </div>

                {/* Rating score */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(review.rating)
                          ? 'fill-brand-accent text-brand-accent'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-800 ml-2">{review.rating.toFixed(1)}</span>
                </div>

                {/* Review comment */}
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  "{review.comment}"
                </p>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  )
}
