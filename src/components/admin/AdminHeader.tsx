'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { 
  ChevronRight, 
  User, 
  LogOut, 
  Settings,
  ChevronDown,
  Shield,
  Bell,
  Plus
} from 'lucide-react'
import { Role } from '@/lib/types'
import { NotificationBell } from '@/components/notifications/NotificationBell'

interface User {
  id: string
  email: string
  name: string
  role: Role
}

interface AdminHeaderProps {
  user: User
}

const breadcrumbMap: Record<string, string[]> = {
  '/admin/dashboard': ['Dashboard'],
  '/admin/properties': ['My PGs'],
  '/admin/registration': ['PG Registration'],
  '/admin/floors': ['Floors & Layouts'],
  '/admin/rooms': ['Rooms & Beds'],
  '/admin/tenants': ['Residents'],
  '/admin/food': ['Food & Menu'],
  '/admin/complaints': ['Complaints'],
  '/admin/payments': ['Payments'],
  '/admin/analytics': ['Analytics & Reports'],
  '/owner/financials': ['Financials'],
  '/owner/analytics': ['Analytics & Reports'],
  '/owner/settings': ['Settings'],
  '/admin/reviews': ['Reviews'],
  '/admin/performance': ['Performance'],
  '/admin/verification': ['Verification'],
  '/admin/settings': ['Settings']
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const breadcrumbs = breadcrumbMap[pathname] || ['Dashboard']

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/admin/login' })
  }

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm ml-12 lg:ml-0">
        <span className="text-slate-500 font-medium hidden sm:inline-block">Home</span>
        
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-slate-400 hidden sm:block" />
            <span className={
              index === breadcrumbs.length - 1 
                ? "text-slate-900 font-semibold" 
                : "text-slate-500 font-medium"
            }>
              {crumb}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {/* Actions */}
        <Link 
          href="/admin/registration" 
          className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add PG
        </Link>
        
        <NotificationBell />

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
          >
            {/* Avatar */}
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-700" />
            </div>
            
            {/* User Info */}
            <div className="text-left hidden md:block mr-1">
              <p className="text-sm font-semibold text-slate-900 leading-none">{user.name}</p>
              <p className="text-xs text-slate-500 mt-1 capitalize">{user.role.toLowerCase()}</p>
            </div>
            
            {/* Dropdown Arrow */}
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${
              isDropdownOpen ? 'rotate-180' : ''
            }`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/admin/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Account Settings
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}