'use server'

import { OtpService, normalizeEmail, normalizePhoneNumber } from '@/services/otp/otp.service'
import { prisma } from '@/lib/prisma'

export async function sendOtpAction(target: string, type: 'EMAIL' | 'PHONE') {
  return await OtpService.sendOtp({
    target,
    type
  })
}

export async function verifyOtpAction(
  target: string, 
  type: 'EMAIL' | 'PHONE', 
  otp: string, 
  userName?: string
) {
  return await OtpService.verifyOtp({
    target,
    type,
    otp,
    userName
  })
}

export async function getOtpConfigAction() {
  const isDemo = OtpService.isDemoMode()
  return {
    isDemo,
    demoOtp: isDemo ? '123456' : null,
    provider: isDemo ? 'DEMO' : 'MSG91'
  }
}
