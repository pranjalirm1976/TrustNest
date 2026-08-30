import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const passwordHash = await bcrypt.hash('superadminpranjali', 10)

    // 1. Super Admin
    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@trustnest.in' },
      update: { passwordHash, role: 'SUPER_ADMIN', name: 'Pranjali (Super Admin)' },
      create: {
        name: 'Pranjali (Super Admin)',
        email: 'admin@trustnest.in',
        passwordHash,
        role: 'SUPER_ADMIN'
      }
    })

    // 2. PG Owner
    const owner = await prisma.user.upsert({
      where: { email: 'rajesh@emeraldelite.com' },
      update: { passwordHash, role: 'OWNER', name: 'Rajesh Kumar (PG Owner)' },
      create: {
        name: 'Rajesh Kumar (PG Owner)',
        email: 'rajesh@emeraldelite.com',
        passwordHash,
        role: 'OWNER'
      }
    })

    // 3. Resident
    const tenant = await prisma.user.upsert({
      where: { email: 'priya.sharma@gmail.com' },
      update: { passwordHash, role: 'TENANT', name: 'Priya Sharma' },
      create: {
        name: 'Priya Sharma',
        email: 'priya.sharma@gmail.com',
        passwordHash,
        role: 'TENANT'
      }
    })

    // 4. Create Active Owner Subscription
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const existingSub = await prisma.ownerSubscription.findFirst({
      where: { ownerId: owner.id }
    })

    if (!existingSub) {
      await prisma.ownerSubscription.create({
        data: {
          ownerId: owner.id,
          planName: 'TRUSTNEST_GROWTH',
          amount: 2000,
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: nextMonth,
          invoices: {
            create: [
              {
                amount: 2000,
                status: 'PAID',
                paidAt: new Date(),
                billingMonth: 'August 2026',
              }
            ]
          }
        }
      })
    }

    // 5. Seed Verified PGs
    const propertiesData = [
      {
        name: 'CyberNest Executive Residency',
        description: 'Ultra-modern co-living hub located next to EON Free Zone. Includes high-speed fiber Wi-Fi, 3 daily meals, bi-weekly housekeeping, and 24/7 biometric security.',
        address: 'EON IT Free Zone Road, Kharadi, Pune, Maharashtra 411014',
        latitude: 18.5516,
        longitude: 73.9385,
        priceFrom: 10500,
        gender: 'UNISEX',
        trustScore: 4.7,
        status: 'PUBLISHED',
        coverImage: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
        amenities: ['High-Speed Wi-Fi', 'Air Conditioning', 'Power Backup', 'Daily 3-Meal Food', 'Housekeeping', 'Biometric Security', 'Gym'],
        rooms: [
          { roomNumber: '101', floor: '1st Floor', sharingType: 'DOUBLE', price: 10500, capacity: 2 },
          { roomNumber: '102', floor: '1st Floor', sharingType: 'SINGLE', price: 15000, capacity: 1 },
          { roomNumber: '201', floor: '2nd Floor', sharingType: 'TRIPLE', price: 8500, capacity: 3 }
        ]
      },
      {
        name: 'Emerald Elite Boys PG',
        description: 'Premium techie hostel in Wakad with direct shuttle to Hinjawadi Phase 1 IT Park. Features dedicated study pods, gaming zone, and on-site gym.',
        address: 'Near Datta Mandir, Wakad, Pune, Maharashtra 411057',
        latitude: 18.5987,
        longitude: 73.7654,
        priceFrom: 8500,
        gender: 'MALE',
        trustScore: 4.8,
        status: 'PUBLISHED',
        coverImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
        amenities: ['High-Speed Wi-Fi', 'Gym Access', 'North & South Indian Food', 'Washing Machines', 'RO Water Purifier', 'CCTV 24/7'],
        rooms: [
          { roomNumber: 'B101', floor: 'Ground Floor', sharingType: 'DOUBLE', price: 8500, capacity: 2 },
          { roomNumber: 'B102', floor: '1st Floor', sharingType: 'TRIPLE', price: 7500, capacity: 3 }
        ]
      },
      {
        name: 'Starlight Luxury Girls Stay',
        description: 'Safe, gated luxury residence for working women and students in Baner. 3-tier security with female warden, CCTV, and curated home-cooked meals.',
        address: 'High Street, Baner, Pune, Maharashtra 411045',
        latitude: 18.5590,
        longitude: 73.7868,
        priceFrom: 11000,
        gender: 'FEMALE',
        trustScore: 4.9,
        status: 'PUBLISHED',
        coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
        amenities: ['Female Warden', 'Biometric Entry', 'Daily Housekeeping', 'AC Rooms', 'Attached Balcony', 'High-Speed Wi-Fi'],
        rooms: [
          { roomNumber: 'G101', floor: '1st Floor', sharingType: 'DOUBLE', price: 11000, capacity: 2 },
          { roomNumber: 'G102', floor: '2nd Floor', sharingType: 'SINGLE', price: 16000, capacity: 1 }
        ]
      },
      {
        name: 'Bliss Living PG',
        description: 'Modern co-living space with rooftop cafe and co-working lounge. Ideal for IT professionals working in Hinjawadi Phase 1.',
        address: 'Hinjewadi Phase 1, Pune, Maharashtra 411057',
        latitude: 18.5913,
        longitude: 73.7389,
        priceFrom: 9000,
        gender: 'UNISEX',
        trustScore: 4.6,
        status: 'PUBLISHED',
        coverImage: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
        amenities: ['Rooftop Cafe', 'Co-working Space', 'High-Speed Wi-Fi', 'Food Included', 'Laundry'],
        rooms: [
          { roomNumber: 'BL-1', floor: '1st Floor', sharingType: 'DOUBLE', price: 9000, capacity: 2 }
        ]
      }
    ]

    for (const p of propertiesData) {
      const existingProp = await prisma.property.findFirst({ where: { name: p.name } })
      if (!existingProp) {
        await prisma.property.create({
          data: {
            ownerId: owner.id,
            name: p.name,
            description: p.description,
            address: p.address,
            latitude: p.latitude,
            longitude: p.longitude,
            priceFrom: p.priceFrom,
            gender: p.gender,
            trustScore: p.trustScore,
            status: p.status,
            images: {
              create: [
                { url: p.coverImage, isCover: true, altText: `${p.name} Cover` }
              ]
            },
            amenities: {
              create: p.amenities.map(name => ({ name, isAvailable: true }))
            },
            floors: {
              create: [
                {
                  level: 1,
                  name: '1st Floor',
                  rooms: {
                    create: p.rooms.map((r) => ({
                      roomNumber: r.roomNumber,
                      sharingType: r.sharingType,
                      price: r.price,
                      capacity: r.capacity,
                      beds: {
                        create: Array.from({ length: r.capacity }, (_, i) => ({
                          identifier: `${r.roomNumber}-${String.fromCharCode(65 + i)}`,
                          status: 'VACANT',
                          isTrustNestInventory: true,
                        }))
                      }
                    }))
                  }
                }
              ]
            }
          }
        })
      }
    }

    // 6. Seed Demo SLA Complaints
    const demoProp = await prisma.property.findFirst({ where: { name: 'CyberNest Executive Residency' } })
    if (demoProp) {
      const existingComplaint = await prisma.complaint.findFirst({ where: { propertyId: demoProp.id } })
      if (!existingComplaint) {
        await prisma.complaint.create({
          data: {
            propertyId: demoProp.id,
            tenantId: tenant.id,
            title: 'Water Purifier Filter Maintenance',
            description: 'RO water purifier on 2nd floor pantry requires scheduled filter replacement.',
            category: 'PLUMBING',
            severity: 'MEDIUM',
            status: 'OPEN',
            slaDeadline: new Date(Date.now() + 18 * 60 * 60 * 1000),
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo database seeded successfully with PGs, Owners, Resident, and Subscriptions!',
      superAdmin: 'admin@trustnest.in (Password: superadminpranjali)',
      pgOwner: 'rajesh@emeraldelite.com (Password: superadminpranjali)',
      tenant: 'priya.sharma@gmail.com (Password: superadminpranjali)'
    })
  } catch (error: any) {
    console.error('Seed API error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
