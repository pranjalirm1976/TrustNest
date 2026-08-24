export default function ComplaintsLoading() {
  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] min-h-[600px] animate-pulse">
      <div className="mb-6 shrink-0">
        <div className="w-56 h-8 bg-slate-200 rounded mb-2"></div>
        <div className="w-80 h-4 bg-slate-200 rounded"></div>
      </div>
      
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 h-24 shadow-sm flex flex-col justify-between">
              <div className="w-24 h-4 bg-slate-200 rounded"></div>
              <div className="w-12 h-8 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Filters & Table Skeleton */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-24 h-9 bg-slate-200 rounded-lg"></div>
              <div className="w-24 h-9 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4"><div className="w-16 h-4 bg-slate-200 rounded"></div></th>
                    <th className="px-6 py-4"><div className="w-32 h-4 bg-slate-200 rounded"></div></th>
                    <th className="px-6 py-4"><div className="w-20 h-4 bg-slate-200 rounded"></div></th>
                    <th className="px-6 py-4"><div className="w-24 h-4 bg-slate-200 rounded"></div></th>
                    <th className="px-6 py-4"><div className="w-20 h-4 bg-slate-200 rounded"></div></th>
                    <th className="px-6 py-4"><div className="w-32 h-4 bg-slate-200 rounded"></div></th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(6)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="px-6 py-4"><div className="w-12 h-4 bg-slate-200 rounded"></div></td>
                      <td className="px-6 py-4">
                        <div className="w-24 h-4 bg-slate-200 rounded mb-1"></div>
                        <div className="w-16 h-3 bg-slate-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4"><div className="w-20 h-6 bg-slate-200 rounded-full"></div></td>
                      <td className="px-6 py-4"><div className="w-16 h-4 bg-slate-200 rounded"></div></td>
                      <td className="px-6 py-4"><div className="w-20 h-6 bg-slate-200 rounded-full"></div></td>
                      <td className="px-6 py-4"><div className="w-28 h-6 bg-slate-200 rounded"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
