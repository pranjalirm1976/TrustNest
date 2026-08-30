'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { uploadLocalFile, deleteUploadedFile, validateImageFile } from '@/lib/upload'

/**
 * Validates whether a database user role is authorized to create properties
 */
export function canCreateProperty(role: string): boolean {
  return ['OWNER', 'PG_OWNER', 'SUPER_ADMIN', 'INSPECTOR'].includes(role)
}

/**
 * Generates spreadsheet-style bed identifiers: A, B, ..., Z, AA, AB, ..., AZ, BA, etc.
 */
export function getBedIdentifier(index: number): string {
  let result = ''
  let num = index
  while (num >= 0) {
    result = String.fromCharCode(65 + (num % 26)) + result
    num = Math.floor(num / 26) - 1
  }
  return result
}

interface ParsedFloorInput {
  level: number
  name: string
  layoutUrl?: string | null
}

interface ParsedRoomInput {
  floorLevel: number
  roomNumber: string
  capacity: number
  sharingType: string
  pricePerBed: number
  hasWashroom: boolean
  hasAc: boolean
  hasBalcony: boolean
}

/**
 * Creates and registers a new PG property with complete atomicity inside a Prisma transaction:
 * - Server-side authentication and database role authorization
 * - Strict server-side field, coordinate, and JSON payload validation
 * - Safe file validation with best-effort cleanup on transaction failure
 * - Atomic database transaction with explicit timeouts
 */
