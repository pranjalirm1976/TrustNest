'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendPhoneOTP, verifyPhoneOTP } from '@/actions/phone.actions'
import Link from 'next/link'

export default function PhoneVerifyPage() {
  const router = useRouter()
  const [step, setStep] = useState<'enter' | 'verify'>('enter')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [demoOTP, setDemoOTP] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await sendPhoneOTP(phone)

      if (result.success) {
        setDemoOTP(result.demoOTP || '')
        setStep('verify')
        setSuccess(`OTP sent to ${phone}`)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await verifyPhoneOTP(phone, otp)

      if (result.success) {
        setSuccess('Phone verified successfully!')
        setTimeout(() => {
          router.push('/tenant')
        }, 1500)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Phone Verification</h1>
          <p className="text-gray-600">Verify your phone number to continue</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {demoOTP && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-semibold text-yellow-800 mb-1">📌 Demo OTP (for testing)</p>
            <p className="text-lg font-mono font-bold text-yellow-900">{demoOTP}</p>
            <p className="text-xs text-yellow-700 mt-2">
              This is a demo environment. Use the OTP above to complete verification.
            </p>
          </div>
        )}

        {step === 'enter' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your phone number in E.164 format (e.g., +91 or +1)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !phone}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP <span className="text-red-500">*</span>
              </label>
              <input
                id="otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                maxLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                6-digit code sent to {phone}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('enter')
                setOtp('')
                setError('')
              }}
              className="w-full text-indigo-600 hover:text-indigo-700 font-semibold py-2"
            >
              Change Phone Number
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Not now?{' '}
            <Link href="/tenant" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Skip for now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
