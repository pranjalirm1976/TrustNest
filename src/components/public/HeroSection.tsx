'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Sparkles, Building2, Users, Star, MapPin as PinIcon } from 'lucide-react'
import Image from 'next/image'

export default function HeroSection() {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [sharing, setSharing] = useState('All')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = new URLSearchParams()
    if (location) query.set('location', location)
    if (sharing !== 'All') query.set('sharing', sharing)
    router.push(`/search?${query.toString()}`)
  }

  return (
    <section className="relative overflow-hidden bg-[#fbfbfb] pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline and Search */}
          <div className="lg:col-span-6 z-10 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Find a PG <br />
                That Feels Like <br />
                <span className="text-brand-primary">Home</span>
              </h1>
              <p className="text-base text-slate-500 font-medium">
                Verified PGs • Real Reviews • Transparent Living
              </p>
            </div>

            {/* Compact Search Bar */}
            <form 
              onSubmit={handleSearch}
              className="bg-white border border-slate-200/80 shadow-premium p-2 rounded-2xl md:rounded-full flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full max-w-2xl"
            >
              {/* Location Input */}
              <div className="flex items-center gap-3 px-4 py-2 md:py-0 flex-1">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none w-full"
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="bg-brand-primary hover:bg-brand-primary-dark text-white rounded-xl md:rounded-full py-3.5 px-8 font-bold text-sm shadow-premium hover:shadow-premium-lg transition-all duration-200 cursor-pointer shrink-0"
              >
                Search
              </button>
            </form>

            {/* High-Fidelity Stats */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-100 max-w-md">
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold text-brand-primary tracking-tight">500+</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Verified PGs</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold text-brand-primary tracking-tight">10K+</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Happy Residents</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold text-brand-primary tracking-tight">4.6★</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Average Rating</span>
              </div>
            </div>
          </div>

          {/* Right Column: Google Map with details popover */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            <div className="w-full aspect-[16/10] bg-slate-100 border border-slate-205 rounded-3xl overflow-hidden shadow-premium relative min-h-[350px]">
              
              {/* Google Maps Iframe */}
              <iframe
                src="https://maps.google.com/maps?q=Hinjawadi,Pune,Maharashtra&t=&z=13&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0 absolute inset-0"
                allowFullScreen
                loading="lazy"
                title="Pune PG Map Locations"
              />

              {/* Map Hover Info Popover exactly matching Mockup 1 */}
              <div className="absolute bottom-6 right-6 w-56 bg-white/95 backdrop-blur-sm border border-slate-200 p-2.5 rounded-2xl shadow-premium-lg flex items-center gap-3 animate-in z-30">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                  <Image
                    src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=200&q=80"
                    alt="Bliss Living PG"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-extrabold text-slate-905 truncate">Bliss Living PG</h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[9px] font-bold text-amber-600">4.6 ★</span>
                    <span className="text-[8px] text-slate-400 font-bold">(128)</span>
                  </div>
                  <p className="text-[10px] font-extrabold text-slate-900 mt-1">₹8,500<span className="text-[8px] text-slate-450 font-normal">/month</span></p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
