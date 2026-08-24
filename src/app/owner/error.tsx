'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function OwnerError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Owner Portal Error:', error)
  }, [error])

  return (
    <div className="bg-white border border-slate-200 p-8 rounded-2xl max-w-md shadow-sm text-center flex flex-col items-center gap-5 mx-auto mt-12">
      <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-red-600" />
      </div>
      
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Owner Portal Error</h2>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          Failed to load owner data. Please try again.
        </p>
      </div>

      <button
        onClick={reset}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Reload Portal</span>
      </button>
    </div>
  )
}
