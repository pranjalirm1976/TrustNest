export type CaptureMethod = 'PHOTO' | 'VIDEO'

export type ProcessingStatus = 
  | 'DRAFT'
  | 'UPLOADING'
  | 'PROCESSING'
  | 'GENERATING_MODEL'
  | 'OPTIMIZING'
  | 'READY_FOR_OWNER_REVIEW'
  | 'OWNER_APPROVED'
  | 'PENDING_ADMIN_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'NEEDS_RECAPTURE'
  | 'FAILED'
  | 'ARCHIVED'

export interface CoverageElement {
  name: string
  captured: boolean
  confidence: number // 0.0 - 1.0
  recommendation?: string
}

export interface MediaQualityReport {
  isValid: boolean
  qualityScore: number // 1.0 - 5.0
  coverageScore: number // 0 - 100%
  elements: CoverageElement[]
  warnings: string[]
  suggestions: string[]
}

export interface ThreeDModelResult {
  jobId: string
  status: ProcessingStatus
  processedModelUrl: string
  thumbnailUrl: string
  qualityReport: MediaQualityReport
  modelVersion: number
  generatedAt: Date
  stages: {
    upload: 'COMPLETED' | 'IN_PROGRESS' | 'WAITING'
    mediaAnalysis: 'COMPLETED' | 'IN_PROGRESS' | 'WAITING'
    frameProcessing: 'COMPLETED' | 'IN_PROGRESS' | 'WAITING'
    reconstruction: 'COMPLETED' | 'IN_PROGRESS' | 'WAITING'
    optimization: 'COMPLETED' | 'IN_PROGRESS' | 'WAITING'
  }
}

export interface PhotoCaptureInput {
  roomId: string
  roomNumber: string
  sharingType: string
  photoUrls: string[]
}

export interface VideoCaptureInput {
  roomId: string
  roomNumber: string
  sharingType: string
  videoUrl: string
  durationSeconds?: number
}
