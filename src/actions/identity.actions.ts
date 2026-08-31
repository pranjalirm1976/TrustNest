'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export interface UploadDocumentResponse {
  success: boolean
  message: string
  documentId?: string
}

export interface VerifyDocumentResponse {
  success: boolean
  message: string
}

export interface GetDocumentStatusResponse {
  verified: boolean
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_STARTED'
  rejectionReason?: string
  documentType?: string
}

/**
 * Upload identity document for verification
 * Stores file in public/uploads and creates IdentityVerification record
 */
export async function uploadIdentityDocument(
  formData: FormData
): Promise<UploadDocumentResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Authentication required'
      }
    }

    const userId = session.user.id
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string

    if (!file) {
      return {
        success: false,
        message: 'No file provided'
      }
    }

    if (!documentType || !['AADHAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE'].includes(documentType)) {
      return {
        success: false,
        message: 'Invalid document type'
      }
    }

    // Validate file type (only allow images and PDFs)
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        message: 'Only JPEG, PNG, and PDF files are allowed'
      }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        success: false,
        message: 'File size must be less than 5MB'
      }
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'identity-docs')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const filename = `${userId}-${documentType}-${timestamp}.${fileExtension}`
    const filepath = join(uploadsDir, filename)
    const publicUrl = `/uploads/identity-docs/${filename}`

    // Save file
    const bytes = await file.arrayBuffer()
    await writeFile(filepath, Buffer.from(bytes))

    // Create or update IdentityVerification record
    const verification = await prisma.identityVerification.upsert({
      where: { userId },
      update: {
        documentType,
        documentUrl: publicUrl,
        status: 'PENDING',
        verifiedAt: null,
        verifiedBy: null,
        rejectionReason: null
      },
      create: {
        userId,
        documentType,
        documentUrl: publicUrl,
        status: 'PENDING'
      }
    })

    // Log audit event
    await prisma.auditLog.create({
      data: {
        actor: userId,
        role: session.user.role,
        action: 'IDENTITY_DOCUMENT_UPLOADED',
        entity: 'User',
        entityId: userId,
        details: JSON.stringify({ documentType })
      }
    }).catch(() => null)

    revalidatePath('/tenant')
    revalidatePath('/super-admin/verification')

    return {
      success: true,
      message: 'Document uploaded successfully. Awaiting admin verification.',
      documentId: verification.id
    }
  } catch (error) {
    console.error('Upload document error:', error)
    return {
      success: false,
      message: 'Failed to upload document. Please try again.'
    }
  }
}

/**
 * Admin action to verify/approve a user's identity document
 */
export async function verifyIdentityDocument(
  userId: string,
  approved: boolean,
  rejectionReason?: string
): Promise<VerifyDocumentResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
      return {
        success: false,
        message: 'Only admins can verify documents'
      }
    }

    const adminId = session.user.id

    if (!approved && !rejectionReason) {
      return {
        success: false,
        message: 'Rejection reason is required'
      }
    }

    const verification = await prisma.identityVerification.findUnique({
      where: { userId }
    })

    if (!verification) {
      return {
        success: false,
        message: 'Document not found'
      }
    }

    // Update verification status
    await prisma.identityVerification.update({
      where: { userId },
      data: {
        status: approved ? 'VERIFIED' : 'REJECTED',
        verifiedAt: new Date(),
        verifiedBy: adminId,
        rejectionReason: approved ? null : rejectionReason
      }
    })

    // Update user's identity verified status
    if (approved) {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          // Will be used in booking checks
        }
      })
    }

    // Log audit event
    await prisma.auditLog.create({
      data: {
        actor: adminId,
        role: 'SUPER_ADMIN',
        action: approved ? 'IDENTITY_VERIFIED' : 'IDENTITY_REJECTED',
        entity: 'User',
        entityId: userId,
        details: JSON.stringify({ 
          documentType: verification.documentType,
          reason: rejectionReason
        })
      }
    }).catch(() => null)

    revalidatePath('/super-admin/verification')

    return {
      success: true,
      message: `Document ${approved ? 'verified' : 'rejected'} successfully`
    }
  } catch (error) {
    console.error('Verify document error:', error)
    return {
      success: false,
      message: 'Failed to verify document. Please try again.'
    }
  }
}

/**
 * Get user's identity verification status
 */
export async function getIdentityVerificationStatus(): Promise<GetDocumentStatusResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return {
        verified: false,
        status: 'NOT_STARTED'
      }
    }

    const verification = await prisma.identityVerification.findUnique({
      where: { userId: session.user.id }
    })

    if (!verification) {
      return {
        verified: false,
        status: 'NOT_STARTED'
      }
    }

    return {
      verified: verification.status === 'VERIFIED',
      status: verification.status as 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_STARTED',
      rejectionReason: verification.rejectionReason || undefined,
      documentType: verification.documentType
    }
  } catch (error) {
    console.error('Get verification status error:', error)
    return {
      verified: false,
      status: 'NOT_STARTED'
    }
  }
}
