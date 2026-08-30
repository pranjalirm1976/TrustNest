import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

/**
 * Validates file size and MIME type before saving
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file || file.size === 0) {
    return { valid: false, error: 'File is empty.' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File ${file.name} exceeds the maximum allowed size of 5MB.` }
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: `File ${file.name} has unsupported format (${file.type}). Allowed: JPG, PNG, WEBP, AVIF.` }
  }

  return { valid: true }
}

/**
 * Utility to save an uploaded File object locally to /public/uploads/
 * Returns the relative URL path for serving to clients.
 */
export async function uploadLocalFile(file: File): Promise<string> {
  try {
    const validation = validateImageFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const ext = path.extname(file.name).toLowerCase() || '.jpg'
    const fileName = `${crypto.randomUUID()}${ext}`
    const filepath = path.join(uploadDir, fileName)

    await writeFile(filepath, buffer)
    return `/uploads/${fileName}`
  } catch (error: any) {
    console.error('File upload failed:', error)
    throw new Error(error?.message || 'Failed to upload file.')
  }
}

/**
 * Best-effort cleanup function to delete an uploaded file if subsequent DB transaction fails
 */
export async function deleteUploadedFile(relativeUrl: string): Promise<void> {
  try {
    if (!relativeUrl || !relativeUrl.startsWith('/uploads/')) return
    const filename = path.basename(relativeUrl)
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename)
    await unlink(filepath).catch(() => null)
  } catch (err) {
    console.warn(`Failed to cleanup orphaned file ${relativeUrl}:`, err)
  }
}
