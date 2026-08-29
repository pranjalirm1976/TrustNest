'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { uploadLocalFile } from '@/lib/upload'
import { ThreeDProcessingService } from '@/lib/3d-processing'

/**
 * Ensures session is authenticated and retrieves user info.
 */
async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error('Unauthorized. Please sign in.')
  }
  return session
}

/**
 * Resolves a room record by ID, or falls back to owner's property room.
 */
async function resolveRoomForUser(roomId: string, userId: string, role?: string) {
  let room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      floor: {
        include: {
          property: true
        }
      }
    }
  })

  if (!room) {
    // Look up owner's property
    const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'INSPECTOR'
    const property = await prisma.property.findFirst({
      where: isSuperAdmin ? {} : { ownerId: userId },
      include: {
        floors: {
          include: {
            rooms: true
          },
          orderBy: { level: 'asc' }
        }
      }
    })

    if (property && property.floors.length > 0) {
      const allRooms = property.floors.flatMap(f => f.rooms)
      const cleanNum = roomId.replace('rm-', '').replace('r', '')
      const match = allRooms.find(r => r.roomNumber === cleanNum || r.roomNumber === roomId) || allRooms[0]

      if (match) {
        room = await prisma.room.findUnique({
          where: { id: match.id },
          include: {
            floor: {
              include: {
                property: true
              }
            }
          }
        })
      } else {
        const newRoom = await prisma.room.create({
          data: {
            floorId: property.floors[0].id,
            roomNumber: cleanNum || '101',
            capacity: 2,
            sharingType: 'DOUBLE'
          },
          include: {
            floor: {
              include: {
                property: true
              }
            }
          }
        })
        room = newRoom
      }
    }
  }

  return room
}

/**
 * Handles Photo-based 3D Capture submission from PG Owner.
 */
export async function submitRoomPhotoCapture(formData: FormData) {
  try {
    const session = await requireAuth()
    const roomId = (formData.get('roomId') as string) || '101'
    const templateName = (formData.get('templateName') as string) || 'Standard Room 3D View'

    // Verify room ownership using robust resolver
    const room = await resolveRoomForUser(roomId, session.user.id, session.user.role)

    if (!room) {
      return { success: false, error: 'Room not found. Please ensure you have registered a PG property first.' }
    }

    const isOwner = room.floor.property.ownerId === session.user.id
    const isSuperAdmin = session.user.role === 'SUPER_ADMIN' || session.user.role === 'INSPECTOR'

    if (!isOwner && !isSuperAdmin) {
      return { success: false, error: 'Unauthorized. You do not own this property.' }
    }

    // Collect all uploaded photo files
    const photoFiles: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('photo_') && value instanceof File && value.size > 0) {
        photoFiles.push(value)
      }
    }

    if (photoFiles.length < 4) {
      return { 
        success: false, 
        error: 'Your capture does not contain enough usable information. Minimum 4 photos required for 3D generation.' 
      }
    }

    // Save photos to local storage
    const photoUrls: string[] = []
    for (const file of photoFiles) {
      const url = await uploadLocalFile(file)
      photoUrls.push(url)
    }

    // Execute 3D Processing Pipeline
    const result = await ThreeDProcessingService.createModelFromPhotos({
      roomId: room.id,
      roomNumber: room.roomNumber,
      sharingType: room.sharingType || 'DOUBLE',
      photoUrls
    })

    // Upsert Room3DCapture record in database
    const capture = await prisma.room3DCapture.create({
      data: {
        propertyId: room.floor.property.id,
        floorId: room.floor.id,
        roomId: room.id,
        captureMethod: 'PHOTO',
        status: result.status,
        originalMediaUrl: JSON.stringify(photoUrls),
        processedModelUrl: result.processedModelUrl,
        thumbnailUrl: result.thumbnailUrl,
        mediaQualityScore: result.qualityReport.qualityScore,
        mediaCoverageScore: result.qualityReport.coverageScore,
        coverageDetails: JSON.stringify(result.qualityReport),
        processingProvider: 'TRUSTNEST_3D_PIPELINE',
        processingJobId: result.jobId,
        templateName,
        ownerApproved: false,
        adminApproved: false
      }
    })

    revalidatePath('/admin/rooms')
    revalidatePath('/admin/dashboard')
    revalidatePath('/super-admin')

    return {
      success: true,
      captureId: capture.id,
      model: result,
      message: '3D Room Model generated successfully! Ready for owner preview.'
    }
  } catch (error: any) {
    console.error('submitRoomPhotoCapture error:', error)
    return { success: false, error: error.message || 'Failed to process 3D photos.' }
  }
}

