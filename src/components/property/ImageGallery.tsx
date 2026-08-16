'use client'

import Image from 'next/image'
import { Image as ImageIcon } from 'lucide-react'

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
  // If no images, show placeholder
  if (images.length === 0) {
    return (
      <div className="w-full h-96 bg-slate-100 rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2">
        <ImageIcon className="w-12 h-12" />
        <span className="text-sm font-semibold">No photos available for this property</span>
      </div>
    )
  }

  // Cover image or first image
  const coverImage = images.find((img) => img.isCover) || images[0]
  // Remaining images (up to 4 for the grid)
  const remainingImages = images.filter((img) => img.id !== coverImage.id).slice(0, 4)

  // Standard placeholders if we have less than 5 photos
  const placeholders = [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80',
  ]

  const gridImages = [...remainingImages.map(img => img.url)]
  while (gridImages.length < 4) {
    gridImages.push(placeholders[gridImages.length])
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 h-[300px] md:h-[450px] rounded-3xl overflow-hidden shadow-premium">
      {/* Left Big Cover Image */}
      <div className="md:col-span-2 relative h-full w-full bg-slate-100 overflow-hidden">
        <Image
          src={coverImage.url}
          alt={coverImage.altText || 'Property main image'}
          fill
          priority
          sizes="(max-w-7xl) 100vw, 800px"
          className="object-cover transition-transform duration-700 hover:scale-[1.01]"
        />
      </div>

      {/* Right Grid of 4 Smaller Images */}
      <div className="hidden md:grid md:col-span-2 grid-cols-2 grid-rows-2 gap-3 h-full">
        {gridImages.map((url, idx) => (
          <div key={idx} className="relative w-full h-full bg-slate-100 overflow-hidden">
            <Image
              src={url}
              alt={`Property details view ${idx + 1}`}
              fill
              sizes="(max-w-7xl) 50vw, 300px"
              className="object-cover transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
