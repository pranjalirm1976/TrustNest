'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { registerProperty } from '@/actions/property.actions'
import { 
  Check, 
  MapPin, 
  UploadCloud, 
  FileText, 
  Building2, 
  Users, 
  User, 
  Loader2, 
  AlertCircle, 
  Navigation, 
  Compass, 
  Crosshair, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  X, 
  Plus, 
  Layers, 
  Bed, 
  Sparkles, 
  ArrowRight,
  ChevronRight,
  CheckCircle,
  IndianRupee,
  Box,
  Camera,
  Video,
  ShieldCheck,
  Percent,
  CheckSquare,
  Square
} from 'lucide-react'
import Room3DCaptureWizard from '@/components/admin/room-3d/Room3DCaptureWizard'

const steps = [
  { id: 1, name: 'Basic Info' },
  { id: 2, name: 'Location' },
  { id: 3, name: 'Amenities' },
  { id: 4, name: 'Photos' },
  { id: 5, name: 'Floor Layouts' },
  { id: 6, name: 'Rooms & Beds' },
  { id: 7, name: 'TrustNest Inventory' },
  { id: 8, name: 'Review & Submit' }
]

const pgTypes = [
  { id: 'boys', label: 'Boys Only', icon: User },
  { id: 'girls', label: 'Girls Only', icon: User },
  { id: 'coed', label: 'Co-ed / Unisex', icon: Users }
]

const amenitiesList = [
  'AC', 'Non-AC', 'High-Speed Wi-Fi', 'Three Meals Included', 'Laundry & Washing', 
  'Dedicated Parking', 'Elevator / Lift', '24/7 Security & CCTV', 'Lounge / Common Room', 
  'Daily Housekeeping', 'Power Backup', 'RO Water Purifier', 'Gym Access'
]

interface FloorConfig {
  id: string
  level: number
  name: string
  layoutFile?: File | null
  layoutPreviewUrl?: string | null
  facilities: string[]
}

interface BedConfig {
  identifier: string
  status: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE'
  isTrustNestInventory: boolean
}

interface RoomConfig {
  id: string
  floorLevel: number
  roomNumber: string
  capacity: number
  sharingType: string
  hasWashroom: boolean
  hasAc: boolean
  hasBalcony: boolean
  pricePerBed: number
  beds: BedConfig[]
}

