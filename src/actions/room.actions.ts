'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getBedIdentifier } from '@/lib/property-utils'

export async function updateBedStatus(bedId: string, newStatus: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE') {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'INSPECTOR')) {
      return { success: false, error: 'Unauthorized. Must be an owner.' }
    }

    const bed = await prisma.bed.findUnique({
      where: { id: bedId },
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

    if (!bed) {
      return { success: false, error: 'Bed not found.' }
    }

    if (bed.room.floor.property.ownerId !== session.user.id && session.user.role !== 'INSPECTOR') {
      return { success: false, error: 'Unauthorized. You do not own this property.' }
    }

    const statusToSave = newStatus === 'AVAILABLE' ? 'VACANT' : newStatus

    await prisma.bed.update({
      where: { id: bedId },
      data: { status: statusToSave }
    })

    const propertyId = bed.room.floor.property.id

    revalidatePath(`/pg/${propertyId}`)
    revalidatePath('/search')
    revalidatePath('/')
    revalidatePath('/admin/rooms')
    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/payments')
    revalidatePath('/owner/financials')
    revalidatePath('/owner/analytics')
    revalidatePath('/admin/analytics')

    return { success: true, message: 'Bed status updated successfully.' }
  } catch (error: any) {
    console.error('updateBedStatus error:', error)
    return { success: false, error: error.message || 'Internal server error.' }
  }
}

export async function addFloor(propertyId: string, level: number, name: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'PG_OWNER' && session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'INSPECTOR')) {
      return { success: false, error: 'Unauthorized.' }
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    })

    if (!property) {
      return { success: false, error: 'Property not found.' }
    }

    if (property.ownerId !== session.user.id && session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'INSPECTOR') {
      return { success: false, error: 'Unauthorized. You do not own this property.' }
    }

    const floor = await prisma.floor.create({
      data: {
        propertyId,
        level,
        name,
      }
    })

    revalidatePath(`/pg/${propertyId}`)
    revalidatePath('/admin/floors')
    revalidatePath('/admin/rooms')

    return { success: true, floor, message: 'Floor added successfully.' }
  } catch (error: any) {
    console.error('addFloor error:', error)
    return { success: false, error: error.message || 'Failed to add floor.' }
  }
}

export async function addRoom(floorId: string, data: { roomNumber: string; capacity: number; pricePerBed?: number; hasWashroom?: boolean; hasAc?: boolean; hasBalcony?: boolean }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'PG_OWNER' && session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'INSPECTOR')) {
      return { success: false, error: 'Unauthorized.' }
    }

    const floor = await prisma.floor.findUnique({
      where: { id: floorId },
      include: { property: true }
    })

    if (!floor) return { success: false, error: 'Floor not found' }

    if (floor.property.ownerId !== session.user.id && session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'INSPECTOR') {
      return { success: false, error: 'Unauthorized. You do not own this property.' }
    }

    const room = await prisma.room.create({
      data: {
        floorId,
        roomNumber: data.roomNumber,
        capacity: data.capacity,
        hasWashroom: data.hasWashroom ?? true,
        hasAc: data.hasAc ?? false,
        hasBalcony: data.hasBalcony ?? false,
        pricePerBed: data.pricePerBed || floor.property.priceFrom,
      }
    })

    // Auto-create beds
    const beds = Array.from({ length: data.capacity }, (_, i) => ({
      roomId: room.id,
      identifier: getBedIdentifier(i),
      status: 'VACANT',
      isTrustNestInventory: true
    }))

    await prisma.bed.createMany({ data: beds })

    revalidatePath(`/pg/${floor.propertyId}`)
    revalidatePath('/admin/rooms')
    revalidatePath('/admin/floors')
    revalidatePath('/search')

    return { success: true, room, message: 'Room and beds added successfully.' }
  } catch (error: any) {
    console.error('addRoom error:', error)
    return { success: false, error: error.message || 'Failed to add room.' }
  }
}
