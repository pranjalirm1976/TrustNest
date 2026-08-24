'use client'

import { useState } from 'react'
import { 
  ShieldCheck, 
  MapPin, 
  ExternalLink,
  Users,
  BedDouble,
  IndianRupee,
  MessageSquareWarning,
  Utensils,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

const tabs = [
  'Overview', 'Floors', 'Rooms', 'Residents', 'Food', 'Complaints', 'Payments', 'Reviews', 'Performance'
]

export default function PGManagementClient({ propertyId }: { propertyId: string }) {
  const [activeTab, setActiveTab] = useState('Overview')

  return (
    <div className="w-full flex flex-col">
      {/* Hero Header */}
      <div className="bg-white border border-slate-200 rounded-t-xl px-6 pt-8 pb-0">
        <div className="w-full mx-auto">
          {/* Identity Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Sunrise Premium Girls PG</h1>
                <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  Verified
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                <MapPin className="w-4 h-4" />
                Sector 44, Gurugram
              </div>
            </div>

            <div className="flex items-center gap-4 sm:justify-end">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">TrustNest Score</div>
                <div className="flex items-center justify-end gap-2">
                  <div className="bg-indigo-600 text-white px-2 py-0.5 rounded text-lg font-bold">94</div>
                  <div className="text-sm font-medium text-slate-600">Excellent</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-6">
            <button className="text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 shadow-sm px-4 py-2 rounded-lg transition-colors">
              Edit Property Details
            </button>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-transparent hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              View Public Listing
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Horizontal Tabs */}
          <div className="w-full overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-6 border-b border-transparent min-w-max">
              {tabs.map((tab) => {
                const isActive = activeTab === tab
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
                      isActive 
                        ? 'border-indigo-600 text-indigo-600' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full py-6">
        {activeTab === 'Overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Occupancy Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-indigo-200 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-600">Occupancy</h3>
                  <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                    <Users className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">42</span>
                  <span className="text-sm font-medium text-slate-500">/ 50 Residents</span>
                </div>
                <div className="mt-3 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-flex">
                  8 Beds Available
                </div>
              </div>

              {/* Rent Collection Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-indigo-200 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-600">Rent Collection</h3>
                  <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                    <IndianRupee className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 tabular-nums">92%</span>
                </div>
                <div className="mt-3 text-xs font-medium text-slate-500 flex items-center gap-1">
                  <span className="font-semibold text-amber-600 tabular-nums">₹45,000</span> pending
                </div>
              </div>

              {/* Open Complaints Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-indigo-200 transition-colors group cursor-pointer" onClick={() => setActiveTab('Complaints')}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-600">Open Complaints</h3>
                  <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-red-50 transition-colors">
                    <MessageSquareWarning className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">3</span>
                  <span className="text-sm font-medium text-slate-500">Active</span>
                </div>
                <div className="mt-3 text-xs font-medium text-slate-500 flex items-center justify-between">
                  <span>1 SLA Breach</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Today's Food Status Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-indigo-200 transition-colors group cursor-pointer" onClick={() => setActiveTab('Food')}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-600">Today's Food</h3>
                  <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                    <Utensils className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">Updated</span>
                </div>
                <div className="mt-3 text-xs font-medium text-slate-500 flex items-center justify-between">
                  <span>Dinner menu live</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>

            </div>

            {/* Quick Links or Recent Activity could go here, but requirements strictly asked for the 4 summary cards */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-center h-48 text-slate-500 text-sm">
              Additional Overview widgets can be placed here.
            </div>

          </div>
        )}

        {/* Placeholders for other tabs */}
        {activeTab !== 'Overview' && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-center animate-in fade-in">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-slate-300">{activeTab.charAt(0)}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{activeTab} Management</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md">
              This section is under construction. Detailed management tools for {activeTab.toLowerCase()} will appear here.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
