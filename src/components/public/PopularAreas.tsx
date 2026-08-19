'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

export default function PopularAreas() {
  const areas = [
    {
      name: 'Hinjawadi',
      desc: 'Pune’s biggest IT hub. Walk to work, near Hinjawadi Phase 1, 2, 3.',
      pgs: '12 PGs',
      image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Wakad',
      desc: 'Perfect residential zone close to Hinjawadi and colleges. Family-friendly.',
      pgs: '8 PGs',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Baner',
      desc: 'Premium high-street area with top-tier cafes, gyms, and connectivity.',
      pgs: '6 PGs',
      image: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Kharadi',
      desc: 'East Pune’s commercial power-hub. Right beside EON IT Free Zone.',
      pgs: '5 PGs',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80',
    },
  ]

  return (
    <section className="bg-[#fbfbfb] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div className="flex flex-col gap-4 max-w-2xl">
            <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Pune Neighborhoods</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Explore Popular Areas
            </h2>
            <p className="text-slate-500">
              Pick a location that matches your daily routine. We have trust-verified PGs positioned near key tech parks, metro routes, and colleges.
            </p>
          </div>
          
          <Link 
            href="/search"
            className="group flex items-center gap-1 text-sm font-bold text-brand-primary hover:text-brand-primary-dark transition-colors border-b border-transparent hover:border-brand-primary pb-1"
          >
            <span>View All Pune PGs</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {areas.map((area, idx) => (
            <Link
              key={idx}
              href={`/search?location=${area.name}`}
              className="group relative h-[380px] rounded-2xl overflow-hidden shadow-premium hover:shadow-premium-lg flex flex-col justify-end p-6 border border-slate-200/40 cursor-pointer"
            >
              {/* background image */}
              <Image
                src={area.image}
                alt={`${area.name} neighborhood photo`}
                fill
                sizes="(max-w-7xl) 100vw, 300px"
                className="object-cover transition-transform duration-750 group-hover:scale-105"
              />
              {/* gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />

              {/* content */}
              <div className="relative z-20 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">{area.pgs}</span>
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center justify-between">
                  {area.name}
                  <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed opacity-0 group-hover:opacity-100 max-h-0 group-hover:max-h-16 transition-all duration-500 overflow-hidden">
                  {area.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
