export type BedStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED'
export type RoomAvailabilityStatus = 'AVAILABLE' | 'PARTIALLY AVAILABLE' | 'FULL' | 'MAINTENANCE'
export type PGAvailabilityStatus = 'AVAILABLE' | 'LIMITED AVAILABILITY' | 'FULL'

export interface BedData {
  id?: string
  identifier: string
  status: string
}

export interface RoomData {
  id?: string
  roomNumber: string
  capacity: number
  hasWashroom?: boolean
  hasAc?: boolean
  hasBalcony?: boolean
  beds?: BedData[]
}

export interface FloorData {
  id?: string
  level: number
  name: string
  layoutUrl?: string | null
  rooms?: RoomData[]
}

export interface PropertyDataWithFloors {
  id?: string
  floors?: (FloorData & { rooms?: (RoomData & { beds?: BedData[] })[] })[]
}

/**
 * Calculates availability for a single room based on its beds.
 */
export function calculateRoomAvailability(room: RoomData): {
  totalBeds: number
  occupiedBeds: number
  availableBeds: number
  maintenanceBeds: number
  status: RoomAvailabilityStatus
} {
  const beds = room.beds || []
  const totalBeds = beds.length > 0 ? beds.length : room.capacity || 1

  let occupied = 0
  let available = 0
  let maintenance = 0

  if (beds.length === 0) {
    available = totalBeds
  } else {
    for (const bed of beds) {
      const s = bed.status?.toUpperCase()
      if (s === 'OCCUPIED' || s === 'RESERVED') {
        occupied++
      } else if (s === 'MAINTENANCE') {
        maintenance++
      } else {
        available++
      }
    }
  }

  let status: RoomAvailabilityStatus = 'AVAILABLE'
  if (maintenance === totalBeds && totalBeds > 0) {
    status = 'MAINTENANCE'
  } else if (occupied === totalBeds && totalBeds > 0) {
    status = 'FULL'
  } else if (occupied > 0 && available > 0) {
    status = 'PARTIALLY AVAILABLE'
  } else if (available > 0) {
    status = 'AVAILABLE'
  } else {
    status = 'FULL'
  }

  return {
    totalBeds,
    occupiedBeds: occupied,
    availableBeds: available,
    maintenanceBeds: maintenance,
    status
  }
}

/**
 * Calculates overall PG availability across all rooms and floors.
 */
export function calculatePGAvailability(property: PropertyDataWithFloors): {
  totalBeds: number
  occupiedBeds: number
  availableBeds: number
  maintenanceBeds: number
  occupancyPercentage: number
  status: PGAvailabilityStatus
} {
  const floors = property.floors || []
  let totalBeds = 0
  let occupiedBeds = 0
  let availableBeds = 0
  let maintenanceBeds = 0

  for (const floor of floors) {
    const rooms = floor.rooms || []
    for (const room of rooms) {
      const roomMetrics = calculateRoomAvailability(room)
      totalBeds += roomMetrics.totalBeds
      occupiedBeds += roomMetrics.occupiedBeds
      availableBeds += roomMetrics.availableBeds
      maintenanceBeds += roomMetrics.maintenanceBeds
    }
  }

  // If no rooms/beds defined, default to sensible baseline
  if (totalBeds === 0) {
    return {
      totalBeds: 0,
      occupiedBeds: 0,
      availableBeds: 0,
      maintenanceBeds: 0,
      occupancyPercentage: 0,
      status: 'AVAILABLE'
    }
  }

  const occupancyPercentage = Math.round((occupiedBeds / totalBeds) * 100)

  let status: PGAvailabilityStatus = 'AVAILABLE'
  if (availableBeds === 0) {
    status = 'FULL'
  } else if (occupancyPercentage >= 75 || availableBeds <= 5) {
    status = 'LIMITED AVAILABILITY'
  } else {
    status = 'AVAILABLE'
  }

  return {
    totalBeds,
    occupiedBeds,
    availableBeds,
    maintenanceBeds,
    occupancyPercentage,
    status
  }
}
