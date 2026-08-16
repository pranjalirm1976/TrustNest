'use client'

import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 group self-start">
              <div className="w-8 h-8 bg-brand-primary rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Trust<span className="text-brand-primary">Nest</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              TrustNest is the standard of integrity in student and professional co-living housing. Verified stays, daily food logs, and contract-backed 24h SLA.
            </p>
          </div>

          {/* Column 2: Discover */}
          <div className="flex flex-col gap-3 text-xs font-semibold uppercase tracking-wider">
            <span className="text-slate-200">Discover Stays</span>
            <div className="flex flex-col gap-2 lowercase font-normal normal-case text-slate-400">
              <Link href="/discover?location=Hinjawadi" className="hover:text-white transition-colors">Hinjawadi IT Park PGs</Link>
              <Link href="/discover?location=Wakad" className="hover:text-white transition-colors">Wakad Stays</Link>
              <Link href="/discover?location=Baner" className="hover:text-white transition-colors">Baner Crest PGs</Link>
              <Link href="/discover?location=Kharadi" className="hover:text-white transition-colors">Kharadi Nest Stays</Link>
            </div>
          </div>

          {/* Column 3: Platform */}
          <div className="flex flex-col gap-3 text-xs font-semibold uppercase tracking-wider">
            <span className="text-slate-200">Core Transparency</span>
            <div className="flex flex-col gap-2 lowercase font-normal normal-case text-slate-400">
              <Link href="/food" className="hover:text-white transition-colors">Food Audit Portal</Link>
              <Link href="/trust-score" className="hover:text-white transition-colors">Trust Score Math</Link>
              <Link href="/sla-portal" className="hover:text-white transition-colors">SLA Tracking</Link>
              <Link href="/reviews" className="hover:text-white transition-colors">Resident Reviews</Link>
            </div>
          </div>

          {/* Column 4: Partners */}
          <div className="flex flex-col gap-3 text-xs font-semibold uppercase tracking-wider">
            <span className="text-slate-200">Operators & Owners</span>
            <div className="flex flex-col gap-2 lowercase font-normal normal-case text-slate-400">
              <Link href="/admin/login" className="hover:text-white transition-colors">Owner Operations Login</Link>
              <Link href="/inspector/login" className="hover:text-white transition-colors">Auditor Portal</Link>
              <Link href="/partners" className="hover:text-white transition-colors">Register Your PG</Link>
            </div>
          </div>
        </div>

        {/* Bottom border */}
        <div className="h-px bg-slate-800 w-full mb-8" />

        {/* copyright and terms */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TrustNest Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
