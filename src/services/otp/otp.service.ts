import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export interface SendOtpParams {
  target: string // email address or phone number (e.g. +919876543210)
  type: 'EMAIL' | 'PHONE'
}

export interface VerifyOtpParams {
  target: string
  type: 'EMAIL' | 'PHONE'
  otp: string
  userName?: string
}

export interface SendOtpResult {
  success: boolean
  isDemo: boolean
  demoOtp?: string
  message: string
  resendInSeconds: number
  error?: string
}

export interface VerifyOtpResult {
  success: boolean
  authToken?: string
  user?: {
    id: string
    email: string
    name: string
    role: string
    phone?: string | null
  }
  message: string
  error?: string
}

/**
 * Normalizes phone numbers to standard E.164 format (+919876543210 for India)
 */
export function normalizePhoneNumber(rawPhone: string): string {
  let cleaned = rawPhone.replace(/[^\d+]/g, '').trim()
  if (!cleaned.startsWith('+')) {
    // If 10-digit Indian number without country code, prepend +91
    if (cleaned.length === 10) {
      cleaned = `+91${cleaned}`
    } else if (cleaned.startsWith('91') && cleaned.length === 12) {
      cleaned = `+${cleaned}`
    } else {
      cleaned = `+91${cleaned}`
    }
  }
  return cleaned
}

/**
 * Normalizes email address
 */
export function normalizeEmail(rawEmail: string): string {
  return rawEmail.toLowerCase().trim()
}

export class OtpService {
  private static readonly DEMO_OTP = '123456'
  private static readonly OTP_EXPIRY_MINUTES = 5
  private static readonly RESEND_COOLDOWN_SECONDS = 30
  private static readonly MAX_ATTEMPTS = 5

  /**
   * Check whether system is currently running in DEMO mode
   */
  public static isDemoMode(): boolean {
    const mode = process.env.OTP_MODE?.toUpperCase().trim()
    return mode === 'DEMO' || !mode || mode === 'DEVELOPMENT'
  }

  /**
   * Sends an OTP to the target Email or Mobile number
   */
  public static async sendOtp(params: SendOtpParams): Promise<SendOtpResult> {
    try {
      const type = params.type
      const rawTarget = params.target.trim()

      if (!rawTarget) {
        return {
          success: false,
          isDemo: this.isDemoMode(),
          message: type === 'EMAIL' ? 'Please enter a valid email address.' : 'Please enter a valid mobile number.',
          resendInSeconds: 0,
          error: type === 'EMAIL' ? 'Email address is required.' : 'Mobile number is required.'
        }
      }

      const target = type === 'EMAIL' ? normalizeEmail(rawTarget) : normalizePhoneNumber(rawTarget)

      // Email format validation
      if (type === 'EMAIL') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(target)) {
          return {
            success: false,
            isDemo: this.isDemoMode(),
            message: 'Invalid email address format.',
            resendInSeconds: 0,
            error: 'Please enter a valid email address (e.g. name@example.com).'
          }
        }
      }

      // Phone format validation (E.164: + followed by 10 to 15 digits)
      if (type === 'PHONE') {
        const phoneRegex = /^\+[1-9]\d{9,14}$/
        if (!phoneRegex.test(target)) {
          return {
            success: false,
            isDemo: this.isDemoMode(),
            message: 'Invalid mobile number format.',
            resendInSeconds: 0,
            error: 'Please enter a valid 10-digit mobile number.'
          }
        }
      }

      // Check Resend Cooldown
      const recentOtp = await prisma.otpVerification.findFirst({
        where: {
          target,
          type,
          status: 'PENDING'
        },
        orderBy: { createdAt: 'desc' }
      })

      const now = new Date()
      if (recentOtp && recentOtp.resendAfter && recentOtp.resendAfter > now) {
        const remainingSeconds = Math.ceil((recentOtp.resendAfter.getTime() - now.getTime()) / 1000)
        return {
          success: false,
          isDemo: this.isDemoMode(),
          message: `Please wait ${remainingSeconds}s before requesting a new OTP.`,
          resendInSeconds: remainingSeconds,
          error: `Resend cooldown active. Please wait ${remainingSeconds} seconds.`
        }
      }

      // Invalidate any prior pending OTPs for this target
      await prisma.otpVerification.updateMany({
        where: {
          target,
          type,
          status: 'PENDING'
        },
        data: { status: 'EXPIRED' }
      })

