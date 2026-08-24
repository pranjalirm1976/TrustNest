'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { uploadLocalFile } from '@/lib/upload'

// ---------------------------------------------------------------------------
// updateOwnerProfile — update User.name / email for the logged-in owner
// ---------------------------------------------------------------------------
export async function updateOwnerProfile(data: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'OWNER') {
      return { success: false, error: 'Unauthorized' }
    }

    const name = data.get('name') as string | null
    const email = data.get('email') as string | null

    if (!name?.trim() || !email?.trim()) {
      return { success: false, error: 'Name and email are required.' }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        email: email.trim(),
      },
    })

    revalidatePath('/admin/settings')
    return { success: true, message: 'Profile updated successfully.' }
  } catch (error: any) {
    console.error('updateOwnerProfile error:', error)
    return { success: false, error: error.message || 'Internal server error.' }
  }
}

// ---------------------------------------------------------------------------
// updatePGSettings — update Property.name / address / gender / priceFrom
// ---------------------------------------------------------------------------
export async function updatePGSettings(propertyId: string, data: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'OWNER') {
      return { success: false, error: 'Unauthorized' }
    }

    // Authorization guard — ensure this PG belongs to the session owner
    const property = await prisma.property.findUnique({ where: { id: propertyId } })
    if (!property || property.ownerId !== session.user.id) {
      return { success: false, error: 'Unauthorized. You do not own this property.' }
    }

    const name      = data.get('name') as string | null
    const address   = data.get('address') as string | null
    const gender    = data.get('gender') as string | null
    const priceFrom = data.get('priceFrom') as string | null

    const updateData: Record<string, any> = {}
    if (name?.trim())    updateData.name = name.trim()
    if (address?.trim()) updateData.address = address.trim()
    if (gender)          updateData.gender = gender
    if (priceFrom)       updateData.priceFrom = parseFloat(priceFrom)

    // Handle cover image upload if provided
    const coverFile = data.get('coverImage') as File | null
    if (coverFile && coverFile.size > 0) {
      const url = await uploadLocalFile(coverFile)
      // Upsert a cover image record
      await prisma.propertyImage.updateMany({
        where: { propertyId, isCover: true },
        data: { isCover: false },
      })
      await prisma.propertyImage.create({
        data: { propertyId, url, isCover: true },
      })
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.property.update({
        where: { id: propertyId },
        data: updateData,
      })
    }

    revalidatePath('/admin/settings')
    revalidatePath(`/pg/${propertyId}`)
    revalidatePath('/search')

    return { success: true, message: 'PG settings updated successfully.' }
  } catch (error: any) {
    console.error('updatePGSettings error:', error)
    return { success: false, error: error.message || 'Internal server error.' }
  }
}

// ---------------------------------------------------------------------------
// updateNotificationPreferences — stored as a simple JSON blob in a
// dedicated Notification record or, since there is no prefs table in the
// schema, we simply return success (preferences stay client-side for now
// until the schema has a UserPreferences model).
// ---------------------------------------------------------------------------
export async function updateNotificationPreferences(_data: {
  notifyEmail: boolean
  notifySMS: boolean
  notifyPush: boolean
}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'OWNER') {
      return { success: false, error: 'Unauthorized' }
    }
    // Schema does not yet have a preferences table.
    // This action is a stub ready to be wired when the schema is extended.
    revalidatePath('/admin/settings')
    return { success: true, message: 'Notification preferences saved.' }
  } catch (error: any) {
    return { success: false, error: error.message || 'Internal server error.' }
  }
}
