import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Clearing existing data...')
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

  console.log('👤 Creating users...')
  const passwordHash = await bcrypt.hash('password123', 12)

  // 1. System Admin / Inspector
  const admin = await prisma.user.create({
    data: {
      name: 'Vikram Joshi',
      email: 'admin@trustnest.com',
      passwordHash: passwordHash,
      role: 'INSPECTOR',
    },
  })

  // 2. Owners
  const owners = {
    rajesh: await prisma.user.create({
      data: { name: 'Rajesh Kumar', email: 'rajesh@emeraldelite.com', passwordHash, role: 'OWNER' },
    }),
    sneha: await prisma.user.create({
      data: { name: 'Sneha Patil', email: 'sneha@wakadheights.com', passwordHash, role: 'OWNER' },
    }),
    vikram: await prisma.user.create({
      data: { name: 'Vikram Malhotra', email: 'vikram@banercrest.com', passwordHash, role: 'OWNER' },
    }),
    amit: await prisma.user.create({
      data: { name: 'Amit Joshi', email: 'amit@kharadinest.com', passwordHash, role: 'OWNER' },
    }),
  }

  // 3. Tenants (Verified Residents)
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

  console.log('🏢 Creating PG Properties in Pune...')

  // 1. Emerald Elite PG (Hinjawadi Phase 1)
  const pg1 = await prisma.property.create({
    data: {
      name: 'Emerald Elite PG',
      address: 'Phase 1, Hinjawadi, Pune, Maharashtra 411057 (Near Infosys Circle)',
      ownerId: owners.rajesh.id,
      latitude: 18.5913,
      longitude: 73.7389,
      priceFrom: 8500.0,
      gender: 'UNISEX',
      trustScore: 4.8,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80', altText: 'Premium Unisex Single Room', isCover: true },
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', altText: 'Common Lounge Area', isCover: false },
        ],
      },
      amenities: {
        create: [
          { name: 'High-Speed WiFi', icon: 'Wifi' },
          { name: 'Air Conditioning', icon: 'Wind' },
          { name: 'Gymnasium', icon: 'Dumbbell' },
          { name: 'Biometric Access', icon: 'Fingerprint' },
          { name: 'Power Backup', icon: 'Zap' },
        ],
      },
      services: {
        create: [
          { name: 'Hinjawadi IT Park Phase 1', type: 'IT_PARK', distance: '0.4 km' },
          { name: 'Ruby Hall Clinic Hinjawadi', type: 'HOSPITAL', distance: '1.2 km' },
          { name: 'Grand Highstreet Mall', type: 'MALL', distance: '2.5 km' },
        ],
      },
    },
  })

  // 2. Wakad Heights PG (Wakad)
  const pg2 = await prisma.property.create({
    data: {
      name: 'Wakad Heights PG',
      address: 'Dange Chowk Road, Wakad, Pune, Maharashtra 411057',
      ownerId: owners.sneha.id,
      latitude: 18.5985,
      longitude: 73.7661,
      priceFrom: 7000.0,
      gender: 'FEMALE',
      trustScore: 4.9,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80', altText: 'Premium Female Double Sharing Room', isCover: true },
          { url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', altText: 'Modern Shared Kitchen', isCover: false },
        ],
      },
      amenities: {
        create: [
          { name: 'High-Speed WiFi', icon: 'Wifi' },
          { name: '24/7 Security CCTV', icon: 'Shield' },
          { name: 'Washing Machine', icon: 'Tv' },
          { name: 'RO Drinking Water', icon: 'Droplet' },
        ],
      },
      services: {
        create: [
          { name: 'Indira College of Commerce', type: 'COLLEGE', distance: '1.5 km' },
          { name: 'Lifepoint Multispecialty Hospital', type: 'HOSPITAL', distance: '0.8 km' },
        ],
      },
    },
  })

  // 3. Baner Crest PG (Baner)
  const pg3 = await prisma.property.create({
    data: {
      name: 'Baner Crest PG',
      address: 'Pan Card Club Road, Baner, Pune, Maharashtra 411045',
      ownerId: owners.vikram.id,
      latitude: 18.5597,
      longitude: 73.7799,
      priceFrom: 11000.0,
      gender: 'MALE',
      trustScore: 4.6,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80', altText: 'Premium Male Single Room', isCover: true },
        ],
      },
      amenities: {
        create: [
          { name: 'High-Speed WiFi', icon: 'Wifi' },
          { name: 'Air Conditioning', icon: 'Wind' },
          { name: 'Elevator Access', icon: 'ChevronUp' },
          { name: 'Housekeeping', icon: 'CheckCircle' },
        ],
      },
      services: {
        create: [
          { name: 'Balewadi High Street', type: 'MALL', distance: '1.8 km' },
          { name: 'Jupiter Hospital Baner', type: 'HOSPITAL', distance: '2.2 km' },
        ],
      },
    },
  })

  // 4. Kharadi Nest PG (Kharadi)
  const pg4 = await prisma.property.create({
    data: {
      name: 'Kharadi Nest PG',
      address: 'Near EON Free Zone, Kharadi, Pune, Maharashtra 411014',
      ownerId: owners.amit.id,
      latitude: 18.5516,
      longitude: 73.9349,
      priceFrom: 9000.0,
      gender: 'UNISEX',
      trustScore: 4.2, // Degraded trust score due to active SLA breach
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', altText: 'Premium Unisex Single Room', isCover: true },
        ],
      },
      amenities: {
        create: [
          { name: 'High-Speed WiFi', icon: 'Wifi' },
          { name: 'Air Conditioning', icon: 'Wind' },
          { name: 'Power Backup', icon: 'Zap' },
        ],
      },
      services: {
        create: [
          { name: 'EON Free Zone IT Park', type: 'IT_PARK', distance: '0.5 km' },
          { name: 'Kharadi Metro Station (Proposed)', type: 'METRO', distance: '1.0 km' },
        ],
      },
    },
  })

  console.log('🏠 Creating Floors, Rooms, and Beds...')

  // Build Floors for Emerald Elite PG
  const pg1Ground = await prisma.floor.create({
    data: {
      propertyId: pg1.id,
      level: 0,
      name: 'Ground Floor',
      facilities: {
        create: [{ name: 'Reception' }, { name: 'Kitchen' }, { name: 'Common Lounge' }, { name: 'Parking' }],
      },
    },
  })

  const pg1First = await prisma.floor.create({
    data: {
      propertyId: pg1.id,
      level: 1,
      name: 'First Floor',
      facilities: {
        create: [{ name: 'Laundry Room' }, { name: 'Study Lounge' }],
      },
    },
  })

  // Create rooms for Ground Floor of Emerald Elite PG
  const rG01 = await prisma.room.create({
    data: {
      floorId: pg1Ground.id,
      roomNumber: 'G01',
      capacity: 2,
      hasWashroom: true,
      amenities: {
        create: [{ name: 'AC' }, { name: 'WiFi' }, { name: 'Study Table' }, { name: 'Wardrobe' }],
      },
    },
  })

  const rG02 = await prisma.room.create({
    data: {
      floorId: pg1Ground.id,
      roomNumber: 'G02',
      capacity: 1,
      hasWashroom: false,
      amenities: {
        create: [{ name: 'Fan' }, { name: 'WiFi' }, { name: 'Wardrobe' }],
      },
    },
  })

  // Create beds
  const bG01_A = await prisma.bed.create({ data: { roomId: rG01.id, identifier: 'A', status: 'OCCUPIED' } })
  const bG01_B = await prisma.bed.create({ data: { roomId: rG01.id, identifier: 'B', status: 'OCCUPIED' } })
  const bG02_A = await prisma.bed.create({ data: { roomId: rG02.id, identifier: 'A', status: 'VACANT' } })

  // Build Floor/Room/Bed for Wakad Heights PG
  const pg2First = await prisma.floor.create({
    data: {
      propertyId: pg2.id,
      level: 1,
      name: 'First Floor',
      facilities: {
        create: [{ name: 'Common Washroom' }],
      },
    },
  })

  const r101 = await prisma.room.create({
    data: {
      floorId: pg2First.id,
      roomNumber: '101',
      capacity: 2,
      hasWashroom: true,
      amenities: {
        create: [{ name: 'WiFi' }, { name: 'Study Table' }],
      },
    },
  })

  const b101_A = await prisma.bed.create({ data: { roomId: r101.id, identifier: 'A', status: 'OCCUPIED' } })
  const b101_B = await prisma.bed.create({ data: { roomId: r101.id, identifier: 'B', status: 'VACANT' } })

  // Build Floor/Room/Bed for Baner Crest PG
  const pg3Second = await prisma.floor.create({
    data: {
      propertyId: pg3.id,
      level: 2,
      name: 'Second Floor',
      facilities: {
        create: [{ name: 'Terrace Access' }],
      },
    },
  })

  const r201 = await prisma.room.create({
    data: {
      floorId: pg3Second.id,
      roomNumber: '201',
      capacity: 1,
      hasWashroom: true,
      amenities: {
        create: [{ name: 'AC' }, { name: 'WiFi' }, { name: 'Balcony' }],
      },
    },
  })

  const b201_A = await prisma.bed.create({ data: { roomId: r201.id, identifier: 'A', status: 'OCCUPIED' } })

  console.log('🔗 Creating Resident Stays...')

  const today = new Date()
  const stay1Start = new Date(today.getFullYear(), today.getMonth() - 2, 1) // 2 months ago
  const stay2Start = new Date(today.getFullYear(), today.getMonth() - 1, 15) // 1.5 months ago

  // Priya Sharma at Emerald Elite PG (bG01_A)
  const stayPriya = await prisma.residentStay.create({
    data: {
      tenantId: tenants.priya.id,
      bedId: bG01_A.id,
      startDate: stay1Start,
      status: 'ACTIVE',
      rentAmount: 8500.0,
      depositAmount: 17000.0,
    },
  })

  // Arjun Singh at Emerald Elite PG (bG01_B)
  const stayArjun = await prisma.residentStay.create({
    data: {
      tenantId: tenants.arjun.id,
      bedId: bG01_B.id,
      startDate: stay2Start,
      status: 'ACTIVE',
      rentAmount: 8500.0,
      depositAmount: 17000.0,
    },
  })

  // Kavya Nair at Wakad Heights PG (b101_A)
  const stayKavya = await prisma.residentStay.create({
    data: {
      tenantId: tenants.kavya.id,
      bedId: b101_A.id,
      startDate: stay1Start,
      status: 'ACTIVE',
      rentAmount: 7000.0,
      depositAmount: 14000.0,
    },
  })

  // Rohan Deshmukh at Baner Crest PG (b201_A)
  const stayRohan = await prisma.residentStay.create({
    data: {
      tenantId: tenants.rohan.id,
      bedId: b201_A.id,
      startDate: stay1Start,
      status: 'ACTIVE',
      rentAmount: 11000.0,
      depositAmount: 22000.0,
    },
  })

  console.log('💳 Seeding Rent Payments...')

  // Seed historical payments
  const months = ['June 2026', 'July 2026', 'August 2026']

  // Priya: All Paid
  await prisma.rentPayment.create({
    data: { stayId: stayPriya.id, amount: 8500.0, dueDate: new Date(2026, 5, 5), paidDate: new Date(2026, 5, 3), status: 'PAID', transactionId: 'TXN1001', billingMonth: 'June 2026' }
  })
  await prisma.rentPayment.create({
    data: { stayId: stayPriya.id, amount: 8500.0, dueDate: new Date(2026, 6, 5), paidDate: new Date(2026, 6, 4), status: 'PAID', transactionId: 'TXN1002', billingMonth: 'July 2026' }
  })
  await prisma.rentPayment.create({
    data: { stayId: stayPriya.id, amount: 8500.0, dueDate: new Date(2026, 7, 5), paidDate: new Date(2026, 7, 5), status: 'PAID', transactionId: 'TXN1003', billingMonth: 'August 2026' }
  })

  // Rohan: August rent Pending (Overdue!)
  await prisma.rentPayment.create({
    data: { stayId: stayRohan.id, amount: 11000.0, dueDate: new Date(2026, 5, 5), paidDate: new Date(2026, 5, 4), status: 'PAID', transactionId: 'TXN2001', billingMonth: 'June 2026' }
  })
  await prisma.rentPayment.create({
    data: { stayId: stayRohan.id, amount: 11000.0, dueDate: new Date(2026, 6, 5), paidDate: new Date(2026, 6, 5), status: 'PAID', transactionId: 'TXN2002', billingMonth: 'July 2026' }
  })
  await prisma.rentPayment.create({
    data: { stayId: stayRohan.id, amount: 11000.0, dueDate: new Date(2026, 7, 5), status: 'OVERDUE', billingMonth: 'August 2026' }
  })

  console.log('🍕 Seeding Daily Food Menus...')

  const yesterdayDate = new Date(today)
  yesterdayDate.setDate(today.getDate() - 1)

  // Seeding daily food menu for Emerald Elite PG
  // Yesterday Menus
  const pg1YestBreakfast = await prisma.foodMenu.create({
    data: {
      propertyId: pg1.id,
      date: yesterdayDate,
      mealType: 'BREAKFAST',
      isVeg: true,
      items: { create: [{ name: 'Idli Sambar' }, { name: 'Coconut Chutney' }, { name: 'Filter Coffee' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80' }] },
    },
  })

  const pg1YestLunch = await prisma.foodMenu.create({
    data: {
      propertyId: pg1.id,
      date: yesterdayDate,
      mealType: 'LUNCH',
      isVeg: true,
      items: { create: [{ name: 'Jeera Rice' }, { name: 'Dal Tadka' }, { name: 'Paneer Butter Masala' }, { name: 'Roti' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80' }] },
    },
  })

  // Today Menus
  const pg1TodayBreakfast = await prisma.foodMenu.create({
    data: {
      propertyId: pg1.id,
      date: today,
      mealType: 'BREAKFAST',
      isVeg: true,
      items: { create: [{ name: 'Aloo Paratha' }, { name: 'Curd & Pickle' }, { name: 'Chai' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=400&q=80' }] },
    },
  })

  const pg1TodayLunch = await prisma.foodMenu.create({
    data: {
      propertyId: pg1.id,
      date: today,
      mealType: 'LUNCH',
      isVeg: true,
      items: { create: [{ name: 'Veg Pulav' }, { name: 'Veg Kurma' }, { name: 'Salad' }, { name: 'Buttermilk' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=400&q=80' }] },
    },
  })

  console.log('⭐ Seeding Food Ratings...')

  // Priya rates Yesterday Breakfast 5 stars
  await prisma.foodRating.create({
    data: { foodMenuId: pg1YestBreakfast.id, tenantId: tenants.priya.id, rating: 5, comment: 'Sambar was hot and delicious! Reminds me of home.' },
  })

  // Arjun rates Yesterday Breakfast 4 stars
  await prisma.foodRating.create({
    data: { foodMenuId: pg1YestBreakfast.id, tenantId: tenants.arjun.id, rating: 4, comment: 'Chutney was slightly watery, but Idlis were soft.' },
  })

  // Priya rates Yesterday Lunch 4 stars
  await prisma.foodRating.create({
    data: { foodMenuId: pg1YestLunch.id, tenantId: tenants.priya.id, rating: 4, comment: 'Nice Paneer, roti was a bit hard though.' },
  })

  console.log('⚠️ Seeding 24-Hour SLA Complaints...')

  // 1. Resolved Complaint (within SLA)
  const comp1Created = new Date(today)
  comp1Created.setHours(today.getHours() - 30) // 30 hours ago
  const comp1Resolved = new Date(comp1Created)
  comp1Resolved.setHours(comp1Created.getHours() + 4) // Resolved in 4 hours
  
  await prisma.complaint.create({
    data: {
      propertyId: pg1.id,
      tenantId: tenants.priya.id,
      title: 'Water Leakage in Bathroom G01',
      description: 'Plumbing leak below washbasin in room G01. Bathroom floor is constantly wet.',
      category: 'PLUMBING',
      status: 'RESOLVED',
      severity: 'HIGH',
      createdAt: comp1Created,
      slaDeadline: new Date(comp1Created.getTime() + 24 * 60 * 60 * 1000), // +24h
      resolvedAt: comp1Resolved,
      comments: {
        create: [
          { authorId: owners.rajesh.id, comment: 'Assigned plumber Raju. He will visit by 4 PM today.', createdAt: new Date(comp1Created.getTime() + 1 * 60 * 60 * 1000) },
          { authorId: tenants.priya.id, comment: 'Thank you Rajesh. Plumber fixed it. The leak is gone.', createdAt: comp1Resolved },
        ],
      },
    },
  })

  // 2. Open / In-Progress Complaint (Within SLA)
  const comp2Created = new Date(today)
  comp2Created.setHours(today.getHours() - 6) // 6 hours ago
  await prisma.complaint.create({
    data: {
      propertyId: pg1.id,
      tenantId: tenants.arjun.id,
      title: 'WiFi Connection Intermittent',
      description: 'WiFi signal drops frequently in room G01. Cannot attend meetings properly.',
      category: 'INTERNET',
      status: 'IN_PROGRESS',
      severity: 'MEDIUM',
      createdAt: comp2Created,
      slaDeadline: new Date(comp2Created.getTime() + 24 * 60 * 60 * 1000),
      comments: {
        create: [
          { authorId: owners.rajesh.id, comment: 'Rebooting the main router on Ground Floor. Please check if speed improves.', createdAt: new Date(comp2Created.getTime() + 2 * 60 * 60 * 1000) },
        ],
      },
    },
  })

  // 3. Escalated Complaint (Past 24 Hours SLA SLA Breach!)
  const comp3Created = new Date(today)
  comp3Created.setDate(today.getDate() - 2) // 48 hours ago
  const comp3 = await prisma.complaint.create({
    data: {
      propertyId: pg3.id, // Baner Crest PG
      tenantId: tenants.rohan.id,
      title: 'AC Not Cooling at All',
      description: 'AC unit in room 201 is making clicking sounds and blowing warm air.',
      category: 'ELECTRICAL',
      status: 'OPEN',
      severity: 'HIGH',
      createdAt: comp3Created,
      slaDeadline: new Date(comp3Created.getTime() + 24 * 60 * 60 * 1000),
      isEscalated: true, // Marked escalated since it breached the 24-hour SLA
    },
  })

  console.log('🚩 Seeding Property Flags (For SLA breaches)...')

  // Flag Baner Crest PG due to AC SLA breach
  await prisma.propertyFlag.create({
    data: {
      propertyId: pg3.id,
      type: 'SLA_BREACH',
      reason: `Complaint #${comp3.id} ("AC Not Cooling at All") remained unresolved past the 24-hour SLA.`,
      isActive: true,
      createdAt: new Date(comp3Created.getTime() + 24 * 60 * 60 * 1000),
    },
  })

  console.log('🧼 Seeding Cleaning Tasks...')

  await prisma.cleaningTask.create({
    data: { propertyId: pg1.id, area: 'Common Lounge Area', scheduledDate: today, status: 'PENDING' },
  })
  await prisma.cleaningTask.create({
    data: { propertyId: pg1.id, area: 'Room G01 Bathroom', scheduledDate: yesterdayDate, status: 'COMPLETED', completedAt: yesterdayDate, staffName: 'Sunita' },
  })

  console.log('✍️ Seeding Reviews...')

  await prisma.propertyReview.create({
    data: {
      propertyId: pg1.id,
      tenantId: tenants.priya.id,
      rating: 4.8,
      foodRating: 4,
      amenitiesRating: 5,
      cleanlinessRating: 5,
      staffRating: 5,
      comment: 'Excellent place! Highly professional management, neat and clean facilities. Food is rated 4 stars because breakfast is sometimes delayed, but tastes fresh.',
      isVerifiedResident: true,
    },
  })

  console.log('✅ SQLite Seeding Completed Successfully!')
  
  // Print summary counts
  const userCount = await prisma.user.count()
  const propertyCount = await prisma.property.count()
  const stayCount = await prisma.residentStay.count()
  const foodMenuCount = await prisma.foodMenu.count()
  const complaintCount = await prisma.complaint.count()
  const flagCount = await prisma.propertyFlag.count()
  const payCount = await prisma.rentPayment.count()

  console.log('\n📊 SQLite Seed Stats:')
  console.log(`   👤 Users: ${userCount}`)
  console.log(`   🏢 Properties: ${propertyCount}`)
  console.log(`   🔗 Active Stays: ${stayCount}`)
  console.log(`   🍕 Food Menus: ${foodMenuCount}`)
  console.log(`   ⚠️ Complaints: ${complaintCount}`)
  console.log(`   🚩 Active Flags: ${flagCount}`)
  console.log(`   💳 Rent Payments: ${payCount}`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })