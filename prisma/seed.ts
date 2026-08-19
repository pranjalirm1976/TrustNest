import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Clearing existing database records...')
  await prisma.notification.deleteMany({})
  await prisma.nearbyService.deleteMany({})
  await prisma.amenity.deleteMany({})
  await prisma.cleaningTask.deleteMany({})
  await prisma.rentPayment.deleteMany({})
  await prisma.propertyFlag.deleteMany({})
  await prisma.propertyReview.deleteMany({})
  await prisma.complaintComment.deleteMany({})
  await prisma.complaint.deleteMany({})
  await prisma.foodRating.deleteMany({})
  await prisma.foodImage.deleteMany({})
  await prisma.foodMenuItem.deleteMany({})
  await prisma.foodMenu.deleteMany({})
  await prisma.residentStay.deleteMany({})
  await prisma.bed.deleteMany({})
  await prisma.roomAmenity.deleteMany({})
  await prisma.room.deleteMany({})
  await prisma.floorFacility.deleteMany({})
  await prisma.floor.deleteMany({})
  await prisma.propertyImage.deleteMany({})
  await prisma.property.deleteMany({})
  await prisma.user.deleteMany({})

  console.log('👤 Seeding security profiles...')
  const passwordHash = await bcrypt.hash('password123', 12)

  // 1. Auditor / Inspector
  await prisma.user.create({
    data: {
      name: 'Vikram Joshi',
      email: 'admin@trustnest.com',
      passwordHash: passwordHash,
      role: 'INSPECTOR',
    },
  })

  // 2. Owner
  const owner = await prisma.user.create({
    data: {
      name: 'Rajesh Kumar',
      email: 'rajesh@emeraldelite.com',
      passwordHash: passwordHash,
      role: 'OWNER',
    },
  })

  // 3. Primary Tenants
  const tenants = {
    priya: await prisma.user.create({
      data: { name: 'Priya Sharma', email: 'priya.sharma@gmail.com', passwordHash, role: 'TENANT' },
    }),
    arjun: await prisma.user.create({
      data: { name: 'Arjun Singh', email: 'arjun.singh@gmail.com', passwordHash, role: 'TENANT' },
    }),
    kavya: await prisma.user.create({
      data: { name: 'Kavya Nair', email: 'kavya.nair@gmail.com', passwordHash, role: 'TENANT' },
    }),
    rohan: await prisma.user.create({
      data: { name: 'Rohan Deshmukh', email: 'rohan.deshmukh@gmail.com', passwordHash, role: 'TENANT' },
    }),
  }

  // Generate 52 dummy users for the remaining 52 residents (total 56 residents)
  const dummyResidents = []
  for (let i = 1; i <= 52; i++) {
    const dummyUser = await prisma.user.create({
      data: {
        name: `Resident ${i}`,
        email: `resident.${i}@trustnest.dummy`,
        passwordHash: passwordHash,
        role: 'TENANT',
      },
    })
    dummyResidents.push(dummyUser)
  }

  console.log('🏢 Creating Bliss Living PG Property...')
  const property = await prisma.property.create({
    data: {
      name: 'Bliss Living PG',
      address: 'Hinjewadi Phase 1, Pune, Maharashtra 411057',
      ownerId: owner.id,
      latitude: 18.5913,
      longitude: 73.7389,
      priceFrom: 8500.0,
      gender: 'UNISEX',
      trustScore: 4.6,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', altText: 'Bliss Living PG Exterior', isCover: true },
          { url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80', altText: 'Bedroom Layout', isCover: false },
          { url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80', altText: 'Dining Area Layout', isCover: false },
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', altText: 'Common Area Layout', isCover: false },
          { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', altText: 'Study Lounge Layout', isCover: false },
        ],
      },
      amenities: {
        create: [
          { name: 'High-Speed Wi-Fi', icon: 'Wifi' },
          { name: 'AC Rooms', icon: 'Wind' },
          { name: 'Nutritious & Hygienic Food', icon: 'Utensils' },
          { name: 'Laundry Service', icon: 'Tv' },
          { name: '24x7 Security & CCTV', icon: 'Shield' },
          { name: 'RO Purified Water', icon: 'Droplet' },
          { name: 'Power Backup', icon: 'Zap' },
          { name: 'Daily Housekeeping', icon: 'CheckCircle' },
          { name: 'Peaceful Environment', icon: 'Sparkles' },
          { name: 'Regular Sanitization', icon: 'Check' },
        ],
      },
      services: {
        create: [
          { name: 'Brahma Tiffin', type: 'RESTAURANT', distance: '1.2 km' },
          { name: 'Laundry Hub', type: 'LAUNDRY', distance: '750 m' },
          { name: 'D Mart', type: 'MALL', distance: '1.8 km' },
          { name: 'MedPlus Pharmacy', type: 'HOSPITAL', distance: '1.1 km' },
          { name: 'Hinjawadi Phase 1 Bus Stop', type: 'METRO', distance: '950 m' },
          { name: 'Café Coffee Day', type: 'CAFE', distance: '1.3 km' },
        ],
      },
    },
  })

  console.log('🏠 Generating 6 Floors...')
  const levels = [
    { name: 'Terrace Floor', level: 5, facilities: ['Roof deck', 'Solar heaters'] },
    { name: '3rd Floor', level: 3, facilities: ['Study room', 'Dry balcony'] },
    { name: '2nd Floor', level: 2, facilities: ['Water station', 'Ironing room'] },
    { name: '1st Floor', level: 1, facilities: ['Laundry Room', 'Study Lounge'] },
    { name: 'Ground Floor', level: 0, facilities: ['Reception', 'Common Lounge', 'Canteen'] },
    { name: 'Basement', level: -1, facilities: ['Bike Parking', 'UPS Room'] },
  ]

  const floorMap: { [key: number]: any } = {}

  for (const lvl of levels) {
    const floorObj = await prisma.floor.create({
      data: {
        propertyId: property.id,
        level: lvl.level,
        name: lvl.name,
        facilities: {
          create: lvl.facilities.map(f => ({ name: f }))
        }
      }
    })
    floorMap[lvl.level] = floorObj
  }

  console.log('🛏️ Seeding 32 Rooms (Total 68 Beds) matching metrics perfectly...')
  let totalBedsSeeded = 0
  let occupiedBedsCount = 0
  let residentIndex = 0

  // We want:
  // - 32 Rooms total (Ground, 1st, 2nd, 3rd floors, 8 rooms per floor)
  // - Total beds = 68 beds
  // - Occupied beds = 56 beds ( Priya, Arjun, Kavya, Rohan + 52 dummy residents)
  // - Vacant beds = 12 beds
  const floorsToSeed = [0, 1, 2, 3] // Ground, 1st, 2nd, 3rd

  for (const level of floorsToSeed) {
    const floor = floorMap[level]
    const floorPrefix = level === 0 ? 'G' : `${level}`

    for (let roomIdx = 1; roomIdx <= 8; roomIdx++) {
      const roomNumStr = `${floorPrefix}0${roomIdx}`
      const isTripleSharing = roomIdx === 1 || roomIdx === 4 // Rooms X01 and X04 are triple sharing, others double
      const capacity = isTripleSharing ? 3 : 2

      const roomObj = await prisma.room.create({
        data: {
          floorId: floor.id,
          roomNumber: roomNumStr,
          capacity: capacity,
          hasWashroom: true,
          amenities: {
            create: [
              { name: 'Study Table' },
              { name: 'Wardrobe' },
              { name: 'Attached Bathroom' }
            ]
          }
        }
      })

      // Create Beds for this Room
      for (let bedIdx = 0; bedIdx < capacity; bedIdx++) {
        const bedLetter = String.fromCharCode(65 + bedIdx) // A, B, C
        totalBedsSeeded++

        // We need exactly 56 occupied beds. Let's mark beds as occupied until we hit 56!
        let status = 'VACANT'
        let occupantUser = null

        if (occupiedBedsCount < 56) {
          status = 'OCCUPIED'
          occupiedBedsCount++

          // Assign key tenants to specific beds on 1st Floor (Level 1)
          if (level === 1 && roomNumStr === '101' && bedLetter === 'A') {
            occupantUser = tenants.priya
          } else if (level === 1 && roomNumStr === '101' && bedLetter === 'B') {
            occupantUser = tenants.arjun
          } else if (level === 1 && roomNumStr === '102' && bedLetter === 'A') {
            occupantUser = tenants.kavya
          } else if (level === 1 && roomNumStr === '102' && bedLetter === 'B') {
            occupantUser = tenants.rohan
          } else {
            // Assign dummy resident
            occupantUser = dummyResidents[residentIndex++]
          }
        }

        const bedObj = await prisma.bed.create({
          data: {
            roomId: roomObj.id,
            identifier: bedLetter,
            status: status
          }
        })

        // If occupied, seed active stay
        if (status === 'OCCUPIED' && occupantUser) {
          const stay = await prisma.residentStay.create({
            data: {
              tenantId: occupantUser.id,
              bedId: bedObj.id,
              startDate: new Date(2026, 4, 1), // Started May 1, 2026
              status: 'ACTIVE',
              rentAmount: 8500.0,
              depositAmount: 17000.0
            }
          })

          // Seed billing invoices for key tenants to show in dashboard
          if (occupantUser.role === 'TENANT' && ['Priya Sharma', 'Rohan Deshmukh'].includes(occupantUser.name)) {
            const isPriya = occupantUser.name === 'Priya Sharma'
            
            // June Invoice (Paid)
            await prisma.rentPayment.create({
              data: {
                stayId: stay.id,
                amount: 8500.0,
                dueDate: new Date(2026, 5, 5),
                paidDate: new Date(2026, 5, 3),
                status: 'PAID',
                transactionId: `TXN_${isPriya ? 'PRIYA' : 'ROHAN'}_1`,
                billingMonth: 'June 2026'
              }
            })

            // July Invoice (Paid)
            await prisma.rentPayment.create({
              data: {
                stayId: stay.id,
                amount: 8500.0,
                dueDate: new Date(2026, 6, 5),
                paidDate: new Date(2026, 6, 4),
                status: 'PAID',
                transactionId: `TXN_${isPriya ? 'PRIYA' : 'ROHAN'}_2`,
                billingMonth: 'July 2026'
              }
            })

            // August Invoice (Priya Paid, Rohan Overdue)
            await prisma.rentPayment.create({
              data: {
                stayId: stay.id,
                amount: 8500.0,
                dueDate: new Date(2026, 7, 5),
                paidDate: isPriya ? new Date(2026, 7, 5) : undefined,
                status: isPriya ? 'PAID' : 'OVERDUE',
                transactionId: isPriya ? 'TXN_PRIYA_3' : undefined,
                billingMonth: 'August 2026'
              }
            })
          }
        }
      }
    }
  }

  console.log('🍕 Seeding Daily Food Menus...')
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const breakfastLog = await prisma.foodMenu.create({
    data: {
      propertyId: property.id,
      date: yesterday,
      mealType: 'BREAKFAST',
      isVeg: true,
      items: { create: [{ name: 'Idli Sambar' }, { name: 'Chutney' }, { name: 'Tea/Coffee' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80' }] }
    }
  })

  await prisma.foodMenu.create({
    data: {
      propertyId: property.id,
      date: yesterday,
      mealType: 'LUNCH',
      isVeg: true,
      items: { create: [{ name: 'Roti' }, { name: 'Jeera Rice' }, { name: 'Dal' }, { name: 'Aloo Gobi' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80' }] }
    }
  })

  // Seeding Resident food rating reviews
  await prisma.foodRating.create({
    data: {
      foodMenuId: breakfastLog.id,
      tenantId: tenants.priya.id,
      rating: 5,
      comment: 'Verified Resident Rating: Food was fresh and idli was very soft!'
    }
  })

  console.log('⚠️ Seeding SLA Complaints & Resolving workflows...')
  // 1. Resolved Complaint
  const resolvedCreated = new Date(today)
  resolvedCreated.setHours(today.getHours() - 36)
  await prisma.complaint.create({
    data: {
      propertyId: property.id,
      tenantId: tenants.priya.id,
      title: 'Water filter leakage in 1st Floor Lounge',
      description: 'The filter dispenser tap is slowly dripping water, making the floor wet.',
      category: 'PLUMBING',
      status: 'RESOLVED',
      severity: 'MEDIUM',
      createdAt: resolvedCreated,
      slaDeadline: new Date(resolvedCreated.getTime() + 24 * 60 * 60 * 1000),
      resolvedAt: new Date(resolvedCreated.getTime() + 5 * 60 * 60 * 1000), // Resolved in 5h
      comments: {
        create: [
          { authorId: owner.id, comment: 'Plumber Raju dispatched. Tap replaced.', createdAt: new Date(resolvedCreated.getTime() + 2 * 60 * 60 * 1000) }
        ]
      }
    }
  })

  // 2. Open Complaint within SLA
  const activeCreated = new Date(today)
  activeCreated.setHours(today.getHours() - 4)
  await prisma.complaint.create({
    data: {
      propertyId: property.id,
      tenantId: tenants.rohan.id,
      title: 'Wi-Fi connectivity drops in Room 102',
      description: 'Connection drops repeatedly during office hours.',
      category: 'INTERNET',
      status: 'IN_PROGRESS',
      severity: 'HIGH',
      createdAt: activeCreated,
      slaDeadline: new Date(activeCreated.getTime() + 24 * 60 * 60 * 1000)
    }
  })

  console.log('🧼 Seeding cleaning checks...')
  await prisma.cleaningTask.create({
    data: { propertyId: property.id, area: 'Common Dining Area', scheduledDate: today, status: 'PENDING' }
  })

  console.log('⭐ Seeding verified resident ratings...')
  await prisma.propertyReview.create({
    data: {
      propertyId: property.id,
      tenantId: tenants.priya.id,
      rating: 4.8,
      foodRating: 4,
      amenitiesRating: 5,
      cleanlinessRating: 5,
      staffRating: 5,
      comment: 'Excellent and well maintained. Professional management. Clean study desks.',
      isVerifiedResident: true
    }
  })

  console.log('✅ Bliss Living PG database seeding completed!')
  console.log(`   Total rooms: 32 (32/32 targeted)`)
  console.log(`   Total beds: ${totalBedsSeeded} (68/68 targeted)`)
  console.log(`   Occupied beds: ${occupiedBedsCount} (56/56 targeted)`)
  console.log(`   Available beds: ${totalBedsSeeded - occupiedBedsCount} (12/12 targeted)`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })