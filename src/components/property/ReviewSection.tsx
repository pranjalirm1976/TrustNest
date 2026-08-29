'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Star, ShieldCheck, ShieldAlert, Plus, Loader2, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react'
import { submitResidentReview } from '@/actions/review.actions'

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
  propertyId?: string
  reviews: Review[]
}

export default function ReviewSection({ propertyId, reviews }: ReviewSectionProps) {
  const { data: session } = useSession()
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Form ratings
  const [cleanlinessRating, setCleanlinessRating] = useState(5)
  const [foodRating, setFoodRating] = useState(5)
  const [amenitiesRating, setAmenitiesRating] = useState(5)
  const [staffRating, setStaffRating] = useState(5)
  const [comment, setComment] = useState('')

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

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!propertyId) return
    setIsSubmitting(true)
    setErrorMessage('')
    setSuccessMessage('')

    const avgRating = parseFloat(
      ((cleanlinessRating + foodRating + amenitiesRating + staffRating) / 4).toFixed(1)
    )

    try {
      const res = await submitResidentReview({
        propertyId,
        rating: avgRating,
        foodRating,
        amenitiesRating,
        cleanlinessRating,
        staffRating,
        comment,
      })

      if (res.success) {
        setSuccessMessage('Your verified review was submitted and the TrustScore updated!')
        setTimeout(() => {
          setShowReviewModal(false)
          setSuccessMessage('')
        }, 1800)
      } else {
        setErrorMessage(res.error || 'Failed to submit review.')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div id="reviews" className="py-12 border-b border-slate-100 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verified Resident Reviews</h2>
          <p className="text-sm text-slate-500">Every review below belongs to a verified resident with an active contract.</p>
        </div>

        {propertyId && (
          <button
            onClick={() => setShowReviewModal(true)}
            className="bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-premium transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write Verified Review</span>
          </button>
        )}
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
                          ? 'fill-amber-400 text-amber-400'
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

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Post Verified Stay Review</h3>
                <p className="text-xs text-slate-500">Only verified residents with active stays can review.</p>
              </div>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Cleanliness (1-5)</label>
                  <select 
                    value={cleanlinessRating}
                    onChange={(e) => setCleanlinessRating(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold"
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Food Quality (1-5)</label>
                  <select 
                    value={foodRating}
                    onChange={(e) => setFoodRating(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold"
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Amenities (1-5)</label>
                  <select 
                    value={amenitiesRating}
                    onChange={(e) => setAmenitiesRating(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold"
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Staff Support (1-5)</label>
                  <select 
                    value={staffRating}
                    onChange={(e) => setStaffRating(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-bold"
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Your Detailed Experience</label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about room cleanliness, food quality, internet speed, and landlord responsiveness..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-brand-primary"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !comment}
                className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs py-3 rounded-xl shadow-premium cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Resident Stay &amp; Posting...</span>
                  </>
                ) : (
                  <span>Submit Verified Review</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
