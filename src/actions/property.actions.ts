'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { uploadLocalFile } from '@/lib/upload'
import { getEmailService } from '@/services/email'

/**
 * Creates and registers a new PG property in Prisma with:
 * - Categorized property photos
 * - Dynamic floors & separate architectural floor layouts
 * - Rooms with capacities, AC/washroom/balcony options, and bed states
 * - Amenities
 * - Publishes to the Homepage & Search discovery listings
 */
export async function registerProperty(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'INSPECTOR')) {
      return { success: false, error: 'Unauthorized. Owner authorization required.' }
    }

    const name = (formData.get('name') as string) || 'New TrustNest PG'
    const type = (formData.get('type') as string) || 'coed'
    const description = (formData.get('description') as string) || ''
    const address = (formData.get('address') as string) || 'Pune, Maharashtra'
    const city = (formData.get('city') as string) || 'Pune'
    const area = (formData.get('area') as string) || 'Hinjawadi'
    const pincode = (formData.get('pincode') as string) || '411057'
    const lat = parseFloat(formData.get('latitude') as string) || 18.5913
    const lng = parseFloat(formData.get('longitude') as string) || 73.7389
    const priceFrom = parseFloat(formData.get('priceFrom') as string) || 8500
    const amenitiesJson = formData.get('amenities') as string
    const floorsJson = formData.get('floors') as string
    const roomsJson = formData.get('rooms') as string

    let amenitiesList: string[] = ['Wi-Fi', 'AC', 'Food', 'Security']
    if (amenitiesJson) {
      try {
        amenitiesList = JSON.parse(amenitiesJson)
      } catch (e) {}
    }

    const genderMapping: Record<string, string> = {
      boys: 'MALE',
      girls: 'FEMALE',
      coed: 'UNISEX'
    }
    const gender = genderMapping[type.toLowerCase()] || 'UNISEX'
    const fullAddress = `${address}, ${area}, ${city} - ${pincode}`

    // 1. Create Property in Prisma
    const property = await prisma.property.create({
      data: {
        ownerId: session.user.id,
        name,
        description,
        address: fullAddress,
        latitude: lat,
        longitude: lng,
        priceFrom,
        gender,
        trustScore: 4.8,
        status: 'PENDING_VERIFICATION',
      }
    })

    // 2. Upload and Save Categorized Property Photos
    const photoCategories = [
      { key: 'photo_exterior', category: 'exterior', isCover: true, alt: `${name} Exterior` },
      { key: 'photo_entrance', category: 'lobby', isCover: false, alt: `${name} Entrance & Lobby` },
      { key: 'photo_common', category: 'common', isCover: false, alt: `${name} Common Area` },
      { key: 'photo_rooms', category: 'bedroom', isCover: false, alt: `${name} Bedroom Layout` },
      { key: 'photo_dining', category: 'dining', isCover: false, alt: `${name} Dining / Canteen` },
      { key: 'photo_facilities', category: 'facilities', isCover: false, alt: `${name} Amenities` },
    ]

    let hasCover = false
    for (const item of photoCategories) {
      const file = formData.get(item.key) as File | null
      if (file && file.size > 0) {
        try {
          const url = await uploadLocalFile(file)
          await prisma.propertyImage.create({
            data: {
              propertyId: property.id,
              url,
              category: item.category,
              altText: item.alt,
              isCover: item.isCover && !hasCover,
            }
          })
          if (item.isCover) hasCover = true
        } catch (err) {
          console.warn(`Failed to upload ${item.key}:`, err)
        }
      }
    }

    // Fallback default cover if none uploaded
    if (!hasCover) {
      await prisma.propertyImage.create({
        data: {
          propertyId: property.id,
          url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
          category: 'exterior',
          altText: `${name} Exterior View`,
          isCover: true,
        }
      })
    }

    // 3. Process Floors and Floor Architectural Layouts
    let parsedFloors: { level: number; name: string; facilities?: string[] }[] = [
      { level: 0, name: 'Ground Floor', facilities: ['Parking', 'Reception', 'Lobby'] },
      { level: 1, name: '1st Floor', facilities: ['Rooms', 'Bathrooms', 'Balcony'] },
    ]

    if (floorsJson) {
      try {
        const customFloors = JSON.parse(floorsJson)
        if (Array.isArray(customFloors) && customFloors.length > 0) {
          parsedFloors = customFloors
        }
      } catch (e) {}
    }

    const createdFloorsMap = new Map<number, string>() // level -> floorId

    for (const fl of parsedFloors) {
      // Check if layout image was uploaded for this floor
      let floorLayoutUrl: string | null = null
      const layoutFile = (formData.get(`floor_layout_${fl.level}`) || formData.get(`floor_layout_${fl.name}`)) as File | null
      if (layoutFile && layoutFile.size > 0) {
        try {
          floorLayoutUrl = await uploadLocalFile(layoutFile)
        } catch (err) {
          console.warn(`Floor layout upload failed for level ${fl.level}:`, err)
        }
      }

      const createdFloor = await prisma.floor.create({
        data: {
          propertyId: property.id,
          level: fl.level,
          name: fl.name,
          layoutUrl: floorLayoutUrl,
        }
      })

      createdFloorsMap.set(fl.level, createdFloor.id)

      // Add facilities
      if (fl.facilities && fl.facilities.length > 0) {
        await prisma.floorFacility.createMany({
          data: fl.facilities.map(fac => ({
            floorId: createdFloor.id,
            name: fac
          }))
        })
      }
    }

    // 4. Process Rooms and Beds
    let parsedRooms: {
      floorLevel: number
      roomNumber: string
      capacity: number
      sharingType?: string
      hasWashroom?: boolean
      hasAc?: boolean
      hasBalcony?: boolean
      pricePerBed?: number
      beds?: { identifier: string; status: string }[]
    }[] = [
      {
        floorLevel: 1,
        roomNumber: '101',
        capacity: 2,
        sharingType: 'DOUBLE',
        hasWashroom: true,
        hasAc: true,
        hasBalcony: false,
        pricePerBed: priceFrom,
        beds: [
          { identifier: 'A', status: 'VACANT' },
          { identifier: 'B', status: 'VACANT' }
        ]
      }
    ]

    if (roomsJson) {
      try {
        const customRooms = JSON.parse(roomsJson)
        if (Array.isArray(customRooms) && customRooms.length > 0) {
          parsedRooms = customRooms
        }
      } catch (e) {}
    }

    for (const rm of parsedRooms) {
      const floorId = createdFloorsMap.get(rm.floorLevel) || Array.from(createdFloorsMap.values())[0]
      if (floorId) {
        const createdRoom = await prisma.room.create({
          data: {
            floorId,
            roomNumber: rm.roomNumber,
            capacity: rm.capacity || 2,
            sharingType: rm.sharingType || (rm.capacity === 1 ? 'SINGLE' : rm.capacity === 2 ? 'DOUBLE' : 'TRIPLE'),
            hasWashroom: rm.hasWashroom ?? true,
            hasAc: rm.hasAc ?? false,
            hasBalcony: rm.hasBalcony ?? false,
            pricePerBed: rm.pricePerBed || priceFrom,
          }
        })

        // Create Beds
        const bedsToCreate = rm.beds && rm.beds.length > 0 
          ? rm.beds 
          : Array.from({ length: rm.capacity || 2 }, (_, i) => ({
              identifier: String.fromCharCode(65 + i),
              status: 'VACANT'
            }))

        await prisma.bed.createMany({
          data: bedsToCreate.map(b => ({
            roomId: createdRoom.id,
            identifier: b.identifier,
            status: b.status || 'VACANT',
            isTrustNestInventory: (b as any).isTrustNestInventory ?? (b.status !== 'OWNER_MANAGED')
          }))
        })
      }
    }

    // 5. Create Amenities
    if (amenitiesList.length > 0) {
      await prisma.amenity.createMany({
        data: amenitiesList.map(item => ({
          propertyId: property.id,
          name: item,
          isAvailable: true,
        }))
      })
    }

    // 6. Notify Super Admins of New PG Verification Request
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' }
    })

    for (const admin of superAdmins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: `🔔 New PG Verification Request: ${property.name}`,
          message: `PG: ${property.name} | Owner: ${session.user.name || 'PG Owner'} | Location: ${address} | Status: PENDING_VERIFICATION. Click to review in Super Admin queue.`,
          type: 'SLA'
        }
      }).catch(err => console.error('Super admin notification error:', err))
    }

    // 7. Non-blocking Email Dispatch
    try {
      const emailService = getEmailService()
      if (session.user.email) {
        emailService.sendPGVerificationSubmitted({
          ownerEmail: session.user.email,
          ownerName: session.user.name || 'PG Owner',
          propertyName: property.name,
          propertyLocation: address
        }).catch(err => console.error('Owner verification email error:', err))
      }

      if (superAdmins[0]?.email) {
        emailService.sendSuperAdminPGAlert({
          adminEmail: superAdmins[0].email,
          ownerName: session.user.name || 'PG Owner',
          propertyName: property.name,
          location: address,
          propertyId: property.id
        }).catch(err => console.error('Super admin email error:', err))
      }
    } catch (emailErr: any) {
      console.warn('Non-blocking PG verification email error:', emailErr.message)
    }

    // 8. Revalidate All Public & Admin Routes
    try {
      revalidatePath('/')
      revalidatePath('/search')
      revalidatePath(`/pg/${property.id}`)
      revalidatePath('/admin/properties')
      revalidatePath('/admin/subscription')
      revalidatePath('/admin/floors')
      revalidatePath('/admin/rooms')
      revalidatePath('/admin/verification')
      revalidatePath('/super-admin')
    } catch (_) {}

    return {
      success: true,
      propertyId: property.id,
      message: 'PG Registered successfully with custom floor plans and availability.'
    }
  } catch (error: any) {
    console.error('registerProperty error:', error)
    return {
      success: false,
      error: error.message || 'Failed to register property'
    }
  }
}

