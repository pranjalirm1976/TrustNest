export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-pulse">
      
      {/* Alert banner skeleton */}
      <div className="w-full h-20 bg-slate-200 rounded-xl" />

      {/* Select Property skeleton */}
      <div className="flex justify-end">
        <div className="w-40 h-10 bg-slate-200 rounded-lg" />
      </div>

      {/* Top Metrics Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-24 h-4 bg-slate-200 rounded" />
              <div className="w-9 h-9 bg-slate-100 rounded-lg" />
            </div>
            <div className="w-16 h-8 bg-slate-200 rounded mb-2" />
            <div className="flex justify-between">
              <div className="w-20 h-3 bg-slate-200 rounded" />
              <div className="w-16 h-3 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* PG Performance Block skeleton */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-48 flex flex-col justify-center gap-6">
        <div className="w-48 h-6 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-24 h-4 bg-slate-200 rounded mb-3" />
              <div className="w-20 h-10 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Split skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-64" />
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-40" />
        </div>
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-64" />
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm h-40" />
        </div>
      </div>
      
    </div>
  )
}
