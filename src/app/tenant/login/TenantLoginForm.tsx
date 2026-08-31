'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Shield, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Edit3
} from 'lucide-react'
import { sendOtpAction, verifyOtpAction, getOtpConfigAction } from '@/actions/otp.actions'

export default function TenantLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const signup = searchParams.get('signup') === 'true'
  const callbackUrl = searchParams.get('callbackUrl') || '/tenant/dashboard'
  const oauthError = searchParams.get('error')

  // Main Tab: 'email_otp' | 'mobile_otp' | 'password'
  const [authMethod, setAuthMethod] = useState<'email_otp' | 'mobile_otp' | 'password'>('email_otp')

  // OTP Configuration & Demo status
  const [isDemoMode, setIsDemoMode] = useState(true)
  const [demoCode, setDemoCode] = useState<string | null>('123456')

  // Email OTP state
  const [emailInput, setEmailInput] = useState('')
  const [emailOtp, setEmailOtp] = useState('')
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false)
  const [emailResendTimer, setEmailResendTimer] = useState(0)

  // Mobile OTP state
  const [countryCode, setCountryCode] = useState('+91')
  const [mobileInput, setMobileInput] = useState('')
  const [mobileOtp, setMobileOtp] = useState('')
  const [isMobileOtpSent, setIsMobileOtpSent] = useState(false)
  const [mobileResendTimer, setMobileResendTimer] = useState(0)

  // Password login state
  const [passwordEmail, setPasswordEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Loading & Feedback states
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Load OTP Config
  useEffect(() => {
    getOtpConfigAction().then((config) => {
      setIsDemoMode(config.isDemo)
      setDemoCode(config.demoOtp)
    }).catch(() => null)
  }, [])

  // Timer countdown for Resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (emailResendTimer > 0) {
      interval = setInterval(() => {
        setEmailResendTimer((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [emailResendTimer])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (mobileResendTimer > 0) {
      interval = setInterval(() => {
        setMobileResendTimer((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [mobileResendTimer])

  // OAuth error messages
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

  // 1. Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setErrorMsg('')
      setSuccessMsg('')
      setIsGoogleLoading(true)
      await signIn('google', { callbackUrl })
    } catch (err) {
      console.error('Google sign-in error:', err)
      setErrorMsg('Failed to initialize Google Sign-In.')
      setIsGoogleLoading(false)
    }
  }

  // 2. Handle Send Email OTP
  const handleSendEmailOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!emailInput || !emailInput.includes('@')) {
      setErrorMsg('Please enter a valid email address.')
      return
    }

    setIsLoading(true)
    try {
      const res = await sendOtpAction(emailInput, 'EMAIL')
      if (!res.success) {
        setErrorMsg(res.message || res.error || 'Failed to send Email OTP.')
      } else {
        setIsEmailOtpSent(true)
        setEmailResendTimer(res.resendInSeconds || 30)
        setSuccessMsg(res.message)
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // 3. Handle Verify Email OTP
  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!emailOtp || emailOtp.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.')
      return
    }

    setIsLoading(true)
    try {
      const res = await verifyOtpAction(emailInput, 'EMAIL', emailOtp.trim())
      if (!res.success || !res.authToken) {
        setErrorMsg(res.message || res.error || 'Invalid OTP code.')
        setIsLoading(false)
        return
      }

      setSuccessMsg('Email verified successfully! Logging you in...')

      // NextAuth handshake
      const authRes = await signIn('credentials', {
        otpAuthToken: res.authToken,
        redirect: false
      })

      if (authRes?.error) {
        setErrorMsg(authRes.error)
        setIsLoading(false)
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification failed. Please try again.')
      setIsLoading(false)
    }
  }

  // 4. Handle Send Mobile OTP
  const handleSendMobileOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    const fullPhone = `${countryCode}${mobileInput.trim()}`
    if (!mobileInput || mobileInput.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.')
      return
    }

    setIsLoading(true)
    try {
      const res = await sendOtpAction(fullPhone, 'PHONE')
      if (!res.success) {
        setErrorMsg(res.message || res.error || 'Failed to send SMS OTP.')
      } else {
        setIsMobileOtpSent(true)
        setMobileResendTimer(res.resendInSeconds || 30)
        setSuccessMsg(res.message)
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // 5. Handle Verify Mobile OTP
  const handleVerifyMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!mobileOtp || mobileOtp.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.')
      return
    }

    const fullPhone = `${countryCode}${mobileInput.trim()}`
    setIsLoading(true)
    try {
      const res = await verifyOtpAction(fullPhone, 'PHONE', mobileOtp.trim())
      if (!res.success || !res.authToken) {
        setErrorMsg(res.message || res.error || 'Invalid OTP code.')
        setIsLoading(false)
        return
      }

      setSuccessMsg('Mobile number verified successfully! Logging you in...')

      // NextAuth handshake
      const authRes = await signIn('credentials', {
        otpAuthToken: res.authToken,
        redirect: false
      })

      if (authRes?.error) {
        setErrorMsg(authRes.error)
        setIsLoading(false)
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification failed. Please try again.')
      setIsLoading(false)
    }
  }

  // 6. Handle Password Sign-In (Legacy / Resident Stay Access)
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: passwordEmail,
        password,
      })

      if (result?.error) {
        setErrorMsg('Invalid email or password. Please try again.')
        setIsLoading(false)
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      setErrorMsg('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white border border-slate-200/85 rounded-3xl p-6 sm:p-8 shadow-premium flex flex-col gap-5">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center shadow-sm">
          <Shield className="w-6 h-6 text-brand-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">TrustNest Resident Login</h1>
          <p className="text-xs text-slate-500 mt-0.5 leading-normal">
            Sign in with Google, Email OTP, or Mobile Number
          </p>
        </div>
      </div>

      {/* Demo Notice Banner */}
      {isDemoMode && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl px-3.5 py-2 text-xs flex items-center justify-between text-amber-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold text-[11px]">
              Demo Mode Active — OTP: <strong className="font-mono text-amber-950 font-bold">{demoCode || '123456'}</strong>
            </span>
          </div>
          <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
            DEMO
          </span>
        </div>
      )}

      {/* Error & Success Feedback */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs font-semibold text-red-700 animate-in fade-in duration-200">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. GOOGLE SIGN-IN BUTTON */}
      <button
        type="button"
        disabled={isGoogleLoading || isLoading}
        onClick={handleGoogleSignIn}
        className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm py-3 px-4 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 cursor-pointer hover:-translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none"
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
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">or sign in with</span>
        <div className="h-[1px] bg-slate-200 flex-1" />
      </div>

      {/* Verification Method Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => {
            setAuthMethod('email_otp')
            setErrorMsg('')
            setSuccessMsg('')
          }}
          className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            authMethod === 'email_otp'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email OTP</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthMethod('mobile_otp')
            setErrorMsg('')
            setSuccessMsg('')
          }}
          className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            authMethod === 'mobile_otp'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Mobile OTP</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthMethod('password')
            setErrorMsg('')
            setSuccessMsg('')
          }}
          className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            authMethod === 'password'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Password</span>
        </button>
      </div>

      {/* 2. EMAIL OTP FLOW */}
      {authMethod === 'email_otp' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {!isEmailOtpSent ? (
            <form onSubmit={handleSendEmailOtp} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Email Address
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-indigo-50 focus-within:bg-white transition-all">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    className="text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none w-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !emailInput}
                className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs py-3 rounded-xl shadow-premium hover:shadow-premium-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyEmailOtp} className="space-y-3">
              <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-indigo-500 font-semibold block">OTP Sent To:</span>
                  <span className="font-bold text-indigo-950 font-mono">{emailInput}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEmailOtpSent(false)
                    setEmailOtp('')
                    setErrorMsg('')
                  }}
                  className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Change</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="••••••"
                  value={emailOtp}
                  onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                  className="w-full text-center tracking-[0.5em] text-xl font-bold font-mono py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-indigo-50 focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || emailOtp.length !== 6}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-premium hover:shadow-premium-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify &amp; Sign In</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center pt-1">
                {emailResendTimer > 0 ? (
                  <span className="text-[11px] text-slate-400 font-medium">
                    Resend code in <strong className="font-bold text-slate-600 font-mono">{emailResendTimer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSendEmailOtp()}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      {/* 3. MOBILE OTP FLOW */}
      {authMethod === 'mobile_otp' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {!isMobileOtpSent ? (
            <form onSubmit={handleSendMobileOtp} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-2.5 flex items-center gap-1 shrink-0 text-xs font-bold text-slate-700">
                    <span>🇮🇳</span>
                    <span>{countryCode}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 flex-1 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-indigo-50 focus-within:bg-white transition-all">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="98765 43210"
                      value={mobileInput}
                      onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, ''))}
                      required
                      className="text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none w-full"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || mobileInput.length < 10}
                className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs py-3 rounded-xl shadow-premium hover:shadow-premium-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending SMS OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send SMS Verification OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyMobileOtp} className="space-y-3">
              <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-indigo-500 font-semibold block">SMS OTP Sent To:</span>
                  <span className="font-bold text-indigo-950 font-mono">{countryCode} {mobileInput}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileOtpSent(false)
                    setMobileOtp('')
                    setErrorMsg('')
                  }}
                  className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Change</span>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Enter 6-Digit SMS Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="••••••"
                  value={mobileOtp}
                  onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                  className="w-full text-center tracking-[0.5em] text-xl font-bold font-mono py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-indigo-50 focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || mobileOtp.length !== 6}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-premium hover:shadow-premium-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify &amp; Sign In</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center pt-1">
                {mobileResendTimer > 0 ? (
                  <span className="text-[11px] text-slate-400 font-medium">
                    Resend SMS in <strong className="font-bold text-slate-600 font-mono">{mobileResendTimer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSendMobileOtp()}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend SMS OTP</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      {/* 4. PASSWORD LOGIN FLOW */}
      {authMethod === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-3 animate-in fade-in duration-200">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Resident Email
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-indigo-50 focus-within:bg-white transition-all">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="email"
                placeholder="priya.sharma@gmail.com"
                value={passwordEmail}
                onChange={(e) => setPasswordEmail(e.target.value)}
                required
                className="text-sm font-semibold text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none w-full"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Password
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-indigo-50 focus-within:bg-white transition-all">
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs py-3 rounded-xl shadow-premium hover:shadow-premium-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In with Password</span>
            )}
          </button>
        </form>
      )}

      {/* Quick 1-Click Resident Login */}
      <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
        <button
          type="button"
          disabled={isLoading || isGoogleLoading}
          onClick={async () => {
            setPasswordEmail('priya.sharma@gmail.com')
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
          <span>👤 Quick Fast Demo Sign In (Priya Sharma)</span>
          <span className="text-[10px] text-indigo-400">Auto-fill &rarr;</span>
        </button>
      </div>

      {/* Admin Link */}
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
  )
}
