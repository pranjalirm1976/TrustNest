'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { getInventoryAgreement, acceptInventoryAgreement } from '@/actions/inventory.actions'

interface Agreement {
  id: string
  propertyId: string
  trustNestBedCount: number
  status: string
  agreementStartDate: string
  agreementEndDate?: string
  acceptedAt?: string
  agreementText: string
}

interface AvailableBed {
  id: string
  identifier: string
  roomNumber: string
  isTrustNestInventory: boolean
  status: string
}

export default function InventoryAgreementPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const propertyId = searchParams.get('propertyId') || ''

  const [agreement, setAgreement] = useState<Agreement | null>(null)
  const [bedCount, setBedCount] = useState(0)
  const [availableBeds, setAvailableBeds] = useState<AvailableBed[]>([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!propertyId) {
      setError('Property ID is required')
      return
    }

    const loadAgreement = async () => {
      try {
        const result = await getInventoryAgreement(propertyId)
        setAgreement(result.agreement)
        setBedCount(result.bedCount)
        setAvailableBeds(result.availableBeds)
      } catch (err) {
        setError('Failed to load agreement')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user.role === 'OWNER') {
      loadAgreement()
    }
  }, [propertyId, session])

  const handleAccept = async () => {
    if (!propertyId) return

    setAccepting(true)
    setError('')
    setSuccess('')

    try {
      const result = await acceptInventoryAgreement(propertyId)

      if (result.success) {
        setSuccess(result.message)
        setTimeout(() => {
          router.push(`/owner/properties/${propertyId}`)
        }, 2000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to accept agreement')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading agreement...</p>
        </div>
      </div>
    )
  }

  if (!agreement) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No agreement found for this property.</p>
            <button
              onClick={() => router.back()}
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const trustNestBeds = availableBeds.filter(b => b.isTrustNestInventory)
  const startDate = new Date(agreement.agreementStartDate).toLocaleDateString()
  const endDate = agreement.agreementEndDate 
    ? new Date(agreement.agreementEndDate).toLocaleDateString()
    : 'Ongoing'
  const isAccepted = agreement.acceptedAt !== undefined

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">TrustNest Inventory Allocation Agreement</h1>
            <p className="text-indigo-100">Agreement Period: {startDate} to {endDate}</p>
          </div>

          {/* Status Banner */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-6">
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {isAccepted && (
            <div className="bg-green-50 border-l-4 border-green-500 p-6">
              <p className="text-green-800 font-semibold">✓ Agreement Accepted</p>
              <p className="text-green-700 text-sm mt-1">
                Accepted on {new Date(agreement.acceptedAt!).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="p-8">
            {/* Agreement Summary */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">TrustNest Managed Beds</p>
                <p className="text-3xl font-bold text-indigo-600">{agreement.trustNestBedCount}</p>
                <p className="text-xs text-gray-500 mt-1">out of {bedCount} total beds</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Commission Structure</p>
                <p className="text-lg font-bold text-blue-600">90% Owner / 10% TrustNest</p>
                <p className="text-xs text-gray-500 mt-1">per successful booking</p>
              </div>
            </div>

            {/* TrustNest Managed Beds */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">TrustNest Managed Beds</h2>
              {trustNestBeds.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No beds allocated to TrustNest yet.</p>
              ) : (
                <div className="space-y-2">
                  {trustNestBeds.map(bed => (
                    <div key={bed.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-gray-900">
                          Room {bed.roomNumber}, Bed {bed.identifier}
                        </p>
                        <p className="text-xs text-gray-600">Status: {bed.status}</p>
                      </div>
                      <span className="text-green-600 font-semibold">✓ TrustNest Inventory</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Owner-Managed Beds */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Owner-Managed Beds</h2>
              {availableBeds.filter(b => !b.isTrustNestInventory).length === 0 ? (
                <p className="text-gray-600 text-center py-4">All beds are managed by TrustNest.</p>
              ) : (
                <div className="space-y-2">
                  {availableBeds.filter(b => !b.isTrustNestInventory).map(bed => (
                    <div key={bed.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">
                          Room {bed.roomNumber}, Bed {bed.identifier}
                        </p>
                        <p className="text-xs text-gray-600">Status: {bed.status}</p>
                      </div>
                      <span className="text-gray-600 font-semibold">Owner Managed</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Agreement Terms</h2>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 whitespace-pre-wrap text-sm text-gray-700 max-h-96 overflow-y-auto">
                {agreement.agreementText}
              </div>
            </div>

            {/* Action Buttons */}
            {!isAccepted && (
              <div className="flex gap-4">
                <button
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  ← Decline
                </button>

                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {accepting ? 'Accepting...' : '✓ Accept Agreement'}
                </button>
              </div>
            )}

            {isAccepted && (
              <button
                onClick={() => router.push(`/owner/properties/${propertyId}`)}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                View Property Details
              </button>
            )}

            {/* Info Box */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> By accepting this agreement, you authorize TrustNest to list and manage the selected beds on our platform.
                Your beds will become available for bookings immediately after acceptance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
