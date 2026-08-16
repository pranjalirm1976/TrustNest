'use client'

import { useState } from 'react'
import { Check, ShieldAlert, Bed as BedIcon } from 'lucide-react'

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
  rooms: Room[]
  priceFrom: number
}

export default function RoomAvailability({ rooms, priceFrom }: RoomAvailabilityProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

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
    // Single room is most expensive, shared rooms have lower base prices
    if (capacity === 1) return priceFrom * 1.3
    if (capacity === 2) return priceFrom * 1.0
    return priceFrom * 0.85
  }

  return (
    <div className="flex flex-col gap-6">

      {rooms.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
          <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600 font-semibold text-sm">No room layouts loaded</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => {
            const vacantBeds = room.beds.filter(b => b.status === 'VACANT').length
            const isFull = vacantBeds === 0 && room.capacity > 0
            const roomPrice = calculatePrice(room.capacity)

            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoomId(selectedRoomId === room.id ? null : room.id)}
                className={`bg-white border rounded-2xl p-6 shadow-premium hover:shadow-premium-lg transition-all duration-200 flex flex-col gap-4 cursor-pointer relative ${
                  selectedRoomId === room.id ? 'border-brand-primary ring-2 ring-indigo-50' : 'border-slate-200/60'
                }`}
              >
                {/* Header row */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Room {room.roomNumber}</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">{getSharingType(room.capacity)}</p>
                  </div>
                  
                  {room.capacity > 0 && (
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                      isFull ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {isFull ? 'Filled' : `${vacantBeds} Vacant Bed${vacantBeds > 1 ? 's' : ''}`}
                    </span>
                  )}
                </div>

                {/* Washroom and basic highlights */}
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-brand-success" />
                    {room.hasWashroom ? 'Attached washroom' : 'Common washroom'}
                  </span>
                  {room.capacity > 0 && (
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-brand-success" />
                      <span>{room.capacity} Total Beds</span>
                    </span>
                  )}
                </div>

                {/* Amenities checklist */}
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {room.amenities.map((amenity) => (
                    <span 
                      key={amenity.id}
                      className="text-[9px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100"
                    >
                      {amenity.name}
                    </span>
                  ))}
                </div>

                {/* Bed layout visuals */}
                {room.capacity > 0 && (
                  <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100 mt-2">
                    {room.beds.map((bed) => (
                      <div
                        key={bed.id}
                        title={`Bed ${bed.identifier} (${bed.status})`}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          bed.status === 'VACANT' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' :
                          bed.status === 'OCCUPIED' ? 'border-red-200 bg-red-50 text-red-600' :
                          'border-purple-200 bg-purple-50 text-purple-600'
                        }`}
                      >
                        <BedIcon className="w-4 h-4" />
                        <span className="text-[10px] font-bold font-mono">Bed {bed.identifier}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Rent Price footer */}
                {room.capacity > 0 && (
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-auto">
                    <span className="text-xs text-slate-400 font-semibold">Estimated Rent</span>
                    <p className="text-base font-extrabold text-slate-900">
                      ₹{roomPrice.toLocaleString('en-IN')}
                      <span className="text-xs font-normal text-slate-500 font-mono">/mo</span>
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
