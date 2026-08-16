'use client'

import { CreditCard, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'

type Payment = {
  id: string
  amount: number
  dueDate: Date
  status: string
  billingMonth: string
}

interface InvoiceCardProps {
  invoice: Payment | null
  onPayTrigger: () => void
}

export default function InvoiceCard({ invoice, onPayTrigger }: InvoiceCardProps) {
  if (!invoice) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium-sm text-center py-10 flex flex-col items-center justify-center gap-2">
        <CheckCircle2 className="w-10 h-10 text-brand-success" />
        <h3 className="text-base font-bold text-slate-800">Stay Account Paid</h3>
        <p className="text-xs text-slate-400 max-w-xs leading-normal">
          You have no outstanding rent balances. Dues are fully paid for this billing cycle.
        </p>
      </div>
    )
  }

  const isOverdue = invoice.status === 'OVERDUE'

  return (
    <div className={`bg-white border rounded-2xl p-6 shadow-premium-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 ${
      isOverdue ? 'border-brand-danger/35 ring-2 ring-red-50' : 'border-slate-205'
    }`}>
      
      {/* Information detail area */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">Outstanding Invoice</span>
          
          <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${
            isOverdue ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-amber-100 text-amber-700'
          }`}>
            {invoice.status}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-bold">Billing Cycle: {invoice.billingMonth}</span>
          <span className="text-3xl font-extrabold text-slate-900 mt-1 font-mono tracking-tight">
            ₹{invoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-1">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>Pay Before: {new Date(invoice.dueDate).toLocaleDateString('en-IN')}</span>
        </div>
      </div>

      {/* Payment Checkout trigger CTA */}
      <button
        onClick={onPayTrigger}
        className="bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-sm px-6 py-4 rounded-xl shadow-premium hover:shadow-premium-lg transition-all duration-200 hover:-translate-y-[1px] flex items-center justify-center gap-2 cursor-pointer self-stretch sm:self-auto shrink-0"
      >
        <CreditCard className="w-4 h-4" />
        <span>Process Payment</span>
      </button>

    </div>
  )
}
