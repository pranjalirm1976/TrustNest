'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { verifyProperty } from '@/actions/super-admin.actions'
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText,
  Eye,
  Check,
  X,
  XCircle,
  HelpCircle,
  ShieldCheck,
  UploadCloud,
  CheckCircle,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Building2,
  AlertCircle
} from 'lucide-react'

// --- Types ---
type DocStatus = 'APPROVED' | 'PENDING' | 'REJECTED'

interface VerificationDoc {
  id: string
  name: string
  type: string
  status: DocStatus
  updatedAt: string
  fileName?: string
}

interface PropertyOption {
  id: string
  name: string
  address: string
  status: string
  trustScore: number
}

interface VerificationClientProps {
  properties?: PropertyOption[]
}

const initialDocs: VerificationDoc[] = [
  { id: 'doc-1', name: 'Trade License / Registration', type: 'PDF', status: 'APPROVED', updatedAt: '10 Aug 2026', fileName: 'trade_license_2026.pdf' },
  { id: 'doc-2', name: 'Owner Government ID (Aadhar/PAN)', type: 'PDF', status: 'APPROVED', updatedAt: '10 Aug 2026', fileName: 'aadhar_card_verified.pdf' },
  { id: 'doc-3', name: 'Property Photos (Exterior & Rooms)', type: 'JPEG', status: 'APPROVED', updatedAt: '12 Aug 2026', fileName: 'property_photos_batch1.zip' },
  { id: 'doc-4', name: 'Location & Address Proof', type: 'PDF', status: 'APPROVED', updatedAt: '11 Aug 2026', fileName: 'electricity_bill_latest.pdf' },
]

