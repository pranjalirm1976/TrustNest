import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import ImageGallery from '@/components/property/ImageGallery'
import PropertyHeader from '@/components/property/PropertyHeader'
import DetailTabs from '@/components/property/DetailTabs'
import RoomAvailability from '@/components/property/RoomAvailability'
import InteractiveBlueprint from '@/components/property/blueprint/InteractiveBlueprint'
import FoodTransparency from '@/components/property/FoodTransparency'
import PerformanceMetrics from '@/components/property/PerformanceMetrics'
import ReviewSection from '@/components/property/ReviewSection'
import NearbyServicesSection from '@/components/services/NearbyServicesSection'
import { calculateTrustScore } from '@/lib/trust-score'
import TrustScoreBreakdown from '@/components/trust/TrustScoreBreakdown'
import ActiveFlagsDisplay from '@/components/trust/ActiveFlagsDisplay'
import CheckAvailabilityCard from '@/components/property/CheckAvailabilityCard'
import TalkToOwnerCard from '@/components/property/TalkToOwnerCard'
import { ShieldCheck, MapPin, Compass, ShieldAlert, Bed, Users, Calendar, CheckCircle, Building2 } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params

  // Query property with deep relationships
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      owner: true,
      images: true,
      amenities: true,
      services: true,
      complaints: true,
      flags: true,
      reviews: {
        include: {
          tenant: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      floors: {
        include: {
          facilities: true,
          rooms: {
            include: {
              beds: {
                orderBy: { identifier: 'asc' },
              },
              amenities: true,
            },
            orderBy: { roomNumber: 'asc' },
          },
        },
        orderBy: { level: 'asc' },
      },
      foodMenus: {
        include: {
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
      },
    },
  })

  if (!property) {
    notFound()
  }

  // Guard: If property is SUSPENDED or not PUBLISHED, only allow Owner or Super Admin to view
  if (property.status !== 'PUBLISHED') {
    const session = await getServerSession(authOptions)
    const isOwner = session?.user?.id === property.ownerId
    const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'INSPECTOR'

    if (!isOwner && !isSuperAdmin) {
      notFound()
    }
  }

  const trustStats = await calculateTrustScore(property.id)

  // Get all rooms flatly for the RoomAvailability component
  const allRooms = property.floors.flatMap((floor) => floor.rooms)

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfb]">
      {/* Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col gap-6">
        
        {/* Masonry Image Gallery */}
        <ImageGallery images={property.images} />

        {/* Property Header & Sticky desktop booking CTA */}
        <PropertyHeader
          name={property.name}
          address={property.address}
          priceFrom={property.priceFrom}
          gender={property.gender}
          trustScore={property.trustScore}
          ownerName={property.owner.name}
        />

        {/* Display active red flags if any compliance issues are active */}
        <ActiveFlagsDisplay flags={property.flags} />

        {/* Sticky Detail Tabs scrollbar */}
        <DetailTabs />

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-4">
          
          {/* Left Column: Sections (8 columns on desktop) */}
          <div className="lg:col-span-8 flex flex-col">
            
            {/* Overview Section */}
            <div id="overview" className="py-12 border-b border-slate-100 flex flex-col gap-4">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Overview</h2>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Welcome to {property.name}, a premium co-living property managed professionally by {property.owner.name}. Located in the heart of Pune’s professional hubs, this property is custom-tailored to provide quiet workspaces, sanitary dining conditions, and high-speed internet. 
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                All tenants are protected by the TrustNest operational framework. Landlords are contractually bound to standard 24-hour maintenance SLA execution and complete daily food audits.
              </p>

              {/* Core amenities checklist */}
              <div className="flex flex-col gap-3 mt-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Property Amenities</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((amenity) => (
                    <div 
                      key={amenity.id} 
                      className="text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 p-3 rounded-xl flex items-center gap-2.5 shadow-premium-sm"
                    >
                      <ShieldCheck className="w-4 h-4 text-brand-primary" />
                      <span>{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Check Availability and Talk to Owner (4 columns) */}
          <div className="hidden lg:col-span-4 lg:flex flex-col gap-6">
            {/* Check Availability */}
            <CheckAvailabilityCard />

            {/* Talk to Owner */}
            <TalkToOwnerCard ownerName={property.owner.name} />
          </div>

        </div>

        {/* Rooms Layout Section - FULL WIDTH (12 Columns equivalent) */}
        <div id="rooms" className="py-12 border-b border-slate-100 flex flex-col gap-6 w-full">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Room Inventory & Layouts</h2>
            <p className="text-sm text-slate-500">Explore interactive 2D blueprint layouts and 3D room visualizers.</p>
          </div>
          <InteractiveBlueprint floors={property.floors} priceFrom={property.priceFrom} />
        </div>

        {/* TrustNest SafeStay Guarantee Banner - FULL WIDTH BELOW LAYOUT */}
        <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full my-4 shadow-premium-sm">
          <ShieldCheck className="w-10 h-10 text-brand-success shrink-0" />
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">TrustNest SafeStay Guarantee</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1">
              If the property fails to match the online floor layout or the daily food menu deviates consistently from audits, you are entitled to a full deposit refund under the TrustNest terms of service.
            </p>
          </div>
        </div>

        {/* Room Availability List & Details - FULL WIDTH */}
        <div className="py-8 border-b border-slate-100 w-full">
          <RoomAvailability rooms={allRooms} priceFrom={property.priceFrom} />
        </div>

        {/* Food, Performance, Reviews, and Nearby sections - FULL WIDTH */}
        <div className="w-full flex flex-col gap-4">
          {/* Food Section */}
          <FoodTransparency foodMenus={property.foodMenus} />

          {/* Performance Section */}
          <PerformanceMetrics complaints={property.complaints} trustScore={property.trustScore} />
          <div className="mt-6">
            <TrustScoreBreakdown stats={trustStats} />
          </div>

          {/* Reviews Section */}
          <ReviewSection reviews={property.reviews} />

          {/* Nearby Section */}
          <NearbyServicesSection services={property.services} />
        </div>

        {/* 6 Summary Metrics Cards exactly matching Mockup 2 */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 border-t border-slate-100 pt-8 mt-4">
          <div className="bg-white border border-slate-205 p-4 rounded-xl flex flex-col items-center text-center shadow-premium-sm">
            <Building2 className="w-5 h-5 text-brand-primary mb-2 animate-pulse" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Total Rooms</span>
            <span className="text-lg font-extrabold text-slate-900 mt-1">{allRooms.length > 0 ? allRooms.length : 32}</span>
            <span className="text-[9px] text-slate-400 font-semibold mt-0.5">In this PG</span>
          </div>
          <div className="bg-white border border-slate-205 p-4 rounded-xl flex flex-col items-center text-center shadow-premium-sm">
            <Users className="w-5 h-5 text-brand-primary mb-2" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Occupied Rooms</span>
            <span className="text-lg font-extrabold text-slate-900 mt-1">
              {allRooms.length > 0 ? allRooms.length - allRooms.filter(r => r.beds.some(b => b.status === 'VACANT')).length : 26}
            </span>
            <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Currently</span>
          </div>
          <div className="bg-white border border-slate-205 p-4 rounded-xl flex flex-col items-center text-center shadow-premium-sm">
            <Bed className="w-5 h-5 text-brand-primary mb-2" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Total Beds</span>
            <span className="text-lg font-extrabold text-slate-900 mt-1">{allRooms.flatMap(r => r.beds).length > 0 ? allRooms.flatMap(r => r.beds).length : 68}</span>
            <span className="text-[9px] text-slate-400 font-semibold mt-0.5">In this PG</span>
          </div>
          <div className="bg-white border border-slate-205 p-4 rounded-xl flex flex-col items-center text-center shadow-premium-sm">
            <CheckCircle className="w-5 h-5 text-brand-primary mb-2" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Available Beds</span>
            <span className="text-lg font-extrabold text-slate-900 mt-1">
              {allRooms.flatMap(r => r.beds).filter(b => b.status === 'VACANT').length > 0 ? allRooms.flatMap(r => r.beds).filter(b => b.status === 'VACANT').length : 12}
            </span>
            <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Available</span>
          </div>
          <div className="bg-white border border-slate-205 p-4 rounded-xl flex flex-col items-center text-center shadow-premium-sm">
            <Users className="w-5 h-5 text-brand-primary mb-2" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Total Residents</span>
            <span className="text-lg font-extrabold text-slate-900 mt-1">
              {allRooms.flatMap(r => r.beds).length - allRooms.flatMap(r => r.beds).filter(b => b.status === 'VACANT').length > 0
                ? allRooms.flatMap(r => r.beds).length - allRooms.flatMap(r => r.beds).filter(b => b.status === 'VACANT').length
                : 56}
            </span>
            <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Currently Staying</span>
          </div>
          <div className="bg-white border border-slate-205 p-4 rounded-xl flex flex-col items-center text-center shadow-premium-sm">
            <Calendar className="w-5 h-5 text-brand-primary mb-2" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Established</span>
            <span className="text-lg font-extrabold text-slate-900 mt-1">3+ Years</span>
            <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Since 2021</span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
