'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function addOwnerReply(reviewId: string, reply: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'OWNER') {
      return { success: false, error: 'Unauthorized' }
    }

    const review = await prisma.propertyReview.findUnique({
      where: { id: reviewId },
      include: { property: true }
    })

    if (!review) {
      return { success: false, error: 'Review not found.' }
    }

    if (review.property.ownerId !== session.user.id) {
      return { success: false, error: 'Unauthorized. You do not own this property.' }
    }

    // Since the schema has no dedicated `ownerReply` field, we append it to the comment.
    const newComment = review.comment + `\n\n--- Owner Reply ---\n${reply}`

    await prisma.propertyReview.update({
      where: { id: reviewId },
      data: { comment: newComment }
    })

    // Notify tenant that owner replied
    if (review.tenantId) {
      await prisma.notification.create({
        data: {
          userId: review.tenantId,
          title: `Owner Replied to Your Review`,
          message: `The owner of ${review.property.name} replied: "${reply.slice(0, 70)}..."`,
          type: 'SYSTEM'
        }
      }).catch(err => console.error('Notification error:', err))
    }

    revalidatePath('/admin/reviews')
    revalidatePath('/admin/performance')
    revalidatePath(`/pg/${review.propertyId}`)

    return { success: true, message: 'Reply added successfully.' }
  } catch (error: any) {
    console.error('addOwnerReply error:', error)
    return { success: false, error: error.message || 'Internal server error.' }
  }
}
