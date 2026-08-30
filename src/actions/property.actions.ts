'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { uploadLocalFile } from '@/lib/upload'

/**
 * Creates and registers a new PG property with complete atomicity inside a Prisma transaction:
 * - Server-side authentication and owner validation
 * - Categorized property photos
 * - Dynamic floors & separate architectural floor layouts
 * - Rooms with capacities, AC/washroom/balcony options, and bed states
 * - Amenities
 * - Publishes to the Homepage & Search discovery listings
 */
export async function registerProperty(formData: FormData) {
  try {
    // 1. Authenticate user server-side
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return { 
        success: false, 
        error: 'Your login session has expired. Please sign in again.' 
      }
    }

    const sessionEmail = session.user.email?.toLowerCase().trim()
    const sessionRole = session.user.role

    // 2. Validate role permissions
    const isAuthorizedRole = 
      sessionRole === 'OWNER' || 
      sessionRole === 'PG_OWNER' || 
      sessionRole === 'SUPER_ADMIN' || 
      sessionRole === 'INSPECTOR'

    if (!isAuthorizedRole) {
      return { 
        success: false, 
        error: 'Access denied. You do not have permissions to register a PG.' 
      }
    }

    // 3. Resolve authenticated owner user in database
    let dbUser = await prisma.user.findFirst({
      where: sessionEmail ? { email: sessionEmail } : { id: session.user.id }
    }).catch(() => null)

    // If user was not found by email, try by ID
    if (!dbUser && session.user.id) {
      dbUser = await prisma.user.findUnique({
        where: { id: session.user.id }
      }).catch(() => null)
    }

    if (!dbUser) {
      return { 
        success: false, 
        error: 'Your owner profile was not found. Please log out and sign in again.' 
      }
    }

    const resolvedOwnerId = dbUser.id

    // 4. Extract and validate property payload from FormData
    const name = (formData.get('name') as string)?.trim() || 'New TrustNest PG'
    const type = (formData.get('type') as string)?.trim() || 'coed'
    const description = (formData.get('description') as string)?.trim() || ''
    const address = (formData.get('address') as string)?.trim() || 'Pune, Maharashtra'
    const city = (formData.get('city') as string)?.trim() || 'Pune'
    const area = (formData.get('area') as string)?.trim() || 'Hinjawadi'
    const pincode = (formData.get('pincode') as string)?.trim() || '411057'
    const lat = parseFloat(formData.get('latitude') as string) || 18.5913
    const lng = parseFloat(formData.get('longitude') as string) || 73.7389
    const priceFrom = parseFloat(formData.get('priceFrom') as string) || 8500
    const amenitiesJson = formData.get('amenities') as string
    const floorsJson = formData.get('floors') as string
    const roomsJson = formData.get('rooms') as string

    let amenitiesList: string[] = ['Wi-Fi', 'AC', 'Food', 'Security']
    if (amenitiesJson) {
      try {
        const parsed = JSON.parse(amenitiesJson)
        if (Array.isArray(parsed)) amenitiesList = parsed
      } catch (_) {}
    }

    const genderMapping: Record<string, string> = {
      boys: 'MALE',
      girls: 'FEMALE',
      coed: 'UNISEX'
    }
    const gender = genderMapping[type.toLowerCase()] || 'UNISEX'
    const fullAddress = `${address}, ${area}, ${city} - ${pincode}`

    // 5. Upload files before transaction to avoid long-lived DB transactions
    const photoCategories = [
      { key: 'photo_exterior', category: 'exterior', isCover: true, alt: `${name} Exterior` },
      { key: 'photo_entrance', category: 'lobby', isCover: false, alt: `${name} Entrance & Lobby` },
      { key: 'photo_common', category: 'common', isCover: false, alt: `${name} Common Area` },
      { key: 'photo_rooms', category: 'bedroom', isCover: false, alt: `${name} Bedroom Layout` },
      { key: 'photo_dining', category: 'dining', isCover: false, alt: `${name} Dining / Canteen` },
      { key: 'photo_facilities', category: 'facilities', isCover: false, alt: `${name} Amenities` },
    ]

    const uploadedImagesList: { url: string; category: string; altText: string; isCover: boolean }[] = []
    let hasCover = false

    for (const item of photoCategories) {
      const file = formData.get(item.key) as File | null
      if (file && file.size > 0) {
        try {
          const url = await uploadLocalFile(file)
          const isCover = item.isCover && !hasCover
          uploadedImagesList.push({
            url,
            category: item.category,
            altText: item.alt,
            isCover,
          })
          if (isCover) hasCover = true
        } catch (err) {
          console.warn(`Failed to upload ${item.key}:`, err)
        }
      }
    }

    if (!hasCover) {
      uploadedImagesList.push({
        url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
        category: 'exterior',
        altText: `${name} Exterior View`,
        isCover: true,
      })
    }

    // Process floors and layout blueprint uploads
    let parsedFloors: { level: number; name: string; layoutUrl?: string | null }[] = [
      { level: 0, name: 'Ground Floor' },
      { level: 1, name: '1st Floor' },
    ]

    if (floorsJson) {
      try {
        const customFloors = JSON.parse(floorsJson)
        if (Array.isArray(customFloors) && customFloors.length > 0) {
          parsedFloors = customFloors
        }
      } catch (_) {}
    }

    for (const fl of parsedFloors) {
      const layoutFile = (formData.get(`floor_layout_${fl.level}`) || formData.get(`floor_layout_${fl.name}`)) as File | null
      if (layoutFile && layoutFile.size > 0) {
        try {
          fl.layoutUrl = await uploadLocalFile(layoutFile)
        } catch (err) {
          console.warn(`Floor layout upload failed for level ${fl.level}:`, err)
        }
      }
    }

    // 6. Execute atomic Prisma transaction
    const createdProperty = await prisma.$transaction(async (tx) => {
      // 6a. Create Property record
      const property = await tx.property.create({
        data: {
          ownerId: resolvedOwnerId,
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

      // 6b. Create Property Images
      if (uploadedImagesList.length > 0) {
        await tx.propertyImage.createMany({
          data: uploadedImagesList.map((img) => ({
            propertyId: property.id,
            url: img.url,
            category: img.category,
            altText: img.altText,
            isCover: img.isCover,
          }))
        })
      }

      // 6c. Create Amenities
      if (amenitiesList.length > 0) {
        await tx.amenity.createMany({
          data: amenitiesList.map((item) => ({
            propertyId: property.id,
            name: item,
            isAvailable: true,
          }))
        })
      }

      // 6d. Create Floors
      const floorIdMap = new Map<number, string>()
      for (const fl of parsedFloors) {
        const floorRecord = await tx.floor.create({
          data: {
            propertyId: property.id,
            level: fl.level,
            name: fl.name,
            layoutUrl: fl.layoutUrl || null,
          }
        })
        floorIdMap.set(fl.level, floorRecord.id)
      }

      // 6e. Create Rooms & Beds
      if (roomsJson) {
        try {
          const customRooms = JSON.parse(roomsJson)
          if (Array.isArray(customRooms) && customRooms.length > 0) {
            for (const rm of customRooms) {
              let targetFloorId = floorIdMap.get(rm.floorLevel)
              if (!targetFloorId && floorIdMap.size > 0) {
                targetFloorId = Array.from(floorIdMap.values())[0]
              }

              if (targetFloorId) {
                const roomRecord = await tx.room.create({
                  data: {
                    floorId: targetFloorId,
                    roomNumber: rm.roomNumber || '101',
                    capacity: rm.capacity || 2,
                    sharingType: rm.sharingType || 'DOUBLE',
                    pricePerBed: rm.pricePerBed || priceFrom,
                    hasWashroom: Boolean(rm.hasWashroom),
                    hasAc: Boolean(rm.hasAc),
                    hasBalcony: Boolean(rm.hasBalcony),
                  }
                })

                const bedCount = rm.capacity || 2
                const bedData = []
                for (let i = 0; i < bedCount; i++) {
                  bedData.push({
                    roomId: roomRecord.id,
                    identifier: String.fromCharCode(65 + i),
                    status: 'VACANT',
                    isTrustNestInventory: true,
                  })
                }
                if (bedData.length > 0) {
                  await tx.bed.createMany({ data: bedData })
                }
              }
            }
          }
        } catch (roomErr) {
          console.warn('Rooms parsing notice:', roomErr)
        }
      }

      return property
    })

    // 7. Notify Super Admins
    try {
      const superAdmins = await prisma.user.findMany({
        where: { role: 'SUPER_ADMIN' },
        select: { id: true }
      }).catch(() => [])

      if (superAdmins.length > 0) {
        await prisma.notification.createMany({
          data: superAdmins.map((admin) => ({
            userId: admin.id,
            title: `🔔 New PG Verification Request: ${createdProperty.name}`,
            message: `PG: ${createdProperty.name} | Location: ${address} | Status: PENDING_VERIFICATION.`,
            type: 'SYSTEM'
          }))
        }).catch(() => null)
      }
    } catch (_) {}

    // 8. Revalidate cached paths
    try {
      revalidatePath('/')
      revalidatePath('/search')
      revalidatePath('/admin/properties')
      revalidatePath('/super-admin')
      revalidatePath('/admin/verification')
    } catch (_) {}

    return { 
      success: true, 
      propertyId: createdProperty.id,
      message: 'Property successfully registered and submitted for Super Admin verification!' 
    }
  } catch (error: any) {
    console.error('Property registration error:', error)
    return { 
      success: false, 
      error: error?.message?.includes('Foreign key')
        ? 'Your owner profile is not registered in the system. Please sign in again.'
        : 'Unable to save the PG right now. Please try again.' 
    }
  }
}

/**
 * Super Admin action to verify, publish, or reject a property
 */
export async function verifyProperty(
  propertyId: string, 
  status: 'VERIFIED' | 'PUBLISHED' | 'REJECTED' | 'CHANGES_REQUIRED' | 'SUSPENDED',
  remarks?: string
) {
  try {
    const property = await prisma.property.update({
      where: { id: propertyId },
      data: { status },
      include: { owner: true }
    })

    try {
      revalidatePath('/')
      revalidatePath('/search')
      revalidatePath(`/pg/${propertyId}`)
      revalidatePath('/super-admin')
      revalidatePath('/admin/verification')
    } catch (_) {}

    return { 
      success: true, 
      message: `Property status updated to ${status}.`,
      property 
    }
  } catch (error: any) {
    console.error('verifyProperty error:', error)
    return { 
      success: false, 
      error: error.message || 'Failed to update property status',
      message: error.message || 'Failed to update property status'
    }
  }
}

/**
 * Super Admin action to suspend a PG
 */
export async function suspendProperty(propertyId: string, reason?: string) {
  return verifyProperty(propertyId, 'SUSPENDED', reason || 'Property suspended due to compliance review.')
}

/**
 * Super Admin action to restore a suspended PG
 */
export async function restoreProperty(propertyId: string) {
  return verifyProperty(propertyId, 'PUBLISHED', 'Property listing restored and published.')
}

/**
 * Moderate user reviews (Keep or Remove)
 */
export async function moderateReview(reviewId: string, action: 'KEEP' | 'REMOVE') {
  try {
    if (action === 'REMOVE') {
      const review = await prisma.propertyReview.delete({
        where: { id: reviewId },
        include: { property: true }
      })
      try {
        revalidatePath(`/pg/${review.propertyId}`)
      } catch (_) {}
      return { success: true, message: 'Review removed by Super Admin.' }
    }

    return { success: true, message: 'Review kept active.' }
  } catch (error: any) {
    console.error('moderateReview error:', error)
    return { success: false, error: error.message || 'Failed to moderate review' }
  }
}
