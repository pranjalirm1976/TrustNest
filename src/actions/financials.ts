'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { calculateTrustScore, TrustScoreBreakdown } from '@/lib/trust-score'

/**
 * Updates a payment record status and optionally payment method.
 * Supports both Payment and RentPayment models for seamless compatibility across the platform.
 */
export async function updatePaymentStatus(paymentId: string, status: string, method?: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'INSPECTOR')) {
      return { success: false, error: 'Unauthorized. Owner access required.' }
    }

    // Try updating Payment model first
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            property: true
          }
        }
      }
    })

    if (payment) {
      if (payment.booking?.property?.ownerId && payment.booking.property.ownerId !== session.user.id && session.user.role !== 'INSPECTOR') {
        return { success: false, error: 'Unauthorized for this property.' }
      }

      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status,
          paymentMethod: method || payment.paymentMethod,
          paidAt: status === 'PAID' ? new Date() : (status === 'PENDING' ? null : payment.paidAt),
        }
      })

      if (payment.booking?.userId) {
        await prisma.notification.create({
          data: {
            userId: payment.booking.userId,
            title: `Payment Status: ${status}`,
            message: `Your booking payment of ₹${payment.amount} has been updated to ${status}.`,
            type: 'PAYMENT'
          }
        }).catch(err => console.error('Notification error:', err))
      }
    } else {
      // Fallback check for RentPayment
      const rentPayment = await prisma.rentPayment.findUnique({
        where: { id: paymentId },
        include: {
          stay: {
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
          }
        }
      })

      if (rentPayment) {
        if (rentPayment.stay.bed.room.floor.property.ownerId !== session.user.id && session.user.role !== 'INSPECTOR') {
          return { success: false, error: 'Unauthorized for this property.' }
        }

        await prisma.rentPayment.update({
          where: { id: paymentId },
          data: {
            status,
            paidDate: status === 'PAID' ? new Date() : (status === 'PENDING' ? null : rentPayment.paidDate),
          }
        })

        if (rentPayment.stay?.tenantId) {
          await prisma.notification.create({
            data: {
              userId: rentPayment.stay.tenantId,
              title: `Rent Status Updated: ${status}`,
              message: `Your rent for ${rentPayment.billingMonth} (₹${rentPayment.amount}) is now marked as ${status}.`,
              type: 'PAYMENT'
            }
          }).catch(err => console.error('Notification error:', err))
        }
      } else {
        return { success: false, error: 'Payment record not found.' }
      }
    }

    revalidatePath('/owner/financials')
    revalidatePath('/admin/payments')
    revalidatePath('/tenant/dashboard')
    revalidatePath('/tenant/payments')

    return { success: true, message: 'Payment status updated successfully.' }
  } catch (error: any) {
    console.error('updatePaymentStatus error:', error)
    return { success: false, error: error.message || 'Failed to update payment status.' }
  }
}

/**
 * Computes a dynamic Trust Score based on:
 * - Review ratings
 * - Food ratings
 * - 24-hour SLA complaint resolution history
 * - Rent collection timeliness / payment rates
 * Stores a new TrustScoreLog record in the database and updates Property.trustScore.
 */
export async function calculateAndSaveTrustScore(propertyId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'INSPECTOR')) {
      return { success: false, error: 'Unauthorized' }
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    })

    if (!property) {
      return { success: false, error: 'Property not found.' }
    }

    if (property.ownerId !== session.user.id && session.user.role !== 'INSPECTOR') {
      return { success: false, error: 'Unauthorized for this property.' }
    }

    // 1. Calculate the base metrics using the comprehensive engine
    const baseBreakdown: TrustScoreBreakdown = await calculateTrustScore(propertyId)

    // 2. Fetch payment timeliness data (Bookings/Payments and RentPayments)
    const [payments, rentPayments] = await Promise.all([
      prisma.payment.findMany({
        where: { booking: { propertyId } }
      }),
      prisma.rentPayment.findMany({
        where: {
          stay: {
            bed: {
              room: {
                floor: {
                  propertyId
                }
              }
            }
          }
        }
      })
    ])

    const totalPayments = payments.length + rentPayments.length
    const overduePayments = 
      payments.filter(p => p.status === 'OVERDUE' || (p.status === 'PENDING' && p.dueDate && new Date() > p.dueDate)).length +
      rentPayments.filter(rp => rp.status === 'OVERDUE' || (rp.status === 'PENDING' && new Date() > rp.dueDate)).length

    const paymentTimelinessRatio = totalPayments > 0 
      ? Math.max(0, (totalPayments - overduePayments) / totalPayments)
      : 1.0

    // Apply slight weighting for financial stability (e.g. up to -0.2 penalty for severe overdue rates)
    const paymentPenalty = totalPayments > 0 ? Number(((1 - paymentTimelinessRatio) * 0.2).toFixed(2)) : 0
    const finalScore = Number(Math.max(0, Math.min(5, baseBreakdown.score - paymentPenalty)).toFixed(2))

    const fullBreakdown = {
      ...baseBreakdown,
      finalScore,
      paymentTimelinessRatio: Number((paymentTimelinessRatio * 100).toFixed(1)),
      totalPaymentsTracked: totalPayments,
      overduePayments,
      paymentPenalty,
      calculatedAt: new Date().toISOString()
    }

    // 3. Save TrustScoreLog
    const log = await prisma.trustScoreLog.create({
      data: {
        propertyId,
        score: finalScore,
        breakdown: JSON.stringify(fullBreakdown),
      }
    })

    // 4. Update property current score
    await prisma.property.update({
      where: { id: propertyId },
      data: {
        trustScore: finalScore
      }
    })

    revalidatePath(`/pg/${propertyId}`)
    revalidatePath('/owner/settings')
    revalidatePath('/owner/financials')
    revalidatePath('/admin/settings')
    revalidatePath('/admin/performance')
    revalidatePath('/admin/dashboard')
    revalidatePath('/search')

    return { 
      success: true, 
      score: finalScore, 
      breakdown: fullBreakdown,
      logId: log.id 
    }
  } catch (error: any) {
    console.error('calculateAndSaveTrustScore error:', error)
    return { success: false, error: error.message || 'Failed to calculate and save trust score.' }
  }
}
