import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🏢 Seeding additional Pune properties for multi-PG verification...')

  const owner = await prisma.user.findFirst({
    where: { email: 'rajesh@emeraldelite.com' }
  })

  if (!owner) {
    console.error('Owner Rajesh Kumar not found')
    return
  }

  const dummyResidents = await prisma.user.findMany({
    where: { role: 'TENANT' },
    take: 20
  })

  const today = new Date()

  // 1. EMERALD ELITE PG (Wakad - Boys / Male)
  const emeraldPg = await prisma.property.create({
    data: {
      name: 'Emerald Elite Boys PG',
      address: 'Near Datta Mandir, Wakad, Pune, Maharashtra 411057',
      ownerId: owner.id,
      latitude: 18.5986,
      longitude: 73.7634,
      priceFrom: 9000.0,
      gender: 'MALE',
      trustScore: 4.8,
      status: 'PUBLISHED',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', altText: 'Emerald Elite Exterior', isCover: true },
          { url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80', altText: 'Bedrooms', isCover: false },
          { url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80', altText: 'Cafeteria', isCover: false },
        ]
      },
      amenities: {
        create: [
          { name: 'High-Speed Wi-Fi', icon: 'Wifi' },
          { name: 'AC Rooms', icon: 'Wind' },
          { name: 'Nutritious & Hygienic Food', icon: 'Utensils' },
          { name: 'Gymnasium', icon: 'Dumbbell' },
          { name: 'Power Backup', icon: 'Zap' },
          { name: '24x7 Security & CCTV', icon: 'Shield' },
        ]
      },
      services: {
        create: [
          { name: 'Wakad Metro Station', type: 'METRO', distance: '800 m' },
          { name: 'Phoenix Marketcity Wakad', type: 'MALL', distance: '1.2 km' },
          { name: 'Lifepoint Multispecialty Hospital', type: 'HOSPITAL', distance: '1.5 km' },
        ]
      }
    }
  })

  // Floors for Emerald Elite
  const floorG = await prisma.floor.create({
    data: {
      propertyId: emeraldPg.id,
      level: 0,
      name: 'Ground Floor',
      layoutUrl: '/blueprint_ground.jpg',
      facilities: { create: [{ name: 'Gym' }, { name: 'Reception' }] }
    }
  })
  const floor1 = await prisma.floor.create({
    data: {
      propertyId: emeraldPg.id,
      level: 1,
      name: '1st Floor',
      layoutUrl: '/blueprint_1.jpg',
      facilities: { create: [{ name: 'Study Lounge' }, { name: 'Balcony' }] }
    }
  })

  // Rooms & Beds for Emerald Elite
  const emRoom101 = await prisma.room.create({
    data: {
      floorId: floor1.id,
      roomNumber: '101',
      capacity: 2,
      hasWashroom: true,
      hasAc: true,
      pricePerBed: 9500.0,
      amenities: { create: [{ name: 'AC' }, { name: 'Study Table' }] },
      beds: {
        create: [
          { identifier: 'A', status: 'OCCUPIED' },
          { identifier: 'B', status: 'VACANT' },
        ]
      }
    }
  })

  const emRoom102 = await prisma.room.create({
    data: {
      floorId: floor1.id,
      roomNumber: '102',
      capacity: 3,
      hasWashroom: true,
      hasAc: false,
      pricePerBed: 8000.0,
      amenities: { create: [{ name: 'Attached Washroom' }] },
      beds: {
        create: [
          { identifier: 'A', status: 'VACANT' },
          { identifier: 'B', status: 'VACANT' },
          { identifier: 'C', status: 'RESERVED' },
        ]
      }
    }
  })

  // Food Menus for Emerald Elite
  await prisma.foodMenu.create({
    data: {
      propertyId: emeraldPg.id,
      date: today,
      mealType: 'BREAKFAST',
      isVeg: true,
      items: { create: [{ name: 'Poha & Sambhar' }, { name: 'Boiled Eggs' }, { name: 'Masala Chai' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80' }] }
    }
  })
  await prisma.foodMenu.create({
    data: {
      propertyId: emeraldPg.id,
      date: today,
      mealType: 'LUNCH',
      isVeg: true,
      items: { create: [{ name: 'Paneer Butter Masala' }, { name: 'Dal Tadka' }, { name: 'Jeera Rice & Rotis' }, { name: 'Gulab Jamun' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80' }] }
    }
  })

  // Reviews for Emerald Elite
  if (dummyResidents[0]) {
    await prisma.propertyReview.create({
      data: {
        propertyId: emeraldPg.id,
        tenantId: dummyResidents[0].id,
        rating: 4.9,
        foodRating: 5,
        amenitiesRating: 5,
        cleanlinessRating: 5,
        staffRating: 5,
        comment: 'Best boys co-living in Wakad! Gym is well equipped and food quality is consistent every day.',
        isVerifiedResident: true
      }
    })
  }

  // 2. STARLIGHT GIRLS CO-LIVING (Baner - Female)
  const starlightPg = await prisma.property.create({
    data: {
      name: 'Starlight Luxury Girls Stay',
      address: 'High Street, Baner, Pune, Maharashtra 411045',
      ownerId: owner.id,
      latitude: 18.5590,
      longitude: 73.7868,
      priceFrom: 11000.0,
      gender: 'FEMALE',
      trustScore: 4.9,
      status: 'PUBLISHED',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80', altText: 'Starlight Exterior', isCover: true },
          { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', altText: 'Interior Lounge', isCover: false },
        ]
      },
      amenities: {
        create: [
          { name: 'High-Speed Wi-Fi', icon: 'Wifi' },
          { name: 'AC Rooms', icon: 'Wind' },
          { name: 'Biometric Access', icon: 'Key' },
          { name: 'Elevator Access', icon: 'Building' },
          { name: '24/7 Female Warden & CCTV', icon: 'Shield' },
          { name: 'Nutritious & Hygienic Food', icon: 'Utensils' },
        ]
      },
      services: {
        create: [
          { name: 'Baner High Street Cafes', type: 'RESTAURANT', distance: '200 m' },
          { name: 'Jupiter Hospital', type: 'HOSPITAL', distance: '1.1 km' },
        ]
      }
    }
  })

  const starFloor1 = await prisma.floor.create({
    data: {
      propertyId: starlightPg.id,
      level: 1,
      name: '1st Floor',
      layoutUrl: '/blueprint_1.jpg',
      facilities: { create: [{ name: 'Lounge' }, { name: 'Terrace Cafe' }] }
    }
  })

  await prisma.room.create({
    data: {
      floorId: starFloor1.id,
      roomNumber: '101',
      capacity: 2,
      hasWashroom: true,
      hasAc: true,
      pricePerBed: 12000.0,
      amenities: { create: [{ name: 'Smart TV' }, { name: 'AC' }] },
      beds: {
        create: [
          { identifier: 'A', status: 'VACANT' },
          { identifier: 'B', status: 'VACANT' },
        ]
      }
    }
  })

  // Food Menu for Starlight
  await prisma.foodMenu.create({
    data: {
      propertyId: starlightPg.id,
      date: today,
      mealType: 'DINNER',
      isVeg: true,
      items: { create: [{ name: 'Aloo Gobhi Masala' }, { name: 'Yellow Dal' }, { name: 'Phulkas & Rice' }, { name: 'Fruit Custard' }] },
      images: { create: [{ url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80' }] }
    }
  })

  if (dummyResidents[1]) {
    await prisma.propertyReview.create({
      data: {
        propertyId: starlightPg.id,
        tenantId: dummyResidents[1].id,
        rating: 5.0,
        foodRating: 5,
        amenitiesRating: 5,
        cleanlinessRating: 5,
        staffRating: 5,
        comment: 'Extremely safe and clean. Biometric entry gives complete peace of mind. Very peaceful location near Baner high street.',
        isVerifiedResident: true
      }
    })
  }

  // 3. CYBERNEST RESIDENCY (Kharadi - Unisex)
  const cyberPg = await prisma.property.create({
    data: {
      name: 'CyberNest Executive Residency',
      address: 'EON IT Free Zone Road, Kharadi, Pune, Maharashtra 411014',
      ownerId: owner.id,
      latitude: 18.5514,
      longitude: 73.9348,
      priceFrom: 10500.0,
      gender: 'UNISEX',
      trustScore: 4.7,
      status: 'PUBLISHED',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', altText: 'CyberNest Kharadi', isCover: true },
        ]
      },
      amenities: {
        create: [
          { name: 'High-Speed Wi-Fi', icon: 'Wifi' },
          { name: 'AC Rooms', icon: 'Wind' },
          { name: 'Co-working Desks', icon: 'Tv' },
          { name: 'Power Backup', icon: 'Zap' },
        ]
      },
      services: {
        create: [
          { name: 'EON IT Park Gate 1', type: 'IT_PARK', distance: '400 m' },
          { name: 'World Trade Center Pune', type: 'IT_PARK', distance: '600 m' },
        ]
      }
    }
  })

  const cyberFloor1 = await prisma.floor.create({
    data: {
      propertyId: cyberPg.id,
      level: 1,
      name: '1st Floor',
      layoutUrl: '/blueprint_2.jpg',
      facilities: { create: [{ name: 'Common Work Lounge' }] }
    }
  })

  await prisma.room.create({
    data: {
      floorId: cyberFloor1.id,
      roomNumber: '101',
      capacity: 1,
      hasWashroom: true,
      hasAc: true,
      pricePerBed: 14000.0,
      amenities: { create: [{ name: 'Ergonomic Chair' }, { name: 'AC' }] },
      beds: {
        create: [
          { identifier: 'A', status: 'VACANT' }
        ]
      }
    }
  })

  console.log('✅ Seeded Emerald Elite (Wakad), Starlight (Baner), and CyberNest (Kharadi)!')
}

main()
  .catch((e) => console.error('Seeding error:', e))
  .finally(() => prisma.$disconnect())
