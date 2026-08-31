'use client'

import Image from 'next/image'
import { Star, Image as ImageIcon } from 'lucide-react'

type FoodImage = {
  id: string
  url: string
}

type FoodMenuItem = {
  id: string
  name: string
}

type FoodMenu = {
  id: string
  mealType: string
  isVeg: boolean
  items: FoodMenuItem[]
  images: FoodImage[]
}

interface DailyMenuCardProps {
  menu: FoodMenu
  avgRating: string
  children?: React.ReactNode // Slot to render ResidentRatingDisplay
}

export default function DailyMenuCard({ menu, avgRating, children }: DailyMenuCardProps) {
  return (
    <div className="bg-white border border-slate-205 rounded-3xl overflow-hidden shadow-premium flex flex-col h-full hover:shadow-premium-lg transition-all duration-200">
      
      {/* Food Image */}
      <div className="relative aspect-[4/3] w-full bg-slate-100">
        {menu.images.length > 0 ? (
          <Image
            src={menu.images[0].url}
            alt={`${menu.mealType} meal log`}
            fill
            sizes="(max-w-7xl) 100vw, 350px"
            className="object-cover"
            unoptimized={menu.images[0].url.startsWith('/uploads/') || menu.images[0].url.startsWith('data:')}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-1 bg-slate-50">
            <ImageIcon className="w-8 h-8" />
            <span className="text-[10px] font-semibold">Live photo pending</span>
          </div>
        )}

        {/* Veg/Non-Veg tag */}
        <span className={`absolute top-4 left-4 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-premium-sm text-white border border-white/20 ${
          menu.isVeg ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {menu.isVeg ? 'Veg' : 'Non-Veg'}
        </span>
      </div>

      {/* Card Details */}
      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none font-mono">
              {menu.mealType}
            </span>
            <h4 className="text-base font-extrabold text-slate-900 mt-1">
              {menu.mealType === 'BREAKFAST' ? 'Morning Breakfast' :
               menu.mealType === 'LUNCH' ? 'Standard Lunch' : 'Dinner Service'}
            </h4>
          </div>

          {avgRating !== 'N/A' && (
            <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-brand-primary text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg shadow-premium-sm">
              <Star className="w-3.5 h-3.5 fill-brand-primary text-brand-primary" />
              <span>{avgRating}</span>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex flex-col gap-1.5 py-3 border-y border-slate-100">
          <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest">Menu Items</span>
          <ul className="flex flex-wrap gap-1.5">
            {menu.items.map((item) => (
              <li 
                key={item.id}
                className="text-[10px] font-semibold text-slate-650 bg-slate-50 border border-slate-150 px-2.5 py-0.5 rounded-lg"
              >
                {item.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Resident feedback log child slot */}
        <div className="mt-auto pt-2">
          {children}
        </div>

      </div>
    </div>
  )
}
