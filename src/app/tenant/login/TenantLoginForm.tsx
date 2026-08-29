'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function TenantLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const signup = searchParams.get('signup') === 'true'

  // Input states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        // Handle error message
        if (result.error.includes('Insufficient permissions')) {
          setErrorMsg('Access denied. Insufficient permissions. Log in with a verified resident account.')
        } else {
          setErrorMsg('Invalid email or password. Please try again.')
        }
      } else {
        // Successfully authenticated!
        // We'll redirect to the tenant dashboard
        router.push('/tenant/dashboard')
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white border border-slate-200/85 rounded-3xl p-8 shadow-premium flex flex-col gap-8">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-brand-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Resident Portal</h1>
          <p className="text-xs text-slate-500 mt-1 leading-normal">
            {signup 
              ? 'Request a resident stay access key from your landlord.' 
              : 'Log in with your verified resident email and password.'}
          </p>
        </div>
      </div>

      {signup ? (
        <div className="flex flex-col gap-4 text-center">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 text-left text-xs leading-relaxed text-indigo-950 flex flex-col gap-2">
            <span className="font-extrabold text-brand-primary uppercase tracking-widest text-[9px]">How to Get Access</span>
            <p>1. Your PG operator must first register your stay under an active room bed slot.</p>
            <p>2. The system will auto-generate your login credentials and send them to your registered email.</p>
            <p>3. If you have not received them, contact your landlord to verify your mobile or email registration.</p>
          </div>
          <button
            onClick={() => router.push('/tenant/login')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl shadow-premium-sm transition-colors cursor-pointer"
          >
            Back to Resident Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Error Message */}
          {errorMsg && (
            <div className="bg-brand-danger-light border border-brand-danger/15 rounded-xl p-3.5 text-xs font-semibold text-brand-danger animate-in">
              {errorMsg}
            </div>
          )}

          {/* Email Input */}
          <div className="flex flex-col gap-1.5 text-xs font-semibold">
            <label className="text-slate-500 uppercase tracking-widest">Resident Email</label>
            <div className="bg-[#fbfbfb] border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-brand-primary/50 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="email"
                placeholder="e.g. priya.sharma@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5 text-xs font-semibold">
            <label className="text-slate-500 uppercase tracking-widest">Password</label>
            <div className="bg-[#fbfbfb] border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-brand-primary/50 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Login */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-sm py-3.5 rounded-xl shadow-premium hover:shadow-premium-lg transition-all duration-200 hover:-translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Sign In as Resident</span>
            )}
          </button>

          {/* Quick 1-Click Resident Login */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">1-Click Demo Login</span>
            <button
              type="button"
              disabled={isLoading}
              onClick={async () => {
                setEmail('priya.sharma@gmail.com')
                setPassword('password123')
                setIsLoading(true)
                try {
                  const res = await signIn('credentials', {
                    email: 'priya.sharma@gmail.com',
                    password: 'password123',
                    redirect: false,
                  })
                  if (res?.ok) {
                    router.push('/tenant/dashboard')
                    router.refresh()
                  }
                } finally {
                  setIsLoading(false)
                }
              }}
              className="w-full py-2.5 px-3 bg-indigo-50/70 hover:bg-indigo-100/70 text-brand-primary border border-indigo-100 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>👤 Quick Sign In (Priya Sharma)</span>
              <span className="text-[10px] text-indigo-400">Auto-fill &rarr;</span>
            </button>
          </div>

          {/* Prompt info */}
          <div className="text-center text-[10px] text-slate-400 leading-normal mt-1">
            Looking for Admin or Super Admin?{' '}
            <a 
              href="/admin/login"
              className="text-brand-primary font-bold hover:underline cursor-pointer"
            >
              Admin / Super Admin Portal &rarr;
            </a>
          </div>
        </form>
      )}
    </div>
  )
}
