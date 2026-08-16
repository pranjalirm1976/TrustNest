'use client'

import { useState } from 'react'
import { MapPin, Navigation, Compass, Layers } from 'lucide-react'
import Image from 'next/image'

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
  latitude: number
  longitude: number
  images: PropertyImage[]
}

interface MapLayoutProps {
  properties: Property[]
  highlightedPropertyId: string | null
  setHighlightedPropertyId: (id: string | null) => void
}

export default function MapLayout({
  properties,
  highlightedPropertyId,
  setHighlightedPropertyId,
}: MapLayoutProps) {
  const [activePin, setActivePin] = useState<Property | null>(null)

  // Pune Coordinate Bounding Box for Mapping
  // Min: Lat 18.53, Lng 73.71 (Baner/Hinjewadi)
  // Max: Lat 18.61, Lng 73.95 (Wakad to Kharadi)
  const latMin = 18.53
  const latMax = 18.61
  const lngMin = 73.71
  const lngMax = 73.95

  const getRelativePosition = (lat: number, lng: number) => {
    // Map to 0-100% X/Y coordinates
    const x = ((lng - lngMin) / (lngMax - lngMin)) * 100
    // Invert Y because latitude grows upwards but screen Y goes downwards
    const y = 100 - ((lat - latMin) / (latMax - latMin)) * 100

    // Constrain within bounds (5% padding to keep pins inside the map)
    const paddedX = Math.max(5, Math.min(95, x))
    const paddedY = Math.max(5, Math.min(95, y))

    return { x: paddedX, y: paddedY }
  }

  return (
    <div className="w-full h-full min-h-[350px] lg:h-[calc(100vh-13rem)] bg-slate-100 border border-slate-200 rounded-3xl overflow-hidden shadow-premium relative flex flex-col">
      {/* Map Control HUD Overlay */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <div className="bg-white border border-slate-200/80 p-2.5 rounded-xl shadow-premium flex items-center gap-2">
          <Navigation className="w-4 h-4 text-brand-primary" />
          <span className="text-xs font-bold text-slate-800">Pune Metro Area Map</span>
        </div>
        <button 
          onClick={() => {
            // Reset focus
            setActivePin(null)
            setHighlightedPropertyId(null)
          }}
          className="bg-white border border-slate-200/80 hover:bg-slate-50 p-2.5 rounded-xl shadow-premium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          title="Recenter Map"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <div className="bg-white border border-slate-200/80 p-2.5 rounded-xl shadow-premium flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Vector Hybrid</span>
        </div>
      </div>

      {/* Styled Blueprint / Road Grid Mockup */}
      <div className="flex-1 relative bg-slate-50 overflow-hidden select-none">
        {/* Subtle grid pattern representing streets */}
        <div 
          className="absolute inset-0 opacity-[0.08]" 
          style={{ 
            backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px), linear-gradient(#4f46e5 0.5px, transparent 0.5px), linear-gradient(90deg, #4f46e5 0.5px, transparent 0.5px)', 
            backgroundSize: '30px 30px, 120px 120px, 120px 120px' 
          }} 
        />

        {/* Abstract Roads drawing */}
        <svg className="absolute inset-0 w-full h-full text-slate-200" pointerEvents="none">
          <line x1="0" y1="30%" x2="100%" y2="50%" stroke="currentColor" strokeWidth="6" />
          <line x1="30%" y1="0" x2="40%" y2="100%" stroke="currentColor" strokeWidth="6" />
          <line x1="70%" y1="0" x2="80%" y2="100%" stroke="currentColor" strokeWidth="8" />
          <line x1="0" y1="75%" x2="100%" y2="70%" stroke="currentColor" strokeWidth="10" />
          {/* Mula-Mutha River representation */}
          <path d="M 0,60 Q 30,50 50,70 T 100,55" fill="none" stroke="#e0f2fe" strokeWidth="24" className="text-sky-100" />
        </svg>

        {/* Major Landmarks labels on map */}
        <div className="absolute top-[20%] left-[10%] text-[10px] font-bold text-slate-300 uppercase tracking-widest pointer-events-none">Hinjawadi IT Park</div>
        <div className="absolute top-[65%] left-[20%] text-[10px] font-bold text-slate-300 uppercase tracking-widest pointer-events-none">Wakad Chowk</div>
        <div className="absolute top-[40%] left-[45%] text-[10px] font-bold text-slate-300 uppercase tracking-widest pointer-events-none">Baner Rd</div>
        <div className="absolute top-[50%] left-[82%] text-[10px] font-bold text-slate-300 uppercase tracking-widest pointer-events-none">Kharadi EON</div>

        {/* Active Pins Map Markers */}
        {properties.map((property) => {
          const { x, y } = getRelativePosition(property.latitude, property.longitude)
          const isHighlighted = highlightedPropertyId === property.id
          
          return (
            <div
              key={property.id}
              className="absolute z-30 transition-all duration-300 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <button
                type="button"
                onClick={() => {
                  setActivePin(property)
                  setHighlightedPropertyId(property.id)
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold shadow-premium transition-all duration-200 cursor-pointer ${
                  isHighlighted
                    ? 'bg-brand-primary text-white scale-110 z-40'
                    : 'bg-white text-slate-800 border border-slate-200 hover:scale-105'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isHighlighted ? 'text-white' : 'text-brand-primary'}`} />
                <span className="text-xs font-mono">₹{Math.round(property.priceFrom / 1000)}k</span>
              </button>
            </div>
          )
        })}

        {/* Active Pin Detailed Hover Popover */}
        {activePin && (
          <div className="absolute bottom-6 left-6 right-6 z-40 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-premium-lg animate-in flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
              <Image
                src={activePin.images[0]?.url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80'}
                alt={activePin.name}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <h4 className="text-sm font-bold text-slate-900 truncate">{activePin.name}</h4>
                <p className="text-[10px] text-slate-500 truncate">{activePin.address}</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs font-extrabold text-slate-900">₹{activePin.priceFrom.toLocaleString('en-IN')}/mo</span>
                <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 text-brand-primary text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-premium-sm">
                  <span>★</span>
                  <span>{activePin.trustScore.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => {
                setActivePin(null)
                setHighlightedPropertyId(null)
              }}
              className="text-slate-400 hover:text-slate-600 font-bold text-sm px-2 cursor-pointer self-start"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
