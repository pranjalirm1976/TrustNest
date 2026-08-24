'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function FoodError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Food Transparency Error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 p-8 rounded-2xl max-w-md w-full shadow-sm text-center flex flex-col items-center gap-5">
        <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Failed to load food menus</h2>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Could not retrieve daily food menus. Please try again.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full">
          <button
            onClick={reset}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
