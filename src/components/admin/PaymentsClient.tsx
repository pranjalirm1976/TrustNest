'use client'

import { useState } from 'react'
import { 
  IndianRupee, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  ChevronDown,
  Building2,
  Search,
  Filter,
  Download,
  Plus,
  X,
  Bell,
  Clock,
  Check,
  RefreshCw,
  CreditCard
} from 'lucide-react'
import { recordManualPayment } from '@/actions/payment.actions'
import { updatePaymentStatus } from '@/actions/financials'

export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE'
export type PaymentMethod = 'UPI' | 'Bank Transfer' | 'Cash' | 'Card' | '-'

export interface Transaction {
  id: string
  date: string
  resident: string
  room: string
  amount: number
  method: string
  status: PaymentStatus
  isBookingPayment?: boolean
}

export interface BedStatus {
  id: string
  identifier: string
  resident: string | null
  status: PaymentStatus
  amount: number
}

export interface RoomBreakdown {
  number: string
  beds: BedStatus[]
}

export interface FloorData {
  id: string
  name: string
  expected: number
  collected: number
  rooms: RoomBreakdown[]
}

export interface OccupiedBedOption {
  id: string
  label: string
  rentAmount: number
}

interface PaymentsClientProps {
  initialTransactions?: Transaction[]
  initialFloors?: FloorData[]
  initialMetrics?: {
    totalExpected: number
    totalCollected: number
    totalPending: number
    collectionRate: number
  }
  occupiedBeds?: OccupiedBedOption[]
  ownerSubscription?: any
}

