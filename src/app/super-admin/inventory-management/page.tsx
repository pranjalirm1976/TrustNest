'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { createInventoryAgreement } from '@/actions/inventory.actions'

interface BedSelection {
  id: string
  roomNumber: string
  identifier: string
  selected: boolean
}

export default function InventoryManagementPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [propertyId, setPropertyId] = useState('')
  const [bedCount, setBedCount] = useState('0')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedBeds, setSelectedBeds] = useState<BedSelection[]>([])
  const [customTerms, setCustomTerms] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [step, setStep] = useState<'property-select' | 'beds-select' | 'review'>('property-select')

  // Check admin access
  if (session?.user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-red-600 mb-4">Access denied. Admin only.</p>
          <button
            onClick={() => router.push('/')}
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            ← Go Home
          </button>
        </div>
      </div>
    )
  }

  const handleCreateAgreement = async () => {
    if (!propertyId || !startDate || selectedBeds.filter(b => b.selected).length === 0) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const selectedBedIds = selectedBeds.filter(b => b.selected).map(b => b.id)

      const result = await createInventoryAgreement({
        propertyId,
        trustNestBedCount: selectedBedIds.length,
        selectedBedIds,
        agreementStartDate: startDate,
        agreementEndDate: endDate || undefined,
        agreementText: customTerms || undefined
      })

      if (result.success) {
        setSuccess('Inventory agreement created successfully!')
        setTimeout(() => {
          router.push('/super-admin/inventory-management')
        }, 2000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to create agreement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Create and manage TrustNest inventory agreements</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          {/* Step Indicator */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-8">
              <div className={`flex items-center gap-2 ${step === 'property-select' ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step !== 'property-select' ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white'}`}>
                  {step !== 'property-select' ? '✓' : '1'}
                </div>
                <span className="font-medium">Select Property</span>
              </div>

              <div className={`flex items-center gap-2 ${step === 'beds-select' ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-green-500 text-white' : 'bg-gray-300 text-white'}`}>
                  {step === 'review' ? '✓' : '2'}
                </div>
                <span className="font-medium">Select Beds</span>
              </div>

              <div className={`flex items-center gap-2 ${step === 'review' ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-300 text-white">3</div>
                <span className="font-medium">Review</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {step === 'property-select' && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="propertyId" className="block text-sm font-medium text-gray-700 mb-2">
                    Property ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="propertyId"
                    type="text"
                    value={propertyId}
                    onChange={(e) => setPropertyId(e.target.value)}
                    placeholder="Enter property ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Copy the property ID from the properties list</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (Optional)
                    </label>
                    <input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty for ongoing agreement</p>
                  </div>
                </div>

                <button
                  onClick={() => setStep('beds-select')}
                  disabled={!propertyId || !startDate}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  Continue to Bed Selection →
                </button>
              </div>
            )}

            {step === 'beds-select' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Select Beds for TrustNest Management</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose which beds will be managed by TrustNest on this property
                  </p>

                  {/* Dummy Bed List - In production, this would come from API */}
                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-gray-600 font-medium mb-3">📌 Note: Bed list would load from selected property</p>
                    <p className="text-sm text-gray-500">
                      In production: First select a property to see its available beds listed below
                    </p>
                  </div>

                  <input
                    type="number"
                    value={bedCount}
                    onChange={(e) => setBedCount(e.target.value)}
                    placeholder="Enter number of beds to allocate"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep('property-select')}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    ← Back
                  </button>

                  <button
                    onClick={() => setStep('review')}
                    disabled={!bedCount || parseInt(bedCount) === 0}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  >
                    Continue to Review →
                  </button>
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900">Review Agreement Details</h2>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Property ID</p>
                    <p className="font-semibold text-gray-900">{propertyId}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Agreement Period</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(startDate).toLocaleDateString()} 
                      {endDate && ` to ${new Date(endDate).toLocaleDateString()}`}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Beds Allocated to TrustNest</p>
                    <p className="font-semibold text-gray-900">{bedCount}</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="customTerms" className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Terms (Optional)
                  </label>
                  <textarea
                    id="customTerms"
                    value={customTerms}
                    onChange={(e) => setCustomTerms(e.target.value)}
                    placeholder="Add any custom terms to the agreement..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep('beds-select')}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    ← Back
                  </button>

                  <button
                    onClick={handleCreateAgreement}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  >
                    {loading ? 'Creating...' : '✓ Create Agreement'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ About Inventory Agreements</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Define which beds on a property are managed by TrustNest</li>
            <li>• Set agreement duration and terms</li>
            <li>• Owner must accept the agreement for beds to become bookable</li>
            <li>• Commission split: 90% Owner, 10% TrustNest</li>
            <li>• Can be cancelled with 30 days notice</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
