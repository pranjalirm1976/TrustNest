'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

/**
 * Get or create an in-app chat thread between User and PG Owner
 */
export async function getOrCreateChatThread(input: {
  propertyId: string
  ownerId?: string
}) {
  try {
    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (_) {}

    if (!session?.user?.id) {
      return { success: false, error: 'Please sign in to start a private chat with the owner.' }
    }

    const property = await prisma.property.findUnique({
      where: { id: input.propertyId },
      select: { id: true, name: true, ownerId: true }
    })

    if (!property) {
      return { success: false, error: 'Property not found.' }
    }

    const ownerId = input.ownerId || property.ownerId

    // Find existing thread
    let thread = await prisma.chatThread.findUnique({
      where: {
        userId_ownerId_propertyId: {
          userId: session.user.id,
          ownerId,
          propertyId: property.id
        }
      },
      include: {
        messages: {
          include: {
            sender: { select: { id: true, name: true, role: true } }
          },
          orderBy: { createdAt: 'asc' }
        },
        user: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, name: true, address: true } }
      }
    })

    if (!thread) {
      thread = await prisma.chatThread.create({
        data: {
          userId: session.user.id,
          ownerId,
          propertyId: property.id,
          messages: {
            create: {
              senderId: session.user.id,
              content: `Hello, I'm inquiring about ${property.name}. Is there any availability update?`
            }
          }
        },
        include: {
          messages: {
            include: {
              sender: { select: { id: true, name: true, role: true } }
            },
            orderBy: { createdAt: 'asc' }
          },
          user: { select: { id: true, name: true, email: true } },
          owner: { select: { id: true, name: true, email: true } },
          property: { select: { id: true, name: true, address: true } }
        }
      })
    }

    return { success: true, thread }
  } catch (error: any) {
    console.error('getOrCreateChatThread error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send a message inside a thread
 */
export async function sendChatMessage(input: {
  threadId: string
  content: string
}) {
  try {
    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (_) {}

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized.' }
    }

    if (!input.content || !input.content.trim()) {
      return { success: false, error: 'Message content cannot be empty.' }
    }

    const thread = await prisma.chatThread.findUnique({
      where: { id: input.threadId }
    })

    if (!thread) {
      return { success: false, error: 'Chat thread not found.' }
    }

    const isParticipant = thread.userId === session.user.id || thread.ownerId === session.user.id || session.user.role === 'SUPER_ADMIN'
    if (!isParticipant) {
      return { success: false, error: 'Access denied. You are not a participant in this conversation.' }
    }

    const message = await prisma.chatMessage.create({
      data: {
        threadId: input.threadId,
        senderId: session.user.id,
        content: input.content.trim()
      },
      include: {
        sender: { select: { id: true, name: true, role: true } }
      }
    })

    await prisma.chatThread.update({
      where: { id: input.threadId },
      data: { updatedAt: new Date() }
    })

    try {
      revalidatePath('/tenant/chat')
      revalidatePath('/admin/chat')
      revalidatePath('/super-admin')
    } catch (_) {}

    return { success: true, message }
  } catch (error: any) {
    console.error('sendChatMessage error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all threads for the current user (Resident or Owner)
 */
export async function getMyChatThreads() {
  try {
    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (_) {}

    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized.' }
    }

    const isOwner = session.user.role === 'OWNER'
    const where = isOwner ? { ownerId: session.user.id } : { userId: session.user.id }

    const threads = await prisma.chatThread.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, name: true, address: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return { success: true, threads }
  } catch (error: any) {
    console.error('getMyChatThreads error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Super Admin: Get all in-app chat threads for platform moderation
 */
export async function getAllChatThreadsForSuperAdmin() {
  try {
    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (_) {}

    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'INSPECTOR')) {
      return { success: false, error: 'Unauthorized. Super Admin access required.' }
    }

    const threads = await prisma.chatThread.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, name: true, address: true } },
        messages: {
          include: {
            sender: { select: { id: true, name: true, role: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 50
    })

    return { success: true, threads }
  } catch (error: any) {
    console.error('getAllChatThreadsForSuperAdmin error:', error)
    return { success: false, error: error.message }
  }
}
