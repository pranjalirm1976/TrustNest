export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-8 w-full animate-pulse">
      {/* Header title */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex flex-col gap-2">
          <div className="w-56 h-7 bg-slate-200 rounded-lg" />
          <div className="w-80 h-4 bg-slate-200 rounded-md" />
        </div>
        <div className="w-28 h-10 bg-slate-200 rounded-xl" />
      </div>

      {/* Metrics widgets grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="h-28 bg-slate-200 rounded-2xl" />
        <div className="h-28 bg-slate-200 rounded-2xl" />
        <div className="h-28 bg-slate-200 rounded-2xl" />
        <div className="h-28 bg-slate-200 rounded-2xl" />
      </div>

      {/* Primary columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        <div className="lg:col-span-7 h-96 bg-slate-200 rounded-2xl" />
        <div className="lg:col-span-5 h-96 bg-slate-200 rounded-2xl" />
      </div>
    </div>
  )
}
