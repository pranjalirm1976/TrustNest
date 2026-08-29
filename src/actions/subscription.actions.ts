'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getPaymentService } from '@/services/payment'

/**
 * Fetch active or pending subscription for the logged-in PG Owner
 */
export async function getOwnerSubscriptionDetails() {
  try {
    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (_) {}

    if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'INSPECTOR')) {
      return { success: false, error: 'Unauthorized. PG Owner account required.' }
    }

    const subscription = await prisma.ownerSubscription.findFirst({
      where: { ownerId: session.user.id },
      include: {
        property: {
          select: { id: true, name: true, address: true }
        },
        invoices: {
          orderBy: { createdAt: 'desc' }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    const properties = await prisma.property.findMany({
      where: { ownerId: session.user.id },
      select: { id: true, name: true, address: true, status: true }
    })

    return {
      success: true,
      subscription,
      properties,
      owner: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email
      }
    }
  } catch (error: any) {
    console.error('getOwnerSubscriptionDetails error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Process a demo/simulated subscription payment for PG Owner
 */
export async function processOwnerSubscriptionPayment(input: {
  propertyId?: string
  planName?: string
  amount?: number
  simulateFailure?: boolean
  failureReason?: string
}) {
  try {
    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (_) {}

    if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'INSPECTOR')) {
      return { success: false, error: 'Unauthorized. PG Owner account required.' }
    }

    const amount = input.amount || 2000.0
    const planName = input.planName || 'TrustNest PG Owner Plan'

    // Find or create subscription placeholder
    let subscription = await prisma.ownerSubscription.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!subscription) {
      subscription = await prisma.ownerSubscription.create({
        data: {
          ownerId: session.user.id,
          propertyId: input.propertyId,
          planName,
          amount,
          status: 'PENDING',
          billingCycle: 'MONTHLY'
        }
      })
    }

    const paymentService = getPaymentService()
    const paymentResult = await paymentService.processDemoPayment({
      type: 'SUBSCRIPTION',
      entityId: subscription.id,
      amount,
      ownerId: session.user.id,
      propertyId: input.propertyId || subscription.propertyId || undefined,
      planName,
      simulateFailure: input.simulateFailure,
      failureReason: input.failureReason
    })

    try {
      revalidatePath('/admin/subscription')
      revalidatePath('/admin/dashboard')
      revalidatePath('/admin/payments')
      revalidatePath('/super-admin')
    } catch (_) {}

    return {
      success: paymentResult.success,
      transactionId: paymentResult.transactionId,
      status: paymentResult.status,
      message: paymentResult.message,
      isDemo: paymentResult.isDemo,
      failureReason: paymentResult.failureReason,
      data: paymentResult.data
    }
  } catch (error: any) {
    console.error('processOwnerSubscriptionPayment error:', error)
    return { success: false, error: error.message || 'Subscription payment processing failed.' }
  }
}

/**
 * Super Admin: Fetch all owner subscriptions with filtering
 */
export async function getSuperAdminSubscriptionsList(filter?: string) {
  try {
    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (_) {}

    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'INSPECTOR')) {
      return { success: false, error: 'Unauthorized. Super Admin access required.' }
    }

    const where: any = {}
    if (filter && filter !== 'ALL') {
      where.status = filter
    }

    const subscriptions = await prisma.ownerSubscription.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, name: true, address: true } },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, subscriptions }
  } catch (error: any) {
    console.error('getSuperAdminSubscriptionsList error:', error)
    return { success: false, error: error.message }
  }
}
