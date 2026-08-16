'use client'

import { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import DailyMenuCard from './DailyMenuCard'
import ResidentRatingDisplay from './ResidentRatingDisplay'

type FoodImage = {
  id: string
  url: string
}

type FoodMenuItem = {
  id: string
  name: string
}

type FoodRating = {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  tenant: {
    name: string
  }
}

type FoodMenu = {
  id: string
  date: Date
  mealType: string // "BREAKFAST" | "LUNCH" | "DINNER"
  isVeg: boolean
  items: FoodMenuItem[]
  images: FoodImage[]
  ratings: FoodRating[]
}

interface FoodTransparencyProps {
  foodMenus: FoodMenu[]
}

export default function FoodTransparency({ foodMenus }: FoodTransparencyProps) {
  const [activeDateTab, setActiveDateTab] = useState<'today' | 'yesterday'>('today')

  // Get current date strings
  const todayStr = new Date().toDateString()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toDateString()

  // Filter menus based on tab selection
  const activeMenus = foodMenus.filter((menu) => {
    const menuDate = new Date(menu.date).toDateString()
    if (activeDateTab === 'today') {
      // If we don't have today's menu in db, fallback to showing whatever menus exist
      return menuDate === todayStr || foodMenus.length <= 3
    } else {
      return menuDate === yesterdayStr
    }
  })

  // Sort meals in logical order: Breakfast, Lunch, Dinner
  const mealOrder = ['BREAKFAST', 'LUNCH', 'DINNER']
  const sortedMenus = [...activeMenus].sort(
    (a, b) => mealOrder.indexOf(a.mealType) - mealOrder.indexOf(b.mealType)
  )

  // Calculate aggregated food score
  const foodRatings = foodMenus.flatMap(menu => menu.ratings.map(r => r.rating))
  const avgFoodScore = foodRatings.length > 0
    ? (foodRatings.reduce((sum, val) => sum + val, 0) / foodRatings.length).toFixed(1)
    : 'N/A'

  return (
    <div id="food" className="py-12 border-b border-slate-100 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Daily Food Audit Log</span>
            <span className="bg-indigo-50 border border-indigo-100 text-brand-primary text-xs font-extrabold px-2.5 py-0.5 rounded-lg shadow-premium-sm flex items-center gap-1">
              <span>★</span>
              <span>{avgFoodScore}</span>
            </span>
          </h2>
          <p className="text-sm text-slate-500">Live operator uploads with verified resident ratings.</p>
        </div>

        {/* Date toggler */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
          <button
            onClick={() => setActiveDateTab('today')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeDateTab === 'today'
                ? 'bg-white text-slate-900 shadow-premium-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Today's Audits
          </button>
          <button
            onClick={() => setActiveDateTab('yesterday')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeDateTab === 'yesterday'
                ? 'bg-white text-slate-900 shadow-premium-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Yesterday
          </button>
        </div>
      </div>

      {sortedMenus.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-8">
          <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600 font-semibold text-sm">No meal photos uploaded for this date</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedMenus.map((menu) => {
            const menuRatings = menu.ratings.map(r => r.rating)
            const avgRating = menuRatings.length > 0
              ? (menuRatings.reduce((s, v) => s + v, 0) / menuRatings.length).toFixed(1)
              : 'N/A'

            return (
              <DailyMenuCard key={menu.id} menu={menu} avgRating={avgRating}>
                <ResidentRatingDisplay ratings={menu.ratings} />
              </DailyMenuCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
