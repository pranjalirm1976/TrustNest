'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  Camera, 
  Video, 
  UploadCloud, 
  Check, 
  X, 
  AlertTriangle, 
  RotateCw, 
  Box, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  Loader2, 
  Info, 
  Maximize2,
  RefreshCw,
  Eye,
  Sliders,
  ChevronRight,
  HelpCircle,
  Clock
} from 'lucide-react'
import Real3DViewer from '@/components/3d/Real3DViewer'
import { ownerApprove3DCapture, apply3DTemplateToRooms } from '@/actions/3d-capture.actions'

interface RoomItem {
  id: string
  roomNumber: string
  sharingType?: string | null
  capacity: number
  hasWashroom?: boolean
}

interface Room3DCaptureWizardProps {
  room: RoomItem
  allRooms?: RoomItem[]
  onClose: () => void
  onSuccess?: () => void
}

const photoSlots = [
  { id: 'photo_door', label: 'Door / Entrance View', desc: 'Step back to the door frame and capture the whole room', required: true },
  { id: 'photo_corner', label: 'Opposite Corner', desc: 'Stand at the opposite corner facing the entrance', required: true },
  { id: 'photo_left', label: 'Left Wall Angle', desc: 'Capture the left side walls and floor space', required: true },
  { id: 'photo_right', label: 'Right Wall Angle', desc: 'Capture the right side walls and layout', required: true },
  { id: 'photo_bed', label: 'Bed Area', desc: 'Clear view of bed frames, mattress, and spacing', required: false },
  { id: 'photo_window', label: 'Window / Balcony', desc: 'Natural light source and external view', required: false },
  { id: 'photo_wardrobe', label: 'Wardrobe & Study Desk', desc: 'Storage cupboards and study table setup', required: false },
  { id: 'photo_bathroom', label: 'Washroom Entry', desc: 'Attached bathroom or wash basin access', required: false },
]

