import { Metadata } from 'next'
import PGManagementClient from '@/components/admin/PGManagementClient'

export const metadata: Metadata = {
  title: 'PG Overview | TrustNest',
  description: 'Manage specific PG property details on TrustNest',
}

export default async function PGManagementPage({ params }: { params: { id: string } }) {
  // Await the params before using them as per Next.js 15+ conventions if applicable, 
  // but standard app router allows params.id usage.
  const propertyId = params.id
  
  return <PGManagementClient propertyId={propertyId} />
}
