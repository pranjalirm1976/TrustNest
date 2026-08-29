'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function registerResident(data: {
  name: string
  email: string
  password: string
  phone?: string
}) {
  try {
    const email = data.email.toLowerCase().trim()
    
    if (!email || !data.password || !data.name) {
      return { success: false, error: 'Name, email, and password are required.' }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { success: false, error: 'An account with this email address already exists. Please log in.' }
    }

    const passwordHash = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email,
        passwordHash,
        role: 'TENANT'
      }
    })

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  } catch (error: any) {
    console.error('registerResident error:', error)
    return { success: false, error: error.message || 'Registration failed.' }
  }
}
