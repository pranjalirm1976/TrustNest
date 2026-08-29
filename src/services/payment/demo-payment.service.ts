import { prisma } from '@/lib/prisma'
import {
  PaymentService,
  PaymentMode,
  PaymentStatus,
  CreateOrderParams,
  OrderResult,
  ProcessDemoPaymentParams,
  PaymentResult
} from './types'

export class DemoPaymentService implements PaymentService {
  readonly mode: PaymentMode = 'DEMO'

  /**
   * Helper to generate human-readable fake transaction IDs
   */
  static generateDemoTransactionId(type: 'BOOKING' | 'SUBSCRIPTION' | 'RENT'): string {
    const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase()
    if (type === 'SUBSCRIPTION') {
      return `TNEST_DEMO_${randomHex}`
    } else if (type === 'BOOKING') {
      return `TNEST_BOOKING_DEMO_${randomHex}`
    } else {
      return `TNEST_RENT_DEMO_${randomHex}`
    }
  }

  /**
   * Create an order in DEMO sandbox mode
   */
  async createOrder(params: CreateOrderParams): Promise<OrderResult> {
    const transactionId = DemoPaymentService.generateDemoTransactionId(params.type)
    return {
      success: true,
      orderId: `ORDER_${transactionId}`,
      transactionId,
      amount: params.amount,
      currency: params.currency || 'INR',
      paymentSessionId: `session_demo_${transactionId}`,
      paymentMode: 'DEMO',
      isDemo: true
    }
  }

  /**
   * Process a simulated payment with instant outcome resolution
   */
  async processDemoPayment(params: ProcessDemoPaymentParams): Promise<PaymentResult> {
    const transactionId = DemoPaymentService.generateDemoTransactionId(params.type)
    const isSuccess = !params.simulateFailure
    const currency = 'INR'

    try {
      if (params.type === 'SUBSCRIPTION') {
        // --- PG OWNER SUBSCRIPTION FLOW ---
        const amount = params.amount || 2000.0
        const startDate = new Date()
        const nextBillingDate = new Date()
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)

        if (!isSuccess) {
          // Record failed payment attempt
          const failedPayment = await prisma.payment.create({
            data: {
              transactionId,
              ownerId: params.ownerId,
              propertyId: params.propertyId,
              subscriptionId: params.entityId,
              amount,
              currency,
              status: 'FAILED',
              paymentMode: 'DEMO',
              paymentGateway: 'DEMO',
              type: 'SUBSCRIPTION',
              failureReason: params.failureReason || 'Demo payment failure',
              metadata: JSON.stringify({ isDemo: true, simulation: 'FAILED' })
            }
          })

          // Keep subscription in PENDING / FAILED state
          if (params.entityId) {
            await prisma.ownerSubscription.update({
              where: { id: params.entityId },
              data: {
                status: 'FAILED',
                failureReason: params.failureReason || 'Demo payment failure',
                paymentMode: 'DEMO',
                transactionId
              }
            })
          }

          return {
            success: false,
            transactionId,
            status: 'FAILED',
            amount,
            currency,
            paymentMode: 'DEMO',
            isDemo: true,
            failureReason: params.failureReason || 'Demo payment failure',
            message: 'Payment Failed: Demo payment failure. No money was charged.',
            data: { paymentId: failedPayment.id }
          }
        }

        // Record successful subscription payment
        const result = await prisma.$transaction(async (tx) => {
          let subscription

          if (params.entityId) {
            subscription = await tx.ownerSubscription.update({
              where: { id: params.entityId },
              data: {
                status: 'ACTIVE',
                startDate,
                nextBillingDate,
                currentPeriodStart: startDate,
                currentPeriodEnd: nextBillingDate,
                transactionId,
                paymentMode: 'DEMO',
                failureReason: null
              }
            })
          } else if (params.ownerId) {
            subscription = await tx.ownerSubscription.create({
              data: {
                ownerId: params.ownerId,
                propertyId: params.propertyId,
                planName: params.planName || 'TrustNest PG Owner Plan',
                amount,
                currency,
                status: 'ACTIVE',
                billingCycle: 'MONTHLY',
                startDate,
                nextBillingDate,
                currentPeriodStart: startDate,
                currentPeriodEnd: nextBillingDate,
                transactionId,
                paymentMode: 'DEMO'
              }
            })
          }

          const payment = await tx.payment.create({
            data: {
              transactionId,
              ownerId: params.ownerId,
              propertyId: params.propertyId,
              subscriptionId: subscription?.id,
              amount,
              currency,
              status: 'PAID',
              paymentMode: 'DEMO',
              paymentGateway: 'DEMO',
              type: 'SUBSCRIPTION',
              paidAt: new Date(),
              paymentMethod: 'DEMO',
              metadata: JSON.stringify({
                isDemo: true,
                planName: params.planName || 'TrustNest PG Owner Plan',
                periodStart: startDate,
                periodEnd: nextBillingDate
              })
            }
          })

          // Create subscription invoice record
          if (subscription) {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            const billingMonth = `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`
            await tx.subscriptionInvoice.create({
              data: {
                subscriptionId: subscription.id,
                amount,
                cfPaymentId: transactionId,
                status: 'PAID',
                paidAt: new Date(),
                billingMonth
              }
            })
          }

          return { subscription, payment }
        })

        return {
          success: true,
          transactionId,
          status: 'PAID',
          amount,
          currency,
          paymentMode: 'DEMO',
          isDemo: true,
          paidAt: new Date(),
          message: 'DEMO PAYMENT SUCCESSFUL — TrustNest PG Owner Plan activated! (No real money charged)',
          data: result
        }
      } else {
        // --- USER BOOKING PAYMENT FLOW ---
        const bookingId = params.entityId
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: {
            property: true,
            user: true
          }
        })

