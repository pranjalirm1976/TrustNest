import { prisma } from '@/lib/prisma'
import SearchClient from '@/components/search/SearchClient'

export const dynamic = 'force-dynamic'

export default async function SearchPage() {
  // Query all properties with their images and amenities
  const properties = await prisma.property.findMany({
    include: {
      images: true,
      amenities: true,
    },
    orderBy: {
      trustScore: 'desc',
    },
  })

  return <SearchClient initialProperties={properties} />
}
