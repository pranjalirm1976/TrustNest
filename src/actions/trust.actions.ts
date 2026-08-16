'use server'

import { prisma } from '@/lib/prisma'
import { calculateTrustScore } from '@/lib/trust-score'
import { revalidatePath } from 'next/cache'

export async function evaluatePropertyFlags(propertyId: string) {
  const now = new Date()

  // 1. Check if there are any unresolved complaints past their 24h SLA deadline
  const activeBreaches = await prisma.complaint.findMany({
    where: {
      propertyId,
      status: {
        notIn: ['RESOLVED', 'REJECTED'],
      },
      slaDeadline: {
        lt: now,
      },
    },
  })

  // 2. Check if we already have an active SLA_BREACH flag for this property
  const existingActiveFlag = await prisma.propertyFlag.findFirst({
    where: {
      propertyId,
      type: 'SLA_BREACH',
      isActive: true,
    },
  })

  if (activeBreaches.length > 0 && !existingActiveFlag) {
    // Generate active warning flag
    await prisma.propertyFlag.create({
      data: {
        propertyId,
        type: 'SLA_BREACH',
        reason: 'Unresolved 24h Maintenance SLA breach',
        isActive: true,
      },
    })
  } else if (activeBreaches.length === 0 && existingActiveFlag) {
    // All breaches have been resolved, mark the active flag as resolved/inactive
    await prisma.propertyFlag.updateMany({
      where: {
        propertyId,
        type: 'SLA_BREACH',
        isActive: true,
      },
      data: {
        isActive: false,
        resolvedAt: now,
      },
    })
  }

  // 3. Recalculate cached Trust Score in property table
  const breakdown = await calculateTrustScore(propertyId)
  
  await prisma.property.update({
    where: { id: propertyId },
    data: {
      trustScore: breakdown.score,
    },
  })

  revalidatePath(`/pg/${propertyId}`)
  revalidatePath('/admin/dashboard')
  revalidatePath('/search')
  return breakdown
}
