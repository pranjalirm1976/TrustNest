'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { getEmailService } from '@/services/email'

export interface BookBedInput {
  propertyId: string
  roomId: string
  bedId: string
  moveInDate: string // YYYY-MM-DD
  durationMonths?: number
  termsAccepted: boolean
  simulateFailure?: boolean
  failureReason?: string
  guestInfo?: {
    name: string
    email: string
    password?: string
    phone?: string
  }
}

export async function bookBed(input: BookBedInput) {
  try {
    if (!input.termsAccepted) {
      return { success: false, error: 'You must agree to the Terms and Conditions to book.' }
    }

    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (_) {
      // Direct action invocation
    }
    let userId = session?.user?.id
    let residentUser: any = null

    // If anonymous user provided registration details
    if (!userId && input.guestInfo?.email) {
      const email = input.guestInfo.email.toLowerCase().trim()
      let user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        const passwordHash = await bcrypt.hash(input.guestInfo.password || 'password123', 12)
        user = await prisma.user.create({
          data: {
            name: input.guestInfo.name || 'Resident',
            email,
            passwordHash,
            role: 'TENANT'
          }
        })
      }
      userId = user.id
      residentUser = user
    } else if (userId) {
      residentUser = await prisma.user.findUnique({
        where: { id: userId }
      })
    }

    if (!userId) {
      return { success: false, error: 'Authentication required. Please log in or enter your details.' }
    }

    const startDate = new Date(input.moveInDate || new Date())
    const durationMonths = input.durationMonths || 6
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + durationMonths)

    // Generate demo transaction ID
    const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase()
    const transactionId = `TNEST_BOOKING_DEMO_${randomHex}`

    // Handle SIMULATED FAILED PAYMENT
    if (input.simulateFailure) {
      const failedResult = await prisma.$transaction(async (tx) => {
        const bed = await tx.bed.findUnique({
          where: { id: input.bedId },
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
        })

        if (!bed) {
          throw new Error('Selected bed could not be found.')
        }

        const room = bed.room
        const property = room.floor.property

        const basePrice = property.priceFrom || 8500
        const rentAmount = room.pricePerBed || (
          room.capacity === 1 ? basePrice * 1.3 :
          room.capacity === 2 ? basePrice :
          basePrice * 0.85
        )

        // Create failed booking record
        const booking = await tx.booking.create({
          data: {
            userId,
            propertyId: property.id,
            bedId: bed.id,
            startDate,
            endDate,
            status: 'PAYMENT_FAILED',
            totalAmount: rentAmount,
          }
        })

        // Record failed payment
        const payment = await tx.payment.create({
          data: {
            transactionId,
            userId,
            ownerId: property.ownerId,
            propertyId: property.id,
            bookingId: booking.id,
            amount: rentAmount,
            status: 'FAILED',
            paymentMode: 'DEMO',
            paymentGateway: 'DEMO',
            type: 'BOOKING',
            failureReason: input.failureReason || 'Demo booking payment failure simulation',
            metadata: JSON.stringify({ isDemo: true, simulation: 'FAILED' })
          }
        })

        // Audit Log for Failed Payment
        await tx.auditLog.create({
          data: {
            actor: userId,
            role: residentUser?.role || 'TENANT',
            action: 'PAYMENT_FAILED',
            entity: 'Booking',
            entityId: booking.id,
            details: JSON.stringify({
              reason: input.failureReason || 'Simulated payment failure',
              amount: rentAmount,
              propertyId: property.id
            })
          }
        })

        return { booking, payment, transactionId }
      })

      return {
        success: false,
        transactionId: failedResult.transactionId,
        error: 'Demo Payment Failure Simulation: Transaction was not completed. No money was charged. Bed remains vacant.',
        isDemo: true,
        data: failedResult
      }
    }

    // Execute atomic transaction for SUCCESSFUL BOOKING with Concurrency Protection & Inventory Check
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch bed with room and property verification
      const bed = await tx.bed.findUnique({
        where: { id: input.bedId },
        include: {
          room: {
            include: {
              floor: {
                include: {
                  property: {
                    include: {
                      owner: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!bed) {
        throw new Error('Selected bed could not be found.')
      }

      // Enforce TrustNest Inventory Allocation
      if (bed.isTrustNestInventory === false || bed.status === 'OWNER_MANAGED') {
        throw new Error('This bed is owner-managed and not allocated for TrustNest online booking.')
      }

      if (bed.status !== 'VACANT') {
        throw new Error('This bed is no longer available. Please choose another bed.')
      }

      const room = bed.room
      const floor = room.floor
      const property = floor.property

      if (property.id !== input.propertyId) {
        throw new Error('Property mismatch for the selected bed.')
      }

      // **Enforce Gender Eligibility Rules**
      const userGender = residentUser?.genderEligibility // e.g. "MALE", "FEMALE", "OTHER"
      const eligibilityRule = room.eligibilityRule || floor.eligibilityRule || property.eligibilityRule
      
      if (eligibilityRule && eligibilityRule !== 'UNISEX' && userGender) {
        const ruleGender = eligibilityRule.split('_')[0]
        if (userGender !== ruleGender && userGender !== 'OTHER') {
          throw new Error(
            `This property requires residents to be ${ruleGender}. Your profile shows ${userGender}.`
          )
        }
      }

      // **Require Phone Verification for gender-specific properties**
      if (property.gender !== 'UNISEX' && !residentUser?.phoneVerified) {
        throw new Error('Phone verification is required to book in gender-specific properties.')
      }

      // Calculate rent
      const basePrice = property.priceFrom || 8500
      let rentAmount = room.pricePerBed || (
        room.capacity === 1 ? basePrice * 1.3 :
        room.capacity === 2 ? basePrice :
        basePrice * 0.85
      )
      const depositAmount = rentAmount

      // Demo split calculation (10% TrustNest commission, 90% PG Owner payout)
      const trustNestCommission = Math.round(rentAmount * 0.10)
      const ownerPayout = rentAmount - trustNestCommission

      // 2. Mark bed as OCCUPIED
      await tx.bed.update({
        where: { id: bed.id },
        data: { status: 'OCCUPIED' }
      })

      // 3. Ensure user role is TENANT
      await tx.user.update({
        where: { id: userId },
        data: { role: 'TENANT' }
      })

      // 4. Create ResidentStay
      const stay = await tx.residentStay.create({
        data: {
          tenantId: userId,
          bedId: bed.id,
          startDate,
          endDate,
          status: 'ACTIVE',
          rentAmount,
          depositAmount,
        }
      })

      // 5. Create Booking
      const booking = await tx.booking.create({
        data: {
          userId,
          propertyId: property.id,
          bedId: bed.id,
          startDate,
          endDate,
          status: 'CONFIRMED',
          totalAmount: rentAmount,
        }
      })

      // 6. Create Initial Booking Payment
      const payment = await tx.payment.create({
        data: {
          transactionId,
          userId,
          ownerId: property.ownerId,
          propertyId: property.id,
          bookingId: booking.id,
          amount: rentAmount,
          status: 'SUCCESS',
          paidAt: new Date(),
          paymentMethod: 'DEMO',
          paymentMode: 'DEMO',
          paymentGateway: 'DEMO',
          type: 'BOOKING',
          metadata: JSON.stringify({
            isDemo: true,
            split: {
              total: rentAmount,
              trustNestCommission,
              ownerPayout
            }
          })
        }
      })

      // 7. Create PaymentSplit
      await tx.paymentSplit.create({
        data: {
          paymentId: payment.id,
          bookingId: booking.id,
          totalAmount: rentAmount,
          trustNestAmount: trustNestCommission,
          ownerAmount: ownerPayout,
          currency: 'INR',
          status: 'SETTLED'
        }
      })

      // 8. Create Current Month Rent Payment invoice
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      const billingMonth = `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`

      await tx.rentPayment.create({
        data: {
          stayId: stay.id,
          amount: rentAmount,
          dueDate: new Date(startDate.getFullYear(), startDate.getMonth(), 5),
          paidDate: new Date(),
          status: 'PAID',
          transactionId,
          billingMonth,
        }
      })

      // 9. Send In-App Notifications: User, Owner, Super Admin
      // User In-App Notification
      await tx.notification.create({
        data: {
          userId,
          title: `Booking Confirmed at ${property.name}! 🎉`,
          message: `Your booking for Room ${room.roomNumber} (Bed ${bed.identifier}) is confirmed. Txn: ${transactionId} (DEMO).`,
          type: 'RENT'
        }
      })

      const residentDisplayName = residentUser?.name || input.guestInfo?.name || 'New Resident'
      const residentDisplayEmail = residentUser?.email || input.guestInfo?.email || 'resident@trustnest.in'
      const residentPhone = residentUser?.phone || input.guestInfo?.phone || 'Not provided'
      const moveInDateFormatted = startDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      const bookingDateFormatted = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })

      // Owner In-App Notification
      if (property.ownerId) {
        await tx.notification.create({
          data: {
            userId: property.ownerId,
            title: `🔔 New Booking: Room ${room.roomNumber} - Bed ${bed.identifier}`,
            message: `Resident: ${residentDisplayName} | Email: ${residentDisplayEmail} | Verified Phone: ${residentPhone} | PG: ${property.name} | Room: ${room.roomNumber} | Bed: ${bed.identifier} | Booking ID: ${booking.id} | Payment ID: ${transactionId} | Amount: ₹${rentAmount.toLocaleString('en-IN')} (Payout: ₹${ownerPayout.toLocaleString('en-IN')}) | Payment Status: SUCCESSFUL | Move-in Date: ${moveInDateFormatted}`,
            type: 'RENT'
          }
        })
      }

      // Super Admin In-App Notifications
      const superAdmins = await tx.user.findMany({
        where: { role: 'SUPER_ADMIN' },
        select: { id: true, email: true }
      })

      if (superAdmins.length > 0) {
        await tx.notification.createMany({
          data: superAdmins.map(admin => ({
            userId: admin.id,
            title: `💰 New Booking Confirmed: ${property.name}`,
            message: `Booking ${booking.id} confirmed for ${residentDisplayName} (Bed ${bed.identifier}, Room ${room.roomNumber}). Total: ₹${rentAmount} (TrustNest fee: ₹${trustNestCommission}).`,
            type: 'PAYMENT'
          }))
        })
      }

      // 10. Create Audit Log Record
      await tx.auditLog.create({
        data: {
          actor: userId,
          role: residentUser?.role || 'TENANT',
          action: 'BOOKING_CREATED',
          entity: 'Booking',
          entityId: booking.id,
          details: JSON.stringify({
            propertyId: property.id,
            propertyName: property.name,
            roomId: room.id,
            bedId: bed.id,
            rentAmount,
            ownerPayout,
            trustNestCommission,
            transactionId
          })
        }
      })

      return {
        bookingId: booking.id,
        stayId: stay.id,
        paymentId: payment.id,
        transactionId,
        propertyName: property.name,
        propertyAddress: property.address,
        ownerId: property.ownerId,
        ownerEmail: property.owner?.email,
        ownerName: property.owner?.name || 'Property Owner',
        residentName: residentDisplayName,
        residentEmail: residentDisplayEmail,
        residentPhone,
        roomNumber: room.roomNumber,
        bedIdentifier: bed.identifier,
        rentAmount,
        trustNestCommission,
        ownerPayout,
        moveInDate: input.moveInDate || moveInDateFormatted,
        durationMonths,
        superAdminEmails: superAdmins.map(a => a.email)
      }
    })

    // 11. SAFE NON-BLOCKING EMAIL DISPATCH (User, Owner, Super Admin)
    try {
      const emailService = getEmailService()
      
      // Dispatch User Confirmation Email
      emailService.sendBookingConfirmationToUser({
        toEmail: result.residentEmail,
        userName: result.residentName,
        propertyName: result.propertyName,
        propertyAddress: result.propertyAddress,
        roomNumber: result.roomNumber,
        bedIdentifier: result.bedIdentifier,
        bookingId: result.bookingId,
        transactionId: result.transactionId,
        amount: result.rentAmount,
        moveInDate: result.moveInDate,
        durationMonths: result.durationMonths
      }).catch(err => console.error('[Email Dispatch] User confirmation email notice:', err?.message))

      // Dispatch Owner Notification Email
      if (result.ownerEmail) {
        emailService.sendNewBookingNotificationToOwner({
          ownerEmail: result.ownerEmail,
          ownerName: result.ownerName,
          residentName: result.residentName,
          residentEmail: result.residentEmail,
          residentPhone: result.residentPhone,
          propertyName: result.propertyName,
          roomNumber: result.roomNumber,
          bedIdentifier: result.bedIdentifier,
          bookingId: result.bookingId,
          transactionId: result.transactionId,
          amount: result.rentAmount,
          ownerPayout: result.ownerPayout,
          moveInDate: result.moveInDate
        }).catch(err => console.error('[Email Dispatch] Owner notification email notice:', err?.message))
      }
    } catch (emailErr: any) {
      console.error('[Email Dispatch System] Non-fatal email error:', emailErr?.message)
    }

    // Revalidate paths
    try {
      revalidatePath(`/pg/${input.propertyId}`)
      revalidatePath('/search')
      revalidatePath('/')
      revalidatePath('/tenant/dashboard')
      revalidatePath('/tenant/bookings')
      revalidatePath('/tenant/payments')
      revalidatePath('/admin/dashboard')
      revalidatePath('/admin/payments')
      revalidatePath('/admin/tenants')
      revalidatePath('/admin/rooms')
      revalidatePath('/admin/properties')
      revalidatePath('/super-admin')
    } catch (_) {}

    return {
      success: true,
      message: `DEMO PAYMENT SUCCESSFUL — Successfully booked Bed ${result.bedIdentifier} in Room ${result.roomNumber} at ${result.propertyName}!`,
      data: result,
      isDemo: true
    }
  } catch (error: any) {
    console.error('bookBed error:', error)
    return { success: false, error: error.message || 'An error occurred during booking. Please try again.' }
  }
}

/**
 * PHASE 12: Booking Cancellation Action
 * - Validates ownership/role authorization
 * - Sets booking status to CANCELLED (never hard deleted)
 * - Releases Bed inventory back to VACANT
 * - Updates ResidentStay status to CANCELLED
 * - Tracks simulated refund status on Payment
 * - Emits in-app notifications to Resident, Owner, Super Admin
 * - Dispatches cancellation email events
 * - Records audit log entry
 */
export async function cancelBooking(bookingId: string, reason?: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return { success: false, error: 'Authentication required. Please sign in.' }
    }

    const sessionUserId = session.user.id
    const sessionRole = session.user.role

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: {
          include: { owner: true }
        },
        user: true,
        payments: true
      }
    })

    if (!booking) {
      return { success: false, error: 'Booking not found.' }
    }

    // Server-side Authorization Check: Resident who booked, Property Owner, or Super Admin
    const isResident = booking.userId === sessionUserId
    const isPropertyOwner = booking.property.ownerId === sessionUserId
    const isSuperAdmin = sessionRole === 'SUPER_ADMIN' || sessionRole === 'INSPECTOR'

    if (!isResident && !isPropertyOwner && !isSuperAdmin) {
      return { success: false, error: 'Access denied. You are not authorized to cancel this booking.' }
    }

    if (booking.status === 'CANCELLED') {
      return { success: false, error: 'This booking is already cancelled.' }
    }

    // Atomic transaction for cancellation
    const cancellationResult = await prisma.$transaction(async (tx) => {
      // 1. Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' }
      })

      // 2. Free up bed inventory if bed was assigned
      let roomNumber = 'N/A'
      let bedIdentifier = 'N/A'
      if (booking.bedId) {
        const bed = await tx.bed.update({
          where: { id: booking.bedId },
          data: { status: 'VACANT' },
          include: { room: true }
        })
        bedIdentifier = bed.identifier
        roomNumber = bed.room.roomNumber

        // Update ResidentStay status
        await tx.residentStay.updateMany({
          where: {
            tenantId: booking.userId,
            bedId: booking.bedId,
            status: 'ACTIVE'
          },
          data: { status: 'CANCELLED' }
        })
      }

      // 3. Update payment with simulated demo refund
      await tx.payment.updateMany({
        where: { bookingId },
        data: {
          status: 'REFUNDED',
          metadata: JSON.stringify({
            simulatedRefund: true,
            refundStatus: 'SIMULATED_SUCCESS',
            refundAmount: booking.totalAmount,
            refundedAt: new Date(),
            reason: reason || 'Booking cancellation'
          })
        }
      })

      // 4. In-App Notifications
      // User notification
      await tx.notification.create({
        data: {
          userId: booking.userId,
          title: `Booking Cancelled at ${booking.property.name} ❌`,
          message: `Your booking (ID: ${booking.id}) for Room ${roomNumber} (Bed ${bedIdentifier}) has been cancelled. Simulated refund of ₹${booking.totalAmount} processed (DEMO).`,
          type: 'RENT'
        }
      })

      // Owner notification
      if (booking.property.ownerId) {
        await tx.notification.create({
          data: {
            userId: booking.property.ownerId,
            title: `Booking Cancelled: Room ${roomNumber} (Bed ${bedIdentifier})`,
            message: `Resident ${booking.user.name} cancelled booking ${booking.id} at ${booking.property.name}. Bed is now VACANT and available for new bookings.`,
            type: 'RENT'
          }
        })
      }

      // Super Admin notifications
      const superAdmins = await tx.user.findMany({
        where: { role: 'SUPER_ADMIN' },
        select: { id: true, email: true }
      })

      if (superAdmins.length > 0) {
        await tx.notification.createMany({
          data: superAdmins.map(admin => ({
            userId: admin.id,
            title: `⚠️ Booking Cancelled: ${booking.property.name}`,
            message: `Booking ${booking.id} cancelled by ${session.user.name} (${sessionRole}). Total refund: ₹${booking.totalAmount}.`,
            type: 'PAYMENT'
          }))
        })
      }

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          actor: sessionUserId,
          role: sessionRole,
          action: 'BOOKING_CANCELLED',
          entity: 'Booking',
          entityId: booking.id,
          details: JSON.stringify({
            propertyId: booking.propertyId,
            propertyName: booking.property.name,
            bedId: booking.bedId,
            refundAmount: booking.totalAmount,
            reason: reason || 'User / Owner cancellation'
          })
        }
      })

      return {
        updatedBooking,
        roomNumber,
        bedIdentifier,
        propertyName: booking.property.name,
        userEmail: booking.user.email,
        userName: booking.user.name,
        ownerEmail: booking.property.owner?.email,
        ownerName: booking.property.owner?.name || 'PG Owner',
        superAdminEmails: superAdmins.map(a => a.email)
      }
    })

    // 6. Safe Email Events
    try {
      const emailService = getEmailService()

      // User email
      emailService.sendBookingCancellation({
        toEmail: cancellationResult.userEmail,
        userName: cancellationResult.userName,
        propertyName: cancellationResult.propertyName,
        roomNumber: cancellationResult.roomNumber,
        bedIdentifier: cancellationResult.bedIdentifier,
        bookingId,
        refundAmount: booking.totalAmount,
        reason: reason || 'Booking cancelled upon request',
        recipientRole: 'USER'
      }).catch(err => console.error('[Email Notice] User cancellation email error:', err?.message))

      // Owner email
      if (cancellationResult.ownerEmail) {
        emailService.sendBookingCancellation({
          toEmail: cancellationResult.ownerEmail,
          userName: cancellationResult.ownerName,
          propertyName: cancellationResult.propertyName,
          roomNumber: cancellationResult.roomNumber,
          bedIdentifier: cancellationResult.bedIdentifier,
          bookingId,
          reason: reason || 'Booking cancelled',
          recipientRole: 'OWNER'
        }).catch(err => console.error('[Email Notice] Owner cancellation email error:', err?.message))
      }
    } catch (emailErr: any) {
      console.error('[Email Notice] Non-fatal cancellation email error:', emailErr?.message)
    }

    // Revalidate relevant pages
    try {
      revalidatePath(`/pg/${booking.propertyId}`)
      revalidatePath('/search')
      revalidatePath('/')
      revalidatePath('/tenant/dashboard')
      revalidatePath('/tenant/bookings')
      revalidatePath('/admin/dashboard')
      revalidatePath('/admin/rooms')
      revalidatePath('/admin/tenants')
      revalidatePath('/super-admin')
    } catch (_) {}

    return {
      success: true,
      message: 'Booking cancelled successfully. Bed inventory has been returned to available status.',
      data: cancellationResult.updatedBooking
    }
  } catch (error: any) {
    console.error('cancelBooking error:', error)
    return { success: false, error: error.message || 'Failed to cancel booking.' }
  }
}
