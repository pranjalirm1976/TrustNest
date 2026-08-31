'use client'

import { useState } from 'react'
import { 
  Building2, 
  Users, 
  BedDouble, 
  IndianRupee, 
  AlertTriangle, 
  MessageSquareWarning,
  TrendingUp,
  Activity,
  Star,
  Clock
} from 'lucide-react'
import Link from 'next/link'

type CommentUser = { name: string; role: string }
type Comment = { id: string; comment: string; createdAt: Date; author: CommentUser }
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
  tenant: { name: string }
  property: { name: string }
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
  flags: { id: string; type: string; reason: string; isActive: boolean }[]
}
interface DashboardClientProps {
  properties: { id: string; name: string }[]
  complaints: Complaint[]
  stats: {
    totalPGs: number
    totalRooms: number
    totalResidents: number
    occupiedBeds: number
    availableBeds: number
    totalBedsCount?: number
    trustNestBedsCount?: number
    ownerManagedBedsCount?: number
    trustNestOccupiedCount?: number
    trustNestAvailableCount?: number
    allocationPercent?: number
    monthlyCollection: number
    pendingRent: number
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
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id || '')

  const activePropertyDetail = propertyDetails.find(
    (pd) => pd.propertyId === selectedPropertyId
  ) || propertyDetails[0]

  // Mocked for UI purpose (since actual resident activity & resolution rate aren't in props directly)
  const complaintResolutionRate = '92%'
  const residentSatisfaction = activePropertyDetail ? (activePropertyDetail.breakdown.reviewsAvg).toFixed(1) : '4.5'
  const foodRating = activePropertyDetail ? (activePropertyDetail.breakdown.foodAvg).toFixed(1) : '4.2'

