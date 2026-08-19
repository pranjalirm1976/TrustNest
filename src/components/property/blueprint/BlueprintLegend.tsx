'use client'

export default function BlueprintLegend() {
  const legendItems = [
    { label: 'Available', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { label: 'Occupied', bg: 'bg-red-50 border-red-200 text-red-700' },
    { label: 'Maintenance', bg: 'bg-purple-50 border-purple-200 text-purple-700' },
    { label: 'Common Area', bg: 'bg-blue-50 border-blue-200 text-blue-700' },
    { label: 'Facility', bg: 'bg-amber-50 border-amber-200 text-amber-700' },
    { label: 'Stairs / Lift / Exit', bg: 'bg-slate-50 border-slate-200 text-slate-500' },
  ]

  return (
    <div className="flex flex-col gap-2.5 bg-slate-50/70 border border-slate-150 p-4 rounded-xl">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-200 pb-1.5 mb-1">
        Legend
      </h4>
      <div className="flex flex-col gap-2">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5 text-[10px] font-semibold text-slate-650">
            <div className={`w-3.5 h-3.5 border rounded ${item.bg}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
