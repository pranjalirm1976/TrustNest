'use client'

import { useState } from 'react'
import BlueprintLegend from './BlueprintLegend'
import Room3DViewerModal from './Room3DViewerModal'
import { Compass, Sparkles, AlertCircle, ArrowRight, HelpCircle, Check, Eye } from 'lucide-react'

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
  // Setup standard list of mockup floors for display matching Mockup 4
  const mockupFloors = [
    { id: 'terrace', name: 'Terrace Floor', level: 4 },
    { id: 'floor3', name: '3rd Floor', level: 3 },
    { id: 'floor2', name: '2nd Floor', level: 2 },
    { id: floors[0]?.id || 'floor1', name: '1st Floor', level: 1 },
    { id: 'ground', name: 'Ground Floor', level: 0 },
    { id: 'basement', name: 'Basement', level: -1 },
  ]

  const [activeFloorId, setActiveFloorId] = useState<string>(floors[0]?.id || 'floor1')
  
  // Helper to determine sharing format name
  const getSharingType = (capacity: number) => {
    if (capacity === 0) return 'Common Area'
    if (capacity === 1) return 'Single Occupancy'
    if (capacity === 2) return 'Double Sharing'
    if (capacity === 3) return 'Triple Sharing'
    return `${capacity} Sharing`
  }
  
  // Find current floor rooms. If floor is a mock floor, use properties floor rooms as fallback
  const dbFloor = floors.find(f => f.id === activeFloorId) || floors[0]
  const currentFloorRooms = dbFloor?.rooms || []

  // Ensure we have rooms 101 to 106 styled for layout representation
  const defaultRooms: Room[] = [
    {
      id: 'rm-101',
      roomNumber: '101',
      capacity: 3,
      hasWashroom: true,
      beds: [
        { id: 'b1', identifier: 'A', status: 'VACANT' },
        { id: 'b2', identifier: 'B', status: 'VACANT' },
        { id: 'b3', identifier: 'C', status: 'OCCUPIED' },
      ],
      amenities: [{ id: 'a1', name: 'Study Table' }, { id: 'a2', name: 'Wardrobe' }]
    },
    {
      id: 'rm-102',
      roomNumber: '102',
      capacity: 2,
      hasWashroom: true,
      beds: [
        { id: 'b4', identifier: 'A', status: 'OCCUPIED' },
        { id: 'b5', identifier: 'B', status: 'OCCUPIED' },
      ],
      amenities: [{ id: 'a1', name: 'Study Table' }]
    },
    {
      id: 'rm-103',
      roomNumber: '103',
      capacity: 2,
      hasWashroom: true,
      beds: [
        { id: 'b6', identifier: 'A', status: 'VACANT' },
        { id: 'b7', identifier: 'B', status: 'VACANT' },
      ],
      amenities: [{ id: 'a1', name: 'Study Table' }]
    },
    {
      id: 'rm-104',
      roomNumber: '104',
      capacity: 3,
      hasWashroom: true,
      beds: [
        { id: 'b8', identifier: 'A', status: 'VACANT' },
        { id: 'b9', identifier: 'B', status: 'VACANT' },
        { id: 'b10', identifier: 'C', status: 'VACANT' },
      ],
      amenities: [{ id: 'a1', name: 'Study Table' }, { id: 'a2', name: 'Wardrobe' }]
    },
    {
      id: 'rm-105',
      roomNumber: '105',
      capacity: 2,
      hasWashroom: true,
      beds: [
        { id: 'b11', identifier: 'A', status: 'VACANT' },
        { id: 'b12', identifier: 'B', status: 'OCCUPIED' },
      ],
      amenities: [{ id: 'a1', name: 'Study Table' }]
    },
    {
      id: 'rm-106',
      roomNumber: '106',
      capacity: 4,
      hasWashroom: true,
      beds: [
        { id: 'b13', identifier: 'A', status: 'VACANT' },
        { id: 'b14', identifier: 'B', status: 'VACANT' },
        { id: 'b15', identifier: 'C', status: 'OCCUPIED' },
        { id: 'b16', identifier: 'D', status: 'OCCUPIED' },
      ],
      amenities: [{ id: 'a1', name: 'Study Table' }, { id: 'a2', name: 'Wardrobe' }]
    }
  ]

  const roomsToDisplay = currentFloorRooms.length >= 4 ? currentFloorRooms : defaultRooms
  const [activeRoomId, setActiveRoomId] = useState<string>(roomsToDisplay[0]?.id || 'rm-101')
  
  const activeRoom = roomsToDisplay.find(r => r.id === activeRoomId) || roomsToDisplay[0]
  const [show3DModal, setShow3DModal] = useState(false)

  // Calculate pricing based on capacity
  const calculatePrice = (capacity: number) => {
    if (capacity === 1) return priceFrom * 1.3
    if (capacity === 2) return priceFrom * 1.0
    return priceFrom * 0.85
  }

  // Get active floor details
  const activeFloorName = mockupFloors.find(f => f.id === activeFloorId)?.name || '1st Floor'

  return (
    <div id="layout" className="bg-white border border-slate-205 p-6 rounded-3xl shadow-premium flex flex-col gap-6 w-full mt-4">
      
      {/* Blueprint Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">PG Layout & Availability</h2>
        <p className="text-xs text-slate-500">View floor-wise layout, rooms and bed availability in real-time.</p>
      </div>

      {/* Main Blueprint layout grid split columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMN 1: Select Floor & Legend sidebars (3 columns) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Select Floor Menu */}
          <div className="bg-white border border-slate-205 rounded-xl p-4 shadow-premium-sm flex flex-col gap-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-200 pb-1.5">
              Select Floor
            </h4>
            <div className="flex flex-col gap-1.5">
              {mockupFloors.map((floor) => (
                <button
                  key={floor.id}
                  onClick={() => {
                    setActiveFloorId(floor.id)
                    // Reset active room context if switching floors
                    setActiveRoomId(roomsToDisplay[0]?.id || 'rm-101')
                  }}
                  className={`text-xs font-bold text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                    activeFloorId === floor.id
                      ? 'bg-brand-primary text-white shadow-premium'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {floor.name}
                </button>
              ))}
            </div>
          </div>

          {/* Color Legend component */}
          <BlueprintLegend />
        </div>

        {/* COLUMN 2: 2D Floor Plan Canvas (6 columns) */}
        <div className="lg:col-span-6 bg-slate-50 border border-slate-205 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
          
          {/* Header Info details */}
          <div className="flex justify-between items-center z-10 border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase font-mono">{activeFloorName}</h3>
              <div className="flex gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                <span>Total Rooms: 8</span>
                <span>•</span>
                <span>Available Rooms: 3</span>
                <span>•</span>
                <span>Available Beds: 6</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setShow3DModal(true)}
                className="bg-white border border-brand-primary hover:bg-indigo-50/20 text-brand-primary font-bold text-[10px] uppercase tracking-wide px-3 py-1.5 rounded-lg shadow-premium-sm transition-all cursor-pointer flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>3D View</span>
              </button>
              <button 
                onClick={() => alert('LEGEND: Rooms show bed status slots. Tap any node to view room details.')}
                className="bg-white border border-slate-200 text-slate-500 hover:text-slate-800 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
              >
                How to read layout
              </button>
            </div>
          </div>

          {/* Blueprint Engineering grid wrapper */}
          <div className="relative overflow-x-auto scrollbar-thin py-6">
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none" 
              style={{ 
                backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
              }} 
            />

            {/* Geometric Floor layout container exactly matching Mockup 4 */}
            <div className="min-w-[550px] border border-slate-350 bg-white p-6 rounded-xl relative flex flex-col gap-6 font-mono text-[10px]">
              
              {/* Upper corridor row of rooms */}
              <div className="grid grid-cols-4 gap-3 items-stretch">
                {roomsToDisplay.slice(0, 3).map((room) => {
                  const isSelected = activeRoomId === room.id
                  const vacantCount = room.beds.filter(b => b.status === 'VACANT').length
                  return (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoomId(room.id)}
                      className={`border rounded-lg p-3 flex flex-col justify-between aspect-[4/3] text-left cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-brand-primary ring-2 ring-indigo-50/50 bg-indigo-50/10' 
                          : 'border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-extrabold text-xs">RM {room.roomNumber}</span>
                        <span className="text-[8px] text-slate-400 font-bold">{room.capacity} Beds</span>
                      </div>

                      {/* Micro visual Bed icons */}
                      <div className="flex gap-1 mt-3">
                        {room.beds.map((b) => (
                          <div 
                            key={b.id} 
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[7px] font-extrabold ${
                              b.status === 'VACANT' 
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-600' 
                                : 'bg-red-50 border-red-300 text-red-650'
                            }`}
                          >
                            B
                          </div>
                        ))}
                      </div>
                    </button>
                  )
                })}

                {/* Common Area (Lounge) - Styled in Blue */}
                <div className="border border-blue-300 bg-blue-50/50 p-3 rounded-lg flex flex-col justify-between text-blue-700 aspect-[4/3]">
                  <span className="font-extrabold text-[10px] uppercase">Common Area</span>
                  <span className="text-[8px] font-bold mt-1">(Lounge)</span>
                </div>
              </div>

              {/* Central corridor block hallway */}
              <div className="bg-slate-100 border-y border-slate-300 py-2.5 text-center text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                Central Corridor
              </div>

              {/* Lower corridor row of rooms + facilities */}
              <div className="grid grid-cols-4 gap-3 items-stretch">
                {/* Washing room */}
                <div className="border border-purple-200 bg-purple-50/50 p-2.5 rounded-lg flex flex-col justify-between text-purple-700 aspect-[4/3]">
                  <span className="font-bold text-[8px] uppercase">Washing</span>
                  <span className="text-[8px] font-bold">Machine</span>
                </div>

                {roomsToDisplay.slice(3, 5).map((room) => {
                  const isSelected = activeRoomId === room.id
                  return (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoomId(room.id)}
                      className={`border rounded-lg p-3 flex flex-col justify-between aspect-[4/3] text-left cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-brand-primary ring-2 ring-indigo-50/50 bg-indigo-50/10' 
                          : 'border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-extrabold text-xs">RM {room.roomNumber}</span>
                        <span className="text-[8px] text-slate-400 font-bold">{room.capacity} Beds</span>
                      </div>

                      {/* Bed Status */}
                      <div className="flex gap-1 mt-3">
                        {room.beds.map((b) => (
                          <div 
                            key={b.id} 
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[7px] font-extrabold ${
                              b.status === 'VACANT' 
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-600' 
                                : 'bg-red-50 border-red-300 text-red-650'
                            }`}
                          >
                            B
                          </div>
                        ))}
                      </div>
                    </button>
                  )
                })}

                {/* Canteen & Sink - Styled in yellow/amber */}
                <div className="border border-amber-300 bg-amber-50/50 p-3 rounded-lg flex flex-col justify-between text-amber-700 aspect-[4/3]">
                  <span className="font-extrabold text-[9px] uppercase">Canteen</span>
                  <span className="text-[8px] font-bold">Kitchen Area</span>
                </div>
              </div>

            </div>
          </div>

          {/* Compass overlay */}
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2 pointer-events-none">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span>North Orientation</span>
          </div>
        </div>

        {/* COLUMN 3: Active Room Details & Floor summary (3 columns) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Active Room details */}
          {activeRoom && (
            <div className="bg-white border border-slate-205 rounded-xl p-5 shadow-premium-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">Room {activeRoom.roomNumber}</h3>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block">
                    {getSharingType(activeRoom.capacity)}
                  </span>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide">
                  Available
                </span>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              <div className="flex flex-col gap-2.5 text-xs font-semibold text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Beds</span>
                  <span>{activeRoom.capacity} Beds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Available Beds</span>
                  <span className="text-emerald-600 font-extrabold">
                    {activeRoom.beds.filter(b => b.status === 'VACANT').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rent / Bed</span>
                  <span className="text-slate-900 font-extrabold">₹{calculatePrice(activeRoom.capacity).toLocaleString('en-IN')}/mo</span>
                </div>
              </div>

              <button 
                onClick={() => setShow3DModal(true)}
                className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs py-2.5 rounded-xl shadow-premium transition-colors cursor-pointer text-center mt-2"
              >
                View Room Details
              </button>
            </div>
          )}

          {/* Floor Summary counters */}
          <div className="bg-white border border-slate-205 rounded-xl p-5 shadow-premium-sm flex flex-col gap-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-200 pb-1.5">
              Floor Summary
            </h4>
            <div className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
              <div className="flex justify-between">
                <span>Total Rooms</span>
                <span>8</span>
              </div>
              <div className="flex justify-between">
                <span>Total Beds</span>
                <span>22</span>
              </div>
              <div className="flex justify-between text-emerald-650">
                <span>Available Beds</span>
                <span>6</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Occupied Beds</span>
                <span>16</span>
              </div>
              <div className="flex justify-between text-purple-600">
                <span>Maintenance Beds</span>
                <span>0</span>
              </div>
            </div>
          </div>

          {/* Want to book this PG? */}
          <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl text-center">
            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
              Want to claim a bed? Secure your seat with a small booking amount.
            </p>
            <button 
              onClick={() => {
                const element = document.getElementById('rooms')
                if (element) element.scrollIntoView({ behavior: 'smooth' })
              }}
              className="text-[11px] font-bold text-brand-primary hover:underline mt-2 cursor-pointer"
            >
              Check Availability &gt;
            </button>
          </div>
        </div>

      </div>

      {/* BOTTOM ROW: Floor Facilities Checklist */}
      <div className="border-t border-slate-100 pt-6 mt-2 flex flex-col gap-4">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
          Floor Facilities
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs font-semibold text-slate-700">
          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-center">
            <p className="text-slate-800 font-extrabold">Washing Machine</p>
            <span className="text-[9px] text-slate-450 mt-0.5 block">1 Unit</span>
          </div>
          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-center">
            <p className="text-slate-800 font-extrabold">RO Drinking Water</p>
            <span className="text-[9px] text-slate-450 mt-0.5 block">1 Unit</span>
          </div>
          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-center">
            <p className="text-slate-800 font-extrabold">Canteen</p>
            <span className="text-[9px] text-slate-450 mt-0.5 block">Available</span>
          </div>
          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-center">
            <p className="text-slate-800 font-extrabold">Common Lounge</p>
            <span className="text-[9px] text-slate-450 mt-0.5 block">1 Unit</span>
          </div>
          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-center">
            <p className="text-slate-800 font-extrabold">High-Speed Wi-Fi</p>
            <span className="text-[9px] text-slate-450 mt-0.5 block">Available</span>
          </div>
          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-center">
            <p className="text-slate-800 font-extrabold">CCTV Security</p>
            <span className="text-[9px] text-slate-450 mt-0.5 block">24x7</span>
          </div>
          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-center">
            <p className="text-slate-800 font-extrabold">Lift / Elevator</p>
            <span className="text-[9px] text-slate-450 mt-0.5 block">1 Unit</span>
          </div>
          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-center">
            <p className="text-slate-800 font-extrabold">Fire Exit</p>
            <span className="text-[9px] text-slate-450 mt-0.5 block">Available</span>
          </div>
        </div>
      </div>

      {/* 3D viewer details modal popup */}
      {show3DModal && activeRoom && (
        <Room3DViewerModal
          room={activeRoom}
          priceFrom={priceFrom}
          onClose={() => setShow3DModal(false)}
        />
      )}
    </div>
  )
}
