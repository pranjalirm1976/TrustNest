'use client'

import { useState, useMemo } from 'react'
import ServiceCategoryFilter from './ServiceCategoryFilter'
import ServiceCard from './ServiceCard'
import { Inbox } from 'lucide-react'

type Service = {
  id: string
  name: string
  type: string
  distance: string
}

interface NearbyServicesSectionProps {
  services: Service[]
}

export default function NearbyServicesSection({ services }: NearbyServicesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('')

  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      if (selectedCategory && srv.type !== selectedCategory) return false
      return true
    })
  }, [services, selectedCategory])

  return (
    <div id="nearby" className="py-12 flex flex-col gap-6 w-full">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Nearby Services & Landmarks</h2>
          <p className="text-sm text-slate-500">Connectivity points, transit options, and emergency clinics near the stay.</p>
        </div>

        {/* Category Filters */}
        <ServiceCategoryFilter
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      </div>

      {filteredServices.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2">
          <Inbox className="w-8 h-8 text-slate-355" />
          <p className="text-slate-550 text-xs font-semibold">No conveniences found for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  )
}
