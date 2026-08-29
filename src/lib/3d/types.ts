export type ProviderType = 'tripo' | 'mock'

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

export interface CoverageElement {
  name: string
  captured: boolean
  confidence: number
}

export interface QualityReport {
  isValid: boolean
  qualityScore: number // 1.0 - 5.0
  coverageScore: number // 0 - 100%
  elements: CoverageElement[]
  warnings: string[]
  suggestions: string[]
}

export interface Create3DJobInput {
  roomId: string
  roomNumber: string
  sharingType: string
  captureMethod: 'PHOTO' | 'VIDEO'
  mediaUrls: string[] // Array of photo paths or single video path
  durationSeconds?: number
  templateName?: string
}

export interface JobStatusResult {
  jobId: string
  status: ProcessingStatus
  progress: number // 0 - 100
  modelUrl?: string
  thumbnailUrl?: string
  qualityReport?: QualityReport
  error?: string
}

export interface ThreeDProvider {
  createJob(input: Create3DJobInput): Promise<{ jobId: string; status: ProcessingStatus; initialResult?: JobStatusResult }>
  getJobStatus(jobId: string): Promise<JobStatusResult>
  cancelJob(jobId: string): Promise<boolean>
}
