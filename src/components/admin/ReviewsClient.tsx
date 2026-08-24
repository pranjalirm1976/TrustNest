'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { 
  Star, 
  StarHalf,
  CheckCircle2, 
  MessageSquare,
  CornerDownRight,
  Send
} from 'lucide-react'

// --- Types & Mocks ---
interface Review {
  id: string
  residentName: string
  date: string
  rating: number
  text: string
  ownerResponse: string | null
}

const mockReviews: Review[] = [
  {
    id: 'rev-1',
    residentName: 'Rahul Kumar',
    date: '12 Aug 2026',
    rating: 5,
    text: 'Excellent PG! The food is consistently good and the management responds to maintenance requests within hours. Highly recommend the 2-sharing rooms.',
    ownerResponse: 'Thank you so much for the kind words, Rahul! We are glad you are enjoying your stay. Let us know if you ever need anything else.'
  },
  {
    id: 'rev-2',
    residentName: 'Sanjay Gupta',
    date: '05 Aug 2026',
    rating: 4,
    text: 'Very clean property and great Wi-Fi. The only issue is that the washing machines are sometimes occupied during weekends. Otherwise, a solid experience.',
    ownerResponse: null
  },
  {
    id: 'rev-3',
    residentName: 'Amit Singh',
    date: '28 Jul 2026',
    rating: 3,
    text: 'Decent place. Food quality is okay but gets repetitive. The location is great though.',
    ownerResponse: null
  }
]

// Mock Metrics
const metrics = {
  overall: 4.6,
  totalReviews: 124,
  distribution: {
    5: 82,
    4: 28,
    3: 10,
    2: 3,
    1: 1
  },
  categories: [
    { label: 'Cleanliness', score: 4.8 },
    { label: 'Management', score: 4.7 },
    { label: 'Facilities', score: 4.5 },
    { label: 'Maintenance', score: 4.4 },
    { label: 'Food', score: 4.1 },
  ]
}

import { addOwnerReply } from '@/actions/review.actions'

export default function ReviewsClient({ initialReviews = [] }: { initialReviews?: any[] }) {
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // In a real app we'd map initialReviews into this structure
  const reviews = initialReviews.length > 0 ? initialReviews.map(r => {
    // If the comment has the owner reply appended, split it
    const parts = r.comment.split('\n\n--- Owner Reply ---\n')
    return {
      id: r.id,
      residentName: r.tenant?.name || 'Unknown',
      date: new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(r.createdAt)),
      rating: r.rating,
      text: parts[0],
      ownerResponse: parts[1] || null
    }
  }) : mockReviews

  // Toggle reply box
  const handleReplyClick = (id: string) => {
    if (activeReplyId === id) {
      setActiveReplyId(null)
      setReplyText('')
    } else {
      setActiveReplyId(id)
      setReplyText('')
    }
  }

  // Handle submit
  const handleSubmitReply = async (id: string) => {
    if (!replyText.trim()) return
    setIsSubmitting(true)
    try {
      const res = await addOwnerReply(id, replyText)
      if (res.success) {
        setActiveReplyId(null)
        setReplyText('')
      } else {
        alert(res.error)
      }
    } catch (e: any) {
      alert(e.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper to render stars
  const renderStars = (rating: number, sizeClass = 'w-4 h-4'): ReactNode => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className={`${sizeClass} fill-amber-400 text-amber-400`} />)
      } else if (i === fullStars && hasHalfStar) {
        // Simple half star using absolute positioning trick or just half icon
        stars.push(
          <div key={i} className="relative">
            <Star className={`${sizeClass} text-slate-200`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={`${sizeClass} fill-amber-400 text-amber-400`} />
            </div>
          </div>
        )
      } else {
        stars.push(<Star key={i} className={`${sizeClass} fill-slate-100 text-slate-200`} />)
      }
    }
    return <div className="flex items-center gap-0.5">{stars}</div>
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start h-full pb-8">
      
      {/* Left Column: Aggregate Metrics (Sticky on desktop) */}
      <div className="w-full lg:w-[320px] shrink-0 lg:sticky lg:top-6 flex flex-col gap-6">
        
        {/* Overall Hero */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Overall Rating</h2>
          <div className="text-5xl font-extrabold text-slate-900 tabular-nums mb-3">
            {metrics.overall.toFixed(1)}
          </div>
          <div className="flex justify-center mb-2">
            {renderStars(metrics.overall, 'w-6 h-6')}
          </div>
          <p className="text-sm font-medium text-slate-500">Based on {metrics.totalReviews} verified reviews</p>
          
          {/* Distribution Bars */}
          <div className="mt-8 space-y-2.5">
            {[5, 4, 3, 2, 1].map(star => {
              const count = metrics.distribution[star as keyof typeof metrics.distribution]
              const percentage = (count / metrics.totalReviews) * 100
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 w-8 shrink-0 justify-end font-medium text-slate-600 tabular-nums">
                    {star} <Star className="w-3 h-3 fill-slate-400 text-slate-400" />
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-8 shrink-0 text-left text-xs font-medium text-slate-500 tabular-nums">
                    {count}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-5">Category Scores</h2>
          <div className="space-y-5">
            {metrics.categories.map(cat => (
              <div key={cat.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-slate-700">{cat.label}</span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">{cat.score.toFixed(1)}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full" 
                    style={{ width: `${(cat.score / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Review Feed */}
      <div className="flex-1 w-full flex flex-col gap-6">
        {reviews.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">No reviews yet.</h3>
            <p className="text-sm text-slate-500 max-w-sm">Encourage your verified residents to leave feedback to start building your TrustNest score.</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              
              {/* Review Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center text-lg font-bold shrink-0">
                    {review.residentName.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                      {review.residentName}
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Verified Resident
                      </span>
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mt-0.5">{review.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center shrink-0">
                  {renderStars(review.rating)}
                </div>
              </div>

              {/* Review Text */}
              <div className="mb-4">
                <p className="text-sm leading-relaxed text-slate-700">{review.text}</p>
              </div>

              {/* Owner Response Block or Action */}
              {review.ownerResponse ? (
                <div className="mt-4 bg-slate-50 border border-slate-100 rounded-lg p-4 flex gap-3">
                  <CornerDownRight className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Owner Response</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{review.ownerResponse}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-2 border-t border-slate-100 pt-3">
                  {!activeReplyId || activeReplyId !== review.id ? (
                    <button 
                      onClick={() => handleReplyClick(review.id)}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4" /> Reply to Resident
                    </button>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Your Reply (Public)</label>
                      <textarea 
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type a professional response..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm resize-none mb-3 bg-white"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleReplyClick(review.id)}
                          className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleSubmitReply(review.id)}
                          disabled={!replyText.trim()}
                          className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 px-4 py-1.5 rounded shadow-sm transition-colors flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" /> Submit Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
            </div>
          ))
        )}
      </div>
    </div>
  )
}
