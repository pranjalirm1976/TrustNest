import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import SearchClient from '@/components/search/SearchClient'
import { calculatePGAvailability } from '@/lib/availability'

export const dynamic = 'force-dynamic'

export default async function SearchPage() {
  // Query only verified & published properties with images, amenities, and floor/room inventory
  const properties = await prisma.property.findMany({
    where: {
      status: 'PUBLISHED',
    },
    include: {
      images: true,
      amenities: true,
      floors: {
        include: {
          rooms: {
            include: {
              beds: true,
            },
          },
        },
      },
    },
    orderBy: {
      trustScore: 'desc',
    },
  })

  // Enhance properties with real computed availability
  const enhancedProperties = properties.map((property) => {
    const availability = calculatePGAvailability(property)
    return {
      ...property,
      availabilityStatus: availability.status,
      availableBeds: availability.availableBeds,
      totalBeds: availability.totalBeds,
      occupancyPercentage: availability.occupancyPercentage,
    }
  })

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fbfbfb] flex items-center justify-center text-sm font-semibold text-slate-500">Loading verified stays...</div>}>
      <SearchClient initialProperties={enhancedProperties as any} />
    </Suspense>
  )
}