/**
 * Handles Video-based 3D Capture submission from PG Owner.
 */
export async function submitRoomVideoCapture(formData: FormData) {
  try {
    const session = await requireAuth()
    const roomId = (formData.get('roomId') as string) || '101'
    const videoFile = formData.get('video') as File | null
    const durationSeconds = parseInt(formData.get('duration') as string) || 45
    const templateName = (formData.get('templateName') as string) || 'Standard Room 3D View'

    if (!videoFile || videoFile.size === 0) {
      return { success: false, error: 'A valid 30-60s video file is required.' }
    }

    // Verify room ownership using robust resolver
    const room = await resolveRoomForUser(roomId, session.user.id, session.user.role)

    if (!room) {
      return { success: false, error: 'Room not found. Please ensure you have registered a PG property first.' }
    }

    const isOwner = room.floor.property.ownerId === session.user.id
    const isSuperAdmin = session.user.role === 'SUPER_ADMIN' || session.user.role === 'INSPECTOR'

    if (!isOwner && !isSuperAdmin) {
      return { success: false, error: 'Unauthorized. You do not own this property.' }
    }

    // Save video file to local storage
    const videoUrl = await uploadLocalFile(videoFile)

    // Execute 3D Processing Pipeline
    const result = await ThreeDProcessingService.createModelFromVideo({
      roomId: room.id,
      roomNumber: room.roomNumber,
      sharingType: room.sharingType || 'DOUBLE',
      videoUrl,
      durationSeconds
    })

    // Upsert Room3DCapture record in database
    const capture = await prisma.room3DCapture.create({
      data: {
        propertyId: room.floor.property.id,
        floorId: room.floor.id,
        roomId: room.id,
        captureMethod: 'VIDEO',
        status: result.status,
        originalMediaUrl: videoUrl,
        processedModelUrl: result.processedModelUrl,
        thumbnailUrl: result.thumbnailUrl,
        mediaQualityScore: result.qualityReport.qualityScore,
        mediaCoverageScore: result.qualityReport.coverageScore,
        coverageDetails: JSON.stringify(result.qualityReport),
        processingProvider: 'TRUSTNEST_3D_PIPELINE',
        processingJobId: result.jobId,
        templateName,
        ownerApproved: false,
        adminApproved: false
      }
    })

    revalidatePath('/admin/rooms')
    revalidatePath('/admin/dashboard')
    revalidatePath('/super-admin')

    return {
      success: true,
      captureId: capture.id,
      model: result,
      message: '3D Room Model generated from video! Ready for owner preview.'
    }
  } catch (error: any) {
    console.error('submitRoomVideoCapture error:', error)
    return { success: false, error: error.message || 'Failed to process 3D video.' }
  }
}

/**
 * Owner approves the generated 3D model and submits it to Super Admin for verification.
 */
export async function ownerApprove3DCapture(captureId: string) {
  try {
    const session = await requireAuth()

    const capture = await prisma.room3DCapture.findUnique({
      where: { id: captureId },
      include: {
        property: true,
        room: true
      }
    })

    if (!capture) {
      return { success: false, error: '3D Capture record not found.' }
    }

    if (capture.property.ownerId !== session.user.id && session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Unauthorized. You do not own this property.' }
    }

    const updated = await prisma.room3DCapture.update({
      where: { id: captureId },
      data: {
        ownerApproved: true,
        ownerApprovedAt: new Date(),
        status: 'PENDING_ADMIN_REVIEW'
      }
    })

    // Notify Super Admin
    revalidatePath('/admin/rooms')
    revalidatePath('/admin/dashboard')
    revalidatePath('/super-admin')

    return {
      success: true,
      message: 'Your 3D room view has been approved and submitted for TrustNest Super Admin verification.'
    }
  } catch (error: any) {
    console.error('ownerApprove3DCapture error:', error)
    return { success: false, error: error.message || 'Failed to approve 3D model.' }
  }
}

/**
 * Allows the owner to assign an approved 3D model to identical rooms with explicit confirmation.
 */
