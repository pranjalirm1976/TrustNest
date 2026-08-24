export default function PerformanceLoading() {
  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] min-h-[600px] animate-pulse">
      <div className="mb-6 shrink-0">
        <div className="w-64 h-8 bg-slate-200 rounded mb-2"></div>
        <div className="w-80 h-4 bg-slate-200 rounded"></div>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col space-y-6">
        {/* Top bar skeleton */}
        <div className="flex justify-end gap-3">
          <div className="w-32 h-10 bg-slate-200 rounded-lg"></div>
          <div className="w-48 h-10 bg-slate-200 rounded-lg"></div>
        </div>

        {/* Hero Score Skeleton */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="w-32 h-32 bg-slate-200 rounded-full"></div>
          <div className="flex-1 w-full space-y-4">
            <div className="w-48 h-6 bg-slate-200 rounded"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-24 h-4 bg-slate-200 rounded"></div>
                <div className="flex-1 h-3 bg-slate-200 rounded"></div>
                <div className="w-12 h-4 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* 2-column Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-72">
            <div className="w-40 h-5 bg-slate-200 rounded mb-6"></div>
            <div className="w-full h-40 bg-slate-200 rounded"></div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-72">
            <div className="w-40 h-5 bg-slate-200 rounded mb-6"></div>
            <div className="w-full h-40 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