export default function PGRegistrationClient() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [mapQueryOverride, setMapQueryOverride] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'coed',
    priceFrom: 8500,
    description: '',
    address: '',
    city: 'Pune',
    area: 'Hinjawadi Phase 1',
    pincode: '411057',
    latitude: 18.5913,
    longitude: 73.7389,
    amenities: ['High-Speed Wi-Fi', 'AC', 'Three Meals Included', '24/7 Security & CCTV', 'Daily Housekeeping'] as string[]
  })

  // Uploaded Photos State
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, { file: File, previewUrl: string, name: string }>>({})

  // Floors State
  const [floors, setFloors] = useState<FloorConfig[]>([
    { id: 'fl-0', level: 0, name: 'Ground Floor', facilities: ['Parking', 'Reception', 'Lobby'], layoutFile: null, layoutPreviewUrl: null },
    { id: 'fl-1', level: 1, name: '1st Floor', facilities: ['Rooms', 'Washrooms', 'Balcony'], layoutFile: null, layoutPreviewUrl: null },
    { id: 'fl-2', level: 2, name: '2nd Floor', facilities: ['Rooms', 'Washrooms', 'Balcony'], layoutFile: null, layoutPreviewUrl: null },
  ])

  // Rooms State with explicit isTrustNestInventory allocation
  const [rooms, setRooms] = useState<RoomConfig[]>([
    {
      id: 'rm-101',
      floorLevel: 1,
      roomNumber: '101',
      capacity: 2,
      sharingType: 'DOUBLE',
      hasWashroom: true,
      hasAc: true,
      hasBalcony: false,
      pricePerBed: 9000,
      beds: [
        { identifier: 'A', status: 'VACANT', isTrustNestInventory: true },
        { identifier: 'B', status: 'VACANT', isTrustNestInventory: true }
      ]
    },
    {
      id: 'rm-102',
      floorLevel: 1,
      roomNumber: '102',
      capacity: 3,
      sharingType: 'TRIPLE',
      hasWashroom: true,
      hasAc: true,
      hasBalcony: true,
      pricePerBed: 7500,
      beds: [
        { identifier: 'A', status: 'OCCUPIED', isTrustNestInventory: true },
        { identifier: 'B', status: 'VACANT', isTrustNestInventory: true },
        { identifier: 'C', status: 'VACANT', isTrustNestInventory: false }
      ]
    },
    {
      id: 'rm-201',
      floorLevel: 2,
      roomNumber: '201',
      capacity: 2,
      sharingType: 'DOUBLE',
      hasWashroom: true,
      hasAc: false,
      hasBalcony: true,
      pricePerBed: 8500,
      beds: [
        { identifier: 'A', status: 'VACANT', isTrustNestInventory: true },
        { identifier: 'B', status: 'VACANT', isTrustNestInventory: false }
      ]
    }
  ])

  const [active3DRoom, setActive3DRoom] = useState<any | null>(null)
  const [configured3DRooms, setConfigured3DRooms] = useState<Record<string, boolean>>({})
  const [isDraftRestored, setIsDraftRestored] = useState(false)

  // 1. Auto-restore form draft on page refresh
  useEffect(() => {
    try {
      const saved = localStorage.getItem('trustnest_pg_registration_draft')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.formData) {
          setFormData(prev => ({ ...prev, ...parsed.formData }))
        }
        if (parsed.floors && Array.isArray(parsed.floors) && parsed.floors.length > 0) {
          setFloors(parsed.floors)
        }
        if (parsed.rooms && Array.isArray(parsed.rooms) && parsed.rooms.length > 0) {
          setRooms(parsed.rooms)
        }
        if (parsed.currentStep && typeof parsed.currentStep === 'number') {
          setCurrentStep(parsed.currentStep)
        }
      }
    } catch (e) {
      console.warn('Could not restore draft:', e)
    } finally {
      setIsDraftRestored(true)
    }
  }, [])

  // 2. Auto-save form draft whenever information is modified
  useEffect(() => {
    if (!isDraftRestored) return
    try {
      const draftPayload = {
        formData,
        floors: floors.map(f => ({
          id: f.id,
          level: f.level,
          name: f.name,
          facilities: f.facilities,
          layoutPreviewUrl: f.layoutPreviewUrl || null
        })),
        rooms,
        currentStep
      }
      localStorage.setItem('trustnest_pg_registration_draft', JSON.stringify(draftPayload))
    } catch (e) {
      // Ignore quota exceeded
    }
  }, [formData, floors, rooms, currentStep, isDraftRestored])

  // Helper to clear draft
  const handleClearDraft = () => {
    if (confirm('Are you sure you want to reset all filled information?')) {
      try {
        localStorage.removeItem('trustnest_pg_registration_draft')
      } catch (_) {}
      window.location.reload()
    }
  }

  // Photo handlers
  const handlePhotoUpload = (key: string, file: File) => {
    const previewUrl = URL.createObjectURL(file)
    setUploadedPhotos(prev => ({
      ...prev,
      [key]: { file, previewUrl, name: file.name }
    }))
  }

  const handlePhotoRemove = (key: string) => {
    setUploadedPhotos(prev => {
      const updated = { ...prev }
      if (updated[key]?.previewUrl) URL.revokeObjectURL(updated[key].previewUrl)
      delete updated[key]
      return updated
    })
  }

  // Floor handlers
  const addFloor = () => {
    const nextLevel = floors.length === 0 ? 0 : Math.max(...floors.map(f => f.level)) + 1
    const name = nextLevel === 0 ? 'Ground Floor' : `${nextLevel}th Floor`
    setFloors(prev => [
      ...prev,
      { id: `fl-${Date.now()}`, level: nextLevel, name, facilities: ['Rooms', 'Bathrooms'], layoutFile: null, layoutPreviewUrl: null }
    ])
  }

  const removeFloor = (id: string) => {
    setFloors(prev => prev.filter(f => f.id !== id))
  }

  const handleFloorLayoutUpload = (floorId: string, file: File) => {
    const previewUrl = URL.createObjectURL(file)
    setFloors(prev => prev.map(f => f.id === floorId ? { ...f, layoutFile: file, layoutPreviewUrl: previewUrl } : f))
  }

  // Room handlers
  const addRoom = (floorLevel: number) => {
    const floorRooms = rooms.filter(r => r.floorLevel === floorLevel)
    const nextNum = `${floorLevel}${String(floorRooms.length + 1).padStart(2, '0')}`
    setRooms(prev => [
      ...prev,
      {
        id: `rm-${Date.now()}`,
        floorLevel,
        roomNumber: nextNum,
        capacity: 2,
        sharingType: 'DOUBLE',
        hasWashroom: true,
        hasAc: true,
        hasBalcony: false,
        pricePerBed: formData.priceFrom,
        beds: [
          { identifier: 'A', status: 'VACANT', isTrustNestInventory: true },
          { identifier: 'B', status: 'VACANT', isTrustNestInventory: true }
        ]
      }
    ])
  }

  const removeRoom = (id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id))
  }

  const updateRoomBeds = (roomId: string, capacity: number) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const beds: BedConfig[] = Array.from({ length: capacity }, (_, i) => ({
          identifier: String.fromCharCode(65 + i),
          status: 'VACANT' as const,
          isTrustNestInventory: true
        }))
        const sharingType = capacity === 1 ? 'SINGLE' : capacity === 2 ? 'DOUBLE' : capacity === 3 ? 'TRIPLE' : 'FOUR'
        return { ...r, capacity, sharingType, beds }
      }
      return r
    }))
  }

  const toggleBedStatus = (roomId: string, bedIdx: number) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const updatedBeds = [...r.beds]
        const current = updatedBeds[bedIdx].status
        updatedBeds[bedIdx].status = current === 'VACANT' ? 'OCCUPIED' : current === 'OCCUPIED' ? 'MAINTENANCE' : 'VACANT'
        return { ...r, beds: updatedBeds }
      }
      return r
    }))
  }

  // INVENTORY ALLOCATION HANDLERS
  const toggleBedInventory = (roomId: string, bedIdx: number) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const updatedBeds = [...r.beds]
        const current = updatedBeds[bedIdx].isTrustNestInventory !== false
        updatedBeds[bedIdx].isTrustNestInventory = !current
        return { ...r, beds: updatedBeds }
      }
      return r
    }))
  }

  const setRoomInventory = (roomId: string, isTrustNest: boolean) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const updatedBeds = r.beds.map(b => ({ ...b, isTrustNestInventory: isTrustNest }))
        return { ...r, beds: updatedBeds }
      }
      return r
    }))
  }

  const setFloorInventory = (floorLevel: number, isTrustNest: boolean) => {
    setRooms(prev => prev.map(r => {
      if (r.floorLevel === floorLevel) {
        const updatedBeds = r.beds.map(b => ({ ...b, isTrustNestInventory: isTrustNest }))
        return { ...r, beds: updatedBeds }
      }
      return r
    }))
  }

  const setAllInventory = (isTrustNest: boolean) => {
    setRooms(prev => prev.map(r => ({
      ...r,
      beds: r.beds.map(b => ({ ...b, isTrustNestInventory: isTrustNest }))
    })))
  }

  // Amenities toggle
  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  // Calculated Metrics
  const totalBeds = rooms.reduce((acc, r) => acc + r.beds.length, 0)
  const trustNestBeds = rooms.reduce((acc, r) => acc + r.beds.filter(b => b.isTrustNestInventory !== false).length, 0)
  const ownerManagedBeds = totalBeds - trustNestBeds
  const allocationPercent = totalBeds > 0 ? Math.round((trustNestBeds / totalBeds) * 100) : 0
  const vacantBeds = rooms.reduce((acc, r) => acc + r.beds.filter(b => b.status === 'VACANT' && b.isTrustNestInventory !== false).length, 0)

  // Step Validation & Navigation
  const handleNext = () => {
    const newErrors: Record<string, string> = {}
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'PG Name is required'
      if (!formData.priceFrom || formData.priceFrom <= 0) newErrors.priceFrom = 'Please enter a valid base rent'
    } else if (currentStep === 2) {
      if (!formData.address.trim()) newErrors.address = 'Full address is required'
      if (!formData.city.trim()) newErrors.city = 'City is required'
    } else if (currentStep === 6) {
      if (rooms.length === 0) newErrors.rooms = 'At least one room is required'
      if (totalBeds === 0) newErrors.rooms = 'At least one bed is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    } else {
      submitForm()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      setErrors({})
    }
  }

  // Submission
  const submitForm = async () => {
    setIsSubmitting(true)
    try {
      const data = new FormData()
      data.append('name', formData.name)
      data.append('type', formData.type)
      data.append('description', formData.description)
      data.append('address', formData.address)
      data.append('city', formData.city)
      data.append('area', formData.area)
      data.append('pincode', formData.pincode)
      data.append('latitude', formData.latitude.toString())
      data.append('longitude', formData.longitude.toString())
      data.append('priceFrom', formData.priceFrom.toString())
      data.append('amenities', JSON.stringify(formData.amenities))

      // Photos
      if (uploadedPhotos['exterior']?.file) data.append('photo_exterior', uploadedPhotos['exterior'].file)
      if (uploadedPhotos['entrance']?.file) data.append('photo_entrance', uploadedPhotos['entrance'].file)
      if (uploadedPhotos['common']?.file) data.append('photo_common', uploadedPhotos['common'].file)
      if (uploadedPhotos['rooms']?.file) data.append('photo_rooms', uploadedPhotos['rooms'].file)
      if (uploadedPhotos['dining']?.file) data.append('photo_dining', uploadedPhotos['dining'].file)
      if (uploadedPhotos['facilities']?.file) data.append('photo_facilities', uploadedPhotos['facilities'].file)

      // Floors & Layout files
      const floorsPayload = floors.map(f => ({
        level: f.level,
        name: f.name,
        facilities: f.facilities
      }))
      data.append('floors', JSON.stringify(floorsPayload))

      floors.forEach(f => {
        if (f.layoutFile) {
          data.append(`floor_layout_${f.level}`, f.layoutFile)
        }
      })

      // Rooms & Beds with exact inventory allocation
      const roomsPayload = rooms.map(r => ({
        floorLevel: r.floorLevel,
        roomNumber: r.roomNumber,
        capacity: r.capacity,
        sharingType: r.sharingType,
        hasWashroom: r.hasWashroom,
        hasAc: r.hasAc,
        hasBalcony: r.hasBalcony,
        pricePerBed: r.pricePerBed,
        beds: r.beds
      }))
      data.append('rooms', JSON.stringify(roomsPayload))

      const res = await registerProperty(data)
      setIsSubmitting(false)

      if (res?.success) {
        try {
          localStorage.removeItem('trustnest_pg_registration_draft')
        } catch (_) {}
        alert('🎉 PG Property Registered successfully! Submitting for Super Admin Verification.')
        router.push('/admin/properties')
      } else {
        alert(res?.error || 'Unable to save the PG right now. Please try again.')
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      setIsSubmitting(false)
      alert('Unable to save the PG right now. Please try again.')
    }
  }

  // Location Geolocation
  const handleDetectLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation not supported by your browser')
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4))
        const lng = Number(pos.coords.longitude.toFixed(4))
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))
        setMapQueryOverride(`${lat},${lng}`)
        setIsLocating(false)
      },
      () => {
        setIsLocating(false)
        alert('Could not detect GPS location automatically.')
      },
      { timeout: 8000, enableHighAccuracy: true }
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Title & Draft recovery bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Register New PG</h1>
          <p className="text-sm text-slate-500 mt-1">Onboard your property to the TrustNest verified network.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClearDraft}
            className="text-xs text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer py-1.5 px-3 rounded-lg border border-slate-200 hover:border-red-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Draft</span>
          </button>
        </div>
      </div>

      {/* Modern 8-Step Breadcrumb Progress Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[700px]">
          {steps.map((s, index) => {
            const isCompleted = currentStep > s.id
            const isCurrent = currentStep === s.id

            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(s.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : isCurrent
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-50 shadow-sm'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : s.id}
                  </button>
                  <span className={`text-[10px] font-bold tracking-tight whitespace-nowrap ${
                    isCurrent ? 'text-indigo-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {s.name}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div className={`h-[2px] flex-1 mx-2 transition-colors ${
                    currentStep > s.id ? 'bg-emerald-400' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Form Content Container */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        {/* STEP 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Enter the public name, target gender group, and starting price.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">PG Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Emerald Elite Luxury PG"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">PG Gender Type *</label>
                <div className="grid grid-cols-3 gap-3">
                  {pgTypes.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: t.id }))}
                      className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        formData.type === t.id
                          ? 'border-indigo-600 bg-indigo-50/60 text-indigo-700 font-bold shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <t.icon className="w-5 h-5" />
                      <span className="text-xs">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Starting Rent (₹ / Month) *</label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      value={formData.priceFrom}
                      onChange={(e) => setFormData(prev => ({ ...prev, priceFrom: parseInt(e.target.value) || 0 }))}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  {errors.priceFrom && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.priceFrom}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Short Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g. Modern high-tech co-living space near IT hub"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Location */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Location &amp; Address</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Help residents find your PG on map and search results.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Street Address *</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g. Plot 42, Phase 1, Near Blue Ridge IT Park"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                {errors.address && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Area / Landmark</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Geolocation Button */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}
                  <span>Auto-Detect GPS Coordinates</span>
                </button>

                <span className="text-[11px] text-slate-400 font-mono">
                  {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Amenities */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Amenities &amp; Facilities</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Select all facilities included in the monthly rent package.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {amenitiesList.map(a => {
                const isSelected = formData.amenities.includes(a)
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium'
                    }`}
                  >
                    <span className="text-xs">{a}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Photos */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Property Photographs</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Upload clear photos of the building, rooms, lobby, and dining areas.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PhotoUploadCard
                label="Exterior Building View *"
                desc="Main facade photo of the building."
                uploaded={uploadedPhotos['exterior']}
                onUpload={(file) => handlePhotoUpload('exterior', file)}
                onRemove={() => handlePhotoRemove('exterior')}
              />
              <PhotoUploadCard
                label="Entrance &amp; Reception"
                desc="Lobby / entrance area."
                uploaded={uploadedPhotos['entrance']}
                onUpload={(file) => handlePhotoUpload('entrance', file)}
                onRemove={() => handlePhotoRemove('entrance')}
              />
              <PhotoUploadCard
                label="Typical Bedroom View"
                desc="Room layout with beds and wardrobe."
                uploaded={uploadedPhotos['rooms']}
                onUpload={(file) => handlePhotoUpload('rooms', file)}
                onRemove={() => handlePhotoRemove('rooms')}
              />
              <PhotoUploadCard
                label="Dining &amp; Kitchen"
                desc="Mess / food serving area."
                uploaded={uploadedPhotos['dining']}
                onUpload={(file) => handlePhotoUpload('dining', file)}
                onRemove={() => handlePhotoRemove('dining')}
              />
              <PhotoUploadCard
                label="Common Lounge / Study"
                desc="Recreation or study hall."
                uploaded={uploadedPhotos['common']}
                onUpload={(file) => handlePhotoUpload('common', file)}
                onRemove={() => handlePhotoRemove('common')}
              />
              <PhotoUploadCard
                label="Amenities &amp; Facilities"
                desc="Gym, laundry, power backup."
                uploaded={uploadedPhotos['facilities']}
                onUpload={(file) => handlePhotoUpload('facilities', file)}
                onRemove={() => handlePhotoRemove('facilities')}
              />
            </div>
          </div>
        )}

        {/* STEP 5: Floor Layouts */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Floors &amp; Blueprint Layouts</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Configure floors and attach architectural blueprint images.</p>
              </div>
              <button
                type="button"
                onClick={addFloor}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Floor</span>
              </button>
            </div>

            <div className="space-y-3">
              {floors.map(floor => (
                <div key={floor.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {floor.level}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{floor.name}</h4>
                      <p className="text-xs text-slate-400">Level {floor.level} • {floor.facilities.join(', ')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-indigo-600 bg-white hover:bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-sm">
                      <span>{floor.layoutFile ? `✓ ${floor.layoutFile.name}` : '+ Upload Blueprint'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFloorLayoutUpload(floor.id, file)
                        }}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: Rooms & Bed Availability */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Rooms &amp; Bed Capacity</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Configure room capacities and toggle bed occupancy states.</p>
            </div>

            <div className="space-y-6">
              {floors.map(floor => {
                const floorRooms = rooms.filter(r => r.floorLevel === floor.level)
                return (
                  <div key={floor.id} className="border border-slate-200 rounded-xl p-4 bg-white space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{floor.name}</span>
                        <span className="text-xs text-slate-500">({floorRooms.length} Rooms)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => addRoom(floor.level)}
                        className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-md transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Room</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {floorRooms.map(room => (
                        <div key={room.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-900">Room {room.roomNumber}</span>
                              <select
                                value={room.capacity}
                                onChange={(e) => updateRoomBeds(room.id, parseInt(e.target.value))}
                                className="bg-white border border-slate-200 rounded text-xs font-semibold px-2 py-0.5"
                              >
                                <option value={1}>1 Sharing</option>
                                <option value={2}>2 Sharing</option>
                                <option value={3}>3 Sharing</option>
                                <option value={4}>4 Sharing</option>
                              </select>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeRoom(room.id)}
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Beds interactive status toggle */}
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Beds (Click to toggle occupancy)</span>
                            <div className="flex flex-wrap gap-1.5">
                              {room.beds.map((bed, bIdx) => (
                                <button
                                  key={bIdx}
                                  type="button"
                                  onClick={() => toggleBedStatus(room.id, bIdx)}
                                  className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md border transition-all ${
                                    bed.status === 'VACANT' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' :
                                    bed.status === 'OCCUPIED' ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100' :
                                    'bg-purple-50 text-purple-700 border-purple-300 hover:bg-purple-100'
                                  }`}
                                  title="Click to toggle: Available / Occupied / Maintenance"
                                >
                                  <Bed className="w-3 h-3" />
                                  <span>Bed {bed.identifier}: {bed.status === 'VACANT' ? 'Vacant' : bed.status}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* 3D View Studio Capture Trigger */}
                          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setActive3DRoom(room)}
                              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                configured3DRooms[room.id]
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300'
                              }`}
                            >
                              <Box className="w-3.5 h-3.5 text-indigo-600" />
                              <span>{configured3DRooms[room.id] ? '✓ 3D View Attached (Edit)' : '+ Create 3D View (Photos/Video)'}</span>
                            </button>

                            <span className="text-[10px] text-slate-400 font-medium">
                              {configured3DRooms[room.id] ? '3D Model Ready' : 'AI Photogrammetry'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 7: TrustNest Inventory Allocation (NEW STEP) */}
        {currentStep === 7 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">TrustNest Inventory Allocation</h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Select the exact rooms and beds that you want to make available for booking through TrustNest. Beds not selected will remain under your direct owner management.
              </p>
            </div>

            {/* Dynamic Allocation Summary Metrics Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total PG Beds</span>
                  <p className="text-xl font-extrabold text-white mt-0.5">{totalBeds} Beds</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">TrustNest Beds</span>
                  <p className="text-xl font-extrabold text-emerald-400 mt-0.5">{trustNestBeds} Beds</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Owner Managed</span>
                  <p className="text-xl font-extrabold text-slate-300 mt-0.5">{ownerManagedBeds} Beds</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">TrustNest Allocation</span>
                  <p className="text-xl font-extrabold text-indigo-300 mt-0.5">{allocationPercent}%</p>
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-emerald-300">TrustNest ({allocationPercent}%)</span>
                  <span className="text-slate-300">Owner Direct ({100 - allocationPercent}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div 
                    className="bg-emerald-500 transition-all duration-300"
                    style={{ width: `${allocationPercent}%` }}
                  />
                  <div 
                    className="bg-slate-600 transition-all duration-300"
                    style={{ width: `${100 - allocationPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Batch Action Toolbar */}
            <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-bold text-slate-700">Quick Batch Allocation:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAllInventory(true)}
                  className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  ✓ Select All as TrustNest
                </button>
                <button
                  type="button"
                  onClick={() => setAllInventory(false)}
                  className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  Deselect All (All Owner Managed)
                </button>
              </div>
            </div>

            {/* Exact Room & Bed Selection */}
            <div className="space-y-6">
              {floors.map(floor => {
                const floorRooms = rooms.filter(r => r.floorLevel === floor.level)
                return (
                  <div key={floor.id} className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900">{floor.name}</span>
                        <span className="text-xs text-slate-500">({floorRooms.length} Rooms)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFloorInventory(floor.level, true)}
                          className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          Select Floor (TrustNest)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFloorInventory(floor.level, false)}
                          className="text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          Floor (Owner Managed)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {floorRooms.map(room => {
                        const roomBeds = room.beds
                        const isAllTrustNest = roomBeds.every(b => b.isTrustNestInventory !== false)
                        return (
                          <div key={room.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-extrabold text-sm text-slate-900">Room {room.roomNumber}</span>
                                <span className="text-xs text-slate-500 ml-2">({room.sharingType})</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => setRoomInventory(room.id, !isAllTrustNest)}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                                  isAllTrustNest
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                {isAllTrustNest ? '✓ Entire Room on TrustNest' : 'Select Entire Room'}
                              </button>
                            </div>

                            {/* Individual Bed Toggles */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              {room.beds.map((bed, bIdx) => {
                                const isTN = bed.isTrustNestInventory !== false
                                return (
                                  <div
                                    key={bIdx}
                                    onClick={() => toggleBedInventory(room.id, bIdx)}
                                    className={`p-3 rounded-xl border flex flex-col justify-between gap-2 cursor-pointer transition-all ${
                                      isTN
                                        ? 'bg-emerald-50/90 border-emerald-300 ring-1 ring-emerald-400/30'
                                        : 'bg-white border-slate-200 opacity-80 hover:opacity-100'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-1.5">
                                        <Bed className={`w-4 h-4 ${isTN ? 'text-emerald-700' : 'text-slate-400'}`} />
                                        <span className="text-xs font-bold text-slate-900">Bed {bed.identifier}</span>
                                      </div>
                                      {isTN ? (
                                        <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                                      ) : (
                                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                                      )}
                                    </div>

                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className={`font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                        isTN
                                          ? 'bg-emerald-200/70 text-emerald-900'
                                          : 'bg-slate-200 text-slate-700'
                                      }`}>
                                        {isTN ? 'TrustNest' : 'Owner Managed'}
                                      </span>
                                      <span className="text-slate-500 font-semibold">{bed.status}</span>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 8: Review & Submit */}
        {currentStep === 8 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Registration Review &amp; Checklist</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Verify your property configuration before submitting for public publishing.</p>
            </div>

            {/* Metric Overview Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-indigo-50/60 border border-indigo-100 rounded-xl p-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Property</span>
                <p className="text-sm font-bold text-slate-900 truncate">{formData.name || 'Untitled PG'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Floors &amp; Rooms</span>
                <p className="text-sm font-bold text-slate-900">{floors.length} Floors • {rooms.length} Rooms</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">TrustNest Beds</span>
                <p className="text-sm font-bold text-emerald-700">{trustNestBeds} of {totalBeds} Beds ({allocationPercent}%)</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Owner Managed</span>
                <p className="text-sm font-bold text-slate-700">{ownerManagedBeds} Beds</p>
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Basic Info &amp; Location: <strong>{formData.address}, {formData.city}</strong></span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Amenities: <strong>{formData.amenities.length} amenities selected</strong></span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Photos: <strong>{Object.keys(uploadedPhotos).length} photos attached</strong></span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Floors &amp; Layouts: <strong>{floors.length} floors configured ({floors.filter(f => f.layoutFile).length} layout blueprints uploaded)</strong></span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Rooms &amp; Beds: <strong>{rooms.length} rooms with {totalBeds} total beds</strong></span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-950">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>TrustNest Inventory Allocation: <strong>{trustNestBeds} TrustNest beds ({allocationPercent}%) • {ownerManagedBeds} Owner managed beds</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentStep === 1
                ? 'text-transparent cursor-default'
                : 'text-slate-600 hover:bg-slate-100 cursor-pointer'
            }`}
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving &amp; Publishing...
              </>
            ) : currentStep === steps.length ? (
              'Submit Registration'
            ) : (
              <>
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>

      {/* 3D Room View Capture Studio Modal */}
      {active3DRoom && (
        <Room3DCaptureWizard
          room={{
            id: active3DRoom.id,
            roomNumber: active3DRoom.roomNumber,
            sharingType: `${active3DRoom.capacity} Sharing`,
            capacity: active3DRoom.capacity,
            hasWashroom: active3DRoom.hasWashroom
          }}
          allRooms={rooms.map(r => ({
            id: r.id,
            roomNumber: r.roomNumber,
            capacity: r.capacity,
            sharingType: `${r.capacity} Sharing`
          }))}
          onClose={() => setActive3DRoom(null)}
          onSuccess={() => {
            setConfigured3DRooms(prev => ({ ...prev, [active3DRoom.id]: true }))
            setActive3DRoom(null)
          }}
        />
      )}

    </div>
  )
}

function PhotoUploadCard({
  label,
  desc,
  uploaded,
  onUpload,
  onRemove
}: {
  label: string
  desc: string
  uploaded?: { file: File, previewUrl: string, name: string }
  onUpload: (file: File) => void
  onRemove: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="relative">
      <input 
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
        }}
        className="hidden"
      />

      {uploaded ? (
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center gap-3 relative group overflow-hidden">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
            <Image 
              src={uploaded.previewUrl} 
              alt={uploaded.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-xs font-bold text-slate-800 truncate">{label}</span>
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">{uploaded.name}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold mt-1"
            >
              Change Photo
            </button>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Remove Photo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer group"
        >
          <div className="w-9 h-9 bg-slate-100 group-hover:bg-indigo-100 rounded-full flex items-center justify-center mb-2 transition-colors">
            <UploadCloud className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
          </div>
          <h4 className="text-xs font-bold text-slate-800 mb-0.5">{label}</h4>
          <p className="text-[10px] text-slate-400">{desc}</p>
        </div>
      )}
    </div>
  )
}
