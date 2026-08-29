import {
  PaymentService,
  PaymentMode,
  PaymentStatus,
  CreateOrderParams,
  OrderResult,
  ProcessDemoPaymentParams,
  PaymentResult
} from './types'

/**
 * CashfreePaymentService
 * 
 * Production implementation for Cashfree PG & Easy Split.
 * In DEMO mode, this service provides clear error handling if invoked without active credentials,
 * and contains the exact HTTP payload structure required for live Cashfree v2023-08-01 API.
 */
export class CashfreePaymentService implements PaymentService {
  readonly mode: PaymentMode = 'CASHFREE'
  private appId: string
  private secretKey: string
  private baseUrl: string

  constructor() {
    this.appId = process.env.CASHFREE_APP_ID || ''
    this.secretKey = process.env.CASHFREE_SECRET_KEY || ''
    this.baseUrl = process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg'
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-version': process.env.CASHFREE_API_VERSION || '2023-08-01',
      'x-client-id': this.appId,
      'x-client-secret': this.secretKey,
    }
  }

  /**
   * Create an order on Cashfree with Easy Split configuration
   */
  async createOrder(params: CreateOrderParams): Promise<OrderResult> {
    if (!this.appId || !this.secretKey || this.appId.startsWith('TEST_CF')) {
      throw new Error('Cashfree credentials not configured. Please switch PAYMENT_MODE to "DEMO" or set valid credentials.')
    }

    try {
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      
      const payload: any = {
        order_id: orderId,
        order_amount: params.amount,
        order_currency: params.currency || 'INR',
        customer_details: {
          customer_id: params.customerDetails.customerId,
          customer_name: params.customerDetails.customerName,
          customer_email: params.customerDetails.customerEmail,
          customer_phone: params.customerDetails.customerPhone || '9999999999'
        },
        order_meta: {
          return_url: params.orderMeta?.returnUrl || `${process.env.NEXTAUTH_URL}/api/payments/verify?order_id={order_id}`,
          notify_url: params.orderMeta?.notifyUrl || `${process.env.NEXTAUTH_URL}/api/payments/webhook`,
          payment_methods: params.orderMeta?.paymentMethods || 'upi,cc,dc,nb'
        }
      }

      // If split details are present, configure Cashfree Easy Split
      if (params.splitDetails?.ownerId) {
        payload.order_splits = [
          {
            vendor_id: params.splitDetails.ownerId,
            percentage: params.splitDetails.ownerPercent
          }
        ]
      }

      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create Cashfree order.')
      }

      return {
        success: true,
        orderId: data.order_id,
        transactionId: data.cf_order_id || data.order_id,
        amount: data.order_amount,
        currency: data.order_currency,
        paymentSessionId: data.payment_session_id,
        paymentMode: 'CASHFREE',
        isDemo: false
      }
    } catch (error: any) {
      console.error('Cashfree createOrder error:', error)
      return {
        success: false,
        orderId: '',
        transactionId: '',
        amount: params.amount,
        currency: 'INR',
        paymentMode: 'CASHFREE',
        isDemo: false,
        error: error.message
      }
    }
  }

  /**
   * Cashfree does not process simulated client payments directly.
   * Redirects or falls back gracefully.
   */
  async processDemoPayment(params: ProcessDemoPaymentParams): Promise<PaymentResult> {
    throw new Error('CashfreePaymentService does not support direct demo simulation. Use DemoPaymentService when PAYMENT_MODE="DEMO".')
  }

  /**
   * Verify order status from Cashfree Orders API
   */
  async verifyPayment(orderId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Cashfree order verification failed.')
      }

      const isPaid = data.order_status === 'PAID'
      const status: PaymentStatus = isPaid ? 'PAID' : data.order_status === 'EXPIRED' ? 'FAILED' : 'PENDING'

      return {
        success: isPaid,
        transactionId: data.cf_order_id || orderId,
        status,
        amount: data.order_amount,
        currency: data.order_currency,
        paymentMode: 'CASHFREE',
        isDemo: false,
        paidAt: isPaid ? new Date() : undefined,
        message: `Order status is ${data.order_status}`
      }
    } catch (error: any) {
      console.error('Cashfree verifyPayment error:', error)
      return {
        success: false,
        transactionId: orderId,
        status: 'FAILED',
        amount: 0,
        currency: 'INR',
        paymentMode: 'CASHFREE',
        isDemo: false,
        failureReason: error.message,
        message: error.message
      }
    }
  }

  async getPaymentStatus(orderId: string): Promise<PaymentStatus> {
    const res = await this.verifyPayment(orderId)
    return res.status
  }
}
