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

        return { booking, payment, transactionId }
      })

      return {
        success: false,
        transactionId: failedResult.transactionId,
        error: 'Demo Payment Failure Simulation: Transaction was not completed. No money was charged.',
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
        throw new Error('This bed is already occupied or reserved. Please choose another bed.')
      }

      const room = bed.room
      const property = room.floor.property

      if (property.id !== input.propertyId) {
        throw new Error('Property mismatch for the selected bed.')
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
          status: 'PAID',
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

      // 7. Create PaymentSplit for Cashfree Easy Split readiness
      const split = await tx.paymentSplit.create({
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

      // 9. Send In-App Notifications
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
      const moveInDateFormatted = startDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      const bookingDateFormatted = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })

      if (property.ownerId) {
        await tx.notification.create({
          data: {
            userId: property.ownerId,
            title: `🔔 New Booking: Room ${room.roomNumber} - Bed ${bed.identifier}`,
            message: `Resident: ${residentDisplayName} (${residentDisplayEmail}) | PG: ${property.name} | Room: ${room.roomNumber} | Bed: ${bed.identifier} | Booking ID: ${booking.id} | Payment ID: ${transactionId} | Amount: ₹${rentAmount.toLocaleString('en-IN')} (Payout: ₹${ownerPayout.toLocaleString('en-IN')}) | Booking Date: ${bookingDateFormatted} | Move-in: ${moveInDateFormatted}`,
            type: 'RENT'
          }
        })
      }

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
        residentPhone: input.guestInfo?.phone,
        roomNumber: room.roomNumber,
        bedIdentifier: bed.identifier,
        rentAmount,
        trustNestCommission,
        ownerPayout,
        moveInDate: input.moveInDate || moveInDateFormatted,
        durationMonths
      }
    })

    // 10. SAFE NON-BLOCKING EMAIL DISPATCH (Requirement 32: email errors must NOT break confirmed bookings)
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
      }).catch(err => console.error('[Email Dispatch] User confirmation email error:', err.message))

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
        }).catch(err => console.error('[Email Dispatch] Owner notification email error:', err.message))
      }
    } catch (emailErr: any) {
      console.error('[Email Dispatch System] Non-fatal email error:', emailErr.message)
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
