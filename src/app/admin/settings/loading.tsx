export default function SettingsLoading() {
  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] min-h-[600px] pb-8 animate-pulse">
      <div className="mb-6 shrink-0 mt-2">
        <div className="w-48 h-8 bg-slate-200 rounded mb-2"></div>
        <div className="w-80 h-4 bg-slate-200 rounded"></div>
      </div>
      
      <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col lg:flex-row overflow-hidden">
        
        {/* Sidebar Tabs Skeleton */}
        <div className="lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/50 p-4">
          <div className="flex lg:flex-col gap-2 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-32 lg:w-full h-10 bg-slate-200 rounded-lg shrink-0"></div>
            ))}
          </div>
        </div>

        {/* Content Area Skeleton */}
        <div className="flex-1 p-6 md:p-10 bg-white flex flex-col">
          <div className="w-48 h-6 bg-slate-200 rounded mb-2"></div>
          <div className="w-72 h-4 bg-slate-200 rounded mb-10"></div>
          
          <div className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="w-24 h-4 bg-slate-200 rounded mb-2"></div>
                <div className="w-full h-10 bg-slate-200 rounded-lg"></div>
              </div>
              <div>
                <div className="w-24 h-4 bg-slate-200 rounded mb-2"></div>
                <div className="w-full h-10 bg-slate-200 rounded-lg"></div>
              </div>
            </div>
            
            <div>
              <div className="w-24 h-4 bg-slate-200 rounded mb-2"></div>
              <div className="w-full h-10 bg-slate-200 rounded-lg"></div>
            </div>
            
            <div>
              <div className="w-24 h-4 bg-slate-200 rounded mb-2"></div>
              <div className="w-full h-24 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
          
          <div className="mt-auto pt-8 flex justify-end gap-3">
            <div className="w-24 h-10 bg-slate-200 rounded-lg"></div>
            <div className="w-32 h-10 bg-slate-200 rounded-lg"></div>
          </div>
        </div>

      </div>
    </div>
  )
}
