import { prisma } from '@/lib/prisma'
import Navbar from '@/components/public/Navbar'
import HeroSection from '@/components/public/HeroSection'
import FeatureHighlights from '@/components/public/FeatureHighlights'
import PopularAreas from '@/components/public/PopularAreas'
import FeaturedProperties from '@/components/public/FeaturedProperties'
import TransparencySection from '@/components/public/TransparencySection'
import Footer from '@/components/public/Footer'
import { calculatePGAvailability } from '@/lib/availability'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Fetch featured properties with images, floors, rooms, beds (only PUBLISHED)
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
    take: 8,
    orderBy: [
      { createdAt: 'desc' },
      { trustScore: 'desc' },
    ],
  })

  // Format properties with calculated availability and fallback cover photos
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
    <div className="min-h-screen flex flex-col bg-[#fbfbfb]">
      {/* Header Navigation */}
      <Navbar />

      <main className="flex-1 flex flex-col">
        {/* Hero Area */}
        <HeroSection />

        {/* Brand Highlights */}
        <FeatureHighlights />

        {/* Popular Locations */}
        <PopularAreas />

        {/* Dynamic Property Listing with real availability */}
        <FeaturedProperties properties={enhancedProperties as any} />

        {/* Score & Calculation transparency section */}
        <TransparencySection />
      </main>

      {/* Footer Navigation */}
      <Footer />
    </div>
  )
}
