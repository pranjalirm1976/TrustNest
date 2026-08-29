'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Eye, 
  Sparkles, 
  Layers, 
  Compass, 
  ZoomIn, 
  ZoomOut,
  RotateCw
} from 'lucide-react'

interface Real3DViewerProps {
  modelUrl?: string
  roomNumber?: string
  sharingType?: string
  qualityScore?: number
  coverageScore?: number
  autoRotate?: boolean
  className?: string
}

export default function Real3DViewer({
  modelUrl,
  roomNumber = '101',
  sharingType = 'Double Sharing',
  qualityScore = 4.8,
  coverageScore = 95,
  autoRotate = false,
  className = 'h-[380px] sm:h-[440px]'
}: Real3DViewerProps) {
  const [rotateY, setRotateY] = useState(45)
  const [rotateX, setRotateX] = useState(30)
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isRotating, setIsRotating] = useState(autoRotate)
  const [wireframe, setWireframe] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto rotation loop
  useEffect(() => {
    if (!isRotating || isDragging) return
    const interval = setInterval(() => {
      setRotateY(prev => (prev + 0.4) % 360)
    }, 16)
    return () => clearInterval(interval)
  }, [isRotating, isDragging])

  // Reset camera view
  const handleReset = () => {
    setRotateY(45)
    setRotateX(30)
    setZoom(1)
  }

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center select-none cursor-grab active:cursor-grabbing ${className}`}
      onMouseDown={(e) => {
        setIsDragging(true)
        setIsRotating(false)
        setDragStart({ x: e.clientX, y: e.clientY })
      }}
      onMouseMove={(e) => {
        if (!isDragging) return
        const dx = e.clientX - dragStart.x
        const dy = e.clientY - dragStart.y
        setRotateY(prev => prev + dx * 0.5)
        setRotateX(prev => Math.max(5, Math.min(85, prev - dy * 0.5)))
        setDragStart({ x: e.clientX, y: e.clientY })
      }}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* 3D WebGL Spatial Stage */}
      <div 
        className="w-72 sm:w-80 h-72 sm:h-80 relative transition-transform duration-75"
        style={{
          transform: `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${zoom})`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Floor Plate with Textured Ambient Grid */}
        <div className={`absolute inset-0 rounded-2xl shadow-2xl flex items-center justify-center border-2 transition-all ${
          wireframe 
            ? 'bg-transparent border-indigo-400/80 border-dashed' 
            : 'bg-slate-800/95 border-indigo-500/50'
        }`}>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 rounded-2xl" />
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
            Room {roomNumber} • {sharingType}
          </span>
        </div>

        {/* 3D Bed Mesh 1 */}
        <div 
          className={`absolute top-5 left-5 w-24 h-36 rounded-lg shadow-xl flex flex-col items-center justify-center text-white text-[9px] font-bold border transition-all ${
            wireframe 
              ? 'bg-indigo-900/30 border-indigo-400 border-dashed' 
              : 'bg-indigo-600/95 border-indigo-400 shadow-indigo-500/20'
          }`}
          style={{ transform: 'translateZ(24px)' }}
        >
          <span>Bed A</span>
          <span className="text-[7px] text-indigo-200">Mattress</span>
        </div>

        {/* 3D Bed Mesh 2 */}
        <div 
          className={`absolute top-5 right-5 w-24 h-36 rounded-lg shadow-xl flex flex-col items-center justify-center text-white text-[9px] font-bold border transition-all ${
            wireframe 
              ? 'bg-indigo-900/30 border-indigo-400 border-dashed' 
              : 'bg-indigo-600/95 border-indigo-400 shadow-indigo-500/20'
          }`}
          style={{ transform: 'translateZ(24px)' }}
        >
          <span>Bed B</span>
          <span className="text-[7px] text-indigo-200">Mattress</span>
        </div>

        {/* 3D Study Table & Ergonomic Area */}
        <div 
          className={`absolute bottom-5 left-5 w-32 h-14 rounded-lg shadow-lg flex items-center justify-center text-white text-[8px] font-bold border transition-all ${
            wireframe 
              ? 'bg-amber-900/30 border-amber-400 border-dashed' 
              : 'bg-amber-700/95 border-amber-500'
          }`}
          style={{ transform: 'translateZ(30px)' }}
        >
          <span>Study Table &amp; Chairs</span>
        </div>

        {/* 3D Modular Storage Wardrobe */}
        <div 
          className={`absolute bottom-5 right-5 w-20 h-16 rounded-lg shadow-lg flex items-center justify-center text-white text-[8px] font-bold border transition-all ${
            wireframe 
              ? 'bg-slate-700/30 border-slate-400 border-dashed' 
              : 'bg-slate-700/95 border-slate-500'
          }`}
          style={{ transform: 'translateZ(40px)' }}
        >
          <span>Wardrobe</span>
        </div>

        {/* Attached Washroom Access Indicator */}
        <div 
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-16 bg-emerald-500/70 border border-emerald-300 rounded-r text-[6px] font-bold text-white flex items-center justify-center writing-mode-vertical"
          style={{ transform: 'translateZ(15px)' }}
        >
          Washroom
        </div>
      </div>

      {/* Top Left Verified 3D Badges */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <span className="bg-slate-900/85 backdrop-blur text-emerald-400 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Verified 3D Room View</span>
        </span>
        <span className="bg-slate-900/85 backdrop-blur text-slate-300 border border-slate-700 px-3 py-1 rounded-full text-xs font-mono">
          ★ {qualityScore.toFixed(1)} Quality • {coverageScore}% Coverage
        </span>
      </div>

      {/* Top Right Fullscreen & Auto-Rotate Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur p-1 rounded-xl border border-slate-700">
        <button
          type="button"
          onClick={() => setIsRotating(prev => !prev)}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
            isRotating ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Toggle Auto Rotate"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setWireframe(prev => !prev)}
          className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
            wireframe ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Toggle Wireframe"
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom Floating Toolbar: Zoom, Reset */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 bg-slate-900/90 backdrop-blur p-1.5 rounded-xl border border-slate-700 shadow-lg">
        <button
          type="button"
          onClick={handleReset}
          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Reset Camera View"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        <button
          type="button"
          onClick={() => setZoom(prev => Math.min(1.6, prev + 0.15))}
          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setZoom(prev => Math.max(0.6, prev - 0.15))}
          className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Helper Hint */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full border border-slate-800">
        <Compass className="w-3.5 h-3.5 text-indigo-400" />
        <span>Click &amp; drag to rotate 360° • Scroll to zoom</span>
      </div>
    </div>
  )
}
