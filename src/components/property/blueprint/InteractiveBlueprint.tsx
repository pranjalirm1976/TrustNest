'use client'

import { useState } from 'react'
import FloorSelector from './FloorSelector'
import RoomNode from './RoomNode'
import Room3DViewerModal from './Room3DViewerModal'
import BlueprintLegend from './BlueprintLegend'
import { ShieldCheck, Compass } from 'lucide-react'

type Bed = {
  id: string
  identifier: string
  status: string
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

type FloorFacility = {
  id: string
  name: string
}

type Floor = {
  id: string
  name: string
  level: number
  rooms: Room[]
  facilities: FloorFacility[]
}

interface InteractiveBlueprintProps {
  floors: Floor[]
  priceFrom: number
}

export default function InteractiveBlueprint({ floors, priceFrom }: InteractiveBlueprintProps) {
  const [activeFloorId, setActiveFloorId] = useState<string>(floors[0]?.id || '')
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  const activeFloor = floors.find((f) => f.id === activeFloorId)

  if (!activeFloor) return null

  // Sorted facilities list
  const stairways = ['Stairs', 'Elevator', 'Lobby']

  return (
    <div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-premium flex flex-col gap-8 w-full mt-4">
      {/* Floor selector toggle */}
      <FloorSelector
        floors={floors.map(f => ({ id: f.id, name: f.name, level: f.level }))}
        activeFloorId={activeFloorId}
        setActiveFloorId={setActiveFloorId}
      />

      {/* CAD legend */}
      <BlueprintLegend />

      {/* Blueprint visual Grid canvas with horizontal scrolling for mobile */}
      <div className="bg-slate-50 border border-slate-200/60 p-8 sm:p-12 rounded-2xl relative overflow-hidden overflow-x-auto scrollbar-thin min-h-[300px]">
        {/* Subtle engineering grid background */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ 
            backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)', 
            backgroundSize: '24px 24px' 
          }} 
        />

        {/* Blueprint Layout Grid with horizontal min-width to avoid squishing */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10 min-w-[600px]">
          
          {/* Static Stairways / Lift blueprint nodes - Gray Common Area */}
          <div className="col-span-1 border border-slate-200 bg-slate-50 p-4 rounded-2xl flex flex-col justify-between aspect-square text-left text-slate-400">
            <span className="text-base font-extrabold font-mono text-slate-400">STAIRS / LIFT</span>
            <span className="text-[9px] font-bold uppercase tracking-widest font-mono">Service Core</span>
          </div>

          {/* Render Common Facilities (Kitchen, lounge, dining) - Blue Facility */}
          {activeFloor.facilities.map((fac) => (
            <div 
              key={fac.id} 
              className="col-span-1 border border-blue-200 bg-blue-50/50 p-4 rounded-2xl flex flex-col justify-between aspect-square text-left text-blue-700 shadow-premium-sm"
            >
              <span className="text-base font-extrabold tracking-tight font-mono uppercase">{fac.name}</span>
              <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest font-mono">Facility</span>
            </div>
          ))}

          {/* Render Active Rooms */}
          {activeFloor.rooms.map((room) => (
            <RoomNode
              key={room.id}
              room={room}
              onClick={() => setSelectedRoom(room)}
            />
          ))}

        </div>

        {/* Compass orientation in grid background */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
          <Compass className="w-3.5 h-3.5 text-slate-400" />
          <span>True North</span>
        </div>
      </div>

      {/* 3D viewer modal render */}
      {selectedRoom && (
        <Room3DViewerModal
          room={selectedRoom}
          priceFrom={priceFrom}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </div>
  )
}
