import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const body = JSON.parse(rawBody || '{}')
    const paymentMode = process.env.PAYMENT_MODE?.toUpperCase() || 'DEMO'

    // CASHFREE SIGNATURE VERIFICATION (When live)
    if (paymentMode === 'CASHFREE') {
      const signature = req.headers.get('x-webhook-signature')
      const timestamp = req.headers.get('x-webhook-timestamp')
      const secret = process.env.CASHFREE_SECRET_KEY || ''

      if (signature && secret && !secret.startsWith('TEST_CF')) {
        const payloadToSign = timestamp + rawBody
        const expectedSignature = crypto
          .createHmac('sha256', secret)
          .update(payloadToSign)
          .digest('base64')

        if (signature !== expectedSignature) {
          return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
        }
      }
    }

    // Process event types
    const eventType = body.type || body.event || 'PAYMENT_SUCCESS_WEBHOOK'
    const data = body.data || body

    console.log(`[Payment Webhook] Event: ${eventType}, Mode: ${paymentMode}`)

    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' || eventType === 'PAYMENT_SUCCESS') {
      const orderId = data.order?.order_id || data.orderId || data.transactionId
      const cfPaymentId = data.payment?.cf_payment_id || data.paymentId || orderId

      if (orderId) {
        await prisma.payment.updateMany({
          where: { transactionId: orderId },
          data: {
            status: 'PAID',
            paidAt: new Date()
          }
        })
      }
    } else if (eventType === 'PAYMENT_FAILED_WEBHOOK' || eventType === 'PAYMENT_FAILED') {
      const orderId = data.order?.order_id || data.orderId || data.transactionId
      if (orderId) {
        await prisma.payment.updateMany({
          where: { transactionId: orderId },
          data: {
            status: 'FAILED',
            failureReason: data.payment?.payment_message || 'Payment failed via webhook'
          }
        })
      }
    } else if (eventType === 'SUBSCRIPTION_CHARGED_WEBHOOK') {
      const subscriptionId = data.subscription?.subscription_id || data.subscriptionId
      if (subscriptionId) {
        await prisma.ownerSubscription.updateMany({
          where: { cfSubscriptionId: subscriptionId },
          data: { status: 'ACTIVE' }
        })
      }
    }

    return NextResponse.json({
      status: 'SUCCESS',
      message: 'Webhook processed successfully',
      mode: paymentMode,
      receivedAt: new Date()
    })
  } catch (error: any) {
    console.error('[Payment Webhook] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook internal error' },
      { status: 500 }
    )
  }
}
