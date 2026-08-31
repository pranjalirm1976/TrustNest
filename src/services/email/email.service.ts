import { prisma } from '@/lib/prisma'
import {
  EmailService,
  EmailProvider,
  EmailResult,
  UserBookingConfirmationParams,
  OwnerNewBookingParams,
  SuperAdminNewBookingParams,
  PGVerificationSubmittedParams,
  PGVerificationApprovedParams,
  PGVerificationActionRequiredParams,
  SuperAdminPGAlertParams,
  ComplaintNotificationParams,
  BookingCancellationEmailParams
} from './types'
import {
  generateUserBookingConfirmationEmail,
  generateOwnerNewBookingEmail,
  generateSuperAdminNewBookingEmail,
  generateBookingCancellationEmail,
  generatePGVerificationSubmittedEmail,
  generatePGApprovedEmail,
  generatePGActionRequiredEmail,
  generateSuperAdminPGAlertEmail,
  generateComplaintEmail,
  generatePhoneOTPVerificationEmail,
  generateIdentityVerificationApprovedEmail,
  generateIdentityVerificationRejectedEmail,
  generateInventoryAgreementCreatedEmail,
  generateInventoryAgreementAcceptedEmail
} from './templates'

export class ProductionEmailService implements EmailService {
  readonly provider: EmailProvider

  constructor() {
    const resendKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY
    if (resendKey && !resendKey.startsWith('PLACEHOLDER') && !resendKey.startsWith('TEST_')) {
      this.provider = 'RESEND'
    } else if (process.env.EMAIL_PROVIDER?.toUpperCase() === 'SMTP' && process.env.SMTP_HOST) {
      this.provider = 'SMTP'
    } else {
      this.provider = 'CONSOLE'
    }
  }

