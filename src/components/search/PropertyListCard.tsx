'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, ArrowRight, ShieldCheck, Dumbbell, Wifi, Wind, Zap } from 'lucide-react'

type PropertyImage = {
  id: string
  url: string
}

type Property = {
  id: string
  name: string
  address: string
  priceFrom: number
  gender: string
  trustScore: number
  images: PropertyImage[]
  amenities: { id: string; name: string }[]
  availabilityStatus?: string
  availableBeds?: number
  totalBeds?: number
}

interface PropertyListCardProps {
  property: Property
  isHighlighted: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onFocusMap: () => void
}

export default function PropertyListCard({
  property,
  isHighlighted,
  onMouseEnter,
  onMouseLeave,
  onFocusMap,
}: PropertyListCardProps) {
  const coverImage = property.images[0]?.url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`bg-white border rounded-2xl overflow-hidden shadow-premium hover:shadow-premium-lg transition-all duration-300 flex flex-col sm:flex-row h-auto sm:h-52 ${
        isHighlighted ? 'border-brand-primary ring-2 ring-indigo-100' : 'border-slate-200/60'
      }`}
    >
      {/* Left side: Image */}
      <div className="relative w-full sm:w-60 h-48 sm:h-full overflow-hidden bg-slate-100 shrink-0">
        <Image
          src={coverImage}
          alt={property.name}
          fill
          sizes="(max-w-7xl) 100vw, 240px"
          className="object-cover transition-transform duration-700 hover:scale-105"
          unoptimized={coverImage.startsWith('/uploads/') || coverImage.startsWith('data:')}
        />

        {/* Gender Badge */}
        <span className={`absolute top-4 left-4 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full shadow-premium-sm z-10 ${
          property.gender === 'FEMALE' ? 'bg-pink-100 text-pink-700' :
          property.gender === 'MALE' ? 'bg-blue-100 text-blue-700' :
          'bg-slate-100 text-slate-700'
        }`}>
          {property.gender === 'UNISEX' ? 'Unisex' : `${property.gender}`}
        </span>
      </div>

      {/* Right side: Information */}
      <div className="p-6 flex flex-col justify-between flex-1 min-w-0">
        <div className="flex flex-col gap-2">
          {/* Header row */}
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="bg-brand-success-light text-brand-success text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md border border-brand-success/15 inline-flex items-center gap-1">
                  <span className="w-1 h-1 bg-brand-success rounded-full" />
                  Verified stay
                </span>
                <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                  property.availabilityStatus === 'FULL' ? 'bg-red-50 text-red-700 border-red-200' :
                  property.availabilityStatus === 'LIMITED AVAILABILITY' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {property.availabilityStatus === 'FULL' ? '🔴 Full' :
                   property.availableBeds !== undefined && property.availableBeds > 0 ? `🟢 ${property.availableBeds} beds free` :
                   '🟢 Available'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 truncate">
                <Link href={`/pg/${property.id}`} className="hover:text-brand-primary transition-colors">
                  {property.name}
                </Link>
              </h3>
            </div>

            {/* Score */}
            <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-brand-primary text-xs font-extrabold px-2.5 py-1 rounded-xl shadow-premium-sm shrink-0">
              <span>★</span>
              <span>{property.trustScore.toFixed(1)}</span>
            </div>
          </div>

          {/* Location */}
          <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {property.address}
          </p>

          {/* Amenities checklist icons */}
          <div className="flex flex-wrap gap-2 mt-2">
            {property.amenities.slice(0, 3).map((amenity) => (
              <span 
                key={amenity.id}
                className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded-lg flex items-center gap-1"
              >
                {amenity.name.includes('WiFi') && <Wifi className="w-3 h-3 text-slate-400" />}
                {amenity.name.includes('Air Conditioning') && <Wind className="w-3 h-3 text-slate-400" />}
                {amenity.name.includes('Gym') && <Dumbbell className="w-3 h-3 text-slate-400" />}
                <span>{amenity.name}</span>
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing and Action row */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Starts at</span>
            <p className="text-base font-extrabold text-slate-900 leading-none">
              ₹{property.priceFrom.toLocaleString('en-IN')}
              <span className="text-xs font-normal text-slate-500 font-mono">/mo</span>
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onFocusMap}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-all shadow-premium-sm cursor-pointer"
            >
              Locate
            </button>
            <Link
              href={`/pg/${property.id}`}
              className="text-[11px] font-bold bg-brand-primary hover:bg-brand-primary-dark text-white px-3.5 py-2 rounded-xl transition-all shadow-premium-sm flex items-center gap-1"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
