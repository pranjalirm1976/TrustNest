'use client'

import { useState, useEffect } from 'react'
import BlueprintLegend from './BlueprintLegend'
import Room3DViewerModal from './Room3DViewerModal'
import { Compass, Eye, ShieldCheck } from 'lucide-react'
import Image from 'next/image'

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
  // Crop layout mappings from the cropped images grid matching Mockup 4
  const mockupFloors = [
    { id: 'terrace', name: 'Terrace Floor', level: 7, image: '/blueprint_terrace.jpg' },
    { id: 'floor6', name: '6th Floor', level: 6, image: '/blueprint_6.jpg' },
    { id: 'floor5', name: '5th Floor', level: 5, image: '/blueprint_5.jpg' },
    { id: 'floor4', name: '4th Floor', level: 4, image: '/blueprint_4.jpg' },
    { id: 'floor3', name: '3rd Floor', level: 3, image: '/blueprint_3.jpg' },
    { id: 'floor2', name: '2nd Floor', level: 2, image: '/blueprint_2.jpg' },
    { id: 'floor1', name: '1st Floor', level: 1, image: '/blueprint_1.jpg' },
    { id: 'ground', name: 'Ground Floor', level: 0, image: '/blueprint_ground.jpg' },
  ]

  const [activeFloorId, setActiveFloorId] = useState<string>('floor1')

  // Find active floor level properties
  const activeFloor = mockupFloors.find(f => f.id === activeFloorId) || mockupFloors[6]
  const activeLevel = activeFloor.level
  const floorImage = activeFloor.image

  // Dynamically calculate rooms for each level matching the cropped JPG layout structure
  const getRoomsForLevel = (level: number) => {
    if (level === 0) {
      // Ground Floor Layout
      return [
        {
          id: 'rm-reception',
          roomNumber: 'Reception',
          capacity: 0,
          hasWashroom: true,
          beds: [],
          amenities: [{ id: 'a1', name: 'Reception desk' }]
        },
        {
          id: 'rm-manager',
          roomNumber: 'Manager',
          capacity: 0,
          hasWashroom: true,
          beds: [],
          amenities: [{ id: 'a1', name: 'Manager Cabin' }]
        }
      ]
    }

    if (level === 7) {
      // Terrace Floor Layout
      return [
        {
          id: 'rm-canteen',
          roomNumber: 'Canteen',
          capacity: 0,
          hasWashroom: false,
          beds: [],
          amenities: [{ id: 'a1', name: 'Dining Tables' }]
        },
        {
          id: 'rm-kitchen',
          roomNumber: 'Kitchen',
          capacity: 0,
          hasWashroom: false,
          beds: [],
          amenities: [{ id: 'a1', name: 'Commercial Stove' }]
        }
      ]
    }

    // Floors 1 to 6 Layout
    const f = level
    const roomNumbers = [
      `${f}01`, `${f}02`, `${f}03`, `${f}04`,
      `${f}05`, `${f}06`, `${f}08`
    ]

    return roomNumbers.map((num, idx) => {
      // Alternate capacity and vacancy status for rich demo data
      const capacity = idx === 0 || idx === 3 ? 3 : 2
      const beds = []
      for (let b = 0; b < capacity; b++) {
        // प्रिया, अर्जुन, काव्या, रोहन stays mapping
        const isOccupied = (f === 1 && num === '101' && b === 2) || // Priya
                           (f === 1 && num === '101' && b === 1) || // Arjun
                           (f === 1 && num === '102' && b === 0) || // Kavya
                           (f === 1 && num === '102' && b === 1) || // Rohan
                           (idx % 2 === 0 && b === 0) ||
                           (idx % 3 === 1 && b === 1)

        beds.push({
          id: `bed-${num}-${b}`,
          identifier: String.fromCharCode(65 + b),
          status: isOccupied ? 'OCCUPIED' : 'VACANT'
        })
      }

      return {
        id: `rm-${num}`,
        roomNumber: num,
        capacity: capacity,
        hasWashroom: true,
        beds: beds,
        amenities: [{ id: 'a1', name: 'Study Table' }, { id: 'a2', name: 'Wardrobe' }]
      }
    })
  }

  const roomsToDisplay = getRoomsForLevel(activeLevel)
  const [activeRoomId, setActiveRoomId] = useState<string>('')
  const [show3DModal, setShow3DModal] = useState(false)

  // Automatically select first room on floor switch
  useEffect(() => {
    if (roomsToDisplay.length > 0) {
      setActiveRoomId(roomsToDisplay[0].id)
    }
  }, [activeFloorId, roomsToDisplay.length])

  // Get active room details
  const activeRoom = roomsToDisplay.find(r => r.id === activeRoomId) || roomsToDisplay[0]

  // Helper to determine sharing format name
  const getSharingType = (capacity: number) => {
    if (capacity === 0) return 'Facility Zone'
    if (capacity === 1) return 'Single Occupancy'
    if (capacity === 2) return 'Double Sharing'
    if (capacity === 3) return 'Triple Sharing'
    return `${capacity} Sharing`
  }

  // Calculate pricing based on capacity
  const calculatePrice = (capacity: number) => {
    if (capacity === 0) return 0
    if (capacity === 1) return priceFrom * 1.3
    if (capacity === 2) return priceFrom * 1.0
    return priceFrom * 0.85
  }

  // Get coordinate placements mapping (in percentage) to overlay see-through badges on JPG crop
  const getCoordinatesForRoom = (num: string, idx: number, level: number) => {
    if (level === 0) {
      if (num === 'Reception') return { top: '55%', left: '80%' }
      if (num === 'Manager') return { top: '25%', left: '80%' }
      return { top: '50%', left: '35%' }
    }
    if (level === 7) {
      if (num === 'Canteen') return { top: '55%', left: '25%' }
      if (num === 'Kitchen') return { top: '35%', left: '55%' }
      return { top: '50%', left: '80%' }
    }

    // Floors 1 to 6 Layout: 7 rooms total
    // Index 0 to 3 are top row: 101, 102, 103, 104
    // Index 4 to 6 are bottom row: 105, 106, 108
    if (idx < 4) {
      const leftPositions = ['16%', '29%', '43%', '58%']
      return { top: '24%', left: leftPositions[idx] }
    } else {
      const leftPositions = ['29%', '43%', '58%']
      return { top: '68%', left: leftPositions[idx - 4] }
    }
  }

  const activeFloorName = activeFloor.name

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
            <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto scrollbar-thin">
              {mockupFloors.map((floor) => (
                <button
                  key={floor.id}
                  onClick={() => setActiveFloorId(floor.id)}
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

        {/* COLUMN 2: Cropped Floor Plan Image Canvas with Glassmorphism Overlaid Hotspots (6 columns) */}
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
                onClick={() => alert('CLICKS: Tap on any semi-transparent glass room card on the layout to inspect detailed status.')}
                className="bg-white border border-slate-200 text-slate-500 hover:text-slate-800 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
              >
                How to read layout
              </button>
            </div>
          </div>

          {/* Blueprint Image Container with glass hotspot overlays */}
          <div className="relative overflow-x-auto scrollbar-thin py-2">
            <div className="min-w-[550px] relative aspect-[5/4.1] w-full rounded-xl overflow-hidden border border-slate-250 bg-white">
              
              {/* Cropped Architectural Blueprint Image */}
              <Image
                src={floorImage}
                alt={`${activeFloorName} Layout`}
                fill
                priority
                className="object-contain"
              />

              {/* Overlaid Interactive Room Hotspots styled as glassmorphic see-through overlays */}
              {roomsToDisplay.map((room, idx) => {
                const coord = getCoordinatesForRoom(room.roomNumber, idx, activeLevel)
                const isSelected = activeRoomId === room.id
                
                // Determine room availability state
                const vacantBeds = room.beds.filter(b => b.status === 'VACANT').length
                const totalBeds = room.beds.length

                return (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoomId(room.id)}
                    className="absolute z-20 transition-all duration-300 -translate-x-1/2 -translate-y-1/2 cursor-pointer focus:outline-none"
                    style={{ top: coord.top, left: coord.left }}
                  >
                    {/* Semi-transparent see-through card to maintain complete visibility of bed graphics underneath */}
                    <div className={`px-2 py-1 rounded-lg border flex flex-col items-center gap-0.5 shadow-premium-sm transition-all duration-200 ${
                      isSelected 
                        ? 'border-brand-primary bg-indigo-50/70 backdrop-blur-[1px] text-brand-primary scale-110' 
                        : 'border-slate-350 bg-white/20 hover:bg-white/40 backdrop-blur-[0.5px] text-slate-800'
                    }`}>
                      <span className="text-[8px] font-extrabold font-mono leading-none">
                        RM {room.roomNumber}
                      </span>
                      
                      {/* Bed availability status dot indicators */}
                      {totalBeds > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {room.beds.map((b) => (
                            <span 
                              key={b.id}
                              className={`w-1 h-1 rounded-full border-[0.5px] border-black/10 ${
                                b.status === 'VACANT' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}

              {/* Extra static display text for Common Room area on floor plans (1 to 6) */}
              {activeLevel >= 1 && activeLevel <= 6 && (
                <div 
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none px-2 py-1 rounded-lg border border-slate-300 bg-white/20 backdrop-blur-[0.5px] text-slate-600 text-[8px] font-bold"
                  style={{ top: '68%', left: '16%' }}
                >
                  Common Lounge
                </div>
              )}

            </div>
          </div>

          {/* Compass direction overlay */}
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 pointer-events-none">
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
                <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide ${
                  activeRoom.capacity === 0 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : activeRoom.beds.some(b => b.status === 'VACANT')
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-705'
                }`}>
                  {activeRoom.capacity === 0 ? 'FACILITY' : activeRoom.beds.some(b => b.status === 'VACANT') ? 'AVAILABLE' : 'FULL'}
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
                {activeRoom.capacity > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rent / Bed</span>
                    <span className="text-slate-900 font-extrabold">
                      ₹{calculatePrice(activeRoom.capacity).toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                )}
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
                <span>{activeLevel === 0 || activeLevel === 7 ? '0' : '22'}</span>
              </div>
              <div className="flex justify-between text-emerald-650">
                <span>Available Beds</span>
                <span>{activeLevel === 0 || activeLevel === 7 ? '0' : '6'}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Occupied Beds</span>
                <span>{activeLevel === 0 || activeLevel === 7 ? '0' : '16'}</span>
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
            <p className="text-slate-805 font-extrabold">Washing Machine</p>
            <span className="text-[9px] text-slate-450 mt-0.5 block">1 Unit</span>
          </div>
          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-center">
            <p className="text-slate-805 font-extrabold">RO Drinking Water</p>
            <span className="text-[9px] text-slate-450 mt-0.5 block">1 Unit</span>
          </div>
          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-center">
            <p className="text-slate-805 font-extrabold">Canteen</p>
            <span className="text-[9px] text-slate-450 mt-0.5 block">Available</span>
          </div>
          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-center">
            <p className="text-slate-805 font-extrabold">Common Lounge</p>
            <span className="text-[9px] text-slate-450 mt-0.5 block">1 Unit</span>
          </div>
          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-center">
            <p className="text-slate-805 font-extrabold">High-Speed Wi-Fi</p>
            <span className="text-[9px] text-slate-450 mt-0.5 block">Available</span>
          </div>
          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-center">
            <p className="text-slate-805 font-extrabold">CCTV Security</p>
            <span className="text-[9px] text-slate-450 mt-0.5 block">24x7</span>
          </div>
          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-center">
            <p className="text-slate-805 font-extrabold">Lift / Elevator</p>
            <span className="text-[9px] text-slate-450 mt-0.5 block">1 Unit</span>
          </div>
          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-center">
            <p className="text-slate-805 font-extrabold">Fire Exit</p>
            <span className="text-[9px] text-slate-450 mt-0.5 block">Available</span>
          </div>
        </div>
      </div>

      {/* 3D viewer details modal popup */}
      {show3DModal && activeRoom && activeRoom.capacity > 0 && (
        <Room3DViewerModal
          room={activeRoom}
          priceFrom={priceFrom}
          onClose={() => setShow3DModal(false)}
        />
      )}
    </div>
  )
}
