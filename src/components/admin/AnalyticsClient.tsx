'use client'

import { useState } from 'react'
import { 
  DollarSign, 
  IndianRupee, 
  TrendingUp, 
  BedDouble, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  BarChart3, 
  ShieldCheck,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts'

export interface RevenueMonthData {
  month: string
  expected: number
  collected: number
  pending: number
}

export interface OccupancyTrendData {
  month: string
  totalBeds: number
  occupiedBeds: number
  occupancyRate: number
}

export interface ComplaintCategoryData {
  category: string
  total: number
  resolved: number
  avgHours: number
}

export interface AnalyticsData {
  trustScore: number
  totalRevenue: number
  collectionRate: number
  currentOccupancyRate: number
  totalBeds: number
  occupiedBeds: number
  vacantBeds: number
  maintenanceBeds: number
  avgResolutionHours: number
  slaComplianceRate: number
  totalComplaints: number
  slaBreaches: number
  revenueTrends: RevenueMonthData[]
  occupancyTrends: OccupancyTrendData[]
  complaintsByCategory: ComplaintCategoryData[]
}

interface AnalyticsClientProps {
  data: AnalyticsData
}

export default function AnalyticsClient({ data }: AnalyticsClientProps) {
  const [timeRange, setTimeRange] = useState<'6m' | '12m'>('6m')

  // Custom Tooltip
  const CurrencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-xs font-semibold px-3 py-2.5 rounded-lg shadow-xl border border-slate-700">
          <p className="mb-1 text-slate-400 font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="flex items-center gap-2 py-0.5" style={{ color: entry.color }}>
              <span>{entry.name}:</span>
              <span className="font-bold tabular-nums">₹{entry.value.toLocaleString('en-IN')}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const StandardTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-xs font-semibold px-3 py-2.5 rounded-lg shadow-xl border border-slate-700">
          <p className="mb-1 text-slate-400 font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="flex items-center gap-2 py-0.5" style={{ color: entry.color }}>
              <span>{entry.name}:</span>
              <span className="font-bold tabular-nums">{entry.value}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const exportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Metric,Value\n"
      + `TrustScore,${data.trustScore}\n`
      + `Total Revenue,${data.totalRevenue}\n`
      + `Collection Rate,${data.collectionRate}%\n`
      + `Occupancy Rate,${data.currentOccupancyRate}%\n`
      + `Total Beds,${data.totalBeds}\n`
      + `Occupied Beds,${data.occupiedBeds}\n`
      + `SLA Compliance Rate,${data.slaComplianceRate}%\n`
      + `Avg Resolution Time (Hours),${data.avgResolutionHours}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Header & Export Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Analytics & Performance Reports</h2>
          <p className="text-sm text-slate-500 mt-0.5">Aggregated financial trends, room occupancy, and 24-hour SLA operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Report (.csv)
          </button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected Revenue */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider">Collected Revenue</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {data.collectionRate}% Rate
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            ₹{data.totalRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 mt-2">Aggregated across all verified bookings</p>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider">Live Occupancy</span>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              {data.occupiedBeds}/{data.totalBeds} Beds
            </span>
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 tabular-nums">
            {data.currentOccupancyRate}%
          </div>
          <p className="text-xs text-slate-500 mt-2">{data.vacantBeds} beds available for leasing</p>
        </div>

        {/* SLA Compliance */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider">24h SLA Compliance</span>
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              data.slaBreaches > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {data.slaBreaches} Breaches
            </span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 tabular-nums">
            {data.slaComplianceRate}%
          </div>
          <p className="text-xs text-slate-500 mt-2">Avg resolution time: <span className="font-bold text-slate-800 tabular-nums">{data.avgResolutionHours}h</span></p>
        </div>

        {/* TrustNest Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold uppercase tracking-wider">TrustNest Score</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Verified Tier
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            {data.trustScore.toFixed(1)} <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Live score factoring audits & reviews</p>
        </div>
      </div>

      {/* Row 1: Revenue & Rent Collection Trends */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col h-[380px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Monthly Revenue & Collection Analysis</h3>
            <p className="text-xs text-slate-500 mt-0.5">Expected vs. Collected rent comparison over previous billing cycles.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-indigo-600 rounded-sm inline-block"></span> Expected</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 rounded-sm inline-block"></span> Collected</span>
          </div>
        </div>
        
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.revenueTrends} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={8} />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                tickFormatter={(val) => `₹${val / 1000}k`}
              />
              <Tooltip content={<CurrencyTooltip />} />
              <Bar dataKey="expected" name="Expected" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Bar dataKey="collected" name="Collected" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Occupancy & SLA Matrix (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Occupancy Rate Over Time */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col h-[360px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Bed Occupancy Trajectory</h3>
              <p className="text-xs text-slate-500 mt-0.5">Historical occupancy rate % across your inventory.</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
              Capacity: {data.totalBeds} Beds
            </span>
          </div>

          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.occupancyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="occupancyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={6} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${val}%`} />
                <Tooltip content={<StandardTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="occupancyRate" 
                  name="Occupancy Rate (%)" 
                  stroke="#4f46e5" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#occupancyGrad)" 
                  dot={{ r: 4, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 24-Hour SLA Performance & Category Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col h-[360px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">SLA Resolution by Category</h3>
              <p className="text-xs text-slate-500 mt-0.5">Speed and volume across ticket categories.</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" /> 24h Threshold
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase">Category</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase text-center">Total</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase text-center">Resolved</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-slate-500 uppercase text-right">Avg Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.complaintsByCategory.map((c) => (
                  <tr key={c.category} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3 text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      {c.category}
                    </td>
                    <td className="px-3 py-3 text-xs text-center text-slate-600 font-medium tabular-nums">
                      {c.total}
                    </td>
                    <td className="px-3 py-3 text-xs text-center font-bold text-emerald-600 tabular-nums">
                      {c.resolved}
                    </td>
                    <td className="px-3 py-3 text-xs text-right font-semibold text-slate-700 tabular-nums">
                      {c.avgHours > 0 ? `${c.avgHours} hrs` : '< 1 hr'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