export async function registerProperty(formData: FormData) {
  const uploadedFileUrls: string[] = []

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
    const sessionUserId = session.user.id

    if (!sessionEmail && !sessionUserId) {
      return {
        success: false,
        error: 'Invalid session profile. Please sign out and sign in again.'
      }
    }

    // 2. Resolve database user and authorize via database role as source of truth
    const dbUser = sessionEmail
      ? await prisma.user.findUnique({ where: { email: sessionEmail } })
      : await prisma.user.findUnique({ where: { id: sessionUserId } })

    if (!dbUser) {
      return { 
        success: false, 
        error: 'Your owner account was not found in the database. Please sign out and sign in again.' 
      }
    }

    if (!canCreateProperty(dbUser.role)) {
      return { 
        success: false, 
        error: `Access denied. Users with role "${dbUser.role}" cannot register properties.` 
      }
    }

    const resolvedOwnerId = dbUser.id

    // 3. Strict Server-side Validation of Form Fields
    const rawName = formData.get('name')
    const name = typeof rawName === 'string' ? rawName.trim() : ''
    if (!name || name.length < 2 || name.length > 120) {
      return { success: false, error: 'Property name is required and must be between 2 and 120 characters.' }
    }

    const rawAddress = formData.get('address')
    const address = typeof rawAddress === 'string' ? rawAddress.trim() : ''
    if (!address || address.length < 5) {
      return { success: false, error: 'Street address is required and must be at least 5 characters.' }
    }

    const rawCity = formData.get('city')
    const city = typeof rawCity === 'string' ? rawCity.trim() : ''
    if (!city) {
      return { success: false, error: 'City is required.' }
    }

    const rawArea = formData.get('area')
    const area = typeof rawArea === 'string' ? rawArea.trim() : ''
    if (!area) {
      return { success: false, error: 'Locality/Area is required.' }
    }

    const rawPincode = formData.get('pincode')
    const pincode = typeof rawPincode === 'string' ? rawPincode.trim() : ''
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return { success: false, error: 'A valid 6-digit postal code (pincode) is required.' }
    }

    const rawLat = parseFloat(formData.get('latitude') as string)
    const rawLng = parseFloat(formData.get('longitude') as string)
    if (!Number.isFinite(rawLat) || rawLat < -90 || rawLat > 90) {
      return { success: false, error: 'Valid latitude between -90 and 90 is required.' }
    }
    if (!Number.isFinite(rawLng) || rawLng < -180 || rawLng > 180) {
      return { success: false, error: 'Valid longitude between -180 and 180 is required.' }
    }

    const rawPriceFrom = parseFloat(formData.get('priceFrom') as string)
    if (!Number.isFinite(rawPriceFrom) || rawPriceFrom <= 0) {
      return { success: false, error: 'Starting monthly rent must be a positive number.' }
    }

    const rawType = (formData.get('type') as string)?.toLowerCase().trim() || 'coed'
    const allowedTypes = ['boys', 'girls', 'coed', 'male', 'female', 'unisex']
    if (!allowedTypes.includes(rawType)) {
      return { success: false, error: 'Invalid PG gender category selected.' }
    }

    const genderMapping: Record<string, string> = {
      boys: 'MALE',
      male: 'MALE',
      girls: 'FEMALE',
      female: 'FEMALE',
      coed: 'UNISEX',
      unisex: 'UNISEX'
    }
    const gender = genderMapping[rawType] || 'UNISEX'
    const description = ((formData.get('description') as string) || '').trim()
    const fullAddress = `${address}, ${area}, ${city} - ${pincode}`

    // 4. Validate Amenities JSON
    let amenitiesList: string[] = []
    const amenitiesJson = formData.get('amenities') as string | null
    if (amenitiesJson) {
      try {
        const parsed = JSON.parse(amenitiesJson)
        if (!Array.isArray(parsed) || !parsed.every(item => typeof item === 'string')) {
          return { success: false, error: 'Amenities payload must be an array of strings.' }
        }
        amenitiesList = parsed.map(s => s.trim()).filter(Boolean)
      } catch (_) {
        return { success: false, error: 'Invalid amenities JSON format submitted.' }
      }
    }

    // 5. Validate Floors JSON
    let parsedFloors: ParsedFloorInput[] = [
      { level: 0, name: 'Ground Floor' },
      { level: 1, name: '1st Floor' }
    ]
    const floorsJson = formData.get('floors') as string | null
    if (floorsJson) {
      try {
        const customFloors = JSON.parse(floorsJson)
        if (!Array.isArray(customFloors) || customFloors.length === 0) {
          return { success: false, error: 'Floors payload must be a non-empty array.' }
        }
        const validatedFloors: ParsedFloorInput[] = []
        const seenLevels = new Set<number>()

        for (const fl of customFloors) {
          const level = parseInt(fl.level, 10)
          const floorName = typeof fl.name === 'string' ? fl.name.trim() : ''
          if (!Number.isInteger(level)) {
            return { success: false, error: 'Floor level must be an integer.' }
          }
          if (!floorName) {
            return { success: false, error: 'Floor name cannot be empty.' }
          }
          if (seenLevels.has(level)) {
            return { success: false, error: `Duplicate floor level ${level} detected.` }
          }
          seenLevels.add(level)
          validatedFloors.push({ level, name: floorName })
        }
        parsedFloors = validatedFloors
      } catch (err: any) {
        return { success: false, error: err?.message || 'Invalid floors JSON format.' }
      }
    }

    const availableFloorLevels = new Set(parsedFloors.map(f => f.level))

    // 6. Validate Rooms JSON
    let parsedRooms: ParsedRoomInput[] = []
    const roomsJson = formData.get('rooms') as string | null
    if (roomsJson) {
      try {
        const customRooms = JSON.parse(roomsJson)
        if (!Array.isArray(customRooms)) {
          return { success: false, error: 'Rooms payload must be an array.' }
        }

        const seenFloorRoomNumbers = new Set<string>()

        for (const rm of customRooms) {
          const floorLevel = parseInt(rm.floorLevel, 10)
          const roomNumber = typeof rm.roomNumber === 'string' ? rm.roomNumber.trim() : ''
          const capacity = parseInt(rm.capacity, 10)
          const pricePerBed = parseFloat(rm.pricePerBed)

          if (!Number.isInteger(floorLevel) || !availableFloorLevels.has(floorLevel)) {
            return { success: false, error: `Room ${roomNumber || 'Unknown'} references non-existent floor level ${rm.floorLevel}.` }
          }
          if (!roomNumber) {
            return { success: false, error: 'Room number is required for all configured rooms.' }
          }
          if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10) {
            return { success: false, error: `Capacity for room ${roomNumber} must be an integer between 1 and 10.` }
          }
          if (!Number.isFinite(pricePerBed) || pricePerBed <= 0) {
            return { success: false, error: `Price per bed for room ${roomNumber} must be a positive number.` }
          }

          const uniqueKey = `${floorLevel}-${roomNumber}`
          if (seenFloorRoomNumbers.has(uniqueKey)) {
            return { success: false, error: `Duplicate room number "${roomNumber}" on floor level ${floorLevel}.` }
          }
          seenFloorRoomNumbers.add(uniqueKey)

          parsedRooms.push({
            floorLevel,
            roomNumber,
            capacity,
            sharingType: typeof rm.sharingType === 'string' ? rm.sharingType : 'DOUBLE',
            pricePerBed,
            hasWashroom: Boolean(rm.hasWashroom),
            hasAc: Boolean(rm.hasAc),
            hasBalcony: Boolean(rm.hasBalcony),
          })
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Invalid rooms JSON format.' }
      }
    }

    // 7. Process & Validate Image and Layout Uploads (Outside DB Transaction)
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
        const validation = validateImageFile(file)
        if (!validation.valid) {
          return { success: false, error: validation.error || 'Invalid image file.' }
        }
        const url = await uploadLocalFile(file)
        uploadedFileUrls.push(url)
        const isCover = item.isCover && !hasCover
        uploadedImagesList.push({ url, category: item.category, altText: item.alt, isCover })
        if (isCover) hasCover = true
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

    // Process floor blueprint layout files
    for (const fl of parsedFloors) {
      const layoutFile = (formData.get(`floor_layout_${fl.level}`) || formData.get(`floor_layout_${fl.name}`)) as File | null
      if (layoutFile && layoutFile.size > 0) {
        const validation = validateImageFile(layoutFile)
        if (!validation.valid) {
          return { success: false, error: `Floor layout for ${fl.name}: ${validation.error}` }
        }
        const layoutUrl = await uploadLocalFile(layoutFile)
        uploadedFileUrls.push(layoutUrl)
        fl.layoutUrl = layoutUrl
      }
    }

    // 8. Execute Atomic Prisma Transaction (Database Writes Only)
    const createdProperty = await prisma.$transaction(
      async (tx) => {
        // 8a. Create Property
        const property = await tx.property.create({
          data: {
            ownerId: resolvedOwnerId,
            name,
            description,
            address: fullAddress,
            latitude: rawLat,
            longitude: rawLng,
            priceFrom: rawPriceFrom,
            gender,
            trustScore: 4.8,
            status: 'PENDING_VERIFICATION',
          }
        })

        // 8b. Create Property Images
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

        // 8c. Create Amenities
        if (amenitiesList.length > 0) {
          await tx.amenity.createMany({
            data: amenitiesList.map((item) => ({
              propertyId: property.id,
              name: item,
              isAvailable: true,
            }))
          })
        }

        // 8d. Create Floors
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

        // 8e. Create Rooms & Beds with robust bed identifier generation
        if (parsedRooms.length > 0) {
          for (const rm of parsedRooms) {
            const targetFloorId = floorIdMap.get(rm.floorLevel)
            if (!targetFloorId) {
              throw new Error(`Target floor level ${rm.floorLevel} was not initialized in database.`)
            }

            const roomRecord = await tx.room.create({
              data: {
                floorId: targetFloorId,
                roomNumber: rm.roomNumber,
                capacity: rm.capacity,
                sharingType: rm.sharingType,
                pricePerBed: rm.pricePerBed,
                hasWashroom: rm.hasWashroom,
                hasAc: rm.hasAc,
                hasBalcony: rm.hasBalcony,
              }
            })

            const bedData = []
            for (let i = 0; i < rm.capacity; i++) {
              bedData.push({
                roomId: roomRecord.id,
                identifier: getBedIdentifier(i),
                status: 'VACANT',
                isTrustNestInventory: true,
              })
            }

            if (bedData.length > 0) {
              await tx.bed.createMany({ data: bedData })
            }
          }
        }

        return property
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    )

    // 9. Notify Super Admins
    try {
      const superAdmins = await prisma.user.findMany({
        where: { role: 'SUPER_ADMIN' },
        select: { id: true }
      })

      if (superAdmins.length > 0) {
        await prisma.notification.createMany({
          data: superAdmins.map((admin) => ({
            userId: admin.id,
            title: `🔔 New PG Verification Request: ${createdProperty.name}`,
            message: `PG: ${createdProperty.name} | Location: ${address} | Status: PENDING_VERIFICATION.`,
            type: 'SYSTEM'
          }))
        })
      }
    } catch (notifErr) {
      console.warn('Super Admin notification notice:', notifErr)
    }

    // 10. Revalidate Paths
    revalidatePath('/')
    revalidatePath('/search')
    revalidatePath('/admin/properties')
    revalidatePath('/super-admin')
    revalidatePath('/admin/verification')

    return { 
      success: true, 
      propertyId: createdProperty.id,
      message: 'Property successfully registered and submitted for Super Admin verification!' 
    }
  } catch (error: any) {
    console.error('Property registration error:', error)

    // Best-effort cleanup of orphaned uploaded files if transaction failed
    if (uploadedFileUrls.length > 0) {
      for (const fileUrl of uploadedFileUrls) {
        await deleteUploadedFile(fileUrl)
      }
    }

    // Specific Prisma Known Request Error Mapping
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        return {
          success: false,
          error: 'Your owner account could not be verified in the database. Please sign out and sign in again.'
        }
      }
      if (error.code === 'P2002') {
        return {
          success: false,
          error: 'A room or floor with this number already exists for this property.'
        }
      }
      if (error.code === 'P2025') {
        return {
          success: false,
          error: 'A required record was not found while saving. Please try again.'
        }
      }
    }

    return { 
      success: false, 
      error: error?.message || 'Unable to save the PG right now. Please try again.' 
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

    revalidatePath('/')
    revalidatePath('/search')
    revalidatePath(`/pg/${propertyId}`)
    revalidatePath('/super-admin')
    revalidatePath('/admin/verification')

    return { 
      success: true, 
      message: `Property status updated to ${status}.`,
      property 
    }
  } catch (error: any) {
    console.error('verifyProperty error:', error)
    return { 
      success: false, 
      error: error?.message || 'Failed to update property status',
      message: error?.message || 'Failed to update property status'
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
      revalidatePath(`/pg/${review.propertyId}`)
      return { success: true, message: 'Review removed by Super Admin.' }
    }

    return { success: true, message: 'Review kept active.' }
  } catch (error: any) {
    console.error('moderateReview error:', error)
    return { success: false, error: error?.message || 'Failed to moderate review' }
  }
}
