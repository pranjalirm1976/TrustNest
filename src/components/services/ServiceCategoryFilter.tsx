'use client'

interface ServiceCategoryFilterProps {
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
}

export default function ServiceCategoryFilter({
  selectedCategory,
  setSelectedCategory,
}: ServiceCategoryFilterProps) {
  const categories = [
    { id: '', name: 'All' },
    { id: 'FOOD', name: 'Food / Cafes' },
    { id: 'MEDICAL', name: 'Medical / Clinics' },
    { id: 'TRANSPORT', name: 'Transport / Transit' },
    { id: 'LAUNDRY', name: 'Laundry / Dry Cleaning' },
  ]

  return (
    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40 overflow-x-auto scrollbar-none w-full max-w-max">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setSelectedCategory(cat.id)}
          className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            selectedCategory === cat.id
              ? 'bg-white text-slate-900 shadow-premium-sm font-extrabold'
              : 'text-slate-500 hover:text-slate-950'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