  const recentComplaints = complaints.slice(0, 5)

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      
      {/* Alert Banner */}
      {stats.activeViolations > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 w-full">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800">Critical SLA Warnings</h3>
            <p className="text-sm text-red-700 mt-1">
              You have {stats.activeViolations} complaint(s) that have breached the 24-hour resolution SLA. Immediate action required.
            </p>
          </div>
        </div>
      )}

      {/* Select Property (if multiple) */}
      {properties.length > 1 && (
        <div className="flex justify-end">
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="bg-white border border-slate-200 text-sm font-semibold text-slate-700 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Properties</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* TrustNest Inventory Allocation Overview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
              TrustNest Inventory Allocation
            </span>
            <span className="text-xs text-slate-300 font-bold">
              {stats.allocationPercent ?? 100}% Allocated
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Marketplace &amp; Direct Inventory Split</h3>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total PG Beds</span>
              <span className="text-base font-extrabold text-white">{stats.totalBedsCount ?? (stats.occupiedBeds + stats.availableBeds)} Beds</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-700 hidden sm:block" />
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">TrustNest Beds</span>
              <span className="text-base font-extrabold text-emerald-400">{stats.trustNestBedsCount ?? (stats.occupiedBeds + stats.availableBeds)} Beds</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-700 hidden sm:block" />
            <div>
              <span className="text-[10px] text-slate-300 font-bold uppercase block">Owner Managed</span>
              <span className="text-base font-extrabold text-slate-300">{stats.ownerManagedBedsCount ?? 0} Beds</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-700 hidden sm:block" />
            <div>
              <span className="text-[10px] text-emerald-300 font-bold uppercase block">Available on TrustNest</span>
              <span className="text-base font-extrabold text-emerald-300">{stats.trustNestAvailableCount ?? stats.availableBeds} Free</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-700 hidden sm:block" />
            <div>
              <span className="text-[10px] text-amber-300 font-bold uppercase block">Occupied on TrustNest</span>
              <span className="text-base font-extrabold text-amber-300">{stats.trustNestOccupiedCount ?? stats.occupiedBeds} Occupied</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <Link
            href="/admin/rooms"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 hover:scale-[1.02]"
          >
            <span>Manage TrustNest Inventory</span>
          </Link>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total PGs & Rooms" 
          value={`${stats.totalPGs} PGs`} 
          subtext={`${stats.totalRooms} Total Rooms`}
          icon={<Building2 className="w-5 h-5 text-indigo-600" />} 
          trend="+1 this month"
        />
        <MetricCard 
          title="Occupancy Status" 
          value={stats.occupiedBeds.toString()} 
          subtext={`${stats.availableBeds} beds available`}
          icon={<BedDouble className="w-5 h-5 text-emerald-600" />} 
          trend="85% full"
        />
        <MetricCard 
          title="Pending Rent" 
          value={`₹${stats.pendingRent.toLocaleString()}`} 
          subtext={`₹${stats.monthlyCollection.toLocaleString()} collected`}
          icon={<IndianRupee className="w-5 h-5 text-amber-600" />} 
          valueClass="tabular-nums font-bold"
        />
        <MetricCard 
          title="Open Complaints" 
          value={stats.openComplaints.toString()} 
          subtext={`${stats.activeViolations} SLA breaches`}
          icon={<MessageSquareWarning className="w-5 h-5 text-red-500" />} 
          trend={stats.openComplaints > 0 ? "Needs attention" : "All clear"}
        />
      </div>

      {/* PG Performance Block */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          PG Performance Scorecard
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
            <span className="text-sm font-medium text-slate-500 mb-2">TrustNest Score</span>
            <div className="text-5xl font-extrabold text-indigo-600 tracking-tight">
              {activePropertyDetail ? activePropertyDetail.breakdown.score : 'N/A'}
            </div>
            <span className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Top 10% in area
            </span>
          </div>
          
          <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
            <span className="text-sm font-medium text-slate-500 mb-2">Resolution Rate</span>
            <div className="text-3xl font-bold text-slate-800">{complaintResolutionRate}</div>
            <span className="text-xs text-slate-500 mt-2">Within 24 hours</span>
          </div>

          <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
            <span className="text-sm font-medium text-slate-500 mb-2">Food Rating</span>
            <div className="text-3xl font-bold text-slate-800 flex items-center gap-1">
              {foodRating} <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <span className="text-xs text-slate-500 mt-2">Based on daily feedback</span>
          </div>

          <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
            <span className="text-sm font-medium text-slate-500 mb-2">Resident Satisfaction</span>
            <div className="text-3xl font-bold text-slate-800 flex items-center gap-1">
              {residentSatisfaction} <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <span className="text-xs text-slate-500 mt-2">Overall stay experience</span>
          </div>
        </div>
      </div>

      {/* 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {/* Recent Complaints */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Recent Complaints</h3>
              <Link href="/admin/complaints" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-md px-3 py-1.5 transition-colors">
                View All
              </Link>
            </div>
            <div className="p-0">
              {recentComplaints.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No active complaints! Your properties are running smoothly.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentComplaints.map(c => (
                    <div key={c.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-start group">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            c.severity === 'HIGH' ? 'bg-red-100 text-red-700' :
                            c.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {c.severity}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-medium text-slate-900">{c.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{c.property.name} • {c.tenant.name}</p>
                      </div>
                      <div className="text-xs font-medium text-slate-400 group-hover:text-indigo-600 transition-colors">
                        Review &rarr;
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Food Status */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Today's Food Menu</h3>
              <Link href="/admin/food" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-md px-3 py-1.5 transition-colors">
                Manage Menu
              </Link>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600 mb-2">Menu has been updated for all properties.</p>
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                <Star className="w-3 h-3" /> Average Rating: {foodRating}/5
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Recent Payments */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Recent Payments</h3>
              <Link href="/admin/payments" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-md px-3 py-1.5 transition-colors">
                View All
              </Link>
            </div>
            <div className="p-4 flex flex-col items-center justify-center text-center text-sm text-slate-500 min-h-[200px]">
              <IndianRupee className="w-8 h-8 text-slate-300 mb-3" />
              <p>Payment module integration is active.</p>
              <p className="text-xs mt-1">₹{stats.monthlyCollection.toLocaleString()} collected this month.</p>
            </div>
          </div>

          {/* Resident Activity */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Resident Activity</h3>
              <Link href="/admin/tenants" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-md px-3 py-1.5 transition-colors">
                Directory
              </Link>
            </div>
            <div className="p-4 flex flex-col items-center justify-center text-center text-sm text-slate-500 min-h-[160px]">
              <Users className="w-8 h-8 text-slate-300 mb-3" />
              <p>{stats.totalResidents} active residents across your properties.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function MetricCard({ 
  title, 
  value, 
  subtext, 
  icon, 
  trend,
  valueClass = ""
}: { 
  title: string, 
  value: string, 
  subtext?: string, 
  icon: React.ReactNode, 
  trend?: string,
  valueClass?: string
}) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-sm font-medium text-slate-500">{title}</h4>
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      </div>
      <div>
        <div className={`text-2xl font-bold text-slate-900 ${valueClass}`}>{value}</div>
        <div className="flex items-center justify-between mt-1 text-xs">
          {subtext && <span className="text-slate-500">{subtext}</span>}
          {trend && <span className="font-medium text-emerald-600">{trend}</span>}
        </div>
      </div>
    </div>
  )
}
