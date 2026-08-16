'use client'

import { Search, SlidersHorizontal, Users, Shield } from 'lucide-react'

interface SearchHeaderProps {
  query: string
  setQuery: (val: string) => void
  gender: string
  setGender: (val: string) => void
  budgetRange: string
  setBudgetRange: (val: string) => void
  showAdvanced: boolean
  setShowAdvanced: (val: boolean) => void
}

export default function SearchHeader({
  query,
  setQuery,
  gender,
  setGender,
  budgetRange,
  setBudgetRange,
  showAdvanced,
  setShowAdvanced,
}: SearchHeaderProps) {
  return (
    <div className="flex flex-col gap-4 pb-6 border-b border-slate-100 bg-[#fbfbfb] sticky top-16 z-40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verified Stays in Pune</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time room availability and verified Trust Scores.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        {/* Main query search */}
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-premium-sm flex-1">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by area, PG name or landmark..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none w-full"
          />
        </div>

        {/* Filter Selection Controls */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Gender Pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
            {['UNISEX', 'MALE', 'FEMALE'].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(gender === g ? '' : g)}
                className={`text-xs font-bold px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                  gender === g
                    ? 'bg-white text-brand-primary shadow-premium-sm font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {g === 'UNISEX' ? 'Unisex' : g === 'MALE' ? 'Boys' : 'Girls'}
              </button>
            ))}
          </div>

          {/* Budget Quick Select */}
          <select
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
            className="bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 px-4 py-3 rounded-xl shadow-premium-sm cursor-pointer focus:outline-none"
          >
            <option value="">Any Budget</option>
            <option value="low">Under ₹8,000</option>
            <option value="mid">₹8,000 - ₹12,000</option>
            <option value="high">Above ₹12,000</option>
          </select>

          {/* Advanced filter toggle button */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 text-xs font-bold border px-4 py-3 rounded-xl shadow-premium-sm transition-all cursor-pointer ${
              showAdvanced
                ? 'bg-indigo-50 border-brand-primary text-brand-primary'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>
    </div>
  )
}
