'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  MessageSquareWarning, 
  Settings,
  Menu,
  X,
  FilePlus2,
  Layers,
  BedDouble,
  Utensils,
  CreditCard,
  Star,
  Activity,
  ShieldCheck,
  BarChart3
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Super Admin Center', href: '/super-admin', icon: ShieldCheck },
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'My PGs', href: '/admin/properties', icon: Building2 },
  { name: 'PG Registration', href: '/admin/registration', icon: FilePlus2 },
  { name: 'Subscription', href: '/admin/subscription', icon: CreditCard },
  { name: 'Floors & Layouts', href: '/admin/floors', icon: Layers },
  { name: 'Rooms & Beds', href: '/admin/rooms', icon: BedDouble },
  { name: 'Residents', href: '/admin/tenants', icon: Users },
  { name: 'Food & Menu', href: '/admin/food', icon: Utensils },
  { name: 'Complaints', href: '/admin/complaints', icon: MessageSquareWarning },
  { name: 'Payments & Revenue', href: '/admin/payments', icon: BarChart3 },
  { name: 'Chat with Residents', href: '/admin/chat', icon: MessageSquareWarning },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Performance', href: '/admin/performance', icon: Activity },
  { name: 'Verification', href: '/admin/verification', icon: ShieldCheck },
  { name: 'Settings', href: '/admin/settings', icon: Settings }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm border border-slate-200"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-y-auto",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col min-h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  TrustNest
                </h1>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href === '/admin/payments' && (pathname === '/owner/financials' || pathname === '/admin/payments')) || 
                (item.href === '/admin/analytics' && (pathname === '/owner/analytics' || pathname === '/admin/analytics')) || 
                (item.href === '/admin/settings' && (pathname === '/owner/settings' || pathname === '/admin/settings'))
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-indigo-600" : "text-slate-400")} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 shrink-0">
            <div className="px-3">
              <p className="text-xs font-medium text-slate-500">
                TrustNest Admin v1.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}