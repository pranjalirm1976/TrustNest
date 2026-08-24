export default function PGLoading() {
  return (
    <div className="w-full flex flex-col animate-pulse">
      {/* Hero Header Skeleton */}
      <div className="bg-white border border-slate-200 rounded-t-xl px-6 pt-8 pb-0">
        <div className="w-full mx-auto">
          {/* Identity Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-64 h-8 bg-slate-200 rounded-lg"></div>
                <div className="w-20 h-6 bg-emerald-100 rounded-full"></div>
              </div>
              <div className="w-32 h-4 bg-slate-200 rounded"></div>
            </div>

            <div className="flex items-center gap-4 sm:justify-end">
              <div className="flex flex-col items-end gap-2">
                <div className="w-24 h-3 bg-slate-200 rounded"></div>
                <div className="w-20 h-8 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-36 h-9 bg-slate-200 rounded-lg"></div>
            <div className="w-40 h-9 bg-slate-200 rounded-lg"></div>
          </div>

          {/* Horizontal Tabs */}
          <div className="w-full overflow-x-hidden">
            <div className="flex items-center gap-6 border-b border-transparent pb-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-16 h-4 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 h-32">
              <div className="flex justify-between items-start mb-4">
                <div className="w-20 h-4 bg-slate-200 rounded"></div>
                <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>
              </div>
              <div className="w-16 h-8 bg-slate-200 rounded mb-2"></div>
              <div className="w-24 h-3 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
