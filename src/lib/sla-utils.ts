export type SLAType = 'SAFE' | 'DUE_SOON' | 'OVERDUE' | 'RESOLVED'

export function calculateSLAStatus(slaDeadline: Date, resolvedAt: Date | null): { status: SLAType, timeRemaining: string } {
  if (resolvedAt) {
    return { status: 'RESOLVED', timeRemaining: 'Resolved' }
  }

  const now = new Date()
  const diffMs = slaDeadline.getTime() - now.getTime()
  
  if (diffMs < 0) {
    // Overdue
    const overdueHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60))
    return { status: 'OVERDUE', timeRemaining: `OVERDUE BY ${overdueHours}h` }
  }
  
  const hoursLeft = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (hoursLeft <= 4) {
    return { status: 'DUE_SOON', timeRemaining: `${hoursLeft}h remaining` }
  }
  
  return { status: 'SAFE', timeRemaining: `${hoursLeft}h remaining` }
}
