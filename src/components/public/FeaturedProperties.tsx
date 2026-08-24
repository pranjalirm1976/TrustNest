'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShieldAlert, ArrowRight, MapPin, BadgePercent } from 'lucide-react'

type PropertyImage = {
  id: string
  url: string
  altText: string | null
  isCover: boolean
}

type Property = {
  id: string
  name: string
  address: string
  priceFrom: number
  gender: string
  trustScore: number
  images: PropertyImage[]
  availabilityStatus?: string
  availableBeds?: number
  totalBeds?: number
  occupancyPercentage?: number
}

interface FeaturedPropertiesProps {
  properties: Property[]
}

export default function FeaturedProperties({ properties }: FeaturedPropertiesProps) {
  return (
    <section className="bg-white py-20 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div className="flex flex-col gap-4 max-w-2xl">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Available Bookings</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Featured Stays in Pune
            </h2>
            <p className="text-slate-500">
              Each property below features verified active residents, audited daily meals, and strict 24-hour maintenance SLA execution. Click to view room structures and 3D views.
            </p>
          </div>
          
          <Link 
            href="/search"
            className="group inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-3 px-5 rounded-xl shadow-premium transition-all duration-200 hover:-translate-y-[1px] cursor-pointer"
          >
            <span>Explore All Properties</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
            <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 font-semibold">No Properties Available</p>
            <p className="text-sm text-slate-400 mt-1">Please double check that database seeding was executed successfully.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => {
              // Find cover image, fallback to first image, fallback to placeholder
              const coverImage = property.images.find(img => img.isCover)?.url || 
                                 property.images[0]?.url || 
                                 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'

              return (
                <Link
                  key={property.id}
                  href={`/pg/${property.id}`}
                  className="group bg-[#fbfbfb] border border-slate-200/60 rounded-2xl overflow-hidden shadow-premium hover:shadow-premium-lg transition-all duration-300 hover:-translate-y-[2px] flex flex-col h-full cursor-pointer"
                >
                  {/* Property Image Container */}
                  <div className="relative aspect-[3/2] w-full overflow-hidden bg-slate-100">
                    <Image
                      src={coverImage}
                      alt={property.name}
                      fill
                      sizes="(max-w-7xl) 100vw, 400px"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
                      {/* Gender Badge */}
                      <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-premium-sm ${
                        property.gender === 'FEMALE' ? 'bg-pink-100 text-pink-700' :
                        property.gender === 'MALE' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {property.gender === 'UNISEX' ? 'Unisex' : `${property.gender} only`}
                      </span>

                      {/* Verified Badge */}
                      <span className="bg-brand-success-light text-brand-success text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-premium-sm border border-brand-success/10 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-brand-success rounded-full animate-pulse" />
                        Verified
                      </span>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-6 flex flex-col gap-4 flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-primary transition-colors tracking-tight line-clamp-1">
                          {property.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {property.address}
                        </p>
                      </div>

                      {/* TrustScore Badge */}
                      <div className="flex flex-col items-end shrink-0">
                        <div className="bg-indigo-50 border border-indigo-100 text-brand-primary text-sm font-extrabold px-3 py-1 rounded-xl flex items-center gap-1 shadow-premium-sm">
                          <span>★</span>
                          <span>{property.trustScore.toFixed(1)}</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Trust Score</span>
                      </div>
                    </div>

                    {/* Availability Status Bar */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          property.availabilityStatus === 'FULL' ? 'bg-red-500' :
                          property.availabilityStatus === 'LIMITED AVAILABILITY' ? 'bg-amber-500' :
                          'bg-emerald-500'
                        }`} />
                        <span className={`text-[11px] font-bold ${
                          property.availabilityStatus === 'FULL' ? 'text-red-700' :
                          property.availabilityStatus === 'LIMITED AVAILABILITY' ? 'text-amber-700' :
                          'text-emerald-700'
                        }`}>
                          {property.availabilityStatus === 'FULL' ? 'Full' :
                           property.availableBeds !== undefined && property.availableBeds > 0 ? `${property.availableBeds} beds available` :
                           'Available'}
                        </span>
                      </div>

                      {property.totalBeds !== undefined && property.totalBeds > 0 && (
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {property.totalBeds} total beds
                        </span>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-slate-200/60 w-full" />

                    {/* Pricing and Action */}
                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rent Starts At</span>
                        <p className="text-lg font-extrabold text-slate-900">
                          ₹{property.priceFrom.toLocaleString('en-IN')}
                          <span className="text-xs font-semibold text-slate-500 font-mono">/mo</span>
                        </p>
                      </div>

                      <span className="text-xs font-bold text-brand-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>Book Room</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
