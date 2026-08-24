export default function VerificationLoading() {
  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-140px)] items-center pb-12 animate-pulse">
      <div className="w-full max-w-3xl mb-6 shrink-0 mt-2">
        <div className="w-64 h-8 bg-slate-200 rounded mb-2"></div>
        <div className="w-80 h-4 bg-slate-200 rounded"></div>
      </div>
      
      <div className="w-full max-w-3xl flex-1 flex flex-col">
        <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-8 shadow-sm">
          
          {/* Status Hero Skeleton */}
          <div className="flex flex-col items-center justify-center border-b border-slate-100 pb-8 mb-8">
            <div className="w-32 h-10 bg-slate-200 rounded-full mb-3"></div>
            <div className="w-48 h-4 bg-slate-200 rounded"></div>
          </div>

          <div className="flex flex-col md:flex-row gap-12">
            {/* Timeline Skeleton */}
            <div className="flex-1 space-y-6 relative">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 bg-slate-200 rounded-full shrink-0"></div>
                  <div className="flex-1 pt-1 space-y-2">
                    <div className="w-32 h-4 bg-slate-200 rounded"></div>
                    <div className="w-48 h-3 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Document Checklist Skeleton */}
            <div className="flex-1 space-y-3">
              <div className="w-40 h-5 bg-slate-200 rounded mb-4"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-full h-16 bg-slate-200 rounded-lg"></div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex gap-3">
            <div className="w-32 h-10 bg-slate-200 rounded-lg"></div>
            <div className="w-32 h-10 bg-slate-200 rounded-lg"></div>
          </div>

        </div>
      </div>
    </div>
  )
}
