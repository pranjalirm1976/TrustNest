'use client'

import { useState } from 'react'
import { Calendar, Clock, ChevronDown, CheckCircle, ShieldCheck } from 'lucide-react'
import BookingModal from './BookingModal'

interface CheckAvailabilityCardProps {
  property?: {
    id: string
    name: string
    address: string
    priceFrom: number
  }
  floors?: any[]
}

export default function CheckAvailabilityCard({ property, floors = [] }: CheckAvailabilityCardProps) {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [duration, setDuration] = useState('6 Months')
  const [roomType, setRoomType] = useState('Any')
  const [showBookingModal, setShowBookingModal] = useState(false)

  const handleCheck = () => {
    setShowBookingModal(true)
  }

  return (
    <>
      <div id="book" className="bg-white border border-slate-205 rounded-2xl p-6 shadow-premium-sm flex flex-col gap-5">
        <div className="flex items-center gap-2 text-slate-800">
          <Calendar className="w-5 h-5 text-brand-primary" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider">Book / Check Availability</h3>
        </div>

        <div className="flex flex-col gap-3">
          {/* Check-in Date */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check-in Date</label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#fbfbfb] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-850 focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-[#fbfbfb] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-850 focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              <option>3 Months</option>
              <option>6 Months</option>
              <option>11 Months</option>
              <option>12 Months</option>
            </select>
          </div>

          {/* Room Type */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Room Type</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full bg-[#fbfbfb] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-850 focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              <option>Any Available Room</option>
              <option>Single Occupancy</option>
              <option>Double Sharing</option>
              <option>Triple Sharing</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCheck}
          className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs py-3.5 rounded-xl shadow-premium transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01]"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Book Inventory / Reserve Bed</span>
        </button>
      </div>

      {showBookingModal && property && (
        <BookingModal
          property={property}
          floors={floors}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </>
  )
}