  /**
   * Internal dispatcher for generic emails
   */
  private async dispatchEmail(to: string, subject: string, html: string, text: string): Promise<EmailResult> {
    const timestamp = new Date()
    const fromAddress = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM || 'TrustNest Notifications <notifications@trustnest.in>'
    const resendKey = process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY

    try {
      if (!to || !to.includes('@')) {
        return {
          success: false,
          status: 'FAILED',
          provider: this.provider,
          error: 'Recipient email address is missing or invalid',
          timestamp
        }
      }

      if (this.provider === 'RESEND' && resendKey) {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendKey}`
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [to],
            subject,
            html,
            text
          })
        })

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.message || 'Failed to dispatch email via Resend API')
        }

        return {
          success: true,
          messageId: data.id,
          status: 'SENT',
          provider: 'RESEND',
          timestamp
        }
      } else {
        // DEMO / CONSOLE Mode
        console.log('\n================== [DEMO EMAIL PREVIEW — PROVIDER NOT CONFIGURED] ==================')
        console.log(`TO:       ${to}`)
        console.log(`FROM:     ${fromAddress}`)
        console.log(`SUBJECT:  ${subject}`)
        console.log(`TIME:     ${timestamp.toISOString()}`)
        console.log(`STATUS:   DEMO / PENDING_PROVIDER`)
        console.log('--- BODY (Plaintext Preview) ---')
        console.log(text.trim())
        console.log('====================================================================================\n')

        return {
          success: true,
          messageId: `demo_${Date.now()}`,
          status: 'PENDING_PROVIDER',
          provider: 'CONSOLE',
          timestamp
        }
      }
    } catch (error: any) {
      console.error(`[Email Service] Failed to send email to ${to}:`, error.message)
      return {
        success: false,
        status: 'FAILED',
        provider: this.provider,
        error: error.message,
        timestamp
      }
    }
  }

  /**
   * Idempotent Booking Email Dispatcher with EmailLog Persistence
   */
  private async dispatchBookingEmail(params: {
    bookingId: string
    idempotencyKey: string
    recipient: string
    recipientType: 'USER' | 'OWNER' | 'SUPER_ADMIN'
    emailType: 'USER_BOOKING_CONFIRMATION' | 'OWNER_NEW_BOOKING' | 'ADMIN_NEW_BOOKING'
    subject: string
    html: string
    text: string
  }): Promise<EmailResult> {
    const timestamp = new Date()

    try {
      // 1. Idempotency Check: Prevent duplicate email dispatch
      const existingLog = await prisma.emailLog.findUnique({
        where: { idempotencyKey: params.idempotencyKey }
      }).catch(() => null)

      if (existingLog && (existingLog.status === 'SENT' || existingLog.status === 'PENDING_PROVIDER')) {
        console.log(`[Email Service] Idempotent duplicate suppressed for key: ${params.idempotencyKey}`)
        return {
          success: true,
          messageId: existingLog.messageId || undefined,
          status: existingLog.status as any,
          provider: existingLog.provider as any,
          timestamp: existingLog.createdAt
        }
      }

      // 2. Validate recipient
      if (!params.recipient || !params.recipient.includes('@')) {
        await prisma.emailLog.upsert({
          where: { idempotencyKey: params.idempotencyKey },
          update: { status: 'FAILED', error: 'Missing or invalid recipient email' },
          create: {
            bookingId: params.bookingId,
            idempotencyKey: params.idempotencyKey,
            recipient: params.recipient || 'unknown@trustnest.dummy',
            recipientType: params.recipientType,
            emailType: params.emailType,
            subject: params.subject,
            provider: this.provider,
            status: 'FAILED',
            error: 'Missing or invalid recipient email'
          }
        }).catch(() => null)

        return {
          success: false,
          status: 'FAILED',
          provider: this.provider,
          error: 'Recipient email is missing or invalid.',
          timestamp
        }
      }

      // 3. Dispatch Email
      const result = await this.dispatchEmail(
        params.recipient,
        params.subject,
        params.html,
        params.text
      )

      // 4. Record in EmailLog table
      await prisma.emailLog.upsert({
        where: { idempotencyKey: params.idempotencyKey },
        update: {
          status: result.status,
          provider: result.provider,
          messageId: result.messageId,
          error: result.error,
          sentAt: result.success ? timestamp : null
        },
        create: {
          bookingId: params.bookingId,
          idempotencyKey: params.idempotencyKey,
          recipient: params.recipient,
          recipientType: params.recipientType,
          emailType: params.emailType,
          subject: params.subject,
          provider: result.provider,
          status: result.status,
          messageId: result.messageId,
          error: result.error,
          sentAt: result.success ? timestamp : null
        }
      }).catch(() => null)

      return result
    } catch (err: any) {
      console.error(`[Email Service] Booking email dispatch error (${params.emailType}):`, err?.message)
      return {
        success: false,
        status: 'FAILED',
        provider: this.provider,
        error: err?.message || 'Unexpected email dispatch error',
        timestamp
      }
    }
  }

  // 1. User Booking Confirmation Email
  async sendBookingConfirmationToUser(params: UserBookingConfirmationParams): Promise<EmailResult> {
    const { subject, html, text } = generateUserBookingConfirmationEmail(params)
    const idempotencyKey = `${params.bookingId}_USER_BOOKING_CONFIRMATION`

    return this.dispatchBookingEmail({
      bookingId: params.bookingId,
      idempotencyKey,
      recipient: params.toEmail,
      recipientType: 'USER',
      emailType: 'USER_BOOKING_CONFIRMATION',
      subject,
      html,
      text
    })
  }

  // 2. Owner New Booking Notification Email
  async sendNewBookingNotificationToOwner(params: OwnerNewBookingParams): Promise<EmailResult> {
    const { subject, html, text } = generateOwnerNewBookingEmail(params)
    const idempotencyKey = `${params.bookingId}_OWNER_NEW_BOOKING`

    return this.dispatchBookingEmail({
      bookingId: params.bookingId,
      idempotencyKey,
      recipient: params.ownerEmail,
      recipientType: 'OWNER',
      emailType: 'OWNER_NEW_BOOKING',
      subject,
      html,
      text
    })
  }

  // 3. Super Admin New Booking Notification Email
  async sendNewBookingNotificationToAdmin(params: SuperAdminNewBookingParams): Promise<EmailResult> {
    const { subject, html, text } = generateSuperAdminNewBookingEmail(params)
    const idempotencyKey = `${params.bookingId}_ADMIN_NEW_BOOKING`

    return this.dispatchBookingEmail({
      bookingId: params.bookingId,
      idempotencyKey,
      recipient: params.adminEmail,
      recipientType: 'SUPER_ADMIN',
      emailType: 'ADMIN_NEW_BOOKING',
      subject,
      html,
      text
    })
  }

  async sendBookingCancellation(params: BookingCancellationEmailParams): Promise<EmailResult> {
    const { subject, html, text } = generateBookingCancellationEmail(params)
    return this.dispatchEmail(params.toEmail, subject, html, text)
  }

  async sendPGVerificationSubmitted(params: PGVerificationSubmittedParams): Promise<EmailResult> {
    const { subject, html, text } = generatePGVerificationSubmittedEmail(params)
    return this.dispatchEmail(params.ownerEmail, subject, html, text)
  }

  async sendPGApproved(params: PGVerificationApprovedParams): Promise<EmailResult> {
    const { subject, html, text } = generatePGApprovedEmail(params)
    return this.dispatchEmail(params.ownerEmail, subject, html, text)
  }

  async sendPGActionRequired(params: PGVerificationActionRequiredParams): Promise<EmailResult> {
    const { subject, html, text } = generatePGActionRequiredEmail(params)
    return this.dispatchEmail(params.ownerEmail, subject, html, text)
  }

  async sendSuperAdminPGAlert(params: SuperAdminPGAlertParams): Promise<EmailResult> {
    const { subject, html, text } = generateSuperAdminPGAlertEmail(params)
    return this.dispatchEmail(params.adminEmail, subject, html, text)
  }

  async sendComplaintNotification(params: ComplaintNotificationParams): Promise<EmailResult> {
    const { subject, html, text } = generateComplaintEmail(params)
    return this.dispatchEmail(params.recipientEmail, subject, html, text)
  }

  async sendPhoneOTPVerification(params: any): Promise<EmailResult> {
    const { subject, html, text } = generatePhoneOTPVerificationEmail(params)
    return this.dispatchEmail(params.toEmail, subject, html, text)
  }

  async sendIdentityVerificationApproved(params: any): Promise<EmailResult> {
    const { subject, html, text } = generateIdentityVerificationApprovedEmail(params)
    return this.dispatchEmail(params.toEmail, subject, html, text)
  }

  async sendIdentityVerificationRejected(params: any): Promise<EmailResult> {
    const { subject, html, text } = generateIdentityVerificationRejectedEmail(params)
    return this.dispatchEmail(params.toEmail, subject, html, text)
  }

  async sendInventoryAgreementCreated(params: any): Promise<EmailResult> {
    const { subject, html, text } = generateInventoryAgreementCreatedEmail(params)
    return this.dispatchEmail(params.toEmail, subject, html, text)
  }

  async sendInventoryAgreementAccepted(params: any): Promise<EmailResult> {
    const { subject, html, text } = generateInventoryAgreementAcceptedEmail(params)
    return this.dispatchEmail(params.toEmail, subject, html, text)
  }
}

// Singleton helper
let emailServiceInstance: EmailService | null = null

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new ProductionEmailService()
  }
  return emailServiceInstance
}
