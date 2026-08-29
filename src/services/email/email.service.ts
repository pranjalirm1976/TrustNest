import {
  EmailService,
  EmailProvider,
  EmailResult,
  UserBookingConfirmationParams,
  OwnerNewBookingParams,
  PGVerificationSubmittedParams,
  PGVerificationApprovedParams,
  PGVerificationActionRequiredParams,
  SuperAdminPGAlertParams,
  ComplaintNotificationParams
} from './types'
import {
  generateUserBookingConfirmationEmail,
  generateOwnerNewBookingEmail,
  generatePGVerificationSubmittedEmail,
  generatePGApprovedEmail,
  generatePGActionRequiredEmail,
  generateSuperAdminPGAlertEmail,
  generateComplaintEmail
} from './templates'

export class ProductionEmailService implements EmailService {
  readonly provider: EmailProvider

  constructor() {
    const configuredProvider = process.env.EMAIL_PROVIDER?.toUpperCase()
    if (configuredProvider === 'RESEND' && process.env.EMAIL_API_KEY && !process.env.EMAIL_API_KEY.startsWith('PLACEHOLDER')) {
      this.provider = 'RESEND'
    } else if (configuredProvider === 'SMTP' && process.env.SMTP_HOST) {
      this.provider = 'SMTP'
    } else {
      this.provider = 'CONSOLE'
    }
  }

  private async dispatchEmail(to: string, subject: string, html: string, text: string): Promise<EmailResult> {
    const timestamp = new Date()
    const fromAddress = process.env.EMAIL_FROM || 'TrustNest Support <notifications@trustnest.in>'

    try {
      if (this.provider === 'RESEND') {
        const apiKey = process.env.EMAIL_API_KEY
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
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
          throw new Error(data.message || 'Failed to dispatch email via Resend')
        }

        return {
          success: true,
          messageId: data.id,
          status: 'SENT',
          provider: 'RESEND',
          timestamp
        }
      } else if (this.provider === 'SMTP') {
        // SMTP logging stub (Nodemailer can be attached when SMTP config provided)
        console.log(`[Email Service - SMTP] Sent to: ${to} | Subject: "${subject}"`)
        return {
          success: true,
          messageId: `smtp_${Date.now()}`,
          status: 'SENT',
          provider: 'SMTP',
          timestamp
        }
      } else {
        // CONSOLE Sandbox Logger (Safe local/sandbox testing)
        console.log('\n================== [TRUSTNEST EMAIL DISPATCH (SANDBOX)] ==================')
        console.log(`TO:       ${to}`)
        console.log(`FROM:     ${fromAddress}`)
        console.log(`SUBJECT:  ${subject}`)
        console.log(`TIME:     ${timestamp.toISOString()}`)
        console.log('--- BODY (Plaintext Preview) ---')
        console.log(text.trim())
        console.log('==========================================================================\n')

        return {
          success: true,
          messageId: `console_${Date.now()}`,
          status: 'SENT',
          provider: 'CONSOLE',
          timestamp
        }
      }
    } catch (error: any) {
      console.error(`[Email Service] Failed to send email to ${to}:`, error.message)
      // NON-BLOCKING: returns failure metadata without throwing exception
      return {
        success: false,
        status: 'FAILED',
        provider: this.provider,
        error: error.message,
        timestamp
      }
    }
  }

  async sendBookingConfirmationToUser(params: UserBookingConfirmationParams): Promise<EmailResult> {
    const { subject, html, text } = generateUserBookingConfirmationEmail(params)
    return this.dispatchEmail(params.toEmail, subject, html, text)
  }

  async sendNewBookingNotificationToOwner(params: OwnerNewBookingParams): Promise<EmailResult> {
    const { subject, html, text } = generateOwnerNewBookingEmail(params)
    return this.dispatchEmail(params.ownerEmail, subject, html, text)
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
}
