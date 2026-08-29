'use client'

import { updateBedStatus } from '@/actions/room.actions'
import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowLeft, 
  BedDouble, 
  User, 
  IndianRupee, 
  Image as ImageIcon,
  MoreVertical,
  Wifi,
  Wind,
  CheckCircle2,
  AlertCircle,
  Box,
  Sparkles
} from 'lucide-react'
import Room3DCaptureWizard from '@/components/admin/room-3d/Room3DCaptureWizard'

// --- Mock Data ---
type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE'
type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE' | null

interface Bed {
  id: string
  identifier: string // 'A', 'B', 'C'
  status: BedStatus
  residentName?: string
  paymentStatus?: PaymentStatus
}

interface RoomTemplate {
  id: string
  name: string
  sharing: number
  baseRent: number
  amenities: string[]
}

interface Room {
  id: string
  number: string
  templateId: string
  beds: Bed[]
}

const mockTemplates: RoomTemplate[] = [
  { id: 't1', name: '2 Sharing Deluxe', sharing: 2, baseRent: 12000, amenities: ['AC', 'Attached Washroom', 'Balcony'] },
  { id: 't2', name: '3 Sharing Standard', sharing: 3, baseRent: 8500, amenities: ['Non-AC', 'Common Washroom'] },
  { id: 't3', name: 'Single Premium', sharing: 1, baseRent: 18000, amenities: ['AC', 'Attached Washroom', 'TV', 'Mini Fridge'] }
]

const mockRooms: Room[] = [
  {
    id: 'r1', number: '101', templateId: 't2',
    beds: [
      { id: 'b1', identifier: 'A', status: 'OCCUPIED', residentName: 'Rahul Kumar', paymentStatus: 'PAID' },
      { id: 'b2', identifier: 'B', status: 'OCCUPIED', residentName: 'Amit Singh', paymentStatus: 'PENDING' },
      { id: 'b3', identifier: 'C', status: 'AVAILABLE' }
    ]
  },
  {
    id: 'r2', number: '102', templateId: 't2',
    beds: [
      { id: 'b4', identifier: 'A', status: 'AVAILABLE' },
      { id: 'b5', identifier: 'B', status: 'AVAILABLE' },
      { id: 'b6', identifier: 'C', status: 'RESERVED', residentName: 'Vikas (Joining soon)' }
    ]
  },
  {
    id: 'r3', number: '103', templateId: 't1',
    beds: [
      { id: 'b7', identifier: 'A', status: 'MAINTENANCE' },
      { id: 'b8', identifier: 'B', status: 'AVAILABLE' }
    ]
  },
  {
    id: 'r4', number: '201', templateId: 't3',
    beds: [
      { id: 'b9', identifier: 'A', status: 'OCCUPIED', residentName: 'Sanjay Gupta', paymentStatus: 'OVERDUE' }
    ]
  }
]

interface RoomsClientProps {
  initialRoomsData?: any[]
  propertyId?: string
}

