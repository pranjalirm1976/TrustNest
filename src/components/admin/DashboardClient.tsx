'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import OperationalStats from './OperationalStats'
import FoodMenuUploader from './FoodMenuUploader'
import ComplaintManagerList from './ComplaintManagerList'
import TrustScoreBreakdown from '@/components/trust/TrustScoreBreakdown'
import ActiveFlagsDisplay from '@/components/trust/ActiveFlagsDisplay'
import { Building2, Soup, ShieldAlert, Award } from 'lucide-react'

type CommentUser = {
  name: string
  role: string
}

type Comment = {
  id: string
  comment: string
  createdAt: Date
  author: CommentUser
}

type Complaint = {
  id: string
  title: string
  description: string
  category: string
  status: string
  severity: string
  createdAt: Date
  slaDeadline: Date
  resolvedAt: Date | null
  tenant: {
    name: string
  }
  property: {
    name: string
  }
  comments: Comment[]
}

type PropertyDetail = {
  propertyId: string
  propertyName: string
  breakdown: {
    score: number
    reviewsAvg: number
    foodAvg: number
    totalReviews: number
    totalFoodRatings: number
    slaBreaches: number
    activeFlags: number
    reviewImpact: number
    foodImpact: number
    slaPenalty: number
    flagPenalty: number
  }
  flags: {
    id: string
    type: string
    reason: string
    isActive: boolean
  }[]
}

interface DashboardClientProps {
  properties: { id: string; name: string }[]
  complaints: Complaint[]
  stats: {
    totalResidents: number
    availableBeds: number
    monthlyCollection: number
    openComplaints: number
    activeViolations: number
  }
  propertyDetails: PropertyDetail[]
}

export default function DashboardClient({
  properties,
  complaints,
  stats,
  propertyDetails,
}: DashboardClientProps) {
  const router = useRouter()
  const [showUploader, setShowUploader] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id || '')

  const handleUpdate = () => {
    router.refresh()
  }

  const activePropertyDetail = propertyDetails.find(
    (pd) => pd.propertyId === selectedPropertyId
  )

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Top dashboard header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Overview Dashboard</h2>
          <p className="text-slate-500 text-xs mt-0.5">Real-time PG operational metrics, active stay occupancy and ticket escalations.</p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Select Property focus */}
          {properties.length > 1 && (
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="bg-white border border-slate-205 hover:border-slate-350 text-xs font-bold text-slate-700 px-4 py-2.5 rounded-xl shadow-premium-sm cursor-pointer focus:outline-none"
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowUploader(!showUploader)}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl shadow-premium transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              showUploader
                ? 'bg-slate-100 hover:bg-slate-205 text-slate-700'
                : 'bg-brand-primary hover:bg-brand-primary-dark text-white'
            }`}
          >
            <Soup className="w-4 h-4" />
            <span>{showUploader ? 'View Complaint Control' : 'Log Today\'s Menu'}</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Widget cards */}
      <OperationalStats
        totalResidents={stats.totalResidents}
        availableBeds={stats.availableBeds}
        monthlyCollection={stats.monthlyCollection}
        openComplaints={stats.openComplaints}
        activeViolations={stats.activeViolations}
      />

      {/* Trust system details for selected property */}
      {activePropertyDetail && !showUploader && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          {/* Active Flags display (7 columns) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              Active Flags for {activePropertyDetail.propertyName}
            </h3>
            <ActiveFlagsDisplay flags={activePropertyDetail.flags} />
          </div>

          {/* Trust Score Breakdown (5 columns) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
              Trust Score Breakdown
            </h3>
            <TrustScoreBreakdown stats={activePropertyDetail.breakdown} />
          </div>
        </div>
      )}

      {/* Primary body action grids */}
      {showUploader ? (
        <div className="max-w-2xl mx-auto w-full">
          <FoodMenuUploader
            properties={properties}
            onSuccess={() => {
              setShowUploader(false)
              handleUpdate()
            }}
          />
        </div>
      ) : (
        /* Complaints Manager board */
        <ComplaintManagerList
          complaints={complaints}
          onUpdate={handleUpdate}
        />
      )}

    </div>
  )
}
