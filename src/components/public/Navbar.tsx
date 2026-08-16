'use client'

import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center transition-transform group-hover:scale-[1.02]">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              Trust<span className="text-brand-primary">Nest</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
            <Link href="/search" className="hover:text-brand-primary transition-colors py-2">
              Discover PGs
            </Link>
            <Link href="/food" className="hover:text-brand-primary transition-colors py-2">
              Food Transparency
            </Link>
            <Link href="/#transparency" className="hover:text-brand-primary transition-colors py-2">
              TrustNest Score
            </Link>
            <Link href="/tenant/login" className="hover:text-brand-primary transition-colors py-2">
              SLA Dashboard
            </Link>
          </div>

          {/* Auth CTA */}
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/login" 
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link 
              href="/admin/login?signup=true" 
              className="text-sm font-semibold bg-brand-primary hover:bg-brand-primary-dark text-white shadow-premium-sm px-4 py-2 rounded-xl transition-all duration-200 hover:-translate-y-[1px]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
