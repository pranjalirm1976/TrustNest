'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export type NotificationType = 'PAYMENT' | 'COMPLAINT' | 'FOOD' | 'SYSTEM' | 'GENERAL'

/**
 * Creates a new notification for a specific user.
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = 'GENERAL'
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        isRead: false,
      },
    })
    return { success: true, notification }
  } catch (error: any) {
    console.error('createNotification error:', error)
    return { success: false, error: error.message || 'Failed to create notification' }
  }
}

/**
 * Retrieves unread notifications for the currently logged-in user.
 */
export async function getUnreadNotifications() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return { success: false, notifications: [] }
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    return { success: true, notifications }
  } catch (error: any) {
    console.error('getUnreadNotifications error:', error)
    return { success: false, notifications: [] }
  }
}

/**
 * Retrieves all recent notifications for the currently logged-in user.
 */
export async function getAllNotifications() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return { success: false, notifications: [] }
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 30,
    })

    const unreadCount = notifications.filter(n => !n.isRead).length

    return { success: true, notifications, unreadCount }
  } catch (error: any) {
    console.error('getAllNotifications error:', error)
    return { success: false, notifications: [], unreadCount: 0 }
  }
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
      data: {
        isRead: true,
      },
    })

    return { success: true }
  } catch (error: any) {
    console.error('markNotificationAsRead error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Marks all unread notifications as read for the currently logged-in user.
 */
export async function markAllNotificationsAsRead() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    return { success: true }
  } catch (error: any) {
    console.error('markAllNotificationsAsRead error:', error)
    return { success: false, error: error.message }
  }
}
