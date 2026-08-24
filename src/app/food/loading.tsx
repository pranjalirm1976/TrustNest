export default function FoodLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-pulse">
      <div className="w-64 h-10 bg-slate-200 rounded-lg mb-2" />
      <div className="w-96 h-5 bg-slate-200 rounded mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="w-32 h-6 bg-slate-200 rounded" />
            <div className="w-full h-44 bg-slate-100 rounded-lg" />
            <div className="space-y-2">
              <div className="w-full h-4 bg-slate-200 rounded" />
              <div className="w-3/4 h-4 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
