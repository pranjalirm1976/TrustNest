import { prisma } from './prisma'

export interface TrustScoreDetails {
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

export async function calculateTrustScore(propertyId: string): Promise<TrustScoreDetails> {
  // 1. Fetch reviews
  const reviews = await prisma.propertyReview.findMany({
    where: { propertyId },
  })

  // 2. Fetch food ratings
  const foodMenus = await prisma.foodMenu.findMany({
    where: { propertyId },
    include: {
      ratings: true,
    },
  })
  const foodRatings = foodMenus.flatMap((menu) => menu.ratings)

  // 3. Fetch complaints to calculate SLA breaches
  const complaints = await prisma.complaint.findMany({
    where: { propertyId },
  })

  // 4. Fetch active flags
  const activeFlagsList = await prisma.propertyFlag.findMany({
    where: { propertyId, isActive: true },
  })

  // Calculate Averages
  const totalReviews = reviews.length
  const reviewsAvg = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 5.0 // default base if no reviews

  const totalFoodRatings = foodRatings.length
  const foodAvg = totalFoodRatings > 0
    ? foodRatings.reduce((sum, r) => sum + r.rating, 0) / totalFoodRatings
    : 5.0 // default base if no food ratings

  // Calculate SLA Breaches
  // A breach occurs if resolved late (resolvedAt > slaDeadline) or unresolved and past deadline
  const now = new Date()
  const slaBreaches = complaints.filter((c) => {
    const isLate = c.status === 'RESOLVED' && c.resolvedAt && new Date(c.resolvedAt) > new Date(c.slaDeadline)
    const isOverdue = c.status !== 'RESOLVED' && c.status !== 'REJECTED' && now > new Date(c.slaDeadline)
    return isLate || isOverdue
  }).length

  const activeFlags = activeFlagsList.length

  // Weighted Breakdown (reviews 50%, food 50%)
  const reviewImpact = reviewsAvg * 0.5
  const foodImpact = foodAvg * 0.5
  
  // Penalties
  const slaPenalty = slaBreaches * 0.2
  const flagPenalty = activeFlags * 0.4

  // Final Score Clamped between 1.0 and 5.0
  const calculatedScore = reviewImpact + foodImpact - slaPenalty - flagPenalty
  const score = parseFloat(Math.max(1.0, Math.min(5.0, calculatedScore)).toFixed(2))

  return {
    score,
    reviewsAvg: parseFloat(reviewsAvg.toFixed(2)),
    foodAvg: parseFloat(foodAvg.toFixed(2)),
    totalReviews,
    totalFoodRatings,
    slaBreaches,
    activeFlags,
    reviewImpact: parseFloat(reviewImpact.toFixed(2)),
    foodImpact: parseFloat(foodImpact.toFixed(2)),
    slaPenalty: parseFloat(slaPenalty.toFixed(2)),
    flagPenalty: parseFloat(flagPenalty.toFixed(2)),
  }
}