export default function PaymentsClient({
  initialTransactions,
  initialFloors,
  initialMetrics,
  occupiedBeds = [],
  ownerSubscription
}: PaymentsClientProps) {
  const [viewMode, setViewMode] = useState<'floor' | 'history'>('floor')
  const [expandedFloors, setExpandedFloors] = useState<Record<string, boolean>>({'f1': true, '0': true, '1': true})
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [updatingPaymentId, setUpdatingPaymentId] = useState<string | null>(null)
  
  // Local state for transactions & floors to allow optimistic updates
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions || [
    { id: 'TRX-9821', date: '02 Aug 2026, 10:30 AM', resident: 'Rahul Kumar', room: '101', amount: 8500, method: 'UPI', status: 'PAID' },
    { id: 'TRX-9822', date: '01 Aug 2026, 09:15 AM', resident: 'Vikas Sharma', room: '102', amount: 14000, method: 'Bank Transfer', status: 'PAID' },
    { id: 'TRX-9823', date: '01 Aug 2026, 04:00 PM', resident: 'Sanjay Gupta', room: '102', amount: 14000, method: 'UPI', status: 'PAID' },
    { id: 'TRX-9824', date: '05 Aug 2026, 12:00 PM', resident: 'Amit Singh', room: '101', amount: 8500, method: 'Cash', status: 'PENDING' },
    { id: 'TRX-9825', date: '28 Jul 2026, 11:30 AM', resident: 'Rohan Das', room: '304', amount: 12000, method: '-', status: 'OVERDUE' },
  ])

  const [floors, setFloors] = useState<FloorData[]>(initialFloors || [
    {
      id: 'f1', name: 'Ground Floor', expected: 50000, collected: 45000,
      rooms: [
        {
          number: '101',
          beds: [
            { id: 'b1', identifier: 'A', resident: 'Rahul Kumar', status: 'PAID', amount: 8500 },
            { id: 'b2', identifier: 'B', resident: 'Amit Singh', status: 'PENDING', amount: 8500 },
            { id: 'b3', identifier: 'C', resident: null, status: 'PAID', amount: 0 }
          ]
        },
        {
          number: '102',
          beds: [
            { id: 'b4', identifier: 'A', resident: 'Vikas Sharma', status: 'PAID', amount: 14000 },
            { id: 'b5', identifier: 'B', resident: 'Sanjay Gupta', status: 'PAID', amount: 14000 }
          ]
        }
      ]
    },
    {
      id: 'f2', name: '1st Floor', expected: 48000, collected: 48000,
      rooms: [
        {
          number: '201',
          beds: [
            { id: 'b6', identifier: 'A', resident: 'Priya Patel', status: 'PAID', amount: 16000 },
            { id: 'b7', identifier: 'B', resident: 'Neha Sharma', status: 'PAID', amount: 16000 },
            { id: 'b8', identifier: 'C', resident: 'Anjali Verma', status: 'PAID', amount: 16000 }
          ]
        }
      ]
    }
  ])

  const [manualBedId, setManualBedId] = useState(occupiedBeds[0]?.id || '')
  const [manualAmount, setManualAmount] = useState(occupiedBeds[0]?.rentAmount ? String(occupiedBeds[0].rentAmount) : '8500')
  const [manualMethod, setManualMethod] = useState('Cash')
  const [manualTxnId, setManualTxnId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<{text: string, type: 'success'|'error'} | null>(null)

  // Calculations
  const calculatedExpected = initialMetrics?.totalExpected ?? transactions.reduce((acc, t) => acc + t.amount, 0)
  const calculatedCollected = initialMetrics?.totalCollected ?? transactions.filter(t => t.status === 'PAID').reduce((acc, t) => acc + t.amount, 0)
  const totalPending = calculatedExpected - calculatedCollected
  const collectionRate = calculatedExpected === 0 ? 0 : Math.round((calculatedCollected / calculatedExpected) * 100)

  const toggleFloor = (id: string) => {
    setExpandedFloors(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Status Styling
  const statusColors: Record<PaymentStatus, string> = {
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    OVERDUE: 'bg-red-50 text-red-700 border-red-200'
  }

  const rateColor = collectionRate >= 90 ? 'text-emerald-600' : 'text-amber-600'
  const rateIconColor = collectionRate >= 90 ? 'text-emerald-500' : 'text-amber-500'

  const handleStatusChange = async (paymentId: string, newStatus: PaymentStatus, method?: string) => {
    setUpdatingPaymentId(paymentId)
    const prevTransactions = [...transactions]
    
    // Optimistic UI update
    setTransactions(prev => prev.map(t => t.id === paymentId ? { ...t, status: newStatus } : t))

    try {
      const res = await updatePaymentStatus(paymentId, newStatus, method)
      if (res.success) {
        setToastMessage({ text: `Payment marked as ${newStatus}`, type: 'success' })
      } else {
        setTransactions(prevTransactions)
        setToastMessage({ text: res.error || 'Failed to update payment status', type: 'error' })
      }
    } catch (e: any) {
      setTransactions(prevTransactions)
      setToastMessage({ text: e.message || 'Error occurred', type: 'error' })
    } finally {
      setUpdatingPaymentId(null)
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  const handleManualPayment = async () => {
    if (!manualBedId || !manualAmount) {
      setToastMessage({ text: 'Please select a bed and enter an amount', type: 'error' })
      return
    }
    setIsSubmitting(true)
    try {
      const txnRef = manualTxnId.trim() || `CASH-${Date.now().toString().slice(-6)}`
      const res = await recordManualPayment(manualBedId, parseFloat(manualAmount), txnRef)
      if (res.success) {
        setPaymentModalOpen(false)
        setManualTxnId('')
        setToastMessage({ text: 'Manual payment recorded successfully!', type: 'success' })
      } else {
        setToastMessage({ text: res.error || 'Failed to record payment', type: 'error' })
      }
    } catch (e: any) {
      setToastMessage({ text: e.message || 'Error', type: 'error' })
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  const filteredHistory = transactions.filter(t => {
    const matchesSearch = t.resident.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col h-full gap-6 relative">
      
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 border ${
            toastMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <CheckCircle2 className={`w-5 h-5 ${toastMessage.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`} />
            <span className="text-sm font-bold">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Owner TrustNest Platform Subscription Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-indigo-300 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest font-mono">Platform Subscription</span>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full uppercase">
                {ownerSubscription?.status === 'ACTIVE' ? 'Active' : 'Pro Plan Active'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-0.5">TrustNest PG Pro Plan — ₹2,000 / month</h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-xl leading-relaxed">
              Fixed monthly software &amp; listing fee. 100% of resident rent is settled directly to your bank account with ₹0 platform commission.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Renewal Date</span>
            <span className="text-xs font-bold text-white font-mono">
              {ownerSubscription?.currentPeriodEnd 
                ? new Date(ownerSubscription.currentPeriodEnd).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : '1st of next month'}
            </span>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Building2 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Expected Rent</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            ₹{calculatedExpected.toLocaleString('en-IN')}
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Collected</span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 tabular-nums">
            ₹{calculatedCollected.toLocaleString('en-IN')}
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 tabular-nums">
            ₹{Math.max(0, totalPending).toLocaleString('en-IN')}
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <TrendingUp className={`w-4 h-4 ${rateIconColor}`} />
            <span className="text-xs font-bold uppercase tracking-wider">Collection Rate</span>
          </div>
          <div className={`text-3xl font-extrabold tabular-nums ${rateColor}`}>
            {collectionRate}%
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col min-h-0 relative z-0">
        
        {/* Toolbar */}
        <div className="border-b border-slate-100 p-4 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0 rounded-t-xl">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => setViewMode('floor')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${viewMode === 'floor' ? 'bg-white shadow-sm text-indigo-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Floor-wise Breakdown
            </button>
            <button 
              onClick={() => setViewMode('history')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${viewMode === 'history' ? 'bg-white shadow-sm text-indigo-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Transaction History
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setToastMessage({ text: 'Rent payment reminders sent to pending residents!', type: 'success' })}
              className="flex items-center gap-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              <Bell className="w-4 h-4 text-indigo-600" /> Send Reminders
            </button>
            <button 
              onClick={() => setPaymentModalOpen(true)}
              className="flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Record Manual Payment
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30 custom-scrollbar p-0">
          
          {viewMode === 'floor' ? (
            <div className="p-4 sm:p-6 space-y-4">
              {floors.map(floor => {
                const isExpanded = expandedFloors[floor.id] ?? true
                const floorPercentage = floor.expected > 0 ? Math.round((floor.collected / floor.expected) * 100) : 100
                return (
                  <div key={floor.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all">
                    {/* Accordion Header */}
                    <button 
                      onClick={() => toggleFloor(floor.id)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 bg-white hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        <h3 className="text-base font-bold text-slate-900">{floor.name}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="hidden sm:block text-slate-500 font-medium tabular-nums">
                          ₹{floor.collected.toLocaleString('en-IN')} <span className="text-slate-400 font-normal">/ ₹{floor.expected.toLocaleString('en-IN')} collected</span>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-bold tabular-nums ${floorPercentage >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                          {floorPercentage}%
                        </div>
                      </div>
                    </button>
                    
                    {/* Accordion Body */}
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[3000px] border-t border-slate-100 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="p-4 sm:p-5 bg-slate-50 space-y-4">
                        {floor.rooms.map(room => (
                          <div key={room.number} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col lg:flex-row gap-4 lg:items-center">
                            <div className="w-24 shrink-0">
                              <span className="text-sm font-bold text-slate-900">Room {room.number}</span>
                            </div>
                            
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                              {room.beds.map(bed => {
                                if (!bed.resident) {
                                  return (
                                    <div key={bed.id} className="flex items-center justify-between p-3 border border-dashed border-slate-200 bg-slate-50/50 rounded-lg text-slate-400 text-xs">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold">Bed {bed.identifier}:</span>
                                        <span>Vacant</span>
                                      </div>
                                    </div>
                                  )
                                }
                                return (
                                  <div key={bed.id} className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-white border border-slate-200 text-slate-600 rounded flex items-center justify-center font-bold text-sm shrink-0">
                                        {bed.identifier}
                                      </div>
                                      <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-slate-900 truncate">{bed.resident}</p>
                                        <p className="text-[10px] font-semibold text-slate-500 tabular-nums mt-0.5">₹{bed.amount.toLocaleString('en-IN')}</p>
                                      </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${statusColors[bed.status] || statusColors.PENDING}`}>
                                      {bed.status}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* History Filter Bar */}
              <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center gap-4 shrink-0">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search by resident, room, or ID..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 shadow-sm"
                  />
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-semibold text-slate-500">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg shadow-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PAID">Paid</option>
                    <option value="PENDING">Pending</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                </div>

                <button 
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8," 
                      + ["Date,ID,Resident,Room,Amount,Method,Status"].join(",") + "\n"
                      + filteredHistory.map(t => `"${t.date}","${t.id}","${t.resident}","${t.room}","${t.amount}","${t.method}","${t.status}"`).join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `financials_report_${new Date().toISOString().slice(0,10)}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg shadow-sm transition-colors ml-auto"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>

              {/* History Table */}
              <div className="flex-1 overflow-x-auto bg-white custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction / Invoice ID</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Resident / Unit</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action / Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                          No transaction records found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map(t => (
                        <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate-600">{t.date}</td>
                          <td className="px-6 py-4 text-sm font-mono font-medium text-slate-900">{t.id}</td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-900">{t.resident}</p>
                            <p className="text-xs text-slate-500">Room / Unit: {t.room}</p>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900 tabular-nums text-right">
                            ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded w-max inline-block">
                              {t.method || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <select
                                value={t.status}
                                disabled={updatingPaymentId === t.id}
                                onChange={(e) => handleStatusChange(t.id, e.target.value as PaymentStatus)}
                                className={`text-xs font-bold px-2.5 py-1 rounded-md border cursor-pointer outline-none transition-colors ${statusColors[t.status] || statusColors.PENDING}`}
                              >
                                <option value="PAID">PAID</option>
                                <option value="PENDING">PENDING</option>
                                <option value="OVERDUE">OVERDUE</option>
                              </select>
                              {updatingPaymentId === t.id && (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Manual Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setPaymentModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Record Cash / Manual Payment</h2>
              <button onClick={() => setPaymentModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Select Bed / Resident</label>
                {occupiedBeds.length > 0 ? (
                  <select 
                    value={manualBedId}
                    onChange={(e) => {
                      setManualBedId(e.target.value)
                      const sel = occupiedBeds.find(b => b.id === e.target.value)
                      if (sel) setManualAmount(String(sel.rentAmount))
                    }}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 bg-white shadow-sm"
                  >
                    {occupiedBeds.map(b => (
                      <option key={b.id} value={b.id}>{b.label}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    value={manualBedId}
                    onChange={(e) => setManualBedId(e.target.value)}
                    placeholder="Enter Bed ID (e.g. b1)" 
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 shadow-sm"
                  />
                )}
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Amount Collected (₹)</label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="number" 
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    placeholder="0.00" 
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium tabular-nums focus:outline-none focus:border-indigo-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payment Mode</label>
                <select
                  value={manualMethod}
                  onChange={(e) => setManualMethod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 bg-white shadow-sm"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Receipt Note / Reference (Optional)</label>
                <textarea 
                  rows={2}
                  value={manualTxnId}
                  onChange={(e) => setManualTxnId(e.target.value)}
                  placeholder="e.g., Cash collected in person by manager" 
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 shadow-sm resize-none"
                />
              </div>
            </div>
            
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button 
                onClick={() => setPaymentModalOpen(false)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 text-sm font-semibold py-2.5 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleManualPayment}
                disabled={isSubmitting || !manualBedId || !manualAmount}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors shadow-sm"
              >
                {isSubmitting ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
