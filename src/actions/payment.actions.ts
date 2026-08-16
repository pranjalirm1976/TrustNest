'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function processRentPayment(paymentId: string) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'TENANT') {
    throw new Error('Unauthorized. Resident authorization required.')
  }

  // Generate random 12-char mock Transaction ID
  const txnId = 'TXN_' + Math.random().toString(36).substring(2, 14).toUpperCase()

  const updatedPayment = await prisma.rentPayment.update({
    where: { id: paymentId },
    data: {
      status: 'PAID',
      paidDate: new Date(),
      transactionId: txnId,
    },
  })

  revalidatePath('/tenant/payments')
  revalidatePath('/tenant/dashboard')
  return updatedPayment
}
