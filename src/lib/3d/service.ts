import { ThreeDProvider, Create3DJobInput, JobStatusResult } from './types'
import { TripoProvider } from './providers/tripo.provider'
import { MockProvider } from './providers/mock.provider'

export class ThreeDService {
  private static instance: ThreeDProvider

  public static getProvider(): ThreeDProvider {
    if (!this.instance) {
      const providerType = process.env.THREED_PROVIDER?.toLowerCase() || 'tripo'

      if (providerType === 'mock') {
        this.instance = new MockProvider()
      } else {
        this.instance = new TripoProvider()
      }
    }
    return this.instance
  }

  public static async create3DModel(input: Create3DJobInput) {
    const provider = this.getProvider()
    return provider.createJob(input)
  }

  public static async get3DStatus(jobId: string): Promise<JobStatusResult> {
    const provider = this.getProvider()
    return provider.getJobStatus(jobId)
  }
}
