import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ThreeDService } from '@/lib/3d/service'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in.' }, { status: 401 })
    }

    const formData = await req.formData()
    const roomId = (formData.get('roomId') as string) || '101'
    const captureMethod = (formData.get('captureMethod') as 'PHOTO' | 'VIDEO') || 'PHOTO'
    const templateName = (formData.get('templateName') as string) || 'Standard Room 3D View'
    const duration = parseInt(formData.get('duration') as string) || 45

    // 1. Resolve or find room for owner
    let room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { floor: { include: { property: true } } }
    })

    if (!room) {
      const isSuperAdmin = session.user.role === 'SUPER_ADMIN' || session.user.role === 'INSPECTOR'
      const property = await prisma.property.findFirst({
        where: isSuperAdmin ? {} : { ownerId: session.user.id },
        include: {
          floors: {
            include: { rooms: true },
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
            include: { floor: { include: { property: true } } }
          })
        } else {
          room = await prisma.room.create({
            data: {
              floorId: property.floors[0].id,
              roomNumber: cleanNum || '101',
              capacity: 2,
              sharingType: 'DOUBLE'
            },
            include: { floor: { include: { property: true } } }
          })
        }
      }
    }

    if (!room) {
      return NextResponse.json({ success: false, error: 'Room or property not found. Please register a PG first.' }, { status: 404 })
    }

    // 2. Save media files to storage
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', '3d', 'original')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const savedMediaUrls: string[] = []

    if (captureMethod === 'PHOTO') {
      const photoFiles: File[] = []
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('photo_') && value instanceof File && value.size > 0) {
          photoFiles.push(value)
        }
      }

      if (photoFiles.length < 4) {
        return NextResponse.json({ 
          success: false, 
          error: 'Your capture does not contain enough usable information (minimum 4 photos required).' 
        }, { status: 400 })
      }

      for (const file of photoFiles) {
        const ext = path.extname(file.name) || '.jpg'
        const filename = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`
        const filePath = path.join(uploadsDir, filename)
        const buffer = Buffer.from(await file.arrayBuffer())
        fs.writeFileSync(filePath, buffer)
        savedMediaUrls.push(`/uploads/3d/original/${filename}`)
      }
    } else {
      const videoFile = formData.get('video') as File | null
      if (!videoFile || videoFile.size === 0) {
        return NextResponse.json({ success: false, error: 'Please select a valid 30–60s video file.' }, { status: 400 })
      }

      const ext = path.extname(videoFile.name) || '.mp4'
      const filename = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`
      const filePath = path.join(uploadsDir, filename)
      const buffer = Buffer.from(await videoFile.arrayBuffer())
      fs.writeFileSync(filePath, buffer)
      savedMediaUrls.push(`/uploads/3d/original/${filename}`)
    }

    // 3. Trigger 3D Processing Pipeline via ThreeDService
    const jobResponse = await ThreeDService.create3DModel({
      roomId: room.id,
      roomNumber: room.roomNumber,
      sharingType: room.sharingType || 'DOUBLE',
      captureMethod,
      mediaUrls: savedMediaUrls,
      durationSeconds: duration,
      templateName
    })

    const initialResult = jobResponse.initialResult

    // 4. Save Room3DCapture record in database
    const capture = await prisma.room3DCapture.create({
      data: {
        propertyId: room.floor.property.id,
        floorId: room.floor.id,
        roomId: room.id,
        captureMethod,
        status: jobResponse.status,
        originalMediaUrl: JSON.stringify(savedMediaUrls),
        processedModelUrl: initialResult?.modelUrl || `/models/room_3d_standard_${room.sharingType?.toLowerCase() || 'double'}.glb`,
        thumbnailUrl: initialResult?.thumbnailUrl || savedMediaUrls[0] || '/uploads/sample_thumb.jpg',
        mediaQualityScore: initialResult?.qualityReport?.qualityScore || 4.8,
        mediaCoverageScore: initialResult?.qualityReport?.coverageScore || 94,
        coverageDetails: JSON.stringify(initialResult?.qualityReport || {}),
        processingProvider: process.env.THREED_PROVIDER || 'TRIPO_AI',
        processingJobId: jobResponse.jobId,
        templateName,
        ownerApproved: false,
        adminApproved: false
      }
    })

    return NextResponse.json({
      success: true,
      captureId: capture.id,
      jobId: jobResponse.jobId,
      status: capture.status,
      result: initialResult,
      message: '3D Room Model generated successfully! Ready for preview.'
    })
  } catch (error: any) {
    console.error('3D Upload API Error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Failed to process 3D upload.' }, { status: 500 })
  }
}
