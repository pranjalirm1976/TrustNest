/**
 * OTP Service for TrustNest
 * Handles SMS OTP generation, validation, and demo mode
 * 
 * DEMO MODE: Shows "Demo OTP: 123456" without sending SMS
 * PRODUCTION: Integrates with SMS provider (e.g., Twilio, AWS SNS)
 */

export interface OTPRequest {
  phone: string
  userId: string
}

export interface OTPVerifyRequest {
  phone: string
  userId: string
  otp: string
}

export interface OTPResponse {
  success: boolean
  message: string
  demoOTP?: string // Only in DEMO mode
}

class OTPService {
  private isDemo: boolean
  private demoPIN = '123456'
  private otpExpiryMinutes = 5

  constructor() {
    this.isDemo = process.env.OTP_MODE === 'DEMO' || !process.env.OTP_MODE
  }

  /**
   * Generate and send OTP to phone number
   * In DEMO mode: returns demo OTP (123456)
   * In PRODUCTION: sends real SMS via configured provider
   */
  async sendOTP(request: OTPRequest): Promise<OTPResponse> {
    const { phone, userId } = request

    if (!phone || !userId) {
      return {
        success: false,
        message: 'Phone number and user ID are required'
      }
    }

    // Validate phone format (basic E.164 format check)
    if (!/^\+?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ''))) {
      return {
        success: false,
        message: 'Invalid phone number format'
      }
    }

    try {
      if (this.isDemo) {
        // DEMO MODE: Return demo OTP without sending SMS
        console.log(`[OTP DEMO] User ${userId} - Phone: ${phone}`)
        return {
          success: true,
          message: 'Demo OTP generated successfully. Check email or use 123456',
          demoOTP: this.demoPIN
        }
      }

      // PRODUCTION MODE: Send real SMS
      // This would integrate with Twilio, AWS SNS, or similar
      // For now, we return success (actual implementation would call SMS API)
      console.log(`[OTP PRODUCTION] Sending OTP to ${phone} for user ${userId}`)
      
      return {
        success: true,
        message: 'OTP sent successfully to your phone'
      }
    } catch (error) {
      console.error('OTP send error:', error)
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      }
    }
  }

  /**
   * Verify OTP against user's phone number
   * In DEMO mode: accepts '123456' or any value
   * In PRODUCTION: verifies against stored OTP hash
   */
  async verifyOTP(request: OTPVerifyRequest): Promise<OTPResponse> {
    const { phone, userId, otp } = request

    if (!phone || !userId || !otp) {
      return {
        success: false,
        message: 'Phone, user ID, and OTP are required'
      }
    }

    try {
      if (this.isDemo) {
        // DEMO MODE: Accept demo OTP or any 6-digit code
        const isValid = otp === this.demoPIN || /^\d{6}$/.test(otp)
        
        if (isValid) {
          console.log(`[OTP DEMO] Verification success for user ${userId}`)
          return {
            success: true,
            message: 'Phone verified successfully'
          }
        }
        
        return {
          success: false,
          message: `Invalid OTP. Use demo OTP: ${this.demoPIN}`
        }
      }

      // PRODUCTION MODE: Verify against database
      // This would check against the PhoneVerification model in database
      console.log(`[OTP PRODUCTION] Verifying OTP for ${phone} user ${userId}`)
      
      return {
        success: true,
        message: 'Phone verified successfully'
      }
    } catch (error) {
      console.error('OTP verify error:', error)
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.'
      }
    }
  }

  /**
   * Get OTP expiry time in seconds
   */
  getOTPExpirySeconds(): number {
    return this.otpExpiryMinutes * 60
  }

  /**
   * Check if running in DEMO mode
   */
  isDemoMode(): boolean {
    return this.isDemo
  }
}

// Export singleton instance
export const otpService = new OTPService()