        if (!booking) {
          throw new Error('Booking record not found for payment processing.')
        }

        const totalAmount = params.amount || booking.totalAmount
        // Demo split: 10% platform commission, 90% PG Owner share
        const trustNestAmount = params.splitDetails?.trustNestAmount ?? Math.round(totalAmount * 0.10)
        const ownerAmount = params.splitDetails?.ownerAmount ?? (totalAmount - trustNestAmount)

        if (!isSuccess) {
          // Failed booking payment simulation
          const result = await prisma.$transaction(async (tx) => {
            const payment = await tx.payment.create({
              data: {
                transactionId,
                userId: booking.userId,
                ownerId: booking.property.ownerId,
                propertyId: booking.propertyId,
                bookingId: booking.id,
                amount: totalAmount,
                currency,
                status: 'FAILED',
                paymentMode: 'DEMO',
                paymentGateway: 'DEMO',
                type: 'BOOKING',
                failureReason: params.failureReason || 'Demo booking payment failed',
                metadata: JSON.stringify({ isDemo: true, simulation: 'FAILED' })
              }
            })

            await tx.booking.update({
              where: { id: booking.id },
              data: { status: 'PAYMENT_FAILED' }
            })

            // If a bed was reserved, release it back to VACANT on failure
            if (booking.bedId) {
              await tx.bed.update({
                where: { id: booking.bedId },
                data: { status: 'VACANT' }
              })
            }

            return { payment }
          })

          return {
            success: false,
            transactionId,
            status: 'FAILED',
            amount: totalAmount,
            currency,
            paymentMode: 'DEMO',
            isDemo: true,
            failureReason: params.failureReason || 'Demo booking payment failed',
            message: 'Booking Payment Failed: Demo simulation. No money was charged.',
            data: result
          }
        }

        // Successful booking payment with split recording
        const result = await prisma.$transaction(async (tx) => {
          // 1. Confirm booking
          const updatedBooking = await tx.booking.update({
            where: { id: booking.id },
            data: { status: 'CONFIRMED' }
          })

          // 2. Ensure bed is OCCUPIED
          if (booking.bedId) {
            await tx.bed.update({
              where: { id: booking.bedId },
              data: { status: 'OCCUPIED' }
            })
          }

          // 3. Create Payment record
          const payment = await tx.payment.create({
            data: {
              transactionId,
              userId: booking.userId,
              ownerId: booking.property.ownerId,
              propertyId: booking.propertyId,
              bookingId: booking.id,
              amount: totalAmount,
              currency,
              status: 'PAID',
              paymentMode: 'DEMO',
              paymentGateway: 'DEMO',
              type: 'BOOKING',
              paidAt: new Date(),
              paymentMethod: 'DEMO',
              metadata: JSON.stringify({
                isDemo: true,
                split: {
                  total: totalAmount,
                  trustNestCommission: trustNestAmount,
                  ownerPayout: ownerAmount
                }
              })
            }
          })

          // 4. Create PaymentSplit record for future Cashfree Easy Split settlement
          const split = await tx.paymentSplit.create({
            data: {
              paymentId: payment.id,
              bookingId: booking.id,
              totalAmount,
              trustNestAmount,
              ownerAmount,
              currency,
              status: 'SETTLED'
            }
          })

          return { booking: updatedBooking, payment, split }
        })

        return {
          success: true,
          transactionId,
          status: 'PAID',
          amount: totalAmount,
          currency,
          paymentMode: 'DEMO',
          isDemo: true,
          paidAt: new Date(),
          message: 'DEMO BOOKING PAYMENT SUCCESSFUL — Bed Reserved! (No real money charged)',
          data: result
        }
      }
    } catch (error: any) {
      console.error('DemoPaymentService error:', error)
      return {
        success: false,
        transactionId,
        status: 'FAILED',
        amount: params.amount,
        currency,
        paymentMode: 'DEMO',
        isDemo: true,
        failureReason: error.message || 'Payment processing error',
        message: error.message || 'Payment simulation encountered an error.'
      }
    }
  }

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    const payment = await prisma.payment.findUnique({
      where: { transactionId }
    })

    if (!payment) {
      return {
        success: false,
        transactionId,
        status: 'FAILED',
        amount: 0,
        currency: 'INR',
        paymentMode: 'DEMO',
        isDemo: true,
        message: 'Transaction not found.'
      }
    }

    return {
      success: payment.status === 'PAID' || payment.status === 'SUCCESS',
      transactionId,
      status: payment.status as PaymentStatus,
      amount: payment.amount,
      currency: payment.currency,
      paymentMode: 'DEMO',
      isDemo: true,
      paidAt: payment.paidAt || undefined,
      message: `Payment status: ${payment.status}`
    }
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    const payment = await prisma.payment.findUnique({
      where: { transactionId },
      select: { status: true }
    })
    return (payment?.status as PaymentStatus) || 'FAILED'
  }
}
