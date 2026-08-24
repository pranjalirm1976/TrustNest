'use client'

import { useState } from 'react'
import { 
  User, 
  Phone, 
  Lock, 
  Bell, 
  Building2, 
  CreditCard, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  RotateCw,
  Clock,
  Sparkles,
  Utensils,
  FileCheck
} from 'lucide-react'
import { updateOwnerProfile, updatePGSettings, updateNotificationPreferences } from '@/actions/settings.actions'
import { calculateAndSaveTrustScore } from '@/actions/financials'
import type { TrustScoreBreakdown } from '@/lib/trust-score'

type Tab = 'owner' | 'trust' | 'pg' | 'notifications' | 'contact' | 'password' | 'payment'

interface TrustScoreLogItem {
  id: string
  score: number
  breakdown: string
  createdAt: Date | string
}

interface SettingsClientProps {
  initialTab?: Tab
  user?: {
    name?: string | null
    email?: string | null
    phone?: string | null
  }
  property?: {
    id: string
    name: string
    address: string
    gender: string
    priceFrom: number
    trustScore: number
  } | null
  initialTrustBreakdown?: TrustScoreBreakdown | null
  initialTrustLogs?: TrustScoreLogItem[]
}

export default function SettingsClient({
  initialTab = 'owner',
  user,
  property,
  initialTrustBreakdown,
  initialTrustLogs = []
}: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab)
  const [isSaving, setIsSaving] = useState(false)
  const [isCalculatingScore, setIsCalculatingScore] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState({ text: 'Settings updated successfully', isError: false })
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Form State
  const fullName = user?.name || 'Rajesh Kumar'
  const nameParts = fullName.split(' ')
  const [formData, setFormData] = useState({
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    email: user?.email || 'rajesh@emeraldelite.com',
    phone: user?.phone || '+91 9876543210',
    pgName: property?.name || 'Bliss Living PG',
    pgAddress: property?.address || 'Hinjewadi Phase 1, Pune, Maharashtra 411057',
    pgGender: property?.gender || 'UNISEX',
    pgPriceFrom: property?.priceFrom?.toString() || '8500',
    notifyEmail: true,
    notifySMS: true,
    notifyPush: true
  })

  // Trust score dynamic state
  const [trustScore, setTrustScore] = useState<number>(property?.trustScore ?? 4.6)
  const [trustBreakdown, setTrustBreakdown] = useState<TrustScoreBreakdown | null>(initialTrustBreakdown || {
    score: 4.6,
    reviewsAvg: 4.8,
    foodAvg: 4.5,
    totalReviews: 1,
    totalFoodRatings: 1,
    slaBreaches: 0,
    activeFlags: 0,
    reviewImpact: 2.88,
    foodImpact: 0.9,
    slaPenalty: 0,
    flagPenalty: 0,
  })
  const [trustLogs, setTrustLogs] = useState<TrustScoreLogItem[]>(initialTrustLogs)

  const tabs = [
    { id: 'owner', label: 'Owner Profile', icon: User },
    { id: 'trust', label: 'Trust Score & Engine', icon: ShieldCheck },
    { id: 'pg', label: 'PG Property Info', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'contact', label: 'Contact Details', icon: Phone },
    { id: 'payment', label: 'Payment & Payouts', icon: CreditCard },
    { id: 'password', label: 'Password & Security', icon: Lock },
  ] as const

  const displayToast = (text: string, isError = false) => {
    setToastMessage({ text, isError })
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3500)
  }

  const handleRecalculateTrustScore = async () => {
    if (!property?.id) {
      displayToast('No property linked to calculate score for.', true)
      return
    }

    setIsCalculatingScore(true)
    try {
      const res = await calculateAndSaveTrustScore(property.id)
      if (res.success && res.score !== undefined) {
        setTrustScore(res.score)
        if (res.breakdown) {
          setTrustBreakdown(res.breakdown)
        }
        if (res.logId) {
          const newLog: TrustScoreLogItem = {
            id: res.logId,
            score: res.score,
            breakdown: JSON.stringify(res.breakdown),
            createdAt: new Date().toISOString()
          }
          setTrustLogs(prev => [newLog, ...prev])
        }
        displayToast(`Trust Score successfully recalculated: ${res.score.toFixed(1)} / 5.0`)
      } else {
        displayToast(res.error || 'Could not recalculate score', true)
      }
    } catch (e: any) {
      displayToast(e.message || 'Error recalculating score', true)
    } finally {
      setIsCalculatingScore(false)
    }
  }

  const handleSave = async () => {
    setErrors({})
    
    if (activeTab === 'owner') {
      const newErrors: Record<string, string> = {}
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
      if (!formData.email.trim()) newErrors.email = 'Email is required'
      if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    }

    setIsSaving(true)
    try {
      let res: { success: boolean; error?: string; message?: string } = { success: true }

      if (activeTab === 'owner' || activeTab === 'contact') {
        const fd = new FormData()
        fd.append('name', `${formData.firstName} ${formData.lastName}`.trim())
        fd.append('email', formData.email)
        res = await updateOwnerProfile(fd)
      } else if (activeTab === 'pg' && property?.id) {
        const fd = new FormData()
        fd.append('name', formData.pgName)
        fd.append('address', formData.pgAddress)
        fd.append('gender', formData.pgGender)
        fd.append('priceFrom', formData.pgPriceFrom)
        res = await updatePGSettings(property.id, fd)
      } else if (activeTab === 'notifications') {
        res = await updateNotificationPreferences({
          notifyEmail: formData.notifyEmail,
          notifySMS: formData.notifySMS,
          notifyPush: formData.notifyPush,
        })
      } else {
        res = { success: true, message: 'Settings saved.' }
      }

      if (res.success) {
        displayToast(res.message || 'Settings updated successfully')
      } else {
        displayToast(res.error || 'Failed to update settings', true)
      }
    } catch (e: any) {
      displayToast(e.message || 'An unexpected error occurred', true)
    } finally {
      setIsSaving(false)
    }
  }

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) => (
    <button 
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${checked ? 'bg-indigo-600' : 'bg-slate-200'}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )

  const getScoreBadge = (score: number) => {
    if (score >= 4.5) return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Exceptional (Tier 1 Verified)' }
    if (score >= 4.0) return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Highly Trusted (Tier 2)' }
    if (score >= 3.0) return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Satisfactory (Probationary)' }
    return { bg: 'bg-red-50 text-red-700 border-red-200', label: 'Action Required (At Risk)' }
  }

  const scoreBadge = getScoreBadge(trustScore)

  return (
    <div className="relative flex-1 min-h-0 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col lg:flex-row overflow-hidden">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 border ${
            toastMessage.isError
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            {toastMessage.isError ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            )}
            <span className="text-sm font-bold">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <div className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/50">
        <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible custom-scrollbar p-2 lg:p-4 gap-1 lg:gap-2">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setErrors({}) }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col relative min-w-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          <div className="max-w-3xl">
            
            {/* --- Tab: Owner Information --- */}
            {activeTab === 'owner' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Personal Details</h2>
                <p className="text-sm text-slate-500 mb-8">Update your personal information and account owner credentials.</p>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">First Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={formData.firstName}
                        onChange={e => setFormData({...formData, firstName: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-lg border text-sm shadow-sm outline-none transition-colors ${
                          errors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                        }`}
                      />
                      {errors.firstName && <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={formData.lastName}
                        onChange={e => setFormData({...formData, lastName: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-lg border text-sm shadow-sm outline-none transition-colors ${
                          errors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                        }`}
                      />
                      {errors.lastName && <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.lastName}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                    {errors.email && <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Primary Phone Number</label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- Tab: Trust Score & Engine --- */}
            {activeTab === 'trust' && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">TrustScore™ Engine Status</h2>
                    <p className="text-sm text-slate-500">Live evaluation based on resident reviews, SLA compliance, food quality, and payment timeliness.</p>
                  </div>
                  <button
                    onClick={handleRecalculateTrustScore}
                    disabled={isCalculatingScore}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-sm font-semibold rounded-lg shadow-sm transition-colors shrink-0"
                  >
                    <RotateCw className={`w-4 h-4 ${isCalculatingScore ? 'animate-spin' : ''}`} />
                    {isCalculatingScore ? 'Calculating...' : 'Recalculate Score'}
                  </button>
                </div>

                {/* Score Badge Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-emerald-300" />
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Current Algorithmic Rating</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-black tabular-nums">{trustScore.toFixed(1)}</span>
                      <span className="text-indigo-200 text-lg font-semibold">/ 5.0</span>
                    </div>
                    <p className="text-xs text-indigo-100 max-w-sm">
                      Your score directly impacts public search ranking and verified badge eligibility on the platform.
                    </p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 flex flex-col gap-2 min-w-[200px]">
                    <span className="text-xs text-indigo-200 uppercase tracking-wide font-medium">Status Assessment</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full w-max border ${scoreBadge.bg}`}>
                      {scoreBadge.label}
                    </span>
                    <span className="text-[11px] text-indigo-100 mt-1">Updated in real-time on SLA actions</span>
                  </div>
                </div>

                {/* Performance Factors Breakdown */}
                {trustBreakdown && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Core Performance Metrics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Factor 1: Verified Reviews */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="text-xs font-bold text-slate-500 uppercase">Resident Reviews (60% wt)</span>
                            <p className="text-lg font-extrabold text-slate-900 mt-0.5 tabular-nums">
                              {trustBreakdown.reviewsAvg.toFixed(1)} <span className="text-xs text-slate-500 font-normal">({trustBreakdown.totalReviews} reviews)</span>
                            </p>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            +{trustBreakdown.reviewImpact.toFixed(2)} pts
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                          <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${(trustBreakdown.reviewsAvg / 5) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Factor 2: Food Ratings */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="text-xs font-bold text-slate-500 uppercase">Food Quality (20% wt)</span>
                            <p className="text-lg font-extrabold text-slate-900 mt-0.5 tabular-nums">
                              {trustBreakdown.foodAvg.toFixed(1)} <span className="text-xs text-slate-500 font-normal">({trustBreakdown.totalFoodRatings} ratings)</span>
                            </p>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            +{trustBreakdown.foodImpact.toFixed(2)} pts
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(trustBreakdown.foodAvg / 5) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Factor 3: 24h SLA Breaches */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="text-xs font-bold text-slate-500 uppercase">24h SLA Violations</span>
                            <p className="text-lg font-extrabold text-slate-900 mt-0.5 tabular-nums">
                              {trustBreakdown.slaBreaches} <span className="text-xs text-slate-500 font-normal">unresolved past 24h</span>
                            </p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                            trustBreakdown.slaBreaches > 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {trustBreakdown.slaPenalty > 0 ? `-${trustBreakdown.slaPenalty.toFixed(2)} pts` : '0.00 pts'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Penalty: -0.15 points per SLA breach</p>
                      </div>

                      {/* Factor 4: Active Flags */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="text-xs font-bold text-slate-500 uppercase">Safety & Audit Flags</span>
                            <p className="text-lg font-extrabold text-slate-900 mt-0.5 tabular-nums">
                              {trustBreakdown.activeFlags} <span className="text-xs text-slate-500 font-normal">active warnings</span>
                            </p>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                            trustBreakdown.activeFlags > 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {trustBreakdown.flagPenalty > 0 ? `-${trustBreakdown.flagPenalty.toFixed(2)} pts` : '0.00 pts'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">Penalty: -0.25 points per active flag</p>
                      </div>

                    </div>
                  </div>
                )}

                {/* Audit & Computation Log */}
                {trustLogs.length > 0 && (
                  <div className="border-t border-slate-100 pt-6">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Historical Audit Log</h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Timestamp</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Score</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Log ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trustLogs.map((log) => (
                            <tr key={log.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                              <td className="px-4 py-3 text-xs font-medium text-slate-600">
                                {new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(log.createdAt))}
                              </td>
                              <td className="px-4 py-3 text-xs font-bold text-indigo-700 tabular-nums">
                                {log.score.toFixed(1)} / 5.0
                              </td>
                              <td className="px-4 py-3 text-xs font-mono text-slate-400">
                                {log.id}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* --- Tab: PG Property Settings --- */}
            {activeTab === 'pg' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-slate-900 mb-1">PG Property Profile</h2>
                <p className="text-sm text-slate-500 mb-8">Update your property listing information visible to prospective residents.</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Property Name</label>
                    <input 
                      type="text" 
                      value={formData.pgName}
                      onChange={e => setFormData({...formData, pgName: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Complete Address</label>
                    <textarea 
                      rows={3}
                      value={formData.pgAddress}
                      onChange={e => setFormData({...formData, pgAddress: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Gender Category</label>
                      <select 
                        value={formData.pgGender}
                        onChange={e => setFormData({...formData, pgGender: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors bg-white"
                      >
                        <option value="UNISEX">Co-ed / Unisex</option>
                        <option value="MALE">Boys Only</option>
                        <option value="FEMALE">Girls Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Starting Rent per Month (₹)</label>
                      <input 
                        type="number" 
                        value={formData.pgPriceFrom}
                        onChange={e => setFormData({...formData, pgPriceFrom: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium tabular-nums shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- Tab: Notifications --- */}
            {activeTab === 'notifications' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Notification Preferences</h2>
                <p className="text-sm text-slate-500 mb-8">Decide how and when you want to receive alerts about your property.</p>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Email Notifications</h4>
                      <p className="text-xs text-slate-500 mt-1">Receive daily summaries, payment records, and SLA alerts via email.</p>
                    </div>
                    <Toggle checked={formData.notifyEmail} onChange={(v) => setFormData({...formData, notifyEmail: v})} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">SMS Alerts</h4>
                      <p className="text-xs text-slate-500 mt-1">Get immediate text messages for SLA violations and overdue rent.</p>
                    </div>
                    <Toggle checked={formData.notifySMS} onChange={(v) => setFormData({...formData, notifySMS: v})} />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Push Notifications</h4>
                      <p className="text-xs text-slate-500 mt-1">Receive instant mobile push alerts on tenant payments and new reviews.</p>
                    </div>
                    <Toggle checked={formData.notifyPush} onChange={(v) => setFormData({...formData, notifyPush: v})} />
                  </div>
                </div>
              </div>
            )}

            {/* --- Tab: Contact Details --- */}
            {activeTab === 'contact' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Contact & Support Details</h2>
                <p className="text-sm text-slate-500 mb-8">Emergency contact information provided to current residents.</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Manager Name</label>
                    <input 
                      type="text" 
                      defaultValue={fullName}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Emergency Phone</label>
                    <input 
                      type="text" 
                      defaultValue="+91 9876543210"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Operating Hours</label>
                    <input 
                      type="text" 
                      defaultValue="08:00 AM - 10:00 PM"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* --- Tab: Payment Settings --- */}
            {activeTab === 'payment' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Bank Account for Payouts</h2>
                <p className="text-sm text-slate-500 mb-8">Bank account used for direct deposit settlements of collected rent.</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Account Holder Name</label>
                    <input 
                      type="text" 
                      defaultValue={fullName}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Account Number</label>
                      <input 
                        type="password" 
                        defaultValue="123456789012"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">IFSC Code</label>
                      <input 
                        type="text" 
                        defaultValue="HDFC0001234"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- Tab: Password & Security --- */}
            {activeTab === 'password' && (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Security & Credentials</h2>
                <p className="text-sm text-slate-500 mb-8">Manage your account security password and 2FA authentication.</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••••••"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••••••"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••••••"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm shadow-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Action Buttons (Anchored bottom) */}
        {activeTab !== 'trust' && (
          <div className="p-6 md:px-10 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
            <button 
              type="button"
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-6 py-2.5 min-w-[140px] bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