/**
 * Updates an individual floor's architectural layout image
 */
export async function uploadFloorLayout(floorId: string, formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'INSPECTOR')) {
      return { success: false, error: 'Unauthorized.' }
    }

    const file = formData.get('layout') as File | null
    if (!file || file.size === 0) {
      return { success: false, error: 'No layout image provided.' }
    }

    const layoutUrl = await uploadLocalFile(file)

    const updatedFloor = await prisma.floor.update({
      where: { id: floorId },
      data: { layoutUrl },
      include: { property: true }
    })

    revalidatePath(`/pg/${updatedFloor.propertyId}`)
    revalidatePath('/admin/floors')

    return { success: true, layoutUrl, message: 'Floor architectural layout uploaded.' }
  } catch (error: any) {
    console.error('uploadFloorLayout error:', error)
    return { success: false, error: error.message || 'Failed to upload layout' }
  }
}

/**
 * Publishes a PG listing to the public discovery platform
 */
export async function publishProperty(propertyId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'INSPECTOR')) {
      return { success: false, error: 'Unauthorized.' }
    }

    const property = await prisma.property.update({
      where: { id: propertyId },
      data: { status: 'PUBLISHED' }
    })

    revalidatePath('/')
    revalidatePath('/search')
    revalidatePath(`/pg/${propertyId}`)
    revalidatePath('/admin/verification')

    return { success: true, message: 'Property published to Homepage and Search listings.' }
  } catch (error: any) {
    console.error('publishProperty error:', error)
    return { success: false, error: error.message || 'Failed to publish property' }
  }
}
