import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { redirect } from 'next/navigation'
import { Role } from './types'

/**
 * Get the current session on the server side
 */
export async function getCurrentSession() {
  return await getServerSession(authOptions)
}

/**
 * Require authentication for a page/component
 */
export async function requireAuth(redirectTo: string = '/admin/login') {
  const session = await getCurrentSession()
  
  if (!session) {
    redirect(redirectTo)
  }
  
  return session
}

/**
 * Require specific roles for access
 */
export async function requireRole(allowedRoles: Role[], redirectTo: string = '/unauthorized') {
  const session = await requireAuth()
  
  if (!allowedRoles.includes(session.user.role)) {
    redirect(redirectTo)
  }
  
  return session
}

/**
 * Check if user has admin privileges (OWNER or INSPECTOR)
 */
export async function requireAdmin() {
  return await requireRole(['OWNER', 'INSPECTOR'])
}

/**
 * Check if user is a property owner
 */
export async function requireOwner() {
  return await requireRole(['OWNER'])
}

/**
 * Check if user is an inspector
 */
export async function requireInspector() {
  return await requireRole(['INSPECTOR'])
}