import Link from 'next/link'
import { Building2, Search, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
        <Building2 className="w-8 h-8 text-indigo-600" />
      </div>

      <span className="text-xs font-bold font-mono text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full uppercase tracking-wider mb-3">
        404 • Page or Property Not Found
      </span>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
        Looking for a PG or Stay?
      </h1>
      
      <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
        The property URL you visited may have been updated, re-indexed, or removed. You can explore all available verified PGs on our live search map.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs sm:max-w-none justify-center">
        <Link
          href="/search"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>Explore Verified PGs</span>
        </Link>

        <Link
          href="/"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Go to Homepage</span>
        </Link>
      </div>
    </div>
  )
}
