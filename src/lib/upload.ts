import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

/**
 * Utility to save an uploaded File object locally to /public/uploads/
 * Returns the relative URL path for serving to clients.
 */
export async function uploadLocalFile(file: File): Promise<string> {
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure the uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename preserving original extension
    const ext = path.extname(file.name) || '.jpg'
    const fileName = `${crypto.randomUUID()}${ext}`
    const filepath = path.join(uploadDir, fileName)

    // Save the file
    await writeFile(filepath, buffer)

    // Return the relative URL
    return `/uploads/${fileName}`
  } catch (error) {
    console.error('File upload failed:', error)
    throw new Error('Failed to upload file.')
  }
}
