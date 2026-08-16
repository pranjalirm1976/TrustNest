'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PgError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#fbfbfb] flex items-center justify-center p-6 text-center">
      <div className="bg-white border border-slate-205 p-8 rounded-3xl max-w-md shadow-premium-lg flex flex-col items-center gap-5">
        <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-brand-danger" />
        </div>
        
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Failed to load property details</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed font-semibold">
            We encountered a database error or network issue assembling this property details ledger.
          </p>
        </div>

        <button
          onClick={reset}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-premium-sm transition-all cursor-pointer flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reload Details</span>
        </button>
      </div>
    </div>
  )
}
