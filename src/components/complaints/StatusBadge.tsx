'use client'

interface StatusBadgeProps {
  status: string
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  let colors = 'bg-slate-100 text-slate-700 border-slate-200'

  switch (status) {
    case 'OPEN':
      colors = 'bg-blue-50 text-blue-700 border-blue-200/60'
      break
    case 'ASSIGNED':
      colors = 'bg-purple-50 text-purple-750 border-purple-200/60'
      break
    case 'IN_PROGRESS':
      colors = 'bg-amber-50 text-amber-700 border-amber-200/60'
      break
    case 'RESOLVED':
      colors = 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
      break
    case 'REJECTED':
      colors = 'bg-red-50 text-red-700 border-red-200/60'
      break
  }

  return (
    <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${colors}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
