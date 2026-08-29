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

export async function submitResidentReview(data: {
  propertyId: string
  rating: number
  foodRating: number
  amenitiesRating: number
  cleanlinessRating: number
  staffRating: number
  comment: string
}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'TENANT' && session.user.role !== 'USER')) {
      return { success: false, error: 'Only verified residents can submit property reviews.' }
    }

    // Verify tenant has an active stay in this specific property
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
      return { 
        success: false, 
        error: 'Active stay contract required. Only residents currently staying at this PG can post verified reviews.' 
      }
    }

    // Upsert review to avoid multiple duplicates per tenant
    const review = await prisma.propertyReview.upsert({
      where: {
        propertyId_tenantId: {
          propertyId: data.propertyId,
          tenantId: session.user.id,
        }
      },
      create: {
        propertyId: data.propertyId,
        tenantId: session.user.id,
        rating: data.rating,
        foodRating: data.foodRating,
        amenitiesRating: data.amenitiesRating,
        cleanlinessRating: data.cleanlinessRating,
        staffRating: data.staffRating,
        comment: data.comment,
        isVerifiedResident: true,
      },
      update: {
        rating: data.rating,
        foodRating: data.foodRating,
        amenitiesRating: data.amenitiesRating,
        cleanlinessRating: data.cleanlinessRating,
        staffRating: data.staffRating,
        comment: data.comment,
        isVerifiedResident: true,
      }
    })

    // Recalculate average Trust Score for property
    const allReviews = await prisma.propertyReview.findMany({
      where: { propertyId: data.propertyId }
    })
    const avgScore = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    const roundedScore = parseFloat(avgScore.toFixed(1))

    await prisma.property.update({
      where: { id: data.propertyId },
      data: { trustScore: roundedScore }
    })

    revalidatePath(`/pg/${data.propertyId}`)
    revalidatePath('/search')
    revalidatePath('/')

    return { success: true, message: 'Review submitted successfully!', review }
  } catch (error: any) {
    console.error('submitResidentReview error:', error)
    return { success: false, error: error.message || 'Failed to submit review.' }
  }
}