export default function VerificationClient({ properties = [] }: VerificationClientProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0]?.id || '')
  const [docs, setDocs] = useState<VerificationDoc[]>(initialDocs)
  const [previewDoc, setPreviewDoc] = useState<VerificationDoc | null>(null)
  const [activeUploadDocId, setActiveUploadDocId] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Find active property from database properties list
  const activeProperty = properties.find(p => p.id === selectedPropertyId) || properties[0]
  const currentStatus = activeProperty?.status || 'PENDING_VERIFICATION'

  const handleStatusChange = async (newStatus: 'PUBLISHED' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'REJECTED') => {
    if (!activeProperty) return
    setIsUpdating(true)
    try {
      const res = await verifyProperty(activeProperty.id, newStatus as any)
      if (res?.success) {
        window.location.reload()
      } else {
        alert(res?.error || res?.message || 'Failed to update status')
      }
    } catch (e: any) {
      alert(e?.message || 'Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && activeUploadDocId) {
      setDocs(prev => prev.map(doc => {
        if (doc.id === activeUploadDocId) {
          return {
            ...doc,
            status: 'PENDING',
            fileName: file.name,
            updatedAt: 'Just now'
          }
        }
        return doc
      }))
      setActiveUploadDocId(null)
      alert(`Uploaded: ${file.name}. Super Admin will review your new document.`)
    }
  }

  return (
    <>
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Property Selector Bar */}
      {properties.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Property</label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="text-sm font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              >
                {properties.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ({p.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Link
              href="/super-admin"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <span>Super Admin Queue</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        
        {/* Status Hero */}
        <div className="flex flex-col items-center justify-center border-b border-slate-100 pb-8 mb-8 text-center">
          
          {currentStatus === 'PUBLISHED' && (
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border mb-4 shadow-sm bg-emerald-50 text-emerald-700 border-emerald-200">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span className="font-extrabold text-sm uppercase tracking-wide">VERIFIED &amp; LIVE</span>
            </div>
          )}

          {currentStatus === 'SUSPENDED' && (
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border mb-4 shadow-sm bg-red-50 text-red-700 border-red-200">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="font-extrabold text-sm uppercase tracking-wide">SUSPENDED BY SUPER ADMIN</span>
            </div>
          )}

          {(currentStatus === 'PENDING_VERIFICATION' || currentStatus === 'UNDER_REVIEW' || currentStatus === 'DRAFT') && (
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border mb-4 shadow-sm bg-amber-50 text-amber-700 border-amber-200">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="font-extrabold text-sm uppercase tracking-wide">UNDER REVIEW (PENDING SUPER ADMIN APPROVAL)</span>
            </div>
          )}

          {currentStatus === 'REJECTED' && (
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border mb-4 shadow-sm bg-red-50 text-red-700 border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-extrabold text-sm uppercase tracking-wide">ACTION REQUIRED (REJECTED)</span>
            </div>
          )}

          <p className="text-sm text-slate-500 max-w-lg mb-6 leading-relaxed">
            {currentStatus === 'PUBLISHED' 
              ? '🎉 Congratulations! Your property is fully verified and listed publicly on the TrustNest discovery network.'
              : currentStatus === 'SUSPENDED'
              ? '⚠️ Your property has been temporarily suspended by the Super Admin. Please re-upload required documents or contact platform support.'
              : '⏳ Your property onboarding application is currently in the Super Admin verification queue.'}
          </p>

          {/* Status Simulator Toggles for Testing */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-100 w-full">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mr-2">Quick Test Actions:</span>
            <button
              onClick={() => handleStatusChange('PUBLISHED')}
              disabled={isUpdating}
              className="text-xs font-bold px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              Approve &amp; Publish
            </button>
            <button
              onClick={() => handleStatusChange('SUSPENDED')}
              disabled={isUpdating}
              className="text-xs font-bold px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors cursor-pointer"
            >
              Suspend
            </button>
            <button
              onClick={() => handleStatusChange('PENDING_VERIFICATION')}
              disabled={isUpdating}
              className="text-xs font-bold px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg transition-colors cursor-pointer"
            >
              Set Pending
            </button>
          </div>

        </div>

        {/* Success Banner */}
        {currentStatus === 'PUBLISHED' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-emerald-800 mb-1">TrustNest Verified Badge Awarded</h3>
                <p className="text-xs sm:text-sm text-emerald-700 leading-relaxed">
                  All compliance categories are approved! Your property is live on the public discovery network.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <Link
                href="/"
                target="_blank"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <span>View on Homepage</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/search"
                target="_blank"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-emerald-100/50 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                <span>Search Map</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Suspended Alert Box */}
        {currentStatus === 'SUSPENDED' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-8 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-red-800 mb-1">Listing Suspended by Platform Admin</h3>
              <p className="text-xs sm:text-sm text-red-700 leading-relaxed">
                This PG is currently hidden from the public search and homepage. Please re-upload updated compliance documentation below to request a re-audit.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          
          {/* Audit Timeline */}
          <div className="flex-1">
            <h3 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">Verification Progress</h3>
            <div className="relative pl-8 space-y-8 before:absolute before:inset-y-0 before:left-3.5 before:w-px before:bg-slate-200">
              
              {/* Step 1: Submission */}
              <div className="relative">
                <div className="absolute -left-[37px] w-7 h-7 bg-emerald-50 border-2 border-emerald-500 rounded-full flex items-center justify-center z-10">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Application Submitted</h4>
                <p className="text-xs text-slate-500 mt-0.5">Registration &amp; Floor Layouts uploaded</p>
              </div>

              {/* Step 2: Under Review */}
              <div className="relative">
                <div className="absolute -left-[37px] w-7 h-7 bg-emerald-50 border-2 border-emerald-500 rounded-full flex items-center justify-center z-10">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Initial Document Audit</h4>
                <p className="text-xs text-slate-500 mt-0.5">Review by Super Admin auditor</p>
              </div>

              {/* Step 3: Action/Verification */}
              <div className="relative">
                <div className={`absolute -left-[37px] w-7 h-7 rounded-full flex items-center justify-center z-10 border-2 ${
                  currentStatus === 'PUBLISHED' ? 'bg-emerald-50 border-emerald-500' : 
                  currentStatus === 'SUSPENDED' ? 'bg-red-50 border-red-500' : 
                  'bg-amber-50 border-amber-500'
                }`}>
                  {currentStatus === 'PUBLISHED' && <Check className="w-4 h-4 text-emerald-600" />}
                  {currentStatus === 'SUSPENDED' && <X className="w-4 h-4 text-red-600" />}
                  {currentStatus !== 'PUBLISHED' && currentStatus !== 'SUSPENDED' && <Clock className="w-4 h-4 text-amber-600" />}
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  {currentStatus === 'PUBLISHED' ? 'Verified Successfully' : currentStatus === 'SUSPENDED' ? 'Listing Suspended' : 'Pending Approval'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentStatus === 'PUBLISHED' ? 'Approved & Published Live' : currentStatus === 'SUSPENDED' ? 'Action required to restore listing' : 'Awaiting Super Admin Decision'}
                </p>
              </div>

            </div>
          </div>

          {/* Document Checklist */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Document Checklist</h3>
              <span className="text-xs font-semibold text-slate-500 font-mono">
                {docs.filter(d => d.status === 'APPROVED').length} of {docs.length} Approved
              </span>
            </div>

            <div className="space-y-4">
              {docs.map(doc => (
                <div 
                  key={doc.id}
                  className="border border-slate-200/80 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors bg-slate-50/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{doc.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {doc.fileName || `${doc.type} Document`} • {doc.updatedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      doc.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                      doc.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {doc.status}
                    </span>

                    <button 
                      onClick={() => {
                        setActiveUploadDocId(doc.id)
                        fileInputRef.current?.click()
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Re-upload File"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {currentStatus === 'PUBLISHED' 
              ? '✅ Property listing is verified and live on TrustNest.' 
              : 'Super Admin manages final approval and publication.'}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {currentStatus === 'PUBLISHED' ? (
              <Link 
                href="/"
                target="_blank"
                className="flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <span>Open Public Homepage</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/super-admin"
                className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors text-center"
              >
                Open Super Admin Queue
              </Link>
            )}
            <a 
              href="mailto:support@trustnest.com"
              className="flex items-center justify-center gap-2 flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <HelpCircle className="w-4 h-4" /> Contact Support
            </a>
          </div>
        </div>

      </div>
    </>
  )
}
