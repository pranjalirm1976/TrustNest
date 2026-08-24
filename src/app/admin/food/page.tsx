import { Metadata } from 'next'
import FoodClient from '@/components/admin/FoodClient'

export const metadata: Metadata = {
  title: 'Food & Menu Management | TrustNest',
  description: 'Manage daily and weekly food menus and photos for transparency.',
}

export default function FoodPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Food & Menu</h1>
        <p className="text-sm text-slate-500 mt-1">Publish daily menus with real photos and plan your weekly kitchen schedule.</p>
      </div>
      
      <FoodClient />
    </div>
  )
}