export default function RoomsClient({ initialRoomsData, propertyId }: RoomsClientProps) {
  const roomsList = initialRoomsData && initialRoomsData.length > 0 ? initialRoomsData : mockRooms
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(roomsList[0]?.id || null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeBedDropdown, setActiveBedDropdown] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success'|'error' } | null>(null)
  const [show3DWizard, setShow3DWizard] = useState(false)

  // Handlers
  const handleUpdateStatus = async (bedId: string, newStatus: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE') => {
    setActiveBedDropdown(null)
    setIsUpdating(true)
    try {
      const res = await updateBedStatus(bedId, newStatus)
      if (res.success) {
        setToastMessage({ text: 'Bed status updated in database successfully!', type: 'success' })
        // Optimistically update mock UI so user sees the change
        const room = roomsList.find((r: any) => r.id === selectedRoomId)
        if (room) {
          const bed = room.beds.find((b: any) => b.id === bedId)
          if (bed) bed.status = newStatus
        }
      } else {
        setToastMessage({ text: res.error || 'Failed to update bed status.', type: 'error' })
      }
    } catch (err: any) {
      setToastMessage({ text: err.message || 'Error updating status.', type: 'error' })
    } finally {
      setIsUpdating(false)
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  const handleTemplateClick = (id: string) => {
    setSelectedTemplateId(prev => prev === id ? null : id)
  }

  const handleRoomSelect = (id: string) => {
    setSelectedRoomId(id)
  }

  const handleBackToList = () => {
    setSelectedRoomId(null)
  }

  // Filtered Rooms
  const filteredRooms = roomsList.filter(room => {
    const matchesSearch = room.number.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTemplate = selectedTemplateId ? room.templateId === selectedTemplateId : true
    return matchesSearch && matchesTemplate
  })

  const selectedRoom = roomsList.find(r => r.id === selectedRoomId) || roomsList[0]
  const selectedRoomTemplate = mockTemplates.find(t => t.id === selectedRoom?.templateId) || {
    id: 'custom',
    name: selectedRoom?.sharingType || `${selectedRoom?.capacity || 2} Sharing`,
    sharing: selectedRoom?.capacity || 2,
    baseRent: selectedRoom?.pricePerBed || 8500,
    amenities: ['Attached Washroom', 'High Speed Wi-Fi']
  }

  // Status Colors Mapping
  const statusColors: Record<BedStatus, string> = {
    AVAILABLE: 'border-l-emerald-500',
    OCCUPIED: 'border-l-red-500',
    RESERVED: 'border-l-amber-500',
    MAINTENANCE: 'border-l-purple-500'
  }

  const statusBadgeColors: Record<BedStatus, string> = {
    AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    OCCUPIED: 'bg-red-50 text-red-700 border-red-200',
    RESERVED: 'bg-amber-50 text-amber-700 border-amber-200',
    MAINTENANCE: 'bg-purple-50 text-purple-700 border-purple-200'
  }

  return (
    <div className="flex flex-col h-full gap-4 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 border ${
            toastMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <CheckCircle2 className={`w-5 h-5 ${toastMessage.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`} />
            <span className="text-sm font-bold">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* PG Availability Real-time Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-3.5 h-3.5 rounded-full ${
            roomsList.reduce((acc: number, r: any) => acc + r.beds.filter((b: any) => b.status === 'AVAILABLE').length, 0) === 0 ? 'bg-red-500 ring-4 ring-red-100' :
            (roomsList.reduce((acc: number, r: any) => acc + r.beds.filter((b: any) => b.status === 'OCCUPIED' || b.status === 'RESERVED').length, 0) / Math.max(1, roomsList.reduce((acc: number, r: any) => acc + r.beds.length, 0))) >= 0.75 ? 'bg-amber-500 ring-4 ring-amber-100' :
            'bg-emerald-500 ring-4 ring-emerald-100'
          }`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">PG Status:</span>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                roomsList.reduce((acc: number, r: any) => acc + r.beds.filter((b: any) => b.status === 'AVAILABLE').length, 0) === 0 ? 'bg-red-50 text-red-700 border border-red-200' :
                (roomsList.reduce((acc: number, r: any) => acc + r.beds.filter((b: any) => b.status === 'OCCUPIED' || b.status === 'RESERVED').length, 0) / Math.max(1, roomsList.reduce((acc: number, r: any) => acc + r.beds.length, 0))) >= 0.75 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {roomsList.reduce((acc: number, r: any) => acc + r.beds.filter((b: any) => b.status === 'AVAILABLE').length, 0) === 0 ? '🔴 Full' :
                 (roomsList.reduce((acc: number, r: any) => acc + r.beds.filter((b: any) => b.status === 'OCCUPIED' || b.status === 'RESERVED').length, 0) / Math.max(1, roomsList.reduce((acc: number, r: any) => acc + r.beds.length, 0))) >= 0.75 ? '🟡 Limited Availability' :
                 '🟢 Available'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-slate-400 font-medium">Total Beds:</span>
            <span className="font-bold text-slate-800 ml-1.5">{roomsList.reduce((acc: number, r: any) => acc + r.beds.length, 0)}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Occupied:</span>
            <span className="font-bold text-red-600 ml-1.5">{roomsList.reduce((acc: number, r: any) => acc + r.beds.filter((b: any) => b.status === 'OCCUPIED' || b.status === 'RESERVED').length, 0)}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Available:</span>
            <span className="font-bold text-emerald-600 ml-1.5">{roomsList.reduce((acc: number, r: any) => acc + r.beds.filter((b: any) => b.status === 'AVAILABLE').length, 0)}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Occupancy:</span>
            <span className="font-bold text-indigo-600 ml-1.5">
              {Math.round((roomsList.reduce((acc: number, r: any) => acc + r.beds.filter((b: any) => b.status === 'OCCUPIED' || b.status === 'RESERVED').length, 0) / Math.max(1, roomsList.reduce((acc: number, r: any) => acc + r.beds.length, 0))) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Template Manager Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shrink-0">
        <div className="flex-1 overflow-x-auto scrollbar-hide w-full sm:w-auto">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Templates</span>
            {mockTemplates.map(template => {
              const isSelected = selectedTemplateId === template.id
              return (
                <button
                  key={template.id}
                  onClick={() => handleTemplateClick(template.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                    isSelected 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {template.name}
                </button>
              )
            })}
          </div>
        </div>
        <button className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1.5 border border-indigo-200 hover:border-indigo-300 rounded-lg bg-indigo-50/50 transition-colors">
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex gap-6 min-h-0 relative">
        
        {/* Left Panel: Room List (Hidden on mobile if a room is selected) */}
        <div className={`w-full lg:w-80 flex-col gap-4 shrink-0 h-full ${selectedRoomId ? 'hidden lg:flex' : 'flex'}`}>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900">All Rooms</h2>
              <button className="text-indigo-600 p-1 hover:bg-indigo-50 rounded-md transition-colors" title="Add Room">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search room number..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
              {filteredRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <p className="text-sm font-medium text-slate-500">No rooms added. Create a template to begin.</p>
                </div>
              ) : (
                filteredRooms.map(room => {
                  const template = mockTemplates.find(t => t.id === room.templateId)
                  const isSelected = selectedRoomId === room.id
                  const availableBeds = room.beds.filter((b: any) => b.status === 'AVAILABLE').length

                  return (
                    <button
                      key={room.id}
                      onClick={() => handleRoomSelect(room.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">Room {room.number}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          availableBeds > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {availableBeds > 0 ? `${availableBeds} Available` : 'Full'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">{template?.name}</p>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Room Details */}
        <div className={`flex-1 flex-col h-full min-w-0 ${selectedRoomId ? 'flex' : 'hidden lg:flex'}`}>
          {selectedRoom && selectedRoomTemplate ? (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
              
              {/* Detail Header */}
              <div className="border-b border-slate-100 p-4 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50/50">
                <div>
                  <button 
                    onClick={handleBackToList}
                    className="lg:hidden mb-4 text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back to List
                  </button>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-extrabold text-slate-900">Room {selectedRoom.number}</h2>
                    <span className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg uppercase tracking-wide">
                      {selectedRoomTemplate.name}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5"><BedDouble className="w-4 h-4 text-slate-400" /> {selectedRoomTemplate.sharing} Sharing</span>
                    <span className="flex items-center gap-1.5"><IndianRupee className="w-4 h-4 text-slate-400" /> ₹{selectedRoomTemplate.baseRent}/bed</span>
                    <span className="flex items-center gap-1.5"><Wind className="w-4 h-4 text-slate-400" /> {selectedRoomTemplate.amenities.join(' • ')}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 shrink-0">
                  <button 
                    onClick={() => setShow3DWizard(true)}
                    className="text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-3.5 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Box className="w-4 h-4 text-indigo-600" />
                    <span>3D Capture Studio</span>
                  </button>
                  <button className="text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Images</span>
                  </button>
                  <button className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                    Set Rent
                  </button>
                </div>
              </div>

              {/* Bed Grid Container */}
              <div className="p-4 sm:p-6 flex-1 overflow-y-auto bg-slate-50 custom-scrollbar">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Bed Assignments</h3>
                  <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 border border-indigo-200 bg-indigo-50 px-2 py-1.5 rounded-md transition-colors">
                    <Plus className="w-3 h-3" /> Add Bed
                  </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {selectedRoom.beds.map((bed: any) => (
                    <div 
                      key={bed.id} 
                      className={`bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between border-l-4 ${statusColors[bed.status as BedStatus] || 'border-l-slate-400'}`}
                    >
                      <div className="flex justify-between items-start mb-4 relative">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center font-bold text-lg">
                            {bed.identifier}
                          </div>
                          <div>
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${statusBadgeColors[bed.status as BedStatus] || 'bg-slate-50 text-slate-700'}`}>
                              {bed.status}
                            </span>
                          </div>
                        </div>

                        {/* Contextual Dropdown Toggle */}
                        <button 
                          onClick={() => setActiveBedDropdown(activeBedDropdown === bed.id ? null : bed.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeBedDropdown === bed.id && (
                          <div className="absolute right-0 top-8 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 animate-in fade-in zoom-in-95 duration-100">
                            {bed.status === 'AVAILABLE' && (
                              <button onClick={() => handleUpdateStatus(bed.id, 'OCCUPIED')} disabled={isUpdating} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Mark as Occupied</button>
                            )}
                            {bed.status === 'OCCUPIED' && (
                              <button onClick={() => handleUpdateStatus(bed.id, 'AVAILABLE')} disabled={isUpdating} className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50">Evict / Make Available</button>
                            )}
                            {bed.status !== 'MAINTENANCE' && (
                              <button onClick={() => handleUpdateStatus(bed.id, 'MAINTENANCE')} disabled={isUpdating} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Set Maintenance</button>
                            )}
                            {bed.status === 'MAINTENANCE' && (
                              <button onClick={() => handleUpdateStatus(bed.id, 'AVAILABLE')} disabled={isUpdating} className="w-full text-left px-4 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50">Mark Available</button>
                            )}
                          </div>
                        )}
                      </div>

                      {bed.status === 'OCCUPIED' && bed.residentName ? (
                        <div className="flex items-end justify-between mt-auto">
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-0.5">Resident</p>
                            <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                              <User className="w-4 h-4 text-slate-400" /> {bed.residentName}
                            </p>
                          </div>
                          <div>
                            {bed.paymentStatus === 'PAID' ? (
                              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                                <CheckCircle2 className="w-3.5 h-3.5" /> PAID
                              </div>
                            ) : bed.paymentStatus === 'PENDING' ? (
                              <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                                <AlertCircle className="w-3.5 h-3.5" /> PENDING
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-xs font-bold text-red-600">
                                <AlertCircle className="w-3.5 h-3.5" /> OVERDUE
                              </div>
                            )}
                          </div>
                        </div>
                      ) : bed.status === 'RESERVED' ? (
                        <div className="mt-auto">
                          <p className="text-xs font-medium text-slate-500 mb-0.5">Reserved For</p>
                          <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <User className="w-4 h-4 text-slate-400" /> {bed.residentName}
                          </p>
                        </div>
                      ) : bed.status === 'AVAILABLE' ? (
                        <div className="mt-auto flex justify-end">
                          <button className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors">
                            Assign Resident
                          </button>
                        </div>
                      ) : (
                        <div className="mt-auto">
                          <p className="text-xs font-medium text-purple-600">Currently under maintenance.</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <BedDouble className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Room Selected</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">Select a room from the list to view bed assignments, update status, and manage residents.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3D Room View Capture Studio Modal */}
      {show3DWizard && selectedRoom && (
        <Room3DCaptureWizard
          room={{
            id: selectedRoom.id,
            roomNumber: selectedRoom.number,
            sharingType: selectedRoomTemplate?.name || 'Double Sharing',
            capacity: selectedRoom.beds.length,
            hasWashroom: true
          }}
          allRooms={roomsList.map((r: any) => ({
            id: r.id,
            roomNumber: r.number,
            capacity: r.beds.length,
            sharingType: 'Sharing'
          }))}
          onClose={() => setShow3DWizard(false)}
          onSuccess={() => {
            setToastMessage({ text: '3D Room Model submitted for Super Admin review!', type: 'success' })
          }}
        />
      )}

    </div>
  )
}
