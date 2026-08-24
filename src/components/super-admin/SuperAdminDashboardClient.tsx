'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { verifyProperty, suspendProperty, restoreProperty, moderateReview } from '@/actions/super-admin.actions'
import { 
  Building2, 
  Users, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  Check, 
  X, 
  Ban, 
  RefreshCw, 
  ArrowUpRight, 
  IndianRupee, 
  Sparkles, 
  Layers, 
  Star, 
  ChevronRight, 
  Search, 
  SlidersHorizontal,
  ExternalLink,
  MessageSquare,
  Activity
} from 'lucide-react'

interface SuperAdminDashboardClientProps {
  user: { name?: string | null; email?: string | null }
  stats: any
  properties: any[]
  subscriptions: any[]
  complaints: any[]
  reviews: any[]
}

export default function SuperAdminDashboardClient({
  user,
  stats,
  properties: initialProperties,
  subscriptions,
  complaints,
  reviews: initialReviews
}: SuperAdminDashboardClientProps) {
  const [properties, setProperties] = useState(initialProperties)
  const [reviews, setReviews] = useState(initialReviews)
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'subscriptions' | 'complaints' | 'reviews'>('overview')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isActing, setIsActing] = useState<string | null>(null)

  // Property Verification Handler
  const handleVerify = async (propertyId: string, status: 'PUBLISHED' | 'REJECTED' | 'SUSPENDED') => {
    setIsActing(propertyId)
    try {
      const res = await verifyProperty(propertyId, status)
      if (res.success) {
        setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, status } : p))
      } else {
        alert('Action failed: ' + res.message)
      }
    } catch (e: any) {
      alert('Error: ' + e.message)
    } finally {
      setIsActing(null)
    }
  }

  const handleModerateReview = async (reviewId: string, action: 'KEEP' | 'REMOVE') => {
    try {
      const res = await moderateReview(reviewId, action)
      if (res.success && action === 'REMOVE') {
        setReviews(prev => prev.filter(r => r.id !== reviewId))
      }
    } catch (e: any) {
      alert(e.message)
    }
  }

  // Filtered Properties for Verification Queue
  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Top Super Admin Platform Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-sm">
              TN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight">TrustNest Command Center</span>
                <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Super Admin
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Platform Control &amp; Owner Subscriptions Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              <span>Public Website</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
              <span className="text-slate-300 font-bold">{user?.name || 'Super Admin'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 border-t border-slate-800 overflow-x-auto scrollbar-hide text-xs font-bold">
          {[
            { id: 'overview', label: 'Platform Overview', count: null },
            { id: 'queue', label: 'PG Verification Queue', count: properties.filter(p => p.status !== 'PUBLISHED').length },
            { id: 'subscriptions', label: 'Owner Subscriptions (₹2,000/mo)', count: stats.subscriptions.active },
            { id: 'complaints', label: 'Global 24h SLA Complaints', count: stats.complaints.open },
            { id: 'reviews', label: 'Reviews Moderation', count: reviews.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400 bg-slate-800/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  activeTab === tab.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        {/* TAB 1: Platform Overview & Revenue separation */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Top Revenue Metric Banner: Explicit Business Model Separation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: TrustNest Platform Revenue (Owner Subscriptions ONLY) */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-indigo-800 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300">
                      TrustNest Monthly Platform Revenue
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase">
                      Direct Earnings
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white">
                      ₹{stats.subscriptions.monthlyRevenue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-indigo-300 font-medium">/ month</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Derived exclusively from <strong>{stats.subscriptions.paidThisMonth} PG Owner subscriptions</strong> at <strong>₹{stats.subscriptions.planPrice}/month</strong>.
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-indigo-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-indigo-300 uppercase block">Active Plans</span>
                      <span className="font-bold text-white">{stats.subscriptions.active}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-300 uppercase block">Paid This Month</span>
                      <span className="font-bold text-emerald-400">{stats.subscriptions.paidThisMonth}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-300 uppercase block">Pending Invoices</span>
                      <span className="font-bold text-amber-300">{stats.subscriptions.pending}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Resident Rent Volume (0% Commission — 100% Settled to Owners) */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                      Resident Rent Gross Volume (GMV)
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full font-bold uppercase">
                      0% Platform Commission
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-slate-900">
                      ₹{(stats.financials.residentRentGrossVolume || 476000).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/ month volume</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    100% of resident rent is settled directly to registered PG Owners via Cashfree. TrustNest charges ₹0 commission on rent payments.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs mt-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Total Verified Residents</span>
                    <span className="font-bold text-slate-800">{stats.residents.total} Residents</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Settlement Route</span>
                    <span className="font-bold text-indigo-600">Direct PG Owner Bank / UPI</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Platform KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total PGs</span>
                  <Building2 className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{stats.properties.total}</div>
                <div className="flex items-center gap-2 mt-2 text-[11px]">
                  <span className="text-emerald-700 font-bold">{stats.properties.published} Live</span>
                  <span>•</span>
                  <span className="text-amber-700 font-bold">{stats.properties.pending} Pending</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">PG Owners</span>
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{stats.owners.total}</div>
                <div className="text-[11px] text-slate-500 mt-2 font-medium">
                  {stats.subscriptions.active} with Active Subscription
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">24h SLA Complaints</span>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{stats.complaints.total}</div>
                <div className="flex items-center gap-2 mt-2 text-[11px]">
                  <span className="text-emerald-700 font-bold">{stats.complaints.resolved} Resolved</span>
                  <span>•</span>
                  <span className="text-red-700 font-bold">{stats.complaints.escalated} Escalated</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verification Queue</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{stats.properties.pending}</div>
                <button
                  onClick={() => setActiveTab('queue')}
                  className="text-[11px] text-indigo-600 hover:text-indigo-700 font-bold mt-2 flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Review Submissions</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

            </div>

            {/* Quick Action Queue Preview */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Recent PG Submissions Needing Review</h3>
                  <p className="text-xs text-slate-500">Approve or flag property registrations submitted by PG Owners.</p>
                </div>
                <button
                  onClick={() => setActiveTab('queue')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  View All ({properties.length})
                </button>
              </div>

              <div className="space-y-3">
                {properties.slice(0, 4).map(prop => (
                  <div key={prop.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden relative shrink-0">
                        {prop.images[0]?.url ? (
                          <Image src={prop.images[0].url} alt={prop.name} fill className="object-cover" unoptimized={prop.images[0].url.startsWith('/uploads/')} />
                        ) : (
                          <Building2 className="w-5 h-5 text-slate-400 m-auto mt-2.5" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{prop.name}</h4>
                        <p className="text-xs text-slate-500">{prop.address} • Owner: <strong>{prop.owner?.name || 'Rajesh Kumar'}</strong></p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        prop.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        prop.status === 'SUSPENDED' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {prop.status}
                      </span>

                      {prop.status !== 'PUBLISHED' ? (
                        <button
                          onClick={() => handleVerify(prop.id, 'PUBLISHED')}
                          disabled={isActing === prop.id}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Approve &amp; Publish
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerify(prop.id, 'SUSPENDED')}
                          disabled={isActing === prop.id}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: PG Verification Queue */}
        {activeTab === 'queue' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">PG Verification &amp; Moderation Queue</h2>
                <p className="text-xs text-slate-500">Review floor layouts, photos, and compliance documents before publishing.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search PG or Owner..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-indigo-500 w-48 sm:w-60"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="PENDING_VERIFICATION">Pending Review</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Property</th>
                      <th className="p-4">Owner / Contact</th>
                      <th className="p-4">Floors &amp; Rooms</th>
                      <th className="p-4">TrustScore</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Super Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredProperties.map(prop => (
                      <tr key={prop.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden relative shrink-0">
                              {prop.images[0]?.url ? (
                                <Image src={prop.images[0].url} alt={prop.name} fill className="object-cover" unoptimized={prop.images[0].url.startsWith('/uploads/')} />
                              ) : (
                                <Building2 className="w-4 h-4 text-slate-400 m-auto mt-3" />
                              )}
                            </div>
                            <div>
                              <Link href={`/pg/${prop.id}`} target="_blank" className="font-bold text-slate-900 hover:text-indigo-600 flex items-center gap-1">
                                <span>{prop.name}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </Link>
                              <p className="text-[11px] text-slate-500">{prop.address}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-slate-800">{prop.owner?.name || 'Owner'}</span>
                          <p className="text-[11px] text-slate-400">{prop.owner?.email}</p>
                        </td>

                        <td className="p-4 text-slate-600">
                          <span>{prop.floors?.length || 1} Floors</span> • <span>{prop.floors?.reduce((acc: number, f: any) => acc + (f.rooms?.length || 0), 0) || 0} Rooms</span>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-indigo-600 font-mono">★ {prop.trustScore.toFixed(1)}</span>
                        </td>

                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            prop.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            prop.status === 'SUSPENDED' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {prop.status}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {prop.status !== 'PUBLISHED' ? (
                              <button
                                onClick={() => handleVerify(prop.id, 'PUBLISHED')}
                                disabled={isActing === prop.id}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md transition-colors"
                              >
                                Approve &amp; Publish
                              </button>
                            ) : (
                              <button
                                onClick={() => handleVerify(prop.id, 'SUSPENDED')}
                                disabled={isActing === prop.id}
                                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-md transition-colors"
                              >
                                Suspend
                              </button>
                            )}
                            <button
                              onClick={() => handleVerify(prop.id, 'REJECTED')}
                              disabled={isActing === prop.id}
                              className="px-2 py-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-md transition-colors"
                              title="Reject"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Owner Subscriptions */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Platform Monetization</span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">TrustNest Owner Subscriptions (₹2,000 / month / PG)</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xl">
                  PG Owners pay TrustNest a fixed monthly subscription for property listing and operational software. TrustNest takes 0% commission from tenant rent.
                </p>
              </div>

              <div className="bg-white border border-indigo-200 rounded-xl p-4 text-center shrink-0 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Month Revenue</span>
                <p className="text-2xl font-black text-indigo-700 font-mono">₹{stats.subscriptions.monthlyRevenue.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-emerald-700 font-bold mt-0.5">{stats.subscriptions.paidThisMonth} Subscriptions Paid</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Owner</th>
                      <th className="p-4">Plan Name</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Billing Cycle</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Next Renewal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {subscriptions.map(sub => (
                      <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4">
                          <span className="font-bold text-slate-900">{sub.owner?.name || 'PG Owner'}</span>
                          <p className="text-[11px] text-slate-400">{sub.owner?.email}</p>
                        </td>

                        <td className="p-4 text-slate-700 font-semibold">{sub.planName}</td>

                        <td className="p-4 font-mono font-bold text-slate-900">₹{sub.amount.toLocaleString('en-IN')}/mo</td>

                        <td className="p-4 text-slate-600">{sub.billingCycle}</td>

                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            sub.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            sub.status === 'PAST_DUE' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {sub.status === 'ACTIVE' ? 'Paid / Active' : sub.status}
                          </span>
                        </td>

                        <td className="p-4 text-slate-500 font-mono text-[11px]">
                          {new Date(sub.currentPeriodEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Global Complaints & 24h SLA */}
        {activeTab === 'complaints' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Global 24-Hour SLA Complaints Tracker</h2>
              <p className="text-xs text-slate-500">Monitor resolution timelines across all PGs. Breaches automatically lower property TrustScores.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Property</th>
                      <th className="p-4">Resident</th>
                      <th className="p-4">Category &amp; Issue</th>
                      <th className="p-4">SLA Deadline</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {complaints.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{c.property?.name}</td>
                        <td className="p-4 text-slate-700">{c.tenant?.name}</td>
                        <td className="p-4">
                          <span className="font-bold text-slate-800">{c.category}: </span>
                          <span className="text-slate-600">{c.title}</span>
                        </td>
                        <td className="p-4 font-mono text-[11px] text-slate-500">
                          {new Date(c.slaDeadline).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            c.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            c.isEscalated ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {c.isEscalated ? 'SLA Breached' : c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Reviews Moderation */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Reviews &amp; Ratings Moderation</h2>
              <p className="text-xs text-slate-500">PG Owners cannot delete reviews. Super Admin maintains platform integrity and authentic ratings.</p>
            </div>

            <div className="space-y-3">
              {reviews.map(review => (
                <div key={review.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{review.tenant?.name || 'Resident'}</span>
                      <span className="text-xs text-slate-400">reviewed</span>
                      <span className="font-bold text-indigo-600">{review.property?.name}</span>
                      <span className="text-xs text-amber-500 font-bold flex items-center">
                        ★ {((review.foodRating + review.cleanlinessRating + review.amenitiesRating + review.staffRating) / 4).toFixed(1)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 italic">&quot;{review.comment}&quot;</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleModerateReview(review.id, 'KEEP')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      Keep Active
                    </button>
                    <button
                      onClick={() => handleModerateReview(review.id, 'REMOVE')}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-lg transition-colors"
                    >
                      Remove Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
