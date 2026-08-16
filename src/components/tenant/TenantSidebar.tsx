'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { 
  Shield, 
  LayoutDashboard, 
  DoorOpen, 
  Utensils, 
  AlertCircle, 
  CreditCard, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react'

interface TenantSidebarProps {
  user: {
    name: string
    email: string
    role: string
  }
}

export default function TenantSidebar({ user }: TenantSidebarProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const links = [
    { name: 'Dashboard', href: '/tenant/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'My Room', href: '/tenant/room', icon: <DoorOpen className="w-4 h-4" /> },
    { name: 'Rate Food', href: '/tenant/food', icon: <Utensils className="w-4 h-4" /> },
    { name: 'Complaints', href: '/tenant/complaints', icon: <AlertCircle className="w-4 h-4" /> },
    { name: 'Rent Payments', href: '/tenant/payments', icon: <CreditCard className="w-4 h-4" /> },
    { name: 'Profile', href: '/tenant/profile', icon: <User className="w-4 h-4" /> },
  ]

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <>
      {/* Mobile hamburger menu toggle trigger button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
          className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-premium-sm"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile backdrop shadow click close overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Vertical Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Upper Area: Logo and Navigation Links */}
        <div className="flex flex-col gap-8 py-6">
          {/* Brand Logo */}
          <div className="px-6 flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Trust<span className="text-brand-primary">Nest</span>
            </span>
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-1.5 px-3">
            {links.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label={`Navigate to ${link.name}`}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/50",
                    isActive
                      ? 'bg-brand-primary text-white shadow-premium-sm font-extrabold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  )}
                >
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Lower Area: Profile HUD & Logout */}
        <div className="p-4 border-t border-slate-800 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-white shrink-0 text-xs">
              <User className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                Verified Resident
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            aria-label="Sign Out of Resident Portal"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800/40 text-slate-455 hover:text-white text-xs font-bold transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-danger/50"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
