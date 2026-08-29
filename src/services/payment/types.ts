export type PaymentMode = 'DEMO' | 'CASHFREE'
export type PaymentStatus = 'SUCCESS' | 'PAID' | 'PENDING' | 'FAILED'
export type PaymentType = 'BOOKING' | 'SUBSCRIPTION' | 'RENT'

export interface CreateOrderParams {
  amount: number
  currency?: string
  customerDetails: {
    customerId: string
    customerName: string
    customerEmail: string
    customerPhone?: string
  }
  orderMeta?: {
    returnUrl?: string
    notifyUrl?: string
    paymentMethods?: string
  }
  type: PaymentType
  entityId: string // bookingId or subscriptionId or propertyId
  splitDetails?: {
    ownerId: string
    trustNestCommissionPercent: number // e.g. 10%
    ownerPercent: number // e.g. 90%
  }
}

export interface OrderResult {
  success: boolean
  orderId: string
  transactionId: string
  amount: number
  currency: string
  paymentSessionId?: string
  paymentMode: PaymentMode
  isDemo: boolean
  error?: string
}

export interface ProcessDemoPaymentParams {
  type: PaymentType
  entityId: string // bookingId or subscriptionId or propertyId
  amount: number
  userId?: string
  ownerId?: string
  propertyId?: string
  planName?: string
  simulateFailure?: boolean
  failureReason?: string
  splitDetails?: {
    trustNestAmount: number
    ownerAmount: number
  }
}

export interface PaymentResult {
  success: boolean
  transactionId: string
  status: PaymentStatus
  amount: number
  currency: string
  paymentMode: PaymentMode
  isDemo: boolean
  paidAt?: Date
  failureReason?: string
  message: string
  data?: any
}

export interface PaymentService {
  readonly mode: PaymentMode
  createOrder(params: CreateOrderParams): Promise<OrderResult>
  processDemoPayment(params: ProcessDemoPaymentParams): Promise<PaymentResult>
  verifyPayment(transactionId: string): Promise<PaymentResult>
  getPaymentStatus(transactionId: string): Promise<PaymentStatus>
}
