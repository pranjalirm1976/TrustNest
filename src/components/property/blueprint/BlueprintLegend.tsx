'use client'

export default function BlueprintLegend() {
  const legendItems = [
    { label: 'Available (Vacant)', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { label: 'Occupied (Full)', bg: 'bg-red-50 border-red-200 text-red-700' },
    { label: 'Maintenance', bg: 'bg-purple-50 border-purple-200 text-purple-700' },
    { label: 'Common Area', bg: 'bg-slate-50 border-slate-200 text-slate-550' },
    { label: 'Service / Facility', bg: 'bg-blue-50 border-blue-200 text-blue-700' },
  ]

  return (
    <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 pb-2">
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div className={`w-3.5 h-3.5 border rounded ${item.bg}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
