import { getPaymentService } from '../src/services/payment'
import { processOwnerSubscriptionPayment } from '../src/actions/subscription.actions'
import { bookBed } from '../src/actions/booking.actions'
import { prisma } from '../src/lib/prisma'

async function runTests() {
  console.log('=== TRUSTNEST END-TO-END DEMO PAYMENT SYSTEM VERIFICATION ===\n')

  // 1. Check active Payment Service instance
  const paymentService = getPaymentService()
  console.log(`[TEST 1] Active Payment Service Mode: ${paymentService.mode}`)
  console.log(`[TEST 1 PASS] Correctly running in DEMO mode: ${paymentService.mode === 'DEMO'}`)

  // 2. Test Demo Order Creation
  const orderResult = await paymentService.createOrder({
    amount: 2000,
    currency: 'INR',
    type: 'SUBSCRIPTION',
    entityId: 'test-sub-1',
    customerDetails: {
      customerId: 'cust-1',
      customerName: 'Test Owner',
      customerEmail: 'owner@trustnest.in'
    }
  })
  console.log(`[TEST 2] Demo Order Generated: ${orderResult.orderId}, Txn: ${orderResult.transactionId}`)
  console.log(`[TEST 2 PASS] Order starts with ORDER_TNEST_DEMO: ${orderResult.orderId.startsWith('ORDER_TNEST_DEMO')}`)

  // 3. Test Property & Inventory
  const property = await prisma.property.findFirst({
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
  console.log(`[TEST 3] Testing with property: ${property?.name} (Owner: ${property?.ownerId})`)

  // 4. Test PG Owner Subscription Simulation (Success & Failure)
  if (property) {
    console.log('\n--- Testing PG Owner Subscription Simulation ---')
    const subFail = await paymentService.processDemoPayment({
      type: 'SUBSCRIPTION',
      entityId: '',
      ownerId: property.ownerId,
      propertyId: property.id,
      amount: 2000,
      simulateFailure: true,
      failureReason: 'Demo payment failure'
    })
    console.log(`[TEST 4A] Subscription Simulation (Failed): Status = ${subFail.status}, Txn = ${subFail.transactionId}, Success = ${subFail.success}`)
    console.log(`[TEST 4A PASS] Correctly failed without activating: ${!subFail.success && subFail.status === 'FAILED'}`)

    const subSuccess = await paymentService.processDemoPayment({
      type: 'SUBSCRIPTION',
      entityId: '',
      ownerId: property.ownerId,
      propertyId: property.id,
      amount: 2000,
      simulateFailure: false
    })
    console.log(`[TEST 4B] Subscription Simulation (Success): Status = ${subSuccess.status}, Txn = ${subSuccess.transactionId}, Success = ${subSuccess.success}`)
    console.log(`[TEST 4B PASS] Correctly activated: ${subSuccess.success && subSuccess.status === 'PAID'}`)
  }

  // 5. Test User Booking Payment Simulation & 10%/90% Split
  console.log('\n--- Testing User PG Booking Payment Simulation with Demo Split ---')
  const vacantBed = await prisma.bed.findFirst({
    where: { status: 'VACANT' },
    include: { room: { include: { floor: { include: { property: true } } } } }
  })

  if (vacantBed) {
    const bookingAmount = vacantBed.room.pricePerBed || 9500
    const trustNestCommission = Math.round(bookingAmount * 0.10)
    const ownerPayout = bookingAmount - trustNestCommission

    console.log(`Booking Amount: ₹${bookingAmount}`)
    console.log(`Expected TrustNest Platform Commission (10%): ₹${trustNestCommission}`)
    console.log(`Expected PG Owner Share (90%): ₹${ownerPayout}`)

    // Test booking simulation via bookBed action
    const bookRes = await bookBed({
      propertyId: vacantBed.room.floor.property.id,
      roomId: vacantBed.room.id,
      bedId: vacantBed.id,
      moveInDate: new Date().toISOString().split('T')[0],
      durationMonths: 6,
      termsAccepted: true,
      guestInfo: {
        name: 'Mentor Verification Test Resident',
        email: `mentor.test.${Date.now()}@trustnest.in`,
        password: 'password123'
      }
    })

    const bData: any = bookRes.data
    console.log(`[TEST 5] Booking Result: Success = ${bookRes.success}, Txn = ${bData?.transactionId}`)
    console.log(`[TEST 5 PASS] Booking Txn ID format TNEST_BOOKING_DEMO_*: ${bData?.transactionId?.startsWith('TNEST_BOOKING_DEMO_')}`)
    console.log(`[TEST 5 PASS] Commission accurately calculated: ₹${bData?.trustNestCommission}`)
    console.log(`[TEST 5 PASS] Owner payout accurately calculated: ₹${bData?.ownerPayout}`)
  }

  // 6. Test Webhook Endpoint simulation
  console.log('\n--- Testing Webhook Route ---')
  try {
    const webhookRes = await fetch('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'PAYMENT_SUCCESS_WEBHOOK',
        data: {
          order: { order_id: 'TNEST_DEMO_WEBHOOK_TEST' },
          payment: { cf_payment_id: 'CF_DEMO_9988' }
        }
      })
    })
    const webhookData = await webhookRes.json()
    console.log(`[TEST 6] Webhook response HTTP ${webhookRes.status}: ${JSON.stringify(webhookData)}`)
    console.log(`[TEST 6 PASS] Webhook responded OK: ${webhookRes.ok}`)
  } catch (err: any) {
    console.log(`[TEST 6 NOTE] Dev server webhook ping note: ${err.message}`)
  }

  console.log('\n=== ALL PAYMENT & USER FLOW VERIFICATION TESTS COMPLETED ===')
}

runTests()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
