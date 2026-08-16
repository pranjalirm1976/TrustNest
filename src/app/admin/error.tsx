'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="bg-white border border-slate-200/80 p-8 rounded-3xl max-w-md shadow-premium-sm text-center flex flex-col items-center gap-5 mx-auto mt-12">
      <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-brand-danger" />
      </div>
      
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Operator Dashboard error</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed font-semibold">
          Failed to fetch property inventories, active stay allocations or finance sheets.
        </p>
      </div>

      <button
        onClick={reset}
        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-premium-sm transition-all cursor-pointer flex items-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Reload Dashboard</span>
      </button>
    </div>
  )
}
