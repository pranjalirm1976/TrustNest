'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { evaluatePropertyFlags } from './trust.actions'
import { getEmailService } from '@/services/email'

// Existing functions
interface CreateComplaintInput {
  title: string
  description: string
  category: string
  severity: string
  propertyId: string
}

export async function createComplaint(data: CreateComplaintInput) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'TENANT' && session.user.role !== 'USER')) {
    throw new Error('Unauthorized. Resident authorization required.')
  }

  // Verify resident is currently residing in this PG
  const activeStay = await prisma.residentStay.findFirst({
    where: {
      tenantId: session.user.id,
      status: 'ACTIVE',
      bed: {
        room: {
          floor: {
            propertyId: data.propertyId
          }
        }
      }
    }
  })

  if (!activeStay) {
    throw new Error('Unauthorized. You can only raise complaints for the PG you are currently residing in.')
  }

  const now = new Date()
  const slaDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const complaint = await prisma.complaint.create({
    data: {
      tenantId: session.user.id,
      propertyId: data.propertyId,
      title: data.title,
      description: data.description,
      category: data.category,
      severity: data.severity,
      slaDeadline,
    },
    include: {
      property: {
        include: { owner: true }
      }
    }
  })

  // Notify Owner
  if (complaint.property?.ownerId) {
    await prisma.notification.create({
      data: {
        userId: complaint.property.ownerId,
        title: `🚨 24h SLA Complaint Raised: ${data.title}`,
        message: `Resident raised a ${data.category} complaint for ${complaint.property.name}. Resolution deadline: ${slaDeadline.toLocaleTimeString('en-IN')}.`,
        type: 'SLA'
      }
    }).catch(err => console.error('Notification error:', err))

    // Non-blocking Email Dispatch
    try {
      if (complaint.property.owner?.email) {
        getEmailService().sendComplaintNotification({
          recipientEmail: complaint.property.owner.email,
          recipientName: complaint.property.owner.name || 'PG Owner',
          propertyName: complaint.property.name,
          complaintTitle: data.title,
          category: data.category,
          slaDeadline,
          isOwner: true
        }).catch(err => console.error('Complaint email error:', err))
      }
    } catch (_) {}
  }

  revalidatePath('/tenant/complaints')
  revalidatePath('/tenant/dashboard')
  revalidatePath('/admin/complaints')
  revalidatePath('/super-admin')
  return complaint
}

export async function addComplaintComment(complaintId: string, text: string) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')
  const newComment = await prisma.complaintComment.create({
    data: {
      complaintId,
      authorId: session.user.id,
      comment: text,
    },
    include: { author: true },
  })
  revalidatePath('/tenant/complaints')
  revalidatePath('/admin/complaints')
  return newComment
}

export async function updateComplaintStatus(complaintId: string, status: string) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'PG_OWNER' && session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'INSPECTOR')) {
    throw new Error('Unauthorized. Owner or Super Admin authorization required.')
  }

  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: { property: true }
  })

  if (!complaint) {
    throw new Error('Complaint not found.')
  }

  // If PG_OWNER, verify property ownership
  if (session.user.role === 'OWNER' || session.user.role === 'PG_OWNER') {
    if (complaint.property.ownerId !== session.user.id) {
      throw new Error('Unauthorized. You can only manage complaints for your own PG.')
    }
  }

  const resolvedAt = status === 'RESOLVED' ? new Date() : null
  const updated = await prisma.complaint.update({
    where: { id: complaintId },
    data: { status, resolvedAt },
  })
  await evaluatePropertyFlags(updated.propertyId)
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/complaints')
  revalidatePath('/tenant/dashboard')
  revalidatePath('/tenant/complaints')
  revalidatePath('/super-admin')
  return updated
}

interface CreateFoodMenuInput {
  propertyId: string
  mealType: string
  isVeg: boolean
  items: string[]
  imageUrl: string
}

