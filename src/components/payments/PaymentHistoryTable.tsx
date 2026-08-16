'use client'

import { Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

type Payment = {
  id: string
  amount: number
  dueDate: Date
  paidDate: Date | null
  status: string // "PENDING" | "PAID" | "OVERDUE"
  transactionId: string | null
  billingMonth: string
}

interface PaymentHistoryTableProps {
  payments: Payment[]
}

export default function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-premium-sm overflow-hidden flex flex-col w-full">
      {/* Title */}
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Billing & Payment History</h3>
      </div>

      {payments.length === 0 ? (
        <div className="p-8 text-center text-slate-400 text-xs italic">
          No billing history records found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold text-slate-600">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                <th className="py-3 px-6">Billing Month</th>
                <th className="py-3 px-6 text-right">Amount</th>
                <th className="py-3 px-6">Due Date</th>
                <th className="py-3 px-6">Paid Date</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 font-mono">Transaction ID</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {payments.map((pay) => {
                let statusColor = 'bg-slate-100 text-slate-700'
                if (pay.status === 'PAID') statusColor = 'bg-emerald-100/70 text-emerald-700'
                if (pay.status === 'PENDING') statusColor = 'bg-amber-100/70 text-amber-700'
                if (pay.status === 'OVERDUE') statusColor = 'bg-red-100/70 text-red-700'

                return (
                  <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-slate-900 font-bold">{pay.billingMonth}</td>
                    <td className="py-4 px-6 text-right text-slate-900 font-extrabold font-mono tabular-nums">
                      ₹{pay.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-slate-450">
                      {new Date(pay.dueDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-4 px-6 text-slate-450">
                      {pay.paidDate ? new Date(pay.paidDate).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${statusColor}`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-[10px] text-slate-400">
                      {pay.transactionId || '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