export async function apply3DTemplateToRooms(
  sourceCaptureId: string, 
  targetRoomIds: string[], 
  confirmation: boolean
) {
  try {
    const session = await requireAuth()
    if (!confirmation || targetRoomIds.length === 0) {
      return { success: false, error: 'Explicit confirmation and at least one target room are required.' }
    }

    const source = await prisma.room3DCapture.findUnique({
      where: { id: sourceCaptureId },
      include: { property: true }
    })

    if (!source || source.property.ownerId !== session.user.id) {
      return { success: false, error: 'Unauthorized or source 3D capture not found.' }
    }

    // Replicate capture record for each identical room
    for (const targetRoomId of targetRoomIds) {
      const room = await prisma.room.findUnique({ where: { id: targetRoomId } })
      if (room) {
        await prisma.room3DCapture.create({
          data: {
            propertyId: source.propertyId,
            floorId: room.floorId,
            roomId: room.id,
            captureMethod: source.captureMethod,
            status: source.status,
            originalMediaUrl: source.originalMediaUrl,
            processedModelUrl: source.processedModelUrl,
            thumbnailUrl: source.thumbnailUrl,
            mediaQualityScore: source.mediaQualityScore,
            mediaCoverageScore: source.mediaCoverageScore,
            coverageDetails: source.coverageDetails,
            ownerApproved: source.ownerApproved,
            ownerApprovedAt: new Date(),
            adminApproved: source.adminApproved,
            adminApprovedAt: source.adminApprovedAt,
            templateName: source.templateName || 'Standard Identical Template'
          }
        })
      }
    }

    revalidatePath('/admin/rooms')
    revalidatePath('/super-admin')

    return { 
      success: true, 
      message: `3D Model template successfully applied to ${targetRoomIds.length} identical rooms.` 
    }
  } catch (error: any) {
    console.error('apply3DTemplateToRooms error:', error)
    return { success: false, error: error.message || 'Failed to apply template.' }
  }
}

/**
 * Super Admin Review action to Approve, Reject, or Request Recapture for a 3D Model.
 */
export async function superAdminReview3DModel(
  captureId: string, 
  decision: 'APPROVE' | 'REJECT' | 'RECAPTURE', 
  rejectionReason?: string
) {
  try {
    const session = await requireAuth()
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'INSPECTOR') {
      return { success: false, error: 'Unauthorized. Super Admin authorization required.' }
    }

    const capture = await prisma.room3DCapture.findUnique({
      where: { id: captureId },
      include: {
        property: true,
        room: true
      }
    })

    if (!capture) {
      return { success: false, error: '3D Capture record not found.' }
    }

    const status = decision === 'APPROVE' 
      ? 'PUBLISHED' 
      : decision === 'RECAPTURE' 
      ? 'NEEDS_RECAPTURE' 
      : 'REJECTED'

    const updated = await prisma.room3DCapture.update({
      where: { id: captureId },
      data: {
        status,
        adminApproved: decision === 'APPROVE',
        adminApprovedAt: decision === 'APPROVE' ? new Date() : null,
        adminRejectionReason: rejectionReason || null
      }
    })

    // Notify the PG Owner
    if (capture.property.ownerId) {
      await prisma.notification.create({
        data: {
          userId: capture.property.ownerId,
          title: `3D Model Review: ${decision === 'APPROVE' ? 'Approved & Published' : 'Changes Requested'}`,
          message: decision === 'APPROVE' 
            ? `3D View for Room ${capture.room.roomNumber} (${capture.property.name}) is now live on the public discovery website.`
            : `Feedback for Room ${capture.room.roomNumber}: ${rejectionReason || 'Please capture additional angles.'}`,
          type: 'SYSTEM'
        }
      }).catch(err => console.error('Notification error:', err))
    }

    revalidatePath(`/pg/${capture.propertyId}`)
    revalidatePath('/super-admin')
    revalidatePath('/admin/rooms')

    return {
      success: true,
      message: `3D Model status updated to ${status}.`
    }
  } catch (error: any) {
    console.error('superAdminReview3DModel error:', error)
    return { success: false, error: error.message || 'Failed to review 3D model.' }
  }
}

/**
 * Fetches all 3D captures for Super Admin dashboard.
 */
export async function getSuperAdmin3DCaptures() {
  const session = await requireAuth()
  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'INSPECTOR') {
    throw new Error('Unauthorized')
  }

  return prisma.room3DCapture.findMany({
    include: {
      property: { select: { id: true, name: true, address: true, owner: { select: { name: true, email: true } } } },
      floor: { select: { id: true, name: true, level: true } },
      room: { select: { id: true, roomNumber: true, sharingType: true, capacity: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
}
