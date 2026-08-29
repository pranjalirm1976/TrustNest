'use client'

import { useState } from 'react'
import { processOwnerSubscriptionPayment } from '@/actions/subscription.actions'
import { 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Calendar, 
  Building2, 
  User, 
  ArrowRight, 
  RefreshCw, 
  Receipt,
  XCircle,
  HelpCircle,
  Clock
} from 'lucide-react'

interface SubscriptionClientProps {
  owner: { id: string; name?: string | null; email?: string | null }
  initialSubscription: any | null
  properties: any[]
}

export default function SubscriptionClient({
  owner,
  initialSubscription,
  properties
}: SubscriptionClientProps) {
  const [subscription, setSubscription] = useState(initialSubscription)
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    initialSubscription?.propertyId || properties[0]?.id || ''
  )
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [lastTransactionId, setLastTransactionId] = useState(initialSubscription?.transactionId || '')

  const selectedProperty = properties.find(p => p.id === selectedPropertyId) || properties[0]
  const isActive = subscription?.status === 'ACTIVE'
  const isFailed = subscription?.status === 'FAILED'

  const handleSimulatePayment = async (simulateFailure = false) => {
    setIsProcessing(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const res = await processOwnerSubscriptionPayment({
        propertyId: selectedPropertyId,
        planName: 'TrustNest PG Owner Plan',
        amount: 2000.0,
        simulateFailure,
        failureReason: simulateFailure ? 'Demo payment failure simulation' : undefined
      })

      if (res.success) {
        setSuccessMessage(res.message || 'Subscription activated successfully in DEMO mode!')
        setLastTransactionId(res.transactionId)
        setSubscription((prev: any) => ({
          ...prev,
          status: 'ACTIVE',
          startDate: new Date(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          transactionId: res.transactionId,
          paymentMode: 'DEMO'
        }))
      } else {
        setErrorMessage(res.message || res.error || 'Payment simulation failed.')
        setLastTransactionId(res.transactionId)
        setSubscription((prev: any) => ({
          ...prev,
          status: 'FAILED',
          failureReason: 'Demo payment failure',
          transactionId: res.transactionId
        }))
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'An unexpected error occurred.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Top Banner: DEMO MODE NOTICE */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 shrink-0 font-bold text-sm">
            DEMO
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              DEMO PAYMENT MODE — NO REAL MONEY
            </h4>
            <p className="text-xs text-amber-700 mt-0.5">
              This environment runs on demo payment rails for testing. No real money or banking transactions occur.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-amber-200/80 text-amber-900 font-mono shrink-0">
          Sandbox Ready
        </span>
      </div>

      {/* Main Grid: Plan Card & Current Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Plan Card & Details (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-premium-sm flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-primary bg-indigo-50 px-2.5 py-1 rounded-md">
                  Partner Membership
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                  TrustNest PG Owner Plan
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Full verified listing, automated room inventory, SLA complaint management, and food transparency audits.
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-extrabold text-slate-900 font-mono">₹2,000</div>
                <span className="text-xs text-slate-400 font-medium">/ month</span>
              </div>
            </div>

            {/* Properties Selector */}
            {properties.length > 1 && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Select Property for Subscription</label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-primary cursor-pointer"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.address})</option>
                  ))}
                </select>
              </div>
            )}

            {/* Plan Features Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified TrustNest Badge</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Interactive 2D/3D Blueprints</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Automated Rent Invoicing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Daily Food Audit Feed</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-6 mt-6 border-t border-slate-100">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSimulatePayment(false)}
                disabled={isProcessing}
                className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs py-3.5 rounded-xl shadow-premium transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                <span>{isActive ? 'Renew Plan (Pay ₹2,000)' : 'Simulate Successful Payment'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSimulatePayment(true)}
                disabled={isProcessing}
                className="w-full bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-bold text-xs py-3.5 rounded-xl border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4 text-red-500" />
                <span>Simulate Failed Payment</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Subscription Status Card (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
                Subscription Status
              </h3>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md ${
                isActive 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : isFailed
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {subscription?.status || 'PENDING'}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Owner:</span>
                <span className="font-bold text-slate-900">{owner.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">PG Property:</span>
                <span className="font-bold text-slate-900 truncate max-w-[180px]">{selectedProperty?.name || 'All Properties'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Billing Cycle:</span>
                <span className="font-bold text-slate-900">Monthly (₹2,000 / mo)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Payment Mode:</span>
                <span className="font-mono font-bold text-indigo-600">DEMO SANDBOX</span>
              </div>
              {lastTransactionId && (
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Last Txn ID:</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px]">{lastTransactionId}</span>
                </div>
              )}
              {isActive && subscription?.nextBillingDate && (
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Next Billing Date:</span>
                  <span className="font-bold text-slate-900">
                    {new Date(subscription.nextBillingDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Failed notice with Try Again */}
          {isFailed && (
            <div className="mt-4 p-3 bg-red-100/70 border border-red-200 rounded-xl text-xs text-red-800 space-y-2">
              <p className="font-bold">Subscription Inactive — Payment Failed</p>
              <p className="text-[11px] text-red-600 leading-tight">
                Reason: Demo payment failure simulation. Please try again to activate partner benefits.
              </p>
              <button
                type="button"
                onClick={() => handleSimulatePayment(false)}
                className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Invoice Log Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-premium-sm space-y-4">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-brand-primary" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
            Subscription Payment History &amp; Invoices
          </h3>
        </div>

        {subscription?.invoices && subscription.invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="p-3">Invoice ID</th>
                  <th className="p-3">Billing Month</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Paid Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscription.invoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 font-medium">
                    <td className="p-3 font-mono text-slate-700">{inv.cfPaymentId || inv.id}</td>
                    <td className="p-3 text-slate-900 font-bold">{inv.billingMonth}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">₹{inv.amount}</td>
                    <td className="p-3 font-mono text-indigo-600">DEMO</td>
                    <td className="p-3">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">
                      {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString('en-IN') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-4">No subscription invoices generated yet.</p>
        )}
      </div>

    </div>
  )
}
