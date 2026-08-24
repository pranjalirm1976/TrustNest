import { prisma } from './prisma'

export interface TrustScoreBreakdown {
  score: number
  reviewsAvg: number
  foodAvg: number
  totalReviews: number
  totalFoodRatings: number
  slaBreaches: number
  activeFlags: number
  reviewImpact: number
  foodImpact: number
  slaPenalty: number
  flagPenalty: number
}

export async function calculateTrustScore(propertyId: string): Promise<TrustScoreBreakdown> {
  const [reviews, complaints, foodRatings, flags] = await Promise.all([
    prisma.propertyReview.findMany({ where: { propertyId, isVerifiedResident: true } }),
    prisma.complaint.findMany({ where: { propertyId } }),
    prisma.foodRating.findMany({ where: { foodMenu: { propertyId } } }),
    prisma.propertyFlag.findMany({ where: { propertyId, isActive: true } }),
  ])

  // Base review score (weighted 60%)
  const reviewsAvg = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 4.0
  const reviewImpact = reviewsAvg * 0.6

  // Food rating score (weighted 20%)
  const foodAvg = foodRatings.length > 0
    ? foodRatings.reduce((acc, r) => acc + r.rating, 0) / foodRatings.length
    : 4.0
  const foodImpact = foodAvg * 0.2

  // SLA violations (complaints where resolvedAt > slaDeadline, or past deadline unresolved)
  const now = new Date()
  const slaBreaches = complaints.filter(c => {
    if (c.resolvedAt) return c.resolvedAt > c.slaDeadline
    return now > c.slaDeadline
  }).length
  const slaPenalty = slaBreaches * 0.15

  // Active platform flags penalty (0.25 per active flag)
  const activeFlags = flags.length
  const flagPenalty = activeFlags * 0.25

  // Final TrustNest Score (max 5.0, min 0)
  const rawScore = reviewImpact + foodImpact - slaPenalty - flagPenalty
  const score = Number(Math.max(0, Math.min(5, rawScore)).toFixed(2))

  return {
    score,
    reviewsAvg: Number(reviewsAvg.toFixed(2)),
    foodAvg: Number(foodAvg.toFixed(2)),
    totalReviews: reviews.length,
    totalFoodRatings: foodRatings.length,
    slaBreaches,
    activeFlags,
    reviewImpact: Number(reviewImpact.toFixed(2)),
    foodImpact: Number(foodImpact.toFixed(2)),
    slaPenalty: Number(slaPenalty.toFixed(2)),
    flagPenalty: Number(flagPenalty.toFixed(2)),
  }
}
