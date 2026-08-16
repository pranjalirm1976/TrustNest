'use client'

import { X, ShieldCheck, Box, Compass, RefreshCw } from 'lucide-react'

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-4xl shadow-premium-lg overflow-hidden flex flex-col lg:flex-row h-auto max-h-[90vh] lg:h-[550px] animate-in">
        
        {/* Left Side: 3D Canvas / Render Container (60% width) */}
        <div className="flex-1 bg-slate-950 p-6 flex flex-col relative min-h-[300px] lg:h-full justify-between select-none">
          {/* HUD Info */}
          <div className="flex justify-between items-center z-10">
            <div className="bg-white/10 backdrop-blur border border-white/10 px-3 py-1.5 rounded-xl text-white flex items-center gap-2">
              <Box className="w-4 h-4 text-brand-primary animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest font-mono">3D Room Visualizer</span>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => alert('Simulated reload / recanvas')}
                className="bg-white/10 hover:bg-white/20 border border-white/10 p-2 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Reset Camera View"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3D RENDER CANVAS CONTAINER MOCKUP */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-6">
            
            {/* Styled CSS 3D Isometric Placeholder Box representing a bed/room block */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Outer boundary representation */}
              <div className="absolute inset-0 border border-dashed border-white/20 rounded-2xl animate-spin-slow pointer-events-none" />

              {/* Refined CSS 3D Box */}
              <div 
                className="w-24 h-24 relative transform-style-3d rotate-x-30 rotate-y-45 transition-transform duration-1000"
                style={{ transform: 'rotateX(60deg) rotateZ(45deg)' }}
              >
                {/* Top face */}
                <div className="absolute inset-0 bg-indigo-500/30 border border-brand-primary/80 transform translate-z-12" />
                {/* Front face */}
                <div className="absolute left-0 bottom-0 w-24 h-12 bg-indigo-600/40 border border-brand-primary/80 origin-bottom transform rotate-x-90" />
                {/* Side face */}
                <div className="absolute right-0 bottom-0 w-12 h-24 bg-indigo-700/50 border border-brand-primary/80 origin-bottom-right transform rotate-y-90 rotate-z-90" />
              </div>
            </div>

            {/* Canvas Loader status text */}
            <div className="flex flex-col items-center gap-1.5 text-center mt-6">
              <span className="text-white font-extrabold text-sm tracking-tight">3D Render Canvas Container</span>
              <p className="text-xs text-slate-400 max-w-xs leading-normal">
                `Three.js` WebGL loader ready. Canvas is configured to load `.glb` asset asynchronously.
              </p>
            </div>

          </div>

          {/* Compass overlay */}
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest z-10">
            <Compass className="w-3.5 h-3.5 text-slate-500" />
            <span>North Orientation</span>
          </div>
        </div>

        {/* Right Side: Room parameters & CTAs (40% width) */}
        <div className="w-full lg:w-80 bg-white p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200/80 overflow-y-auto">
          <div className="flex flex-col gap-6">
            
            {/* Modal header */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Room {room.roomNumber}</h3>
                <span className="text-xs font-semibold text-slate-500">{getSharingType(room.capacity)}</span>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 border border-slate-200 p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 w-full" />

            {/* Room Parameters lists */}
            <div className="flex flex-col gap-4 text-xs font-semibold text-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-widest">Rent Rate</span>
                <span className="text-slate-900 font-extrabold text-sm">₹{roomPrice.toLocaleString('en-IN')}/mo</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-widest">Washroom</span>
                <span className="text-slate-900 font-bold">
                  {room.hasWashroom ? 'Private Attached' : 'Shared Common'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-bold uppercase tracking-widest">Bed Status</span>
                <span className="text-slate-900 font-bold">
                  {room.beds.filter(b => b.status === 'VACANT').length} / {room.capacity} Vacant
                </span>
              </div>
            </div>

            {/* Guarantee Tag */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3 mt-2">
              <ShieldCheck className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
              <p className="text-[10px] text-indigo-950 leading-relaxed">
                This room layout matches exactly our certified blueprint checks. Click book below to claim a vacant bed.
              </p>
            </div>

          </div>

          {/* Book Action CTA */}
          <button
            onClick={() => alert(`Initiating checkout process for Room ${room.roomNumber}`)}
            className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-sm py-3.5 rounded-xl shadow-premium hover:shadow-premium-lg transition-all duration-200 mt-8 cursor-pointer"
          >
            Book Bed in Room {room.roomNumber}
          </button>
        </div>

      </div>
    </div>
  )
}
