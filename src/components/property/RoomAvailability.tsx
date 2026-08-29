'use client'

import { useState } from 'react'
import { Check, ShieldAlert, Bed as BedIcon, Phone, MessageSquare, Star, SlidersHorizontal, Map, CheckCircle, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import BookingModal from './BookingModal'
import ChatWithOwnerModal from './ChatWithOwnerModal'

type Bed = {
  id: string
  identifier: string
  status: string // "VACANT" | "OCCUPIED" | "MAINTENANCE"
}

type RoomAmenity = {
  id: string
  name: string
}

type Room = {
  id: string
  roomNumber: string
  capacity: number
  hasWashroom: boolean
  beds: Bed[]
  amenities: RoomAmenity[]
}

interface RoomAvailabilityProps {
  property?: {
    id: string
    name: string
    address: string
    priceFrom: number
  }
  rooms: Room[]
  floors?: any[]
  priceFrom: number
  onViewBlueprint?: () => void
}

export default function RoomAvailability({ property, rooms, floors = [], priceFrom, onViewBlueprint }: RoomAvailabilityProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [selectedBedIdToBook, setSelectedBedIdToBook] = useState<string>('')
  
  // Filters states
  const [roomType, setRoomType] = useState('All')
  const [sharing, setSharing] = useState('All')
  const [floor, setFloor] = useState('All')
  const [rentRange, setRentRange] = useState('All')

  // Pagination page state
  const [page, setPage] = useState(1)

  // Helper to determine sharing format name
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

  // Fallback thumbnails for rooms
  const roomImages = [
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80',
  ]

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* Filters & Floor Plan trigger row exactly matching Mockup 3 */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white border border-slate-200/60 p-4 rounded-2xl shadow-premium-sm">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Room Type */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Room Type</span>
            <select 
              value={roomType} 
              onChange={(e) => setRoomType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option>All</option>
              <option>AC</option>
              <option>Non-AC</option>
            </select>
          </div>

          {/* Sharing */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sharing</span>
            <select 
              value={sharing} 
              onChange={(e) => setSharing(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option>All</option>
              <option>Single</option>
              <option>Double</option>
              <option>Triple</option>
            </select>
          </div>

          {/* Floor */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Floor</span>
            <select 
              value={floor} 
              onChange={(e) => setFloor(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option>All</option>
              <option>Ground Floor</option>
              <option>1st Floor</option>
              <option>2nd Floor</option>
            </select>
          </div>

          {/* Rent Range */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rent Range</span>
            <select 
              value={rentRange} 
              onChange={(e) => setRentRange(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option>All</option>
              <option>Under ₹8k</option>
              <option>₹8k - ₹10k</option>
              <option>Above ₹10k</option>
            </select>
          </div>

          <button className="border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>More Filters</span>
          </button>
        </div>

        <button 
          onClick={() => {
            const element = document.getElementById('layout')
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' })
            } else if (onViewBlueprint) {
              onViewBlueprint()
            }
          }}
          className="bg-white border border-brand-primary text-brand-primary hover:bg-indigo-50/20 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-premium-sm"
        >
          <Map className="w-3.5 h-3.5" />
          <span>View Layout (Floor Plan)</span>
        </button>
      </div>

      {/* Main split row layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Vertical Rooms list (8 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {rooms.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
              <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-2 animate-pulse" />
              <p className="text-slate-600 font-semibold text-sm">No rooms found matching filters</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {rooms.map((room, idx) => {
                const roomPrice = calculatePrice(room.capacity)
                const isSelected = selectedRoomId === room.id

                return (
                  <div 
                    key={room.id}
                    className={`bg-white border rounded-2xl p-4 shadow-premium-sm hover:shadow-premium flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 transition-all duration-200 relative ${
                      isSelected ? 'border-brand-primary ring-2 ring-indigo-50' : 'border-slate-200/60'
                    }`}
                  >
                    
                    {/* Room Thumbnail Photo */}
                    <div className="relative w-full md:w-36 h-28 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200/40">
                      <Image
                        src={roomImages[idx % roomImages.length]}
                        alt={`Room ${room.roomNumber}`}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Room Metadata */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-extrabold text-slate-900">Room {room.roomNumber}</h4>
                          <span className="bg-indigo-50 border border-indigo-100 text-brand-primary text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded">
                            1st Floor
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-1">
                          {getSharingType(room.capacity)} • Beds
                        </p>
                      </div>

                      {/* Amenities badges */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          Attached Bathroom
                        </span>
                        {room.amenities.map(a => (
                          <span key={a.id} className="text-[9px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                            {a.name}
                          </span>
                        ))}
                      </div>

                      <div className="text-base font-extrabold text-slate-900 mt-3">
                        ₹{roomPrice.toLocaleString('en-IN')}
                        <span className="text-[10px] font-normal text-slate-500 font-mono">/month per bed</span>
                      </div>
                    </div>

                    {/* Bed Status visual indicators */}
                    <div className="flex flex-col gap-2 shrink-0 md:border-l md:border-slate-100 md:pl-6">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        Bed Availability
                      </span>
                      <div className="flex gap-2">
                        {room.beds.map((bed) => {
                          const isVacant = bed.status === 'VACANT'
                          const isReserved = bed.status === 'RESERVED' || bed.status === 'MAINTENANCE'
                          return (
                            <button
                              key={bed.id}
                              type="button"
                              onClick={() => {
                                if (isVacant) {
                                  setSelectedRoomId(room.id)
                                  setSelectedBedIdToBook(bed.id)
                                  setShowBookingModal(true)
                                }
                              }}
                              title={`Bed ${bed.identifier} (${bed.status})${isVacant ? ' - Click to Book' : ''}`}
                              className={`p-1.5 rounded-lg border flex flex-col items-center justify-center gap-0.5 min-w-[52px] transition-all ${
                                isVacant 
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer shadow-sm' 
                                  : isReserved
                                  ? 'border-amber-200 bg-amber-50 text-amber-700 cursor-default'
                                  : 'border-red-200 bg-red-50 text-red-600 cursor-default'
                              }`}
                            >
                              <BedIcon className="w-3.5 h-3.5" />
                              <span className="text-[8px] font-bold font-mono">
                                {isVacant ? `Bed ${bed.identifier}` : isReserved ? 'Reserved' : 'Occupied'}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Action trigger button */}
                    <div className="shrink-0 flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedRoomId(selectedRoomId === room.id ? null : room.id)}
                        className={`text-xs font-bold px-3 py-2 rounded-xl border transition-all cursor-pointer shadow-premium-sm ${
                          isSelected 
                            ? 'bg-slate-900 text-white border-slate-900' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Details
                      </button>

                      <button
                        onClick={() => {
                          setSelectedRoomId(room.id)
                          const vacantBed = room.beds.find(b => b.status === 'VACANT')
                          setSelectedBedIdToBook(vacantBed?.id || '')
                          setShowBookingModal(true)
                        }}
                        className="text-xs font-bold px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white transition-all cursor-pointer shadow-premium-sm"
                      >
                        Book
                      </button>
                    </div>

                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination controls footer */}
          <div className="flex justify-between items-center text-xs font-semibold text-slate-450 border-t border-slate-100 pt-6 mt-4">
            <span>Showing 1 to {rooms.length} of {rooms.length} rooms</span>
            <div className="flex gap-1.5">
              <button 
                onClick={() => setPage(1)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-extrabold cursor-pointer border ${
                  page === 1 
                    ? 'bg-brand-primary text-white border-brand-primary' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                1
              </button>
              <button 
                onClick={() => setPage(2)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-extrabold cursor-pointer border ${
                  page === 2 
                    ? 'bg-brand-primary text-white border-brand-primary' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                2
              </button>
              <button 
                onClick={() => setPage(3)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-extrabold cursor-pointer border ${
                  page === 3 
                    ? 'bg-brand-primary text-white border-brand-primary' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                3
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar cards (4 columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Why Residents Love This PG */}
          <div className="bg-white border border-slate-205 p-6 rounded-2xl shadow-premium-sm flex flex-col gap-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Why Residents Love This PG</h3>
            <ul className="flex flex-col gap-3 text-xs font-semibold text-slate-700">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-brand-success shrink-0 mt-0.5" />
                <span>Clean and hygienic rooms</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-brand-success shrink-0 mt-0.5" />
                <span>Nutritious home-style food</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-brand-success shrink-0 mt-0.5" />
                <span>Quick complaint resolution</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-brand-success shrink-0 mt-0.5" />
                <span>Friendly and helpful staff</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-brand-success shrink-0 mt-0.5" />
                <span>24x7 security & CCTV</span>
              </li>
            </ul>
          </div>

          {/* Need Help Choosing? */}
          <div className="bg-indigo-50/70 border border-indigo-100/60 p-6 rounded-2xl flex flex-col gap-4 shadow-premium-sm">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Need Help Choosing?</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Our team is here to help you find the perfect room matching your requirements.
            </p>
            <button 
              onClick={() => alert('Opening live chat with support expert...')}
              className="bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs py-2.5 rounded-xl shadow-premium cursor-pointer transition-colors"
            >
              Talk to our expert
            </button>
          </div>

          {/* Talk to PG Owner Info badge */}
          <div className="bg-white border border-slate-205 p-6 rounded-2xl shadow-premium-sm flex flex-col gap-4">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Talk to PG Owner</h3>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-brand-primary font-bold text-sm">
                RS
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Rahul Sharma</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-500">4.7 (86 Reviews)</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowChatModal(true)}
              className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2 mt-2 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat with Owner (In-App)</span>
            </button>
          </div>

          {/* Top Rated PG in Hinjawadi */}
          <div className="bg-indigo-50/30 border border-indigo-100/50 p-6 rounded-2xl flex flex-col gap-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">PG Rankings</span>
            <h4 className="text-xs font-bold text-slate-900">Top Rated PG in Hinjawadi</h4>
            <p className="text-[11px] text-slate-500">Ranked #2 out of 120+ PGs in Hinjawadi</p>
            <button 
              onClick={() => alert('Showing rankings board!')}
              className="text-[11px] font-bold text-brand-primary hover:underline mt-2 self-start cursor-pointer"
            >
              See all rankings &gt;
            </button>
          </div>

        </div>

      </div>

      {showBookingModal && property && (
        <BookingModal
          property={property}
          floors={floors}
          initialRoomId={selectedRoomId || undefined}
          initialBedId={selectedBedIdToBook || undefined}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {showChatModal && property && (
        <ChatWithOwnerModal
          propertyId={property.id}
          propertyName={property.name}
          ownerName="Property Manager"
          onClose={() => setShowChatModal(false)}
        />
      )}

    </div>
  )
}
