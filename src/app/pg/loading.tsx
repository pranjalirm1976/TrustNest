export default function PgLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfb]">
      {/* Navbar skeleton */}
      <div className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 animate-pulse">
        <div className="w-28 h-6 bg-slate-200 rounded-lg" />
        <div className="flex gap-4">
          <div className="w-16 h-5 bg-slate-200 rounded-md" />
          <div className="w-16 h-5 bg-slate-200 rounded-md" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-8 animate-pulse">
        {/* Cover gallery banner skeleton */}
        <div className="h-[300px] md:h-[450px] bg-slate-200 rounded-3xl" />

        {/* Header summary skeleton */}
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-3 flex-1">
            <div className="w-1/3 h-8 bg-slate-200 rounded-xl" />
            <div className="w-1/4 h-5 bg-slate-200 rounded-lg" />
          </div>
          <div className="w-24 h-12 bg-slate-200 rounded-2xl" />
        </div>

        {/* Tab section skeletons */}
        <div className="flex gap-3 border-b border-slate-200 pb-3">
          <div className="w-20 h-5 bg-slate-200 rounded-md" />
          <div className="w-20 h-5 bg-slate-200 rounded-md" />
          <div className="w-20 h-5 bg-slate-200 rounded-md" />
        </div>

        {/* Body columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-4">
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="h-48 bg-slate-200 rounded-2xl" />
            <div className="h-72 bg-slate-200 rounded-2xl" />
          </div>
          <div className="lg:col-span-4 h-96 bg-slate-200 rounded-3xl" />
        </div>
      </main>
    </div>
  )
}
