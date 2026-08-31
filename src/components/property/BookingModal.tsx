'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import { bookBed } from '@/actions/booking.actions'
import { sendOtpAction, verifyOtpAction } from '@/actions/otp.actions'
import { 
  X, 
  Bed, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  Phone,
  Building2,
  Check,
  CreditCard,
  Receipt,
  XCircle,
  ArrowRight
} from 'lucide-react'

type BedType = {
  id: string
  identifier: string
  status: string
  isTrustNestInventory?: boolean
}

type RoomType = {
  id: string
  roomNumber: string
  capacity: number
  pricePerBed?: number | null
  beds: BedType[]
}

type FloorType = {
  id: string
  name: string
  level: number
  rooms: RoomType[]
}

interface BookingModalProps {
  property: {
    id: string
    name: string
    address: string
    priceFrom: number
  }
  floors?: FloorType[]
  initialRoomId?: string
  initialBedId?: string
  onClose: () => void
}

export default function BookingModal({
  property,
  floors = [],
  initialRoomId,
  initialBedId,
  onClose,
}: BookingModalProps) {
  const router = useRouter()
  const { data: session } = useSession()

  // Flatten all rooms across floors
  const allRooms = floors.flatMap((f) => f.rooms.filter((r) => r.capacity > 0))

  // Selection states
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    initialRoomId || allRooms[0]?.id || ''
  )
  const selectedRoom = allRooms.find((r) => r.id === selectedRoomId) || allRooms[0]

  // Available TrustNest beds in selected room
  const availableBeds = selectedRoom?.beds.filter((b) => b.isTrustNestInventory !== false && b.status === 'VACANT') || []
  const ownerManagedBeds = selectedRoom?.beds.filter((b) => b.isTrustNestInventory === false) || []
  const [selectedBedId, setSelectedBedId] = useState<string>(
    initialBedId && availableBeds.some((b) => b.id === initialBedId)
      ? initialBedId
      : availableBeds[0]?.id || ''
  )

  // Booking details
  const today = new Date().toISOString().split('T')[0]
  const [moveInDate, setMoveInDate] = useState<string>(today)
  const [durationMonths, setDurationMonths] = useState<number>(6)
  const [termsAccepted, setTermsAccepted] = useState<boolean>(true)

  // Auth mode for anonymous users: 'quick' | 'otp' | 'login' | 'register'
  const [authTab, setAuthTab] = useState<'quick' | 'otp' | 'login' | 'register'>('otp')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPassword, setGuestPassword] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Booking OTP states
  const [bookingOtpType, setBookingOtpType] = useState<'EMAIL' | 'PHONE'>('EMAIL')
  const [bookingOtpTarget, setBookingOtpTarget] = useState('')
  const [bookingOtpCode, setBookingOtpCode] = useState('')
  const [isBookingOtpSent, setIsBookingOtpSent] = useState(false)
  const [bookingOtpTimer, setBookingOtpTimer] = useState(0)

  // State management
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [successData, setSuccessData] = useState<any>(null)
  const [failedData, setFailedData] = useState<any>(null)

  // Rent & Split calculation
  const bookingAmount = selectedRoom?.pricePerBed || (
    selectedRoom?.capacity === 1 ? property.priceFrom * 1.3 :
    selectedRoom?.capacity === 2 ? property.priceFrom :
    property.priceFrom * 0.85
  )
  const trustNestCommission = Math.round(bookingAmount * 0.10)
  const ownerPayoutAmount = bookingAmount - trustNestCommission

  // Handle room switch
  const handleRoomChange = (roomId: string) => {
    setSelectedRoomId(roomId)
    const room = allRooms.find((r) => r.id === roomId)
    const vacant = room?.beds.filter((b) => b.status === 'VACANT') || []
    if (vacant.length > 0) {
      setSelectedBedId(vacant[0].id)
    } else {
      setSelectedBedId('')
    }
  }

  // Handle OTP Send in Booking Modal
  const handleSendBookingOtp = async () => {
    if (!bookingOtpTarget.trim()) {
      setErrorMsg(bookingOtpType === 'EMAIL' ? 'Please enter your email.' : 'Please enter your mobile number.')
      return
    }
    setIsLoading(true)
    setErrorMsg('')
    try {
      const res = await sendOtpAction(bookingOtpTarget.trim(), bookingOtpType)
      if (!res.success) {
        setErrorMsg(res.message || res.error || 'Failed to send verification OTP.')
      } else {
        setIsBookingOtpSent(true)
        setBookingOtpTimer(res.resendInSeconds || 30)
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle OTP Verify in Booking Modal
  const handleVerifyBookingOtp = async () => {
    if (!bookingOtpCode || bookingOtpCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit OTP code.')
      return
    }
    setIsLoading(true)
    setErrorMsg('')
    try {
      const res = await verifyOtpAction(bookingOtpTarget.trim(), bookingOtpType, bookingOtpCode.trim())
      if (!res.success || !res.authToken) {
        setErrorMsg(res.message || res.error || 'Invalid OTP code.')
        setIsLoading(false)
        return
      }

      await signIn('credentials', {
        otpAuthToken: res.authToken,
        redirect: false
      })
    } catch (e: any) {
      setErrorMsg(e?.message || 'Verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Quick Login button
  const handleQuickLogin = async (email: string, pass: string) => {
    setIsLoading(true)
    setErrorMsg('')
    try {
      const res = await signIn('credentials', {
        email,
        password: pass,
        redirect: false
      })
      if (!res?.ok) {
        setErrorMsg('Failed to log in with quick account.')
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Login error')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle standard manual login
  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')
    try {
      const res = await signIn('credentials', {
        email: loginEmail,
        password: loginPassword,
        redirect: false
      })
      if (!res?.ok) {
        setErrorMsg('Invalid email or password.')
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Login error')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle booking submission with simulated payment
  const handleBookPayment = async (simulateFailure = false) => {
    if (!selectedBedId) {
      setErrorMsg('Please select an available bed.')
      return
    }
    if (!termsAccepted) {
      setErrorMsg('Please accept the stay terms and conditions.')
      return
    }

    setIsLoading(true)
    setErrorMsg('')
    setFailedData(null)

    try {
      let guestInfo = undefined
      if (!session?.user) {
        if (authTab === 'register') {
          if (!guestName || !guestEmail || !guestPassword) {
            setErrorMsg('Please enter your name, email, and password to create your resident account.')
            setIsLoading(false)
            return
          }
          guestInfo = {
            name: guestName,
            email: guestEmail,
            password: guestPassword,
          }
        } else {
          setErrorMsg('Please sign in or enter your details below.')
          setIsLoading(false)
          return
        }
      }

      const res = await bookBed({
        propertyId: property.id,
        roomId: selectedRoom.id,
        bedId: selectedBedId,
        moveInDate,
        durationMonths,
        termsAccepted,
        simulateFailure,
        guestInfo,
      })

      if (!res.success) {
        if (simulateFailure) {
          setFailedData(res)
        } else {
          setErrorMsg(res.error || 'Failed to complete booking.')
        }
      } else {
        setSuccessData(res.data)
      }
    } catch (e: any) {
      console.error('Booking error:', e)
      setErrorMsg(e.message || 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-primary shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                {successData 
                  ? 'Booking & Payment Confirmed! 🎉' 
                  : failedData 
                  ? 'Payment Simulation Failed' 
                  : `Book Stay at ${property.name}`}
              </h2>
              <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                {property.address}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {successData ? (
            /* SUCCESS CONFIRMATION SCREEN */
            <div className="text-center py-4 flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-mono">
                  DEMO PAYMENT — NO REAL MONEY
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-2">
                  Welcome to TrustNest Co-Living!
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Your bed has been successfully booked in demo mode. The live split and transaction details have been saved to the database.
                </p>
              </div>

              {/* Transaction & Split Receipt */}
              <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">Demo Txn ID:</span>
                  <span className="font-mono font-bold text-slate-900">{successData.transactionId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">Room &amp; Bed:</span>
                  <span className="font-bold text-slate-900">
                    Room {successData.roomNumber} (Bed {successData.bedIdentifier})
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">Total Booking Amount:</span>
                  <span className="font-bold text-slate-900 font-mono">₹{successData.rentAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">TrustNest Platform Fee (10%):</span>
                  <span className="font-bold text-indigo-600 font-mono">₹{successData.trustNestCommission?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-medium">PG Owner Net Payout (90%):</span>
                  <span className="font-bold text-emerald-700 font-mono">₹{successData.ownerPayout?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="text-slate-500 font-medium">Payment Mode:</span>
                  <span className="font-bold text-amber-700 font-mono">DEMO SANDBOX</span>
                </div>
              </div>

              <div className="w-full space-y-2 pt-2">
                <button
                  onClick={() => {
                    onClose()
                    router.push('/tenant/dashboard')
                  }}
                  className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-sm py-3.5 rounded-xl shadow-premium transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Go to My Resident Dashboard &rarr;</span>
                </button>
              </div>
            </div>
          ) : failedData ? (
            /* FAILED PAYMENT SIMULATION SCREEN */
            <div className="text-center py-4 flex flex-col items-center gap-5">
              <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-sm">
                <XCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-red-100 text-red-900 font-mono">
                  DEMO SIMULATION
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-2">
                  Payment Failed
                </h3>
                <p className="text-xs text-red-600 max-w-sm mx-auto leading-relaxed font-semibold">
                  Reason: Demo payment failure simulation. No money was charged and the bed remains available.
                </p>
              </div>

              <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="font-mono font-bold text-slate-800">{failedData.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Booking Status:</span>
                  <span className="font-bold text-red-700">PAYMENT_FAILED</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFailedData(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3.5 rounded-xl shadow-premium transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Try Payment Again</span>
              </button>
            </div>
          ) : (
            /* BOOKING CONFIGURATION & PAYMENT FLOW */
            <>
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs font-semibold text-red-700 flex items-center gap-2.5 animate-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* DEMO NOTICE BANNER */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-[11px] text-amber-900">
                  <span className="font-bold">DEMO PAYMENT MODE: </span>
                  No real money will be charged. Choose whether to simulate a successful or failed payment below.
                </div>
              </div>

              {/* Step 1: Room & Bed Selector */}
              <div className="space-y-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                  1. Select Room &amp; Bed
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Room
                    </span>
                    <select
                      value={selectedRoomId}
                      onChange={(e) => handleRoomChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-primary cursor-pointer"
                    >
                      {allRooms.map((r) => {
                        const freeTrustNestBeds = r.beds.filter((b) => b.isTrustNestInventory !== false && b.status === 'VACANT').length
                        return (
                          <option key={r.id} value={r.id}>
                            Room {r.roomNumber} ({r.capacity} Sharing - {freeTrustNestBeds} TrustNest Available)
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Available Bed (TrustNest)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {availableBeds.map((bed) => (
                        <button
                          key={bed.id}
                          type="button"
                          onClick={() => setSelectedBedId(bed.id)}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            selectedBedId === bed.id
                              ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          <Bed className="w-3.5 h-3.5" />
                          <span>Bed {bed.identifier}</span>
                        </button>
                      ))}

                      {ownerManagedBeds.map((bed) => (
                        <div
                          key={bed.id}
                          title="This bed is owner-managed and not bookable on TrustNest"
                          className="py-2 px-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-[10px] font-bold flex items-center gap-1 opacity-75 cursor-not-allowed"
                        >
                          <Bed className="w-3 h-3 opacity-50" />
                          <span>Bed {bed.identifier} (Owner)</span>
                        </div>
                      ))}

                      {availableBeds.length === 0 && ownerManagedBeds.length === 0 && (
                        <div className="w-full py-2 px-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                          No vacant TrustNest beds in this room
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Date & Duration */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                  2. Move-in Date &amp; Duration
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Check-in Date
                    </span>
                    <input
                      type="date"
                      value={moveInDate}
                      min={today}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Duration
                    </span>
                    <select
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-primary cursor-pointer"
                    >
                      <option value={3}>3 Months</option>
                      <option value={6}>6 Months</option>
                      <option value={11}>11 Months</option>
                      <option value={12}>12 Months</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 3: Resident Identification */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block">
                  3. Resident Account
                </label>

                {session?.user ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                        {session.user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{session.user.name}</div>
                        <div className="text-[10px] text-slate-500">{session.user.email}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                      Logged In
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Google OAuth for User Sign-In */}
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        const currentPath = typeof window !== 'undefined' ? window.location.pathname : `/pg/${property.id}`
                        signIn('google', { callbackUrl: currentPath })
                      }}
                      className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs py-2.5 px-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:-translate-y-[1px]"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                      <span>Continue with Google</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <div className="h-[1px] bg-slate-200 flex-1" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">or sign in below</span>
                      <div className="h-[1px] bg-slate-200 flex-1" />
                    </div>

                    <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50 gap-1">
                      <button
                        type="button"
                        onClick={() => setAuthTab('otp')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          authTab === 'otp' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        📱 Email / Mobile OTP
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthTab('quick')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          authTab === 'quick' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        ⚡ 1-Click Fast Demo
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthTab('login')}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          authTab === 'login' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        Password
                      </button>
                    </div>

                    {authTab === 'otp' && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                          <button
                            type="button"
                            onClick={() => {
                              setBookingOtpType('EMAIL')
                              setIsBookingOtpSent(false)
                              setBookingOtpCode('')
                            }}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                              bookingOtpType === 'EMAIL' ? 'bg-indigo-100 text-indigo-800' : 'text-slate-500'
                            }`}
                          >
                            Email OTP
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setBookingOtpType('PHONE')
                              setIsBookingOtpSent(false)
                              setBookingOtpCode('')
                            }}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                              bookingOtpType === 'PHONE' ? 'bg-indigo-100 text-indigo-800' : 'text-slate-500'
                            }`}
                          >
                            Mobile OTP
                          </button>
                        </div>

                        {!isBookingOtpSent ? (
                          <div className="flex gap-2">
                            <input
                              type={bookingOtpType === 'EMAIL' ? 'email' : 'tel'}
                              placeholder={bookingOtpType === 'EMAIL' ? 'Enter email (e.g. name@domain.com)' : '+91 98765 43210'}
                              value={bookingOtpTarget}
                              onChange={(e) => setBookingOtpTarget(e.target.value)}
                              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                            />
                            <button
                              type="button"
                              disabled={isLoading || !bookingOtpTarget}
                              onClick={handleSendBookingOtp}
                              className="bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs px-3 py-2 rounded-xl disabled:opacity-50"
                            >
                              Send OTP
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-500 font-medium">OTP sent to: <strong className="text-slate-800">{bookingOtpTarget}</strong></span>
                              <button
                                type="button"
                                onClick={() => setIsBookingOtpSent(false)}
                                className="text-indigo-600 font-bold hover:underline"
                              >
                                Edit
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                maxLength={6}
                                placeholder="6-digit OTP"
                                value={bookingOtpCode}
                                onChange={(e) => setBookingOtpCode(e.target.value.replace(/\D/g, ''))}
                                className="flex-1 text-center font-mono text-sm tracking-widest bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold"
                              />
                              <button
                                type="button"
                                disabled={isLoading || bookingOtpCode.length !== 6}
                                onClick={handleVerifyBookingOtp}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-xl disabled:opacity-50"
                              >
                                Verify &amp; Continue
                              </button>
                            </div>
                            <div className="text-[10px] text-slate-400 text-center">
                              Demo Mode OTP: <strong className="font-bold text-amber-700">123456</strong>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {authTab === 'quick' && (
                      <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-indigo-950">Quick Sign In as Priya Sharma</div>
                          <div className="text-[10px] text-indigo-700">priya.sharma@gmail.com</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleQuickLogin('priya.sharma@gmail.com', 'password123')}
                          disabled={isLoading}
                          className="bg-brand-primary hover:bg-brand-primary-dark text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
                        >
                          Auto-fill &amp; Login
                        </button>
                      </div>
                    )}

                    {authTab === 'login' && (
                      <form onSubmit={handleManualLogin} className="space-y-2">
                        <input
                          type="email"
                          placeholder="Email address"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                        />
                        <input
                          type="password"
                          placeholder="Password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                        />
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl"
                        >
                          Sign In &amp; Continue
                        </button>
                      </form>
                    )}

                    {authTab === 'register' && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Your Full Name"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                        />
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                        />
                        <input
                          type="password"
                          placeholder="Create a Password"
                          value={guestPassword}
                          onChange={(e) => setGuestPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 4: Transparent Split & Booking Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-700">
                  <span>Total Booking Amount:</span>
                  <span className="font-bold text-slate-900 font-mono">₹{bookingAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-indigo-700">
                  <span>TrustNest Platform Fee (10%):</span>
                  <span className="font-bold font-mono">₹{trustNestCommission.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-700">
                  <span>PG Owner Share (90%):</span>
                  <span className="font-bold font-mono">₹{ownerPayoutAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-brand-primary font-mono">₹{bookingAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-brand-primary focus:ring-brand-primary accent-indigo-600 cursor-pointer"
                />
                <span>
                  I accept the <strong>TrustNest verified resident agreement</strong> and acknowledge demo payment terms.
                </span>
              </label>

              {/* Simulation Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleBookPayment(false)}
                  disabled={isLoading || !selectedBedId}
                  className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs py-3.5 rounded-xl shadow-premium hover:shadow-premium-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simulate Successful Payment</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleBookPayment(true)}
                  disabled={isLoading || !selectedBedId}
                  className="w-full bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-bold text-xs py-3.5 rounded-xl border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span>Simulate Failed Payment</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
