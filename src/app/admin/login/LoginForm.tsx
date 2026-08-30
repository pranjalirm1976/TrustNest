'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertTriangle, Mail, Lock, ShieldAlert, Sparkles, Building2, User } from 'lucide-react'

interface LoginFormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear specific field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const performLogin = async (emailToUse: string, passwordToUse: string) => {
    setIsLoading(true)
    setErrors({})

    try {
      const result = await signIn('credentials', {
        email: emailToUse.toLowerCase().trim(),
        password: passwordToUse,
        redirect: false,
      })

      if (result?.error) {
        let errorMessage = 'Invalid email or password'
        if (result.error.includes('permissions')) {
          errorMessage = 'Access denied. This portal is for administrators only.'
        } else if (result.error.includes('Invalid')) {
          errorMessage = 'Invalid email or password. Please check your credentials.'
        }
        setErrors({ general: errorMessage })
      } else if (result?.ok) {
        // Fetch session to determine role-based destination
        const session = await getSession()
        const role = session?.user?.role

        if (role === 'SUPER_ADMIN') {
          router.push(callbackUrl && callbackUrl.startsWith('/super-admin') ? callbackUrl : '/super-admin')
        } else if (role === 'TENANT') {
          router.push(callbackUrl && callbackUrl.startsWith('/tenant') ? callbackUrl : '/tenant/dashboard')
        } else {
          router.push(callbackUrl && !callbackUrl.includes('/login') ? callbackUrl : '/admin/dashboard')
        }
        router.refresh()
      }
    } catch (error) {
      console.error('Login error:', error)
      setErrors({
        general: 'Something went wrong. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 3) {
      newErrors.password = 'Password is too short'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    await performLogin(formData.email, formData.password)
  }

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setFormData({ email: quickEmail, password: quickPass })
    await performLogin(quickEmail, quickPass)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* General Error */}
        {errors.general && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-amber-200 text-sm font-medium">{errors.general}</p>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isLoading}
              value={formData.email}
              onChange={handleInputChange}
              className={`
                block w-full pl-10 pr-3 py-3 rounded-lg
                bg-gray-800/50 border backdrop-blur-sm
                text-white placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                ${errors.email 
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                  : 'border-gray-600 hover:border-gray-500'
                }
              `}
              placeholder="admin@trustnest.com"
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              disabled={isLoading}
              value={formData.password}
              onChange={handleInputChange}
              className={`
                block w-full pl-10 pr-12 py-3 rounded-lg
                bg-gray-800/50 border backdrop-blur-sm
                text-white placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                ${errors.password 
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                  : 'border-gray-600 hover:border-gray-500'
                }
              `}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`
            w-full flex items-center justify-center py-3 px-4 rounded-lg
            text-white font-semibold
            bg-gradient-to-r from-emerald-600 to-emerald-700
            hover:from-emerald-500 hover:to-emerald-600
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900
            disabled:opacity-50 disabled:cursor-not-allowed
            transform transition-all duration-200
            ${!isLoading ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
            shadow-lg shadow-emerald-600/25
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* 1-Click Fast Login / Alternate Method */}
      <div className="pt-4 border-t border-gray-700/60">
        <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>1-Click Instant Login (One Click Access)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Super Admin Quick Login */}
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@trustnest.in', 'superadminpranjali')}
            disabled={isLoading}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 hover:border-purple-400/60 hover:bg-purple-900/40 text-left transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-purple-200 truncate">Super Admin (Pranjali)</div>
              <div className="text-[10px] text-purple-400/80 truncate">admin@trustnest.in</div>
            </div>
          </button>

          {/* PG Owner Quick Login */}
          <button
            type="button"
            onClick={() => handleQuickLogin('rajesh@emeraldelite.com', 'superadminpranjali')}
            disabled={isLoading}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-400/60 hover:bg-emerald-900/40 text-left transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-emerald-200 truncate">PG Owner / Admin</div>
              <div className="text-[10px] text-emerald-400/80 truncate">rajesh@emeraldelite.com</div>
            </div>
          </button>
        </div>

        <div className="mt-3 text-center">
          <a
            href="/tenant/login"
            className="text-xs text-gray-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            Switch to Resident / Tenant Portal &rarr;
          </a>
        </div>
      </div>
    </div>
  )
}