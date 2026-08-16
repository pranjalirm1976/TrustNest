'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { evaluatePropertyFlags } from './trust.actions'

interface CreateComplaintInput {
  title: string
  description: string
  category: string
  severity: string
  propertyId: string
}

export async function createComplaint(data: CreateComplaintInput) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'TENANT') {
    throw new Error('Unauthorized. Resident authorization required.')
  }

  const now = new Date()
  // Enforce contract backed 24-hour SLA deadline calculation programmatically
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
  })

  revalidatePath('/tenant/complaints')
  revalidatePath('/tenant/dashboard')
  return complaint
}

export async function addComplaintComment(complaintId: string, text: string) {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error('Unauthorized')
  }

  const newComment = await prisma.complaintComment.create({
    data: {
      complaintId,
      authorId: session.user.id,
      comment: text,
    },
    include: {
      author: true,
    },
  })

  revalidatePath('/tenant/complaints')
  return newComment
}

export async function updateComplaintStatus(complaintId: string, status: string) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.role !== 'OWNER' && session.user.role !== 'INSPECTOR')) {
    throw new Error('Unauthorized. Admin authorization required.')
  }

  const resolvedAt = status === 'RESOLVED' ? new Date() : null

  const updated = await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      status,
      resolvedAt,
    },
  })

  // Programmatically trigger SLA flags & cached TrustScore recalculation on status update
  await evaluatePropertyFlags(updated.propertyId)

  revalidatePath('/admin/dashboard')
  revalidatePath('/tenant/dashboard')
  revalidatePath('/tenant/complaints')
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

  // Overwrite today's menu if it already exists to prevent key violations
  await prisma.foodMenu.deleteMany({
    where: {
      propertyId: data.propertyId,
      date: today,
      mealType: data.mealType,
    },
  })

  const newMenu = await prisma.foodMenu.create({
    data: {
      propertyId: data.propertyId,
      date: today,
      mealType: data.mealType,
      isVeg: data.isVeg,
      items: {
        create: data.items.map((name) => ({ name })),
      },
      images: {
        create: {
          url: data.imageUrl,
        },
      },
    },
  })

  revalidatePath('/food')
  revalidatePath('/admin/dashboard')
  return newMenu
}
