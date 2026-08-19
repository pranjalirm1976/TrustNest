'use client'

import { useState } from 'react'
import { X, ShieldCheck, Box, Compass, RefreshCw, Heart, Info, Check, MapPin, Eye } from 'lucide-react'
import Image from 'next/image'

type Bed = {
  id: string
  identifier: string
  status: string
}

type Room = {
  id: string
  roomNumber: string
  capacity: number
  hasWashroom: boolean
  beds: Bed[]
}

interface Room3DViewerModalProps {
  room: Room
  onClose: () => void
  priceFrom: number
}

export default function Room3DViewerModal({
  room,
  onClose,
  priceFrom,
}: Room3DViewerModalProps) {
  const [activeThumb, setActiveThumb] = useState(0)

  // Sharing format
  const getSharingType = (capacity: number) => {
    if (capacity === 0) return 'Common Area'
    if (capacity === 1) return 'Single Occupancy'
    if (capacity === 2) return 'Double Sharing'
    if (capacity === 3) return 'Triple Sharing'
    return `${capacity} Sharing`
  }

  // Calculate pricing based on sharing format
  const calculatePrice = (capacity: number) => {
    if (capacity === 1) return priceFrom * 1.3
    if (capacity === 2) return priceFrom * 1.0
    return priceFrom * 0.85
  }

  const roomPrice = calculatePrice(room.capacity)

  // Mock thumbnails for Room 101 slider
  const sliderImages = [
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
  ]

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white border border-slate-205 rounded-3xl w-full max-w-6xl shadow-premium-lg flex flex-col my-8 overflow-hidden animate-in">
        
        {/* Header Bar exactly matching Mockup 5 */}
        <div className="bg-white px-8 py-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Room {room.roomNumber}</h2>
            <span className="bg-emerald-100 text-emerald-700 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded border border-emerald-200">
              Available
            </span>
            <div className="flex gap-2 text-xs font-semibold text-slate-500 pl-2 border-l border-slate-200 font-mono">
              <span>1st Floor</span>
              <span>•</span>
              <span>{getSharingType(room.capacity)}</span>
              <span>•</span>
              <span>{room.capacity} Beds</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => alert('Room saved to favorites!')}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs px-4 py-2 rounded-xl shadow-premium-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Save Room</span>
            </button>
            <button 
              onClick={() => alert(`Initiating checkout process for Room ${room.roomNumber}`)}
              className="bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-premium cursor-pointer"
            >
              Book Now
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-650 border border-slate-200 p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer shrink-0"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Inner Content Grid */}
        <div className="p-8 flex flex-col gap-8 max-h-[75vh] overflow-y-auto scrollbar-thin">
          
          {/* TOP ROW: Photo Slider, 3D Canvas, Room Info Column */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* 1. Actual Photo Slider (4 columns) */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200/60 bg-slate-100">
                <Image
                  src={sliderImages[activeThumb]}
                  alt={`Room ${room.roomNumber} photo`}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] font-extrabold uppercase text-white font-mono">
                  Actual Photo
                </span>
              </div>

              {/* Thumbnails row */}
              <div className="grid grid-cols-4 gap-2">
                {sliderImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveThumb(idx)}
                    className={`relative aspect-[4/3] rounded-lg overflow-hidden border transition-all cursor-pointer ${
                      activeThumb === idx ? 'border-brand-primary ring-2 ring-indigo-50' : 'border-slate-200 hover:opacity-80'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumb ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 2. 3D Room Viewer Canvas (5 columns) */}
            <div className="lg:col-span-5 bg-slate-950 p-5 rounded-2xl flex flex-col justify-between relative select-none overflow-hidden min-h-[250px]">
              <div className="flex justify-between items-center z-10">
                <div className="bg-white/10 backdrop-blur border border-white/10 px-2.5 py-1 rounded-lg text-white flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-wider font-mono">3D Room View</span>
                </div>
                
                <button 
                  onClick={() => alert('Recentering 3D model camera...')}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Reset View"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* CSS 3D Room isometric visualizer mockup */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <div className="absolute inset-0 border border-dashed border-white/10 rounded-full animate-spin-slow" />
                  
                  {/* Detailed 3D Room Cut-out mockup */}
                  <div 
                    className="w-28 h-20 relative"
                    style={{ transform: 'rotateX(55deg) rotateZ(45deg)', transformStyle: 'preserve-3d' }}
                  >
                    {/* Floor */}
                    <div className="absolute inset-0 bg-[#312e81] border border-white/20" />
                    {/* Back Wall */}
                    <div className="absolute left-0 top-0 h-10 w-28 bg-[#1e1b4b] origin-top transform -rotate-x-90 border-r border-white/10" />
                    {/* Left Wall */}
                    <div className="absolute left-0 top-0 h-20 w-10 bg-[#1e1b4b] origin-left transform -rotate-y-90 border-b border-white/10" />
                    {/* Double beds representation */}
                    <div className="absolute bottom-2 left-2 w-10 h-7 bg-emerald-500/80 border border-white/30 transform translate-z-2" />
                    <div className="absolute top-2 right-2 w-10 h-7 bg-emerald-500/80 border border-white/30 transform translate-z-2" />
                    {/* Wardrobe */}
                    <div className="absolute bottom-2 right-2 w-5 h-8 bg-amber-600/80 border border-white/30 transform translate-z-6" />
                  </div>
                </div>
                
                <button 
                  onClick={() => alert('Entering fullscreen 3D model...')}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-[9px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer mt-4 flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  <span>View in Fullscreen</span>
                </button>
              </div>

              <div className="flex items-center gap-1 text-[8px] font-bold text-slate-500 uppercase tracking-widest z-10">
                <Compass className="w-3 h-3 text-slate-500" />
                <span>North Orientation</span>
              </div>
            </div>

            {/* 3. Room Information column (3 columns) */}
            <div className="lg:col-span-3 border border-slate-205 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex flex-col gap-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-200 pb-1.5">
                  Room Information
                </h4>
                
                <div className="flex flex-col gap-2.5 text-xs font-semibold text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Room Type</span>
                    <span className="text-slate-900">{getSharingType(room.capacity)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Beds</span>
                    <span className="text-slate-900">{room.capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Available Beds</span>
                    <span className="text-emerald-700 font-extrabold">
                      {room.beds.filter(b => b.status === 'VACANT').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Occupied Beds</span>
                    <span className="text-slate-900">
                      {room.beds.filter(b => b.status === 'OCCUPIED').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Room Size</span>
                    <span className="text-slate-900 font-mono">16 x 12 ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Floor</span>
                    <span className="text-slate-900">1st Floor</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Room Facing</span>
                    <span className="text-slate-900">East</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-2 mt-1">
                    <span className="text-slate-400">Rent / Bed</span>
                    <span className="text-slate-900 font-extrabold">₹{roomPrice.toLocaleString('en-IN')}/mo</span>
                  </div>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 flex gap-2.5 mt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-emerald-950 leading-relaxed font-semibold">
                    All beds are currently available. Move in anytime.
                  </p>
                </div>
              </div>

              <button
                onClick={() => alert('Opening chat thread with property owner')}
                className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs py-3 rounded-xl shadow-premium cursor-pointer mt-4 transition-colors"
              >
                Contact Owner
              </button>
            </div>

          </div>

          {/* MID ROW: Features & Amenities and Why residents love this room */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Features (8 columns) */}
            <div className="lg:col-span-8 bg-slate-50/70 border border-slate-150 p-6 rounded-2xl">
              <h3 className="text-xs font-bold text-slate-405 uppercase tracking-widest font-mono border-b border-slate-200 pb-2 mb-4">
                Room Features & Amenities
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-700">
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Attached Bathroom</span>
                  <span className="text-slate-950 font-extrabold">1</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Study Table</span>
                  <span className="text-slate-950 font-extrabold">{room.capacity}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Chair</span>
                  <span className="text-slate-950 font-extrabold">{room.capacity}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Wardrobe</span>
                  <span className="text-slate-950 font-extrabold">{room.capacity}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Bed with Mattress</span>
                  <span className="text-slate-950 font-extrabold">{room.capacity}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Window</span>
                  <span className="text-slate-950 font-extrabold">1</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">AC Point</span>
                  <span className="text-slate-950 font-extrabold">1</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Wi-Fi</span>
                  <span className="text-slate-950 font-extrabold">High Speed</span>
                </div>
              </div>
            </div>

            {/* Why residents love (4 columns) */}
            <div className="lg:col-span-4 bg-white border border-slate-205 p-6 rounded-2xl shadow-premium-sm flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-405 uppercase tracking-widest font-mono border-b border-slate-200 pb-2 mb-2">
                Why Residents Love This Room
              </h3>
              <ul className="flex flex-col gap-2.5 text-xs font-semibold text-slate-700">
                <li className="flex items-start gap-2 text-slate-650">
                  <Check className="w-3.5 h-3.5 text-brand-success shrink-0 mt-0.5" />
                  <span>Spacious and well-ventilated</span>
                </li>
                <li className="flex items-start gap-2 text-slate-650">
                  <Check className="w-3.5 h-3.5 text-brand-success shrink-0 mt-0.5" />
                  <span>Large study area for each bed</span>
                </li>
                <li className="flex items-start gap-2 text-slate-650">
                  <Check className="w-3.5 h-3.5 text-brand-success shrink-0 mt-0.5" />
                  <span>Ample storage space</span>
                </li>
                <li className="flex items-start gap-2 text-slate-650">
                  <Check className="w-3.5 h-3.5 text-brand-success shrink-0 mt-0.5" />
                  <span>Natural light and clean environment</span>
                </li>
              </ul>
            </div>

          </div>

          {/* PROXIMITY FOOTER: Nearby this PG */}
          <div className="border-t border-slate-100 pt-6 flex flex-col gap-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Nearby this PG
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 text-xs font-semibold text-slate-750">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 truncate">Brahma Tiffin</p>
                  <span className="text-[9px] text-slate-400 font-mono">1.2 km away</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 truncate">Laundry Hub</p>
                  <span className="text-[9px] text-slate-400 font-mono">750 m away</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 truncate">D Mart</p>
                  <span className="text-[9px] text-slate-400 font-mono">1.8 km away</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 truncate">MedPlus Pharmacy</p>
                  <span className="text-[9px] text-slate-400 font-mono">1.1 km away</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 truncate">Hinjawadi Bus Stop</p>
                  <span className="text-[9px] text-slate-400 font-mono">950 m away</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 truncate">Café Coffee Day</p>
                  <span className="text-[9px] text-slate-400 font-mono">1.3 km away</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
