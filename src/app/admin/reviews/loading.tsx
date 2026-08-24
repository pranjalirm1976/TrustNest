export default function ReviewsLoading() {
  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] min-h-[600px] animate-pulse">
      <div className="mb-6 shrink-0">
        <div className="w-56 h-8 bg-slate-200 rounded mb-2"></div>
        <div className="w-80 h-4 bg-slate-200 rounded"></div>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column Skeleton (Metrics) */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="w-16 h-12 bg-slate-200 rounded mx-auto mb-3"></div>
            <div className="w-32 h-4 bg-slate-200 rounded mx-auto mb-6"></div>
            
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-3 bg-slate-200 rounded"></div>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-200 w-1/2"></div>
                  </div>
                  <div className="w-8 h-3 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="w-32 h-4 bg-slate-200 rounded mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="w-24 h-3 bg-slate-200 rounded"></div>
                  <div className="w-12 h-3 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton (Reviews) */}
        <div className="flex-1 w-full space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                  <div>
                    <div className="w-24 h-4 bg-slate-200 rounded mb-1"></div>
                    <div className="w-16 h-3 bg-slate-200 rounded"></div>
                  </div>
                </div>
                <div className="w-20 h-4 bg-slate-200 rounded"></div>
              </div>
              <div className="w-full h-16 bg-slate-200 rounded mb-4"></div>
              <div className="w-32 h-8 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
