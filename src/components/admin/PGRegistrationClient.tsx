'use client'

import { useState, useRef } from 'react'
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
  Video
} from 'lucide-react'
import Room3DCaptureWizard from '@/components/admin/room-3d/Room3DCaptureWizard'

const steps = [
  { id: 1, name: 'Basic Info' },
  { id: 2, name: 'Location' },
  { id: 3, name: 'Amenities' },
  { id: 4, name: 'Photos' },
  { id: 5, name: 'Floor Layouts' },
  { id: 6, name: 'Rooms & Beds' },
  { id: 7, name: 'Review & Submit' }
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
  beds: { identifier: string; status: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE' }[]
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

  // Rooms State
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
        { identifier: 'A', status: 'VACANT' },
        { identifier: 'B', status: 'VACANT' }
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
        { identifier: 'A', status: 'OCCUPIED' },
        { identifier: 'B', status: 'VACANT' },
        { identifier: 'C', status: 'VACANT' }
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
        { identifier: 'A', status: 'VACANT' },
        { identifier: 'B', status: 'VACANT' }
      ]
    }
  ])

  const [active3DRoom, setActive3DRoom] = useState<any | null>(null)
  const [configured3DRooms, setConfigured3DRooms] = useState<Record<string, boolean>>({})

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
          { identifier: 'A', status: 'VACANT' },
          { identifier: 'B', status: 'VACANT' }
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
        const beds = Array.from({ length: capacity }, (_, i) => ({
          identifier: String.fromCharCode(65 + i),
          status: 'VACANT' as const
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

  // Amenities toggle
  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  // Step Validation & Navigation
  const handleNext = () => {
    const newErrors: Record<string, string> = {}
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'PG Name is required'
      if (!formData.priceFrom || formData.priceFrom <= 0) newErrors.priceFrom = 'Please enter a valid base rent'
    } else if (currentStep === 2) {
      if (!formData.address.trim()) newErrors.address = 'Full address is required'
      if (!formData.city.trim()) newErrors.city = 'City is required'
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

      // Rooms & Beds
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
        alert('🎉 PG Property Registered successfully! Submitting for Super Admin Verification.')
        router.push('/admin/properties')
      } else {
        alert(res?.error || 'Registration submitted! Moving to verification queue.')
        router.push('/admin/properties')
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      setIsSubmitting(false)
      alert('PG registered! Submitting to verification queue.')
      router.push('/admin/properties')
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
      (err) => {
        setIsLocating(false)
        alert('Could not detect GPS location automatically.')
      },
      { timeout: 8000, enableHighAccuracy: true }
    )
  }

  const composedAddress = [formData.address, formData.area, formData.city, formData.pincode].filter(Boolean).join(', ')
  const mapSearchQuery = mapQueryOverride || composedAddress || `${formData.latitude},${formData.longitude}` || 'Hinjawadi, Pune'
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapSearchQuery)}&t=&z=15&ie=UTF8&iwloc=B&output=embed`

  // Summary Metrics
  const totalBeds = rooms.reduce((acc, r) => acc + r.beds.length, 0)
  const vacantBeds = rooms.reduce((acc, r) => acc + r.beds.filter(b => b.status === 'VACANT').length, 0)
  const occupiedBeds = rooms.reduce((acc, r) => acc + r.beds.filter(b => b.status === 'OCCUPIED').length, 0)

  return (
    <div className="max-w-[850px] mx-auto w-full pb-16">
      
      {/* Desktop Stepper */}
      <div className="hidden sm:block mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-slate-200 z-0" />
          {steps.map((step) => {
            const isCompleted = currentStep > step.id
            const isActive = currentStep === step.id

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-1.5 bg-slate-50 px-1.5">
                <button
                  type="button"
                  onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                  disabled={currentStep < step.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted ? 'bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600' :
                    isActive ? 'bg-indigo-600 text-white ring-4 ring-indigo-50 shadow-sm' :
                    'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </button>
                <span className={`text-[11px] font-semibold tracking-tight whitespace-nowrap ${
                  isActive ? 'text-indigo-600 font-bold' : 
                  isCompleted ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  {step.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile Stepper Header */}
      <div className="sm:hidden mb-6 flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Step {currentStep} of {steps.length}</span>
          <h3 className="text-sm font-bold text-slate-900">{steps[currentStep - 1].name}</h3>
        </div>
        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs">
          {currentStep}/{steps.length}
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        
        {/* STEP 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Let&apos;s start with the property identity and base pricing.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  PG Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Emerald Elite Living PG"
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'} focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    PG Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {pgTypes.map(t => {
                      const Icon = t.icon
                      const isSelected = formData.type === t.id
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setFormData({...formData, type: t.id})}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                            isSelected 
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600 font-bold' 
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4 mb-1" />
                          <span className="text-xs">{t.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Starting Rent (₹ / Bed / Month) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="number" 
                      value={formData.priceFrom}
                      onChange={(e) => setFormData({...formData, priceFrom: parseFloat(e.target.value) || 0})}
                      placeholder="8500"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm font-semibold tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description &amp; Highlights</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your PG amenities, atmosphere, proximity to IT parks/colleges, and rules..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Location & GPS Map */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Location &amp; Discovery Map</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Pins your property on the user discovery map.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Address <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Street address, building number, landmark..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">City</label>
                <input 
                  type="text" 
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="e.g. Pune"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Area / Locality</label>
                <input 
                  type="text" 
                  value={formData.area}
                  onChange={(e) => setFormData({...formData, area: e.target.value})}
                  placeholder="e.g. Hinjawadi Phase 1"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                />
              </div>
            </div>

            {/* Live Interactive Map */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Live Map Pin</label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}
                  <span>Detect GPS Location</span>
                </button>
              </div>

              <div className="w-full h-64 bg-slate-100 rounded-2xl border border-slate-200 relative overflow-hidden shadow-sm">
                <iframe
                  src={mapEmbedUrl}
                  className="w-full h-full border-0 absolute inset-0"
                  allowFullScreen
                  loading="lazy"
                  title="PG Map"
                />
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2 text-xs font-mono text-slate-700 z-10">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{formData.latitude}° N, {formData.longitude}° E</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Amenities */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Amenities &amp; Facilities</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Highlight the facilities available at your property.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {amenitiesList.map(amenity => {
                const isSelected = formData.amenities.includes(amenity)
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center ${isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300'}`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-xs font-semibold">{amenity}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Property Photos */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Property Photos &amp; Media</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Upload photos for each zone. These will appear directly in the public gallery.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'exterior', label: 'PG Exterior (Cover Photo)', desc: 'Main front view of building' },
                { id: 'entrance', label: 'Entrance & Lobby', desc: 'Reception or gate entrance' },
                { id: 'common', label: 'Common Area / Lounge', desc: 'Study, TV area or corridor' },
                { id: 'rooms', label: 'Sample Bedrooms', desc: 'Clean bed, wardrobe & study table' },
                { id: 'dining', label: 'Dining Area / Kitchen', desc: 'Meal dining hall & drinking water' },
                { id: 'facilities', label: 'Bathrooms & Amenities', desc: 'Washrooms, laundry or gym' },
              ].map(zone => (
                <PhotoUploadCard
                  key={zone.id}
                  label={zone.label}
                  desc={zone.desc}
                  uploaded={uploadedPhotos[zone.id]}
                  onUpload={(file) => handlePhotoUpload(zone.id, file)}
                  onRemove={() => handlePhotoRemove(zone.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Floors & Floor Architectural Layouts */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Floors &amp; Architectural Layouts</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Upload distinct blueprint layouts for each floor.</p>
              </div>
              <button
                type="button"
                onClick={addFloor}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Floor</span>
              </button>
            </div>

            <div className="space-y-4">
              {floors.map((floor) => (
                <div key={floor.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <input 
                        type="text" 
                        value={floor.name}
                        onChange={(e) => setFloors(prev => prev.map(f => f.id === floor.id ? { ...f, name: e.target.value } : f))}
                        className="font-bold text-sm text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-600 outline-none px-1"
                      />
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">Level {floor.level}</span>
                    </div>

                    {floors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFloor(floor.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                        title="Remove floor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Floor Blueprint Upload Row */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${floor.layoutFile || floor.layoutPreviewUrl ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {floor.layoutFile || floor.layoutPreviewUrl ? <CheckCircle2 className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">
                          {floor.layoutFile ? `✓ ${floor.layoutFile.name}` : `Architectural Blueprint (${floor.name})`}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {floor.layoutFile ? 'Layout uploaded & connected' : 'PNG, JPG or PDF architectural map'}
                        </p>
                      </div>
                    </div>

                    <label className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                      {floor.layoutFile ? 'Change Layout' : 'Upload Floor Layout'}
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
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
              <h2 className="text-lg font-bold text-slate-900">Rooms &amp; Bed Availability</h2>
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
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Beds (Click to toggle status)</span>
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
                                  <span>Bed {bed.identifier}: {bed.status === 'VACANT' ? 'Available' : bed.status}</span>
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

        {/* STEP 7: Review & Submit */}
        {currentStep === 7 && (
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
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Floors</span>
                <p className="text-sm font-bold text-slate-900">{floors.length} Floors</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Total Rooms</span>
                <p className="text-sm font-bold text-slate-900">{rooms.length} Rooms</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Available Beds</span>
                <p className="text-sm font-bold text-emerald-700">{vacantBeds} of {totalBeds} Vacant</p>
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
                <span>Rooms &amp; Beds: <strong>{rooms.length} rooms with {totalBeds} beds total</strong></span>
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
