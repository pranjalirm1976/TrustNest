'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export interface CreateAgreementInput {
  propertyId: string
  trustNestBedCount: number
  selectedBedIds: string[] // Array of bed IDs TrustNest will manage
  agreementStartDate: string // ISO date
  agreementEndDate?: string // ISO date
  agreementText?: string // Custom terms
}

export interface AcceptAgreementResponse {
  success: boolean
  message: string
}

export interface GetAgreementResponse {
  agreement: {
    id: string
    propertyId: string
    trustNestBedCount: number
    status: string
    agreementStartDate: string
    agreementEndDate?: string
    acceptedAt?: string
    agreementText: string
  } | null
  bedCount: number
  availableBeds: Array<{
    id: string
    identifier: string
    roomNumber: string
    isTrustNestInventory: boolean
    status: string
  }>
}

const DEFAULT_AGREEMENT_TEXT = `
TRUSTNEST INVENTORY ALLOCATION AGREEMENT

This agreement outlines the allocation of beds/rooms on the property for TrustNest platform management.

1. ALLOCATION
   - Total TrustNest Managed Beds: [COUNT]
   - Agreement Period: [START_DATE] to [END_DATE]
   - Selected beds will be exclusively listed on the TrustNest platform for online booking

2. RESPONSIBILITIES
   - TrustNest: Online marketing, tenant screening, complaint resolution
   - Owner: Property maintenance, utilities, compliance with local regulations

3. COMMISSION
   - TrustNest retains 10% commission on successful bookings
   - Owner receives 90% of booking amount

4. CANCELLATION
   - Either party may cancel with 30 days written notice
   - Existing bookings will be honored

5. COMPLIANCE
   - Owner agrees to follow TrustNest terms and conditions
   - Property must meet TrustNest quality standards

By accepting this agreement, you consent to the terms outlined above.
`.trim()

/**
 * Admin action to create/propose inventory agreement to owner
 */
export async function createInventoryAgreement(
  input: CreateAgreementInput
): Promise<AcceptAgreementResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user.role !== 'SUPER_ADMIN') {
      return {
        success: false,
        message: 'Only admins can create agreements'
      }
    }

    // Verify property exists and owner
    const property = await prisma.property.findUnique({
      where: { id: input.propertyId }
    })

    if (!property) {
      return {
        success: false,
        message: 'Property not found'
      }
    }

    // Verify beds exist and belong to property
    const bedsCount = await prisma.bed.count({
      where: {
        id: { in: input.selectedBedIds },
        room: {
          floor: {
            propertyId: input.propertyId
          }
        }
      }
    })

    if (bedsCount !== input.selectedBedIds.length) {
      return {
        success: false,
        message: 'One or more selected beds do not belong to this property'
      }
    }

    const startDate = new Date(input.agreementStartDate)
    const endDate = input.agreementEndDate 
      ? new Date(input.agreementEndDate)
      : null

    // Create or update agreement
    const agreement = await prisma.inventoryAgreement.upsert({
      where: {
        propertyId_ownerId: {
          propertyId: input.propertyId,
          ownerId: property.ownerId
        }
      },
      update: {
        trustNestBedCount: input.trustNestBedCount,
        selectedBeds: JSON.stringify(input.selectedBedIds),
        agreementStartDate: startDate,
        agreementEndDate: endDate,
        status: 'ACTIVE',
        agreementText: input.agreementText || DEFAULT_AGREEMENT_TEXT.replace('[COUNT]', input.trustNestBedCount.toString())
          .replace('[START_DATE]', startDate.toDateString())
          .replace('[END_DATE]', endDate?.toDateString() || 'Ongoing')
      },
      create: {
        propertyId: input.propertyId,
        ownerId: property.ownerId,
        trustNestBedCount: input.trustNestBedCount,
        selectedBeds: JSON.stringify(input.selectedBedIds),
        agreementStartDate: startDate,
        agreementEndDate: endDate,
        status: 'ACTIVE',
        agreementText: input.agreementText || DEFAULT_AGREEMENT_TEXT.replace('[COUNT]', input.trustNestBedCount.toString())
          .replace('[START_DATE]', startDate.toDateString())
          .replace('[END_DATE]', endDate?.toDateString() || 'Ongoing'),
        acceptedAt: new Date(),
        acceptedBy: property.ownerId
      }
    })

    // Mark selected beds as TrustNest inventory
    await prisma.bed.updateMany({
      where: {
        id: { in: input.selectedBedIds }
      },
      data: {
        isTrustNestInventory: true
      }
    })

    // Log audit event
    await prisma.auditLog.create({
      data: {
        actor: session.user.id,
        role: 'SUPER_ADMIN',
        action: 'INVENTORY_AGREEMENT_CREATED',
        entity: 'Property',
        entityId: input.propertyId,
        details: JSON.stringify({
          bedCount: input.trustNestBedCount,
          bedIds: input.selectedBedIds
        })
      }
    }).catch(() => null)

    revalidatePath(`/owner/properties/${input.propertyId}`)
    revalidatePath('/super-admin/inventory-management')

    return {
      success: true,
      message: 'Inventory agreement created successfully'
    }
  } catch (error) {
    console.error('Create agreement error:', error)
    return {
      success: false,
      message: 'Failed to create inventory agreement'
    }
  }
}

