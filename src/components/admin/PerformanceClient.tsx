'use client'

import { useState } from 'react'
import { 
  Download, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts'

// --- Mock Data ---
const satisfactionData = [
  { date: '01 Aug', score: 4.1 },
  { date: '05 Aug', score: 4.2 },
  { date: '10 Aug', score: 4.1 },
  { date: '15 Aug', score: 4.5 },
  { date: '20 Aug', score: 4.6 },
  { date: '25 Aug', score: 4.7 },
  { date: '30 Aug', score: 4.8 },
]

const categoryData = [
  { category: 'Food', score: 4.1, fullMark: 5 },
  { category: 'Cleanliness', score: 4.8, fullMark: 5 },
  { category: 'Management', score: 4.7, fullMark: 5 },
  { category: 'Maintenance', score: 4.4, fullMark: 5 },
  { category: 'Facilities', score: 4.5, fullMark: 5 },
]

export default function PerformanceClient({ initialScore = 4.8 }: { initialScore?: number }) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  // Derive score metrics
  const displayScore = initialScore.toFixed(1)
  const [isNewPG, setIsNewPG] = useState(false) // Toggle for zero state
  
  const currentScore = initialScore

  // Custom Minimal Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg border border-slate-700">
          <p className="mb-0.5 text-slate-400 font-medium">{label}</p>
          <p className="text-white">Score: {payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  if (isNewPG) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center bg-white border border-slate-200 rounded-xl shadow-sm p-12 mt-6">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
          <TrendingUp className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Insufficient data</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Complete one full month of operations to unlock performance insights and generate your algorithmic TrustNest Score.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-4 shrink-0">
        <div className="relative">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 shadow-sm appearance-none cursor-pointer"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last Quarter</option>
          </select>
          <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg shadow-sm transition-colors">
          <Download className="w-4 h-4" />
          Download Monthly Report
        </button>
      </div>

      {/* TrustNest Score Hero Widget */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        <div className="p-8 md:p-10 bg-indigo-600 flex flex-col items-center justify-center text-white min-w-[280px]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-2">TrustNest Score</h2>
          <div className="text-7xl font-extrabold tabular-nums tracking-tighter mb-2">
            {currentScore.toFixed(1)}
          </div>
          <p className="text-sm font-medium text-indigo-100 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Excellent Status
          </p>
        </div>
        
        <div className="flex-1 p-6 md:p-8 bg-slate-50">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Algorithmic Calculation Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Resident Feedback (40% Weight)</span>
                <span className="text-slate-900 tabular-nums">4.5 / 5.0</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">SLA Compliance (35% Weight)</span>
                <span className="text-slate-900 tabular-nums">4.8 / 5.0</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600">Occupancy & Retention (25% Weight)</span>
                <span className="text-slate-900 tabular-nums">4.2 / 5.0</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Widgets (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Resident Satisfaction Trend */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col h-[360px]">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Resident Satisfaction Trend</h3>
          <p className="text-xs text-slate-500 mb-6">30-day trailing average based on micro-feedback.</p>
          
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={satisfactionData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  domain={[3, 5]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#4f46e5" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaint Resolution SLA Widget */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col h-[360px]">
          <h3 className="text-sm font-bold text-slate-900 mb-1">SLA Resolution Engine</h3>
          <p className="text-xs text-slate-500 mb-6">Tracking the strict 24-hour response matrix.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">Within SLA</span>
              <span className="text-3xl font-extrabold text-emerald-700 tabular-nums">96%</span>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 relative overflow-hidden group">
              <div className="absolute top-2 right-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 block mb-1">Violations</span>
              <span className="text-3xl font-extrabold text-red-700 tabular-nums">3</span>
              <p className="text-[10px] font-semibold text-red-500 mt-1">Impacts Score by -0.15</p>
            </div>
          </div>
          
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Violation Breakdown</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-600">Maintenance (AC)</span>
                <span className="font-bold text-red-600 tabular-nums">2 Tickets</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-600">Cleaning</span>
                <span className="font-bold text-red-600 tabular-nums">1 Ticket</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown (Full Width) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 mb-6">Operational Category Benchmarks</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  domain={[0, 5]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }} 
                />
                <YAxis 
                  type="category" 
                  dataKey="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} 
                  width={100}
                />
                <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score < 4.2 ? '#f59e0b' : '#4f46e5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  )
}
