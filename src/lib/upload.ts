import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']

/**
 * Validates file size and MIME type before saving
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file || file.size === 0) {
    return { valid: false, error: 'File is empty.' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File "${file.name}" exceeds the maximum allowed size of 5MB.` }
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
    return { valid: false, error: `File "${file.name}" has unsupported format (${file.type}). Allowed formats: JPG, PNG, WEBP, AVIF.` }
  }

  return { valid: true }
}

/**
 * Utility to save an uploaded File object.
 * In serverless environments (e.g. Vercel read-only filesystem), encodes directly as base64 Data URL.
 * In local persistent environments, writes to /public/uploads/ and falls back to base64 Data URL on any filesystem error.
 */
export async function uploadLocalFile(file: File): Promise<string> {
  try {
    const validation = validateImageFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const mimeType = file.type || 'image/jpeg'

    // If running on Vercel or other read-only serverless environment, use self-contained base64 data URL
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
    if (isServerless) {
      const base64 = buffer.toString('base64')
      return `data:${mimeType};base64,${base64}`
    }

    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadDir, { recursive: true })

      const ext = path.extname(file.name).toLowerCase() || '.jpg'
      const fileName = `${crypto.randomUUID()}${ext}`
      const filepath = path.join(uploadDir, fileName)

      await writeFile(filepath, buffer)
      return `/uploads/${fileName}`
    } catch (fsError: any) {
      // Graceful fallback for read-only filesystems (EROFS) in production serverless containers
      console.warn('Local filesystem write failed, fallback to base64 Data URI:', fsError?.message)
      const base64 = buffer.toString('base64')
      return `data:${mimeType};base64,${base64}`
    }
  } catch (error: any) {
    console.error('File upload processing failed:', error)
    throw new Error(error?.message || 'Failed to process uploaded file.')
  }
}

/**
 * Best-effort cleanup function to delete an uploaded file if subsequent DB transaction fails
 */
export async function deleteUploadedFile(relativeUrl: string): Promise<void> {
  try {
    if (!relativeUrl || relativeUrl.startsWith('data:') || !relativeUrl.startsWith('/uploads/')) return
    const filename = path.basename(relativeUrl)
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename)
    await unlink(filepath).catch(() => null)
  } catch (err) {
    console.warn(`Failed to cleanup orphaned file ${relativeUrl}:`, err)
  }
}
