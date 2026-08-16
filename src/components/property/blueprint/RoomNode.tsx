'use client'

import { Bed as BedIcon, Check } from 'lucide-react'

type Bed = {
  id: string
  identifier: string
  status: string // "VACANT" | "OCCUPIED" | "MAINTENANCE"
}

type Room = {
  id: string
  roomNumber: string
  capacity: number
  hasWashroom: boolean
  beds: Bed[]
}

interface RoomNodeProps {
  room: Room
  onClick: () => void
}

export default function RoomNode({ room, onClick }: RoomNodeProps) {
  const totalBeds = room.beds.length
  const vacantBeds = room.beds.filter(b => b.status === 'VACANT').length
  const isMaintenance = room.beds.some(b => b.status === 'MAINTENANCE')

  // Color Coding Status
  let statusColor = 'border-red-200 bg-red-50/50 text-red-650 hover:bg-red-50'
  let labelColor = 'text-red-600/80'
  let statusLabel = 'FULL'

  if (room.capacity === 0) {
    // Reception / Common area
    statusColor = 'border-slate-200/60 bg-white text-slate-500 hover:bg-slate-50'
    labelColor = 'text-slate-400'
    statusLabel = 'COMMON'
  } else if (vacantBeds > 0) {
    statusColor = 'border-brand-success/35 bg-brand-success-light/20 text-brand-success hover:bg-brand-success-light/30'
    labelColor = 'text-brand-success/70'
    statusLabel = `${vacantBeds}/${totalBeds} VACANT`
  } else if (isMaintenance) {
    statusColor = 'border-purple-200 bg-purple-50 text-purple-650 hover:bg-purple-100/50'
    labelColor = 'text-purple-600'
    statusLabel = 'MAINTENANCE'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`border rounded-2xl p-4 flex flex-col justify-between items-stretch transition-all duration-200 hover:-translate-y-[1px] hover:shadow-premium-sm aspect-square text-left cursor-pointer ${statusColor}`}
    >
      <div className="flex justify-between items-start w-full">
        <span className="text-base font-extrabold tracking-tight font-mono">RM {room.roomNumber}</span>
        {room.capacity > 0 && <BedIcon className="w-4 h-4 shrink-0" />}
      </div>

      <div className="flex flex-col gap-1.5 mt-auto">
        {room.capacity > 0 ? (
          <>
            <span className={`text-[9px] font-bold uppercase tracking-widest font-mono ${labelColor}`}>
              {statusLabel}
            </span>
            <span className="text-[10px] text-slate-500 font-semibold truncate leading-none">
              {room.hasWashroom ? 'Attached Washroom' : 'Shared Washroom'}
            </span>
          </>
        ) : (
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            Facility Area
          </span>
        )}
      </div>
    </button>
  )
}
