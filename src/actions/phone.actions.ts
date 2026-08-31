'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { otpService } from '@/services/otp/otp.service'
import { revalidatePath } from 'next/cache'

export interface SendOTPResponse {
  success: boolean
  message: string
  demoOTP?: string
}

export interface VerifyOTPResponse {
  success: boolean
  message: string
}

/**
 * Send OTP to user's phone number
 * Creates PhoneVerification record in database
 */
export async function sendPhoneOTP(
  phone: string
): Promise<SendOTPResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Authentication required'
      }
    }

    // Validate phone format
    const cleanPhone = phone.replace(/\s/g, '')
    if (!/^\+?[1-9]\d{1,14}$/.test(cleanPhone)) {
      return {
        success: false,
        message: 'Invalid phone number format'
      }
    }

    const userId = session.user.id

    // Generate OTP (6-digit random code)
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP in database with expiration
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    const phoneVerification = await prisma.phoneVerification.upsert({
      where: {
        userId_phone: {
          userId,
          phone: cleanPhone
        }
      },
      update: {
        otp,
        status: 'PENDING',
        expiresAt,
        attempts: 0
      },
      create: {
        userId,
        phone: cleanPhone,
        otp,
        status: 'PENDING',
        expiresAt
      }
    })

    // Send OTP via service (DEMO or production)
    const otpResponse = await otpService.sendOTP({
      phone: cleanPhone,
      userId
    })

    if (!otpResponse.success) {
      return {
        success: false,
        message: otpResponse.message
      }
    }

    // Log audit event
    await prisma.auditLog.create({
      data: {
        actor: userId,
        role: session.user.role,
        action: 'PHONE_OTP_SENT',
        entity: 'User',
        entityId: userId,
        details: JSON.stringify({ phone: cleanPhone })
      }
    }).catch(() => null) // Non-critical

    return {
      success: true,
      message: otpResponse.message,
      demoOTP: otpResponse.demoOTP
    }
  } catch (error) {
    console.error('Send phone OTP error:', error)
    return {
      success: false,
      message: 'Failed to send OTP. Please try again.'
    }
  }
}

/**
 * Verify OTP and mark phone as verified
 */
export async function verifyPhoneOTP(
  phone: string,
  otp: string
): Promise<VerifyOTPResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Authentication required'
      }
    }

    const cleanPhone = phone.replace(/\s/g, '')
    const userId = session.user.id

    // Find phone verification record
    const phoneVerification = await prisma.phoneVerification.findUnique({
      where: {
        userId_phone: {
          userId,
          phone: cleanPhone
        }
      }
    })

    if (!phoneVerification) {
      return {
        success: false,
        message: 'Phone verification record not found. Please request a new OTP.'
      }
    }

    // Check if expired
    if (phoneVerification.expiresAt < new Date()) {
      await prisma.phoneVerification.update({
        where: { id: phoneVerification.id },
        data: { status: 'EXPIRED' }
      })

      return {
        success: false,
        message: 'OTP expired. Please request a new one.'
      }
    }

    // Check attempt count (max 5 attempts)
    if (phoneVerification.attempts >= 5) {
      return {
        success: false,
        message: 'Too many attempts. Please request a new OTP.'
      }
    }

    // Verify OTP via service
    const otpResponse = await otpService.verifyOTP({
      phone: cleanPhone,
      userId,
      otp
    })

    if (!otpResponse.success) {
      // Increment attempt count
      await prisma.phoneVerification.update({
        where: { id: phoneVerification.id },
        data: { attempts: phoneVerification.attempts + 1 }
      })

      return {
        success: false,
        message: otpResponse.message
      }
    }

    // Mark phone as verified
    await prisma.phoneVerification.update({
      where: { id: phoneVerification.id },
      data: { status: 'VERIFIED' }
    })

    // Update user's phone info
    await prisma.user.update({
      where: { id: userId },
      data: {
        phone: cleanPhone,
        phoneVerified: true
      }
    })

    // Log audit event
    await prisma.auditLog.create({
      data: {
        actor: userId,
        role: session.user.role,
        action: 'PHONE_VERIFIED',
        entity: 'User',
        entityId: userId,
        details: JSON.stringify({ phone: cleanPhone })
      }
    }).catch(() => null) // Non-critical

    revalidatePath('/tenant')
    revalidatePath('/owner')

    return {
      success: true,
      message: 'Phone verified successfully'
    }
  } catch (error) {
    console.error('Verify phone OTP error:', error)
    return {
      success: false,
      message: 'Failed to verify phone. Please try again.'
    }
  }
}

/**
 * Get user's phone verification status
 */
export async function getPhoneVerificationStatus(): Promise<{
  verified: boolean
  phone?: string
}> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return { verified: false }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    return {
      verified: user?.phoneVerified || false,
      phone: user?.phone || undefined
    }
  } catch (error) {
    console.error('Get phone status error:', error)
    return { verified: false }
  }
}
