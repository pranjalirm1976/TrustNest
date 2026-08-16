'use client'

import { ShieldCheck, Heart, AlertTriangle, ArrowRight, Activity, Clock, ThumbsUp } from 'lucide-react'

export default function TransparencySection() {
  return (
    <section id="transparency" className="bg-slate-50 py-24 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column: Explanation of Algorithm */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Calculated Integrity</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                The TrustNest Score Algorithm
              </h2>
              <p className="text-slate-500 leading-relaxed">
                Most PG portals allow operators to write their own descriptions and highlight fake reviews. At TrustNest, every PG carries an audit rating derived algorithmically from raw operational data.
              </p>
            </div>

            {/* LaTeX styled Formula Box */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-premium flex flex-col gap-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Formula</span>
              <div className="py-4 text-center border-y border-slate-100 flex flex-wrap items-center justify-center gap-2 font-sans text-sm sm:text-base font-extrabold text-slate-800">
                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">Score</span>
                <span>=</span>
                <span className="bg-indigo-50 text-brand-primary px-3 py-1 rounded-lg">(Reviews × 0.4)</span>
                <span>+</span>
                <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg">(Food × 0.3)</span>
                <span>+</span>
                <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg">(SLA × 0.3)</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Any outstanding complaint exceeding the 24-hour resolution SLA results in an automatic system flag, triggering an immediate 0.5 point degradation to the Trust Score.
              </p>
            </div>

            {/* Sub-parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex gap-3">
                <Heart className="w-5 h-5 text-red-500 shrink-0 mt-1" />
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-slate-900">Resident Feedback</h4>
                  <p className="text-xs text-slate-500">Only verified tenants who have logged rent payments can submit reviews.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Activity className="w-5 h-5 text-indigo-500 shrink-0 mt-1" />
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-slate-900">Food Auditing</h4>
                  <p className="text-xs text-slate-500">Live ratings on daily breakfast, lunch, and dinner photos uploaded by owners.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-brand-success shrink-0 mt-1" />
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-bold text-slate-900">24-Hour SLA</h4>
                  <p className="text-xs text-slate-500">Auto-tracked deadlines on issues like plumbing, electrical, and wifi.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Dashboard Mockup Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-premium-lg flex flex-col gap-6 relative">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-brand-primary" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Audit</span>
                </div>
                <span className="bg-brand-success-light text-brand-success text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-brand-success/15">
                  Passed
                </span>
              </div>

              {/* Central Trust Score Gauge */}
              <div className="flex flex-col items-center gap-2 py-6 border-y border-slate-100">
                <span className="text-6xl font-extrabold tracking-tighter text-slate-900">4.8</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Overall Trust Score</span>
                <div className="flex gap-1 text-brand-accent text-sm mt-1">★★★★★</div>
              </div>

              {/* Operational Stats list */}
              <div className="flex flex-col gap-4 text-sm font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Average Resident Rating</span>
                  <span className="text-slate-900 font-bold">4.7 / 5.0</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Food Quality Audit Rating</span>
                  <span className="text-slate-900 font-bold">4.5 / 5.0</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">24h SLA Resolution Rate</span>
                  <span className="text-brand-success font-bold">99.4%</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Active Warning Flags</span>
                  <span className="text-slate-900 font-bold">0 Flags</span>
                </div>
              </div>

              {/* Informative warning popup box */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex gap-3">
                <ThumbsUp className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-950 leading-relaxed">
                  <strong>Did you know?</strong> Stays with Trust Scores below 4.0 are automatically deprioritized in search results and flagged for inspection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
