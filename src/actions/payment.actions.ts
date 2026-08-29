'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getPaymentService } from '@/services/payment'

export async function processRentPayment(paymentId: string) {
  let session = null
  try {
    session = await getServerSession(authOptions)
  } catch (_) {}

  if (!session || session.user.role !== 'TENANT') {
    throw new Error('Unauthorized. Resident authorization required.')
  }

  // Generate random 12-char mock Transaction ID
  const txnId = 'TNEST_RENT_DEMO_' + Math.random().toString(36).substring(2, 10).toUpperCase()

  const updatedPayment = await prisma.rentPayment.update({
    where: { id: paymentId },
    data: {
      status: 'PAID',
      paidDate: new Date(),
      transactionId: txnId,
    },
    include: {
      stay: {
        include: {
          bed: {
            include: {
              room: {
                include: {
                  floor: {
                    include: {
                      property: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })

  // Notify owner
  const ownerId = updatedPayment.stay?.bed?.room?.floor?.property?.ownerId
  if (ownerId) {
    await prisma.notification.create({
      data: {
        userId: ownerId,
        title: `Online Rent Payment Received: ₹${updatedPayment.amount}`,
        message: `${session.user.name || 'Resident'} successfully paid rent for ${updatedPayment.billingMonth} (Txn: ${txnId}).`,
        type: 'RENT'
      }
    }).catch(err => console.error('Notification error:', err))
  }

  try {
    revalidatePath('/tenant/payments')
    revalidatePath('/tenant/dashboard')
    revalidatePath('/admin/payments')
    revalidatePath('/owner/financials')
  } catch (_) {}

  return updatedPayment
}

export async function recordManualPayment(bedId: string, amount: number, transactionId: string) {
  try {
    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (_) {}

    if (!session || session.user.role !== 'OWNER') {
      return { success: false, error: 'Unauthorized' }
    }

    const activeStay = await prisma.residentStay.findFirst({
      where: { 
        bedId,
        status: 'ACTIVE'
      },
      include: {
        tenant: true,
        bed: {
          include: {
            room: {
              include: {
                floor: {
                  include: {
                    property: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!activeStay) {
      return { success: false, error: 'No active resident stay found for this bed.' }
    }

    if (activeStay.bed.room.floor.property.ownerId !== session.user.id) {
      return { success: false, error: 'Unauthorized. You do not own this property.' }
    }

    const pendingPayment = await prisma.rentPayment.findFirst({
      where: {
        stayId: activeStay.id,
        status: 'PENDING'
      },
      orderBy: { dueDate: 'asc' }
    })

    if (pendingPayment) {
      await prisma.rentPayment.update({
        where: { id: pendingPayment.id },
        data: {
          status: 'PAID',
          paidDate: new Date(),
          transactionId,
          amount
        }
      })
    } else {
      await prisma.rentPayment.create({
        data: {
          stayId: activeStay.id,
          status: 'PAID',
          paidDate: new Date(),
          dueDate: new Date(), 
          billingMonth: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
          transactionId,
          amount
        }
      })
    }

    if (activeStay.tenantId) {
      await prisma.notification.create({
        data: {
          userId: activeStay.tenantId,
          title: `Rent Payment Recorded: ₹${amount}`,
          message: `The property manager has marked your rent payment of ₹${amount} as received.`,
          type: 'RENT'
        }
      }).catch(err => console.error('Notification error:', err))
    }

    try {
      revalidatePath('/admin/payments')
      revalidatePath('/owner/financials')
      revalidatePath('/tenant/dashboard')
      revalidatePath('/tenant/payments')
    } catch (_) {}

    return { success: true, message: 'Payment recorded successfully.' }
  } catch (error: any) {
    console.error('recordManualPayment error:', error)
    return { success: false, error: error.message || 'Internal server error' }
  }
}

/**
 * Process a Demo Booking Payment with simulated success / failure and split settlement
 */
export async function processBookingPaymentDemo(input: {
  bookingId: string
  simulateFailure?: boolean
  failureReason?: string
}) {
  try {
    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (_) {}

    const booking = await prisma.booking.findUnique({
      where: { id: input.bookingId },
      include: {
        property: true,
        user: true
      }
    })

    if (!booking) {
      return { success: false, error: 'Booking not found.' }
    }

    const paymentService = getPaymentService()
    const paymentResult = await paymentService.processDemoPayment({
      type: 'BOOKING',
      entityId: booking.id,
      amount: booking.totalAmount,
      userId: booking.userId,
      ownerId: booking.property.ownerId,
      propertyId: booking.propertyId,
      simulateFailure: input.simulateFailure,
      failureReason: input.failureReason
    })

    try {
      revalidatePath(`/pg/${booking.propertyId}`)
      revalidatePath('/tenant/dashboard')
      revalidatePath('/tenant/bookings')
      revalidatePath('/tenant/payments')
      revalidatePath('/admin/payments')
      revalidatePath('/admin/dashboard')
      revalidatePath('/super-admin')
    } catch (_) {}

    return {
      success: paymentResult.success,
      transactionId: paymentResult.transactionId,
      status: paymentResult.status,
      amount: paymentResult.amount,
      message: paymentResult.message,
      isDemo: paymentResult.isDemo,
      failureReason: paymentResult.failureReason,
      data: paymentResult.data
    }
  } catch (error: any) {
    console.error('processBookingPaymentDemo error:', error)
    return { success: false, error: error.message || 'Booking payment processing failed.' }
  }
}

/**
 * Super Admin: Get complete payment overview metrics and logs
 */
export async function getSuperAdminPaymentMetrics() {
  try {
    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (_) {}

    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'INSPECTOR')) {
      return { success: false, error: 'Unauthorized. Super Admin role required.' }
    }

    const totalOwners = await prisma.user.count({
      where: { role: 'OWNER' }
    })

    const activeSubscriptions = await prisma.ownerSubscription.count({
      where: { status: 'ACTIVE' }
    })

    const pendingPayments = await prisma.payment.count({
      where: { status: 'PENDING' }
    })

    const failedPayments = await prisma.payment.count({
      where: { status: 'FAILED' }
    })

    const allPayments = await prisma.payment.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, name: true, address: true } },
        booking: true,
        split: true
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    const monthlySubscriptionRevenue = activeSubscriptions * 2000.0
    const totalDemoTransactions = allPayments.length

    return {
      success: true,
      metrics: {
        totalOwners,
        activeSubscriptions,
        pendingPayments,
        failedPayments,
        monthlySubscriptionRevenue,
        totalDemoTransactions
      },
      payments: allPayments
    }
  } catch (error: any) {
    console.error('getSuperAdminPaymentMetrics error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * PG Owner: Get booking revenue and split breakdown
 */
export async function getOwnerPaymentDashboardData() {
  try {
    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (_) {}

    if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'INSPECTOR')) {
      return { success: false, error: 'Unauthorized. PG Owner account required.' }
    }

    const payments = await prisma.payment.findMany({
      where: {
        ownerId: session.user.id,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, name: true, address: true } },
        booking: true,
        split: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const subscription = await prisma.ownerSubscription.findFirst({
      where: { ownerId: session.user.id },
      include: { property: true }
    })

    // Calculate revenue stats
    let totalGrossRevenue = 0
    let totalTrustNestCommission = 0
    let totalNetOwnerPayout = 0

    payments.forEach(p => {
      if (p.status === 'PAID' || p.status === 'SUCCESS') {
        totalGrossRevenue += p.amount
        if (p.split) {
          totalTrustNestCommission += p.split.trustNestAmount
          totalNetOwnerPayout += p.split.ownerAmount
        } else {
          const commission = Math.round(p.amount * 0.10)
          totalTrustNestCommission += commission
          totalNetOwnerPayout += (p.amount - commission)
        }
      }
    })

    return {
      success: true,
      stats: {
        totalGrossRevenue,
        totalTrustNestCommission,
        totalNetOwnerPayout,
        totalBookings: payments.filter(p => p.type === 'BOOKING').length,
        subscriptionStatus: subscription?.status || 'PENDING'
      },
      payments,
      subscription
    }
  } catch (error: any) {
    console.error('getOwnerPaymentDashboardData error:', error)
    return { success: false, error: error.message }
  }
}
