'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Image as ImageIcon, ChevronLeft, ChevronRight, Bed, Utensils, Users, BookOpen } from 'lucide-react'

type PropertyImage = {
  id: string
  url: string
  altText: string | null
  isCover: boolean
}

interface ImageGalleryProps {
  images: PropertyImage[]
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [currentIdx, setCurrentIdx] = useState(0)

  // Fallback images if list is empty
  const defaultImages = [
    { id: '1', url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80', altText: 'Bliss Living PG Exterior', isCover: true },
    { id: '2', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80', altText: 'Bedroom', isCover: false },
    { id: '3', url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80', altText: 'Dining Area', isCover: false },
    { id: '4', url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80', altText: 'Common Area', isCover: false },
    { id: '5', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80', altText: 'Study Space', isCover: false },
  ]

  const galleryImages = images.length > 0 ? images : defaultImages
  const mainImage = galleryImages[currentIdx] || galleryImages[0]

  const rightGridImages = [
    { url: galleryImages[1]?.url || defaultImages[1].url, label: 'Bedroom', icon: <Bed className="w-3.5 h-3.5" /> },
    { url: galleryImages[2]?.url || defaultImages[2].url, label: 'Dining Area', icon: <Utensils className="w-3.5 h-3.5" /> },
    { url: galleryImages[3]?.url || defaultImages[3].url, label: 'Common Area', icon: <Users className="w-3.5 h-3.5" /> },
    { url: galleryImages[4]?.url || defaultImages[4].url, label: 'Study Space', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ]

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIdx((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[350px] lg:h-[480px] rounded-3xl overflow-hidden">
      
      {/* LEFT: Large Main Building Exterior Photo (7 Columns) */}
      <div className="lg:col-span-7 relative h-full w-full bg-slate-100 group">
        <Image
          src={mainImage.url}
          alt={mainImage.altText || 'Property main image'}
          fill
          priority
          sizes="(max-w-7xl) 100vw, 800px"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.01]"
        />

        {/* Verified PG Tag */}
        <span className="absolute top-4 left-4 z-20 bg-emerald-600/90 backdrop-blur text-white text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-premium-sm border border-emerald-500/20 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>Verified PG</span>
        </span>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-slate-800 p-2 rounded-full shadow-premium transition-all hover:scale-105 cursor-pointer opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Next image"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white text-slate-800 p-2 rounded-full shadow-premium transition-all hover:scale-105 cursor-pointer opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* View all photos badge */}
        <div className="absolute bottom-4 left-4 z-20 bg-slate-900/70 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-xl text-white text-[10px] font-extrabold uppercase tracking-wider">
          View all photos ({galleryImages.length})
        </div>
      </div>

      {/* RIGHT: 2x2 Grid of Smaller Photos (5 Columns) */}
      <div className="hidden lg:grid lg:col-span-5 grid-cols-2 grid-rows-2 gap-4 h-full">
        {rightGridImages.map((img, idx) => (
          <div key={idx} className="relative w-full h-full bg-slate-100 overflow-hidden group rounded-2xl">
            <Image
              src={img.url}
              alt={img.label}
              fill
              sizes="(max-w-7xl) 25vw, 300px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Tag Badge */}
            <div className="absolute bottom-3 left-3 z-20 bg-black/60 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-xl text-white text-[9px] font-extrabold tracking-wide flex items-center gap-1.5">
              {img.icon}
              <span>{img.label}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
