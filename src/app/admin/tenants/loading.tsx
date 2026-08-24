export default function ResidentsLoading() {
  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] min-h-[600px] animate-pulse">
      <div className="mb-6 shrink-0">
        <div className="w-48 h-8 bg-slate-200 rounded mb-2"></div>
        <div className="w-72 h-4 bg-slate-200 rounded"></div>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Filter Bar Skeleton */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-64 h-10 bg-slate-200 rounded-lg"></div>
            <div className="w-24 h-10 bg-slate-200 rounded-lg"></div>
            <div className="w-24 h-10 bg-slate-200 rounded-lg"></div>
            <div className="w-24 h-10 bg-slate-200 rounded-lg"></div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-24 h-10 bg-slate-200 rounded-lg"></div>
            <div className="w-32 h-10 bg-slate-200 rounded-lg"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4"><div className="w-24 h-4 bg-slate-200 rounded"></div></th>
                  <th className="px-6 py-4"><div className="w-16 h-4 bg-slate-200 rounded"></div></th>
                  <th className="px-6 py-4"><div className="w-12 h-4 bg-slate-200 rounded"></div></th>
                  <th className="px-6 py-4"><div className="w-20 h-4 bg-slate-200 rounded"></div></th>
                  <th className="px-6 py-4"><div className="w-24 h-4 bg-slate-200 rounded"></div></th>
                  <th className="px-6 py-4"><div className="w-20 h-4 bg-slate-200 rounded"></div></th>
                  <th className="px-6 py-4"><div className="w-20 h-4 bg-slate-200 rounded"></div></th>
                </tr>
              </thead>
              <tbody>
                {[...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-6 py-4"><div className="w-32 h-4 bg-slate-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-10 h-4 bg-slate-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-8 h-4 bg-slate-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-28 h-4 bg-slate-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-20 h-4 bg-slate-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-16 h-4 bg-slate-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="w-16 h-6 bg-slate-200 rounded-full"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
