import { User, Property, Floor, Room, Bed } from '@prisma/client'

export type Role = 'TENANT' | 'USER' | 'OWNER' | 'PG_OWNER' | 'SUPER_ADMIN' | 'INSPECTOR'
export type BedStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE'

// Base types from Prisma
export type { User, Property, Floor, Room, Bed }

// Extended types with relations
export type PropertyWithRelations = Property & {
  owner: User
  floors: FloorWithRelations[]
}

export type FloorWithRelations = Floor & {
  property: Property
  rooms: RoomWithRelations[]
}

export type RoomWithRelations = Room & {
  floor: Floor
  beds: Bed[]
}

export type BedWithRelations = Bed & {
  room: RoomWithRelations
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Dashboard types
export interface DashboardStats {
  totalProperties: number
  totalRooms: number
  totalBeds: number
  occupiedBeds: number
  vacantBeds: number
  maintenanceBeds: number
  occupancyRate: number
}

// Search and filter types
export interface PropertyFilters {
  location?: string
  minPrice?: number
  maxPrice?: number
  roomType?: 'SINGLE' | 'SHARED'
  amenities?: string[]
}

export interface BedFilters {
  status?: BedStatus
  roomId?: string
  floorId?: string
  propertyId?: string
}