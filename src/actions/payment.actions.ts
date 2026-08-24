'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function processRentPayment(paymentId: string) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'TENANT') {
    throw new Error('Unauthorized. Resident authorization required.')
  }

  // Generate random 12-char mock Transaction ID
  const txnId = 'TXN_' + Math.random().toString(36).substring(2, 14).toUpperCase()

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
        type: 'PAYMENT'
      }
    }).catch(err => console.error('Notification error:', err))
  }

  revalidatePath('/tenant/payments')
  revalidatePath('/tenant/dashboard')
  revalidatePath('/admin/payments')
  revalidatePath('/owner/financials')
  return updatedPayment
}

export async function recordManualPayment(bedId: string, amount: number, transactionId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'OWNER') {
      return { success: false, error: 'Unauthorized' }
    }

    // Find the active stay for this bed to ensure it's their property
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

    // Find a pending rent payment, or create one if it doesn't exist
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

    // Notify tenant of manual payment receipt
    if (activeStay.tenantId) {
      await prisma.notification.create({
        data: {
          userId: activeStay.tenantId,
          title: `Rent Payment Recorded: ₹${amount}`,
          message: `The property manager has marked your rent payment of ₹${amount} as received.`,
          type: 'PAYMENT'
        }
      }).catch(err => console.error('Notification error:', err))
    }

    revalidatePath('/admin/payments')
    revalidatePath('/owner/financials')
    revalidatePath('/tenant/dashboard')
    revalidatePath('/tenant/payments')

    return { success: true, message: 'Payment recorded successfully.' }
  } catch (error: any) {
    console.error('recordManualPayment error:', error)
    return { success: false, error: error.message || 'Internal server error' }
  }
}
