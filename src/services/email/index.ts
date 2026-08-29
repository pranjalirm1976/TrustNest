import { EmailService } from './types'
import { ProductionEmailService } from './email.service'

let emailServiceInstance: EmailService | null = null

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new ProductionEmailService()
  }
  return emailServiceInstance
}

export * from './types'
export * from './email.service'
export * from './templates'
