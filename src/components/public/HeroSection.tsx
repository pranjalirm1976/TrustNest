'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Sparkles, Building2, Users } from 'lucide-react'
import Image from 'next/image'

export default function HeroSection() {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [gender, setGender] = useState('UNISEX')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = new URLSearchParams()
    if (location) query.set('location', location)
    if (gender) query.set('gender', gender)
    router.push(`/search?${query.toString()}`)
  }

  return (
    <section className="relative overflow-hidden bg-[#fbfbfb] pt-12 pb-20 lg:pt-20 lg:pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline and Search */}
          <div className="lg:col-span-7 z-10 flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full py-1.5 px-4 self-start">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span className="text-xs font-semibold text-indigo-950 uppercase tracking-wider">
                Reimagining PG Accommodations
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Find a PG That <br />
                <span className="text-brand-primary">Actually Feels Like Home</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-xl">
                Experience premium stays with verified resident reviews, daily food transparency, and guaranteed 24-hour SLA resolution. Discover trust-verified PGs across Pune.
              </p>
            </div>

            {/* Premium Search Bar */}
            <form 
              onSubmit={handleSearch}
              className="bg-white border border-slate-200/80 shadow-premium p-3 rounded-2xl md:rounded-full flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full max-w-2xl"
            >
              {/* Location Input */}
              <div className="flex items-center gap-3 px-3 py-2 md:py-0 border-b md:border-b-0 md:border-r border-slate-100 flex-1">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="flex flex-col flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</span>
                  <input
                    type="text"
                    placeholder="Wakad, Hinjawadi, Baner..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* Gender Preference Select */}
              <div className="flex items-center gap-3 px-3 py-2 md:py-0 border-b md:border-b-0 md:border-r border-slate-100 min-w-[140px]">
                <Users className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="flex flex-col flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sharing Type</span>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="text-sm font-semibold text-slate-900 bg-transparent focus:outline-none w-full cursor-pointer appearance-none"
                  >
                    <option value="UNISEX">Unisex</option>
                    <option value="MALE">Male Only</option>
                    <option value="FEMALE">Female Only</option>
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="bg-brand-primary hover:bg-brand-primary-dark text-white rounded-xl md:rounded-full py-4 px-6 font-semibold flex items-center justify-center gap-2 shadow-premium hover:shadow-premium-lg transition-all duration-200 hover:-translate-y-[1px] cursor-pointer"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </form>

            <div className="flex items-center gap-8 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-primary" />
                <span>100% VERIFIED ROOMS</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-primary" />
                <span>4.8/5 RESIDENT RATING</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Image with Daylight */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="relative w-full aspect-[4/3] sm:aspect-square lg:aspect-[4/5] max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-premium-lg">
              {/* Premium sunlight room render */}
              <Image
                src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"
                alt="Cozy sun-drenched PG Room in Pune"
                fill
                priority
                sizes="(max-w-7xl) 100vw, 800px"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              {/* Dynamic tag */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur p-4 rounded-2xl border border-white/20 shadow-premium flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Featured PG</p>
                  <p className="text-sm font-bold text-slate-900">Emerald Elite, Hinjawadi</p>
                </div>
                <div className="bg-brand-primary text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  ★ 4.8
                </div>
              </div>
            </div>
            {/* Soft decorative shadow circle behind image (NO random glowing gradients) */}
            <div className="absolute -z-10 w-72 h-72 bg-indigo-100/50 rounded-full filter blur-3xl -top-10 -right-10 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  )
}
