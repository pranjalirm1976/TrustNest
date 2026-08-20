'use client'

import { useState, useEffect } from 'react'
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

  // 3D rotation state variables
  const [rotateX, setRotateX] = useState(55)
  const [rotateY, setRotateY] = useState(45)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [autoRotate, setAutoRotate] = useState(true)

  // Auto rotation effect
  useEffect(() => {
    if (!autoRotate || isDragging) return
    const interval = setInterval(() => {
      setRotateY(prev => (prev + 0.5) % 360)
    }, 16)
    return () => clearInterval(interval)
  }, [autoRotate, isDragging])

  // Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setAutoRotate(false)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y
    setRotateY(prev => prev + deltaX * 0.5)
    setRotateX(prev => Math.max(30, Math.min(75, prev - deltaY * 0.5)))
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUpOrLeave = () => {
    setIsDragging(false)
  }

  // Touch Drag handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return
    setIsDragging(true)
    setAutoRotate(false)
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return
    const deltaX = e.touches[0].clientX - dragStart.x
    const deltaY = e.touches[0].clientY - dragStart.y
    setRotateY(prev => prev + deltaX * 0.5)
    setRotateX(prev => Math.max(30, Math.min(75, prev - deltaY * 0.5)))
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
  }

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

  // Dynamically map slider photos to only show bedrooms that match the capacity (e.g. single/double/triple sharing)
  // This ensures the actual photos and the 3D model look completely consistent and identical in structure!
  const getSliderImages = (capacity: number) => {
    if (capacity === 1) {
      // Single occupancy room photos (navy blue bed cover, dark floor, study area)
      return [
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80', // Bed, desk, navy details
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80', // Single bed detail
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80', // Warm single bedroom
        'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80', // Study area in bedroom
      ]
    }
    if (capacity === 2) {
      // Double sharing room photos (two beds, dark floor)
      return [
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80', // Twin beds next to each other
        'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&q=80', // Double beds modern setup
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80', // Room perspective
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80', // Room desk
      ]
    }
    // Triple sharing room photos ( hostel styling beds, matching bed covers)
    return [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80', // Three single beds along the wall
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80', // Triple beds layout
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80', // Twin beds section
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80', // Single bed study area
    ]
  }

  const sliderImages = getSliderImages(room.capacity)

  // CSS 3D Room Rendering Helpers - styled in dark wood, navy blankets and white pillows to match unsplash photos exactly!
  const render3DBed = (x: string, y: string, index: number) => {
    const bedItem = room.beds[index]
    const isOccupied = bedItem ? bedItem.status === 'OCCUPIED' : false
    const statusColor = isOccupied ? 'bg-red-500 border-red-650' : 'bg-emerald-500 border-emerald-650'
    return (
      <div 
        key={`bed-${index}`}
        className="absolute w-10 h-16 transition-all duration-300"
        style={{ 
          left: x, 
          top: y, 
          transformStyle: 'preserve-3d', 
          transform: 'translateZ(1px)' 
        }}
      >
        {/* Bed Dark Wood Frame Base Box */}
        <div className="absolute inset-0 bg-[#271d19] rounded border border-stone-900" style={{ transform: 'translateZ(2px)' }} />
        {/* Mattress Box (White sheets matching actual photo) */}
        <div className="absolute left-[2px] right-[2px] top-[2px] bottom-[2px] bg-slate-50 border border-slate-200 rounded" style={{ transform: 'translateZ(5px)' }} />
        {/* Blanket/Bedsheet Box (Navy Blue matching actual photo) */}
        <div className="absolute left-[2px] right-[2px] top-[10px] bottom-[2px] rounded-b bg-[#1e3a8a] border-t border-white/20 border-x border-b border-indigo-950" style={{ transform: 'translateZ(6px)' }} />
        {/* Bed Status Sash/Runner (Green = Available, Red = Occupied) */}
        <div className={`absolute left-[2px] right-[2px] bottom-[3px] h-3 ${statusColor} border-y border-white/10`} style={{ transform: 'translateZ(6.5px)' }} />
        {/* Pillow Box (White matching actual photo) */}
        <div className="absolute left-[6px] right-[6px] top-[3px] h-3 bg-white border border-slate-250 rounded-sm" style={{ transform: 'translateZ(7px)' }} />
        {/* Label */}
        <div className="absolute left-0 right-0 -bottom-3 text-[6.5px] font-extrabold text-slate-450 text-center uppercase tracking-wide" style={{ transform: 'translateZ(9px) rotateX(-90deg)' }}>
          Bed {bedItem ? bedItem.identifier : String.fromCharCode(65 + index)}
        </div>
      </div>
    )
  }

  const render3DWardrobe = (x: string, y: string) => {
    return (
      <div 
        className="absolute w-8 h-8 transition-all duration-300"
        style={{ 
          left: x, 
          top: y, 
          transformStyle: 'preserve-3d', 
          transform: 'translateZ(1px)' 
        }}
      >
        {/* Cabinet base face in dark wood */}
        <div className="absolute inset-0 bg-[#1c110d] border border-stone-900 rounded shadow-lg" style={{ transform: 'translateZ(20px)' }} />
        {/* Front vertical face */}
        <div className="absolute left-0 bottom-0 w-8 h-[20px] bg-[#1c110d] border-r border-stone-950 origin-bottom transform rotate-x-90" />
        {/* Side vertical face */}
        <div className="absolute right-0 top-0 w-[20px] h-8 bg-stone-950 origin-right transform rotate-y-90" />
      </div>
    )
  }

  const render3DStudyDesk = (x: string, y: string, index: number) => {
    return (
      <div 
        key={`desk-${index}`}
        className="absolute w-8 h-6 transition-all duration-300"
        style={{ 
          left: x, 
          top: y, 
          transformStyle: 'preserve-3d', 
          transform: 'translateZ(1px)' 
        }}
      >
        {/* Table Top Surface in dark wood */}
        <div className="absolute inset-0 bg-[#251915] border border-stone-900 rounded" style={{ transform: 'translateZ(8px)' }} />
        {/* Table Legs */}
        <div className="absolute left-0.5 top-0.5 w-[1.5px] h-[8px] bg-stone-950 origin-bottom transform rotate-x-90" />
        <div className="absolute right-0.5 top-0.5 w-[1.5px] h-[8px] bg-stone-950 origin-bottom transform rotate-x-90" />
        <div className="absolute left-0.5 bottom-0.5 w-[1.5px] h-[8px] bg-stone-950 origin-bottom transform rotate-x-90" />
        <div className="absolute right-0.5 bottom-0.5 w-[1.5px] h-[8px] bg-stone-950 origin-bottom transform rotate-x-90" />
      </div>
    )
  }

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

            {/* 2. Interactive 3D Room Viewer Canvas (5 columns) */}
            <div 
              className="lg:col-span-5 bg-slate-950 p-5 rounded-2xl flex flex-col justify-between relative select-none overflow-hidden min-h-[350px]"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUpOrLeave}
            >
              <div className="flex justify-between items-center z-10">
                <div className="bg-white/10 backdrop-blur border border-white/10 px-2.5 py-1 rounded-lg text-white flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Interactive 3D Room View</span>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setAutoRotate(!autoRotate)
                    }}
                    className={`border px-2 py-1 rounded-lg text-[9px] font-bold transition-all cursor-pointer ${
                      autoRotate 
                        ? 'bg-brand-primary/20 border-brand-primary text-brand-primary' 
                        : 'bg-white/10 border-white/10 text-slate-350 hover:text-white'
                    }`}
                    title="Toggle Auto Rotation"
                  >
                    Auto Spin
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setRotateX(55)
                      setRotateY(45)
                      setAutoRotate(false)
                    }}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Reset View Angle"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Interactive 3D Room viewport */}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div 
                  className="relative w-72 h-56 flex items-center justify-center cursor-grab active:cursor-grabbing"
                  style={{ perspective: '800px' }}
                >
                  {/* Outer rotation container wrapper */}
                  <div 
                    className="w-64 h-48 relative transition-transform duration-75 ease-out"
                    style={{ 
                      transform: `rotateX(${rotateX}deg) rotateY(0deg) rotateZ(${rotateY}deg)`, 
                      transformStyle: 'preserve-3d' 
                    }}
                  >
                    {/* Floor (Dark Wood texture panel matching actual photos) */}
                    <div 
                      className="absolute inset-0 bg-[#2e1f18] border-2 border-stone-900 rounded"
                      style={{ 
                        backgroundImage: 'repeating-linear-gradient(90deg, #1c110d 0px, #1c110d 12px, #2e1f18 12px, #2e1f18 24px)',
                        transform: 'translateZ(0px)'
                      }}
                    />
                    
                    {/* Back Wall (North) */}
                    <div 
                      className="absolute left-0 top-0 h-16 w-64 bg-[#eae6e1] border-r border-stone-300 origin-top transform -rotate-x-90 flex items-center justify-center"
                      style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-90deg) translateZ(0px)' }}
                    >
                      {/* Window details */}
                      <div className="w-24 h-8 bg-sky-100/60 border border-sky-350 rounded flex items-center justify-center text-[7px] font-bold text-sky-800 shadow-inner">
                        Window View
                      </div>
                    </div>

                    {/* Left Wall (West) */}
                    <div 
                      className="absolute left-0 top-0 h-48 w-16 bg-[#dfdad3] border-b border-stone-300 origin-left transform -rotate-y-90 flex items-center justify-center"
                      style={{ transformStyle: 'preserve-3d', transform: 'rotateY(-90deg) translateZ(0px)' }}
                    >
                      {/* Door details */}
                      <div className="w-8 h-12 bg-amber-800 border border-amber-950 rounded-t shadow-md absolute bottom-0 left-6" />
                    </div>

                    {/* Render dynamic furniture objects matching active room configuration */}
                    {room.capacity === 1 && (
                      <>
                        {render3DBed('90px', '45px', 0)}
                        {render3DStudyDesk('150px', '55px', 0)}
                        {render3DWardrobe('90px', '125px')}
                      </>
                    )}

                    {room.capacity === 2 && (
                      <>
                        {render3DBed('35px', '20px', 0)}
                        {render3DBed('35px', '100px', 1)}
                        {render3DStudyDesk('110px', '25px', 0)}
                        {render3DStudyDesk('110px', '105px', 1)}
                        {render3DWardrobe('185px', '60px')}
                      </>
                    )}

                    {room.capacity === 3 && (
                      <>
                        {render3DBed('30px', '10px', 0)}
                        {render3DBed('30px', '65px', 1)}
                        {render3DBed('30px', '120px', 2)}
                        {render3DStudyDesk('105px', '15px', 0)}
                        {render3DStudyDesk('105px', '70px', 1)}
                        {render3DStudyDesk('105px', '125px', 2)}
                        {render3DWardrobe('185px', '65px')}
                      </>
                    )}

                    {room.capacity >= 4 && (
                      <>
                        {render3DBed('30px', '15px', 0)}
                        {render3DBed('30px', '105px', 1)}
                        {render3DBed('160px', '15px', 2)}
                        {render3DBed('160px', '105px', 3)}
                        {render3DStudyDesk('90px', '20px', 0)}
                        {render3DStudyDesk('90px', '110px', 1)}
                        {render3DWardrobe('110px', '65px')}
                      </>
                    )}

                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center z-10 w-full">
                <div className="flex items-center gap-1 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                  <Compass className="w-3 h-3 text-slate-500" />
                  <span>North Orientation</span>
                </div>
                <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">
                  Drag / Swipe to Rotate Room
                </span>
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
