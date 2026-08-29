import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding rich demo payment and subscription data...')

  // Fetch or find owners
  const owners = await prisma.user.findMany({
    where: { role: 'OWNER' }
  })

  console.log(`Found ${owners.length} owners.`)

  const properties = await prisma.property.findMany({
    include: {
      floors: {
        include: {
          rooms: {
            include: { beds: true }
          }
        }
      }
    }
  })

  console.log(`Found ${properties.length} properties.`)

  // 1. Seed Owner Subscriptions for all owners
  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i]
    const ownerId = prop.ownerId

    const startDate = new Date()
    const nextBillingDate = new Date()
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
    const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase()
    const transactionId = `TNEST_DEMO_${randomHex}`

    // Upsert subscription
    const existingSub = await prisma.ownerSubscription.findFirst({
      where: { propertyId: prop.id }
    })

    if (!existingSub) {
      const sub = await prisma.ownerSubscription.create({
        data: {
          ownerId,
          propertyId: prop.id,
          planName: 'TrustNest PG Owner Plan',
          amount: 2000.0,
          currency: 'INR',
          status: i === 2 ? 'FAILED' : 'ACTIVE', // simulate 1 failed sub for testing
          billingCycle: 'MONTHLY',
          startDate,
          nextBillingDate,
          currentPeriodStart: startDate,
          currentPeriodEnd: nextBillingDate,
          transactionId,
          paymentMode: 'DEMO',
          failureReason: i === 2 ? 'Demo payment failure simulation' : null
        }
      })

      // Create Payment log for subscription
      await prisma.payment.create({
        data: {
          transactionId,
          ownerId,
          propertyId: prop.id,
          subscriptionId: sub.id,
          amount: 2000.0,
          currency: 'INR',
          status: i === 2 ? 'FAILED' : 'PAID',
          paymentMode: 'DEMO',
          paymentGateway: 'DEMO',
          type: 'SUBSCRIPTION',
          failureReason: i === 2 ? 'Demo payment failure' : null,
          paidAt: i === 2 ? null : new Date(),
          paymentMethod: 'DEMO',
          metadata: JSON.stringify({ isDemo: true, planName: 'TrustNest PG Owner Plan' })
        }
      })

      // Create subscription invoice
      if (i !== 2) {
        await prisma.subscriptionInvoice.create({
          data: {
            subscriptionId: sub.id,
            amount: 2000.0,
            cfPaymentId: transactionId,
            status: 'PAID',
            paidAt: new Date(),
            billingMonth: 'Aug 2026'
          }
        })
      }
    }
  }

  // 2. Ensure test resident user exists
  let tenant = await prisma.user.findUnique({
    where: { email: 'priya.sharma@gmail.com' }
  })

  if (!tenant) {
    const passwordHash = await bcrypt.hash('password123', 12)
    tenant = await prisma.user.create({
      data: {
        name: 'Priya Sharma',
        email: 'priya.sharma@gmail.com',
        passwordHash,
        role: 'TENANT'
      }
    })
  }

  // 3. Seed Demo Booking Payment with Split
  if (properties.length > 0) {
    const prop = properties[0]
    const room = prop.floors[0]?.rooms[0]
    const bed = room?.beds[0]

    if (bed) {
      const bookingTxnId = `TNEST_BOOKING_DEMO_9A4X7B2K`
      const totalAmount = prop.priceFrom || 9500
      const trustNestAmount = Math.round(totalAmount * 0.10)
      const ownerAmount = totalAmount - trustNestAmount

      const existingBooking = await prisma.booking.findFirst({
        where: { propertyId: prop.id, userId: tenant.id }
      })

      if (!existingBooking) {
        const booking = await prisma.booking.create({
          data: {
            userId: tenant.id,
            propertyId: prop.id,
            bedId: bed.id,
            startDate: new Date(),
            endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            status: 'CONFIRMED',
            totalAmount
          }
        })

        const payment = await prisma.payment.create({
          data: {
            transactionId: bookingTxnId,
            userId: tenant.id,
            ownerId: prop.ownerId,
            propertyId: prop.id,
            bookingId: booking.id,
            amount: totalAmount,
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

        await prisma.paymentSplit.create({
          data: {
            paymentId: payment.id,
            bookingId: booking.id,
            totalAmount,
            trustNestAmount,
            ownerAmount,
            status: 'SETTLED'
          }
        })
      }
    }
  }

  // 4. Seed In-App Chat Thread
  if (properties.length > 0 && tenant) {
    const prop = properties[0]
    const existingThread = await prisma.chatThread.findUnique({
      where: {
        userId_ownerId_propertyId: {
          userId: tenant.id,
          ownerId: prop.ownerId,
          propertyId: prop.id
        }
      }
    })

    if (!existingThread) {
      await prisma.chatThread.create({
        data: {
          userId: tenant.id,
          ownerId: prop.ownerId,
          propertyId: prop.id,
          messages: {
            create: [
              {
                senderId: tenant.id,
                content: `Hello! Is there any double sharing room available on the 2nd floor with AC?`
              },
              {
                senderId: prop.ownerId,
                content: `Hi Priya! Yes, Room 201 has 1 vacant bed with high-speed WiFi and attached bathroom. You can view the live 2D floor blueprint on our listing.`
              }
            ]
          }
        }
      })
    }
  }

  console.log('Seeding demo payments completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