/**
 * Owner action to accept inventory agreement
 */
export async function acceptInventoryAgreement(
  propertyId: string
): Promise<AcceptAgreementResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Authentication required'
      }
    }

    const userId = session.user.id

    // Verify property ownership
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    })

    if (!property || property.ownerId !== userId) {
      return {
        success: false,
        message: 'Property not found or access denied'
      }
    }

    // Find agreement
    const agreement = await prisma.inventoryAgreement.findUnique({
      where: {
        propertyId_ownerId: {
          propertyId,
          ownerId: userId
        }
      }
    })

    if (!agreement) {
      return {
        success: false,
        message: 'No pending agreement for this property'
      }
    }

    // Accept agreement
    await prisma.inventoryAgreement.update({
      where: { id: agreement.id },
      data: {
        status: 'ACTIVE',
        acceptedAt: new Date(),
        acceptedBy: userId
      }
    })

    // Mark beds as TrustNest inventory
    const selectedBedIds = JSON.parse(agreement.selectedBeds) as string[]
    await prisma.bed.updateMany({
      where: {
        id: { in: selectedBedIds }
      },
      data: {
        isTrustNestInventory: true
      }
    })

    // Log audit event
    await prisma.auditLog.create({
      data: {
        actor: userId,
        role: session.user.role,
        action: 'INVENTORY_AGREEMENT_ACCEPTED',
        entity: 'Property',
        entityId: propertyId,
        details: JSON.stringify({
          bedCount: agreement.trustNestBedCount
        })
      }
    }).catch(() => null)

    revalidatePath(`/owner/properties/${propertyId}`)

    return {
      success: true,
      message: 'Agreement accepted successfully. Your beds are now available on TrustNest.'
    }
  } catch (error) {
    console.error('Accept agreement error:', error)
    return {
      success: false,
      message: 'Failed to accept agreement'
    }
  }
}

/**
 * Get inventory agreement for property
 */
export async function getInventoryAgreement(
  propertyId: string
): Promise<GetAgreementResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return {
        agreement: null,
        bedCount: 0,
        availableBeds: []
      }
    }

    const userId = session.user.id

    // Verify property ownership
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    })

    if (!property || (property.ownerId !== userId && session.user.role !== 'SUPER_ADMIN')) {
      return {
        agreement: null,
        bedCount: 0,
        availableBeds: []
      }
    }

    // Get agreement
    const agreement = await prisma.inventoryAgreement.findUnique({
      where: {
        propertyId_ownerId: {
          propertyId,
          ownerId: property.ownerId
        }
      }
    })

    // Get all beds for property
    const beds = await prisma.bed.findMany({
      where: {
        room: {
          floor: {
            propertyId
          }
        }
      },
      include: {
        room: true
      }
    })

    const availableBeds = beds.map(bed => ({
      id: bed.id,
      identifier: bed.identifier,
      roomNumber: bed.room.roomNumber,
      isTrustNestInventory: bed.isTrustNestInventory,
      status: bed.status
    }))

    return {
      agreement: agreement ? {
        id: agreement.id,
        propertyId: agreement.propertyId,
        trustNestBedCount: agreement.trustNestBedCount,
        status: agreement.status,
        agreementStartDate: agreement.agreementStartDate.toISOString(),
        agreementEndDate: agreement.agreementEndDate?.toISOString(),
        acceptedAt: agreement.acceptedAt?.toISOString(),
        agreementText: agreement.agreementText
      } : null,
      bedCount: beds.length,
      availableBeds
    }
  } catch (error) {
    console.error('Get agreement error:', error)
    return {
      agreement: null,
      bedCount: 0,
      availableBeds: []
    }
  }
}
