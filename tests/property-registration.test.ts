import { prisma } from '../src/lib/prisma'
import { canCreateProperty, getBedIdentifier } from '../src/actions/property.actions'

async function runRegressionSuite() {
  console.log('=== STARTING PRODUCTION REGRESSION TEST SUITE ===\n')

  let passedTests = 0
  let totalTests = 0

  function assert(condition: boolean, testName: string) {
    totalTests++
    if (condition) {
      console.log(`✅ [PASS] ${testName}`)
      passedTests++
    } else {
      console.error(`❌ [FAIL] ${testName}`)
      throw new Error(`Test failed: ${testName}`)
    }
  }

  try {
    // TEST 1: Role Authorization Helper
    console.log('--- TEST GROUP 1: Role Authorization Matrix ---')
    assert(canCreateProperty('OWNER') === true, 'OWNER role can create property')
    assert(canCreateProperty('PG_OWNER') === true, 'PG_OWNER role can create property')
    assert(canCreateProperty('SUPER_ADMIN') === true, 'SUPER_ADMIN role can create property')
    assert(canCreateProperty('INSPECTOR') === true, 'INSPECTOR role can create property')
    assert(canCreateProperty('TENANT') === false, 'TENANT role cannot create property (403)')
    assert(canCreateProperty('USER') === false, 'USER role cannot create property (403)')
    assert(canCreateProperty('') === false, 'Empty role cannot create property')

    // TEST 2: Robust Bed Identifier Generator
    console.log('\n--- TEST GROUP 2: Spreadsheet-Style Bed Identifier Generation ---')
    assert(getBedIdentifier(0) === 'A', 'Index 0 -> A')
    assert(getBedIdentifier(1) === 'B', 'Index 1 -> B')
    assert(getBedIdentifier(25) === 'Z', 'Index 25 -> Z')
    assert(getBedIdentifier(26) === 'AA', 'Index 26 -> AA')
    assert(getBedIdentifier(27) === 'AB', 'Index 27 -> AB')
    assert(getBedIdentifier(51) === 'AZ', 'Index 51 -> AZ')
    assert(getBedIdentifier(52) === 'BA', 'Index 52 -> BA')

    // TEST 3: Database User Verification
    console.log('\n--- TEST GROUP 3: Database User Resolution & FK Integrity ---')
    const owner = await prisma.user.findFirst({
      where: { email: 'rajesh@emeraldelite.com' }
    })
    assert(owner !== null, 'Real PG Owner user exists in database')
    assert(typeof owner?.id === 'string' && owner.id.length > 5, 'Owner has valid primary key ID')

    // TEST 4: Atomic Transaction with Foreign Key Validation
    console.log('\n--- TEST GROUP 4: Atomic Property & Inventory Creation ---')
    const testPropName = `Regression Verification PG ${Date.now()}`
    const transactionResult = await prisma.$transaction(async (tx) => {
      const prop = await tx.property.create({
        data: {
          ownerId: owner!.id,
          name: testPropName,
          description: 'Automated test property for FK verification',
          address: 'Phase 1, Hinjawadi, Pune - 411057',
          latitude: 18.5913,
          longitude: 73.7389,
          priceFrom: 8500,
          gender: 'UNISEX',
          status: 'PENDING_VERIFICATION'
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
          roomNumber: '101',
          capacity: 3,
          sharingType: 'TRIPLE',
          pricePerBed: 8500,
          hasWashroom: true,
          hasAc: true,
          hasBalcony: false
        }
      })

      await tx.bed.createMany({
        data: [
          { roomId: room.id, identifier: 'A', status: 'VACANT', isTrustNestInventory: true },
          { roomId: room.id, identifier: 'B', status: 'VACANT', isTrustNestInventory: true },
          { roomId: room.id, identifier: 'C', status: 'VACANT', isTrustNestInventory: true }
        ]
      })

      return prop
    })

    assert(transactionResult.ownerId === owner!.id, 'Created property ownerId matches real DB user.id')
    assert(transactionResult.status === 'PENDING_VERIFICATION', 'New property starts with PENDING_VERIFICATION status')

    // Verify relations in DB
    const fetchedProp = await prisma.property.findUnique({
      where: { id: transactionResult.id },
      include: {
        owner: true,
        floors: { include: { rooms: { include: { beds: true } } } }
      }
    })

    assert(fetchedProp?.owner.email === 'rajesh@emeraldelite.com', 'Property owner relation resolves correctly via FK')
    assert(fetchedProp?.floors.length === 1, 'Floor created atomically')
    assert(fetchedProp?.floors[0].rooms.length === 1, 'Room created atomically')
    assert(fetchedProp?.floors[0].rooms[0].beds.length === 3, 'All 3 beds created atomically')

    // TEST 5: Atomic Rollback on Failure
    console.log('\n--- TEST GROUP 5: Atomic Rollback Guarantee ---')
    let rollbackOccurred = false
    try {
      await prisma.$transaction(async (tx) => {
        const dummyProp = await tx.property.create({
          data: {
            ownerId: owner!.id,
            name: 'Intentional Rollback Target',
            address: 'Pune',
            latitude: 18.5,
            longitude: 73.8,
            priceFrom: 5000,
            gender: 'UNISEX',
            status: 'DRAFT'
          }
        })
        // Intentionally throw inside transaction to test rollback
        throw new Error('Simulated failure during child records creation')
      })
    } catch (e: any) {
      if (e.message === 'Simulated failure during child records creation') {
        rollbackOccurred = true
      }
    }
    assert(rollbackOccurred === true, 'Transaction rolled back upon downstream failure')

    const orphanedCheck = await prisma.property.findFirst({
      where: { name: 'Intentional Rollback Target' }
    })
    assert(orphanedCheck === null, 'No orphaned property remained after transaction failure')

    // Clean up test property
    await prisma.property.delete({ where: { id: transactionResult.id } })
    console.log('\n--- Cleanup Complete ---')

    console.log(`\n========================================`)
    console.log(`🎉 REGRESSION SUITE COMPLETED: ${passedTests}/${totalTests} TESTS PASSED`)
    console.log(`========================================`)
  } catch (err: any) {
    console.error('\n❌ REGRESSION SUITE FAILED:', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

runRegressionSuite()
