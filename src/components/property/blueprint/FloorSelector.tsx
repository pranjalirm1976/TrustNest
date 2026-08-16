'use client'

import { Layers } from 'lucide-react'

type Floor = {
  id: string
  name: string
  level: number
}

interface FloorSelectorProps {
  floors: Floor[]
  activeFloorId: string
  setActiveFloorId: (id: string) => void
}

export default function FloorSelector({
  floors,
  activeFloorId,
  setActiveFloorId,
}: FloorSelectorProps) {
  // Sort floors: level 0 (Ground), level 1 (First), etc.
  const sortedFloors = [...floors].sort((a, b) => a.level - b.level)

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 w-full">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
          <Layers className="w-4 h-4 text-brand-primary" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Floor Plan Layout</h3>
          <p className="text-xs text-slate-400">Select a floor to view room occupancy blueprint.</p>
        </div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40 self-start sm:self-auto">
        {sortedFloors.map((floor) => (
          <button
            key={floor.id}
            onClick={() => setActiveFloorId(floor.id)}
            className={`text-xs font-bold px-4 py-2.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeFloorId === floor.id
                ? 'bg-white text-brand-primary shadow-premium-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {floor.name}
          </button>
        ))}
      </div>
    </div>
  )
}
