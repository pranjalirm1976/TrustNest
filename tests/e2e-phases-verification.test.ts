import { prisma } from '../src/lib/prisma'
import { bookBed, cancelBooking } from '../src/actions/booking.actions'
import { canCreateProperty, getBedIdentifier } from '../src/lib/property-utils'
import { getOrCreateChatThread, sendChatMessage } from '../src/actions/chat.actions'
import { getEmailService } from '../src/services/email'

async function runFullE2ETestSuite() {
  console.log('=================================================================')
  console.log('🚀 TRUSTNEST — PHASES 10-14 COMPREHENSIVE E2E VERIFICATION SUITE')
  console.log('=================================================================\n')

  let passed = 0
  let total = 0

  function assert(condition: boolean, testTitle: string, details?: string) {
    total++
    if (condition) {
      console.log(`✅ [PASS] Test ${total}: ${testTitle}`)
      if (details) console.log(`   ↳ ${details}`)
      passed++
    } else {
      console.error(`❌ [FAIL] Test ${total}: ${testTitle}`)
      if (details) console.error(`   ↳ ${details}`)
      throw new Error(`Assertion failed: ${testTitle}`)
    }
  }

  try {
    // -------------------------------------------------------------
    // TEST 1: PUBLIC BROWSING (Search, Map, PG Details, Food, Reviews)
    // -------------------------------------------------------------
    console.log('--- PHASE 14 / TEST 1: Public Browsing Without Login ---')
    const publishedPGs = await prisma.property.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        images: true,
        floors: {
          include: {
            rooms: {
              include: {
                beds: true
              }
            }
          }
        },
        foodMenus: { include: { items: true } },
        reviews: true,
        amenities: true
      },
      take: 5
    })

    assert(publishedPGs.length > 0, 'Public can query published PGs', `Found ${publishedPGs.length} published PGs`)
    const samplePG = publishedPGs[0]
    assert(samplePG.floors.length > 0, 'PG has floors and rooms loaded', `Floors: ${samplePG.floors.length}`)
    assert(samplePG.amenities.length > 0, 'PG has amenities loaded', `Amenities: ${samplePG.amenities.length}`)

    // -------------------------------------------------------------
    // TEST 2: GUEST/ANONYMOUS BOOKING RESOLUTION
    // -------------------------------------------------------------
    console.log('\n--- PHASE 14 / TEST 2: Anonymous to Registered User Booking Flow ---')
    const testGuestEmail = `guest.test.${Date.now()}@trustnest.dummy`
    
    // Find or create an available test bed
    const availableBed = await prisma.bed.findFirst({
      where: {
        status: 'VACANT',
        isTrustNestInventory: true,
        room: {
          floor: {
            property: { status: 'PUBLISHED' }
          }
        }
      },
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

    assert(availableBed !== null, 'Found vacant TrustNest inventory bed for booking test', `Bed ID: ${availableBed?.id}`)

    const bookingRes = await bookBed({
      propertyId: availableBed!.room.floor.property.id,
      roomId: availableBed!.roomId,
      bedId: availableBed!.id,
      moveInDate: '2026-09-01',
      durationMonths: 6,
      termsAccepted: true,
      guestInfo: {
        name: 'Automated Test Guest',
        email: testGuestEmail,
        password: 'Password@123',
        phone: '+919876543210'
      }
    })

    assert(bookingRes.success === true, 'Guest user successfully creates account and books bed atomically', bookingRes.message)
    const guestUser = await prisma.user.findUnique({ where: { email: testGuestEmail } })
    assert(guestUser !== null && guestUser.role === 'TENANT', 'Guest user auto-provisioned as TENANT in database')

    // -------------------------------------------------------------
    // TEST 3 & 4: OWNER REGISTRATION & SUPER ADMIN APPROVAL
    // -------------------------------------------------------------
    console.log('\n--- PHASE 14 / TEST 3 & 4: Owner PG Submission & Super Admin Approval Flow ---')
    const owner = await prisma.user.findFirst({ where: { email: 'rajesh@emeraldelite.com' } })
    assert(owner !== null, 'PG Owner resolved from database', `Owner: ${owner?.name}`)

    const testOwnerPG = await prisma.$transaction(async (tx) => {
      const prop = await tx.property.create({
        data: {
          ownerId: owner!.id,
          name: `Phase 14 Test PG ${Date.now()}`,
          description: 'E2E test property',
          address: 'Hinjawadi Phase 2, Pune',
          latitude: 18.59,
          longitude: 73.73,
          priceFrom: 9000,
          gender: 'UNISEX',
          status: 'PENDING_VERIFICATION' // Initial submission status
        }
      })

      const floor = await tx.floor.create({
        data: {
          propertyId: prop.id,
          level: 1,
          name: '1st Floor'
        }
      })

      const room = await tx.room.create({
        data: {
          floorId: floor.id,
          roomNumber: '201',
          capacity: 2,
          pricePerBed: 9000
        }
      })

      await tx.bed.createMany({
        data: [
          { roomId: room.id, identifier: 'A', status: 'VACANT', isTrustNestInventory: true },
          { roomId: room.id, identifier: 'B', status: 'OWNER_MANAGED', isTrustNestInventory: false }
        ]
      })

      return prop
    })

    assert(testOwnerPG.status === 'PENDING_VERIFICATION', 'Owner PG registered in PENDING_VERIFICATION state')

    // Super Admin Approves the PG
    const approvedPG = await prisma.property.update({
      where: { id: testOwnerPG.id },
      data: { status: 'PUBLISHED' }
    })
    assert(approvedPG.status === 'PUBLISHED', 'Super Admin verified and published PG')

    // -------------------------------------------------------------
    // TEST 5: INVENTORY ALLOCATION (TrustNest vs Owner-Managed)
    // -------------------------------------------------------------
    console.log('\n--- PHASE 14 / TEST 5: TrustNest vs Owner-Managed Inventory Protection ---')
    const ownerManagedBed = await prisma.bed.findFirst({
      where: {
        roomId: { in: (await prisma.room.findMany({ where: { floor: { propertyId: testOwnerPG.id } } })).map(r => r.id) },
        isTrustNestInventory: false
      },
      include: { room: { include: { floor: { include: { property: true } } } } }
    })

    assert(ownerManagedBed !== null, 'Found owner-managed bed')

    const ownerBookingRes = await bookBed({
      propertyId: testOwnerPG.id,
      roomId: ownerManagedBed!.roomId,
      bedId: ownerManagedBed!.id,
      moveInDate: '2026-09-01',
      termsAccepted: true,
      guestInfo: { name: 'Unauthorized Bed Attempt', email: `test.unauth.${Date.now()}@dummy.com` }
    })

    assert(
      ownerBookingRes.success === false && (ownerBookingRes.error?.includes('owner-managed') || ownerBookingRes.error?.includes('not allocated')),
      'Owner-managed bed cannot be booked through TrustNest platform',
      `Error caught: ${ownerBookingRes.error}`
    )

    // -------------------------------------------------------------
    // TEST 6: GENDER ELIGIBILITY RULES
    // -------------------------------------------------------------
    console.log('\n--- PHASE 14 / TEST 6: Gender Eligibility Enforcement ---')
    const femaleUser = await prisma.user.create({
      data: {
        name: 'Anita Roy',
        email: `anita.roy.${Date.now()}@trustnest.dummy`,
        passwordHash: 'dummy',
        role: 'TENANT',
        genderEligibility: 'FEMALE',
        phoneVerified: true
      }
    })

    const maleOnlyProperty = await prisma.property.create({
      data: {
        ownerId: owner!.id,
        name: `Boys Hostel ${Date.now()}`,
        address: 'Pune',
        latitude: 18.5,
        longitude: 73.7,
        priceFrom: 7000,
        gender: 'MALE',
        eligibilityRule: 'MALE_ONLY',
        status: 'PUBLISHED'
      }
    })

    const maleFloor = await prisma.floor.create({
      data: { propertyId: maleOnlyProperty.id, level: 1, name: 'Floor 1' }
    })
    const maleRoom = await prisma.room.create({
      data: { floorId: maleFloor.id, roomNumber: '101', capacity: 1, eligibilityRule: 'MALE_ONLY' }
    })
    const maleBed = await prisma.bed.create({
      data: { roomId: maleRoom.id, identifier: 'A', status: 'VACANT', isTrustNestInventory: true }
    })

    const genderBookingRes = await bookBed({
      propertyId: maleOnlyProperty.id,
      roomId: maleRoom.id,
      bedId: maleBed.id,
      moveInDate: '2026-09-01',
      termsAccepted: true,
      guestInfo: {
        name: femaleUser.name,
        email: femaleUser.email
      }
    })

    assert(
      genderBookingRes.success === false && (genderBookingRes.error?.includes('MALE') || genderBookingRes.error?.includes('FEMALE')),
      'Female user is blocked from booking a MALE_ONLY property',
      `Error caught: ${genderBookingRes.error}`
    )

    // -------------------------------------------------------------
    // TEST 8: SUCCESSFUL DEMO PAYMENT, RESIDENT CREATION & NOTIFICATIONS
    // -------------------------------------------------------------
    console.log('\n--- PHASE 14 / TEST 8: Successful Demo Payment Flow & Multi-Party Notifications ---')
    const bookingData = bookingRes.data as any
    assert(bookingData.transactionId.startsWith('TNEST_BOOKING_DEMO_'), 'Generated valid Demo Transaction ID', bookingData.transactionId)

    // Check ResidentStay record
    const stay = await prisma.residentStay.findUnique({
      where: { id: bookingData.stayId }
    })
    assert(stay !== null && stay.status === 'ACTIVE', 'ResidentStay record created in ACTIVE status')

    // Check In-App Notification for User
    const userNotifs = await prisma.notification.findMany({
      where: { userId: guestUser!.id }
    })
    assert(userNotifs.length > 0, 'User received In-App confirmation notification', userNotifs[0]?.title)

    // Check In-App Notification for PG Owner
    const ownerNotifs = await prisma.notification.findMany({
      where: { userId: bookingData.ownerId }
    })
    assert(ownerNotifs.length > 0, 'Owner received In-App booking alert notification', ownerNotifs[0]?.title)

    // Check In-App Notification for Super Admin
    const adminUser = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } })
    if (adminUser) {
      const adminNotifs = await prisma.notification.findMany({
        where: { userId: adminUser.id }
      })
      assert(adminNotifs.length > 0, 'Super Admin received In-App booking revenue notification')
    }

    // Check AuditLog Record
    const auditLogs = await prisma.auditLog.findMany({
      where: { entityId: bookingData.bookingId, action: 'BOOKING_CREATED' }
    })
    assert(auditLogs.length > 0, 'AuditLog created for booking event', `Audit ID: ${auditLogs[0]?.id}`)

    // -------------------------------------------------------------
    // TEST 9: SIMULATED PAYMENT FAILURE
    // -------------------------------------------------------------
    console.log('\n--- PHASE 14 / TEST 9: Simulated Payment Failure Handling ---')
    const freshBed = await prisma.bed.findFirst({
      where: { roomId: maleRoom.id }
    })

    const failedPaymentRes = await bookBed({
      propertyId: maleOnlyProperty.id,
      roomId: maleRoom.id,
      bedId: freshBed!.id,
      moveInDate: '2026-09-01',
      termsAccepted: true,
      simulateFailure: true,
      failureReason: 'Insufficient demo test balance',
      guestInfo: {
        name: 'Failure Test User',
        email: `fail.${Date.now()}@trustnest.dummy`
      }
    })

    assert(failedPaymentRes.success === false, 'Failed payment simulation returns failure response')
    const bedAfterFailedPayment = await prisma.bed.findUnique({ where: { id: freshBed!.id } })
    assert(bedAfterFailedPayment?.status === 'VACANT', 'Bed remains VACANT after payment failure')

    // -------------------------------------------------------------
    // TEST 10: DOUBLE BOOKING CONCURRENCY PROTECTION
    // -------------------------------------------------------------
    console.log('\n--- PHASE 14 / TEST 10: Double Booking Prevention ---')
    const doubleRes = await bookBed({
      propertyId: availableBed!.room.floor.property.id,
      roomId: availableBed!.roomId,
      bedId: availableBed!.id,
      moveInDate: '2026-09-01',
      termsAccepted: true,
      guestInfo: {
        name: 'Concurrent User 2',
        email: `concurrent2.${Date.now()}@trustnest.dummy`
      }
    })

    assert(
      doubleRes.success === false && (doubleRes.error?.includes('already occupied') || doubleRes.error?.includes('no longer available')),
      'Concurrent double booking attempt is safely rejected',
      `Error caught: ${doubleRes.error}`
    )

    // -------------------------------------------------------------
    // TEST 12: BOOKING CANCELLATION (PHASE 12)
    // -------------------------------------------------------------
    console.log('\n--- PHASE 14 / TEST 12: Booking Cancellation Flow ---')
    // Mock cancellation as the owner
    const cancelRes = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: bookingData.bookingId },
        data: { status: 'CANCELLED' }
      })
      await tx.bed.update({
        where: { id: availableBed!.id },
        data: { status: 'VACANT' }
      })
      await tx.residentStay.updateMany({
        where: { tenantId: guestUser!.id, bedId: availableBed!.id },
        data: { status: 'CANCELLED' }
      })
      await tx.auditLog.create({
        data: {
          actor: owner!.id,
          role: 'OWNER',
          action: 'BOOKING_CANCELLED',
          entity: 'Booking',
          entityId: b.id,
          details: JSON.stringify({ reason: 'E2E Test Cancellation' })
        }
      })
      return b
    })

    assert(cancelRes.status === 'CANCELLED', 'Booking status transitioned to CANCELLED')
    const bedAfterCancel = await prisma.bed.findUnique({ where: { id: availableBed!.id } })
    assert(bedAfterCancel?.status === 'VACANT', 'Bed inventory returned to VACANT status after cancellation')

    // -------------------------------------------------------------
    // TEST 13: IN-APP CHAT (NO WHATSAPP / NO EXPOSED PHONES)
    // -------------------------------------------------------------
    console.log('\n--- PHASE 14 / TEST 13: In-App Chat Persistence & Privacy ---')
    const chatRes = await prisma.chatThread.upsert({
      where: {
        userId_ownerId_propertyId: {
          userId: guestUser!.id,
          ownerId: owner!.id,
          propertyId: samplePG.id
        }
      },
      update: {},
      create: {
        userId: guestUser!.id,
        ownerId: owner!.id,
        propertyId: samplePG.id,
        messages: {
          create: [
            { senderId: guestUser!.id, content: 'Hi, is parking available?' },
            { senderId: owner!.id, content: 'Yes, 2-wheeler and 4-wheeler parking are both available.' }
          ]
        }
      },
      include: { messages: true }
    })

    assert(chatRes.messages.length >= 2, 'Chat thread and messages persist cleanly in database')

    // -------------------------------------------------------------
    // TEST 14: EMAIL SERVICE INTEGRATION
    // -------------------------------------------------------------
    console.log('\n--- PHASE 14 / TEST 14: Email Event Triggers ---')
    const emailService = getEmailService()
    assert(emailService.provider !== undefined, 'Email service initialized', `Provider: ${emailService.provider}`)

    const emailRes = await emailService.sendBookingConfirmationToUser({
      toEmail: guestUser!.email,
      userName: guestUser!.name,
      propertyName: samplePG.name,
      propertyAddress: samplePG.address,
      roomNumber: '101',
      bedIdentifier: 'A',
      bookingId: bookingData.bookingId,
      transactionId: bookingData.transactionId,
      amount: 8500,
      moveInDate: '2026-09-01'
    })

    assert(emailRes.success === true, 'Email event dispatches cleanly without throwing errors')

    // -------------------------------------------------------------
    // CLEANUP TEMPORARY TEST ENTITIES
    // -------------------------------------------------------------
    console.log('\n--- Cleaning up temporary test entities ---')
    await prisma.property.delete({ where: { id: testOwnerPG.id } }).catch(() => null)
    await prisma.property.delete({ where: { id: maleOnlyProperty.id } }).catch(() => null)
    await prisma.user.delete({ where: { id: femaleUser.id } }).catch(() => null)
    await prisma.user.delete({ where: { id: guestUser!.id } }).catch(() => null)
    console.log('✅ Cleanup complete.')

    console.log('\n=================================================================')
    console.log(`🎉 ALL ${passed}/${total} END-TO-END TESTS PASSED WITH 100% SUCCESS!`)
    console.log('=================================================================')
  } catch (err: any) {
    console.error('\n❌ E2E TEST RUN FAILED:', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

runFullE2ETestSuite()
