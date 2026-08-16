export default function TenantLoading() {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse">
      {/* Header title */}
      <div className="flex flex-col gap-2">
        <div className="w-48 h-7 bg-slate-200 rounded-lg" />
        <div className="w-72 h-4 bg-slate-200 rounded-md" />
      </div>

      {/* Main card */}
      <div className="h-44 bg-slate-200 rounded-2xl" />

      {/* Grid widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-48 bg-slate-200 rounded-2xl" />
        <div className="h-48 bg-slate-200 rounded-2xl" />
      </div>

      {/* History table */}
      <div className="h-64 bg-slate-200 rounded-2xl" />
    </div>
  )
}
