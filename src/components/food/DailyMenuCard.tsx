'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Image as ImageIcon } from 'lucide-react'
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
  tenant: {
    name: string
  }
}

type FoodMenu = {
  id: string
  date: Date
  mealType: string // "BREAKFAST" | "LUNCH" | "DINNER"
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

interface DailyMenuCardProps {
  menu: FoodMenu
}

export default function DailyMenuCard({ menu }: DailyMenuCardProps) {
  const foodPhoto = menu.images[0]?.url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-premium hover:shadow-premium-lg transition-all duration-300 flex flex-col sm:flex-row h-auto sm:h-64">
      
      {/* Left Column: Image (40% width) */}
      <div className="relative w-full sm:w-72 h-52 sm:h-full overflow-hidden bg-slate-100 shrink-0">
        <Image
          src={foodPhoto}
          alt={`${menu.mealType} food photograph`}
          fill
          sizes="(max-w-7xl) 100vw, 300px"
          className="object-cover"
        />

        {/* Veg indicator badge */}
        <span className={`absolute top-4 left-4 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-premium-sm text-white ${
          menu.isVeg ? 'bg-emerald-600' : 'bg-red-650'
        }`}>
          {menu.isVeg ? 'Veg' : 'Non-Veg'}
        </span>

        {/* Meal Type Overlay */}
        <span className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg">
          {menu.mealType}
        </span>
      </div>

      {/* Right Column: Menu details (60% width) */}
      <div className="p-6 flex flex-col justify-between flex-1 min-w-0 gap-6">
        
        {/* Info Area */}
        <div className="flex flex-col gap-2.5">
          {/* PG Header attribution */}
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-slate-900 truncate hover:text-brand-primary transition-colors">
                <Link href={`/pg/${menu.property.id}`}>
                  {menu.property.name}
                </Link>
              </h3>
              <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{menu.property.address}</span>
              </p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 font-mono shrink-0 uppercase">
              {new Date(menu.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            </span>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 w-full" />

          {/* Menu Items */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Menu List</span>
            <ul className="flex flex-wrap gap-1.5">
              {menu.items.map((item) => (
                <li 
                  key={item.id}
                  className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-lg"
                >
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Resident Rating displaying */}
        <ResidentRatingDisplay ratings={menu.ratings} />

      </div>

    </div>
  )
}
