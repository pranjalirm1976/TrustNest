export default function OwnerLoading() {
  return (
    <div className="flex flex-col gap-6 w-full pb-10 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="w-56 h-8 bg-slate-200 rounded-lg" />
        <div className="w-32 h-8 bg-slate-200 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="w-24 h-4 bg-slate-200 rounded mb-4" />
            <div className="w-20 h-8 bg-slate-200 rounded" />
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-80 flex flex-col justify-center">
        <div className="w-full h-full bg-slate-100 rounded-lg" />
      </div>
    </div>
  )
}
