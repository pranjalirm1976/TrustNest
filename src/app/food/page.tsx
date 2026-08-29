import { prisma } from '@/lib/prisma'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import GlobalFoodFeed from '@/components/food/GlobalFoodFeed'
import { Soup } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface FoodPageProps {
  searchParams: Promise<{ propertyId?: string; pg?: string }>
}

export default async function FoodPage({ searchParams }: FoodPageProps) {
  const { propertyId, pg } = await searchParams
  const filterPropertyId = propertyId || pg

  // Fetch food menus ordered by date, optionally filtered by property
  const foodMenus = await prisma.foodMenu.findMany({
    where: filterPropertyId ? { propertyId: filterPropertyId } : undefined,
    include: {
      property: true,
      images: true,
      ratings: {
        include: {
          tenant: true,
        },
      },
      items: true,
    },
    orderBy: {
      date: 'desc',
    },
  })

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfb]">
      {/* Navbar */}
      <Navbar />

      {/* Main Feed Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-8">
        
        {/* Header Title */}
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
            <Soup className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Daily Food Transparency Feed</h1>
            <p className="text-sm text-slate-500 mt-1 leading-normal">
              Chronological feed of live PG meal photos and verified resident satisfaction scores across Pune.
            </p>
          </div>
        </div>

        {/* Global Chronological Food Feed */}
        <GlobalFoodFeed initialMenus={foodMenus} />

      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
