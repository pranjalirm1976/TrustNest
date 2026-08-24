'use client'

import { useState } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  X,
  User,
  Phone,
  FileText,
  CreditCard,
  Building,
  Calendar,
  AlertCircle,
  ShieldCheck
} from 'lucide-react'

// --- Mock Data ---
type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE'

interface Resident {
  id: string
  name: string
  room: string
  bed: string
  floor: string
  mobile: string // Real mobile, we will mask it visually
  joiningDate: string
  rent: number
  paymentStatus: PaymentStatus
  avatarInitials: string
}

const mockResidents: Resident[] = [
  { id: '1', name: 'Rahul Kumar', room: '101', bed: 'A', floor: 'Ground', mobile: '+919876543210', joiningDate: '12 Aug 2026', rent: 8500, paymentStatus: 'PAID', avatarInitials: 'RK' },
  { id: '2', name: 'Amit Singh', room: '101', bed: 'B', floor: 'Ground', mobile: '+919812345678', joiningDate: '01 Aug 2026', rent: 8500, paymentStatus: 'PENDING', avatarInitials: 'AS' },
  { id: '3', name: 'Sanjay Gupta', room: '201', bed: 'A', floor: '1st', mobile: '+919898989898', joiningDate: '15 Jul 2026', rent: 18000, paymentStatus: 'OVERDUE', avatarInitials: 'SG' },
  { id: '4', name: 'Vikas Sharma', room: '102', bed: 'C', floor: 'Ground', mobile: '+919877766655', joiningDate: '20 Aug 2026', rent: 8500, paymentStatus: 'PAID', avatarInitials: 'VS' },
  { id: '5', name: 'Priya Patel', room: '301', bed: 'A', floor: '2nd', mobile: '+919122233344', joiningDate: '01 Sep 2026', rent: 12000, paymentStatus: 'PAID', avatarInitials: 'PP' },
]

export default function ResidentsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [floorFilter, setFloorFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [roomFilter, setRoomFilter] = useState('')
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null)
  
  // Filtering Logic
  const filteredResidents = mockResidents.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.room.includes(searchQuery)
    const matchesFloor = floorFilter === 'All' || res.floor === floorFilter
    const matchesStatus = statusFilter === 'All' || res.paymentStatus === statusFilter
    const matchesRoom = roomFilter === '' || res.room.includes(roomFilter)
    return matchesSearch && matchesFloor && matchesStatus && matchesRoom
  })

  // Visual Masking Function
  const maskMobile = (mobile: string) => {
    // Assuming +91 format: +91 98*** ***12
    if (mobile.startsWith('+91') && mobile.length === 13) {
      const code = '+91'
      const firstTwo = mobile.slice(3, 5)
      const lastTwo = mobile.slice(11, 13)
      return `${code} ${firstTwo}*** ***${lastTwo}`
    }
    return mobile // fallback
  }

  // Status Badge Colors
  const statusColors: Record<PaymentStatus, string> = {
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    OVERDUE: 'bg-red-50 text-red-700 border-red-200'
  }

  return (
    <div className="flex flex-col h-full gap-4 relative">
      
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Global Search */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search residents..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto scrollbar-hide">
            <select 
              value={floorFilter}
              onChange={(e) => setFloorFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-indigo-500 shadow-sm min-w-max"
            >
              <option value="All">All Floors</option>
              <option value="Ground">Ground</option>
              <option value="1st">1st Floor</option>
              <option value="2nd">2nd Floor</option>
            </select>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-indigo-500 shadow-sm min-w-max"
            >
              <option value="All">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
            </select>
            
            <input 
              type="text" 
              placeholder="Room #"
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:border-indigo-500 shadow-sm min-w-max"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-lg shadow-sm transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
            <Plus className="w-4 h-4" />
            Add Resident
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col min-h-0 relative z-0">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Resident Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Room #</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bed ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joining Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Rent</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm font-medium text-slate-500">
                    No residents found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredResidents.map(res => (
                  <tr 
                    key={res.id} 
                    onClick={() => setSelectedResident(res)}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {res.avatarInitials}
                        </div>
                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{res.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{res.room}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{res.bed}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-500">{maskMobile(res.mobile)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{res.joiningDate}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700 tabular-nums">₹{res.rent.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColors[res.paymentStatus]}`}>
                        {res.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Panel (Resident Details) */}
      {selectedResident && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setSelectedResident(null)}
          ></div>
          
          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-50 border-l border-slate-200 transform transition-transform duration-300 ease-in-out translate-x-0 flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">Resident Details</h2>
              <button 
                onClick={() => setSelectedResident(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-bold">
                  {selectedResident.avatarInitials}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedResident.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColors[selectedResident.paymentStatus]}`}>
                      {selectedResident.paymentStatus}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Room {selectedResident.room} - {selectedResident.bed}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
                    <Phone className="w-3.5 h-3.5" /> Mobile
                  </span>
                  <span className="text-sm font-medium text-slate-900 font-mono">{selectedResident.mobile}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
                    <Calendar className="w-3.5 h-3.5" /> Joined
                  </span>
                  <span className="text-sm font-medium text-slate-900">{selectedResident.joiningDate}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
                    <Building className="w-3.5 h-3.5" /> Floor
                  </span>
                  <span className="text-sm font-medium text-slate-900">{selectedResident.floor}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
                    <CreditCard className="w-3.5 h-3.5" /> Rent
                  </span>
                  <span className="text-sm font-medium text-slate-900 tabular-nums">₹{selectedResident.rent.toLocaleString()}</span>
                </div>
              </div>

              {/* Secure Documents */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Documents
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded text-indigo-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">Aadhar Card.pdf</p>
                        <p className="text-xs text-slate-400">Verified ID Proof</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded text-indigo-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">Lease Agreement.pdf</p>
                        <p className="text-xs text-slate-400">Signed 12 Aug 2026</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2">Emergency Contact</h4>
                <div className="bg-red-50/50 border border-red-100 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">Ramesh Kumar (Father)</p>
                    <p className="text-sm font-mono text-slate-600 mt-1">+91 91234 56789</p>
                  </div>
                </div>
              </div>
              
              {/* Payment History Preview */}
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-900">Recent Payments</h4>
                  <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View All</button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">August 2026</p>
                      <p className="text-xs text-slate-500">Paid on 02 Aug</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 tabular-nums">+₹8,500</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Security Deposit</p>
                      <p className="text-xs text-slate-500">Paid on 12 Jul</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 tabular-nums">+₹15,000</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  )
}