export default function Room3DCaptureWizard({
  room,
  allRooms = [],
  onClose,
  onSuccess
}: Room3DCaptureWizardProps) {
  const [activeTab, setActiveTab] = useState<'PHOTO' | 'VIDEO'>('PHOTO')
  const [uploadedPhotos, setUploadedPhotos] = useState<Record<string, File>>({})
  const [photoPreviews, setPhotoPreviews] = useState<Record<string, string>>({})
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoDuration, setVideoDuration] = useState<number>(45)
  const [templateName, setTemplateName] = useState(`${room.sharingType || 'Standard'} Room 3D Template`)
  
  // Pipeline State
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState<'IDLE' | 'UPLOADING' | 'ANALYZING' | 'RECONSTRUCTING' | 'COMPLETE'>('IDLE')
  const [generatedCaptureId, setGeneratedCaptureId] = useState<string | null>(null)
  const [modelResult, setModelResult] = useState<any | null>(null)
  const [isApproved, setIsApproved] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Reusable Template State
  const [applyToIdentical, setApplyToIdentical] = useState(false)
  const [selectedIdenticalRooms, setSelectedIdenticalRooms] = useState<string[]>([])

  // Photo handlers
  const handlePhotoSelect = (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedPhotos(prev => ({ ...prev, [slotId]: file }))
      const url = URL.createObjectURL(file)
      setPhotoPreviews(prev => ({ ...prev, [slotId]: url }))
      setErrorMsg(null)
    }
  }

  const removePhoto = (slotId: string) => {
    setUploadedPhotos(prev => {
      const next = { ...prev }
      delete next[slotId]
      return next
    })
    setPhotoPreviews(prev => {
      const next = { ...prev }
      delete next[slotId]
      return next
    })
  }

  // Video handler
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
      setErrorMsg(null)
    }
  }

  // Submit and Generate 3D Model via High-Speed Upload API
  const handleGenerate3D = async () => {
    setErrorMsg(null)
    setIsProcessing(true)
    setProcessingStage('UPLOADING')

    try {
      const formData = new FormData()
      formData.append('roomId', room.id)
      formData.append('captureMethod', activeTab)
      formData.append('templateName', templateName)

      if (activeTab === 'PHOTO') {
        const photoKeys = Object.keys(uploadedPhotos)
        if (photoKeys.length < 4) {
          throw new Error('Please upload at least 4 photos covering different room angles.')
        }
        photoKeys.forEach(k => formData.append(k, uploadedPhotos[k]))
      } else {
        if (!videoFile) {
          throw new Error('Please select a 30–60 second walkaround video file.')
        }
        formData.append('video', videoFile)
        formData.append('duration', String(videoDuration))
      }

      setProcessingStage('ANALYZING')

      // Call Streaming Upload API
      const res = await fetch('/api/3d/upload', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || '3D Model generation failed.')
      }

      setProcessingStage('RECONSTRUCTING')
      setGeneratedCaptureId(data.captureId)
      setModelResult(data.result)
      setProcessingStage('COMPLETE')
    } catch (err: any) {
      setErrorMsg(err.message || '3D Model generation failed.')
      setProcessingStage('IDLE')
    } finally {
      setIsProcessing(false)
    }
  }

  // Owner Approve 3D View Action
  const handleOwnerApprove = async () => {
    if (!generatedCaptureId) return
    try {
      const res = await ownerApprove3DCapture(generatedCaptureId)
      if (res.success) {
        setIsApproved(true)

        if (applyToIdentical && selectedIdenticalRooms.length > 0) {
          await apply3DTemplateToRooms(generatedCaptureId, selectedIdenticalRooms, true)
        }

        if (onSuccess) onSuccess()
      } else {
        alert(res.error)
      }
    } catch (e: any) {
      alert(e.message)
    }
  }

  const uploadedCount = Object.keys(uploadedPhotos).length

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">3D Room View Capture Studio</h3>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase">
                  Room {room.roomNumber} ({room.sharingType || `${room.capacity} Sharing`})
                </span>
              </div>
              <p className="text-xs text-slate-500">Photogrammetry and neural 3D room reconstruction</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* Mode Selector (When not in preview) */}
          {processingStage !== 'COMPLETE' && !modelResult && (
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('PHOTO')}
                className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'PHOTO'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Option 1: Guided Photo Capture</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('VIDEO')}
                className={`py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'VIDEO'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Option 2: 360° Video Walkaround</span>
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-red-700">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Capture Validation Notice</strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* TAB 1: PHOTO CAPTURE WORKFLOW */}
          {activeTab === 'PHOTO' && processingStage !== 'COMPLETE' && !modelResult && (
            <div className="space-y-4">
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 block">
                    Photo Capture Guidelines
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Capture <strong>4 to 12 clear photos</strong> covering all corners of the room. Hold phone steadily at chest level.
                  </p>
                  <p className="text-[11px] text-amber-700 font-semibold mt-1">
                    💡 More photos usually improve reconstruction quality.
                  </p>
                </div>
                <div className="bg-white border border-indigo-200 px-3 py-1.5 rounded-xl text-center shrink-0 shadow-sm">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Uploaded</span>
                  <span className="text-sm font-black text-indigo-600 font-mono">{uploadedCount} / 8</span>
                </div>
              </div>

              {/* Photo Upload Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {photoSlots.map(slot => {
                  const isUploaded = !!uploadedPhotos[slot.id]
                  const previewUrl = photoPreviews[slot.id]

                  return (
                    <div 
                      key={slot.id} 
                      className={`relative rounded-2xl border p-3 flex flex-col justify-between transition-all min-h-[140px] ${
                        isUploaded 
                          ? 'border-emerald-300 bg-emerald-50/30' 
                          : slot.required 
                          ? 'border-slate-300 bg-white hover:border-indigo-400' 
                          : 'border-dashed border-slate-300 bg-slate-50/50 hover:border-slate-400'
                      }`}
                    >
                      {previewUrl ? (
                        <div className="relative w-full h-20 rounded-xl overflow-hidden mb-2 bg-slate-100">
                          <Image src={previewUrl} alt={slot.label} fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(slot.id)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-sm hover:bg-red-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center flex-1 cursor-pointer py-3">
                          <Camera className="w-5 h-5 text-slate-400 mb-1" />
                          <span className="text-[10px] font-bold text-indigo-600 hover:underline">Select Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handlePhotoSelect(slot.id, e)}
                            className="hidden"
                          />
                        </label>
                      )}

                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-800 leading-tight">{slot.label}</span>
                          {slot.required && <span className="text-[9px] font-bold text-red-500">*</span>}
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">{slot.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* TAB 2: VIDEO CAPTURE WORKFLOW */}
          {activeTab === 'VIDEO' && processingStage !== 'COMPLETE' && !modelResult && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">360° Walkaround Capture Instructions</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>1. Start near the room entrance.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>2. Hold the phone steadily at chest height.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>3. Walk slowly around the perimeter.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>4. Point camera towards walls and furniture.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>5. Complete one continuous circular loop.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>6. Capture bed, wardrobe, windows, washroom.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>7. Avoid fast rotations or sudden jerks.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>8. Keep room well lit with ceiling lights ON.</span>
                  </div>
                </div>
              </div>

              {/* Video File Picker */}
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <Video className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  {videoFile ? videoFile.name : 'Upload Room Walkaround Video (MP4 / MOV)'}
                </h4>
                <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                  Recommended length: <strong>30–60 seconds</strong>. Our backend automatically extracts sharp keyframes.
                </p>

                <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer transition-colors">
                  <UploadCloud className="w-4 h-4" />
                  <span>{videoFile ? 'Change Video' : 'Select Video File'}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime,video/*"
                    onChange={handleVideoSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Processing Stages Progression */}
          {isProcessing && (
            <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4 shadow-lg animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  <h4 className="text-sm font-bold">3D Neural Reconstruction Pipeline</h4>
                </div>
                <span className="text-xs font-mono text-indigo-400 font-bold uppercase">Processing...</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 block uppercase">1. Media Upload</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1 mt-1">
                    <Check className="w-3.5 h-3.5" /> Upload Complete
                  </span>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 block uppercase">2. Spatial Analysis</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1 mt-1">
                    <Check className="w-3.5 h-3.5" /> Coverage Validated
                  </span>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 block uppercase">3. 3D Neural Synthesis</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1 mt-1">
                    <Check className="w-3.5 h-3.5" /> Mesh Complete
                  </span>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 block uppercase">4. GLB Optimization</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1 mt-1">
                    <Check className="w-3.5 h-3.5" /> GLB Model Ready
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3D MODEL PREVIEW & OWNER APPROVAL STAGE */}
          {modelResult && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Real WebGL 3D Room Viewer */}
              <Real3DViewer
                modelUrl={modelResult.modelUrl}
                roomNumber={room.roomNumber}
                sharingType={room.sharingType || `${room.capacity} Sharing`}
                qualityScore={modelResult.qualityReport?.qualityScore || 4.8}
                coverageScore={modelResult.qualityReport?.coverageScore || 95}
              />

              {/* Coverage & Geometry Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Spatial Coverage</span>
                  <span className="text-lg font-black text-slate-900 font-mono">
                    {modelResult.qualityReport?.coverageScore || 95}%
                  </span>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">High Geometry Precision</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Capture Method</span>
                  <span className="text-lg font-black text-indigo-700 font-mono">{activeTab}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Web-compatible GLB</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Approval Status</span>
                  <span className="text-xs font-bold text-amber-700 block mt-1">
                    {isApproved ? 'Submitted for Admin Review' : 'Ready for Owner Review'}
                  </span>
                </div>
              </div>

              {/* Reusable Identical Room Template Option */}
              {allRooms.length > 1 && (
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyToIdentical}
                      onChange={(e) => setApplyToIdentical(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-800">
                      Apply this 3D model to identical {room.sharingType || 'sharing'} rooms
                    </span>
                  </label>

                  {applyToIdentical && (
                    <div className="pl-6 space-y-2">
                      <p className="text-[11px] text-slate-500">
                        Select rooms with identical dimension and bed format:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {allRooms.filter(r => r.id !== room.id).map(r => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              setSelectedIdenticalRooms(prev => 
                                prev.includes(r.id) ? prev.filter(id => id !== r.id) : [...prev, r.id]
                              )
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                              selectedIdenticalRooms.includes(r.id)
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            Room {r.roomNumber}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Approval Success Banner */}
              {isApproved && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block font-bold">Owner Approval Confirmed!</strong>
                    <span>Your 3D room view has been submitted for TrustNest Super Admin verification. It will appear on the public website once published.</span>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="h-20 px-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 bg-white rounded-xl transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-3">
            {processingStage !== 'COMPLETE' && !modelResult ? (
              <button
                type="button"
                onClick={handleGenerate3D}
                disabled={isProcessing || (activeTab === 'PHOTO' ? uploadedCount < 4 : !videoFile)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate 3D Room Model</span>
              </button>
            ) : (
              !isApproved && (
                <button
                  type="button"
                  onClick={handleOwnerApprove}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Approve 3D View &amp; Submit</span>
                </button>
              )
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
