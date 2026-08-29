import { PaymentService } from './types'
import { DemoPaymentService } from './demo-payment.service'
import { CashfreePaymentService } from './cashfree-payment.service'

let instance: PaymentService | null = null

export function getPaymentService(): PaymentService {
  if (instance) return instance

  const mode = process.env.PAYMENT_MODE?.toUpperCase() || 'DEMO'

  if (mode === 'CASHFREE' && process.env.CASHFREE_APP_ID && !process.env.CASHFREE_APP_ID.startsWith('TEST_CF')) {
    instance = new CashfreePaymentService()
  } else {
    instance = new DemoPaymentService()
  }

  return instance
}
