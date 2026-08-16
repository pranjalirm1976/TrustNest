'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import InvoiceCard from './InvoiceCard'
import PaymentHistoryTable from './PaymentHistoryTable'
import PayRentModal from './PayRentModal'
import { CreditCard } from 'lucide-react'

type Payment = {
  id: string
  amount: number
  dueDate: Date
  paidDate: Date | null
  status: string // "PENDING" | "PAID" | "OVERDUE"
  transactionId: string | null
  billingMonth: string
}

interface PaymentsClientProps {
  payments: Payment[]
}

export default function PaymentsClient({ payments }: PaymentsClientProps) {
  const router = useRouter()
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)

  // Find active unpaid invoice (PENDING or OVERDUE)
  const outstandingInvoice = payments.find(
    (pay) => pay.status === 'PENDING' || pay.status === 'OVERDUE'
  ) || null

  const handleUpdate = () => {
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header Title */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
          <CreditCard className="w-6 h-6 text-brand-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payments & Invoices</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your monthly rent invoices, security deposits and transaction history logs.
          </p>
        </div>
      </div>

      {/* Invoice Card */}
      <InvoiceCard
        invoice={outstandingInvoice}
        onPayTrigger={() => setShowCheckoutModal(true)}
      />

      {/* Payment History Table */}
      <PaymentHistoryTable payments={payments} />

      {/* Pay Dues Checkout Modal */}
      {showCheckoutModal && outstandingInvoice && (
        <PayRentModal
          invoice={outstandingInvoice}
          onClose={() => setShowCheckoutModal(false)}
          onSuccess={() => {
            setShowCheckoutModal(false)
            handleUpdate()
          }}
        />
      )}

    </div>
  )
}
