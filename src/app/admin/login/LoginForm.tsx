'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertTriangle, Mail, Lock } from 'lucide-react'

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
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard'
  
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
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const result = await signIn('credentials', {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        redirect: false,
        callbackUrl
      })

      if (result?.error) {
        // Handle specific error messages
        let errorMessage = 'Invalid email or password'
        
        if (result.error.includes('permissions')) {
          errorMessage = 'Access denied. This portal is for administrators only.'
        } else if (result.error.includes('Invalid')) {
          errorMessage = 'Invalid email or password. Please try again.'
        }
        
        setErrors({
          general: errorMessage
        })
      } else if (result?.ok) {
        // Success - redirect to dashboard
        router.push(callbackUrl)
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          'Sign In to Dashboard'
        )}
      </button>

      {/* Development Hint */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-200 text-xs text-center">
            <strong>Dev Mode:</strong> Use admin@trustnest.com / admin123
          </p>
        </div>
      )}
    </form>
  )
}