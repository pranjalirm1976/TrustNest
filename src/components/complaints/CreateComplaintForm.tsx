'use client'

import { useState } from 'react'
import { createComplaint } from '@/actions/complaint.actions'
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'

interface CreateComplaintFormProps {
  propertyId: string
  onSuccess: () => void
}

export default function CreateComplaintForm({
  propertyId,
  onSuccess,
}: CreateComplaintFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('PLUMBING')
  const [severity, setSeverity] = useState('MEDIUM')
  
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    try {
      await createComplaint({
        title,
        description,
        category,
        severity,
        propertyId,
      })

      setShowSuccess(true)
      setTitle('')
      setDescription('')
      
      setTimeout(() => {
        setShowSuccess(false)
        onSuccess()
      }, 2000)

    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Failed to file complaint ticket. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium-sm flex flex-col gap-5">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <AlertCircle className="w-5 h-5 text-brand-primary" />
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">File Support Ticket</h3>
      </div>

      {showSuccess && (
        <div className="bg-brand-success-light border border-brand-success/15 text-brand-success rounded-xl p-3.5 text-xs font-semibold flex items-center gap-2.5 animate-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Ticket filed successfully! Enforcing 24h SLA response countdown.</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-brand-danger-light border border-brand-danger/15 text-brand-danger rounded-xl p-3.5 text-xs font-semibold animate-in">
          {errorMsg}
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col gap-1 text-xs font-semibold">
        <label className="text-slate-500 uppercase tracking-widest">Issue Title</label>
        <input
          type="text"
          placeholder="e.g. WiFi router disconnected in corridor"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="bg-[#fbfbfb] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-indigo-50 transition-all font-semibold"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Category */}
        <div className="flex flex-col gap-1 text-xs font-semibold">
          <label className="text-slate-500 uppercase tracking-widest">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[#fbfbfb] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-indigo-50 transition-all font-semibold cursor-pointer"
          >
            <option value="PLUMBING">Plumbing</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="INTERNET">Internet / WiFi</option>
            <option value="FOOD">Daily Meals</option>
            <option value="CLEANING">Housekeeping</option>
            <option value="OTHER">Other / Misc</option>
          </select>
        </div>

        {/* Severity */}
        <div className="flex flex-col gap-1 text-xs font-semibold">
          <label className="text-slate-500 uppercase tracking-widest">Severity</label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="bg-[#fbfbfb] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-indigo-50 transition-all font-semibold cursor-pointer"
          >
            <option value="LOW">Low - General Dues</option>
            <option value="MEDIUM">Medium - Functional Interruption</option>
            <option value="HIGH">High - Immediate Hazard</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1 text-xs font-semibold">
        <label className="text-slate-500 uppercase tracking-widest">Detailed Description</label>
        <textarea
          rows={3}
          placeholder="Please explain the issue details so the operator can assign the right technician..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="bg-[#fbfbfb] border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary/50 focus:ring-2 focus:ring-indigo-50 transition-all font-semibold resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || showSuccess}
        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 rounded-xl shadow-premium-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Submitting Ticket...</span>
          </>
        ) : (
          <span>File Support Ticket (Enforce SLA)</span>
        )}
      </button>

    </form>
  )
}
