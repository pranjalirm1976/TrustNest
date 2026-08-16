'use client'

import { useState } from 'react'
import { processRentPayment } from '@/actions/payment.actions'
import { X, ShieldCheck, CreditCard, Loader2, CheckCircle2 } from 'lucide-react'

type Payment = {
  id: string
  amount: number
  dueDate: Date
  status: string
  billingMonth: string
}

interface PayRentModalProps {
  invoice: Payment
  onClose: () => void
  onSuccess: () => void
}

export default function PayRentModal({
  invoice,
  onClose,
  onSuccess,
}: PayRentModalProps) {
  const [paymentMode, setPaymentMode] = useState('UPI')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    try {
      // Execute the server action to update db
      await processRentPayment(invoice.id)
      
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        onSuccess()
      }, 2000)

    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Failed to complete payment checkout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Modal box */}
      <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-md shadow-premium-lg overflow-hidden flex flex-col p-6 animate-in gap-6">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-brand-primary" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Secure Payment Gateway</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-650 border border-slate-200 p-2 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {showSuccess && (
          <div className="bg-brand-success-light border border-brand-success/15 text-brand-success rounded-xl p-4 text-xs font-semibold flex items-center gap-2 animate-in text-center justify-center">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Rent payment processed successfully! Invoice updated.</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-brand-danger-light border border-brand-danger/15 text-brand-danger rounded-xl p-3.5 text-xs font-semibold animate-in">
            {errorMsg}
          </div>
        )}

        {!showSuccess && (
          <form onSubmit={handleCheckout} className="flex flex-col gap-5">
            {/* Invoice parameters */}
            <div className="bg-slate-50 border border-slate-200/40 p-4 rounded-2xl flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest font-mono">Invoice Summary</span>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mt-1">
                <span>Month Dues ({invoice.billingMonth})</span>
                <span className="text-slate-950 font-extrabold font-mono">₹{invoice.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment options */}
            <div className="flex flex-col gap-2 text-xs font-semibold">
              <label className="text-slate-550 uppercase tracking-widest">Select Payment Method</label>
              
              <div className="grid grid-cols-3 gap-3">
                {['UPI', 'CARD', 'NETBANKING'].map((mode) => (
                  <label 
                    key={mode}
                    className={`flex flex-col items-center justify-center border p-3 rounded-xl cursor-pointer select-none transition-all ${
                      paymentMode === mode 
                        ? 'bg-indigo-50/50 border-brand-primary text-slate-900 font-extrabold shadow-premium-sm' 
                        : 'bg-[#fbfbfb] border-slate-200 hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMode"
                      value={mode}
                      checked={paymentMode === mode}
                      onChange={() => setPaymentMode(mode)}
                      className="sr-only"
                    />
                    <span className="text-[10px] font-bold font-mono">{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Secure badge details */}
            <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-3.5 flex gap-2.5 items-start mt-1">
              <ShieldCheck className="w-5 h-5 text-brand-success shrink-0" />
              <p className="text-[10px] text-emerald-950 leading-relaxed font-semibold">
                TrustNest uses bank-grade 256-bit encryption. Checkout placeholder stands ready for Razerpay/Stripe client SDK injection.
              </p>
            </div>

            {/* Submit checkout */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-sm py-4 rounded-xl shadow-premium hover:shadow-premium-lg transition-all duration-200 hover:-translate-y-[1px] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Payment Dues...</span>
                </>
              ) : (
                <span>Authorize & Pay ₹{invoice.amount.toLocaleString('en-IN')}</span>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  )
}
