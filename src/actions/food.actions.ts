'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadLocalFile } from '@/lib/upload'
import { revalidatePath } from 'next/cache'

export async function publishDailyMenu(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'OWNER') {
      return { success: false, error: 'Unauthorized. Must be an owner.' }
    }

    // Get the owner's property
    const property = await prisma.property.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!property) {
      return { success: false, error: 'No property found for this owner.' }
    }

    const mealType = formData.get('mealType') as string
    const itemsText = formData.get('items') as string
    const imageFile = formData.get('image') as File | null

    if (!mealType || !['BREAKFAST', 'LUNCH', 'DINNER'].includes(mealType.toUpperCase())) {
      return { success: false, error: 'Invalid meal type.' }
    }

    // Determine 'today' relative to local time (simple approach)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Handle Image Upload
    let imageUrl = null
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadLocalFile(imageFile)
    }

    // Upsert the Food Menu
    const foodMenu = await prisma.foodMenu.upsert({
      where: {
        propertyId_date_mealType: {
          propertyId: property.id,
          date: today,
          mealType: mealType.toUpperCase(),
        }
      },
      update: {}, // Just getting the ID if it exists, or we could update other fields if they existed
      create: {
        propertyId: property.id,
        date: today,
        mealType: mealType.toUpperCase(),
        isVeg: true // Assuming true for now
      }
    })

    // Update items
    // First clear existing items for today's menu
    await prisma.foodMenuItem.deleteMany({
      where: { foodMenuId: foodMenu.id }
    })

    if (itemsText && itemsText.trim() !== '') {
      const itemsList = itemsText.split(',').map(i => i.trim()).filter(i => i.length > 0)
      if (itemsList.length > 0) {
        await prisma.foodMenuItem.createMany({
          data: itemsList.map(name => ({
            foodMenuId: foodMenu.id,
            name
          }))
        })
      }
    }

    // Add image if uploaded
    if (imageUrl) {
      // Clear existing images if we only want one per meal
      await prisma.foodImage.deleteMany({
        where: { foodMenuId: foodMenu.id }
      })

      await prisma.foodImage.create({
        data: {
          foodMenuId: foodMenu.id,
          url: imageUrl
        }
      })
    }

    revalidatePath(`/pg/${property.id}`)
    revalidatePath('/food')
    revalidatePath('/admin/food')
    revalidatePath('/tenant/food')
    
    return { success: true, message: 'Menu published successfully.' }
  } catch (error: any) {
    console.error('publishDailyMenu error:', error)
    return { success: false, error: error.message || 'Internal server error.' }
  }
}
