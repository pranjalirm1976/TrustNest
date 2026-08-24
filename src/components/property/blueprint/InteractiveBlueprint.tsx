'use client'

import { useState, useEffect } from 'react'
import BlueprintLegend from './BlueprintLegend'
import Room3DViewerModal from './Room3DViewerModal'
import { Eye, CheckCircle, AlertCircle, Bed, User, Wind, ShieldCheck, MapPin, IndianRupee } from 'lucide-react'
import Image from 'next/image'

type BedType = {
  id: string
  identifier: string
  status: string
}

type RoomAmenity = {
  id?: string
  name: string
}

type Room = {
  id: string
  roomNumber: string
  capacity: number
  hasWashroom?: boolean
  hasAc?: boolean
  hasBalcony?: boolean
  pricePerBed?: number | null
  beds: BedType[]
  amenities?: RoomAmenity[]
}

type FloorFacility = {
  id?: string
  name: string
}

type Floor = {
  id: string
  name: string
  level: number
  layoutUrl?: string | null
  rooms: Room[]
  facilities?: FloorFacility[]
}

interface InteractiveBlueprintProps {
  floors?: Floor[]
  priceFrom: number
}

export default function InteractiveBlueprint({ floors = [], priceFrom }: InteractiveBlueprintProps) {
  // If property has database floors, use them; otherwise provide standard blueprint floors
  const defaultFloors: Floor[] = [
    {
      id: 'terrace',
      name: 'Terrace Floor',
      level: 7,
      layoutUrl: '/blueprint_terrace.jpg',
      facilities: [{ name: 'Canteen' }, { name: 'Kitchen' }],
      rooms: [
        { id: 'rm-canteen', roomNumber: 'Canteen', capacity: 0, hasWashroom: false, beds: [], amenities: [{ name: 'Dining Hall' }] },
        { id: 'rm-kitchen', roomNumber: 'Kitchen', capacity: 0, hasWashroom: false, beds: [], amenities: [{ name: 'Commercial Stove' }] },
      ]
    },
    {
      id: 'floor2',
      name: '2nd Floor',
      level: 2,
      layoutUrl: '/blueprint_2.jpg',
      facilities: [{ name: 'Rooms' }, { name: 'Washrooms' }, { name: 'Balcony' }],
      rooms: [
        { id: 'rm-201', roomNumber: '201', capacity: 2, hasWashroom: true, hasAc: true, pricePerBed: priceFrom, beds: [{ id: 'b-201-a', identifier: 'A', status: 'VACANT' }, { id: 'b-201-b', identifier: 'B', status: 'VACANT' }] },
        { id: 'rm-202', roomNumber: '202', capacity: 3, hasWashroom: true, hasAc: false, pricePerBed: priceFrom * 0.85, beds: [{ id: 'b-202-a', identifier: 'A', status: 'OCCUPIED' }, { id: 'b-202-b', identifier: 'B', status: 'VACANT' }, { id: 'b-202-c', identifier: 'C', status: 'VACANT' }] },
      ]
    },
    {
      id: 'floor1',
      name: '1st Floor',
      level: 1,
      layoutUrl: '/blueprint_1.jpg',
      facilities: [{ name: 'Rooms' }, { name: 'Washrooms' }, { name: 'Balcony' }],
      rooms: [
        { id: 'rm-101', roomNumber: '101', capacity: 2, hasWashroom: true, hasAc: true, pricePerBed: priceFrom, beds: [{ id: 'b-101-a', identifier: 'A', status: 'OCCUPIED' }, { id: 'b-101-b', identifier: 'B', status: 'VACANT' }] },
        { id: 'rm-102', roomNumber: '102', capacity: 3, hasWashroom: true, hasAc: true, pricePerBed: priceFrom * 0.85, beds: [{ id: 'b-102-a', identifier: 'A', status: 'OCCUPIED' }, { id: 'b-102-b', identifier: 'B', status: 'OCCUPIED' }, { id: 'b-102-c', identifier: 'C', status: 'VACANT' }] },
        { id: 'rm-103', roomNumber: '103', capacity: 2, hasWashroom: true, hasAc: false, pricePerBed: priceFrom, beds: [{ id: 'b-103-a', identifier: 'A', status: 'VACANT' }, { id: 'b-103-b', identifier: 'B', status: 'VACANT' }] },
      ]
    },
    {
      id: 'ground',
      name: 'Ground Floor',
      level: 0,
      layoutUrl: '/blueprint_ground.jpg',
      facilities: [{ name: 'Reception' }, { name: 'Manager Cabin' }, { name: 'Parking' }],
      rooms: [
        { id: 'rm-reception', roomNumber: 'Reception', capacity: 0, hasWashroom: true, beds: [] },
        { id: 'rm-manager', roomNumber: 'Manager', capacity: 0, hasWashroom: true, beds: [] }
      ]
    }
  ]

  const activeFloorsList = floors && floors.length > 0 ? floors : defaultFloors

  const [activeFloorId, setActiveFloorId] = useState<string>(activeFloorsList[0]?.id || 'floor1')
  const [activeRoomId, setActiveRoomId] = useState<string>('')
  const [show3DModal, setShow3DModal] = useState(false)

  // Ensure active floor exists
  const activeFloor = activeFloorsList.find(f => f.id === activeFloorId) || activeFloorsList[0]
  
  // Floor layout image url
  const floorImageUrl = activeFloor?.layoutUrl || 
    (activeFloor?.level === 0 ? '/blueprint_ground.jpg' : 
     activeFloor?.level === 7 ? '/blueprint_terrace.jpg' : 
     `/blueprint_${Math.min(activeFloor?.level || 1, 6)}.jpg`)

  // Rooms for active floor
  const activeRooms = activeFloor?.rooms || []

  // Auto-select first room when switching floor
  useEffect(() => {
    if (activeRooms.length > 0) {
      setActiveRoomId(activeRooms[0].id)
    } else {
      setActiveRoomId('')
    }
  }, [activeFloorId, activeRooms])

  const activeRoom = activeRooms.find(r => r.id === activeRoomId) || activeRooms[0]

  // Floor stats
  const totalFloorRooms = activeRooms.filter(r => r.capacity > 0).length
  const totalFloorBeds = activeRooms.reduce((acc, r) => acc + r.beds.length, 0)
  const availableFloorBeds = activeRooms.reduce((acc, r) => acc + r.beds.filter(b => b.status === 'VACANT').length, 0)
  const availableFloorRooms = activeRooms.filter(r => r.capacity > 0 && r.beds.some(b => b.status === 'VACANT')).length

  const getSharingName = (capacity: number) => {
    if (capacity === 0) return 'Common / Facility Zone'
    if (capacity === 1) return 'Single Occupancy'
    if (capacity === 2) return 'Double Sharing'
    if (capacity === 3) return 'Triple Sharing'
    return `${capacity} Sharing`
  }

  const roomPrice = activeRoom?.pricePerBed || (
    activeRoom?.capacity === 1 ? priceFrom * 1.3 :
    activeRoom?.capacity === 2 ? priceFrom :
    priceFrom * 0.85
  )

  return (
    <div id="layout" className="bg-white border border-slate-200 p-6 rounded-3xl shadow-premium flex flex-col gap-6 w-full mt-4">
      
      {/* Blueprint Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">PG Layout &amp; Real-time Availability</h2>
        <p className="text-xs text-slate-500">Floor-wise architectural layout, room blueprints, and live bed occupancy.</p>
      </div>

      {/* Main Grid: Floor Selector, Layout Canvas, Room Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMN 1: Select Floor (3 columns) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-premium-sm flex flex-col gap-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 pb-1.5">
              Select Floor
            </h4>
            <div className="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto scrollbar-thin">
              {activeFloorsList.map((floor) => (
                <button
                  key={floor.id}
                  onClick={() => setActiveFloorId(floor.id)}
                  className={`text-xs font-bold text-left px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                    activeFloorId === floor.id
                      ? 'bg-brand-primary text-white shadow-premium'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{floor.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    activeFloorId === floor.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    Lvl {floor.level}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <BlueprintLegend />
        </div>

        {/* COLUMN 2: Architectural Layout Canvas (6 columns) */}
        <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden">
          
          {/* Header Info details */}
          <div className="flex justify-between items-center z-10 border-b border-slate-200 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase font-mono">{activeFloor?.name}</h3>
              <div className="flex gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                <span>Rooms: {totalFloorRooms}</span>
                <span>•</span>
                <span className="text-emerald-700">Available Beds: {availableFloorBeds}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setShow3DModal(true)}
                className="bg-white border border-brand-primary hover:bg-indigo-50 text-brand-primary font-bold text-[10px] uppercase tracking-wide px-3 py-1.5 rounded-lg shadow-premium-sm transition-all cursor-pointer flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>3D View</span>
              </button>
            </div>
          </div>

          {/* Blueprint Layout Canvas */}
          <div className="relative aspect-[5/4] w-full rounded-xl overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
            {floorImageUrl ? (
              <Image
                src={floorImageUrl}
                alt={`${activeFloor?.name} Architectural Layout`}
                fill
                priority
                className="object-contain"
                unoptimized={floorImageUrl.startsWith('/uploads/')}
              />
            ) : (
              <div className="text-center p-8 text-slate-400">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">Architectural blueprint will be displayed here.</p>
              </div>
            )}
          </div>

          {/* Rooms interactive list under layout */}
          {activeRooms.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rooms on this Floor</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {activeRooms.map((room) => {
                  const isSelected = activeRoomId === room.id
                  const vacantCount = room.beds.filter(b => b.status === 'VACANT').length
                  const isFull = room.capacity > 0 && vacantCount === 0

                  return (
                    <button
                      key={room.id}
                      onClick={() => setActiveRoomId(room.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-200 font-bold shadow-sm' 
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold">Room {room.roomNumber}</span>
                        <span className={`w-2 h-2 rounded-full ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {room.capacity === 0 ? 'Common' : `${vacantCount}/${room.capacity} beds free`}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* COLUMN 3: Active Room Inspector & Bed Vacancy (3 columns) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {activeRoom ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-premium-sm flex flex-col gap-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Selected Room</span>
                  <h3 className="text-lg font-extrabold text-slate-900">Room {activeRoom.roomNumber}</h3>
                  <p className="text-xs text-indigo-600 font-bold mt-0.5">{getSharingName(activeRoom.capacity)}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rent</span>
                  <p className="text-base font-extrabold text-slate-900">
                    ₹{roomPrice.toLocaleString('en-IN')}
                    <span className="text-[10px] font-normal text-slate-400 font-mono">/mo</span>
                  </p>
                </div>
              </div>

              {/* Room Features */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{activeRoom.hasWashroom ? 'Attached Private Washroom' : 'Common Washroom'}</span>
                </div>
                {activeRoom.hasAc && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Air Conditioned (AC)</span>
                  </div>
                )}
                {activeRoom.hasBalcony && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Private Balcony</span>
                  </div>
                )}
              </div>

              {/* Beds Availability */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Bed Allocation Status</h4>
                
                {activeRoom.beds && activeRoom.beds.length > 0 ? (
                  <div className="space-y-1.5">
                    {activeRoom.beds.map((bed) => {
                      const isVacant = bed.status === 'VACANT'
                      return (
                        <div 
                          key={bed.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold ${
                            isVacant 
                              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' 
                              : 'bg-red-50/60 border-red-200 text-red-900'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Bed className="w-3.5 h-3.5" />
                            <span>Bed {bed.identifier}</span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isVacant ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {isVacant ? 'Available' : 'Occupied'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Facility zone / No individual beds.</p>
                )}
              </div>

              <a
                href="#book"
                className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs py-2.5 rounded-xl shadow-premium text-center transition-all mt-2"
              >
                Book This Room
              </a>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-xs shadow-premium-sm">
              Select a room to view bed allocation and amenities.
            </div>
          )}
        </div>

      </div>

      {/* 3D Room Viewer Modal */}
      {show3DModal && activeRoom && (
        <Room3DViewerModal
          room={{
            id: activeRoom.id,
            roomNumber: activeRoom.roomNumber,
            capacity: activeRoom.capacity,
            hasWashroom: activeRoom.hasWashroom ?? true,
            beds: activeRoom.beds || []
          }}
          onClose={() => setShow3DModal(false)}
          priceFrom={priceFrom}
        />
      )}

    </div>
  )
}
