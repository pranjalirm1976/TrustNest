import { prisma } from '@/lib/prisma'
import Navbar from '@/components/public/Navbar'
import HeroSection from '@/components/public/HeroSection'
import FeatureHighlights from '@/components/public/FeatureHighlights'
import PopularAreas from '@/components/public/PopularAreas'
import FeaturedProperties from '@/components/public/FeaturedProperties'
import TransparencySection from '@/components/public/TransparencySection'
import Footer from '@/components/public/Footer'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Fetch featured properties with their cover images
  const properties = await prisma.property.findMany({
    include: {
      images: {
        where: {
          isCover: true,
        },
      },
    },
    take: 6,
    orderBy: {
      trustScore: 'desc',
    },
  })

  // Fallback map query if cover image is missing to query first image
  const propertiesWithFallbackImages = await Promise.all(
    properties.map(async (property) => {
      if (property.images.length > 0) {
        return property
      }
      // If no cover image found, fetch first image as fallback
      const fallbackImages = await prisma.propertyImage.findMany({
        where: {
          propertyId: property.id,
        },
        take: 1,
      })
      return {
        ...property,
        images: fallbackImages,
      }
    })
  )

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

        {/* Dynamic Property Listing */}
        <FeaturedProperties properties={propertiesWithFallbackImages} />

        {/* Score & Calculation transparency section */}
        <TransparencySection />
      </main>

      {/* Footer Navigation */}
      <Footer />
    </div>
  )
}
