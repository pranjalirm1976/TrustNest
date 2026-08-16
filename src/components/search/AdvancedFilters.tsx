'use client'

import { Star, ShieldAlert } from 'lucide-react'

interface AdvancedFiltersProps {
  minScore: number
  setMinScore: (val: number) => void
  selectedAmenities: string[]
  toggleAmenity: (name: string) => void
  onClear: () => void
}

export default function AdvancedFilters({
  minScore,
  setMinScore,
  selectedAmenities,
  toggleAmenity,
  onClear,
}: AdvancedFiltersProps) {
  const allAmenities = [
    'High-Speed WiFi',
    'Air Conditioning',
    'Gymnasium',
    'Biometric Access',
    'Power Backup',
    '24/7 Security CCTV',
    'Washing Machine',
    'RO Drinking Water',
    'Elevator Access',
    'Housekeeping',
  ]

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium flex flex-col gap-6 animate-in">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Advanced Filters</h3>
        <button 
          onClick={onClear}
          className="text-xs font-semibold text-slate-400 hover:text-brand-primary transition-colors cursor-pointer"
        >
          Reset Filters
        </button>
      </div>

      {/* TrustNest Score selector */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Minimum Trust Score</span>
        <div className="flex flex-wrap gap-2">
          {[0, 4.0, 4.5, 4.8].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => setMinScore(score)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 border rounded-xl shadow-premium-sm transition-all cursor-pointer ${
                minScore === score
                  ? 'bg-indigo-50 border-brand-primary text-brand-primary'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${minScore === score ? 'fill-brand-primary' : 'text-slate-400'}`} />
              <span>{score === 0 ? 'Any Rating' : `${score.toFixed(1)}+`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Amenities checklist */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Specific Amenities</span>
        <div className="grid grid-cols-2 gap-3">
          {allAmenities.map((amenity) => {
            const isChecked = selectedAmenities.includes(amenity)
            return (
              <label 
                key={amenity}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                  isChecked
                    ? 'bg-indigo-50/50 border-brand-primary/40 text-slate-900 font-semibold shadow-premium-sm'
                    : 'bg-[#fbfbfb] border-slate-200/60 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleAmenity(amenity)}
                  className="w-4 h-4 text-brand-primary rounded border-slate-300 focus:ring-brand-primary cursor-pointer accent-indigo-600"
                />
                <span className="text-xs">{amenity}</span>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}
