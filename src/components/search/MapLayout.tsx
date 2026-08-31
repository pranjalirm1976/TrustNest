'use client'

import { useState, useEffect } from 'react'
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

  // Track highlighted property from list and sync map focus
  useEffect(() => {
    if (highlightedPropertyId) {
      const prop = properties.find(p => p.id === highlightedPropertyId)
      if (prop) setActivePin(prop)
    }
  }, [highlightedPropertyId, properties])

  // Build interactive Google Map search query URL
  // If a property is active/focused, embed its exact address for real-time navigation mapping.
  const queryAddress = activePin 
    ? `${activePin.name}, ${activePin.address}`
    : 'Hinjawadi Phase 1, Pune, Maharashtra'
  
  const googleMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(queryAddress)}&t=&z=14&ie=UTF8&iwloc=B&output=embed`

  return (
    <div className="w-full h-full min-h-[350px] lg:h-[calc(100vh-13rem)] bg-slate-100 border border-slate-205 rounded-3xl overflow-hidden shadow-premium relative flex flex-col">
      
      {/* Map Control HUD Overlay */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <div className="bg-white/90 backdrop-blur border border-slate-200 p-2.5 rounded-xl shadow-premium flex items-center gap-2">
          <Navigation className="w-4 h-4 text-brand-primary" />
          <span className="text-xs font-bold text-slate-805">Interactive Google Map</span>
        </div>
        <button 
          onClick={() => {
            setActivePin(null)
            setHighlightedPropertyId(null)
          }}
          className="bg-white/90 backdrop-blur border border-slate-200 hover:bg-slate-50 p-2.5 rounded-xl shadow-premium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          title="Recenter Map"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <div className="bg-white/90 backdrop-blur border border-slate-200 p-2.5 rounded-xl shadow-premium flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-primary animate-pulse" />
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Live Satellite</span>
        </div>
      </div>

      {/* Real Google Maps Embed Iframe */}
      <div className="flex-1 relative bg-slate-50 overflow-hidden">
        <iframe
          src={googleMapUrl}
          className="w-full h-full border-0 absolute inset-0"
          allowFullScreen
          loading="lazy"
          title="Google Maps Location View"
        />

        {/* Active Pin Detailed Hover Popover */}
        {activePin && (
          <div className="absolute bottom-6 left-6 right-6 z-30 bg-white border border-slate-205 rounded-2xl p-4 shadow-premium-lg animate-in flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
              <Image
                src={activePin.images[0]?.url || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80'}
                alt={activePin.name}
                fill
                className="object-cover"
                unoptimized={activePin.images[0]?.url?.startsWith('/uploads/') || activePin.images[0]?.url?.startsWith('data:')}
              />
            </div>
            
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <h4 className="text-sm font-extrabold text-slate-905 truncate">{activePin.name}</h4>
                <p className="text-[10px] font-bold text-slate-450 truncate">{activePin.address}</p>
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
