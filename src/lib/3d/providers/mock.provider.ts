import { ThreeDProvider, Create3DJobInput, JobStatusResult } from '../types'

export class MockProvider implements ThreeDProvider {
  public async createJob(input: Create3DJobInput): Promise<{ jobId: string; status: any; initialResult?: JobStatusResult }> {
    const jobId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    
    return {
      jobId,
      status: 'READY_FOR_OWNER_REVIEW',
      initialResult: {
        jobId,
        status: 'READY_FOR_OWNER_REVIEW',
        progress: 100,
        modelUrl: `/models/room_3d_standard_${input.sharingType?.toLowerCase() || 'double'}.glb`,
        thumbnailUrl: input.mediaUrls[0] || 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
        qualityReport: {
          isValid: true,
          qualityScore: 4.8,
          coverageScore: 95,
          elements: [
            { name: 'Door / Entrance View', captured: true, confidence: 0.96 },
            { name: 'Opposite Corner', captured: true, confidence: 0.94 },
            { name: 'Left & Right Walls', captured: true, confidence: 0.90 },
            { name: 'Bed & Wardrobe Setup', captured: true, confidence: 0.92 },
            { name: 'Attached Washroom Entry', captured: true, confidence: 0.88 },
          ],
          warnings: [],
          suggestions: ['Development Mode: Mock 3D Model created for testing without API credit consumption.']
        }
      }
    }
  }

  public async getJobStatus(jobId: string): Promise<JobStatusResult> {
    return {
      jobId,
      status: 'READY_FOR_OWNER_REVIEW',
      progress: 100,
      modelUrl: '/models/room_3d_standard_double.glb',
      thumbnailUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'
    }
  }

  public async cancelJob(jobId: string): Promise<boolean> {
    return true
  }
}
