export default function SearchLoading() {
  return (
    <div className="h-screen w-full flex flex-col bg-[#fbfbfb]">
      {/* Header bar skeleton */}
      <div className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0 animate-pulse">
        <div className="w-32 h-6 bg-slate-200 rounded-lg" />
        <div className="w-1/3 h-9 bg-slate-200 rounded-xl" />
        <div className="w-20 h-8 bg-slate-200 rounded-lg" />
      </div>

      {/* Main split dashboard view */}
      <div className="flex-1 flex overflow-hidden animate-pulse">
        
        {/* Left Side: Cards vertical grid (8 columns/large scroll section) */}
        <div className="w-full lg:w-[58%] h-full overflow-y-auto p-6 flex flex-col gap-6">
          <div className="w-36 h-5 bg-slate-200 rounded-md" />
          <div className="flex gap-2.5">
            <div className="w-16 h-7 bg-slate-200 rounded-full" />
            <div className="w-16 h-7 bg-slate-200 rounded-full" />
            <div className="w-16 h-7 bg-slate-200 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div className="h-72 bg-slate-200 rounded-2xl" />
            <div className="h-72 bg-slate-200 rounded-2xl" />
            <div className="h-72 bg-slate-200 rounded-2xl" />
            <div className="h-72 bg-slate-200 rounded-2xl" />
          </div>
        </div>

        {/* Right Side: Map layout skeleton */}
        <div className="hidden lg:block w-[42%] h-full bg-slate-200" />

      </div>
    </div>
  )
}
