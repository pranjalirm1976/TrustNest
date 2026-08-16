'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  ChevronRight, 
  User, 
  LogOut, 
  Settings,
  ChevronDown,
  Shield
} from 'lucide-react'
import { Role } from '@/lib/types'

interface User {
  id: string
  email: string
  name: string
  role: Role
}

interface AdminHeaderProps {
  user: User
}

// Breadcrumb mapping
const breadcrumbMap: Record<string, string[]> = {
  '/admin/dashboard': ['Dashboard'],
  '/admin/properties': ['Properties'],
  '/admin/tenants': ['Tenants'],
  '/admin/complaints': ['Complaints'],
  '/admin/settings': ['Settings']
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get breadcrumbs for current path
  const breadcrumbs = breadcrumbMap[pathname] || ['Dashboard']

  // Close dropdown when clicking outside
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
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-slate-500">TrustNest</span>
        
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className={
              index === breadcrumbs.length - 1 
                ? "text-slate-900 font-medium" 
                : "text-slate-500"
            }>
              {crumb}
            </span>
          </div>
        ))}
      </div>

      {/* User Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          {/* Avatar */}
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          
          {/* User Info */}
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {user.role}
            </p>
          </div>
          
          {/* Dropdown Arrow */}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
              <div className="flex items-center gap-1 mt-1">
                <Shield className="w-3 h-3 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-600">{user.role}</span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Account Settings
              </button>
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}