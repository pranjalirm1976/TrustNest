'use client'

import { Search, SlidersHorizontal, Calendar, Soup } from 'lucide-react'

interface FoodFilterBarProps {
  searchQuery: string
  setSearchQuery: (val: string) => void
  mealType: string
  setMealType: (val: string) => void
  vegOnly: string
  setVegOnly: (val: string) => void
  dateFilter: string
  setDateFilter: (val: string) => void
}

export default function FoodFilterBar({
  searchQuery,
  setSearchQuery,
  mealType,
  setMealType,
  vegOnly,
  setVegOnly,
  dateFilter,
  setDateFilter,
}: FoodFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 pb-6 border-b border-slate-100 bg-[#fbfbfb] sticky top-16 z-40">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Main query search by PG */}
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-premium-sm flex-1">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by PG Name or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none w-full"
          />
        </div>

        {/* Filter selection controls */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Meal Type Quick select */}
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 px-4 py-3 rounded-xl shadow-premium-sm cursor-pointer focus:outline-none"
          >
            <option value="">All Meals</option>
            <option value="BREAKFAST">Breakfast</option>
            <option value="LUNCH">Lunch</option>
            <option value="DINNER">Dinner</option>
          </select>

          {/* Diet select (Veg / Non-veg) */}
          <select
            value={vegOnly}
            onChange={(e) => setVegOnly(e.target.value)}
            className="bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 px-4 py-3 rounded-xl shadow-premium-sm cursor-pointer focus:outline-none"
          >
            <option value="">All Diet Types</option>
            <option value="veg">Vegetarian Only</option>
            <option value="nonveg">Non-Vegetarian Only</option>
          </select>

          {/* Date Selector */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 px-4 py-3 rounded-xl shadow-premium-sm cursor-pointer focus:outline-none"
          >
            <option value="">All Dates</option>
            <option value="today">Today's Meals</option>
            <option value="yesterday">Yesterday's Meals</option>
          </select>
        </div>
      </div>
    </div>
  )
}