export async function createFoodMenu(data: CreateFoodMenuInput) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'INSPECTOR')) {
    throw new Error('Unauthorized. Admin authorization required.')
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  await prisma.foodMenu.deleteMany({
    where: { propertyId: data.propertyId, date: today, mealType: data.mealType },
  })
  const newMenu = await prisma.foodMenu.create({
    data: {
      propertyId: data.propertyId,
      date: today,
      mealType: data.mealType,
      isVeg: data.isVeg,
      items: { create: data.items.map((name) => ({ name })) },
      images: { create: { url: data.imageUrl } },
    },
  })
  revalidatePath('/food')
  revalidatePath('/admin/dashboard')
  return newMenu
}

// ---- NEWLY REQUESTED ACTIONS ----

export async function submitComplaint(data: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'TENANT') {
      return { success: false, error: 'Unauthorized. Resident authorization required.' }
    }

    const category = data.get('category') as string
    const description = data.get('description') as string
    const propertyId = data.get('propertyId') as string
    const title = (data.get('title') as string) || 'New Complaint'

    if (!category || !description || !propertyId) {
      return { success: false, error: 'Missing required fields.' }
    }

    const now = new Date()
    const slaDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const complaint = await prisma.complaint.create({
      data: {
        tenantId: session.user.id,
        propertyId,
        title,
        description,
        category,
        slaDeadline,
      },
      include: { property: true }
    })

    // Notify the property owner of the new complaint
    if (complaint.property?.ownerId) {
      await prisma.notification.create({
        data: {
          userId: complaint.property.ownerId,
          title: `New SLA Ticket: ${title}`,
          message: `Resident raised a ${category} complaint: "${description.slice(0, 70)}..."`,
          type: 'COMPLAINT'
        }
      }).catch(err => console.error('Notification creation error:', err))
    }

    revalidatePath('/tenant/complaints')
    revalidatePath('/admin/complaints')
    return { success: true, complaint }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function addComplaintReply(complaintId: string, message: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { property: true }
    })

    if (!complaint) return { success: false, error: 'Complaint not found.' }

    if (session.user.role === 'OWNER' && complaint.property.ownerId !== session.user.id) {
      return { success: false, error: 'Unauthorized.' }
    }
    if (session.user.role === 'TENANT' && complaint.tenantId !== session.user.id) {
      return { success: false, error: 'Unauthorized.' }
    }

    const newComment = await prisma.complaintComment.create({
      data: {
        complaintId,
        authorId: session.user.id,
        comment: message,
      }
    })
    
    // Also update the updatedAt timestamp on the complaint itself to bump it
    await prisma.complaint.update({
      where: { id: complaintId },
      data: { 
        updatedAt: new Date(),
        status: complaint.status === 'OPEN' && session.user.role === 'OWNER' ? 'IN_PROGRESS' : undefined
      }
    })

    // Notify the recipient
    const recipientId = session.user.role === 'OWNER' ? complaint.tenantId : complaint.property.ownerId
    if (recipientId) {
      await prisma.notification.create({
        data: {
          userId: recipientId,
          title: `Update on Ticket: ${complaint.title}`,
          message: `${session.user.name || 'User'}: "${message.slice(0, 70)}..."`,
          type: 'COMPLAINT'
        }
      }).catch(err => console.error('Notification creation error:', err))
    }

    revalidatePath('/tenant/complaints')
    revalidatePath('/admin/complaints')
    return { success: true, comment: newComment }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function resolveComplaint(complaintId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'OWNER') {
      return { success: false, error: 'Unauthorized. Admin authorization required.' }
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { property: true }
    })

    if (!complaint || complaint.property.ownerId !== session.user.id) {
      return { success: false, error: 'Unauthorized or not found' }
    }

    const updated = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Notify the tenant that their complaint has been resolved
    await prisma.notification.create({
      data: {
        userId: complaint.tenantId,
        title: `Ticket Resolved: ${complaint.title}`,
        message: `Your complaint for ${complaint.category} has been marked as resolved by the property management.`,
        type: 'COMPLAINT'
      }
    }).catch(err => console.error('Notification creation error:', err))

    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/complaints')
    revalidatePath('/tenant/dashboard')
    revalidatePath('/tenant/complaints')
    return { success: true, complaint: updated }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
