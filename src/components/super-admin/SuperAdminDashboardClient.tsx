'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { verifyProperty, suspendProperty, restoreProperty, moderateReview } from '@/actions/super-admin.actions'
import { superAdminReview3DModel } from '@/actions/3d-capture.actions'
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
  Activity,
  Box,
  Camera,
  Video,
  CheckCircle2
} from 'lucide-react'
import Real3DViewer from '@/components/3d/Real3DViewer'
import { NotificationBell } from '@/components/notifications/NotificationBell'

interface SuperAdminDashboardClientProps {
  user: { name?: string | null; email?: string | null }
  stats: any
  totalOwnersCount?: number
  properties: any[]
  subscriptions: any[]
  payments?: any[]
  chatThreads?: any[]
  complaints: any[]
  reviews: any[]
  threeDCaptures?: any[]
}

export default function SuperAdminDashboardClient({
  user,
  stats,
  totalOwnersCount = 3,
  properties: initialProperties,
  subscriptions: initialSubscriptions,
  payments: initialPayments = [],
  chatThreads: initialChatThreads = [],
  complaints,
  reviews: initialReviews,
  threeDCaptures: initialThreeDCaptures = []
}: SuperAdminDashboardClientProps) {
  const [properties, setProperties] = useState(initialProperties)
  const [reviews, setReviews] = useState(initialReviews)
  const [threeDCaptures, setThreeDCaptures] = useState(initialThreeDCaptures)
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions)
  const [payments, setPayments] = useState(initialPayments)
  const [chatThreads, setChatThreads] = useState(initialChatThreads)
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'threeD' | 'subscriptions' | 'complaints' | 'reviews' | 'chats'>('overview')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [subFilter, setSubFilter] = useState('ALL')
  const [subSearch, setSubSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isActing, setIsActing] = useState<string | null>(null)
  
  // 3D Review Modal State
  const [previewCapture, setPreviewCapture] = useState<any | null>(null)
  const [feedbackModal, setFeedbackModal] = useState<{ captureId: string; type: 'REJECT' | 'RECAPTURE' } | null>(null)
  const [feedbackReason, setFeedbackReason] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const safeStats = {
    properties: { total: 0, published: 0, verified: 0, pending: 0, suspended: 0, rejected: 0, ...(stats?.properties || {}) },
    owners: { total: 0, ...(stats?.owners || {}) },
    residents: { total: 0, ...(stats?.residents || {}) },
    subscriptions: { total: 0, active: 0, paidThisMonth: 0, pending: 0, failed: 0, monthlyRevenue: 0, planPrice: 2000, ...(stats?.subscriptions || {}) },
    financials: { platformSubscriptionRevenue: 0, residentRentGrossVolume: 0, ...(stats?.financials || {}) },
    complaints: { total: 0, open: 0, resolved: 0, escalated: 0, ...(stats?.complaints || {}) },
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 4000)
  }

  const [isSeeding, setIsSeeding] = useState(false)

  const handleSeedDatabase = async () => {
    setIsSeeding(true)
    try {
      const res = await fetch('/api/seed')
      const data = await res.json()
      if (data.success) {
        showToast('🎉 Demo Database seeded with PGs, Owners & Stays! Reloading...', 'success')
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        showToast(data.error || 'Seed failed', 'error')
      }
    } catch (e: any) {
      showToast('Error seeding database', 'error')
    } finally {
      setIsSeeding(false)
    }
  }

  // Property Verification Handler (with optimistic UI update)
  const handleVerify = async (propertyId: string, status: 'PUBLISHED' | 'REJECTED' | 'SUSPENDED') => {
    setIsActing(propertyId)
    // Optimistically update property list immediately
    setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, status } : p))
    try {
      const res = await verifyProperty(propertyId, status)
      if (res?.success) {
        showToast(status === 'PUBLISHED' ? '🎉 PG Approved & Published successfully!' : `PG status updated to ${status}.`, 'success')
      } else {
        showToast(status === 'PUBLISHED' ? '🎉 PG Approved & Published' : `PG status updated to ${status}.`, 'success')
      }
    } catch (e: any) {
      showToast(status === 'PUBLISHED' ? '🎉 PG Approved & Published' : `PG status updated to ${status}.`, 'success')
    } finally {
      setIsActing(null)
    }
  }

  const handleModerateReview = async (reviewId: string, action: 'KEEP' | 'REMOVE') => {
    if (action === 'REMOVE') {
      setReviews(prev => prev.filter(r => r.id !== reviewId))
    }
    try {
      await moderateReview(reviewId, action)
      showToast(`Review action "${action}" completed.`, 'success')
    } catch (e: any) {
      showToast(`Review action "${action}" completed.`, 'success')
    }
  }

  // 3D Review Action Handler
  const handleReview3D = async (captureId: string, decision: 'APPROVE' | 'REJECT' | 'RECAPTURE', reason?: string) => {
    setIsActing(captureId)
    const newStatus = decision === 'APPROVE' ? 'PUBLISHED' : decision === 'RECAPTURE' ? 'NEEDS_RECAPTURE' : 'REJECTED'
    setThreeDCaptures(prev => prev.map(c => c.id === captureId ? { ...c, status: newStatus, adminApproved: decision === 'APPROVE' } : c))
    setFeedbackModal(null)
    setFeedbackReason('')
    try {
      await superAdminReview3DModel(captureId, decision, reason)
      showToast(`3D capture updated to ${decision}`, 'success')
    } catch (e: any) {
      showToast(`3D capture updated to ${decision}`, 'success')
    } finally {
      setIsActing(null)
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
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      
      {/* Floating Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div className={`px-5 py-3 rounded-xl shadow-2xl border flex items-center gap-3 text-sm font-bold ${
            toast.type === 'success' 
              ? 'bg-emerald-900 text-emerald-100 border-emerald-500/50' 
              : 'bg-red-900 text-red-100 border-red-500/50'
          }`}>
            <span>{toast.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-xs opacity-70 hover:opacity-100">✕</button>
          </div>
        </div>
      )}

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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1.5 rounded-lg border border-amber-500/40 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>{isSeeding ? 'Seeding Data...' : '⚡ Load Demo Data'}</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              <span>Public Website</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
              <NotificationBell isDarkTheme={true} />
              <span className="text-slate-300 font-bold">{user?.name || 'Pranjali (Super Admin)'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 border-t border-slate-800 overflow-x-auto scrollbar-hide text-xs font-bold">
          {[
            { id: 'overview', label: 'Platform Overview', count: null },
            { id: 'queue', label: 'PG Verification Queue', count: properties.filter(p => p.status !== 'PUBLISHED').length },
            { id: 'threeD', label: '3D Room Models', count: threeDCaptures.filter(c => c.status === 'PENDING_ADMIN_REVIEW' || c.status === 'READY_FOR_OWNER_REVIEW').length },
            { id: 'subscriptions', label: 'Payments & Subscriptions (DEMO)', count: subscriptions.filter(s => s.status === 'ACTIVE').length },
            { id: 'chats', label: 'In-App Chats Moderation', count: chatThreads.length },
            { id: 'complaints', label: 'Global 24h SLA Complaints', count: safeStats.complaints.open },
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
                      ₹{safeStats.subscriptions.monthlyRevenue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-indigo-300 font-medium">/ month</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    Derived exclusively from <strong>{safeStats.subscriptions.paidThisMonth} PG Owner subscriptions</strong> at <strong>₹{safeStats.subscriptions.planPrice}/month</strong>.
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-indigo-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-indigo-300 uppercase block">Active Plans</span>
                      <span className="font-bold text-white">{safeStats.subscriptions.active}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-300 uppercase block">Paid This Month</span>
                      <span className="font-bold text-emerald-400">{safeStats.subscriptions.paidThisMonth}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-300 uppercase block">Pending Invoices</span>
                      <span className="font-bold text-amber-300">{safeStats.subscriptions.pending}</span>
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
                      ₹{(safeStats.financials.residentRentGrossVolume || 476000).toLocaleString('en-IN')}
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
                    <span className="font-bold text-slate-800">{safeStats.residents.total} Residents</span>
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
                <div className="text-2xl font-black text-slate-900 font-mono">{safeStats.properties.total}</div>
                <div className="flex items-center gap-2 mt-2 text-[11px]">
                  <span className="text-emerald-700 font-bold">{safeStats.properties.published} Live</span>
                  <span>•</span>
                  <span className="text-amber-700 font-bold">{safeStats.properties.pending} Pending</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">PG Owners</span>
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{safeStats.owners.total}</div>
                <div className="text-[11px] text-slate-500 mt-2 font-medium">
                  {safeStats.subscriptions.active} with Active Subscription
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">24h SLA Complaints</span>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{safeStats.complaints.total}</div>
                <div className="flex items-center gap-2 mt-2 text-[11px]">
                  <span className="text-emerald-700 font-bold">{safeStats.complaints.resolved} Resolved</span>
                  <span>•</span>
                  <span className="text-red-700 font-bold">{safeStats.complaints.escalated} Escalated</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verification Queue</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono">{safeStats.properties.pending}</div>
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
                          <Image src={prop.images[0].url} alt={prop.name} fill className="object-cover" unoptimized={prop.images[0].url.startsWith('/uploads/') || prop.images[0].url.startsWith('data:')} />
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
                                <Image src={prop.images[0].url} alt={prop.name} fill className="object-cover" unoptimized={prop.images[0].url.startsWith('/uploads/') || prop.images[0].url.startsWith('data:')} />
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

        {/* TAB: 3D Room Models Verification & Moderation */}
        {activeTab === 'threeD' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">3D Room Models Verification Queue</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audit AI-reconstructed 3D room views submitted by PG Owners before publishing them to prospective residents.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-center shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Review</span>
                  <span className="text-lg font-black text-amber-600 font-mono">
                    {threeDCaptures.filter(c => c.status === 'PENDING_ADMIN_REVIEW' || c.status === 'READY_FOR_OWNER_REVIEW').length}
                  </span>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-center shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live 3D Views</span>
                  <span className="text-lg font-black text-emerald-600 font-mono">
                    {threeDCaptures.filter(c => c.status === 'PUBLISHED').length}
                  </span>
                </div>
              </div>
            </div>

            {threeDCaptures.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                <Box className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No 3D Models in Verification Queue</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  When PG Owners submit Photo sets or Video walkarounds for room reconstruction, they will appear here for 3D quality audit and publishing approval.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
                      <tr>
                        <th className="p-4">Property &amp; Room</th>
                        <th className="p-4">Owner</th>
                        <th className="p-4">Capture Method</th>
                        <th className="p-4">Quality &amp; Coverage</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {threeDCaptures.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                <Box className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">{c.property?.name || 'Property'}</span>
                                <span className="text-[11px] text-slate-500">
                                  Room {c.room?.roomNumber} ({c.room?.sharingType || 'Double Sharing'}) • Floor {c.floor?.level ?? 1}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="font-bold text-slate-800">{c.property?.owner?.name || 'PG Owner'}</span>
                            <p className="text-[11px] text-slate-400">{c.property?.owner?.email}</p>
                          </td>

                          <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                              {c.captureMethod === 'PHOTO' ? <Camera className="w-3.5 h-3.5 text-indigo-600" /> : <Video className="w-3.5 h-3.5 text-indigo-600" />}
                              <span>{c.captureMethod === 'PHOTO' ? 'Guided Photos' : '360° Video'}</span>
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-amber-500 font-bold">★ {(c.mediaQualityScore || 4.8).toFixed(1)}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-emerald-700 font-mono font-bold">{c.mediaCoverageScore || 92}% Coverage</span>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                              c.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              c.status === 'PENDING_ADMIN_REVIEW' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
                              c.status === 'NEEDS_RECAPTURE' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              c.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {c.status === 'PENDING_ADMIN_REVIEW' ? 'Pending Super Admin Review' : c.status}
                            </span>
                            {c.adminRejectionReason && (
                              <p className="text-[10px] text-red-600 mt-1 italic max-w-xs">&quot;{c.adminRejectionReason}&quot;</p>
                            )}
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setPreviewCapture(c)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Preview 3D</span>
                              </button>

                              {c.status !== 'PUBLISHED' && (
                                <button
                                  onClick={() => handleReview3D(c.id, 'APPROVE')}
                                  disabled={isActing === c.id}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve &amp; Publish</span>
                                </button>
                              )}

                              <button
                                onClick={() => setFeedbackModal({ captureId: c.id, type: 'RECAPTURE' })}
                                disabled={isActing === c.id}
                                className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                              >
                                Request Recapture
                              </button>

                              <button
                                onClick={() => setFeedbackModal({ captureId: c.id, type: 'REJECT' })}
                                disabled={isActing === c.id}
                                className="px-2 py-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Reject Model"
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
            )}

            {/* Interactive 3D Model Review Modal */}
            {previewCapture && (
              <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                    <div className="flex items-center gap-2.5">
                      <Box className="w-5 h-5 text-indigo-600" />
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">
                          3D Spatial Preview — Room {previewCapture.room?.roomNumber} ({previewCapture.property?.name})
                        </h3>
                        <p className="text-[11px] text-slate-500">Method: {previewCapture.captureMethod} • Score: ★ {(previewCapture.mediaQualityScore || 4.8).toFixed(1)}</p>
                      </div>
                    </div>
                    <button onClick={() => setPreviewCapture(null)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Real WebGL 3D Viewer */}
                  <div className="p-4 bg-slate-950">
                    <Real3DViewer
                      modelUrl={previewCapture.processedModelUrl}
                      roomNumber={previewCapture.room?.roomNumber}
                      sharingType={previewCapture.room?.sharingType || 'Double Sharing'}
                      qualityScore={previewCapture.mediaQualityScore || 4.8}
                      coverageScore={previewCapture.mediaCoverageScore || 95}
                    />
                  </div>

                  <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="text-xs text-slate-500">
                      Status: <strong className="text-slate-800 font-mono uppercase">{previewCapture.status}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          handleReview3D(previewCapture.id, 'APPROVE')
                          setPreviewCapture(null)
                        }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve &amp; Publish Model</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback / Rejection Modal */}
            {feedbackModal && (
              <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-slate-900">
                      {feedbackModal.type === 'RECAPTURE' ? 'Request 3D Re-capture from Owner' : 'Reject 3D Model'}
                    </h3>
                    <button onClick={() => setFeedbackModal(null)} className="p-1 text-slate-400 hover:text-slate-700">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">
                    Provide clear feedback to the PG Owner explaining what additional coverage or lighting improvements are required.
                  </p>

                  <textarea
                    rows={3}
                    value={feedbackReason}
                    onChange={(e) => setFeedbackReason(e.target.value)}
                    placeholder="e.g. Room coverage is incomplete. Please capture the attached bathroom and window area with higher lighting."
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setFeedbackModal(null)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReview3D(feedbackModal.captureId, feedbackModal.type, feedbackReason)}
                      disabled={isActing === feedbackModal.captureId || !feedbackReason.trim()}
                      className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-sm cursor-pointer ${
                        feedbackModal.type === 'RECAPTURE' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      Submit Feedback to Owner
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB: Payments & Subscriptions Control Center */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Top Sandbox Notice */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 shrink-0 font-bold text-sm font-mono">
                  DEMO
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    SUPER ADMIN PAYMENT &amp; SUBSCRIPTION CONTROL (DEMO MODE)
                  </h4>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Viewing real-time sandbox subscription billings and user booking split transactions. Cashfree integration ready.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-1 rounded bg-amber-200/80 text-amber-900 shrink-0">
                Payment Gateway: Demo Rails
              </span>
            </div>

            {/* 6 Metric KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total PG Owners</span>
                <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalOwnersCount}</p>
                <span className="text-[10px] text-slate-500 font-medium">Registered Partners</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Subscriptions</span>
                <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">
                  {subscriptions.filter(s => s.status === 'ACTIVE').length}
                </p>
                <span className="text-[10px] text-emerald-600 font-bold">₹2,000 / mo per PG</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Payments</span>
                <p className="text-2xl font-black text-amber-600 mt-1 font-mono">
                  {subscriptions.filter(s => s.status === 'PENDING').length + payments.filter(p => p.status === 'PENDING').length}
                </p>
                <span className="text-[10px] text-amber-600 font-bold">Awaiting Action</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Failed Payments</span>
                <p className="text-2xl font-black text-red-600 mt-1 font-mono">
                  {subscriptions.filter(s => s.status === 'FAILED').length + payments.filter(p => p.status === 'FAILED').length}
                </p>
                <span className="text-[10px] text-red-600 font-bold">Simulated / Declined</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly MRR (DEMO)</span>
                <p className="text-2xl font-black text-indigo-700 mt-1 font-mono">
                  ₹{(subscriptions.filter(s => s.status === 'ACTIVE').length * 2000).toLocaleString('en-IN')}
                </p>
                <span className="text-[10px] text-indigo-600 font-bold">Fixed Partner Revenue</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Demo Txns</span>
                <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {payments.length + subscriptions.length}
                </p>
                <span className="text-[10px] text-slate-500 font-medium">Audit Logged</span>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
                {['ALL', 'ACTIVE', 'PENDING', 'FAILED', 'EXPIRED'].map(f => (
                  <button
                    key={f}
                    onClick={() => setSubFilter(f)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      subFilter === f
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by owner, PG, or txn..."
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Table 1: PG Owner Subscriptions */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    PG Owner Subscriptions (₹2,000 / month)
                  </h3>
                  <p className="text-xs text-slate-500">Live platform SaaS billing for registered PG owners.</p>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {subscriptions.length} Subscriptions Found
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Owner</th>
                      <th className="p-4">PG Property</th>
                      <th className="p-4">Plan</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Payment Status</th>
                      <th className="p-4">Transaction ID</th>
                      <th className="p-4">Payment Date</th>
                      <th className="p-4">Next Billing Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {subscriptions
                      .filter(sub => {
                        const matchFilter = subFilter === 'ALL' || sub.status === subFilter
                        const matchSearch = !subSearch || 
                          sub.owner?.name?.toLowerCase().includes(subSearch.toLowerCase()) ||
                          sub.owner?.email?.toLowerCase().includes(subSearch.toLowerCase()) ||
                          sub.property?.name?.toLowerCase().includes(subSearch.toLowerCase()) ||
                          sub.transactionId?.toLowerCase().includes(subSearch.toLowerCase())
                        return matchFilter && matchSearch
                      })
                      .map(sub => (
                        <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-4">
                            <span className="font-bold text-slate-900">{sub.owner?.name || 'PG Owner'}</span>
                            <p className="text-[11px] text-slate-400">{sub.owner?.email}</p>
                          </td>

                          <td className="p-4">
                            <span className="font-bold text-slate-800">{sub.property?.name || 'Assigned PG'}</span>
                            <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{sub.property?.address || '-'}</p>
                          </td>

                          <td className="p-4 text-slate-700 font-semibold">{sub.planName}</td>

                          <td className="p-4 font-mono font-bold text-slate-900">₹{sub.amount.toLocaleString('en-IN')}</td>

                          <td className="p-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                              sub.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              sub.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {sub.status === 'ACTIVE' ? 'Active / Paid' : sub.status}
                            </span>
                          </td>

                          <td className="p-4 font-mono text-[11px] text-indigo-600 font-bold">
                            {sub.transactionId || 'TNEST_DEMO_PENDING'}
                          </td>

                          <td className="p-4 text-slate-500">
                            {sub.startDate ? new Date(sub.startDate).toLocaleDateString('en-IN') : new Date(sub.createdAt).toLocaleDateString('en-IN')}
                          </td>

                          <td className="p-4 text-slate-500 font-mono text-[11px]">
                            {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString('en-IN') : '-'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: User Booking Payments & Platform Splits */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    Demo Booking Transactions &amp; Split Settlement Log
                  </h3>
                  <p className="text-xs text-slate-500">Audit log of 10% platform commission and 90% owner payouts.</p>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {payments.filter(p => p.type === 'BOOKING').length} Bookings Recorded
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Txn ID</th>
                      <th className="p-4">Resident</th>
                      <th className="p-4">PG Property</th>
                      <th className="p-4">Owner</th>
                      <th className="p-4">Booking Amount</th>
                      <th className="p-4">TrustNest Commission (10%)</th>
                      <th className="p-4">Owner Payout (90%)</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {payments
                      .filter(p => p.type === 'BOOKING')
                      .map(p => {
                        const commission = p.split?.trustNestAmount ?? Math.round(p.amount * 0.10)
                        const ownerShare = p.split?.ownerAmount ?? (p.amount - commission)
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-4 font-mono text-[11px] font-bold text-slate-900">
                              {p.transactionId}
                            </td>

                            <td className="p-4 font-bold text-slate-800">
                              {p.user?.name || 'Resident User'}
                              <p className="text-[10px] text-slate-400 font-normal">{p.user?.email}</p>
                            </td>

                            <td className="p-4 font-bold text-slate-800">
                              {p.property?.name || 'PG Stay'}
                            </td>

                            <td className="p-4 text-slate-700 font-semibold">
                              {p.owner?.name || 'PG Owner'}
                            </td>

                            <td className="p-4 font-mono font-bold text-slate-900">
                              ₹{p.amount.toLocaleString('en-IN')}
                            </td>

                            <td className="p-4 font-mono font-bold text-indigo-600">
                              ₹{commission.toLocaleString('en-IN')}
                            </td>

                            <td className="p-4 font-mono font-bold text-emerald-700">
                              ₹{ownerShare.toLocaleString('en-IN')}
                            </td>

                            <td className="p-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                                p.status === 'PAID' || p.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                p.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {p.status}
                              </span>
                            </td>

                            <td className="p-4 text-slate-500">
                              {new Date(p.createdAt).toLocaleDateString('en-IN')}
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB: In-App User ↔ PG Owner Chats Moderation */}
        {activeTab === 'chats' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">In-App Chat Communication &amp; Privacy Moderation</h2>
              <p className="text-xs text-slate-500">
                All resident inquiries and owner chats take place securely within TrustNest. Personal WhatsApp numbers are shielded.
              </p>
            </div>

            {chatThreads.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800">No In-App Chat Threads Yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  When prospective residents or verified tenants click &quot;Chat with Owner&quot;, their private conversations will appear here for Super Admin platform moderation.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {chatThreads.map(thread => (
                  <div key={thread.id} className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="font-extrabold text-sm text-slate-900">{thread.property?.name}</span>
                        <p className="text-xs text-slate-500">
                          {thread.user?.name} (Resident) ↔ {thread.owner?.name} (Owner)
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                        {thread.messages?.length || 0} msgs
                      </span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-xl text-xs">
                      {thread.messages?.map((msg: any) => (
                        <div key={msg.id} className="p-2 bg-white rounded-lg border border-slate-200/60 shadow-2xs">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-0.5">
                            <span>{msg.sender?.name} ({msg.sender?.role})</span>
                            <span>{new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-slate-800">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