      const isDemo = this.isDemoMode()
      const otpCode = isDemo 
        ? this.DEMO_OTP 
        : Math.floor(100000 + Math.random() * 900000).toString()

      const otpHash = bcrypt.hashSync(otpCode, 8)
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000)
      const resendAfter = new Date(Date.now() + this.RESEND_COOLDOWN_SECONDS * 1000)

      // Store in DB
      await prisma.otpVerification.create({
        data: {
          target,
          type,
          otpHash,
          status: 'PENDING',
          attempts: 0,
          maxAttempts: this.MAX_ATTEMPTS,
          expiresAt,
          resendAfter
        }
      })

      // Dispatch via MSG91 in Production Mode
      if (!isDemo) {
        await this.dispatchMsg91({
          target,
          type,
          otpCode
        })
      }

      return {
        success: true,
        isDemo,
        demoOtp: isDemo ? this.DEMO_OTP : undefined,
        message: isDemo
          ? `Demo mode — use development OTP: ${this.DEMO_OTP}`
          : type === 'EMAIL'
          ? 'Verification OTP sent to your email address.'
          : 'Verification OTP sent to your mobile number via SMS.',
        resendInSeconds: this.RESEND_COOLDOWN_SECONDS
      }
    } catch (error: any) {
      console.error('OtpService.sendOtp error:', error)
      return {
        success: false,
        isDemo: this.isDemoMode(),
        message: 'Failed to send OTP. Please try again.',
        resendInSeconds: 0,
        error: error?.message || 'Internal server error while sending OTP.'
      }
    }
  }

  /**
   * Verifies an OTP entered by the user
   */
  public static async verifyOtp(params: VerifyOtpParams): Promise<VerifyOtpResult> {
    try {
      const { type, otp, userName } = params
      const rawTarget = params.target.trim()
      const enteredOtp = (otp || '').trim()

      if (!rawTarget || !enteredOtp) {
        return {
          success: false,
          message: 'Target and OTP are required.',
          error: 'Please enter the 6-digit verification OTP.'
        }
      }

      const target = type === 'EMAIL' ? normalizeEmail(rawTarget) : normalizePhoneNumber(rawTarget)

      // Find latest pending OTP record
      const record = await prisma.otpVerification.findFirst({
        where: {
          target,
          type,
          status: 'PENDING'
        },
        orderBy: { createdAt: 'desc' }
      })

      if (!record) {
        return {
          success: false,
          message: 'No active OTP request found. Please request a new OTP.',
          error: 'No active OTP found. Please click "Send OTP".'
        }
      }

      const now = new Date()

      // Check Expiration
      if (record.expiresAt < now) {
        await prisma.otpVerification.update({
          where: { id: record.id },
          data: { status: 'EXPIRED' }
        })
        return {
          success: false,
          message: 'This OTP has expired. Please request a new OTP.',
          error: 'OTP expired. Please request a new OTP.'
        }
      }

      // Check Max Attempts
      if (record.attempts >= record.maxAttempts) {
        await prisma.otpVerification.update({
          where: { id: record.id },
          data: { status: 'FAILED' }
        })
        return {
          success: false,
          message: 'Too many invalid attempts. This OTP has been invalidated.',
          error: 'Maximum attempts exceeded. Please request a new OTP.'
        }
      }

      // Verify OTP code
      const isDemo = this.isDemoMode()
      const isValid = isDemo 
        ? enteredOtp === this.DEMO_OTP || bcrypt.compareSync(enteredOtp, record.otpHash)
        : bcrypt.compareSync(enteredOtp, record.otpHash)

      if (!isValid) {
        const nextAttempts = record.attempts + 1
        const remaining = record.maxAttempts - nextAttempts

        await prisma.otpVerification.update({
          where: { id: record.id },
          data: { 
            attempts: nextAttempts,
            status: nextAttempts >= record.maxAttempts ? 'FAILED' : 'PENDING'
          }
        })

        return {
          success: false,
          message: remaining > 0 
            ? `Invalid OTP. ${remaining} attempt(s) remaining.` 
            : 'Too many invalid attempts. Please request a new OTP.',
          error: `Invalid OTP code. ${remaining > 0 ? `${remaining} attempts left.` : 'Please request a new OTP.'}`
        }
      }

      // OTP Verified Successfully!
      const authToken = `tn_auth_${crypto.randomUUID().replace(/-/g, '')}`

      await prisma.otpVerification.update({
        where: { id: record.id },
        data: {
          status: 'VERIFIED',
          verifiedAt: now,
          authToken
        }
      })

      // Resolve or create User in Database
      let user = null

      if (type === 'EMAIL') {
        user = await prisma.user.findUnique({
          where: { email: target }
        })

        if (user) {
          // Existing user: mark email verified without altering existing role
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              emailVerified: now,
              emailVerifiedAt: now
            }
          })
        } else {
          // New user: strictly create as TENANT (TrustNest USER)
          const fallbackName = userName?.trim() || target.split('@')[0] || 'Resident User'
          user = await prisma.user.create({
            data: {
              email: target,
              name: fallbackName,
              role: 'TENANT',
              passwordHash: '',
              emailVerified: now,
              emailVerifiedAt: now
            }
          })
        }
      } else {
        // Mobile Verification
        user = await prisma.user.findFirst({
          where: { phone: target }
        })

        if (user) {
          // Existing user with this phone
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              phoneVerified: true,
              mobileVerified: true,
              mobileVerifiedAt: now
            }
          })
        } else {
          // Check if there is an account with a placeholder email for this phone
          const phoneClean = target.replace(/[^\d]/g, '')
          const placeholderEmail = `phone_${phoneClean}@trustnest.user`

          user = await prisma.user.findUnique({
            where: { email: placeholderEmail }
          })

          if (user) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                phone: target,
                phoneVerified: true,
                mobileVerified: true,
                mobileVerifiedAt: now
              }
            })
          } else {
            // Create new TENANT user
            const fallbackName = userName?.trim() || `User ${target.slice(-4)}`
            user = await prisma.user.create({
              data: {
                email: placeholderEmail,
                phone: target,
                name: fallbackName,
                role: 'TENANT',
                passwordHash: '',
                phoneVerified: true,
                mobileVerified: true,
                mobileVerifiedAt: now
              }
            })
          }
        }
      }

      // Record AuditLog
      await prisma.auditLog.create({
        data: {
          actor: user.id,
          role: user.role,
          action: type === 'EMAIL' ? 'EMAIL_OTP_VERIFIED' : 'MOBILE_OTP_VERIFIED',
          entity: 'User',
          entityId: user.id,
          details: JSON.stringify({
            target,
            type,
            verifiedAt: now.toISOString(),
            method: isDemo ? 'DEMO_MODE' : 'MSG91'
          })
        }
      }).catch(() => null)

      return {
        success: true,
        authToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone
        },
        message: `${type === 'EMAIL' ? 'Email' : 'Mobile number'} verified successfully!`
      }
    } catch (error: any) {
      console.error('OtpService.verifyOtp error:', error)
      return {
        success: false,
        message: 'Verification failed. Please try again.',
        error: error?.message || 'Internal server error during verification.'
      }
    }
  }

  /**
   * Helper to dispatch real SMS / Email via MSG91 API in Production
   */
  private static async dispatchMsg91(params: { target: string; type: 'EMAIL' | 'PHONE'; otpCode: string }) {
    const authKey = process.env.MSG91_AUTH_KEY
    const widgetId = process.env.MSG91_WIDGET_ID

    if (!authKey) {
      console.warn('[MSG91] MSG91_AUTH_KEY is not configured in environment variables.')
      return
    }

    try {
      if (params.type === 'PHONE') {
        const cleanMobile = params.target.replace('+', '')
        const endpoint = 'https://control.msg91.com/api/v5/otp'

        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authkey': authKey
          },
          body: JSON.stringify({
            template_id: process.env.MSG91_TEMPLATE_ID || widgetId,
            mobile: cleanMobile,
            otp: params.otpCode
          })
        })
      } else {
        const endpoint = 'https://control.msg91.com/api/v5/otp/email'
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authkey': authKey
          },
          body: JSON.stringify({
            email: params.target,
            otp: params.otpCode
          })
        })
      }
    } catch (error) {
      console.error('[MSG91] API dispatch failed:', error)
    }
  }
}

/**
 * Backward compatible instance for legacy caller actions
 */
export const otpService = {
  async sendOTP(req: { phone: string; userId: string }) {
    const res = await OtpService.sendOtp({ target: req.phone, type: 'PHONE' })
    return {
      success: res.success,
      message: res.message,
      demoOTP: res.demoOtp
    }
  },
  async verifyOTP(req: { phone: string; userId: string; otp: string }) {
    const res = await OtpService.verifyOtp({ target: req.phone, type: 'PHONE', otp: req.otp })
    return {
      success: res.success,
      message: res.message
    }
  }
}

