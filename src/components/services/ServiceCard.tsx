'use client'

import { Utensils, HeartPulse, Bus, Shirt, Compass, Phone, Navigation } from 'lucide-react'

type Service = {
  id: string
  name: string
  type: string
  distance: string
}

interface ServiceCardProps {
  service: Service
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'FOOD':
        return <Utensils className="w-5 h-5 text-amber-600" />
      case 'MEDICAL':
        return <HeartPulse className="w-5 h-5 text-brand-danger" />
      case 'TRANSPORT':
        return <Bus className="w-5 h-5 text-blue-600" />
      case 'LAUNDRY':
        return <Shirt className="w-5 h-5 text-indigo-600" />
      default:
        return <Compass className="w-5 h-5 text-slate-500" />
    }
  }

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'FOOD':
        return 'bg-amber-50 border-amber-100'
      case 'MEDICAL':
        return 'bg-red-50 border-red-100'
      case 'TRANSPORT':
        return 'bg-blue-50 border-blue-100'
      case 'LAUNDRY':
        return 'bg-indigo-50 border-indigo-100'
      default:
        return 'bg-slate-50 border-slate-100'
    }
  }

  return (
    <div className="bg-white border border-slate-205 p-4 rounded-xl shadow-premium-sm hover:shadow-premium transition-all duration-200 flex items-center justify-between gap-4 group">
      
      {/* Icon & Name */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-10 h-10 border rounded-xl flex items-center justify-center shrink-0 ${getBadgeColor(service.type)}`}>
          {getIcon(service.type)}
        </div>
        
        <div className="min-w-0 flex flex-col gap-0.5">
          <h4 className="text-sm font-extrabold text-slate-900 truncate pr-1">{service.name}</h4>
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
            <span>{service.type}</span>
            <span>•</span>
            <span>{service.distance} away</span>
          </div>
        </div>
      </div>

      {/* Action buttons (Call/Directions) */}
      <div className="flex gap-2 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => alert(`Simulated call to ${service.name}`)}
          className="p-2 border border-slate-200 hover:border-slate-300 bg-white rounded-xl shadow-premium-sm text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          title="Call Service"
        >
          <Phone className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => alert(`Opening navigation for ${service.name}`)}
          className="p-2 border border-slate-200 hover:border-slate-300 bg-white rounded-xl shadow-premium-sm text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          title="Get Directions"
        >
          <Navigation className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  )
}
