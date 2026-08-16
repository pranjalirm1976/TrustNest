'use client'

import { useState, useEffect } from 'react'
import { createFoodMenu } from '@/actions/complaint.actions'
import { Soup, Loader2, CheckCircle2 } from 'lucide-react'

type Property = {
  id: string
  name: string
}

interface FoodMenuUploaderProps {
  properties: Property[]
  onSuccess: () => void
}

export default function FoodMenuUploader({
  properties,
  onSuccess,
}: FoodMenuUploaderProps) {
  const [propertyId, setPropertyId] = useState(properties[0]?.id || '')
  const [mealType, setMealType] = useState('BREAKFAST')
  const [isVeg, setIsVeg] = useState(true)
  const [itemsString, setItemsString] = useState('')
  const [imageUrl, setImageUrl] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  // Prefill default food photos based on meal type
  useEffect(() => {
    const mealPhotos: Record<string, string> = {
      BREAKFAST: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=400&q=80',
      LUNCH: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
      DINNER: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
    }
    setImageUrl(mealPhotos[mealType] || '')
  }, [mealType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    
    // Split items by semicolon and filter empty values
    const items = itemsString
      .split(';')
      .map(i => i.trim())
      .filter(i => i.length > 0)

    if (items.length === 0) {
      setErrorMsg('Please specify at least one menu item.')
      return
    }

    setIsLoading(true)
    try {
      await createFoodMenu({
        propertyId,
        mealType,
        isVeg,
        items,
        imageUrl,
      })

      setShowSuccess(true)
      setItemsString('')
      
      setTimeout(() => {
        setShowSuccess(false)
        onSuccess()
      }, 2000)

    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Failed to submit food menu log.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium-sm flex flex-col gap-5">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Soup className="w-5 h-5 text-brand-primary" />
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Log Today’s Daily Menu</h3>
      </div>

      {showSuccess && (
        <div className="bg-brand-success-light border border-brand-success/15 text-brand-success rounded-xl p-3.5 text-xs font-semibold flex items-center gap-2 animate-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Daily Menu uploaded successfully! Live on tenant feeds.</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-brand-danger-light border border-brand-danger/15 text-brand-danger rounded-xl p-3.5 text-xs font-semibold animate-in">
          {errorMsg}
        </div>
      )}

      {/* Select Property */}
      <div className="flex flex-col gap-1 text-xs font-semibold">
        <label className="text-slate-500 uppercase tracking-widest">Select Property</label>
        <select
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          required
          className="bg-[#fbfbfb] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-indigo-50 transition-all font-semibold cursor-pointer"
        >
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Meal Type */}
        <div className="flex flex-col gap-1 text-xs font-semibold">
          <label className="text-slate-500 uppercase tracking-widest">Meal Type</label>
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
            className="bg-[#fbfbfb] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-indigo-50 transition-all font-semibold cursor-pointer"
          >
            <option value="BREAKFAST">Breakfast</option>
            <option value="LUNCH">Lunch</option>
            <option value="DINNER">Dinner</option>
          </select>
        </div>

        {/* Veg Toggle */}
        <div className="flex flex-col gap-1 text-xs font-semibold">
          <label className="text-slate-500 uppercase tracking-widest">Diet Preference</label>
          <select
            value={isVeg ? 'veg' : 'nonveg'}
            onChange={(e) => setIsVeg(e.target.value === 'veg')}
            className="bg-[#fbfbfb] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-indigo-50 transition-all font-semibold cursor-pointer"
          >
            <option value="veg">Vegetarian</option>
            <option value="nonveg">Non-Vegetarian</option>
          </select>
        </div>
      </div>

      {/* Menu items list (semi-colon separated) */}
      <div className="flex flex-col gap-1 text-xs font-semibold">
        <label className="text-slate-500 uppercase tracking-widest">Menu items (Semicolon separated)</label>
        <input
          type="text"
          placeholder="e.g. Masala Dosa; Sambhar; Coconut Chutney; Tea"
          value={itemsString}
          onChange={(e) => setItemsString(e.target.value)}
          required
          className="bg-[#fbfbfb] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-indigo-50 transition-all font-semibold"
        />
      </div>

      {/* Photo URL */}
      <div className="flex flex-col gap-1 text-xs font-semibold">
        <label className="text-slate-500 uppercase tracking-widest">Meal Photo URL</label>
        <input
          type="text"
          placeholder="e.g. https://unsplash.com/photos/..."
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
          className="bg-[#fbfbfb] border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-indigo-50 transition-all font-mono"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || showSuccess || properties.length === 0}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 rounded-xl shadow-premium-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Uploading menu logs...</span>
          </>
        ) : (
          <span>Log Meal Audit</span>
        )}
      </button>

    </form>
  )
}
