'use client'

import { useState, useMemo } from 'react'
import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import SearchHeader from './SearchHeader'
import AdvancedFilters from './AdvancedFilters'
import PropertyListCard from './PropertyListCard'
import MapLayout from './MapLayout'
import { ShieldAlert, Map, List } from 'lucide-react'

type PropertyImage = {
  id: string
  url: string
}

type Property = {
  id: string
  name: string
  address: string
  priceFrom: number
  gender: string
  trustScore: number
  latitude: number
  longitude: number
  images: PropertyImage[]
  amenities: { id: string; name: string }[]
}

interface SearchClientProps {
  initialProperties: Property[]
}

export default function SearchClient({ initialProperties }: SearchClientProps) {
  // Search state hooks
  const [query, setQuery] = useState('')
  const [gender, setGender] = useState('')
  const [budgetRange, setBudgetRange] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [minScore, setMinScore] = useState(0)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  
  // Highlighting property hover states
  const [highlightedPropertyId, setHighlightedPropertyId] = useState<string | null>(null)
  
  // Mobile responsive view toggle (false = show list, true = show map)
  const [showMapOnMobile, setShowMapOnMobile] = useState(false)

  // Toggle single amenity select
  const toggleAmenity = (name: string) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== name))
    } else {
      setSelectedAmenities([...selectedAmenities, name])
    }
  }

  // Reset all filters
  const resetFilters = () => {
    setQuery('')
    setGender('')
    setBudgetRange('')
    setMinScore(0)
    setSelectedAmenities([])
  }

  // Filter properties client-side dynamically
  const filteredProperties = useMemo(() => {
    return initialProperties.filter((property) => {
      // 1. Text Search matching name, address, landmarks
      if (query) {
        const queryLower = query.toLowerCase()
        const matchName = property.name.toLowerCase().includes(queryLower)
        const matchAddress = property.address.toLowerCase().includes(queryLower)
        if (!matchName && !matchAddress) return false
      }

      // 2. Gender matching
      if (gender) {
        if (property.gender !== gender) return false
      }

      // 3. Budget Range matching
      if (budgetRange) {
        if (budgetRange === 'low' && property.priceFrom >= 8000) return false
        if (budgetRange === 'mid' && (property.priceFrom < 8000 || property.priceFrom > 12000)) return false
        if (budgetRange === 'high' && property.priceFrom <= 12000) return false
      }

      // 4. Minimum Trust Score
      if (minScore > 0) {
        if (property.trustScore < minScore) return false
      }

      // 5. Selected Amenities check
      if (selectedAmenities.length > 0) {
        const propAmenityNames = property.amenities.map(a => a.name)
        const hasAllSelected = selectedAmenities.every(a => propAmenityNames.includes(a))
        if (!hasAllSelected) return false
      }

      return true
    })
  }, [initialProperties, query, gender, budgetRange, minScore, selectedAmenities])

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfb]">
      {/* Header */}
      <Navbar />

      {/* Main Search Panel - Split Screen Layout */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col gap-6">
        
        {/* Sticky Search Header controls */}
        <SearchHeader
          query={query}
          setQuery={setQuery}
          gender={gender}
          setGender={setGender}
          budgetRange={budgetRange}
          setBudgetRange={setBudgetRange}
          showAdvanced={showAdvanced}
          setShowAdvanced={setShowAdvanced}
        />

        {/* Slide-out Advanced filters box */}
        {showAdvanced && (
          <AdvancedFilters
            minScore={minScore}
            setMinScore={setMinScore}
            selectedAmenities={selectedAmenities}
            toggleAmenity={toggleAmenity}
            onClear={resetFilters}
          />
        )}

        {/* Search Results Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1 min-h-[500px]">
          
          {/* LEFT PANEL: PG Cards (6 columns on lg screens) */}
          <div className={`lg:col-span-7 flex flex-col gap-6 h-full overflow-y-auto pr-1 scrollbar-thin ${
            showMapOnMobile ? 'hidden lg:flex' : 'flex'
          }`}>
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              <span>{filteredProperties.length} Properties found</span>
              {selectedAmenities.length > 0 && <span>Filtered by amenities</span>}
            </div>

            {filteredProperties.length === 0 ? (
              <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center gap-4">
                <ShieldAlert className="w-12 h-12 text-slate-300" />
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">No Matching PGs</h3>
                  <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                    Try adjusting your budget filter, lowering your trust score threshold, or search in another area.
                  </p>
                </div>
                <button
                  onClick={resetFilters}
                  className="bg-brand-primary text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-premium hover:bg-brand-primary-dark transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {filteredProperties.map((property) => (
                  <PropertyListCard
                    key={property.id}
                    property={property}
                    isHighlighted={highlightedPropertyId === property.id}
                    onMouseEnter={() => setHighlightedPropertyId(property.id)}
                    onMouseLeave={() => setHighlightedPropertyId(null)}
                    onFocusMap={() => {
                      setHighlightedPropertyId(property.id)
                      setShowMapOnMobile(true) // Switch to map view on mobile
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT PANEL: Map Layout (5 columns on lg screens, sticky position) */}
          <div className={`lg:col-span-5 lg:sticky lg:top-48 z-10 w-full h-[500px] lg:h-[calc(100vh-14rem)] ${
            showMapOnMobile ? 'block' : 'hidden lg:block'
          }`}>
            <MapLayout
              properties={filteredProperties}
              highlightedPropertyId={highlightedPropertyId}
              setHighlightedPropertyId={setHighlightedPropertyId}
            />
          </div>
        </div>

        {/* Floating Mobile Toggle Button */}
        <button
          onClick={() => setShowMapOnMobile(!showMapOnMobile)}
          className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-bold text-xs px-5 py-3 rounded-full shadow-premium flex items-center gap-2 z-50 cursor-pointer hover:bg-slate-800"
        >
          {showMapOnMobile ? (
            <>
              <List className="w-4 h-4" />
              <span>Show List View</span>
            </>
          ) : (
            <>
              <Map className="w-4 h-4" />
              <span>Show Map View</span>
            </>
          )}
        </button>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
