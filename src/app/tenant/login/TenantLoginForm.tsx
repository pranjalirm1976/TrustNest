'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function TenantLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const signup = searchParams.get('signup') === 'true'
  const callbackUrl = searchParams.get('callbackUrl') || '/tenant/dashboard'
  const oauthError = searchParams.get('error')

  // Input states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (oauthError) {
      if (oauthError === 'OAuthSignin' || oauthError === 'OAuthCallback') {
        setErrorMsg('Google authentication was cancelled or could not be completed. Please try again.')
      } else if (oauthError === 'OAuthAccountNotLinked') {
        setErrorMsg('An account with this email already exists with a different sign-in method.')
      } else if (oauthError === 'Configuration') {
        setErrorMsg('Google Sign-In is not configured yet. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.')
      } else if (oauthError === 'AccessDenied') {
        setErrorMsg('Access denied. Google account authorization was not granted.')
      } else {
        setErrorMsg(`Authentication error (${oauthError}). Please try again.`)
      }
    }
  }, [oauthError])

  const handleGoogleSignIn = async () => {
    try {
      setErrorMsg('')
      setIsGoogleLoading(true)
      await signIn('google', { callbackUrl })
    } catch (err) {
      console.error('Google sign-in error:', err)
      setErrorMsg('Failed to initialize Google Sign-In.')
      setIsGoogleLoading(false)
    }
  }

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
        if (result.error.includes('Insufficient permissions')) {
          setErrorMsg('Access denied. Insufficient permissions. Log in with a verified resident account.')
        } else {
          setErrorMsg('Invalid email or password. Please try again.')
        }
      } else {
        router.push(callbackUrl)
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
    <div className="w-full max-w-md bg-white border border-slate-200/85 rounded-3xl p-8 shadow-premium flex flex-col gap-6">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center shadow-sm">
          <Shield className="w-6 h-6 text-brand-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Resident Portal</h1>
          <p className="text-xs text-slate-500 mt-1 leading-normal">
            {signup 
              ? 'Request a resident stay access key from your landlord.' 
              : 'Sign in to access your TrustNest resident dashboard.'}
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
        <div className="flex flex-col gap-5">
          {/* Error Message */}
          {errorMsg && (
            <div className="bg-brand-danger-light border border-brand-danger/15 rounded-xl p-3.5 text-xs font-semibold text-brand-danger animate-in">
              {errorMsg}
            </div>
          )}

          {/* GOOGLE SIGN-IN BUTTON FOR USER/RESIDENT AUTHENTICATION */}
          <button
            type="button"
            disabled={isGoogleLoading || isLoading}
            onClick={handleGoogleSignIn}
            className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm py-3.5 px-4 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 cursor-pointer hover:-translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-[1px] bg-slate-200 flex-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">or email password</span>
            <div className="h-[1px] bg-slate-200 flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Input */}
            <div className="flex flex-col gap-1.5 text-xs font-semibold">
              <label className="text-slate-500 uppercase tracking-widest text-[10px]">Resident Email</label>
              <div className="bg-[#fbfbfb] border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-3 focus-within:border-brand-primary/50 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
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
              <label className="text-slate-500 uppercase tracking-widest text-[10px]">Password</label>
              <div className="bg-[#fbfbfb] border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-3 focus-within:border-brand-primary/50 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
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
              disabled={isLoading || isGoogleLoading}
              className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-sm py-3 rounded-xl shadow-premium hover:shadow-premium-lg transition-all duration-200 hover:-translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer mt-1"
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
          </form>

          {/* Quick 1-Click Resident Login */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">1-Click Demo Login</span>
            <button
              type="button"
              disabled={isLoading || isGoogleLoading}
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
                    router.push(callbackUrl)
                    router.refresh()
                  }
                } finally {
                  setIsLoading(false)
                }
              }}
              className="w-full py-2 px-3 bg-indigo-50/70 hover:bg-indigo-100/70 text-brand-primary border border-indigo-100 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>👤 Quick Sign In (Priya Sharma)</span>
              <span className="text-[10px] text-indigo-400">Auto-fill &rarr;</span>
            </button>
          </div>

          {/* Prompt info */}
          <div className="text-center text-[10px] text-slate-400 leading-normal">
            Looking for Admin or Super Admin?{' '}
            <a 
              href="/admin/login"
              className="text-brand-primary font-bold hover:underline cursor-pointer"
            >
              Admin / Super Admin Portal &rarr;
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
