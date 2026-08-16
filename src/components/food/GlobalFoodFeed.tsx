'use client'

import { useState, useMemo } from 'react'
import FoodFilterBar from './FoodFilterBar'
import DailyMenuCard from './DailyMenuCard'
import { ShieldAlert } from 'lucide-react'

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
  tenant: {
    name: string
  }
}

type FoodMenu = {
  id: string
  date: Date
  mealType: string
  isVeg: boolean
  property: {
    id: string
    name: string
    address: string
  }
  items: FoodMenuItem[]
  images: FoodImage[]
  ratings: FoodRating[]
}

interface GlobalFoodFeedProps {
  initialMenus: FoodMenu[]
}

export default function GlobalFoodFeed({ initialMenus }: GlobalFoodFeedProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [mealType, setMealType] = useState('')
  const [vegOnly, setVegOnly] = useState('')
  const [dateFilter, setDateFilter] = useState('today') // defaults to showing today's menus

  const todayStr = new Date().toDateString()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toDateString()

  // Filter food menu logs
  const filteredMenus = useMemo(() => {
    return initialMenus.filter((menu) => {
      // 1. Text Search matching PG name or address
      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase()
        const matchName = menu.property.name.toLowerCase().includes(queryLower)
        const matchAddress = menu.property.address.toLowerCase().includes(queryLower)
        if (!matchName && !matchAddress) return false
      }

      // 2. Meal Type filter
      if (mealType) {
        if (menu.mealType !== mealType) return false
      }

      // 3. Veg / Non-Veg filter
      if (vegOnly) {
        if (vegOnly === 'veg' && !menu.isVeg) return false
        if (vegOnly === 'nonveg' && menu.isVeg) return false
      }

      // 4. Date filter
      if (dateFilter) {
        const menuDateStr = new Date(menu.date).toDateString()
        if (dateFilter === 'today' && menuDateStr !== todayStr) return false
        if (dateFilter === 'yesterday' && menuDateStr !== yesterdayStr) return false
      }

      return true
    })
  }, [initialMenus, searchQuery, mealType, vegOnly, dateFilter])

  const handleReset = () => {
    setSearchQuery('')
    setMealType('')
    setVegOnly('')
    setDateFilter('')
  }

  return (
    <div className="flex flex-col gap-6 w-full flex-1">
      {/* Sticky Filter controls */}
      <FoodFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        mealType={mealType}
        setMealType={setMealType}
        vegOnly={vegOnly}
        setVegOnly={setVegOnly}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />

      <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
        <span>{filteredMenus.length} Meal Audits Displayed</span>
        {dateFilter === 'today' && <span>Live Today</span>}
      </div>

      {filteredMenus.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center gap-4">
          <ShieldAlert className="w-12 h-12 text-slate-300" />
          <div>
            <h3 className="font-bold text-slate-800 text-lg">No Meal Logs Found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
              No daily menus matches the selected search filters. Try selecting 'All Dates' or resetting your search.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="bg-brand-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-premium hover:bg-brand-primary-dark transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {filteredMenus.map((menu) => (
            <DailyMenuCard key={menu.id} menu={menu} />
          ))}
        </div>
      )}
    </div>
  )
}
